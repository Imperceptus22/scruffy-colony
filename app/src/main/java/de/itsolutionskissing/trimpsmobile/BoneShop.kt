package de.itsolutionskissing.trimpsmobile

import android.app.Activity
import android.util.Log
import android.webkit.WebView
import androidx.webkit.JavaScriptReplyProxy
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import org.json.JSONArray
import org.json.JSONObject

/**
 * Bone packs through Google Play Billing (V-220). The page talks to it through "TrimpsShop":
 * hello (connect, prices, open purchases), buy, credited (bones are in the game and saved). Order per purchase: Play
 * reports it purchased → grant to the page → the page credits and saves → credited → ledger → consume. Prices always
 * come from Play; without Play (sideloaded preview, no account, offline) the page shows the shop as unavailable.
 */
class BoneShop(private val activity: Activity, private val webView: WebView, private val ledger: ShopLedger) : PurchasesUpdatedListener {
    private var client: BillingClient? = null
    private var reply: JavaScriptReplyProxy? = null
    private val details = mutableMapOf<String, ProductDetails>()
    private val flow = ShopFlow(ledger, ::send, { token -> consume(token) }, { token -> acknowledge(token) })
    private var closed = false
    private var connecting = false

    fun attach(): Boolean {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) return false
        WebViewCompat.addWebMessageListener(webView, "TrimpsShop", setOf(LocalUrlPolicy.ORIGIN)) { _, message, origin, mainFrame, proxy ->
            if (closed || !mainFrame || origin.toString() != LocalUrlPolicy.ORIGIN || message.type != WebMessageCompat.TYPE_STRING) return@addWebMessageListener
            val raw = message.data ?: return@addWebMessageListener
            if (raw.length > 4096) return@addWebMessageListener
            val request = try { JSONObject(raw) } catch (_: Exception) { return@addWebMessageListener }
            when (request.optString("type")) {
                "hello" -> { reply = proxy; if (recoverCredits()) { flow.newPage(); connect() } }
                "buy" -> buy(request.optString("product"))
                "credited" -> flow.credited(request.optString("token"))
            }
        }
        return true
    }

    /** Purchases completed while the app was in the background (pending payments, Play Store). */
    fun refresh() {
        if (closed || reply == null) return
        if (!recoverCredits()) return
        // Products again if none arrived (e.g. the first connection overlapped the library's own reconnection).
        if (client?.isReady == true) { if (details.isEmpty()) loadProducts(); queryPurchases() } else connect()
    }

    fun close() {
        closed = true
        reply = null
        client?.endConnection()
        client = null
    }

    private fun send(message: JSONObject) {
        webView.post { if (!closed) reply?.postMessage(message.toString()) }
    }

    private fun event(name: String) = JSONObject().put("event", name)

    private fun connect() {
        if (connecting) return
        val current = client ?: BillingClient.newBuilder(activity.applicationContext).setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection().build().also { client = it }
        if (current.isReady) { loadProducts(); queryPurchases(); return }
        connecting = true
        current.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                webView.post {
                    connecting = false
                    if (closed) return@post
                    if (result.responseCode == BillingClient.BillingResponseCode.OK) { loadProducts(); queryPurchases() }
                    else send(event("unavailable").put("code", result.responseCode))
                }
            }
            override fun onBillingServiceDisconnected() {}
        })
    }

    private fun loadProducts() {
        val products = BonePacks.all.keys.map {
            QueryProductDetailsParams.Product.newBuilder().setProductId(it).setProductType(BillingClient.ProductType.INAPP).build()
        }
        client?.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(products).build()) { result, found ->
            webView.post {
                if (closed) return@post
                if (result.responseCode != BillingClient.BillingResponseCode.OK) { send(event("unavailable").put("code", result.responseCode)); return@post }
                details.clear()
                val list = JSONArray()
                for (product in found.productDetailsList) {
                    val offer = product.oneTimePurchaseOfferDetails ?: continue
                    val bones = BonePacks.all[product.productId] ?: continue
                    details[product.productId] = product
                    list.put(JSONObject().put("id", product.productId).put("bones", bones).put("price", offer.formattedPrice)
                        // Amount and currency let the page show the real-money value of bone prices (CPC principles 2025).
                        .put("micros", offer.priceAmountMicros).put("currency", offer.priceCurrencyCode)
                        .put("oneTime", product.productId in BonePacks.oneTime).put("bonus", ledger.hasBonus(product.productId)))
                }
                send(event("products").put("products", list))
            }
        }
    }

    private fun queryPurchases() {
        client?.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build()) { result, purchases ->
            webView.post { if (!closed && result.responseCode == BillingClient.BillingResponseCode.OK) purchases.forEach(::handle) }
        }
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        webView.post {
            if (closed) return@post
            when (result.responseCode) {
                BillingClient.BillingResponseCode.OK -> purchases?.forEach(::handle)
                BillingClient.BillingResponseCode.USER_CANCELED -> send(event("canceled"))
                BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> { send(event("owned")); queryPurchases() }
                else -> send(event("error").put("code", result.responseCode))
            }
        }
    }

    private fun handle(purchase: Purchase) {
        if (!recoverCredits()) return
        flow.purchase(purchase.products, purchase.purchaseState == Purchase.PurchaseState.PURCHASED,
            purchase.purchaseState == Purchase.PurchaseState.PENDING, purchase.quantity, purchase.purchaseToken, purchase.isAcknowledged)
    }

    private fun recoverCredits(): Boolean = try {
        ledger.recoverCredits()
        true
    } catch (_: Exception) {
        send(event("unavailable"))
        false
    }

    private fun buy(product: String) {
        val current = client
        val detail = details[product]
        if (current == null || !current.isReady || detail == null) { send(event("error").put("code", BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE)); return }
        val params = BillingFlowParams.newBuilder().setProductDetailsParamsList(listOf(
            BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(detail).build()
        )).build()
        val result = current.launchBillingFlow(activity, params)
        if (result.responseCode != BillingClient.BillingResponseCode.OK) send(event("error").put("code", result.responseCode))
    }

    /** One-time packs stay owned; acknowledged within three days, otherwise Play refunds them. */
    private fun acknowledge(token: String) {
        client?.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(token).build()) { result ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK) return@acknowledgePurchase
            Log.w("TrimpsMobile", "Acknowledge failed: ${result.responseCode}")
            // Credited but not acknowledged reports again as "credited → acknowledge": ask Play again in a minute.
            webView.postDelayed({ if (!closed) queryPurchases() }, 60_000)
        }
    }

    private fun consume(token: String) {
        client?.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(token).build()) { result, _ ->
            if (result.responseCode != BillingClient.BillingResponseCode.OK) Log.w("TrimpsMobile", "Consume failed: ${result.responseCode}")
        }
    }
}
