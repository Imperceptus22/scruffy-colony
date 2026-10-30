// A paid app convenience lives in the original checkpoint, never in optional UI metadata.
var MobileEquipmentResearch=(()=>{
    const pieces=['Shield','Dagger','Boots','Mace','Helmet','Polearm','Pants','Battleaxe','Shoulderguards','Greatsword','Breastplate'];
    const progress=g=>pieces.filter(name=>g.equipment[name]&&!g.equipment[name].locked&&g.equipment[name].prestige>=2).length;
    const done=g=>g.global.mobileEquipmentOptimization===true;
    function complete(g){
        if(done(g)||progress(g)!==11||g.resources.science.owned<1000||g.resources.gems.owned<500)return false;
        g.resources.science.owned-=1000;g.resources.gems.owned-=500;g.global.mobileEquipmentOptimization=true;return true;
    }
    if(typeof document==='undefined')return{pieces,progress,done,complete};
    const originalNewGame=newGame;newGame=function(){const g=originalNewGame.apply(this,arguments);g.global.mobileEquipmentOptimization=false;return g;};
    game.global.mobileEquipmentOptimization=false;
    const originalReset=resetGame;resetGame=function(keepPortal){const purchased=done(game);const result=originalReset.apply(this,arguments);if(keepPortal&&purchased)game.global.mobileEquipmentOptimization=true;return result;};
    // V-260: the card's texts become German through the stage-2 catalog; the info title is drawn outside its scope.
    const tr=value=>typeof MobileI18nGame!=='undefined'?MobileI18nGame.t(value):value;
    let card=null,pending=false;
    const unlocked=()=>done(game)&&!pending;
    async function purchase(){
        if(pending||done(game)||progress(game)!==11)return false;
        pending=true;refresh();let ok=false;
        try{ok=await TrimpsMobile.applySaveChange(complete);return ok;}
        finally{pending=false;refresh();if(card)card.querySelector('[role="status"]').textContent=ok?'Research complete. Buy best is unlocked.':!TrimpsMobile.ready()?'Research result is unverified. Reload to recover the stored save.':'Research was not applied. Your previous save is preserved.';}
    }
    function refresh(){
        if(!card){card=document.createElement('div');card.id='mobile-equipment-research';card.className='mobile-purchase';card.innerHTML='<div class="mobile-item-meta"><strong class="thingName">Equipment Optimization</strong><span class="thingOwned">Owned: 0</span></div><button type="button" class="thing upgradeThing" aria-label="Research Equipment Optimization">Research</button><button type="button" class="mobile-info" aria-label="Info Equipment Optimization">Info</button><span class="mobile-price">Science 1.00K · Gems 500</span><p role="status"></p>';document.getElementById('upgradesHere').prepend(card);card.querySelector('.thing').onclick=purchase;card.querySelector('.mobile-info').onclick=()=>TrimpsUI.infoText(tr('Equipment Optimization'),tr('Unlock Buy best for weapons and armor. Each tap buys the current efficiency recommendation. All 11 early equipment pieces must reach prestige II. Costs 1,000 Science and 500 Gems once. Kept through portals.'));}
        if(!card.isConnected)document.getElementById('upgradesHere').prepend(card);
        card.hidden=done(game)||progress(game)!==11||game.global.buyTab!=='upgrades';
        const button=card.querySelector('.thing');button.disabled=pending||!TrimpsMobile.ready()||TrimpsMobile.busy()||game.options.menu.pauseGame.enabled||usingRealTimeOffline||game.resources.science.owned<1000||game.resources.gems.owned<500;
        button.classList.toggle('thingColorCanNotAfford',button.disabled);button.classList.toggle('thingColorCanAfford',!button.disabled);
        // V-260: the action word of every research button (German "Erforschen"), not the gathering verb "Research".
        button.textContent=pending?'Saving research…':MobileTexts.actions.upgrades;
        const controls=document.getElementById('mobile-buy-best');if(controls)controls.hidden=!unlocked()||document.getElementById('mobile-inventory-head')?.dataset.category!=='equipment';
    }
    return{pieces,progress,done,complete,unlocked,purchase,refresh};
})();
if(typeof module!=='undefined')module.exports=MobileEquipmentResearch;
