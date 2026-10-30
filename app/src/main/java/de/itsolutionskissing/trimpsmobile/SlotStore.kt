package de.itsolutionskissing.trimpsmobile

import androidx.core.util.AtomicFile
import org.json.JSONObject
import java.io.File

/** The legacy file is slot 1. Development never changes the persisted normal selection. */
class SlotStore(private val directory: File, val developmentAllowed: Boolean) {
    private val selection = AtomicFile(File(directory, "active-slot.json"))
    // First selection read happens on SaveOperationQueue, after any previous writer.
    @Volatile var current: String? = null
        private set

    fun normalSelection(): String {
        if (!selection.baseFile.exists() && !File(selection.baseFile.path + ".bak").exists()) return "1"
        val json = selection.openRead().use { JSONObject(readBoundedUtf8(it, 1024)) }
        require(json.getInt("schema") == 1)
        return json.getString("active").also { require(it in listOf("1", "2", "3")) }
    }

    fun refreshSelection() { current = runCatching { normalSelection() }.getOrNull() }

    fun store(id: String): CheckpointStore {
        require(id in listOf("1", "2", "3") || (id == "dev" && developmentAllowed))
        val root = if (id == "1") directory else File(directory, "slots/$id")
        check(root.isDirectory || root.mkdirs())
        return CheckpointStore.forDirectory(root)
    }

    fun select(id: String) {
        require(id in listOf("1", "2", "3"))
        store(id).read() // Do not change selection when the target checkpoint is unreadable.
        val bytes = JSONObject().put("schema", 1).put("active", id).toString().toByteArray(Charsets.UTF_8)
        val stream = selection.startWrite()
        try { stream.write(bytes); selection.finishWrite(stream) }
        catch (error: Exception) { selection.failWrite(stream); throw error }
        current = id
    }

    /** V-248: deletes one personal save; the selection stays, so a deleted active slot starts a new game on reload. */
    fun delete(id: String) {
        require(id in listOf("1", "2", "3"))
        store(id).clear()
    }

    fun purchaseRecorded(token: String): Boolean = (listOf("1", "2", "3") + if (developmentAllowed) listOf("dev") else emptyList())
        .any { token in store(it).read().purchases }

    fun startDevelopment(compressed: String) {
        require(developmentAllowed)
        store("dev").checkpoint(compressed)
        current = "dev"
    }

    fun info(): JSONObject = JSONObject().put("active", current ?: JSONObject.NULL)
            .put("normal", runCatching { normalSelection() }.getOrNull() ?: JSONObject.NULL)
            .put("developmentAllowed", developmentAllowed)

    fun list(): JSONObject {
        val result = info()
        val entries = org.json.JSONArray()
        for (id in listOf("1", "2", "3")) {
            val entry = JSONObject().put("id", id)
            try {
                val state = store(id).read()
                entry.put("save", state.rollback ?: state.lastGood ?: JSONObject.NULL)
                val root = if (id == "1") directory else File(directory, "slots/$id")
                entry.put("modified", File(root, "checkpoint.json").lastModified())
            } catch (_: Exception) { entry.put("error", true) }
            entries.put(entry)
        }
        return result.put("slots", entries)
    }
}
