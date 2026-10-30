package de.itsolutionskissing.trimpsmobile

import android.webkit.WebView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class)
class BrandingTest {
    private fun evaluate(s: ActivityScenario<MainActivity>, code: String): String {
        var result = "null"
        val latch = CountDownLatch(1)
        s.onActivity { it.findViewById<WebView>(R.id.game_webview).evaluateJavascript(code) { result = it; latch.countDown() } }
        assertTrue(latch.await(10, TimeUnit.SECONDS))
        return result
    }
    private fun waitFor(s: ActivityScenario<MainActivity>, code: String) {
        repeat(100) { if (evaluate(s, code) == "true") return; Thread.sleep(100) }
        fail("Branding condition timed out: $code")
    }
    @Test fun originalGuideAndAdvisorArchiveKeepTheirSourceNames() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileBranding!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            try {
                evaluate(s, "MobileHelp.open();document.getElementById('mobile-truth-open').click();document.querySelector('[data-truth-topic=\"topic-60\"]').click();")
                waitFor(s, "document.getElementById('mobile-help-content').querySelector('h2,h3').textContent.includes('breeding')")
                assertEquals("true", evaluate(s, """document.getElementById('mobile-help-content').querySelector('h2,h3').textContent==="My trimps aren't breeding""""))
                evaluate(s, "MobileHelp.back();MobileHelp.back();document.querySelector('[data-advisor-step=\"0\"]').click();")
                waitFor(s, "document.querySelector('#mobile-help-content .mobile-help-note')!==null")
                assertEquals("true", evaluate(s, "document.querySelector('#mobile-help-content .mobile-help-note').textContent.includes('Original Trimps 5.10.1 text') && document.querySelector('#mobile-help-content .mobile-help-reading').textContent.includes('analysis of the Trimps')"))
                evaluate(s, "MobileHelp.back();document.querySelector('#mobile-help-content>button').click();")
                waitFor(s, "document.getElementById('mobile-help-content').textContent.includes('Scruffies')")
            } finally { evaluate(s, "MobileHelp.close();") }
        }
    }
    @Test fun dynamicPresentationKeepsSavesHandlersAndOriginalNoticesIntact() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileBranding!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            try {
                evaluate(s, """
                    TrimpsMobile.freeze();
                    window.__brandingSave=JSON.stringify(game.resources.trimps);
                    window.__brandingFixture=document.createElement('div');
                    __brandingFixture.id='branding-test';
                    __brandingFixture.innerHTML='<span id="branding-label" data-key="trimps" onclick="void(0)">2 Trimps</span><textarea>Trimps save text</textarea><input value="Trimps input"><pre>Trimps source</pre><section data-original-text>Trimps by Zach Hood</section><a href="https://trimps.github.io/">Original Trimps</a>';
                    document.body.append(__brandingFixture);
                """.trimIndent())
                waitFor(s, "document.getElementById('branding-label').textContent==='2 Scruffies'")
                assertEquals("true", evaluate(s, """
                    __brandingFixture.querySelector('textarea').value==='Trimps save text' &&
                    __brandingFixture.querySelector('input').value==='Trimps input' &&
                    __brandingFixture.querySelector('pre').textContent==='Trimps source' &&
                    __brandingFixture.querySelector('[data-original-text]').textContent==='Trimps by Zach Hood' &&
                    __brandingFixture.querySelector('a').textContent==='Original Trimps' &&
                    document.getElementById('branding-label').dataset.key==='trimps' &&
                    document.getElementById('branding-label').getAttribute('onclick')==='void(0)'
                """.trimIndent()))
                evaluate(s, "document.getElementById('branding-label').firstChild.data='1 Trimp';document.getElementById('branding-label').setAttribute('aria-label','Catch Trimps');")
                waitFor(s, "document.getElementById('branding-label').textContent==='1 Scruffy' && document.getElementById('branding-label').getAttribute('aria-label')==='Catch Scruffies'")
                assertEquals("true", evaluate(s, "JSON.stringify(game.resources.trimps)===window.__brandingSave && typeof TrimpsNative!=='undefined' && document.getElementById('mobile-header').textContent.includes('Scruffy Colony') && MobileTexts.licensesPage.includes('Trimps 5.10.1') && document.title==='Scruffy Colony'"))
            } finally {
                evaluate(s, "window.__brandingFixture?.remove();delete window.__brandingFixture;delete window.__brandingSave;TrimpsMobile.resume();")
            }
        }
    }
}
