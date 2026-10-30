// Read-only calculation snapshots; only stage() invokes the original temporary import.
var MobilePerkyAdapter = (() => {
    const fail=text=>{throw new Error(text);};
    function cost(perk,level){
        if(!Number.isSafeInteger(level)||level<0||level>perk.max)fail('Invalid level for '+perk.name+'.');
        if(!perk.additive&&level&&!Number.isFinite(perk.base*Math.pow(perk.growth,level-1)))fail('Perk cost is too large.');
        let value=0;
        if(perk.additive)value=((level-1)*level)/2*perk.increment+perk.base*level;
        else for(let i=0;i<level;i++)value+=Math.ceil(i/2+perk.base*Math.pow(perk.growth,i));
        if(!Number.isFinite(value))fail('Perk cost is too large.');return value;
    }
    function context(preset=''){
        const g=game.global,h=game.resources.helium;
        if(portalUniverse!==1||g.universe!==1)fail('Perky supports Universe 1 / Helium only.');
        if(document.getElementById('portalWrapper').style.display==='none'||usingRealTimeOffline)fail('Open Perks before using Perky.');
        if(g.viewingUpgrades&&g.challengeActive==='Hypothermia')fail('Perk changes are disabled during Hypothermia.');
        const perks=Object.entries(game.portal).filter(([,p])=>typeof p.level==='number').map(([name,p])=>({name,locked:p.locked!==false,level:p.level,current:p.level+p.levelTemp,spent:p.heliumSpent,tempSpent:p.heliumSpentTemp,base:p.priceBase,additive:!!p.additive,increment:p.additiveInc||0,growth:p.specialGrowth||1.3,max:p.max??Number.MAX_SAFE_INTEGER}));
        const available=h.respecMax-h.totalSpentTemp,currentCost=perks.reduce((sum,p)=>sum+cost(p,p.current),0);
        if(!Number.isFinite(available)||available<0||!Number.isFinite(currentCost+available))fail('The current perk budget is invalid.');
        const purchased=Object.fromEntries(Object.entries(game.talents).map(([n,p])=>[n,{purchased:!!p.purchased}]));
        const snapshot={
            global:Object.fromEntries(['world','highestLevelCleared','lastSpireCleared','spiresCompleted','fluffyExp','fluffyPrestige','challengeActive','heliumLeftover','canRespecPerks'].map(k=>[k,g[k]])),
            portal:Object.fromEntries(perks.map(p=>[p.name,{locked:p.locked,level:p.level,heliumSpent:p.spent}])),
            talents:purchased,unlocks:{imps:{...game.unlocks.imps}},resources:{trimps:{owned:game.resources.trimps.owned},helium:{owned:g.viewingUpgrades?0:h.owned}},
            generatorUpgrades:Object.fromEntries(Object.entries(game.generatorUpgrades).map(([n,p])=>[n,{upgrades:p.upgrades}])),
            permanentGeneratorUpgrades:Object.fromEntries(Object.entries(game.permanentGeneratorUpgrades).map(([n,p])=>[n,{owned:p.owned}])),
        };
        snapshot.global.StaffEquipped={mods:(g.StaffEquipped.mods||[]).map(m=>m.slice())};snapshot.global.ShieldEquipped={name:g.ShieldEquipped.name};
        const data={budget:currentCost+available,available,perks,canRespec:!!g.canRespecPerks,respecActive:!!g.respecActive,midRun:!!g.viewingUpgrades,preset,game:snapshot};
        // Only Trapper reads current population; only Spire overrides the target with the current world.
        // Keep the full calculation snapshot, but exclude unused ticking values from invalidation.
        const model={...snapshot,global:{...snapshot.global},resources:{...snapshot.resources}};
        if(preset!=='trapper')delete model.resources.trimps;
        if(preset!=='spire')delete model.global.world;
        if(game.portal.Capable.locked)delete model.global.fluffyExp;
        data.signature=JSON.stringify({...data,game:model});return data;
    }
    function preview(ctx,levels){
        if(!levels||typeof levels!=='object'||Array.isArray(levels))fail('The calculator returned an invalid plan.');
        if(Object.keys(levels).some(n=>!ctx.perks.some(p=>p.name===n)))fail('The calculator returned an unknown perk.');
        let total=0,respecRequired=false;const normalized={},rows=[];
        for(const p of ctx.perks){
            if(!p.locked&&!Object.hasOwn(levels,p.name))fail('The plan is missing '+p.name+'.');
            const level=levels[p.name]??p.current;
            if(p.locked&&level!==0)fail(p.name+' is locked.');
            if(!p.additive&&Math.abs(level-p.current)>1000)fail('The original import supports at most 1000 level changes per non-additive perk.');
            total+=cost(p,level);normalized[p.name]=level;
            if(level<p.level){respecRequired=true;if(!ctx.canRespec)fail('This plan needs a respec that is not available.');}
            if(!p.locked)rows.push({name:p.name,current:p.current,level,delta:level-p.current,cost:cost(p,level)});
        }
        if(rows.every(p=>p.level===0)&&rows.some(p=>p.current>0)&&!ctx.respecActive){respecRequired=true;if(!ctx.canRespec)fail('Clearing the pending allocation requires an available respec.');}
        if(total>ctx.budget)fail('This plan exceeds the available Helium.');
        return{signature:ctx.signature,preset:ctx.preset,levels:normalized,total,remaining:ctx.budget-total,budget:ctx.budget,respecRequired,rows};
    }
    function stage(plan){
        const fresh=context(plan.preset);if(fresh.signature!==plan.signature)fail('Your game or perk allocation changed. Calculate a new plan.');
        const checked=preview(fresh,plan.levels);
        let needed=0;
        for(const p of fresh.perks){if(p.locked)continue;const delta=checked.levels[p.name]-p.current;if(delta)needed+=(delta>0?1:-1)*getPortalUpgradePrice(p.name,delta<0,Math.abs(delta));}
        if(!Number.isFinite(needed)||needed>fresh.available)fail('The original game cannot afford this plan.');
        const saved={global:Object.fromEntries(['respecActive','removingPerks','buyAmt'].map(k=>[k,game.global[k]])),pool:{respecMax:game.resources.helium.respecMax,totalSpentTemp:game.resources.helium.totalSpentTemp},perks:Object.fromEntries(Object.entries(game.portal).map(([n,p])=>[n,{levelTemp:p.levelTemp,heliumSpentTemp:p.heliumSpentTemp}]))};
        let field=document.getElementById('perkImportBox'),created=false;
        if(!field){field=document.createElement('textarea');field.id='perkImportBox';field.hidden=true;document.body.append(field);created=true;}
        const previous=field.value;
        try{
            field.value=LZString.compressToBase64(JSON.stringify(checked.levels));
            if(checked.rows.every(p=>p.level===0)&&checked.respecRequired&&!game.global.respecActive)respecPerks();
            const error=importPerks();if(typeof error==='string')fail(error);
            if(fresh.perks.some(p=>!p.locked&&game.portal[p.name].level+game.portal[p.name].levelTemp!==checked.levels[p.name]))fail('The original game could not stage this plan.');
            return checked;
        }catch(error){
            Object.assign(game.global,saved.global);Object.assign(game.resources.helium,saved.pool);
            for(const [n,p] of Object.entries(saved.perks))Object.assign(game.portal[n],p);
            try{displayPortalUpgrades(true);MobilePortal.refresh();}catch(_){}
            throw error;
        }finally{if(created)field.remove();else field.value=previous;}
    }
    function calculate(ctx,inputs,signal){
        return new Promise((resolve,reject)=>{
            if(signal?.aborted){reject(new Error('Calculation cancelled.'));return;}
            let worker;try{worker=new Worker('mobile-perky-worker.js');}catch(_){reject(new Error('The local calculator could not start.'));return;}
            let done=false;
            const cancel=()=>finish('Calculation cancelled.');
            const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);worker.terminate();error?reject(new Error(error)):resolve(result);};
            const timer=setTimeout(()=>finish('Calculation timed out. Try a simpler set of limits.'),15000);
            signal?.addEventListener('abort',cancel,{once:true});
            worker.onmessage=e=>e.data?.ok===true&&e.data.result?finish(null,e.data.result):finish(typeof e.data?.error==='string'?e.data.error:'The calculator returned an invalid response.');
            worker.onerror=()=>finish('The local calculator could not start.');
            try{worker.postMessage({ctx,inputs});}catch(_){finish('The calculation inputs could not be copied.');}
        });
    }
    return{context,preview,stage,calculate,cost};
})();
