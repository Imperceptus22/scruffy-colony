package de.itsolutionskissing.trimpsmobile

import androidx.core.util.AtomicFile
import org.json.JSONObject
import java.io.File

data class CheckpointState(val lastGood: String?, val rollback: String?, val deleted: Boolean = false,
                           val purchases: Map<String, String> = emptyMap())

class CheckpointStore(directory: File) {
    companion object {
        private val storageLock = Any()
        private val stores = mutableMapOf<File, CheckpointStore>()
        fun forDirectory(directory: File): CheckpointStore = synchronized(storageLock) {
            stores.getOrPut(directory.canonicalFile) { CheckpointStore(directory) }
        }
    }
    private val file = AtomicFile(File(directory, "checkpoint.json"))

    fun read(): CheckpointState = synchronized(storageLock) {
        if (!file.baseFile.exists() && !File(file.baseFile.path + ".bak").exists()) return@synchronized CheckpointState(null, null)
        val text = file.openRead().use { readBoundedUtf8(it, 5 * 1024 * 1024) }
        val json = JSONObject(text)
        require(json.getInt("schema") == 1) { "Unsupported checkpoint" }
        fun field(name: String): String? {
            require(json.has(name)) { "Missing checkpoint field" }
            val value = json.get(name)
            require(value === JSONObject.NULL || value is String) { "Invalid checkpoint field" }
            return if (value === JSONObject.NULL) null else value as String
        }
        val deleted = if (json.has("deleted")) json.get("deleted").also { require(it is Boolean) } as Boolean else false
        val purchases = linkedMapOf<String, String>()
        if (json.has("purchases")) {
            val entries = json.getJSONObject("purchases")
            for (token in entries.keys()) {
                require(token.length in 1..4096)
                val bonusProduct = entries.get(token)
                require(bonusProduct is String && (bonusProduct.isEmpty() || bonusProduct in BonePacks.bones))
                purchases[token] = bonusProduct as String
            }
        }
        CheckpointState(field("lastGood"), field("rollback"), deleted, purchases).also {
            require(!deleted || (it.lastGood == null && it.rollback == null))
        }
    }

    fun checkpoint(compressed: String) = synchronized(storageLock) {
        val state = read()
        check(state.rollback == null) { "Import pending" }
        write(state.copy(lastGood = compressed, rollback = null, deleted = false))
    }

    fun beginImport(previous: String) = synchronized(storageLock) {
        val state = read()
        check(state.rollback == null) { "Import pending" }
        write(state.copy(lastGood = previous, rollback = previous, deleted = false))
    }

    fun commit(compressed: String, purchase: Pair<String, String>? = null) = synchronized(storageLock) {
        val state = read()
        check(state.rollback != null) { "No import pending" }
        if (purchase != null) {
            require(purchase.first.length in 1..4096)
            require(purchase.second.isEmpty() || purchase.second in BonePacks.bones)
            check(purchase.first !in state.purchases) { "Purchase already credited" }
        }
        write(state.copy(lastGood = compressed, rollback = null, deleted = false,
            purchases = if (purchase == null) state.purchases else state.purchases + purchase))
    }

    fun restoreRollback(): String? = synchronized(storageLock) {
        val state = read()
        state.rollback?.let { write(state.copy(lastGood = it, rollback = null)) }
        state.rollback
    }

    /** The durable marker prevents a stale browser copy from reviving a deleted save after process death. */
    fun clear() = synchronized(storageLock) {
        // Explicit deletion is also the recovery path for an unreadable slot; intact purchase receipts remain.
        val state = try { read() } catch (_: org.json.JSONException) { CheckpointState(null, null) }
            catch (_: IllegalArgumentException) { CheckpointState(null, null) }
        write(state.copy(lastGood = null, rollback = null, deleted = true))
    }

    private fun write(state: CheckpointState) {
        require((state.lastGood?.toByteArray(Charsets.UTF_8)?.size ?: 0) <= 2 * 1024 * 1024)
        val bytes = JSONObject().put("schema", 1)
            .put("lastGood", state.lastGood ?: JSONObject.NULL)
            .put("rollback", state.rollback ?: JSONObject.NULL)
            .put("deleted", state.deleted).put("purchases", JSONObject(state.purchases)).toString().toByteArray(Charsets.UTF_8)
        require(bytes.size <= 5 * 1024 * 1024)
        val stream = file.startWrite()
        try { stream.write(bytes); file.finishWrite(stream) }
        catch (error: Exception) { file.failWrite(stream); throw error }
    }
}
