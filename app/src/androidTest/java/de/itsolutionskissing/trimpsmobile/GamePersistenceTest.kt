package de.itsolutionskissing.trimpsmobile

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import android.webkit.WebView
import androidx.test.core.app.ActivityScenario
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class)
class GamePersistenceTest {
    @Test fun earlyColonyControlsAreReadableAndDirectTabsShowBuildings() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); unlockBuilding('Trap'); document.getElementById('buyCol').style.visibility='visible'; document.getElementById('wood').style.visibility='visible'; game.resources.food.owned=27; game.resources.wood.owned=23; numTab(1); TrimpsUI.select('colony'); document.getElementById('woodTimeToFill').textContent='7 Mins 57 Secs'; document.getElementById('mobile-nav-buildings').click()")
            assertEquals("true", evaluate(scenario, "document.getElementById('mobile-nav-buildings').getAttribute('aria-label')==='Bauen' && parseFloat(getComputedStyle(document.getElementById('tab1Text')).fontSize)>=14"))
            assertEquals("true", evaluate(scenario, "document.getElementById('mobile-nav').getBoundingClientRect().height===60 && Math.abs(document.getElementById('tab1').getBoundingClientRect().top-document.getElementById('tab2').getBoundingClientRect().top)<1"))
            waitFor(scenario, "document.getElementById('Trap').getBoundingClientRect().bottom<=document.getElementById('mobile-nav').getBoundingClientRect().top && document.getElementById('Trap').getBoundingClientRect().top>=0")
            assertEquals("true", evaluate(scenario, "game.global.buyTab==='buildings' && game.global.buyAmt===1 && game.resources.food.owned===27 && game.resources.wood.owned===23"))
            evaluate(scenario, "TrimpsColony.select('resources'); window.scrollTo(0,0)")
            assertEquals("true", evaluate(scenario, "document.getElementById('woodTimeToFill').getBoundingClientRect().height>=16 && document.getElementById('woodTimeToFill').getBoundingClientRect().top>=document.getElementById('woodBar').parentElement.getBoundingClientRect().bottom"))
            evaluate(scenario, "TrimpsUI.select('more')")
            assertEquals("true", evaluate(scenario, "(()=>{const cells=[...document.querySelectorAll('#mobile-more .mobile-file-actions>button')];return cells.length===4 && cells.every(n=>n.getBoundingClientRect().width>0) && Math.abs(cells[0].getBoundingClientRect().width-cells[1].getBoundingClientRect().width)<1})()"))
            evaluate(scenario, "if(game.options.displayed) toggleSettingsMenu(); document.getElementById('settingsText').click()")
            waitFor(scenario, "document.getElementById('settingsHere').getBoundingClientRect().top>=-1 && document.getElementById('settingsHere').getBoundingClientRect().top<document.getElementById('mobile-nav').getBoundingClientRect().top")
            assertEquals("true", evaluate(scenario, "parseFloat(getComputedStyle(document.querySelector('#GeneralTab a')).fontSize)>=14 && document.documentElement.scrollWidth<=innerWidth+1"))
            evaluate(scenario, "TrimpsUI.back()")
            assertEquals("true", evaluate(scenario, "!game.options.displayed && scrollY===0"))
        }
    }
    @Test fun incompleteImportPreservesResourcesAndBothConfirmedStores() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); game.options.menu.pauseGame.enabled=1; TrimpsMobile.freeze(); game.resources.food.owned=27; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            evaluate(scenario, "window.__before=localStorage.getItem('trimpSave1'); window.__native=null; TrimpsMobile.bridge('restore').then(s=>window.__native=JSON.stringify(s)); window.confirm=()=>true")
            waitFor(scenario, "window.__native!==null")
            for (change in listOf("delete d.resources", "delete d.resources.food.owned", "delete d.buildings")) {
                evaluate(scenario, "(()=>{const d=JSON.parse(LZString.decompressFromBase64(window.__before)); $change; window.__imported=null; TrimpsMobile.importSave(LZString.compressToBase64(JSON.stringify(d))).then(ok=>window.__imported=ok)})()")
                waitFor(scenario, "window.__imported!==null")
                assertEquals("false", evaluate(scenario, "window.__imported"))
                assertEquals("true", evaluate(scenario, "game.resources.food.owned===27 && localStorage.getItem('trimpSave1')===window.__before"))
                evaluate(scenario, "window.__after=null; TrimpsMobile.bridge('restore').then(s=>window.__after=JSON.stringify(s))")
                waitFor(scenario, "window.__after!==null")
                assertEquals("true", evaluate(scenario, "window.__after===window.__native"))
            }
            scenario.recreate()
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            assertEquals("27", evaluate(scenario, "game.resources.food.owned"))
        }
    }
    @Test fun backIgnoresSettingsInsideHiddenMorePage() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsUI.select('more'); if(!game.options.displayed) document.getElementById('settingsText').click(); TrimpsUI.select('colony')")
            assertEquals("false", evaluate(scenario, "TrimpsUI.back()"))
            assertEquals("true", evaluate(scenario, "game.options.displayed"))
            evaluate(scenario, "TrimpsUI.select('more')")
            assertEquals("true", evaluate(scenario, "TrimpsUI.back()"))
            assertEquals("true", evaluate(scenario, "!game.options.displayed && scrollY===0"))
        }
    }
    @Test fun completedBattleUpgradeRemovesItsWholeMobileRow() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            // Manual unlock must also consume its original trigger, as real play does.
            evaluate(scenario, "TrimpsMobile.freeze(); if(usingRealTimeOffline) offlineProgress.finish(true); cancelTooltip(); game.options.menu.pauseGame.enabled=0; game.options.menu.lockOnUnlock.enabled=0; game.triggers.Battle.done=1; game.upgrades.Battle.done=0; game.upgrades.Battle.allowed=1; game.upgrades.Battle.locked=0; game.resources.science.owned=0; drawAllUpgrades(true); TrimpsColony.select('upgrades'); document.getElementById('Battle').click()")
            assertEquals("true", evaluate(scenario, "game.upgrades.Battle.done===0 && document.getElementById('Battle')!==null"))
            evaluate(scenario, "game.resources.science.owned=20; document.getElementById('Battle').click()")
            assertEquals("true", evaluate(scenario, "game.upgrades.Battle.done===1 && game.resources.science.owned===10 && document.getElementById('Battle')===null && document.getElementById('BattleInfo')===null && document.querySelector('.mobile-price[data-type=upgrades][data-item=Battle]')===null"))
            assertEquals("true", evaluate(scenario, "game.global.gridArray.length===100 && document.getElementById('battleContainer').style.visibility!=='hidden'"))
            evaluate(scenario, "TrimpsUI.select('battle'); TrimpsUI.select('colony'); game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            scenario.recreate()
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            waitFor(scenario, "game.upgrades.Battle.done===1 && document.getElementById('Battle')===null && document.getElementById('BattleInfo')===null", "JSON.stringify({battle:game.upgrades.Battle,hasRow:!!document.getElementById('Battle'),hasInfo:!!document.getElementById('BattleInfo'),warp:usingRealTimeOffline,ready:TrimpsMobile.ready(),stored:JSON.parse(LZString.decompressFromBase64(localStorage.getItem('trimpSave1'))).upgrades.Battle})")
        }
    }
    @Test fun informationClosesByTouchAndBackWithoutBuying() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); window.__infoBefore=JSON.stringify([game.resources,game.global.buildingsQueue,game.jobs]); TrimpsUI.info('Trap','buildings')")
            assertEquals("true", evaluate(scenario, "document.getElementById('mobile-tooltip-close')!==null && document.getElementById('mobile-tooltip-close').getBoundingClientRect().height>=48"))
            evaluate(scenario, "document.getElementById('mobile-tooltip-close').click()")
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none' && !game.global.lockTooltip"))
            evaluate(scenario, "TrimpsUI.info('Trap','buildings')")
            assertEquals("true", evaluate(scenario, "TrimpsUI.back()"))
            assertEquals("true", evaluate(scenario, "JSON.stringify([game.resources,game.global.buildingsQueue,game.jobs])===window.__infoBefore && getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
        }
    }
    @Test fun achievementPopupClosesAndPreservesRewards() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); game.options.menu.achievementPopups.enabled=1; window.__achieveIndex=game.achievements.oneOffs.finished.findIndex(x=>!x); giveSingleAchieve(game.achievements.oneOffs.names[window.__achieveIndex]); window.__awarded=JSON.stringify([game.achievements,game.global.achievementBonus])")
            assertEquals("true", evaluate(scenario, "document.getElementById('mobile-achievement-close')!==null && document.getElementById('mobile-achievement-close').getBoundingClientRect().height>=48"))
            evaluate(scenario, "document.getElementById('mobile-achievement-close').click()")
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('achievementPopup')).display==='none' && JSON.stringify([game.achievements,game.global.achievementBonus])===window.__awarded"))
            evaluate(scenario, "window.__achieveIndex=game.achievements.oneOffs.finished.findIndex(x=>!x); giveSingleAchieve(game.achievements.oneOffs.names[window.__achieveIndex]); window.__awarded=JSON.stringify([game.achievements,game.global.achievementBonus])")
            assertEquals("true", evaluate(scenario, "TrimpsUI.back()"))
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('achievementPopup')).display==='none' && JSON.stringify([game.achievements,game.global.achievementBonus])===window.__awarded"))
        }
    }
    @Test fun compactColonyPagesKeepQuantityAndAllLongListItemsReachable() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            assertEquals("true", evaluate(scenario, "document.getElementById('mobile-nav-buildings')!==null"))
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); Object.values(game.buildings).filter(b=>b&&typeof b==='object').forEach(b=>b.locked=0); drawAllBuildings(); document.getElementById('buyCol').style.visibility='visible'; numTab(2); window.__colonyBefore=JSON.stringify([game.resources,game.jobs,game.buildings,game.global.buyAmt]); document.getElementById('mobile-nav-buildings').click()")
            waitFor(scenario, "document.getElementById('mobile-colony-next').disabled===false")
            assertEquals("true", evaluate(scenario, "game.global.buyAmt===10 && document.documentElement.scrollWidth<=innerWidth+1 && document.getElementById('numTabs').getBoundingClientRect().height<160 && getComputedStyle(document.querySelector('#numTabs li.tabSelected > a')).color==='rgb(255, 248, 233)'"))
            evaluate(scenario, "window.__rowCount=document.querySelectorAll('#buildingsHere > .mobile-purchase').length; window.__seen=new Set()")
            for (page in 0 until 40) {
                assertEquals("true", evaluate(scenario, "document.documentElement.scrollWidth<=innerWidth+1"))
                evaluate(scenario, "document.querySelectorAll('#buildingsHere > .mobile-purchase').forEach(row=>{if(row.getBoundingClientRect().height>0) window.__seen.add(row.querySelector('.thing').id)})")
                if (evaluate(scenario, "document.getElementById('mobile-colony-next').disabled") == "true") break
                evaluate(scenario, "document.getElementById('mobile-colony-next').click()")
            }
            assertEquals("true", evaluate(scenario, "window.__seen.size===window.__rowCount"))
            evaluate(scenario, "filterTabs('all'); TrimpsColony.refresh()")
            waitFor(scenario, "game.global.buyTab==='buildings' && document.getElementById('jobsContainer').style.display==='none'")
            evaluate(scenario, "document.getElementById('mobile-nav-resources').click(); document.getElementById('mobile-nav-jobs').click(); document.getElementById('mobile-nav-upgrades').click(); document.getElementById('mobile-nav-equipment').click()")
            assertEquals("true", evaluate(scenario, "JSON.stringify([game.resources,game.jobs,game.buildings,game.global.buyAmt])===window.__colonyBefore"))
        }
    }
    @Test fun compactActionsBuyTenTrapsAndHireThenFireWithoutInfoPurchase() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); game.options.menu.pauseGame.enabled=0; game.options.menu.lockOnUnlock.enabled=0; game.global.firing=false; game.resources.food.owned=1000; game.resources.wood.owned=1000; game.buildings.Trap.locked=0; drawAllBuildings(); document.getElementById('buyCol').style.visibility='visible'; TrimpsColony.select('buildings'); numTab(2); window.__purchased=game.buildings.Trap.purchased; window.__queued=game.global.buildingsQueue.length; document.getElementById('TrapInfo').click()")
            assertEquals("true", evaluate(scenario, "game.resources.food.owned===1000 && game.resources.wood.owned===1000 && game.global.buildingsQueue.length===window.__queued"))
            evaluate(scenario, "document.getElementById('mobile-tooltip-close').click(); document.getElementById('Trap').click()")
            assertEquals("true", evaluate(scenario, "game.resources.food.owned===900 && game.resources.wood.owned===900 && game.buildings.Trap.purchased===window.__purchased+10 && game.global.buildingsQueue.length===window.__queued+1"))
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
            evaluate(scenario, "cancelTooltip(); game.resources.trimps.max=100; game.resources.trimps.owned=100; game.jobs.Farmer.owned=0; game.triggers.jobs.fire(); drawAllJobs(); TrimpsColony.select('jobs'); document.getElementById('FarmerInfo').click()")
            assertEquals(evaluate(scenario, "JSON.stringify([game.jobs.Farmer.owned,game.resources.food.owned,game.global.buyAmt])"), "true", evaluate(scenario, "game.jobs.Farmer.owned===0 && game.resources.food.owned===900 && game.global.buyAmt===10"))
            evaluate(scenario, "cancelTooltip(); document.getElementById('Farmer').click()")
            assertEquals(evaluate(scenario, "JSON.stringify([game.jobs.Farmer.owned,game.resources.food.owned,game.global.buyAmt,document.getElementById('fireBtn').getBoundingClientRect().height,game.workspaces])"), "true", evaluate(scenario, "game.jobs.Farmer.owned===10 && game.resources.food.owned===850 && document.getElementById('FarmerMinus').getBoundingClientRect().height>=43 && document.getElementById('FarmerMinus').getBoundingClientRect().height<=44"))
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
            evaluate(scenario, "cancelTooltip(); document.getElementById('FarmerMinus').click()")
            assertEquals("true", evaluate(scenario, "game.jobs.Farmer.owned===0 && game.resources.food.owned===850 && game.global.buyAmt===10"))
        }
    }
    @Test fun longerJobPagesKeepScrollAndFiveBuildingsFit() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); game.resources.food.owned=270; game.resources.wood.owned=230; game.resources.metal.owned=120; ['wood','metal','buyCol'].forEach(id=>document.getElementById(id).style.visibility='visible'); Object.values(game.buildings).filter(b=>b&&typeof b==='object').forEach(b=>b.locked=1); ['Trap','Barn','Shed','Forge','Hut'].forEach(n=>game.buildings[n].locked=0); drawAllBuildings(); numTab(1); TrimpsUI.select('colony'); TrimpsColony.select('buildings')")
            waitFor(scenario, "(()=>{const rows=[...document.querySelectorAll('#buildingsHere>.mobile-purchase')];return rows.length===5 && rows.every(n=>n.querySelector('.mobile-price').textContent && n.getBoundingClientRect().height>0 && n.getBoundingClientRect().bottom<=document.getElementById('mobile-nav').getBoundingClientRect().top)})()")
            evaluate(scenario, "game.resources.trimps.max=100; game.resources.trimps.owned=100; ['trimps','trimpsColumn'].forEach(id=>document.getElementById(id).style.visibility='visible'); game.triggers.jobs.fire(); Object.values(game.jobs).forEach(j=>j.locked=0); drawAllJobs(); document.getElementById('buyCol').style.visibility='visible'; TrimpsColony.select('jobs')")
            waitFor(scenario, "!document.getElementById('mobile-colony-next').disabled && document.getElementById('mobile-colony-content').getBoundingClientRect().height>Number(document.getElementById('mobile-colony-content').dataset.availableHeight)")
            evaluate(scenario, "window.scrollTo(0,120); window.__jobY=scrollY; document.getElementById('mobile-colony-next').click()")
            assertEquals("true", evaluate(scenario, "window.__jobY>0 && Math.abs(scrollY-Math.min(window.__jobY,document.documentElement.scrollHeight-innerHeight))<1"))
            evaluate(scenario, "window.__jobY=scrollY; document.getElementById('mobile-colony-prev').click()")
            assertEquals("true", evaluate(scenario, "Math.abs(scrollY-window.__jobY)<1"))
            evaluate(scenario, "TrimpsColony.select('buildings')")
            assertEquals("0", evaluate(scenario, "scrollY"))
        }
    }
    @Test fun infoTimesOutButInputsAndConfirmationsRemainOpenAndFightDoesNotOpenHelp() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); TrimpsUI.info('Trap','buildings')")
            waitFor(scenario, "getComputedStyle(document.getElementById('tooltipDiv')).display==='none' && !game.global.lockTooltip")
            evaluate(scenario, "TrimpsUI.info('Trap','buildings'); TrimpsUI.openTextImport(); document.getElementById('mobile-import-text').value='kept'; window.__timerChecked=false; setTimeout(()=>window.__timerChecked=true,3200)")
            waitFor(scenario, "window.__timerChecked")
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && document.getElementById('mobile-import-text').value==='kept'"))
            evaluate(scenario, "cancelTooltip(); TrimpsUI.info('Trap','buildings'); tooltip('confirm',null,'update','synthetic confirmation','window.__confirmed=true'); window.__timerChecked=false; setTimeout(()=>window.__timerChecked=true,3200)")
            waitFor(scenario, "window.__timerChecked")
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && !window.__confirmed"))
            evaluate(scenario, "cancelTooltip(); game.options.menu.pauseGame.enabled=0; game.global.time=2000; game.resources.trimps.owned=8; game.upgrades.Battle.done=1; game.upgrades.Battle.fire(); TrimpsUI.select('battle'); document.getElementById('fightBtn').dispatchEvent(new MouseEvent('mouseover',{bubbles:true})); document.getElementById('fightBtn').click()")
            assertEquals("true", evaluate(scenario, "game.global.fighting && getComputedStyle(document.getElementById('tooltipDiv')).display==='none'"))
            // One synchronous evaluation: the running fight cannot tick between the snapshot and the comparison.
            assertEquals("true", evaluate(scenario, "(()=>{const army=()=>JSON.stringify([game.resources.trimps,game.global.soldierHealth,game.global.soldierCurrentAttack]);const before=army();document.querySelector('.mobile-battle-values-info').click();return game.global.lockTooltip && army()===before;})()"))
        }
    }
    @Test fun customQuantityTextFitsAtLargeFontAndAllAmountsRemainReachable() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); unlockBuilding('Trap'); document.getElementById('buyCol').style.visibility='visible'; TrimpsUI.select('colony'); TrimpsColony.select('buildings'); game.global.lastCustomAmt=1; numTab(1); document.documentElement.style.fontSize='20.8px'")
            try {
                assertEquals("true", evaluate(scenario, "(()=>{const c=document.getElementById('tab5Text2'),p=document.getElementById('tab5Text'),m=document.getElementById('tab6Text');return c.scrollWidth<=c.clientWidth+1 && getComputedStyle(p).display==='none' && c.getBoundingClientRect().width>=44 && c.getBoundingClientRect().right<=m.getBoundingClientRect().left+1 && document.documentElement.scrollWidth<=innerWidth+1})()"))
                // V-41: a custom amount that differs from the fixed tabs stays visible and fits at large font.
                evaluate(scenario, "game.global.lastCustomAmt=12345; numTab(5)")
                waitFor(scenario, "!document.getElementById('tab5').hasAttribute('data-standard-amount')")
                assertEquals("true", evaluate(scenario, "(()=>{const p=document.getElementById('tab5Text'),c=document.getElementById('tab5Text2'),m=document.getElementById('tab6Text');return getComputedStyle(p).display!=='none' && p.getBoundingClientRect().width>=48 && p.scrollWidth<=p.clientWidth+1 && c.getBoundingClientRect().right<=m.getBoundingClientRect().left+1 && document.documentElement.scrollWidth<=innerWidth+1})()"))
                evaluate(scenario, "game.global.lastCustomAmt=1; numTab(1)")
                evaluate(scenario, "document.getElementById('tab6Text').scrollIntoView({block:'nearest',inline:'end'})")
                assertEquals("true", evaluate(scenario, "document.getElementById('tab6Text').getBoundingClientRect().right<=innerWidth+1"))
                evaluate(scenario, "document.getElementById('tab5Text2').click()")
                assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('tooltipDiv')).display!=='none' && document.querySelector('#tipText input')!==null"))
            } finally { evaluate(scenario, "cancelTooltip(); document.documentElement.style.fontSize=''") }
        }
    }
    @Test fun advancedColonyPanelsRemainReachableAndBackRestoresTheirNodes() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); game.global.universe=1; game.global.highestLevelCleared=250; TrimpsColony.select('upgrades'); window.__nature=document.getElementById('natureContainer'); document.getElementById('natureTab').click()")
            assertEquals("true", evaluate(scenario, "!document.getElementById('mobile-colony-detail').hidden && document.getElementById('mobile-colony-detail').contains(window.__nature)"))
            assertEquals("true", evaluate(scenario, "TrimpsUI.back() && document.getElementById('mobile-colony-detail').hidden && document.getElementById('natureContainer')===window.__nature && game.global.buyTab==='upgrades'"))
            evaluate(scenario, "document.getElementById('talentsTab').click()")
            assertEquals("true", evaluate(scenario, "!document.getElementById('mobile-colony-detail').hidden && document.getElementById('mobile-colony-detail').contains(document.getElementById('talentsContainer'))"))
            evaluate(scenario, "u2Mutations.swapTab(true); TrimpsColony.refresh(); window.__mutatorChecked=false; setTimeout(()=>window.__mutatorChecked=true,200)")
            waitFor(scenario, "window.__mutatorChecked")
            assertEquals("true", evaluate(scenario, "u2Mutations.open && document.getElementById('mobile-colony-detail').hidden && game.global.buyTab==='all' && getComputedStyle(document.getElementById('mutTreeWrapper')).display!=='none'"))
            evaluate(scenario, "u2Mutations.swapTab(false); TrimpsColony.refresh(); window.__masteryChecked=false; setTimeout(()=>window.__masteryChecked=true,200)")
            waitFor(scenario, "window.__masteryChecked")
            assertEquals("true", evaluate(scenario, "!u2Mutations.open && !document.getElementById('mobile-colony-detail').hidden && game.global.buyTab==='talents' && document.getElementById('mobile-colony-detail').contains(document.getElementById('talentsContainer'))"))
            evaluate(scenario, "document.querySelector('#mobile-colony-detail > button').click()")
            assertEquals("true", evaluate(scenario, "document.getElementById('mobile-colony-detail').hidden && game.global.buyTab==='upgrades'"))
            evaluate(scenario, "TrimpsColony.select('resources'); filterTabs('talents'); document.querySelector('#mobile-colony-detail > button').click()")
            assertEquals("true", evaluate(scenario, "document.getElementById('mobile-colony-detail').hidden && document.getElementById('mobile-colony-content').dataset.category==='resources'"))
        }
    }
    @Test fun constructionQueueUsesOneProgressBarPerOrder() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip();TrimpsMobile.freeze();game.options.menu.pauseGame.enabled=0;game.options.menu.lockOnUnlock.enabled=0;game.global.buildingsQueue=[];document.getElementById('queueItemsHere').innerHTML='';game.global.crafting='';game.global.autoCraftModifier=0;game.resources.food.max=2000;game.resources.wood.max=2000;game.resources.food.owned=1000;game.resources.wood.owned=1000;game.buildings.Trap.locked=0;game.buildings.Hut.locked=0;drawAllBuildings();numTab(1);buyBuilding('Trap');window.__stockAfterTrap=[game.resources.food.owned,game.resources.wood.owned];buyBuilding('Hut');setGather('buildings');craftBuildings();craftBuildings();game.options.menu.pauseGame.enabled=1")
            assertEquals("true", evaluate(scenario, "(()=>{const rows=[...document.querySelectorAll('#queueItemsHere .queueItem')],bar=rows[0].querySelector('#animationDiv'),actual=1-game.global.timeLeftOnCraft/getCraftTime(game.buildings[game.global.crafting]);return rows.length===2 && rows.every(e=>e.querySelectorAll('#animationDiv').length===1) && Math.abs(Number(bar.style.transform.match(/scaleX\\((.+)\\)/)[1])-actual)<1e-8})()"))
            evaluate(scenario, "game.options.menu.pauseGame.enabled=0;window.__stockBeforeCancel=[game.resources.food.owned,game.resources.wood.owned];document.getElementById('queueItemsHere').children[1].click()")
            assertEquals("true", evaluate(scenario, "game.global.buildingsQueue.length===1 && game.global.buildingsQueue[0]==='Trap.1' && document.getElementById('queueItemsHere').children.length===1 && game.global.crafting==='Trap' && game.resources.food.owned===window.__stockAfterTrap[0] && game.resources.wood.owned===window.__stockAfterTrap[1]"))
            evaluate(scenario, "window.__stockBeforeCancel=[game.resources.food.owned,game.resources.wood.owned];document.getElementById('queueItemsHere').children[0].click()")
            assertEquals("true", evaluate(scenario, "game.global.buildingsQueue.length===0 && document.getElementById('queueItemsHere').children.length===0 && game.global.crafting==='' && game.resources.food.owned===window.__stockBeforeCancel[0]+10 && game.resources.wood.owned===window.__stockBeforeCancel[1]+10"))
        }
    }
    @Test fun boneTabsKeepOriginalPurchaseCostsAndConfirmations() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip();TrimpsMobile.freeze();game.global.b=120;game.unlocks.imps.Feyimp=false;showBones();document.querySelector('[data-import=Feyimp]').click()")
            assertEquals("true", evaluate(scenario, "game.global.b===120 && !game.unlocks.imps.Feyimp && game.global.lockTooltip"))
            evaluate(scenario, "document.querySelector('#tipCost [onclick*=purchaseImport]').click()")
            assertEquals("true", evaluate(scenario, "game.global.b===70 && game.unlocks.imps.Feyimp && document.querySelector('#mobile-bone-tabs [aria-selected=true]').dataset.panel==='imports'"))
            evaluate(scenario, "document.querySelector('#mobile-bone-tabs [data-panel=extras]').click()")
            assertEquals("true", evaluate(scenario, "(()=>{const cards=[...document.querySelectorAll('#singleRunBonuses .mobile-bone-offer')];return cards.length===4 && cards.every((e,i)=>e.getBoundingClientRect().width>=350 && e.scrollHeight<=e.clientHeight+1 && (i===0 || cards[i-1].getBoundingClientRect().bottom<=e.getBoundingClientRect().top))})()"))
            evaluate(scenario, "document.getElementById('quickTrimpsPurchaseBtn').click()")
            assertEquals("true", evaluate(scenario, "game.global.b===70 && !game.singleRunBonuses.quickTrimps.owned && game.global.lockTooltip"))
            evaluate(scenario, "document.querySelector('#tipCost [onclick*=purchaseSingleRunBonus]').click();MobileBones.refresh()")
            assertEquals("true", evaluate(scenario, "game.global.b===50 && game.singleRunBonuses.quickTrimps.owned && document.querySelector('#mobile-bone-tabs [aria-selected=true]').dataset.panel==='extras'"))
            evaluate(scenario, "Object.keys(game.unlocks.imps).forEach(n=>game.unlocks.imps[n]=true);showBones();document.querySelector('#mobile-bone-tabs [data-panel=permanent]').click()")
            assertEquals("true", evaluate(scenario, "getComputedStyle(document.getElementById('permaBoneBonuses')).display!=='none' && document.getElementById('multitaskingPurchaseBtn').getAttribute('onclick').includes('purchasePermaBoneBonus')"))
            evaluate(scenario, "hideBones()")
        }
    }
    @Test fun bundledLicenseCanBeReadWithoutLeavingTheGame() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "const checkbox=document.getElementById('advPerfectCheckbox'); swapNiceCheckbox(checkbox,false); window.__unchecked=getComputedStyle(checkbox,'::before').content; swapNiceCheckbox(checkbox,true)")
            assertEquals("true", evaluate(scenario, "window.__unchecked!==getComputedStyle(document.getElementById('advPerfectCheckbox'),'::before').content && getComputedStyle(document.getElementById('advPerfectCheckbox'),'::before').content.includes('☑')"))
            evaluate(scenario, "cancelTooltip(); TrimpsUI.select('more'); document.getElementById('mobile-licenses-button').click(); document.querySelector('#tipText a[onclick]').click()")
            waitFor(scenario, "document.getElementById('mobile-license-text')?.textContent.includes('Version 3, 29 June 2007')")
            assertEquals("true", evaluate(scenario, "location.pathname==='/assets/game/index.html' && TrimpsMobile.ready()"))
            evaluate(scenario, "cancelTooltip(); TrimpsUI.select('colony')")
        }
    }
    private fun directory(): File = File(InstrumentationRegistry.getInstrumentation().targetContext.cacheDir, "save-test-${System.nanoTime()}").apply { mkdirs() }

    @Test fun pendingImportSurvivesStoreRecreation() {
        val directory = directory()
        val store = CheckpointStore(directory)
        store.checkpoint("previous")
        store.beginImport("previous")
        val restarted = CheckpointStore(directory)
        assertEquals(CheckpointState("previous", "previous"), restarted.read())
        assertEquals("previous", restarted.restoreRollback())
        assertEquals(CheckpointState("previous", null), restarted.read())
    }

    @Test fun ordinaryCheckpointCannotRemoveRollbackMarker() {
        val store = CheckpointStore(directory())
        store.checkpoint("previous")
        store.beginImport("previous")
        try { store.checkpoint("late"); fail("late checkpoint accepted") } catch (_: IllegalStateException) { }
        assertEquals(CheckpointState("previous", "previous"), store.read())
        store.commit("candidate")
        assertEquals(CheckpointState("candidate", null), store.read())
    }

    @Test fun corruptStoreIsNotReplacedByEmptyState() {
        val directory = directory()
        File(directory, "checkpoint.json").writeText("broken")
        try { CheckpointStore(directory).read(); fail("corrupt store accepted") } catch (_: Exception) { }
        assertEquals("broken", File(directory, "checkpoint.json").readText())
    }

    @Test fun atomicWriteFailurePreservesConfirmedStand() {
        val directory = directory()
        val store = CheckpointStore(directory)
        store.checkpoint("previous")
        File(directory, "checkpoint.json.new").mkdirs()
        File(directory, "checkpoint.json.new/blocker").writeText("keep directory nonempty")
        try { store.checkpoint("new"); fail("write should fail") } catch (_: Exception) { }
        assertEquals(CheckpointState("previous", null), store.read())
    }

    @Test fun legacyAtomicBackupIsRecoveredWhenBaseIsMissing() {
        val directory = directory()
        val store = CheckpointStore(directory)
        store.checkpoint("previous")
        assertTrue(File(directory, "checkpoint.json").renameTo(File(directory, "checkpoint.json.bak")))
        assertEquals(CheckpointState("previous", null), store.read())
    }

    @Test fun mobileInformationDoesNotBuyAndNavigationPreservesAmount() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            // Previous scenarios may leave an active warp; isolate this purchase/info fixture.
            evaluate(scenario, "TrimpsMobile.freeze(); if(usingRealTimeOffline) offlineProgress.finish(true); cancelTooltip(); game.options.menu.pauseGame.enabled=1; game.resources.food.owned=100; game.resources.wood.owned=100; game.buildings.Trap.locked=0; drawAllBuildings(); TrimpsColony.select('buildings'); numTab(2); window.__costBefore=game.resources.food.owned; window.__queueBefore=game.global.buildingsQueue.length; document.querySelector('#TrapInfo').click(); window.__infoOpened=game.global.lockTooltip")
            assertEquals("true", evaluate(scenario, "game.resources.food.owned===window.__costBefore && game.global.buildingsQueue.length===window.__queueBefore && window.__infoOpened"))
            evaluate(scenario, "cancelTooltip(); TrimpsUI.select('battle'); TrimpsUI.select('colony')")
            assertEquals("10", evaluate(scenario, "game.global.buyAmt"))
            evaluate(scenario, "TrimpsMobile.freeze(); game.options.menu.pauseGame.enabled=0; numTab(1); document.getElementById('Trap').click()")
            assertEquals("true", evaluate(scenario, "game.resources.food.owned===90 && game.resources.wood.owned===90 && game.global.buildingsQueue.length===window.__queueBefore+1"))
        }
    }

    private fun evaluate(scenario: ActivityScenario<MainActivity>, code: String): String {
        var result = "null"
        val latch = CountDownLatch(1)
        scenario.onActivity { activity -> activity.findViewById<WebView>(R.id.game_webview).evaluateJavascript(code) { result = it; latch.countDown() } }
        assertTrue("JavaScript callback timed out", latch.await(10, TimeUnit.SECONDS))
        return result
    }

    private fun waitFor(scenario: ActivityScenario<MainActivity>, code: String, diagnostic: String? = null) {
        repeat(100) { if (evaluate(scenario, code) == "true") return; Thread.sleep(100) }
        fail("WebView condition timed out" + if (diagnostic == null) "" else ": " + evaluate(scenario, diagnostic))
    }

    @Test fun importedHtmlCannotExecuteOnImportOrBoot() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved === true")
            evaluate(scenario, "window.__before=localStorage.getItem('trimpSave1'); window.confirm=()=>true; const d=JSON.parse(LZString.decompressFromBase64(window.__before)); d.global.mapsOwnedArray=[{id:'map1\\\"><img src=x onerror=window.importExecuted=true>',name:'Safe',level:1}]; window.__malicious=LZString.compressToBase64(JSON.stringify(d)); window.__imported=null; TrimpsMobile.importSave(window.__malicious).then(ok=>window.__imported=ok)")
            waitFor(scenario, "window.__imported === false")
            assertEquals("true", evaluate(scenario, "localStorage.getItem('trimpSave1')===window.__before && !window.importExecuted && document.querySelector('[onerror]')===null"))
            evaluate(scenario, "localStorage.setItem('trimpSave1',window.__malicious)")
            scenario.recreate()
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            assertEquals("true", evaluate(scenario, "!window.importExecuted && document.querySelector('[onerror]')===null && game.global.mapsOwnedArray.length===0"))
        }
    }

    // V-211: dark mode, split screen, keyboard or density changes no longer rebuild the activity (android:configChanges), so
    // an unsaved change and the running page survive; before, onDestroy cut off the save started in onPause.
    @Test fun systemUiModeChangeKeepsTheRunningGameWithoutSaving() {
        val shell = InstrumentationRegistry.getInstrumentation().uiAutomation
        fun run(command: String) = android.os.ParcelFileDescriptor.AutoCloseInputStream(shell.executeShellCommand(command)).bufferedReader().use { it.readText() }
        // Restore the emulator's own setting afterwards ("Night mode: no|yes|auto|custom").
        val previous = run("cmd uimode night").substringAfter(":").trim().ifEmpty { "no" }
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            var before: MainActivity? = null
            scenario.onActivity { before = it }
            evaluate(scenario, "game.options.menu.pauseGame.enabled=1; game.resources.food.owned=4242; window.__page='kept'")
            // Switch to the opposite of the current appearance and wait until the change reached the activity, so the test
            // never passes without a real configuration change.
            var night = false
            scenario.onActivity { night = it.resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK == android.content.res.Configuration.UI_MODE_NIGHT_YES }
            try {
                run("cmd uimode night " + if (night) "no" else "yes")
                var after: MainActivity? = null
                var changed = false
                repeat(100) {
                    if (changed) return@repeat
                    scenario.onActivity { after = it; changed = (it.resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK == android.content.res.Configuration.UI_MODE_NIGHT_YES) != night }
                    if (!changed) Thread.sleep(100)
                }
                assertTrue("the night mode change must reach the activity", changed)
                assertSame("the activity must not be rebuilt", before, after)
                assertEquals("true", evaluate(scenario, "window.__page==='kept' && game.resources.food.owned===4242"))
            } finally {
                run("cmd uimode night $previous")
            }
        }
    }
    @Test fun saveAndOriginalExportSurviveRecreation() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "game.options.menu.pauseGame.enabled=1; game.resources.food.owned=123; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            assertEquals("true", evaluate(scenario, "JSON.parse(LZString.decompressFromBase64(localStorage.getItem('trimpSave1'))).resources.food.owned===123"))
            scenario.recreate()
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            assertEquals("123", evaluate(scenario, "game.resources.food.owned"))
        }
    }

    @Test fun timeWarpSuspendsWithoutPartialSaveAndResumesOnlyOnce() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); if(usingRealTimeOffline) offlineProgress.finish(true); game.global.lastOfflineProgress=0; game.options.menu.pauseGame.enabled=0; game.options.menu.offlineProgress.enabled=2; game.global.lastOnline=Date.now()-600000; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            evaluate(scenario, "TrimpsMobile.freeze(); window.__confirmed=localStorage.getItem('trimpSave1'); game.global.timeWarpLimit=1; game.global.lastOnline=Date.now()-600000; offlineProgress.start(); window.__suspended=null; TrimpsMobile.suspend().then(ok=>window.__suspended=ok)")
            waitFor(scenario, "window.__suspended===false")
            assertEquals("true", evaluate(scenario, "usingRealTimeOffline && mobileRuntimeSuspended && offlineProgress.loop===null && localStorage.getItem('trimpSave1')===window.__confirmed"))
            evaluate(scenario, "window.__ticks=offlineProgress.ticksProcessed")
            Thread.sleep(250)
            assertEquals("true", evaluate(scenario, "offlineProgress.ticksProcessed===window.__ticks"))
            evaluate(scenario, "window.__continues=0; const continuation=offlineProgress.mobileContinue; offlineProgress.mobileContinue=()=>{window.__continues++; continuation();}; window.__resumed=null; Promise.all([TrimpsMobile.resume(),TrimpsMobile.resume()]).then(()=>window.__resumed=true)")
            waitFor(scenario, "window.__resumed===true")
            waitFor(scenario, "usingRealTimeOffline && offlineProgress.progressMax>=6000")
            evaluate(scenario, "TrimpsMobile.freeze()")
            assertEquals("true", evaluate(scenario, "window.__continues===0 && offlineProgress.progressMax>=6000 && localStorage.getItem('trimpSave1')===window.__confirmed"))
            evaluate(scenario, "offlineProgress.finish(true); game.options.menu.pauseGame.enabled=1")
        }
    }

    @Test fun documentCancellationLeavesConfirmedStandUntouched() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            evaluate(scenario, "window.__before=localStorage.getItem('trimpSave1'); window.__cancelled=null; TrimpsMobile.importFile().then(ok=>window.__cancelled=ok)")
            Thread.sleep(800)
            InstrumentationRegistry.getInstrumentation().uiAutomation.executeShellCommand("input keyevent 4").close()
            waitFor(scenario, "window.__cancelled===false")
            assertEquals("true", evaluate(scenario, "localStorage.getItem('trimpSave1')===window.__before"))
        }
    }

    @Test fun boundedDocumentsRejectOversizeAndMalformedUtf8() {
        assertEquals("abc", readBoundedUtf8("abc".byteInputStream(), 3))
        for ((bytes, limit) in listOf("abcd".toByteArray() to 3, byteArrayOf(0xc3.toByte(), 0x28) to 3)) {
            try { readBoundedUtf8(bytes.inputStream(), limit); fail("invalid document accepted") } catch (_: Exception) { }
        }
    }

    @Test fun rendererFailureDoesNotWriteEmptyGame() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            val previous = CheckpointStore(context.filesDir).read()
            scenario.moveToState(androidx.lifecycle.Lifecycle.State.CREATED)
            scenario.onActivity { it.findViewById<WebView>(R.id.game_webview).loadUrl("chrome://crash") }
            var removed = false
            // Crashpad can delay onRenderProcessGone beyond 10s (observed 10.77s on API36).
            repeat(300) {
                scenario.onActivity { removed = it.findViewById<WebView>(R.id.game_webview) == null }
                if (!removed) Thread.sleep(100)
            }
            assertTrue("renderer error did not replace WebView", removed)
            assertEquals(previous, CheckpointStore(context.filesDir).read())
        }
    }

    @Test fun originalErrorFlagPreservesBothConfirmedStores() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            val previous = CheckpointStore.forDirectory(context.filesDir).read()
            evaluate(scenario, "window.__before=localStorage.getItem('trimpSave1'); tooltips.showError('synthetic test error'); game.resources.food.owned=999; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===false")
            assertEquals("true", evaluate(scenario, "disableSaving && localStorage.getItem('trimpSave1')===window.__before"))
            assertEquals(previous, CheckpointStore.forDirectory(context.filesDir).read())
        }
    }

    @Test fun pastedTextUsesProtectedImportAndCancelPreservesStand() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            evaluate(scenario, "window.__before=localStorage.getItem('trimpSave1'); const d=JSON.parse(LZString.decompressFromBase64(window.__before)); d.resources.food.owned=66; window.__candidate=LZString.compressToBase64(JSON.stringify(d)); TrimpsUI.openTextImport(); document.getElementById('mobile-import-text').value=window.__candidate; window.confirm=()=>false; window.__imported=null; TrimpsUI.submitImportText().then(ok=>window.__imported=ok)")
            waitFor(scenario, "window.__imported===false")
            assertEquals("true", evaluate(scenario, "localStorage.getItem('trimpSave1')===window.__before && document.getElementById('mobile-import-text').value===window.__candidate"))
            evaluate(scenario, "window.confirm=()=>true; window.__imported=null; TrimpsUI.submitImportText().then(ok=>window.__imported=ok)")
            waitFor(scenario, "window.__imported===true")
            assertEquals("66", evaluate(scenario, "game.resources.food.owned"))
        }
    }

    @Test fun originalCombatAndMapCreationCanSaveAndRecreate() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); TrimpsMobile.freeze(); game.options.menu.pauseGame.enabled=0; game.global.world=6; game.resources.trimps.owned=8; game.upgrades.Battle.done=1; game.upgrades.Battle.fire(); fightManual(); game.global.fighting=false; game.global.mapsUnlocked=true; game.global.mapsOwnedArray=[]; document.getElementById('mapsHere').innerHTML=''; document.getElementById('mapsBtn').style.display='block'; TrimpsUI.select('maps'); mapsClicked(true); game.resources.fragments.owned=100000; document.getElementById('mapLevelInput').value='6'; updateMapCost(); document.getElementById('mapCreateBtn').click()")
            assertEquals("1", evaluate(scenario, "game.global.mapsOwnedArray.length"))
            evaluate(scenario, "document.getElementById('selectMapBtn').click(); game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            assertEquals("true", evaluate(scenario, "game.global.mapsActive && game.global.mapGridArray.length>0"))
            scenario.recreate()
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            assertEquals("true", evaluate(scenario, "game.global.mapsOwnedArray.length===1 && game.global.mapsActive && game.global.mapGridArray.length>0"))
        }
    }

    @Test fun independentStoreInstancesCannotLoseImportMarkerUnderConcurrentWrites() {
        val directory = directory()
        val first = CheckpointStore(directory)
        val second = CheckpointStore(directory)
        first.checkpoint("before")
        val start = CountDownLatch(1)
        val errors = java.util.concurrent.ConcurrentLinkedQueue<Throwable>()
        val writer = Thread {
            start.await()
            repeat(20) { try { first.checkpoint("A".repeat(MAX_SAVE_BYTES)) } catch (_: IllegalStateException) { } catch (error: Throwable) { errors.add(error) } }
        }
        val importer = Thread {
            start.await()
            try { second.beginImport("before") } catch (error: Throwable) { errors.add(error) }
        }
        writer.start(); importer.start(); start.countDown()
        writer.join(10000); importer.join(10000)
        assertFalse(writer.isAlive); assertFalse(importer.isAlive); assertTrue(errors.toString(), errors.isEmpty())
        assertEquals(CheckpointState("before", "before"), second.read())
    }

    @Test fun failedBootBlocksImportAndPreservesCorruptMetadataAndLocalSave() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val file = File(context.filesDir, "checkpoint.json")
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()")
            evaluate(scenario, "cancelTooltip(); game.options.menu.pauseGame.enabled=1; window.__saved=null; TrimpsMobile.saveNow().then(ok=>window.__saved=ok)")
            waitFor(scenario, "window.__saved===true")
            val saved = file.readBytes()
            val local = evaluate(scenario, "localStorage.getItem('trimpSave1')")
            try {
                file.writeText("broken metadata")
                scenario.recreate()
                waitFor(scenario, "typeof TrimpsMobile !== 'undefined' && !document.getElementById('mobile-recovery').hidden")
                evaluate(scenario, "window.__imported=null; TrimpsMobile.importSave(localStorage.getItem('trimpSave1')).then(ok=>window.__imported=ok)")
                waitFor(scenario, "window.__imported===false")
                assertEquals(local, evaluate(scenario, "localStorage.getItem('trimpSave1')"))
                assertEquals("broken metadata", file.readText())
                assertEquals("true", evaluate(scenario, "!TrimpsMobile.ready() && mobileRuntimeSuspended"))
                assertEquals("true", evaluate(scenario, "SaveValidation.validateSave(localStorage.getItem('trimpSave1')).compressed===localStorage.getItem('trimpSave1')"))
            } finally { file.writeBytes(saved) }
        }
    }
}
