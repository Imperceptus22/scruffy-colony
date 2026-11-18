package de.itsolutionskissing.trimpsmobile

import android.util.AtomicFile
import java.io.File
import java.io.FileNotFoundException
import java.security.KeyFactory
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import java.util.Base64
import java.util.UUID
import org.json.JSONObject

internal object PrivateAutomationCode {
    private const val PUBLIC_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAECJtyOfw+mJGEgfXOe3kfkiGCGLUdexBDIgtIAxkTkr94VpTzfVeYiUWhJZNe4TRhL5nSiA/4QZUM3ov+8ZjjkA=="
    private val token = Regex("[A-Za-z0-9_-]{80,100}")

    fun isValid(installation: String, code: String, key: String = PUBLIC_KEY): Boolean {
        if (code.length !in 80..100 || !token.matches(code)) return false
        return runCatching {
            val publicKey = KeyFactory.getInstance("EC")
                .generatePublic(X509EncodedKeySpec(Base64.getDecoder().decode(key)))
            Signature.getInstance("SHA256withECDSA").run {
                initVerify(publicKey)
                update("scruffy-colony/private-automation/v1:$installation".toByteArray(Charsets.UTF_8))
                verify(Base64.getUrlDecoder().decode(code))
            }
        }.getOrDefault(false)
    }
}

// Excluded from device transfer, but preserved across in-place app updates.
internal class PrivateAutomation(directory: File) {
    private val file = AtomicFile(File(directory, "private-automation.json"))

    private fun read(): JSONObject? = try {
        file.openRead().use { JSONObject(readBoundedUtf8(it, 512)) }
    } catch (_: FileNotFoundException) {
        if (file.baseFile.exists()) error("Activation file unreadable")
        null
    }

    private fun write(state: JSONObject) {
        val stream = file.startWrite()
        try {
            stream.write(state.toString().toByteArray(Charsets.UTF_8))
            file.finishWrite(stream)
        } catch (error: Exception) {
            file.failWrite(stream)
            throw error
        }
        check(read()?.toString() == state.toString())
    }

    private fun enabled(state: JSONObject) =
        PrivateAutomationCode.isValid(state.getString("installation"), state.optString("code"))

    fun enabled() = runCatching { read()?.let(::enabled) ?: false }.getOrDefault(false)

    // Native callers serialize reads and writes on SaveOperationQueue.
    fun manage(payload: String): JSONObject {
        val state = read() ?: JSONObject().put("installation", UUID.randomUUID().toString()).also(::write)
        val id = state.getString("installation")
        val result = JSONObject().put("installation", id)
        if (payload.isNotEmpty()) {
            val code = payload.trim()
            val valid = PrivateAutomationCode.isValid(id, code)
            if (valid) write(state.put("code", code))
            result.put("accepted", valid)
        }
        return result.put("enabled", enabled(state))
    }
}
