package de.itsolutionskissing.trimpsmobile

import android.content.Context
import android.content.pm.ShortcutManager
import android.webkit.WebView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class GraphicsStyleTest {
    @Test fun previousGraphicsShortcutRestoresStyleInRunningGameWithoutChangingProgress() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile!=='undefined' && TrimpsMobile.ready() && typeof MobileGraphicStyle!=='undefined'")
            evaluate(scenario, "cancelTooltip();TrimpsMobile.freeze();window.__graphicsBefore=JSON.stringify([game.resources,game.buildings,game.jobs,game.global.world,game.global.lastClearedCell,game.global.buyAmt]);MobileGraphicStyle.set('diorama')")
            waitFor(scenario, "document.documentElement.dataset.graphics==='diorama'")
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val shortcut = context.getSystemService(ShortcutManager::class.java).dynamicShortcuts
                .single { it.id == MainActivity.PREVIOUS_GRAPHICS_SHORTCUT }
            assertEquals(context.packageName, shortcut.intent!!.component!!.packageName)
            scenario.onActivity { it.startActivity(MainActivity.previousGraphicsIntent(it)) }
            waitFor(scenario, "MobileGraphicStyle.get()==='classic' && document.documentElement.dataset.graphics==='classic'")
            assertEquals("true", evaluate(scenario, "JSON.stringify([game.resources,game.buildings,game.jobs,game.global.world,game.global.lastClearedCell,game.global.buyAmt])===window.__graphicsBefore"))
            scenario.recreate()
            waitFor(scenario, "typeof MobileGraphicStyle!=='undefined' && typeof TrimpsMobile!=='undefined' && TrimpsMobile.ready()")
            assertEquals("\"classic\"", evaluate(scenario, "MobileGraphicStyle.get()"))
        }
    }

    @Test fun launcherResetWorksOnColdStartAndDoesNotKeepForcingLaterChoices() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        ActivityScenario.launch<MainActivity>(MainActivity.previousGraphicsIntent(context)).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile!=='undefined' && TrimpsMobile.ready() && typeof MobileGraphicStyle!=='undefined'")
            assertEquals("\"classic\"", evaluate(scenario, "MobileGraphicStyle.get()"))
            waitFor(scenario, "!new URLSearchParams(location.search).has('graphics')")
            evaluate(scenario, "MobileGraphicStyle.set('diorama')")
            waitFor(scenario, "document.documentElement.dataset.graphics==='diorama'")
            var previous: WebView? = null
            scenario.onActivity { activity ->
                previous = activity.findViewById(R.id.game_webview)
                assertTrue(previous!!.webViewRenderProcess!!.terminate())
            }
            val recoveryDeadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(30)
            var replaced = false
            while (!replaced && System.nanoTime() < recoveryDeadline) {
                scenario.onActivity { replaced = it.findViewById<WebView>(R.id.game_webview)?.let { view -> view !== previous } == true }
                if (!replaced) Thread.sleep(50)
            }
            assertTrue("renderer recovery must replace the old WebView", replaced)
            waitFor(scenario, "typeof TrimpsMobile!=='undefined' && TrimpsMobile.ready() && typeof MobileGraphicStyle!=='undefined'")
            assertEquals("\"diorama\"", evaluate(scenario, "MobileGraphicStyle.get()"))
            scenario.recreate()
            waitFor(scenario, "typeof TrimpsMobile!=='undefined' && TrimpsMobile.ready() && typeof MobileGraphicStyle!=='undefined'")
            assertEquals("\"diorama\"", evaluate(scenario, "MobileGraphicStyle.get()"))
            evaluate(scenario, "MobileGraphicStyle.set('classic')")
        }
    }

    private fun evaluate(scenario: ActivityScenario<MainActivity>, script: String): String {
        val latch = CountDownLatch(1)
        var result = ""
        scenario.onActivity { activity ->
            activity.findViewById<WebView>(R.id.game_webview).evaluateJavascript(script) {
                result = it
                latch.countDown()
            }
        }
        check(latch.await(10, TimeUnit.SECONDS)) { "WebView evaluation timed out" }
        return result
    }

    private fun waitFor(scenario: ActivityScenario<MainActivity>, condition: String) {
        val end = System.nanoTime() + TimeUnit.SECONDS.toNanos(30)
        while (System.nanoTime() < end) {
            if (evaluate(scenario, "Boolean($condition)") == "true") return
            Thread.sleep(50)
        }
        fail("Condition not reached: $condition")
    }
}
