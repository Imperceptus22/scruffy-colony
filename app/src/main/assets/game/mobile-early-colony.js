// First-run help belongs to the save, so imports, slots and tutorial restarts cannot grant supplies twice.
var createMobileEarlyColony=win=>{
    const blank=()=>({enabled:false,reward:false,breeding:false,loss:false,hut:false,barn:false});
    const state=g=>g.global.mobileEarlyColony;
    const eligible=g=>state(g)?.enabled===true&&g.global.totalPortals===0&&(g.global.totalRadPortals||0)===0&&g.global.universe===1;
    const queued=g=>(g.global.buildingsQueue||[]).reduce((n,row)=>{const [name,count]=row.split('.');return n+(name==='Trap'?Number(count):0);},0);
    const built=g=>g.buildings.Trap.purchased-queued(g);
    const caught=g=>built(g)-g.buildings.Trap.owned;
    function start(g){
        if(g.global.world!==1||g.global.totalPortals!==0||(g.global.totalRadPortals||0)!==0||g.global.universe!==1||g.buildings.Trap.purchased!==0||g.resources.trimps.owned!==0)return false;
        g.global.mobileEarlyColony={...blank(),enabled:true};return true;
    }
    function reward(g){
        if(!eligible(g)||state(g).reward)return false;
        const wasFast=built(g)<10;
        g.buildings.Trap.purchased+=5;g.buildings.Trap.owned+=5;state(g).reward=true;
        // A queued Trap can move past ten when the finished gift arrives; preserve its completed fraction.
        if(wasFast&&built(g)>=10&&g.global.crafting==='Trap')g.global.timeLeftOnCraft*=2;
        return true;
    }
    const hints={
        breeding:{title:'Your colony can grow',text:'Five finished Traps help you get started. At least two free Scruffies breed while housing has room. Workers and soldiers cannot breed, so keep some Scruffies free in the colony.'},
        loss:{title:'Your first troop has fallen',text:'New troops need free Scruffies. Catch more, or let at least two free Scruffies breed while housing has room. AutoFight normally waits for full population; Fight can send an available troop sooner.'},
        hut:{title:'More room for your Scruffies',text:'Your colony is growing. Build a Hut to make room for more Scruffies. Once housing is full, the population cannot keep growing.'},
        barn:{title:'More room for your food',text:'Your food stores are filling up. Build a Barn to store more food. Once storage is full, extra food cannot be kept.'}
    };
    function nextHint(g){
        if(!eligible(g))return null;
        const s=state(g),conditions={breeding:s.reward,loss:(g.stats.battlesLost.value+g.stats.battlesLost.valueTotal)>0,hut:g.buildings.Hut.locked===0,barn:g.buildings.Barn.locked===0};
        return Object.keys(conditions).find(key=>conditions[key]&&!s[key])||null;
    }
    let carry=null,pending=false;
    const originalNewGame=win.newGame;win.newGame=function(){const g=originalNewGame.apply(this,arguments);g.global.mobileEarlyColony=carry?{...carry}:blank();return g;};
    win.game.global.mobileEarlyColony=blank();
    const originalReset=win.resetGame;win.resetGame=function(keepPortal){carry=keepPortal?state(win.game):null;try{return originalReset.apply(this,arguments);}finally{carry=null;}};
    const originalCraftTime=win.getCraftTime;win.getCraftTime=function(building){const time=originalCraftTime.apply(this,arguments);return eligible(win.game)&&building===win.game.buildings.Trap&&built(win.game)<10?time/2:time;};
    const originalTrap=win.trapThings;win.trapThings=function(){
        const trimps=win.game.resources.trimps,speed=trimps.speed;
        if(eligible(win.game)&&caught(win.game)<10)trimps.speed=speed/2;
        try{return originalTrap.apply(this,arguments);}finally{trimps.speed=speed;}
    };
    async function completeTutorial(){
        if(pending)return false;
        if(!eligible(win.game)||state(win.game).reward)return true;
        pending=true;
        try{return await win.TrimpsMobile.applySaveChange(reward,'Starter supplies');}finally{pending=false;}
    }
    function blocked(){
        const doc=win.document,tip=doc?.getElementById('tooltipDiv');
        return !win.TrimpsMobile?.ready()||win.TrimpsMobile.busy()||win.mobileRuntimeSuspended||win.usingRealTimeOffline||win.game.options.menu.pauseGame.enabled||win.MobileGuidedStart?.active()||win.game.global.tutorialOpen||!!doc?.getElementById('customNumberBox')||(tip&&win.getComputedStyle(tip).display!=='none');
    }
    async function refresh(){
        if(pending||blocked())return;
        const key=nextHint(win.game);if(!key)return;
        const id=win.game.global.uniqueId;pending=true;
        try{
            const ok=await win.TrimpsMobile.applySaveChange(g=>{if(!eligible(g)||state(g)[key])return false;state(g)[key]=true;return true;},'Colony tip');
            if(ok&&id===win.game.global.uniqueId){
                const tr=text=>win.MobileI18n?win.MobileI18n.t(text):text;
                win.TrimpsUI.infoText(tr(hints[key].title),tr(hints[key].text));
            }
        }finally{pending=false;}
    }
    return{start,eligible,reward,hints,nextHint,completeTutorial,refresh};
};
if(typeof module!=='undefined')module.exports={create:createMobileEarlyColony};
if(typeof window!=='undefined'&&window.document)window.MobileEarlyColony=createMobileEarlyColony(window);
