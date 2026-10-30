package de.itsolutionskissing.trimpsmobile

import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import android.widget.Toast
import java.util.concurrent.Executors
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.nio.ByteBuffer
import java.nio.charset.CodingErrorAction
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

const val MAX_SAVE_BYTES = 2 * 1024 * 1024

internal fun saveExportFilename(now: LocalDateTime = LocalDateTime.now()): String =
    "scruffy-colony-save-${now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm"))}.txt"

fun readBoundedUtf8(input: InputStream, limit: Int): String {
    val out = ByteArrayOutputStream()
    val buffer = ByteArray(8192)
    while (true) {
        val count = input.read(buffer)
        if (count < 0) break
        require(out.size() + count <= limit) { "File too large" }
        out.write(buffer, 0, count)
    }
    return Charsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT)
        .onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(out.toByteArray())).toString()
}

data class PendingDocument(val importing: Boolean, val snapshot: String? = null)
class SaveDocumentState : ViewModel() { var pending: PendingDocument? = null }

class SaveDocuments(private val activity: ComponentActivity) {
    companion object { private val io = Executors.newSingleThreadExecutor() }
    private val state = ViewModelProvider(activity)[SaveDocumentState::class.java]
    private var importing: ((Result<String?>) -> Unit)? = null
    private var exporting: ((Result<Boolean>) -> Unit)? = null
    private fun notify(message: Int) { Toast.makeText(activity.applicationContext, message, Toast.LENGTH_LONG).show() }
    private val opener = activity.registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        val callback = importing
        importing = null
        state.pending = null
        // An import belongs to the current JS transaction. A recreated view must ask again.
        if (callback == null) { notify(R.string.document_interrupted); return@registerForActivityResult }
        io.execute {
            val result = runCatching<String?> {
                if (uri == null) null else activity.applicationContext.contentResolver.openInputStream(uri)?.use { readBoundedUtf8(it, MAX_SAVE_BYTES) }
                    ?: error("Document unreadable")
            }
            activity.runOnUiThread {
                if (activity.isDestroyed || activity.isFinishing) notify(R.string.document_interrupted) else callback(result)
            }
        }
    }
    private val creator = activity.registerForActivityResult(ActivityResultContracts.CreateDocument("text/plain")) { uri ->
        val callback = exporting
        exporting = null
        val text = state.pending?.takeUnless { it.importing }?.snapshot
        state.pending = null
        // Android ended the app while the picker was open: the picker already created the file, but the text is gone.
        val lost = uri != null && text == null
        io.execute {
            // Only a file that is known to be empty is removed; an older export picked for overwriting stays untouched.
            val removed = lost && runCatching {
                val resolver = activity.applicationContext.contentResolver
                val size = resolver.query(uri!!, arrayOf(OpenableColumns.SIZE), null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst() && !cursor.isNull(0)) cursor.getLong(0) else null
                }
                size == 0L && DocumentsContract.deleteDocument(resolver, uri)
            }.getOrDefault(false)
            val result = runCatching {
                if (uri == null) false else {
                    check(text != null) { "Export interrupted" }
                    activity.applicationContext.contentResolver.openOutputStream(uri, "wt")?.use { it.write(text.toByteArray(Charsets.UTF_8)); it.flush() }
                        ?: error("Document unwritable")
                    true
                }
            }
            activity.runOnUiThread {
                if (callback != null && !activity.isDestroyed && !activity.isFinishing) callback(result)
                else notify(if (result.getOrNull() == true) R.string.export_saved else if (removed) R.string.export_lost else R.string.document_interrupted)
            }
        }
    }

    fun importFile(callback: (Result<String?>) -> Unit) {
        check(state.pending == null) { "Document dialog pending" }
        state.pending = PendingDocument(importing = true)
        importing = callback
        try { opener.launch(arrayOf("text/plain", "application/octet-stream")) }
        catch (error: Exception) { state.pending = null; importing = null; throw error }
    }

    fun exportFile(text: String, callback: (Result<Boolean>) -> Unit) {
        check(state.pending == null) { "Document dialog pending" }
        require(text.toByteArray(Charsets.UTF_8).size <= MAX_SAVE_BYTES)
        state.pending = PendingDocument(importing = false, snapshot = text)
        exporting = callback
        try { creator.launch(saveExportFilename()) }
        catch (error: Exception) { state.pending = null; exporting = null; throw error }
    }
}
