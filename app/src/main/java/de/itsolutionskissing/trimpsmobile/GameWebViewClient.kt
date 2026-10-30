package de.itsolutionskissing.trimpsmobile

import android.content.Context
import android.content.Intent
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream

class GameWebViewClient(context: Context, private val onRendererGone: (Boolean) -> Unit, private val onExit: () -> Unit, private val onUnsavedExit: () -> Unit, private val onPageReady: () -> Unit) : WebViewClient() {
    private val context = context
    private val assets = WebViewAssetLoader.Builder()
        .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context)).build()

    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse {
        if (LocalUrlPolicy.isLocalGame(request.url.toString())) {
            assets.shouldInterceptRequest(request.url)?.let { return it }
        }
        return WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", emptyMap(), ByteArrayInputStream(byteArrayOf()))
    }

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        if (request.isForMainFrame && request.url.toString() == "trimps-exit://confirmed" && LocalUrlPolicy.isLocalGame(view.url.orEmpty())) {
            onExit()
            return true
        }
        if (request.isForMainFrame && request.url.toString() == "trimps-exit://unsaved" && LocalUrlPolicy.isLocalGame(view.url.orEmpty())) {
            onUnsavedExit()
            return true
        }
        if (LocalUrlPolicy.isLocalGame(request.url.toString())) {
            return request.isForMainFrame && !LocalUrlPolicy.isGameEntry(request.url.toString())
        }
        if (request.isForMainFrame && request.hasGesture() && request.url.scheme in listOf("http", "https")) {
            try { context.startActivity(Intent(Intent.ACTION_VIEW, request.url)) }
            catch (_: android.content.ActivityNotFoundException) {
                // No browser installed: say so instead of doing nothing (e.g. More → Feedback, V-198).
                android.widget.Toast.makeText(context, "No browser found to open ${request.url.host}.", android.widget.Toast.LENGTH_LONG).show()
            }
        }
        return true
    }

    override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
        onRendererGone(detail.didCrash())
        return true
    }

    override fun onPageFinished(view: WebView, url: String) {
        if (LocalUrlPolicy.isGameEntry(url)) onPageReady()
    }
}
