// App research is saved with the game, using the existing atomic save transaction.
var MobilePerkResearch=(()=>{
    const progress=g=>Number.isSafeInteger(g.global.mobileCompletedPortals)&&g.global.mobileCompletedPortals>=0?g.global.mobileCompletedPortals:(g.global.totalPortals||0)+(g.global.totalRadPortals||0);
    const done=g=>g.global.mobilePerkOptimization===true;
    function complete(g){
        if(done(g)||progress(g)<4||g.resources.science.owned<1000||g.resources.gems.owned<500)return false;
        g.resources.science.owned-=1000;g.resources.gems.owned-=500;
        g.global.mobileCompletedPortals=progress(g);g.global.mobilePerkOptimization=true;return true;
    }
    if(typeof document==='undefined')return{progress,done,complete};
    let carry=null,portalCount=null;
    const originalNewGame=newGame;newGame=function(){const g=originalNewGame.apply(this,arguments);g.global.mobilePerkOptimization=carry?.purchased||false;g.global.mobileCompletedPortals=carry?.count??-1;return g;};
    game.global.mobilePerkOptimization=false;game.global.mobileCompletedPortals=-1;
    // Legacy counters include bone portals. Preserve that baseline once; only activatePortal advances it from now on.
    const originalBoost=boostHe;boostHe=function(checkOnly){if(!checkOnly)game.global.mobileCompletedPortals=progress(game);return originalBoost.apply(this,arguments);};
    const originalActivate=activatePortal;activatePortal=function(){portalCount=progress(game);try{return originalActivate.apply(this,arguments);}finally{portalCount=null;}};
    const originalReset=resetGame;resetGame=function(keepPortal){
        carry=keepPortal?{purchased:done(game),count:portalCount===null?progress(game):portalCount+1}:null;
        try{return originalReset.apply(this,arguments);}finally{carry=null;}
    };
    const tr=value=>typeof MobileI18nGame!=='undefined'?MobileI18nGame.t(value):value;
    let card=null,pending=false,result='';
    const unlocked=()=>done(game)&&!pending;
    async function purchase(){
        if(pending||done(game)||progress(game)<4)return false;
        pending=true;result='';refresh();let ok=false;
        try{ok=await TrimpsMobile.applySaveChange(complete);return ok;}
        finally{pending=false;result=ok?'Research complete. Perk Optimization is unlocked.':!TrimpsMobile.ready()?'Research result is unverified. Reload to recover the stored save.':'Research was not applied. Your previous save is preserved.';refresh();}
    }
    function refresh(){
        if(!card){
            card=document.createElement('div');card.id='mobile-perk-research';card.className='mobile-purchase';
            card.innerHTML='<div class="mobile-item-meta"><strong class="thingName"></strong><span class="thingOwned"></span></div><button type="button" class="thing upgradeThing"></button><button type="button" class="mobile-info">Info</button><span class="mobile-price"></span><p role="status"></p>';
            card.querySelector('.thing').onclick=purchase;
            card.querySelector('.mobile-info').onclick=()=>TrimpsUI.infoText(tr('Perk Optimization'),tr('Plan your next perk allocation using a target zone and play style. Review the suggestion before applying it. Requires four completed portal runs. Costs 1,000 Science and 500 Gems once. Kept through portals.'));
        }
        if(!card.isConnected)document.getElementById('upgradesHere').prepend(card);
        card.hidden=done(game)||progress(game)<4||game.global.buyTab!=='upgrades';
        card.querySelector('.thingName').textContent=tr('Perk Optimization');card.querySelector('.thingOwned').textContent=tr('Owned: 0');
        card.querySelector('.mobile-price').textContent=tr('Science 1.00K · Gems 500');
        card.querySelector('.mobile-info').setAttribute('aria-label',tr('Info Perk Optimization'));
        const button=card.querySelector('.thing');button.disabled=pending||!TrimpsMobile.ready()||TrimpsMobile.busy()||game.options.menu.pauseGame.enabled||usingRealTimeOffline||game.resources.science.owned<1000||game.resources.gems.owned<500;
        button.classList.toggle('thingColorCanNotAfford',button.disabled);button.classList.toggle('thingColorCanAfford',!button.disabled);
        button.textContent=tr(pending?'Saving research…':MobileTexts.actions.upgrades);button.setAttribute('aria-label',tr('Research Perk Optimization'));
        card.querySelector('[role="status"]').textContent=tr(result);
    }
    return{progress,done,complete,unlocked,purchase,refresh};
})();
if(typeof module!=='undefined')module.exports=MobilePerkResearch;
