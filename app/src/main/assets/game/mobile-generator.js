// C: compact workbench. The original generator keeps all prices, purchases and simulation.
var MobileGenerator = (() => {
    const $=id=>document.getElementById(id), n=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
    let panel,body,view='generator',selected='',installed=false,owner,signature='';
    const available=()=>game.global.universe===1&&mutations.Magma.active();
    function button(text,action,cls=''){const b=n('button',cls,text);b.type='button';b.onclick=()=>{action();refresh();};return b;}
    function close(){if(panel)panel.hidden=true;owner=null;selected='';signature='';if(body)body.replaceChildren();}
    function back(){if(!panel||panel.hidden)return false;if(view==='upgrades'&&selected){selected='';signature='';refresh();return true;}if(view!=='generator')show('generator');else close();return true;}
    function help(){TrimpsUI.infoAction(()=>tooltip('Dimensional Generator','customText','update','<p>Housing per tick follows the original fuel, capacity and housing bonuses. Fuel and extra storage are separate.</p><p>'+game.permanentGeneratorUpgrades.Storage.description+'</p>'+game.permanentGeneratorUpgrades.Supervision.description+'<p>Upgrades persist through Portal and cannot be refunded. '+getMagmiteDecayAmt()+'% of unspent Magmite decays on Portal.</p>'),false);}
    function open(next='generator'){
        if(!available())return;
        if(!panel){
            panel=n('section','mobile-generator');panel.id='mobile-generator';panel.hidden=true;
            const header=n('header','mg-header');const backBtn=button('‹',back);backBtn.setAttribute('aria-label','Back');const title=n('h1');title.id='mg-title';const info=button('?',help);info.setAttribute('aria-label','Generator help');header.append(backBtn,title,info);
            const nav=n('nav','mg-nav');nav.setAttribute('aria-label','Generator views');for(const [key,label] of [['generator','Generator'],['upgrades','Upgrades'],['automation','Automation']]){const b=button(label,()=>show(key));b.dataset.view=key;nav.append(b);}
            const wallet=n('div','mg-wallet');wallet.id='mg-wallet';body=n('div','mg-body');panel.append(header,nav,wallet,body);document.body.append(panel);
        }
        cancelTooltip();owner=game;panel.hidden=false;selected='';installed=false;show(next);
    }
    function show(next){view=next;signature='';if(body)body.replaceChildren();refresh();if(body)body.scrollTop=0;}
    function limitBox(){
        const box=n('section','mg-limit');box.append(n('h2','','Fuel capacity limit'));
        const label=n('label');label.htmlFor='mg-limit';label.id='mg-limit-label';const range=n('input');range.id='mg-limit';range.type='range';range.min='1';range.max='100';range.step='1';range.value=game.global.supervisionSetting;
        range.oninput=()=>{if(!available()||!game.permanentGeneratorUpgrades.Supervision.owned)return;const original=$('generatorSlider');if(original){original.value=range.value;saveSupervisionSetting();refresh();}};
        box.append(label,range,n('p','mg-muted','1%–100% · Takes effect immediately.'));return box;
    }
    function renderGenerator(){
        body.replaceChildren();const status=n('p','mg-status');status.id='mg-status';
        const grid=n('div','mg-grid');for(const [id,label] of [['housing','Housing / tick'],['tick','Next tick']]){const cell=n('div');cell.append(n('small','',label));const value=n('strong');value.id='mg-'+id;cell.append(value);grid.append(cell);}
        for(const [id,label] of [['fuel','Fuel'],['storage','Extra storage']]){const cell=n('div','mg-reserve');cell.id='mg-'+id+'-row';const line=n('div');line.append(n('span','',label));const value=n('strong');value.id='mg-'+id;line.append(value);const bar=n('progress');bar.id='mg-'+id+'-bar';bar.max=1;bar.setAttribute('aria-label',label);cell.append(line,bar);grid.append(cell);}
        const modes=n('div','mg-modes');for(const [value,label] of [[1,'Gain Fuel'],[0,'Gain Mi'],[2,'Hybrid']]){const b=button(label,()=>{if(available())changeGeneratorState(value);});b.dataset.mode=value;modes.append(b);}
        body.append(status,grid,modes);const collection=n('p','mg-muted');collection.id='mg-collection';body.append(collection);
        if(game.permanentGeneratorUpgrades.Supervision.owned){const pause=button('',()=>pauseGenerator(),'mg-wide');pause.id='mg-pause';body.append(pause,limitBox(),button('Zone rules ›',()=>show('automation'),'mg-wide'));}
        else body.append(n('p','mg-muted','Supervision unlocks pause, fuel limits and zone rules.'));
        // V-196: the upgrades open through the Upgrades tab only; the second way at the end of this view is gone.
    }
    function upgradeRow(name,permanent){
        const u=permanent?game.permanentGeneratorUpgrades[name]:game.generatorUpgrades[name],cost=permanent?u.cost:u.cost(),owned=permanent&&u.owned;
        const row=n('article','mg-upgrade');row.dataset.upgrade=name;const b=button('',()=>{selected=selected===name?'':name;signature='';});b.className='mg-upgrade-toggle';b.setAttribute('aria-expanded',String(selected===name));
        b.append(n('strong','',name),n('span','',permanent?(owned?'Installed':''):String(u.upgrades)),n('strong','',owned?'✓':prettify(cost)+' Mi'),n('span','','›'));row.append(b);
        if(selected===name){
            row.classList.add('is-open');const detail=n('div','mg-upgrade-detail');
            if(!permanent&&u.nextModifier){detail.append(n('small','',name==='Capacity'?'Fuel capacity before limit':name==='Supply'?'Fuel per cell':'Overclock penalty'));const change=n('p','mg-change');change.textContent=name==='Overclocker'?(u.modifier*100).toFixed(2)+'% → '+(u.nextModifier()*100).toFixed(2)+'%':prettify(u.modifier)+' → '+prettify(u.nextModifier());detail.append(change);}
            const description=n('div','mg-description');description.innerHTML=permanent?u.description:u.description();detail.append(description);
            if(!owned){
                const requires=name==='Overclocker'&&(!game.permanentGeneratorUpgrades.Hybridization.owned||!game.permanentGeneratorUpgrades.Storage.owned);
                const balance=n('p','mg-balance');balance.textContent=(permanent?'One-time upgrade. ':'Level '+u.upgrades+' → '+(u.upgrades+1)+'. ')+(cost>game.global.magmite?'Missing '+prettify(cost-game.global.magmite)+' Mi.':prettify(game.global.magmite-cost)+' Mi left after purchase.');detail.append(balance);
                if(requires)detail.append(n('p','mg-required','Requires Hybridization and Storage.'));
                const buy=button('Buy '+name+' · '+prettify(cost)+' Mi',()=>{if(!available())return;buyGeneratorUpgrade(name);signature='';if(permanent&&u.owned)installed=true;},'mg-primary');buy.dataset.buy=name;buy.disabled=requires||cost>game.global.magmite;detail.append(buy);
            }else detail.append(n('p','','Installed · no further purchase.'));
            row.append(detail);
        }
        return row;
    }
    function renderUpgrades(){
        body.replaceChildren(n('h2','','Multi upgrades'));
        for(const name of Object.keys(game.generatorUpgrades))body.append(upgradeRow(name,false));
        body.append(n('h2','','One-time upgrades'));
        for(const [name,u] of Object.entries(game.permanentGeneratorUpgrades))if(!u.owned)body.append(upgradeRow(name,true));
        const names=Object.keys(game.permanentGeneratorUpgrades).filter(name=>game.permanentGeneratorUpgrades[name].owned);
        if(names.length){const toggle=button('✓ '+names.length+' installed · '+(installed?'Hide':'Show'),()=>{installed=!installed;signature='';},'mg-installed');toggle.setAttribute('aria-expanded',String(installed));body.append(toggle);if(installed)for(const name of names)body.append(upgradeRow(name,true));}
        const warning=n('p','mg-warning');warning.textContent='Upgrades survive Portal. No refunds. '+getMagmiteDecayAmt()+'% of unspent Mi decays on Portal.';body.append(warning);
    }
    function renderAutomation(){
        body.replaceChildren();if(!game.permanentGeneratorUpgrades.Supervision.owned){body.append(n('p','','Supervision is required for generator automation.'),button('View Supervision upgrade',()=>{show('upgrades');selected='Supervision';signature='';}));return;}
        body.append(n('h2','','Starting mode & two zone rules'));
        const form=n('div','mg-automation');form.id='genStateConfigTooltip';form.innerHTML=getGenStateConfigTooltip();body.append(form);
        const error=n('p','mg-error');error.id='genStateConfigError';error.setAttribute('role','status');body.append(error,n('p','mg-muted','Use 0 to disable a rule, or zone 231 and above. Starting mode changes immediately.'));
        body.append(limitBox(),n('p','mg-warning','Lowering the limit keeps stored fuel. The next overclock consumes excess fuel.'));
        body.append(button('Save zone rules',()=>{error.textContent='';saveGenStateConfig();if(!error.textContent)error.textContent='Zone rules saved.';labelRules();},'mg-primary mg-wide'));labelRules();
    }
    function refreshUpgradeValues(){
        const row=body.querySelector('.mg-upgrade.is-open');if(!row)return;
        const name=row.dataset.upgrade,permanent=!!game.permanentGeneratorUpgrades[name],u=permanent?game.permanentGeneratorUpgrades[name]:game.generatorUpgrades[name],cost=permanent?u.cost:u.cost();
        const description=row.querySelector('.mg-description'),html=permanent?u.description:u.description();if(description.innerHTML!==html)description.innerHTML=html;
        const buy=row.querySelector('[data-buy]');if(!buy)return;
        buy.disabled=cost>game.global.magmite||(name==='Overclocker'&&(!game.permanentGeneratorUpgrades.Hybridization.owned||!game.permanentGeneratorUpgrades.Storage.owned));
        row.querySelector('.mg-balance').textContent=(permanent?'One-time upgrade. ':'Level '+u.upgrades+' → '+(u.upgrades+1)+'. ')+(cost>game.global.magmite?'Missing '+prettify(cost-game.global.magmite)+' Mi.':prettify(game.global.magmite-cost)+' Mi left after purchase.');
    }
    function labelRules(){for(let i=0;i<2;i++){const input=$('genStateConfigInput'+i),mode=$('genStateConfigScroll'+i);if(input)input.setAttribute('aria-label','Zone rule '+(i+1));if(mode)mode.setAttribute('aria-label','Mode for zone rule '+(i+1));}}
    function refresh(){
        const original=$('generatorWindow');
        if(original){original.classList.add('mobile-generator-entry');let entry=original.querySelector('.mg-entry');if(!entry){entry=button('Dimensional Generator ›',()=>open(),'mg-entry');original.append(entry);}entry.hidden=!available();}
        if(!panel||panel.hidden)return;
        if(!available()||owner!==game){close();return;}
        const banner=document.querySelector('.mobile-development-banner');panel.style.setProperty('--mg-top',(banner?banner.getBoundingClientRect().height:0)+'px');
        $('mg-title').textContent={generator:'Dimensional Generator',upgrades:'Generator upgrades',automation:'Generator automation'}[view];
        panel.querySelectorAll('.mg-nav button').forEach(b=>{b.setAttribute('aria-current',b.dataset.view===view?'page':'false');b.hidden=b.dataset.view==='automation'&&!game.permanentGeneratorUpgrades.Supervision.owned;});
        $('mg-wallet').textContent='Available Magmite  '+prettify(game.global.magmite)+' Mi';$('mg-wallet').hidden=view!=='upgrades';
        // Keep draft zone inputs and a dragged slider intact during normal live refreshes.
        const key=JSON.stringify([view,selected,installed,Object.entries(game.generatorUpgrades).map(([k,u])=>[k,u.upgrades]),Object.entries(game.permanentGeneratorUpgrades).map(([k,u])=>[k,u.owned])]);
        if(key!==signature){signature=key;if(view==='generator')renderGenerator();else if(view==='upgrades')renderUpgrades();else renderAutomation();}
        const range=$('mg-limit');if(range){if(document.activeElement!==range)range.value=game.global.supervisionSetting;$('mg-limit-label').textContent=game.global.supervisionSetting+'% · '+prettify(getGeneratorFuelCap())+' fuel';}
        if(view==='upgrades')refreshUpgradeValues();
        if(view!=='generator')return;
        const cap=getGeneratorFuelCap(),fuel=game.global.magmaFuel,storage=game.permanentGeneratorUpgrades.Storage.owned;
        $('mg-housing').textContent=prettify(scaleNumberForBonusHousing(getGeneratorTickAmount()));
        $('mg-tick').textContent=game.global.genPaused?'Paused':fuel<getFuelBurnRate()?'Needs fuel':($('generatorNextTick')?.textContent||'0')+'s';
        $('mg-fuel').textContent=prettify(storage?Math.min(fuel,cap):fuel)+' / '+prettify(cap);$('mg-fuel-bar').value=Math.min(1,fuel/cap);
        $('mg-storage-row').hidden=!storage;$('mg-storage').textContent=prettify(Math.max(0,fuel-cap))+' / '+prettify(getGeneratorFuelCap(true)-cap);$('mg-storage-bar').value=storage?Math.min(1,Math.max(0,fuel-cap)/cap):0;
        const mode=game.global.generatorMode,eradicated=challengeActive('Eradicated');
        const collecting=original?.classList.contains('generatorStateActive')||original?.classList.contains('generatorStateHybridActive')?'Fuel':'Mi';
        $('mg-status').textContent=(game.global.genPaused?'Paused':'Running')+' · '+(['Gain Mi','Gain Fuel','Hybrid'][mode]||'')+' · Zone '+game.global.world;
        $('mg-collection').textContent='Collecting '+collecting+(eradicated?' · Eradicated forces Gain Fuel.':'');
        panel.querySelectorAll('[data-mode]').forEach(b=>{const value=Number(b.dataset.mode);b.hidden=value===2&&!game.permanentGeneratorUpgrades.Hybridization.owned;b.disabled=eradicated&&value!==1;b.setAttribute('aria-pressed',String(value===mode));});
        if($('mg-pause'))$('mg-pause').textContent=game.global.genPaused?'Resume generator':'Pause generator';
    }
    const updateOriginal=updateGeneratorInfo;updateGeneratorInfo=function(...args){const result=updateOriginal.apply(this,args);refresh();return result;};
    const tooltipOriginal=tooltip;tooltip=function(what,...args){if(available()&&(what==='Upgrade Generator'||what==='Configure Generator State')){open(what==='Upgrade Generator'?'upgrades':'automation');return;}return tooltipOriginal.call(this,what,...args);};
    return {open,close,show,back,refresh};
})();
