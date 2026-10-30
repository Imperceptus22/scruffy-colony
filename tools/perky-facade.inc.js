function calculate(ctx,options={}){
    game=ctx.game;jobless=game.global.ShieldEquipped.name==='Job';warnings=[];
    const preset=options.preset||'early',zone=Number(options.zone);
    if(!Object.hasOwn(presets,preset))throw Error('Unknown preset.');
    if(!Number.isInteger(zone)||zone<1||zone>999)throw Error('Target zone must be between 1 and 999.');
    fields={};for(const id of ['preset','zone','helium','fixed','unlocks','respec','weight-he','weight-atk','weight-hp','weight-xp','weight-trimps','dg','prod','loot','chronojest','breed-timer','whipimp','magnimp','tauntimp','venimp'])fields[id]={value:'0',checked:false};
    fields.respec.checked=ctx.midRun;
    fields.preset.value=preset;fields.zone.value=String(zone);select_preset(preset);read_save();
    fields.helium.value=String(ctx.budget);
    fields.unlocks.value=ctx.perks.filter(p=>!p.locked).map(p=>p.name+'>'+(!ctx.canRespec?p.level:0)).join(',');
    const fixed=String(options.fixed||'');if(fixed.length>2048||fixed.split(',').some(x=>x.trim()&&!/^\s*[a-z_][a-z_ 0-9]*\s*[<=>]=?[^,]*$/i.test(x)))throw Error('Use comma-separated limits, for example Power=20, Looting>10, Bait<5.');
    fields.fixed.value=fixed;
    const inputNames={helium:'weight-he',attack:'weight-atk',health:'weight-hp',xp:'weight-xp',trimps:'weight-trimps',prod:'prod',loot:'loot',chronojest:'chronojest',dg:'dg',breedTimer:'breed-timer'};
    for(const [name,id] of Object.entries(inputNames))if(options[name]!==undefined&&options[name]!==''){
        const n=Number(options[name]);if(!Number.isFinite(n)||n<0||n>1e100||(name==='breedTimer'&&n<1))throw Error('Invalid '+name+' value.');fields[id].value=String(n);
    }
    const params=parse_inputs();
    // Feat presets have their own caps; they cannot grant more than the actual budget.
    params.total_he=Math.min(params.total_he,ctx.budget);
    if(!Number.isFinite(params.total_he)||params.total_he<0||!Object.values(params.weight).some(n=>n>0))throw Error('Use at least one positive weight.');
    for(const p of ctx.perks){
        const perk=params.perks[p.name];if(!perk){if(!p.locked)throw Error('Unsupported perk: '+p.name);continue;}
        if(perk.base_cost!==p.base||perk.cost_increment!==p.increment||perk.cost_exponent!==p.growth)throw Error('Perky data differs from the current game: '+p.name);
        if(p.locked){if(!perk.locked)throw Error(p.name+' is locked.');continue;}
        perk.max_level=Math.min(perk.max_level,p.max);
        if(!p.additive){perk.min_level=Math.max(perk.min_level,p.current-1000);perk.max_level=Math.min(perk.max_level,p.current+1000);}
        if(!ctx.canRespec)perk.min_level=Math.max(perk.min_level,p.level);
        if(!Number.isSafeInteger(perk.min_level)||perk.min_level<0||!Number.isSafeInteger(perk.max_level)||perk.max_level<perk.min_level)throw Error('Invalid limits for '+p.name+'.');
    }
    const [remaining,result]=optimize(params),levels=Object.fromEntries(Object.entries(result).map(([name,p])=>[name,p.level]));
    for(const [name,p] of Object.entries(result))if(!Number.isSafeInteger(p.level)||p.level<p.min_level||p.level>p.max_level||(p.locked&&p.level!==0))throw Error('The calculator could not satisfy the limits for '+name+'.');
    if(!Number.isFinite(remaining))throw Error('The calculator could not produce a finite result.');
    return{levels,remaining,zone:params.zone,preset,warnings,weights:params.weight,inputs:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.value]))};
}
return{calculate,presets};
