package de.itsolutionskissing.trimpsmobile

import android.webkit.WebView
import androidx.webkit.JavaScriptReplyProxy
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

class SaveBridge(private val webView: WebView, private val slots: SlotStore, private val documents: SaveDocuments, private val isForeground: () -> Boolean = { true }) {
    private var closed = false
    @Volatile private var activeSession: String? = null

    fun attach(): Boolean {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) return false
        WebViewCompat.addWebMessageListener(webView, "TrimpsNative", setOf(LocalUrlPolicy.ORIGIN)) { _, message, origin, mainFrame, reply ->
            if (closed || !mainFrame || origin.toString() != LocalUrlPolicy.ORIGIN || message.type != WebMessageCompat.TYPE_STRING) return@addWebMessageListener
            val raw = message.data ?: return@addWebMessageListener
            if (raw.length > 3 * 1024 * 1024) return@addWebMessageListener
            val request = try { JSONObject(raw) } catch (_: Exception) { return@addWebMessageListener }
            val id = request.optInt("id", -1)
            if (id < 1) return@addWebMessageListener
            val type = request.optString("type")
            val payload = request.optString("payload", "")
            val session = request.optString("session")
            if (session.length !in 1..100) return@addWebMessageListener
            val requestedSlot = if (request.isNull("slot")) null else request.optString("slot")
            fun respond(result: Any?, ok: Boolean = true) {
                webView.post {
                    if (type == "restore" && result is JSONObject) result.put("foreground", isForeground())
                    if (!closed) reply.postMessage(JSONObject().put("id", id).put("session", session).put("ok", ok).put("result", result ?: JSONObject.NULL).toString())
                }
            }
            if (type == "importFile" || type == "exportFile") {
                try {
                    check(session == activeSession && requestedSlot != null && requestedSlot == slots.current)
                    if (type == "importFile") documents.importFile { it.fold({ value -> respond(value) }, { respond("DOCUMENT", false) }) }
                    else { requireSave(payload); documents.exportFile(payload) { it.fold({ value -> respond(value) }, { respond("DOCUMENT", false) }) } }
                } catch (_: Exception) { respond("DOCUMENT", false) }
                return@addWebMessageListener
            }
            SaveOperationQueue.submit {
                try {
                    if (type == "restore" && requestedSlot == null) {
                        // Renderer recovery may have constructed this store before the previous queue drained.
                        if (activeSession == null) slots.refreshSelection()
                        activeSession = session
                    }
                    check(session == activeSession)
                    fun boundStore(): CheckpointStore {
                        val id = requestedSlot ?: if (type == "restore") slots.current else null
                        check(id != null && id == slots.current)
                        return slots.store(id)
                    }
                    val result: Any? = when (type) {
                        "slotInfo" -> slots.info()
                        "slots" -> slots.list()
                        "readSlot" -> slots.store(payload).read().let { JSONObject().put("lastGood", it.lastGood ?: JSONObject.NULL).put("rollback", it.rollback ?: JSONObject.NULL).put("deleted", it.deleted) }
                        "purchaseRecorded" -> { boundStore(); require(payload.length in 1..4096); slots.purchaseRecorded(payload) }
                        "selectSlot" -> { check(requestedSlot == slots.current); slots.select(payload); true }
                        "deleteSlot" -> { check(requestedSlot == slots.current); slots.delete(payload); true }
                        "startDevelopment" -> { boundStore(); requireSave(payload); slots.startDevelopment(payload); true }
                        "checkpoint" -> { requireSave(payload); boundStore().checkpoint(payload); true }
                        "beginImport" -> { requireSave(payload); boundStore().beginImport(payload); true }
                        "commitImport" -> {
                            requireSave(payload)
                            val purchase = if (request.isNull("purchase")) null else request.getJSONObject("purchase").let {
                                val token = it.getString("token")
                                val product = it.getString("product")
                                val bonus = it.getBoolean("bonus")
                                require(token.length in 1..4096 && product in BonePacks.all && (!bonus || product in BonePacks.bones))
                                check(!slots.purchaseRecorded(token)) { "Purchase already credited" }
                                token to if (bonus) product else ""
                            }
                            boundStore().commit(payload, purchase); true
                        }
                        "rollback" -> boundStore().restoreRollback()
                        "restore" -> boundStore().read().let { JSONObject().put("lastGood", it.lastGood ?: JSONObject.NULL).put("rollback", it.rollback ?: JSONObject.NULL).put("deleted", it.deleted).put("slot", slots.current).put("developmentAllowed", slots.developmentAllowed).put("normal", runCatching { slots.normalSelection() }.getOrNull()).put("appVersion", BuildConfig.VERSION_NAME).put("appBuild", BuildConfig.VERSION_CODE) }
                        else -> error("Unsupported operation")
                    }
                    respond(result)
                } catch (_: Exception) { respond("STORAGE", false) }
            }
        }
        return true
    }

    private fun requireSave(value: String) {
        require(value.length in 1..MAX_SAVE_BYTES && value.matches(Regex("[A-Za-z0-9+/]+={0,3}"))) { "Invalid save payload" }
    }

    fun close() {
        closed = true
    }
}
