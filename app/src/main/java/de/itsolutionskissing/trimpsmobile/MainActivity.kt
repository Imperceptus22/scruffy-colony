package de.itsolutionskissing.trimpsmobile

import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.JsResult
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.Button
import android.widget.LinearLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : ComponentActivity() {
    companion object {
        const val PREVIOUS_GRAPHICS_SHORTCUT = "previous-graphics"
        private const val PREVIOUS_GRAPHICS_ACTION = "de.itsolutionskissing.trimpsmobile.PREVIOUS_GRAPHICS"
        private const val GRAPHICS_RESET_PENDING = "graphics-reset-pending"
        fun previousGraphicsIntent(context: Context) = Intent(context, MainActivity::class.java)
            .setAction(PREVIOUS_GRAPHICS_ACTION)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    private lateinit var webView: WebView
    private lateinit var content: FrameLayout
    private var bridge: SaveBridge? = null
    private var shop: BoneShop? = null
    // An unreadable purchase record keeps the shop off instead of crediting purchases again (or crashing the game).
    private val shopLedger by lazy { runCatching { ShopLedger(filesDir) }.onFailure { Log.w("TrimpsMobile", "Purchase ledger unreadable", it) }.getOrNull() }
    private lateinit var documents: SaveDocuments
    private var rendererAlive = false
    private var foreground = false
    private var lastRecoveryAt = -60000L
    private var previousGraphicsPending = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        previousGraphicsPending = savedInstanceState?.getBoolean(GRAPHICS_RESET_PENDING)
            ?: (intent.action == PREVIOUS_GRAPHICS_ACTION)
        publishGraphicsShortcut()
        content = FrameLayout(this)
        setContentView(content)
        ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout() or WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            // V-256: the padding already keeps the WebView clear of the system bars. Passing the same insets on made
            // the WebView treat itself as drawn behind them (env(safe-area-inset-bottom) 48px with three-button
            // navigation) and reserve or hide that strip again, so the bottom navigation slid under the bar.
            WindowInsetsCompat.CONSUMED
        }
        documents = SaveDocuments(this)
        createGameView()
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (!rendererAlive) { finish(); return }
                val current = webView
                current.evaluateJavascript("typeof TrimpsMobile !== 'undefined' && TrimpsMobile.handleBack ? TrimpsMobile.handleBack() : false") { closed ->
                    if (!rendererAlive || current !== webView) return@evaluateJavascript
                    if (closed != "true") AlertDialog.Builder(this@MainActivity)
                        .setTitle(R.string.leave_title).setNegativeButton(R.string.cancel, null)
                        .setPositiveButton(R.string.leave_confirm) { _, _ ->
                            if (rendererAlive && current === webView) current.evaluateJavascript("(typeof TrimpsMobile === 'undefined' ? Promise.resolve(false) : TrimpsMobile.saveNow()).then(ok => { location.href=ok?'trimps-exit://confirmed':'trimps-exit://unsaved'; })", null)
                        }.show()
                }
            }
        })
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (intent.action == PREVIOUS_GRAPHICS_ACTION) requestPreviousGraphics()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        outState.putBoolean(GRAPHICS_RESET_PENDING, previousGraphicsPending)
        super.onSaveInstanceState(outState)
    }

    private fun publishGraphicsShortcut() {
        try {
            getSystemService(ShortcutManager::class.java)?.addDynamicShortcuts(listOf(
                ShortcutInfo.Builder(this, PREVIOUS_GRAPHICS_SHORTCUT)
                    .setShortLabel(getString(R.string.previous_graphics))
                    .setLongLabel(getString(R.string.previous_graphics_launch))
                    .setIcon(Icon.createWithResource(this, R.mipmap.ic_launcher))
                    .setIntent(previousGraphicsIntent(this)).build()
            ))
        } catch (_: RuntimeException) {
            Log.w("TrimpsMobile", "Launcher shortcuts unavailable")
        }
    }

    private fun requestPreviousGraphics() {
        previousGraphicsPending = true
        if (rendererAlive) applyPreviousGraphics(webView)
        else { lastRecoveryAt = -60000L; recoverGameView() }
    }

    private fun applyPreviousGraphics(current: WebView) {
        if (!previousGraphicsPending || !rendererAlive || current !== webView || !LocalUrlPolicy.isLocalGame(current.url.orEmpty())) return
        current.evaluateJavascript("""
            (() => {
                if (typeof MobileGraphicStyle !== 'undefined') return MobileGraphicStyle.set('classic') === 'classic';
                try { localStorage.setItem('scruffy-colony-graphic-style','classic'); } catch (_) {}
                document.documentElement.dataset.graphics = 'classic';
                document.dispatchEvent(new CustomEvent('scruffy:graphic-style',{detail:{style:'classic'}}));
                return true;
            })()
        """.trimIndent()) { applied ->
            if (rendererAlive && current === webView && applied == "true") previousGraphicsPending = false
        }
    }

    private fun createGameView() {
        if (isFinishing || isDestroyed) return
        content.removeAllViews()
        webView = WebView(this)
        val current = webView
        rendererAlive = true
        webView.id = R.id.game_webview
        // No Android 12+ stretch overscroll: it distorted the whole page including the fixed bottom navigation (V-146).
        webView.overScrollMode = View.OVER_SCROLL_NEVER
        content.addView(webView, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            textZoom = (resources.configuration.fontScale * 100).toInt()
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onJsConfirm(view: WebView, url: String, message: String, result: JsResult): Boolean {
                AlertDialog.Builder(this@MainActivity).setTitle(R.string.app_name).setMessage(message)
                    .setPositiveButton(R.string.confirm) { _, _ -> result.confirm() }
                    .setNegativeButton(R.string.cancel) { _, _ -> result.cancel() }
                    .setOnCancelListener { result.cancel() }.show()
                return true
            }
            override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
                AlertDialog.Builder(this@MainActivity).setTitle(R.string.app_name).setMessage(message)
                    .setPositiveButton(R.string.ok) { _, _ -> result.confirm() }
                    .setOnCancelListener { result.confirm() }.show()
                return true
            }
        }
        webView.webViewClient = GameWebViewClient(this, { crashed ->
            if (!rendererAlive || current !== webView) return@GameWebViewClient
            Log.w("TrimpsMobile", if (crashed) "WebView renderer crashed" else "WebView renderer ended by system")
            rendererAlive = false
            bridge?.close()
            shop?.close(); shop = null
            content.removeView(current)
            current.destroy()
            showRendererFailure()
            content.post { recoverGameView() }
        }, { finish() }, { showUnsavedExit() }, { applyPreviousGraphics(current); syncLifecycle(current) })
        bridge = SaveBridge(webView, SlotStore(filesDir, BuildConfig.DEBUG), documents) { foreground }
        // V-220: bone packs; a recovered renderer gets a new shop on the new page.
        shop?.close()
        shop = shopLedger?.let { ledger -> BoneShop(this, webView, ledger).also { it.attach() } }
        if (bridge?.attach() == true) webView.loadUrl(LocalUrlPolicy.START_URL + if (previousGraphicsPending) "?graphics=classic" else "")
        else { rendererAlive = false; content.removeView(webView); webView.destroy(); content.addView(TextView(this).apply { setText(R.string.bridge_unavailable) }) }
    }

    private fun showRendererFailure() {
        content.removeAllViews()
        content.addView(LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val inset = (16 * resources.displayMetrics.density).toInt()
            setPadding(inset, inset, inset, inset)
            addView(TextView(this@MainActivity).apply { setText(R.string.renderer_failed) })
            addView(Button(this@MainActivity).apply {
                setText(R.string.renderer_retry)
                setOnClickListener { lastRecoveryAt = -60000L; recoverGameView() }
            })
            addView(Button(this@MainActivity).apply {
                setText(R.string.previous_graphics_launch)
                setOnClickListener { requestPreviousGraphics() }
            })
        })
    }

    private fun recoverGameView() {
        if (rendererAlive || !foreground || isFinishing || isDestroyed) return
        val now = SystemClock.elapsedRealtime()
        if (now - lastRecoveryAt < 60000L) return
        lastRecoveryAt = now
        createGameView()
    }

    private fun syncLifecycle(current: WebView = webView) {
        if (!rendererAlive || current !== webView) return
        val method = if (foreground) "resume" else "suspend"
        current.evaluateJavascript("typeof TrimpsMobile !== 'undefined' && TrimpsMobile.$method()", null)
    }

    private fun showUnsavedExit() {
        AlertDialog.Builder(this).setTitle(R.string.leave_title).setMessage(R.string.unsaved_exit)
            .setNegativeButton(R.string.cancel, null)
            .setNeutralButton(R.string.export_save) { _, _ -> webView.evaluateJavascript("typeof TrimpsMobile !== 'undefined' && TrimpsMobile.exportFile()", null) }
            .setPositiveButton(R.string.leave_unsaved) { _, _ -> finish() }.show()
    }

    override fun onPause() {
        foreground = false
        if (::webView.isInitialized) syncLifecycle()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        foreground = true
        if (rendererAlive) { syncLifecycle(); shop?.refresh() } else recoverGameView()
    }

    override fun onDestroy() {
        bridge?.close()
        shop?.close()
        if (::webView.isInitialized && rendererAlive) { content.removeView(webView); webView.destroy() }
        super.onDestroy()
    }
}
