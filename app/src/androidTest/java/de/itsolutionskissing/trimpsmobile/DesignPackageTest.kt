package de.itsolutionskissing.trimpsmobile

import android.webkit.WebView
import android.graphics.Bitmap
import android.os.SystemClock
import android.view.MotionEvent
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.*
import org.junit.Test
import org.junit.Before
import org.junit.After
import org.json.JSONObject
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class)
class DesignPackageTest {
    // UI fixtures must not leak maps, universe or achievements into persistence tests.
    @Before fun isolatedStart() = resetControlledStand()
    @After fun restoreControlledStand() = resetControlledStand()
    private fun resetControlledStand() {
        val fixture = InstrumentationRegistry.getInstrumentation().context.assets.open("new-game-5.10.1.txt").bufferedReader().use { it.readText() }
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=1;window.confirm=()=>true;(()=>{const d=JSON.parse(LZString.decompressFromBase64(${JSONObject.quote(fixture)}));d.global.lastOnline=Date.now();d.options.menu.pauseGame.enabled=1;window.__reset=null;TrimpsMobile.importSave(LZString.compressToBase64(JSON.stringify(d))).then(ok=>window.__reset=ok)})()")
            waitFor(s, "window.__reset===true")
            evaluate(s, "cancelTooltip();closeAchievementPopup();closeAchievementPopup(true);TrimpsMobile.freeze();")
        }
    }
    private fun evaluate(scenario: ActivityScenario<MainActivity>, code: String): String {
        var result = "null"
        val latch = CountDownLatch(1)
        scenario.onActivity { it.findViewById<WebView>(R.id.game_webview).evaluateJavascript(code) { value -> result = value; latch.countDown() } }
        assertTrue(latch.await(10, TimeUnit.SECONDS))
        return result
    }
    private fun waitFor(scenario: ActivityScenario<MainActivity>, code: String) {
        repeat(100) { if (evaluate(scenario, code) == "true") return; Thread.sleep(100) }
        fail("Design condition timed out: $code")
    }
    private fun capture(s: ActivityScenario<MainActivity>, name: String) {
        var target: File? = null
        s.onActivity { target = File(it.getExternalFilesDir(null), "design-$name.png") }
        evaluate(s, "closeAchievementPopup();closeAchievementPopup(true);")
        InstrumentationRegistry.getInstrumentation().waitForIdleSync()
        Thread.sleep(1200)
        val bitmap = InstrumentationRegistry.getInstrumentation().uiAutomation.takeScreenshot()
        requireNotNull(target).outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
        bitmap.recycle()
    }
    @Test fun combatPolishKeepsTrimpsInfoOpenAndExplainsLootWithoutActions() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s,"typeof MobileLoot!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s,"cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;game.global.world=15;game.global.time=1001;game.upgrades.Battle.done=1;game.upgrades.Battle.fire();game.upgrades.Bloodlust.done=1;game.upgrades.Bloodlust.fire();buildGrid();setNonMapBox();game.resources.trimps.owned=48;fightManual();TrimpsUI.select('battle');MobileDesign.refresh();")
            assertEquals("true",evaluate(s,"document.getElementById('fightInfo')===null && document.getElementById('pauseFight').dataset.compactIcon==='battle' && getComputedStyle(document.getElementById('pauseFight'),'::after').content.includes('A')"))
            evaluate(s,"window.__autoFightBefore=game.global.pauseFight;document.getElementById('pauseFight').click();")
            assertEquals("true",evaluate(s,"game.global.pauseFight!==window.__autoFightBefore"))
            evaluate(s,"window.__battleState=JSON.stringify([game.global.mapsActive,game.global.preMapsActive,game.global.currentMapId,game.global.lastClearedCell,game.resources.food.owned]);TrimpsUI.info('Trap','buildings');document.querySelector('.mobile-battle-values-info').click();")
            Thread.sleep(2300)
            assertEquals("true",evaluate(s,"getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && !document.getElementById('mobile-tooltip-close').hidden"))
            capture(s,"polish-trimps-info-persistent")
            evaluate(s,"document.getElementById('mobile-tooltip-close').click();document.querySelector('.mobile-battle-values-info').click();")
            Thread.sleep(2300)
            assertEquals("true",evaluate(s,"getComputedStyle(document.getElementById('tooltipDiv')).display!=='none'"))
            evaluate(s,"cancelTooltip();for(const [i,key] of [[0,'fruit'],[1,'groundLumber']]){game.global.gridArray[i].special=key;game.global.gridArray[i].text=convertUnlockIconToSpan(game.worldUnlocks[key]);}drawGrid(false);")
            waitFor(s,"document.getElementById('cell0').hasAttribute('data-mobile-loot')")
            evaluate(s,"document.getElementById('cell0').click();")
            assertEquals("true",evaluate(s,"getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && document.getElementById('tipText').textContent.includes('Nahrung')"))
            evaluate(s,"document.getElementById('cell1').click();")
            assertEquals("true",evaluate(s,"document.getElementById('tipText').textContent.includes('Holz')"))
            capture(s,"polish-loot-info")
            evaluate(s,"cancelTooltip();drawGrid(false);")
            waitFor(s,"document.getElementById('cell0').hasAttribute('data-mobile-loot')")
            evaluate(s,"document.getElementById('cell0').click();")
            assertEquals("true",evaluate(s,"document.getElementById('tipText').textContent.includes('Nahrung') && JSON.stringify([game.global.mapsActive,game.global.preMapsActive,game.global.currentMapId,game.global.lastClearedCell,game.resources.food.owned])===window.__battleState"))
            evaluate(s,"cancelTooltip();TrimpsUI.info('Trap','buildings');")
            Thread.sleep(2300)
            assertEquals("true",evaluate(s,"getComputedStyle(document.getElementById('tooltipDiv')).display!=='none'"))
            Thread.sleep(1000)
            assertEquals("true",evaluate(s,"getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
        }
    }
    @Test fun lootRemainsOpenUntilManualCloseAndOrdinaryInfoStillExpires() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;game.global.world=13;game.global.time=1001;game.upgrades.Battle.done=1;game.upgrades.Battle.fire();buildGrid();updateLabels(true);TrimpsUI.select('battle');MobileDesign.refresh();window.__lootBefore=JSON.stringify([game.global.tutorialStep,game.resources.food.owned,game.resources.wood.owned,game.resources.metal.owned]);TrimpsUI.info('Trap','buildings');document.getElementById('lootBdBtn').click()")
            Thread.sleep(2300)
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && game.global.lockTooltip && document.querySelector('#tipCost [onclick=\"cancelTooltip()\"]')!==null"))
            capture(s, "compact-loot-persistent")
            evaluate(s, "document.querySelector('#tipCost [onclick=\"cancelTooltip()\"]').click()")
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
            evaluate(s, "document.getElementById('lootBdBtn').click();getLootBd('Fragments')")
            Thread.sleep(2300)
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && document.getElementById('tipTitle').textContent.includes('Fragments')"))
            evaluate(s, "document.querySelector('#tipCost [onclick=\"cancelTooltip()\"]').click();TrimpsUI.info('Trap','buildings')")
            waitFor(s, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none'")
            assertEquals("true", evaluate(s, "JSON.stringify([game.global.tutorialStep,game.resources.food.owned,game.resources.wood.owned,game.resources.metal.owned])===window.__lootBefore"))
        }
    }
    @Test fun helpArchiveRemainsReadableAndBackPreservesTutorialProgress() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileHelp!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "TrimpsMobile.freeze();cancelTooltip();window.__helpState=()=>JSON.stringify([game.global.tutorialStep,game.global.tutorialOpen,game.global.tutorialActive,tutorial.viewingStep,game.global.mapsActive,game.global.preMapsActive]);window.__helpBefore=window.__helpState();document.documentElement.style.fontSize='20.8px';TrimpsUI.select('more');document.getElementById('mobile-help').click()")
            Thread.sleep(2200)
            assertEquals("true", evaluate(s, "!document.getElementById('mobile-help-panel').hidden && document.querySelectorAll('[data-advisor-step]').length===16"))
            evaluate(s, "document.querySelector('#mobile-help-content>button').click()")
            assertEquals("true", evaluate(s, "document.querySelector('.mobile-help-reading').textContent.includes('Ressourcen') && TrimpsUI.back()"))
            evaluate(s, "const chapter=document.querySelector('[data-advisor-step=\"15\"]');if(chapter.parentElement.matches('details'))chapter.parentElement.open=true;chapter.click()")
            assertEquals("true", evaluate(s, "(()=>{const expected=document.createElement('div');expected.innerHTML=MobileAdvisorChapters[15].html;return document.querySelector('.mobile-help-reading').innerHTML===expected.innerHTML && document.querySelector('.mobile-help-goal').textContent.includes(MobileAdvisorChapters[15].goal)})()"))
            assertEquals("true", evaluate(s, "TrimpsUI.back() && TrimpsUI.back() && document.getElementById('mobile-help-panel').hidden && window.__helpState()===window.__helpBefore"))
        }
    }
    @Test fun settingsKeepOriginalValuesConfigAndReadableGermanSearch() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileCompact!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();TrimpsUI.select('more');if(!game.options.displayed)toggleSettingsMenu();settingTab('General')")
            waitFor(s, "document.querySelector('[data-compact-setting=\"autoSave\"]')!==null")
            evaluate(s, "window.__autoSaveBefore=game.options.menu.autoSave.enabled;document.getElementById('toggleautoSave').click()")
            assertEquals("true", evaluate(s, "game.options.menu.autoSave.enabled!==window.__autoSaveBefore && getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
            evaluate(s, "window.__autoSaveAfter=game.options.menu.autoSave.enabled;TrimpsUI.back();document.querySelector('.mobile-menu-entry[data-menu-index=\"5\"]').click()")
            assertEquals("true", evaluate(s, "game.options.menu.autoSave.enabled===window.__autoSaveAfter"))
            evaluate(s, "settingTab('Layout')")
            waitFor(s, "document.getElementById('togglestandardNotation')!==null")
            evaluate(s, "document.getElementById('togglestandardNotation').nextElementSibling.click()")
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && document.getElementById('logBaseInput')!==null"))
            evaluate(s, "cancelTooltip();const search=document.getElementById('searchSettings');search.value='automatisch';search.onkeyup({});")
            assertEquals("true", evaluate(s, "document.querySelector('[data-compact-setting=\"autoSave\"]')!==null && document.documentElement.scrollWidth<=innerWidth+1"))
        }
    }
    @Test fun combatAndMapNavigationKeepTheOriginalBattleAndEnemyArtChanges() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;game.global.universe=1;game.global.mapsActive=false;game.global.preMapsActive=false;game.global.currentMapId='';game.global.fighting=false;game.global.world=9;game.global.time=1001;game.resources.trimps.owned=8;game.upgrades.Battle.done=1;game.upgrades.Battle.fire();buildGrid();fightManual();updateLabels(true);game.global.mapsUnlocked=true;unlockMapStuff();TrimpsUI.select('battle');MobileDesign.refresh();window.__before=JSON.stringify([game.global.mapsActive,game.global.preMapsActive,game.global.switchToMaps,game.global.fighting,game.global.lastClearedCell,game.global.currentMapId,game.global.lookingAtMap]);")
            evaluate(s, "TrimpsUI.select('maps')")
            assertEquals("true", evaluate(s, "JSON.stringify([game.global.mapsActive,game.global.preMapsActive,game.global.switchToMaps,game.global.fighting,game.global.lastClearedCell,game.global.currentMapId,game.global.lookingAtMap])===window.__before && document.getElementById('preMaps').closest('#mobile-maps')!==null"))
            evaluate(s, "TrimpsUI.select('battle');game.global.gridArray[game.global.lastClearedCell+1].name='Elephimp';document.getElementById('badGuyName').textContent='Elephimp';MobileDesign.refresh()")
            assertEquals("true", evaluate(s, "document.getElementById('mobile-enemy-art').dataset.family==='elephant' && document.getElementById('mobile-combat-scene').getBoundingClientRect().height>80"))
            capture(s, "battle")
            evaluate(s, "game.global.gridArray[game.global.lastClearedCell+1].name='Voidsnimp';document.getElementById('badGuyName').textContent='Voidsnimp';MobileDesign.refresh()")
            assertEquals("true", evaluate(s, "document.getElementById('mobile-enemy-art').dataset.family==='snake' && document.getElementById('mobile-enemy-art').dataset.detail==='1' && document.documentElement.scrollWidth<=innerWidth+1"))
        }
    }
    @Test fun quantitiesAndIconTabsFitAtNormalAndLargeFontAndCustomUsesOriginalValue() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();document.getElementById('buyCol').style.visibility='visible';unlockBuilding('Trap');unlockJob('Farmer');")
            for (size in arrayOf("16px", "20.8px")) for (tab in arrayOf("buildings", "jobs")) {
                evaluate(s, "document.documentElement.style.fontSize='$size';TrimpsUI.select('colony');document.querySelector('#mobile-nav [data-page=$tab]').click();numTab(2)")
                assertEquals("true", evaluate(s, "game.global.buyAmt===10 && document.documentElement.scrollWidth<=innerWidth+1 && document.getElementById('numTabs').getBoundingClientRect().height<60 && document.querySelectorAll('#mobile-nav button').length===6 && [...document.querySelectorAll('#mobile-nav button')].every(n=>n.textContent===''&&n.getAttribute('aria-label'))"))
            }
            capture(s, "jobs-font130")
            evaluate(s, "document.getElementById('tab5Text2').click()")
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && game.global.lockTooltip"))
            evaluate(s, "document.getElementById('customNumberBox').value='3';document.getElementById('confirmTooltipBtn').click();document.documentElement.style.fontSize='16px'")
            assertEquals("true", evaluate(s, "game.global.buyAmt===3 && getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
            evaluate(s, "game.options.menu.pauseGame.enabled=0;game.resources.food.owned=10000;game.resources.trimps.max=100;game.resources.trimps.owned=100;game.resources.trimps.employed=0;game.jobs.Farmer.owned=0;game.jobs.Farmer.locked=0;game.global.firing=false;document.getElementById('Farmer').click()")
            assertEquals("true", evaluate(s, "game.jobs.Farmer.owned===3 && game.resources.trimps.employed===3 && game.global.buyAmt===3"))
        }
    }
    @Test fun groupedMoreAndAchievementDetailsKeepProgressAndExpire() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();TrimpsUI.select('more');window.__achState=()=>JSON.stringify([Object.fromEntries(Object.entries(game.achievements).map(([k,a])=>[k,a.finished])),game.global.achievementBonus]);window.__achBefore=window.__achState();document.querySelector('.mobile-menu-entry[data-menu-index=\"4\"]').click()")
            waitFor(s, "document.querySelector('.mobile-achieve-name')!==null")
            assertEquals("true", evaluate(s, "document.querySelectorAll('#mobile-more .mobile-file-actions>button').length===4 && document.querySelectorAll('.mobile-menu-group').length===2 && document.documentElement.scrollWidth<=innerWidth+1"))
            capture(s, "achievements")
            evaluate(s, "document.querySelector('.mobile-achieve-info').click()")
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('achievementHover')).display!=='none'"))
            waitFor(s, "getComputedStyle(document.getElementById('achievementHover')).display==='none'")
            assertEquals("true", evaluate(s, "window.__achState()===window.__achBefore"))
        }
    }
    @Test fun trackedAchievementRemainsVisibleOutsideTheLogWithItsStage() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();TrimpsUI.select('more');document.querySelector('.mobile-menu-entry[data-menu-index=\"4\"]').click();game.global.trackedAchieve=null;startTrackAchieve('totalZones',0);")
            waitFor(s, "document.querySelector('.pinnedAchieve')!==null")
            assertEquals("true", evaluate(s, "document.querySelector('.pinnedAchieve').closest('.achievementContainer').querySelector('.mobile-achieve-status').textContent.startsWith('Stufe '+game.achievements.totalZones.tiers[0]+' ·') && TrimpsUI.back() && !document.getElementById('logColumn').contains(document.getElementById('achievementTracker')) && document.getElementById('achievementTracker').getBoundingClientRect().height>0"))
            evaluate(s, "startTrackAchieve()")
            assertEquals("true", evaluate(s, "game.global.trackedAchieve===null && getComputedStyle(document.getElementById('achievementTracker')).display==='none'"))
        }
    }
    @Test fun lateGameOriginalActionsStayUsableAndInformationDoesNotPurchase() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();game.global.universe=1;game.global.highestLevelCleared=250;game.global.world=246;updateNatureInfoSpans();TrimpsUI.select('colony');document.querySelector('#mobile-nav [data-page=upgrades]').click();filterTabs('nature');window.__natureBefore=JSON.stringify(game.empowerments);")
            evaluate(s, "document.querySelector('#natureContainer .natureBuyIcon .mobile-info').click()")
            assertEquals("true", evaluate(s, "JSON.stringify(game.empowerments)===window.__natureBefore && getComputedStyle(document.getElementById('tooltipDiv')).display!=='none'"))
            waitFor(s, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none'")
            evaluate(s, "document.getElementById('turkimpBuff').style.display='block';document.querySelector('#turkimpBuff .mobile-info').click()")
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none'"))
            waitFor(s, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none'")
            evaluate(s, "game.global.fluffyExp=100000000;game.global.fluffyPrestige=1;game.portal.Capable.level=10;game.portal.Capable.locked=false;Fluffy.calculateInfo();tooltip('Fluffy',null,'update');")
            Thread.sleep(2100)
            assertEquals("true", evaluate(s, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && document.getElementById('fluffyPatBtn').getBoundingClientRect().height>=48 && parseFloat(getComputedStyle(document.getElementById('fluffyTooltipTopContainer')).fontSize)>=14"))
            evaluate(s, "cancelTooltip();closeAchievementPopup();closeAchievementPopup(true);TrimpsUI.back();")
            evaluate(s, "game.global.spiresCompleted=2;playerSpire.init();playerSpire.runestones=100000;playerSpire.openPopup();playerSpire.selectTrap('Fire');document.getElementById('playerSpireCell0').dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));")
            assertEquals("true", evaluate(s, "playerSpire.layout[0].trap.name==='Fire' && document.getElementById('playerSpireCell0').getBoundingClientRect().height>=48 && document.elementFromPoint(100,100).closest('#playerSpirePopout')!==null"))
            capture(s, "spire")
            evaluate(s, "TrimpsUI.back();game.global.universe=2;u2Mutations.openTree();")
            waitFor(s, "document.getElementById('mobile-mut-scroll')!==null")
            assertEquals("true", evaluate(s, "document.getElementById('mobile-mut-scroll').contains(document.getElementById('mutTree')) && document.getElementById('mutZoomIn').getBoundingClientRect().height>=48 && TrimpsUI.back()"))
        }
    }
    @Test fun consciousMapStartUsesOriginalActionsAndVoidAbandonStillNeedsConfirmation() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s, "typeof MobileDesign!=='undefined' && TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s, "cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;game.global.universe=1;game.global.world=6;buildGrid();game.global.mapsActive=false;game.global.preMapsActive=false;game.global.fighting=false;game.global.switchToMaps=false;game.global.currentMapId='';game.global.lookingAtMap='';game.global.mapsOwnedArray=[];game.global.mapsUnlocked=true;unlockMapStuff();game.resources.fragments.owned=100000;TrimpsUI.select('maps');document.getElementById('mapLevelInput').value='6';updateMapCost();document.getElementById('mapCreateBtn').click();")
            assertEquals("true", evaluate(s, "game.global.mapsOwnedArray.length===1 && !game.global.mapsActive"))
            evaluate(s, "document.getElementById('mobile-enter-maps').click();if(!game.global.preMapsActive)document.getElementById('mobile-enter-maps').click();selectMap(game.global.mapsOwnedArray[0].id);document.getElementById('selectMapBtn').click();")
            assertEquals("true", evaluate(s, "game.global.mapsActive && document.body.dataset.mobilePage==='battle' && game.global.mapGridArray.length>0 && document.getElementById('mobile-enemy-art').dataset.family===MobileEnemyArt.get(game.global.mapGridArray[game.global.lastClearedMapCell+1].name).family"))
            evaluate(s, "window.__mapState=JSON.stringify([game.global.mapsActive,game.global.preMapsActive,game.global.currentMapId,game.global.lookingAtMap,game.global.lastClearedMapCell]);TrimpsUI.select('maps');TrimpsUI.select('battle');")
            assertEquals("true", evaluate(s, "JSON.stringify([game.global.mapsActive,game.global.preMapsActive,game.global.currentMapId,game.global.lookingAtMap,game.global.lastClearedMapCell])===window.__mapState"))
            evaluate(s, "game.global.mapsOwnedArray.find(m=>m.id===game.global.currentMapId).location='Void';game.global.switchToMaps=false;TrimpsUI.select('maps');document.getElementById('mobile-enter-maps').click();")
            assertEquals("true", evaluate(s, "game.global.mapsActive && game.global.lockTooltip && getComputedStyle(document.getElementById('tooltipDiv')).display!=='none'"))
            evaluate(s, "cancelTooltip();game.global.mapsOwnedArray.find(m=>m.id===game.global.currentMapId).location='Mountain';mapsClicked(true);MobileDesign.refresh();game.global.totalVoidMaps=1;toggleVoidMaps(true);")
            assertEquals("true", evaluate(s, "document.getElementById('voidMapsBtn').getBoundingClientRect().height>0 && document.getElementById('mobile-enter-maps').textContent==='Zurück zur Welt'"))
            evaluate(s, "document.getElementById('voidMapsBtn').click();")
            assertEquals("true", evaluate(s, "game.global.voidMapsToggled"))
            evaluate(s, "document.getElementById('voidMapsBtn').click();document.getElementById('mobile-enter-maps').click();game.global.gridArray[game.global.lastClearedCell+1].name='Hulking_Mutimp';document.getElementById('badGuyName').textContent='Hulking Mutimp';MobileDesign.refresh();")
            assertEquals("true", evaluate(s, "!game.global.preMapsActive && !game.global.mapsActive && document.getElementById('mobile-enemy-art').dataset.detail==='1'"))
        }
    }
    @Test fun feedbackTrackerAndMenuRemainReadableAfterOriginalPauseAndTrackingActions() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s,"TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s,"cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;handlePauseMessage(false);TrimpsUI.select('more');displayAchievements();startTrackAchieve('totalMaps',0);MobileDesign.refresh();")
            assertEquals("true",evaluate(s,"(()=>{const n=document.getElementById('achievementTracker'),r=n.getBoundingClientRect(),f=document.querySelector('#mobile-more .mobile-file-actions').getBoundingClientRect();return getComputedStyle(n).position==='static' && r.top>=f.bottom && parseFloat(getComputedStyle(document.getElementById('achievementTrackerDescription')).fontSize)>=14 && document.documentElement.scrollWidth<=innerWidth && document.getElementById('settingsText').textContent.startsWith('Einstellungen')})()"))
            assertEquals("true",evaluate(s,"document.getElementById('mobile-version').textContent.includes('App '+${JSONObject.quote(BuildConfig.VERSION_NAME)}) && document.getElementById('mobile-version').textContent.includes('Originalspiel '+game.global.stringVersion)"))
            capture(s,"feedback-tracker")
            evaluate(s,"lastPause=0;document.getElementById('portalTimer').click();")
            assertEquals("true",evaluate(s,"game.options.menu.pauseGame.enabled===1 && document.getElementById('mobile-pause-action').textContent==='Spiel fortsetzen'"))
            Thread.sleep(150)
            evaluate(s,"document.getElementById('portalTimer').click();startTrackAchieve('totalZones',0);startTrackAchieve('totalMaps',0);")
            assertEquals("true",evaluate(s,"game.options.menu.pauseGame.enabled===0 && game.global.trackedAchieve[0]==='totalMaps'"))
            evaluate(s,"document.getElementById('closeTrackedAchieve').click();")
            assertEquals("true",evaluate(s,"game.global.trackedAchieve===null && getComputedStyle(document.getElementById('achievementTracker')).display==='none'"))
        }
    }
    @Test fun feedbackQueuePreservesOriginalPurchaseCancellationAndNextCraftIdentity() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s,"TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s,"cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;handlePauseMessage(false);TrimpsUI.select('colony');document.querySelector('#mobile-nav [data-page=buildings]').click();game.global.buyAmt=1;for(const k of ['food','wood','metal','gems'])game.resources[k].owned=10000000000;for(const k of ['Mansion','Gym'])game.buildings[k].locked=0;for(const k of ['Mansion','Gym','Mansion','Gym','Mansion','Mansion','Mansion','Mansion','Mansion'])buyBuilding(k);MobileDesign.refresh();window.__queueIds=[...document.querySelectorAll('#queueItemsHere>.queueItem')].map(n=>n.id);")
            assertEquals("true",evaluate(s,"game.global.buildingsQueue.length===9 && document.querySelectorAll('#queueItemsHere>.queueItem').length===9 && document.getElementById('mobile-queue-summary').textContent==='9 Aufträge · Mansion ×7 · Gym ×2' && document.getElementById('queueContainer').getBoundingClientRect().height<420"))
            capture(s,"feedback-queue")
            evaluate(s,"document.getElementById(window.__queueIds[2]).click();")
            assertEquals("true",evaluate(s,"game.global.buildingsQueue.length===8 && JSON.stringify([...document.querySelectorAll('#queueItemsHere>.queueItem')].map(n=>n.id))===JSON.stringify(window.__queueIds.filter((_,i)=>i!==2))"))
            evaluate(s,"window.__mansions=game.buildings.Mansion.owned;game.global.playerGathering='buildings';game.global.timeLeftOnCraft=0;craftBuildings();")
            assertEquals("true",evaluate(s,"game.buildings.Mansion.owned===window.__mansions+1 && game.global.buildingsQueue[0]==='Gym.1' && document.querySelector('#queueItemsHere>.queueItem').id===window.__queueIds[1]"))
        }
    }
    @Test fun permanentLogPreservesOriginalContentFiltersConfigurationAndBattleState() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s,"TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s,"cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;handlePauseMessage(false);game.global.world=11;game.global.time=1001;game.triggers.Battle.done=1;game.upgrades.Battle.done=1;game.upgrades.Battle.fire();buildGrid();setNonMapBox();game.resources.trimps.owned=30;fightManual();TrimpsUI.select('battle');game.options.menu.timestamps.enabled=2;for(let i=0;i<35;i++){message('Story '+i+' · vollständige Meldung <b>mit Inhalt</b>.','Story');message('Loot '+i,'Loot','*food');}postMessages();")
            Thread.sleep(150)
            evaluate(s,"window.__logBattle=JSON.stringify([game.global.world,game.global.mapsActive,game.global.preMapsActive,game.global.fighting,game.global.currentMapId,game.global.lastClearedCell]);window.__logText=document.getElementById('log').textContent;")
            capture(s,"permanent-log-visible")
            assertEquals("true",evaluate(s,"!document.getElementById('mobile-log-panel').hidden && document.getElementById('logColumn').closest('#mobile-log-panel')!==null && document.getElementById('log').textContent===window.__logText && document.getElementById('gridContainer').getBoundingClientRect().bottom<=document.getElementById('mobile-log-panel').getBoundingClientRect().top+1 && document.getElementById('battleBtnsColumn').getBoundingClientRect().bottom<=document.getElementById('mobile-log-panel').getBoundingClientRect().top+1"))
            evaluate(s,"document.getElementById('log').scrollTop=0;message('Neue Meldung','Story');postMessages();")
            Thread.sleep(100)
            assertEquals("true",evaluate(s,"document.getElementById('log').scrollTop===0"))
            evaluate(s,"window.__lootEnabled=game.global.messages.Loot.enabled;document.getElementById('LootFilter').click();")
            assertEquals("true",evaluate(s,"game.global.messages.Loot.enabled===!window.__lootEnabled && document.getElementById('LootFilter').getAttribute('aria-pressed')===String(!window.__lootEnabled)"))
            evaluate(s,"document.getElementById('LootFilter').click();")
            capture(s,"feedback-log-open")
            evaluate(s,"document.getElementById('logConfigBtn').click();")
            Thread.sleep(2100)
            assertEquals("true",evaluate(s,"getComputedStyle(document.getElementById('tooltipDiv')).display!=='none'"))
            evaluate(s,"TrimpsUI.back();")
            assertEquals("true",evaluate(s,"!document.getElementById('mobile-log-panel').hidden && TrimpsUI.back() && document.body.dataset.mobilePage==='colony' && document.getElementById('mobile-log-panel').getBoundingClientRect().height===0 && JSON.stringify([game.global.world,game.global.mapsActive,game.global.preMapsActive,game.global.fighting,game.global.currentMapId,game.global.lastClearedCell])===window.__logBattle"))
        }
    }
    @Test fun feedbackCombatAndNativePressAndSaveUseTheActualWebView() {
        ActivityScenario.launch(MainActivity::class.java).use { s ->
            waitFor(s,"TrimpsMobile.ready() && !usingRealTimeOffline")
            evaluate(s,"cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;handlePauseMessage(false);game.global.world=11;game.global.time=1001;game.triggers.Battle.done=1;game.upgrades.Battle.done=1;game.upgrades.Battle.fire();buildGrid();setNonMapBox();game.resources.trimps.owned=30;fightManual();game.global.gridArray[game.global.lastClearedCell+1].name='Elephimp';document.getElementById('badGuyName').textContent='Elephimp';document.getElementById('trimpsFighting').textContent='24';document.getElementById('goodGuyAttack').textContent='15.7K–23.6K';document.getElementById('badGuyAttack').textContent='29.9K–44.9K';document.getElementById('openTutorialContainer').style.display='block';TrimpsUI.select('battle');MobileDesign.refresh();")
            for (font in listOf(16,20.8)) {
                evaluate(s,"document.documentElement.style.fontSize='${font}px';")
                assertEquals("true",evaluate(s,"(()=>{const r=id=>document.getElementById(id).getBoundingClientRect(),n=r('badGuyName'),l=r('lootBdBtn');return !(n.left<l.right&&n.right>l.left&&n.top<l.bottom&&n.bottom>l.top) && Math.abs(r('goodGuyHealth').top-r('badGuyHealth').top)<2 && getComputedStyle(document.getElementById('goodGuyAttack')).fontSize===getComputedStyle(document.getElementById('badGuyAttack')).fontSize && [...document.querySelectorAll('#battleBtnsColumn .fightBtn')].every(n=>n.getBoundingClientRect().right<=r('battleContainer').right+1) && document.documentElement.scrollWidth<=innerWidth})()"))
            }
            capture(s,"feedback-combat-font130")
            evaluate(s,"const longCell=game.global.gridArray[0];document.getElementById('goodGuyAttack').textContent=calculateDamage(1.5e17,true,true,false,longCell);document.getElementById('badGuyAttack').textContent=calculateDamage(1.5e17,true,false,true,longCell);document.getElementById('trimpsFighting').textContent='123456';document.getElementById('badGuyName').textContent='Hulking Mutimp';MobileDesign.refresh();closeAchievementPopup();closeAchievementPopup(true);")
            assertEquals("true",evaluate(s,"['damageDiv','badGuyRow'].every(id=>{const n=document.getElementById(id);return n.scrollWidth<=n.clientWidth+1}) && document.getElementById('trimpsFighting').parentElement.classList.contains('mobile-army-count') && document.documentElement.scrollWidth<=innerWidth"))
            assertEquals("true",evaluate(s,"['goodGuyAttack','badGuyAttack'].every(id=>document.getElementById(id).nextSibling.textContent.startsWith('\u00a0DMG'))"))
            capture(s,"feedback-combat-long-values")
            evaluate(s,"document.documentElement.style.fontSize='16px';game.options.menu.pauseGame.enabled=1;TrimpsUI.select('more');document.getElementById('mobile-save-button').scrollIntoView({block:'center'});")
            Thread.sleep(150)
            val point=JSONObject(evaluate(s,"(()=>{const r=document.getElementById('mobile-save-button').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,viewport:innerWidth}})()"))
            var x=0f;var y=0f
            s.onActivity { activity -> val view=activity.findViewById<WebView>(R.id.game_webview);val location=IntArray(2);view.getLocationOnScreen(location);val scale=view.width/point.getDouble("viewport");x=(location[0]+point.getDouble("x")*scale).toFloat();y=(location[1]+point.getDouble("y")*scale).toFloat() }
            val down=SystemClock.uptimeMillis();val automation=InstrumentationRegistry.getInstrumentation().uiAutomation
            val first=MotionEvent.obtain(down,down,MotionEvent.ACTION_DOWN,x,y,0);automation.injectInputEvent(first,true);first.recycle()
            try{waitFor(s,"document.getElementById('mobile-save-button').classList.contains('mobile-pressed')");capture(s,"feedback-button-pressed")}finally{val up=MotionEvent.obtain(down,SystemClock.uptimeMillis(),MotionEvent.ACTION_UP,x,y,0);automation.injectInputEvent(up,true);up.recycle()}
            waitFor(s,"!document.getElementById('mobile-save-button').hasAttribute('aria-busy')")
            assertEquals("true",evaluate(s,"document.getElementById('mobile-save-button').click();document.getElementById('mobile-save-button').getAttribute('aria-busy')==='true'"))
            waitFor(s,"!document.getElementById('mobile-save-button').hasAttribute('aria-busy')")
            assertEquals("true",evaluate(s,"!document.getElementById('mobile-save-button').disabled && document.getElementById('mobile-status').textContent==='Spielstand gespeichert.'"))
        }
    }
}
