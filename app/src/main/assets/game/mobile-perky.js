// Approved B: a full-screen planning workbench, then the original confirmation.
// V-243 step 4i: own labels and messages pass through the stage 1 catalog (tr); perk names and numbers never do.
var MobilePerky = (() => {
    const tr=value=>typeof MobileI18n==='undefined'?value:MobileI18n.t(value);
    const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const labels={early:'Early game · z1–59',broken:'Broken planet · z60–99',mid:'Mid game · z100–180',corruption:'Corruption · z181–229',magma:'Magma · z230–280',z280:'z280–400',z400:'z400–450',z450:'z450+',spire:'Spire respec',nerfed:'Nerfed feat',tent:'Tent City feat',scientist:'Scientist challenge',carp:'Trapper² · initial',trapper:'Trapper² · respec',coord:'Coordinate²',trimp:'Trimp²',metal:'Metal²',c2:'Other challenge²',income:'Income',unesscented:'Unesscented',nerfeder:'Nerfeder'};
    let root,body,footer,title,status,entry,phase='setup',ctx,plan,answer,values={},controls={},generation=0,busy=false,controller=null,nextHome=null;
    const unlocked=()=>typeof MobilePerkResearch!=='undefined'&&MobilePerkResearch.unlocked()===true;
    const number=n=>{const s=el('span');s.innerHTML=prettify(n);return s.textContent;};
    const button=(text,action,id)=>{const b=el('button','',text);b.type='button';b.onclick=action;if(id)b.id=id;return b;};
    function message(text){status.textContent=tr(text);status.hidden=!text;}
    function stop(){generation++;busy=false;controller?.abort();controller=null;}
    function restoreNext(){if(nextHome){nextHome.append($('mobile-portal-step-next'));nextHome=null;}}
    function close(){if(!root||root.hidden)return;stop();restoreNext();root.hidden=true;delete $('portalWrapper').dataset.perkyOpen;if($('portalWrapper').style.display!=='none'&&!entry.disabled)entry.focus({preventScroll:true});}
    function back(){if(root.hidden)return false;if(phase==='review'){phase='setup';render();}else close();return true;}
    function input(name,label,value,host,type='number'){
        const wrap=el('label','pk-field',tr(label)),field=el(type==='textarea'?'textarea':'input');field.id='pk-'+name;
        if(type!=='textarea'){field.type=type;if(type==='number'){field.min='0';field.step='any';field.inputMode='decimal';}}
        field.value=value??'';field.oninput=()=>{values[name]=field.value;plan=null;stop();if($('pk-calculate'))$('pk-calculate').disabled=false;const weight=root.querySelector('[data-weight="'+name+'"] strong');if(weight)weight.textContent=field.value;message('');};wrap.append(field);host.append(wrap);controls[name]=field;return field;
    }
    function open(){
        if(!unlocked())return;
        try{ctx=MobilePerkyAdapter.context();}catch(error){TrimpsUI.infoText('Perky',tr(error.message||'Perky is unavailable in this context.'));return;}
        stop();phase='setup';plan=null;answer=null;
        const zone=Math.max(20,Math.min(999,ctx.game.global.highestLevelCleared+1));
        const preset=zone<60?'early':zone<100?'broken':zone<181?'mid':zone<230?'corruption':zone<280?'magma':zone<400?'z280':zone<450?'z400':'z450';
        values={zone:String(zone),preset,fixed:''};presetWeights();root.hidden=false;$('portalWrapper').dataset.perkyOpen='true';render();
    }
    function presetWeights(){const w=PerkyCore.presets[values.preset];[values.helium,values.attack,values.health]=w.map(String);values.xp=String(Math.floor(w.reduce((sum,n)=>sum+Number(n),0)/5));values.trimps='0';}
    function render(){
        restoreNext();controls={};body.replaceChildren();footer.replaceChildren();message('');root.dataset.phase=phase;
        title.textContent=tr(phase==='setup'?'Optimize perks':phase==='review'?'Review plan':'Plan ready to confirm');
        const budget=el('div','pk-budget');budget.append(el('span','',tr('Universe 1 · Helium')),el('strong','',number(ctx.budget)+' '+tr('budget')));body.append(budget);
        if(phase==='setup')setupForm();else review();
        refresh();body.scrollTop=0;$('pk-back').focus({preventScroll:true});
    }
    function setupForm(){
        const hero=el('section','pk-goal');hero.append(el('h2','',tr('Your next run')),el('p','',tr('A suggested allocation for your chosen goal.')));
        const target=el('div','pk-target'),targetInput=input('zone','Target zone',values.zone,target);targetInput.min='1';targetInput.max='999';targetInput.step='1';
        const steps=el('div','pk-stepper');targetInput.before(steps);steps.append(button('−',()=>{targetInput.value=String(Math.max(1,Number(targetInput.value)-1));targetInput.dispatchEvent(new Event('input',{bubbles:true}));}),targetInput,button('+',()=>{targetInput.value=String(Math.min(999,Number(targetInput.value)+1));targetInput.dispatchEvent(new Event('input',{bubbles:true}));}));
        hero.append(target);const label=el('label','pk-field','Preset'),select=el('select');select.id='pk-preset';
        for(const key of Object.keys(PerkyCore.presets)){const option=el('option','',tr(labels[key]||key));option.value=key;
            option.disabled=(key==='trapper'&&ctx.game.global.challengeActive!=='Trapper')||(['carp','trapper','coord','trimp','metal','c2'].includes(key)&&ctx.game.global.highestLevelCleared<64)||(key==='spire'&&ctx.game.global.highestLevelCleared<199);select.append(option);}
        select.value=values.preset;select.onchange=()=>{stop();values.preset=select.value;presetWeights();render();};label.append(select);hero.append(label);
        const weights=el('div','pk-weights');for(const [key,name] of [['helium','Helium'],['attack','Attack'],['health','Health'],['xp','Fluffy']]){const item=el('div');item.dataset.weight=key;item.append(el('span','',name),el('strong','',values[key]));weights.append(item);}hero.append(weights);
        const detail=el('details','pk-detail');detail.id='pk-details';detail.append(el('summary','',tr('Weights & fixed perks')));
        const grid=el('div','pk-input-grid');for(const [key,name] of [['helium','Helium weight'],['attack','Attack weight'],['health','Health weight'],['xp','Fluffy weight'],['trimps','Population weight']])input(key,name,values[key],grid);
        detail.append(grid);input('fixed','Fixed levels / minimums / maximums',values.fixed,detail,'textarea').placeholder='Power=20, Looting>10, Bait<5';
        detail.append(el('p','pk-help',tr('Use = for a fixed level, > for a minimum and < for a maximum. Locked perks stay locked.')));
        const advanced=el('details','pk-detail');advanced.append(el('summary','',tr('Income & breeding details')),el('p','pk-help',tr('Blank fields use the current save: staff, generator, masteries and Rare Kin.')));
        const mods=el('div','pk-input-grid');for(const [key,name] of [['prod','Production multiplier'],['loot','Loot multiplier'],['chronojest','Chrono / Jest income'],['dg','Generator housing'],['breedTimer','Breeding timer (seconds)']])input(key,name,values[key],mods).placeholder=tr('Auto from save');advanced.append(mods);detail.append(advanced);hero.append(el('p','pk-loaded',tr('Current game data loaded')));body.append(hero,detail);
        const mode=el('div','pk-mode');mode.append(el('strong','',tr('Calculation mode')),el('p','',tr(ctx.midRun?'Mid-run budget · current-run Helium is excluded.':'Portal budget · includes this run’s available Helium.')),el('p','',tr(ctx.canRespec?'Respec available · decreases may be suggested.':'No respec available · committed levels are protected.')));body.append(mode);
        const calculate=button(tr('Calculate plan'),calculatePlan,'pk-calculate');calculate.className='pk-primary';footer.append(calculate,el('p','pk-help',tr('Preview only. Your perks stay unchanged.')));
    }
    async function calculatePlan(){
        if(busy)return;for(const [key,field] of Object.entries(controls))values[key]=field.value;
        const id=++generation;busy=true;$('pk-calculate').disabled=true;message('Calculating locally…');
        try{
            ctx=MobilePerkyAdapter.context(values.preset);controller=new AbortController();const result=await MobilePerkyAdapter.calculate(ctx,{...values},controller.signal);
            if(id!==generation||root.hidden)return;
            if(ctx.signature!==MobilePerkyAdapter.context(values.preset).signature)throw Error('Your game changed. Calculate a new plan.');
            plan=MobilePerkyAdapter.preview(ctx,result.levels);answer=result;phase='review';render();
        }catch(error){if(id===generation)message(error.message||String(error));}
        finally{if(id===generation){busy=false;if($('pk-calculate'))$('pk-calculate').disabled=false;}}
    }
    function table(rows){
        const t=el('table','pk-table'),head=el('thead'),headRow=el('tr');for(const name of ['Perk','Now','Plan','Δ'])headRow.append(el('th','',tr(name)));head.append(headRow);t.append(head);const body=el('tbody');
        for(const row of rows){const line=el('tr');line.dataset.perk=row.name;for(const [index,text] of [row.name.replaceAll('_',' '),number(row.current),number(row.level),(row.delta>0?'+':'')+number(row.delta)].entries()){const cell=el('td',index===3?(row.delta<0?'pk-decrease':'pk-increase'):'',text);line.append(cell);}body.append(line);}t.append(body);return t;
    }
    function review(){
        const summary=el('section','pk-summary');summary.append(el('h2','',tr(labels[answer.preset]||answer.preset)),el('p','',tr('Target zone '+answer.zone)));
        const facts=el('div','pk-facts');for(const [label,value] of [['Planned allocation',plan.total],['Remaining',plan.remaining]]){const n=el('div');n.append(el('span','',tr(label)),el('strong','',number(value)+' He'));facts.append(n);}summary.append(facts);body.append(summary);
        if(phase==='staged')summary.append(el('p','pk-loaded',tr('Your suggested changes are staged. Nothing is committed yet.')));
        const allocation=el('section','pk-allocation');allocation.append(el('h2','',tr(phase==='staged'?'Pending changes':'Suggested changes')));body.append(allocation);
        const changed=plan.rows.filter(row=>row.delta!==0);if(changed.length)allocation.append(table(changed));else allocation.append(el('p','',tr('No level changes are needed.')));
        if(plan.respecRequired)body.append(el('p','pk-warning',tr('Respec required. Committed levels decrease; the original confirmation will use your available respec.')));
        for(const warning of answer.warnings)body.append(el('p','pk-warning',tr(warning)));
        const all=el('details','pk-detail');all.append(el('summary','',tr('All perks & allocation details')),el('p','pk-help',tr('Effective weights · Helium '+answer.weights.helium+' · Attack '+answer.weights.attack+' · Health '+answer.weights.health+' · Fluffy '+answer.weights.xp)),table(plan.rows));allocation.append(all);
        if(phase==='review'){
            const use=button(tr('Use this plan'),()=>{try{MobilePerkyAdapter.stage(plan);phase='staged';render();}catch(error){message(error.message||String(error));}},'pk-use');use.className='pk-primary';footer.append(use,el('p','pk-help',tr('Stages changes in Perks. The original confirmation is still required.')));
        }else{
            if(ctx.midRun){const confirm=button(tr('Confirm perk changes'),()=>{close();$('activatePortalBtn').click();},'pk-confirm');confirm.className='pk-primary';footer.append(confirm);}
            else {const next=$('mobile-portal-step-next');nextHome=next.parentNode;footer.append(next);}
            footer.append(button(tr('Discard changes'),()=>{close();cancelPortal();},'pk-discard'),el('p','pk-help',tr('Uses the existing game confirmation.')));
        }
    }
    function refresh(){
        if($('portalWrapper').style.display==='none'||!unlocked()){if(!root.hidden)close();entry.hidden=!unlocked();entry.disabled=true;return;}
        // Keep the new surface's header reachable beneath the development banner.
        if(!root.hidden){const top=(document.querySelector('.mobile-development-banner:not([hidden])')?.getBoundingClientRect().height||0)+'px';if(root.style.paddingTop!==top)root.style.paddingTop=top;}
        const supported=portalUniverse===1&&game.global.universe===1,hypothermia=game.global.viewingUpgrades&&game.global.challengeActive==='Hypothermia';
        entry.hidden=false;entry.disabled=!supported||hypothermia||usingRealTimeOffline;
        if(entry.disabled&&!root.hidden)close();
        const label=tr(!supported?'Optimize perks · Helium only':hypothermia?'Optimize perks · unavailable in Hypothermia':usingRealTimeOffline?'Optimize perks · wait for offline progress':'Optimize perks');if(entry.textContent!==label)entry.textContent=label;
    }
    function setup(){
        entry=button(tr('Optimize perks'),open,'mobile-perky-entry');entry.hidden=!unlocked();$('mobile-portal-perk-balance').before(entry);
        root=el('section','');root.id='mobile-perky';root.hidden=true;root.setAttribute('aria-label',tr('Perky perk optimizer'));
        const header=el('header','pk-header');title=el('h1','',tr('Optimize perks'));const nav=el('div','pk-nav');nav.append(button(tr('Back'),back,'pk-back'),button(tr('Close'),close,'pk-close'));header.append(nav,title);
        body=el('div','pk-body');status=el('p','pk-status');status.id='pk-status';status.setAttribute('role','status');status.hidden=true;footer=el('footer','pk-footer');root.append(header,body,status,footer);$('portalWrapper').append(root);
    }
    setup();return{open,close,back,refresh};
})();
