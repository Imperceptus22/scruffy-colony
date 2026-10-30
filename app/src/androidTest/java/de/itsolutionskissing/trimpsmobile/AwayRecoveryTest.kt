package de.itsolutionskissing.trimpsmobile

import android.view.View
import android.view.ViewGroup
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebView
import android.widget.Button
import androidx.lifecycle.Lifecycle
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class)
class AwayRecoveryTest {
    private fun evaluate(scenario: ActivityScenario<MainActivity>, expression: String): String {
        var result = "null"
        val latch = CountDownLatch(1)
        scenario.onActivity { activity ->
            val view = activity.findViewById<WebView>(R.id.game_webview)
            if (view == null) latch.countDown()
            else view.evaluateJavascript(expression) { result = it; latch.countDown() }
        }
        assertTrue(latch.await(10, TimeUnit.SECONDS))
        return result
    }
    private fun ready(scenario: ActivityScenario<MainActivity>) {
        repeat(150) {
            if (evaluate(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()") == "true") return
            Thread.sleep(100)
        }
        fail("Game did not recover")
    }
    private fun prepare(scenario: ActivityScenario<MainActivity>, fixtureName: String = "new-game-5.10.1.txt") {
        ready(scenario)
        val fixture = InstrumentationRegistry.getInstrumentation().context.assets.open(fixtureName).bufferedReader().use { it.readText() }
        evaluate(scenario, "TrimpsMobile.freeze(); if(usingRealTimeOffline) offlineProgress.finish(true); game.options.menu.pauseGame.enabled=1; window.confirm=()=>true; (()=>{const d=JSON.parse(LZString.decompressFromBase64(${org.json.JSONObject.quote(fixture)})); d.global.lastOnline=Date.now(); d.options.menu.pauseGame.enabled=1; window.__imported=null; TrimpsMobile.importSave(LZString.compressToBase64(JSON.stringify(d))).then(ok=>window.__imported=ok)})()")
        waitFor(scenario, "window.__imported===true")
        evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); if(usingRealTimeOffline) offlineProgress.finish(true); game.options.menu.pauseGame.enabled=1; game.resources.food.owned=123; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
        repeat(100) { if (evaluate(scenario, "window.__saved===true") == "true") return; Thread.sleep(100) }
        fail("Checkpoint was not confirmed")
    }

    @Test fun originalAwayModesComputeRealResourcesAndPersistOnlyOnce() {
        for (mode in 0..3) ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            freezeNormalTimers(scenario)
            evaluate(scenario, "TrimpsMobile.freeze(); window.__RealDate=Date; window.__clock=Date.now(); window.Date=class extends __RealDate { constructor(...a){super(...(a.length?a:[__clock]));} static now(){return __clock;} }; game.global.start=__clock; game.global.time=0; game.global.lastOnline=__clock; game.options.menu.pauseGame.enabled=0; game.options.menu.offlineProgress.enabled=$mode; game.global.timeWarpLimit=1; game.global.playerGathering=''; game.jobs.Farmer.owned=2; game.resources.food.owned=0; game.resources.food.max=1000000; window.__portalBefore=game.global.portalTime; window.__awayDone=null; TrimpsMobile.suspend().then(()=>{__clock+=600000; return TrimpsMobile.resume()}).then(()=>window.__awayDone=true)")
            waitFor(scenario, "window.__awayDone===true")
            if (mode == 1 || mode == 2) {
                assertEquals("6000", evaluate(scenario, "offlineProgress.progressMax"))
                assertEquals("true", evaluate(scenario, "(()=>{const stop=document.querySelector('#offlineWrapper [onclick*=\"offlineProgress.finish\"]');const b=stop.getBoundingClientRect();const slider=document.getElementById('limitTimewarpSlider').getBoundingClientRect();return b.width>=44 && b.height>=44 && stop.scrollWidth<=stop.clientWidth+1 && slider.height>=44})()"))
                if (mode == 2) screenshot("v12-timewarp.png")
                evaluate(scenario, "TrimpsMobile.freeze(); while(usingRealTimeOffline){clearTimeout(offlineProgress.loop); offlineProgress.loop=null; offlineProgress.mobileContinue();}")
            }
            assertEquals(evaluate(scenario, "JSON.stringify({mode:$mode,food:game.resources.food.owned,lastOnline:game.global.lastOnline,clock:__clock})"), "true", evaluate(scenario, "Math.abs(game.resources.food.owned-${if (mode == 0) 0 else 600})<0.000001 && game.global.lastOnline===__clock"))
            if (mode == 0) assertEquals("600000", evaluate(scenario, "game.global.portalTime-window.__portalBefore"))
            evaluate(scenario, "TrimpsMobile.freeze(); game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            scenario.recreate()
            ready(scenario)
            assertEquals("true", evaluate(scenario, "Math.abs(game.resources.food.owned-${if (mode == 0) 0 else 600})<0.000001"))
        }
    }

    @Test fun interruptedOriginalWarpRestartsFromConfirmedBaseWithAllAwayTime() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            freezeNormalTimers(scenario)
            evaluate(scenario, "TrimpsMobile.freeze(); window.__RealDate=Date; window.__clock=Date.now(); window.Date=class extends __RealDate { constructor(...a){super(...(a.length?a:[__clock]));} static now(){return __clock;} }; game.global.start=__clock; game.global.time=0; game.global.lastOnline=__clock; game.options.menu.pauseGame.enabled=0; game.options.menu.offlineProgress.enabled=2; game.global.timeWarpLimit=1; game.global.playerGathering=''; game.jobs.Farmer.owned=2; game.resources.food.owned=0; game.resources.food.max=1000000; window.__awayDone=null; TrimpsMobile.suspend().then(()=>{__clock+=600000;return TrimpsMobile.resume()}).then(()=>window.__awayDone=true)")
            waitFor(scenario, "window.__awayDone===true")
            assertEquals("true", evaluate(scenario, "usingRealTimeOffline && game.resources.food.owned>0"))
            evaluate(scenario, "window.__awayDone=null; TrimpsMobile.suspend().then(()=>{__clock+=600000;return TrimpsMobile.resume()}).then(()=>window.__awayDone=true)")
            waitFor(scenario, "window.__awayDone===true")
            assertEquals("12000", evaluate(scenario, "offlineProgress.progressMax"))
            assertEquals("true", evaluate(scenario, "JSON.parse(LZString.decompressFromBase64(localStorage.getItem('trimpSave1'))).resources.food.owned===0"))
            evaluate(scenario, "TrimpsMobile.freeze(); while(usingRealTimeOffline){clearTimeout(offlineProgress.loop); offlineProgress.loop=null; offlineProgress.mobileContinue();}")
            assertEquals("true", evaluate(scenario, "Math.abs(game.resources.food.owned-1200)<0.000001 && game.global.lastOnline===__clock"))
        }
    }

    private fun waitFor(scenario: ActivityScenario<MainActivity>, expression: String) {
        repeat(100) { if (evaluate(scenario, expression) == "true") return; Thread.sleep(100) }
        fail("Condition not met: $expression")
    }

    private fun freezeNormalTimers(scenario: ActivityScenario<MainActivity>) {
        // Measure Away alone; no additional ordinary production during async disk acknowledgement.
        evaluate(scenario, "window.__runtime=startTrimpsMobileRuntime; startTrimpsMobileRuntime=()=>{__runtime();TrimpsMobile.freeze();}")
    }

    @Test fun shortWarmAbsenceUsesRealGameLoopButOriginalColdLoadSkipsIt() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            freezeNormalTimers(scenario)
            evaluate(scenario, "TrimpsMobile.freeze(); window.__RealDate=Date; window.__clock=Date.now(); window.Date=class extends __RealDate { constructor(...a){super(...(a.length?a:[__clock]));} static now(){return __clock;} }; game.global.start=__clock; game.global.time=0; game.global.lastOnline=__clock; game.options.menu.pauseGame.enabled=0; game.options.menu.offlineProgress.enabled=3; game.global.playerGathering=''; game.jobs.Farmer.owned=2; game.resources.food.owned=0; game.resources.food.max=1000000; window.__base=saveOriginal(true); window.__awayDone=null; TrimpsMobile.suspend().then(()=>{__clock+=60000;return TrimpsMobile.resume()}).then(()=>window.__awayDone=true)")
            waitFor(scenario, "window.__awayDone===true")
            assertEquals("false", evaluate(scenario, "usingRealTimeOffline"))
            evaluate(scenario, "mobileRuntimeSuspended=false; gameTimeout(); TrimpsMobile.freeze();")
            assertEquals("true", evaluate(scenario, "Math.abs(game.resources.food.owned-60)<0.000001 && game.global.lastOnline===__clock"))
            evaluate(scenario, "loadOriginal(window.__base); TrimpsMobile.freeze();")
            assertEquals("true", evaluate(scenario, "game.resources.food.owned===0 && game.global.lastOnline===__clock"))
        }
    }

    @Test fun originalPlayerSpireRunestonesSurviveSaveAndRecreation() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            freezeNormalTimers(scenario)
            evaluate(scenario, "TrimpsMobile.freeze(); window.__RealDate=Date; window.__clock=Date.now(); window.Date=class extends __RealDate { constructor(...a){super(...(a.length?a:[__clock]));} static now(){return __clock;} }; game.global.start=__clock; game.global.time=0; game.global.lastOnline=__clock; game.options.menu.pauseGame.enabled=0; game.options.menu.offlineProgress.enabled=3; game.global.spiresCompleted=1; game.global.highestLevelCleared=200; playerSpire.init(); playerSpire.lootAvg.average=4; playerSpire.lootAvg.lastAvg=[4,4]; playerSpire.runestones=200; game.jobs.Farmer.owned=2; game.resources.food.owned=0; game.resources.food.max=1000000; window.__awayDone=null; TrimpsMobile.suspend().then(()=>{__clock+=600000;return TrimpsMobile.resume()}).then(()=>window.__awayDone=true)")
            waitFor(scenario, "window.__awayDone===true")
            assertEquals("true", evaluate(scenario, "playerSpire.getRsPs()===4 && playerSpire.runestones===2000 && game.resources.food.owned===600"))
            evaluate(scenario, "game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            scenario.recreate()
            ready(scenario)
            assertEquals("true", evaluate(scenario, "playerSpire.initialized && playerSpire.runestones===2000 && game.resources.food.owned===600"))
        }
    }

    @Test fun mobileTimeWarpMatchesOriginalControllerForCombatAndConstruction() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario, "combat-5.10.1.txt")
            freezeNormalTimers(scenario)
            evaluate(scenario, "TrimpsMobile.freeze(); window.__RealDate=Date; window.__clock=Date.now(); window.Date=class extends __RealDate { constructor(...a){super(...(a.length?a:[__clock]));} static now(){return __clock;} }; Math.random=()=>.5; game.global.start=__clock; game.global.time=0; game.global.lastOnline=__clock; game.options.menu.pauseGame.enabled=0; game.options.menu.offlineProgress.enabled=2; game.global.timeWarpLimit=1; game.resources.food.owned=1000; game.resources.wood.owned=1000; game.resources.food.max=100000; game.resources.wood.max=100000; game.global.playerGathering='buildings'; game.global.autoBattle=true; game.global.pauseFight=false; battle(true); window.__enemyBefore=game.global.gridArray[0].health; window.__lostBefore=game.stats.battlesLost.value; window.__purchase=buyBuilding('Trap',true,false,3); window.__trapBefore=game.buildings.Trap.owned; window.__base=saveOriginal(true); window.__snapshot=()=>JSON.stringify({food:game.resources.food.owned,wood:game.resources.wood.owned,traps:game.buildings.Trap.owned,queue:game.global.buildingsQueue,world:game.global.world,cell:game.global.lastClearedCell,health:game.global.soldierHealth,enemy:game.global.gridArray[0].health,losses:game.stats.battlesLost.value}); __clock+=600000; offlineProgress.start(); TrimpsMobile.freeze(); while(usingRealTimeOffline){clearTimeout(offlineProgress.loop); offlineProgress.loop=null; offlineProgress.mobileContinue();} window.__reference=__snapshot();")
            assertEquals(evaluate(scenario, "JSON.stringify({snapshot:__snapshot(),before:__trapBefore,purchase:__purchase,mapsActive:game.global.mapsActive,fighting:game.global.fighting})"), "true", evaluate(scenario, "game.buildings.Trap.owned===__trapBefore+3 && game.global.buildingsQueue.length===0 && (game.global.world>5 || game.global.lastClearedCell>=0 || game.global.gridArray[0].health<__enemyBefore || game.stats.battlesLost.value>__lostBefore)"))
            evaluate(scenario, "loadOriginal(window.__base); TrimpsMobile.freeze(); while(usingRealTimeOffline){clearTimeout(offlineProgress.loop); offlineProgress.loop=null; offlineProgress.mobileContinue();}")
            assertEquals(evaluate(scenario, "__reference"), evaluate(scenario, "__snapshot()"))
        }
    }
    private fun rendererGone(scenario: ActivityScenario<MainActivity>, crashed: Boolean) {
        scenario.onActivity { activity ->
            val view = activity.findViewById<WebView>(R.id.game_webview)
            view.webViewClient.onRenderProcessGone(view, object : RenderProcessGoneDetail() {
                override fun didCrash() = crashed
                override fun rendererPriorityAtExit() = WebView.RENDERER_PRIORITY_BOUND
            })
        }
    }
    @Test fun actualRendererCrashAutomaticallyLoadsConfirmedGame() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            val store = CheckpointStore(InstrumentationRegistry.getInstrumentation().targetContext.filesDir)
            val before = store.read()
            var previous: WebView? = null
            scenario.onActivity { activity -> previous = activity.findViewById(R.id.game_webview); previous!!.loadUrl("chrome://crash") }
            for (attempt in 0 until 100) {
                var changed = false
                scenario.onActivity { changed = it.findViewById<WebView>(R.id.game_webview)?.let { view -> view !== previous } == true }
                if (changed) break
                Thread.sleep(100)
            }
            ready(scenario)
            scenario.onActivity { assertNotSame(previous, it.findViewById<WebView>(R.id.game_webview)) }
            assertEquals("123", evaluate(scenario, "game.resources.food.owned"))
            assertNotNull(before.lastGood)
            assertNotNull(store.read().lastGood)
            assertEquals("true", evaluate(scenario, "JSON.parse(LZString.decompressFromBase64(localStorage.getItem('trimpSave1'))).resources.food.owned===123"))
        }
    }
    @Test @androidx.test.filters.SdkSuppress(minSdkVersion = 29)
    fun systemRendererEndInBackgroundRecoversOnReturn() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            val store = CheckpointStore(InstrumentationRegistry.getInstrumentation().targetContext.filesDir)
            scenario.moveToState(Lifecycle.State.CREATED)
            val before = store.read()
            scenario.onActivity { assertTrue(it.findViewById<WebView>(R.id.game_webview).webViewRenderProcess!!.terminate()) }
            for (attempt in 0 until 100) {
                var removed = false
                scenario.onActivity { removed = it.findViewById<WebView>(R.id.game_webview) == null }
                if (removed) break
                Thread.sleep(100)
            }
            scenario.onActivity { assertNull(it.findViewById<WebView>(R.id.game_webview)) }
            assertEquals(before, store.read())
            scenario.moveToState(Lifecycle.State.RESUMED)
            ready(scenario)
            assertEquals("123", evaluate(scenario, "game.resources.food.owned"))
        }
    }

    @Test fun backgroundStartupDefersResourceCreditUntilForeground() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            evaluate(scenario, "TrimpsMobile.freeze(); game.options.menu.pauseGame.enabled=0; game.options.menu.offlineProgress.enabled=3; game.jobs.Farmer.owned=2; game.resources.food.owned=0; game.resources.food.max=1000000; game.global.lastOnline=Date.now()-600000; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
        }
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            scenario.moveToState(Lifecycle.State.CREATED)
            ready(scenario)
            assertEquals("true", evaluate(scenario, "game.resources.food.owned===0 && mobileRuntimeSuspended"))
            scenario.moveToState(Lifecycle.State.RESUMED)
            waitFor(scenario, "game.resources.food.owned>=600")
            evaluate(scenario, "TrimpsMobile.freeze(); game.options.menu.pauseGame.enabled=1")
        }
    }
    @Test fun repeatedRendererFailureStopsAutoRetryAndOffersExplicitRetry() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            prepare(scenario)
            rendererGone(scenario, true)
            ready(scenario)
            rendererGone(scenario, true)
            Thread.sleep(300)
            screenshot("v12-renderer-retry.png")
            scenario.onActivity { activity ->
                assertNull(activity.findViewById<WebView>(R.id.game_webview))
                fun buttons(view: View): List<Button> = when (view) {
                    is Button -> listOf(view)
                    is ViewGroup -> (0 until view.childCount).flatMap { buttons(view.getChildAt(it)) }
                    else -> emptyList()
                }
                val retry = buttons(activity.findViewById(android.R.id.content)).firstOrNull { it.text == "Erneut laden" }
                assertNotNull("Retry action missing", retry)
                retry!!.performClick()
            }
            ready(scenario)
            assertEquals("123", evaluate(scenario, "game.resources.food.owned"))
            screenshot("v12-restored.png")
        }
    }

    private fun screenshot(name: String) {
        val bitmap = InstrumentationRegistry.getInstrumentation().uiAutomation.takeScreenshot()
        assertNotNull(bitmap)
        java.io.File(InstrumentationRegistry.getInstrumentation().targetContext.cacheDir, name).outputStream().use {
            assertTrue(bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, it))
        }
        bitmap.recycle()
    }
}
