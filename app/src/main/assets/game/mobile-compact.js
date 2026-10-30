// Additional presentation for the user-selected compact B2 surfaces.
var MobileCompact = (() => {
    const byId=id=>document.getElementById(id);
    const labels={showSRInfo:'Screen reader hints',autoSave:'Autosave',saveAndExit:'Save and exit',richPresence:'Rich Presence',standardNotation:'Number format',queueAnimation:'Build animation',barOutlines:'Bar outlines',menuFormatting:'Menu formatting',formatPerkLevels:'Perk level format',smallPerks:'Perk button size',progressBars:'Progress bars',generatorAnimation:'Generator animation',confirmhole:'Confirm Wormhole',equipHighlight:'Highlight equipment',lockOnUnlock:'New unlocks',achievementPopups:'Achievement popups',mapLoot:'Prioritize map loot',repeatUntil:'Repeat maps',exitTo:'Exit maps',repeatVoids:'Repeat Void Maps',boneAlerts:'Confirm Bone purchases',showAlerts:'Alerts',showFullBreed:'Breeding time',fadeIns:'Fade in',romanNumerals:'Roman numerals',extraStats:'Map statistics',useAverages:'Average values',voidPopups:'Heirloom popups',portalChallenge:'Confirm Portal Challenge',detailedPerks:'Detailed Perk info',alwaysAbandon:'Travel behavior',extraMapBtns:'Extra map controls',GeneticistassistTarget:'Geneticistassist target',liquification:'Liquification',overkillColor:'Overkill colors',forceQueue:'Build queue',mapsOnSpire:'Maps at Spires',mapAtZone:'Maps at Zone',timestamps:'Timestamps',gaFire:'Geneticistassist firing',masteryTab:'Mastery info',bigPopups:'Large popups',generatorStart:'Generator start mode',showSnow:'Snow effect',showHoliday:'Seasonal enemies',geneSend:'Geneticist deployment',fireForJobs:'Fire for jobs',ctrlGigas:'Gigastation controls',showHeirloomAnimations:'Heirloom animations',climbBw:'Continue Bionic Wonderland',offlineProgress:'Offline progress',archAutomator:'Archaeology automation',hideCompleteAchieves:'Completed achievements',sealedSpire:'Spire display',sealedAutoBattle:'Spire Assault display',saveOnPause:'Save on pause',pauseGame:'Pause game',disablePause:'Allow pausing',deleteSave:'Delete save'};
    // See docs/EINSTELLUNGEN.md: no working mobile effect (PlayFab) or overridden by the mobile layout/info flow.
    const removedSettings=new Set(['usePlayFab','tooltips','tooltipPosition','darkTheme','tinyButtons','hotkeys']);
    // V-273: an empty label means the button's own (translated) text already names it and its state (Repeat On, Wiederholen an).
    function iconize(node,icon,label){
        if(!node)return;node.dataset.compactIcon=icon;node.style.setProperty('--compact-icon','var(--mi-'+icon+')');
        const sync=()=>{const text=node.textContent.trim();node.setAttribute('aria-label',label?label+(text&&text!==label?' · '+text:''):text);node.title=node.getAttribute('aria-label');const toggles={pauseFight:!game.global.pauseFight,autoTrapBtn:game.global.trapBuildToggled,buildingsCollectBtn:game.global.playerGathering==='buildings',repeatBtn:game.global.repeatMap};if(Object.hasOwn(toggles,node.id))node.setAttribute('aria-pressed',String(!!toggles[node.id]));};
        node.setAttribute('role','button');node.tabIndex=0;sync();new MutationObserver(sync).observe(node,{childList:true,subtree:true,characterData:true});
    }
    function compactCombat(){
        for(const [id,icon,label] of [['fightBtn','battle','Fight'],['pauseFight','battle','AutoFight'],['mapsBtnText','maps','Map chamber'],['repeatBtn','repeat',''],['boneBtnMain','bones','Bone Trader'],['portalBtn','portal','Portal'],['heirloomsBtn','heirloom','Heirlooms'],['finishDailyBtn','check','Finish Daily'],['exitSpireBtn','back','Exit Spire'],['lootBdBtn','bones','Loot']])iconize(byId(id),icon,label);
        iconize(document.querySelector('.mobile-map-settings'),'settings','Map settings');
        byId('fightInfo').remove();
    }
    function compactQueue(){
        const container=byId('queueContainer'),head=document.createElement('div'),meta=document.createElement('div');
        head.className='mobile-queue-head';meta.className='mobile-queue-meta';
        const open=document.createElement('button');open.id='mobile-queue-open';open.setAttribute('aria-expanded','false');open.setAttribute('aria-controls','buildingsQueue');open.setAttribute('aria-label','Show or hide build queue');
        const oldTitle=byId('mobile-queue-title'),title=document.createElement('span');title.id=oldTitle.id;title.textContent=oldTitle.textContent;oldTitle.remove();
        meta.append(byId('foremenCount'),byId('buildSpeed'));open.append(title,byId('mobile-queue-summary'),meta);
        const list=byId('buildingsQueue');list.hidden=true;open.onclick=()=>{list.hidden=!list.hidden;open.setAttribute('aria-expanded',String(!list.hidden));TrimpsColony.refresh();};
        const actions=byId('queueRow'),auto=byId('autoTrapBtn'),build=byId('buildingsCollectBtn');actions.replaceChildren(auto,build);head.append(open,actions);
        const progress=document.createElement('div');progress.id='mobile-queue-progress';progress.setAttribute('aria-hidden','true');progress.append(document.createElement('span'));container.prepend(head,progress);
        iconize(auto,'repeat','AutoTraps');iconize(build,'queue','Build manually');
    }
    function compactMaps(){
        const maps=byId('mobile-maps');
        const scene=document.createElement('div');scene.id='mobile-maps-scene';scene.setAttribute('aria-hidden','true');
        const stock=document.createElement('div');stock.id='mobile-fragments';stock.innerHTML='<span>Available Fragments</span><strong id="mobile-fragments-owned"></strong>';
        maps.prepend(scene,stock);
        const bench=document.createElement('section');bench.id='mobile-map-presets';
        const heading=document.createElement('h2');heading.textContent='Map Presets';
        const head=document.createElement('div');head.id='mobile-map-presets-head';
        const back=document.createElement('button');back.id='mobile-map-back';back.setAttribute('aria-label','Back to Combat');back.title='Back to Combat';back.onclick=()=>TrimpsUI.select('battle');
        head.append(back,heading);
        const hint=document.createElement('p');hint.textContent='Tap a preset to load its settings.';
        const slots=document.createElement('div');slots.className='mobile-map-slots';
        const actions=document.createElement('div');actions.className='mobile-map-preset-actions';
        const note=document.createElement('p');note.id='mobile-preset-note';note.setAttribute('role','status');
        const updateNote=()=>presetNote();
        for(let n=1;n<=5;n++){const slot=byId('advMapsPreset'+n);slots.append(slot);slot.addEventListener('click',updateNote);}
        for(const [id,label] of [['advMapsSaveBtn','Save preset'],['advMapsResetBtn','Reset values'],['advMapsRecycleBtn','Recycle all']]){
            const node=byId(id);node.classList.remove('icomoon','icon-save','icon-refresh','icon-trash-o');node.textContent=label;node.setAttribute('aria-label',label);node.setAttribute('role','button');node.tabIndex=0;
        }
        bench.append(head,hint,slots,actions,note);byId('advMapsControlBtns').before(bench);
        new MutationObserver(placeMapHeader).observe(maps,{subtree:true,attributes:true,attributeFilter:['style','hidden']});
        updateNote();
        actions.append(byId('advMapsSaveBtn'),byId('advMapsResetBtn'));
        byId('advMapsSaveBtn').addEventListener('click',()=>presetNote('Preset '+game.global.selectedMapPreset+' saved.'));
        byId('advMapsResetBtn').addEventListener('click',()=>presetNote('Creation settings reset.'));
        const inventory=document.createElement('div');inventory.id='mobile-map-inventory-head';
        const title=document.createElement('h2');title.textContent='My Maps';inventory.append(title,byId('advMapsRecycleBtn'));byId('mapsHere').before(inventory);
        iconize(byId('advMapsHideBtn'),'minus','Show/hide map options');
        const selected=byId('selectedMapContainer'),stats=document.createElement('div');stats.id='mobile-selected-map-stats';
        for(const [id,label] of [['mapStatsItems','Items'],['mapStatsResource','Resource'],['mapStatsSize','Size'],['mapStatsDifficulty','Difficulty'],['mapStatsLoot','Loot']]){
            const field=document.createElement('div'),title=document.createElement('span');title.textContent=label;field.append(title,byId(id));stats.append(field);
        }
        selected.append(stats,byId('selectMapBtns'));
        byId('selectMapBtn').setAttribute('aria-label','Run selected map');
        byId('recycleMapBtn').setAttribute('aria-label',typeof MobileI18n==='undefined'?'Recycle selected map':MobileI18n.t('Recycle selected map'));
        for(let n=1;n<=5;n++){const preset=byId('advMapsPreset'+n);preset.setAttribute('role','button');preset.tabIndex=0;preset.setAttribute('aria-label','Map preset '+n);}
    }
    function presetNote(message){
        const note=byId('mobile-preset-note');note.dataset.preset=String(game.global.selectedMapPreset);
        note.textContent=message||'Saves to selected slot '+game.global.selectedMapPreset+'.';
    }
    function placeMapHeader(){
        if(typeof MobileMapWorkshop!=='undefined')return;
        // Keep the same return control reachable when the original hides creation (Void view or locked maps).
        if (!byId('mobile-maps').hidden) {
            const bench=byId('mobile-map-presets'), head=byId('mobile-map-presets-head');
            if (bench.getClientRects().length) { if (head.parentElement!==bench) bench.prepend(head); }
            else if (head.parentElement!==byId('mobile-maps')) byId('mobile-fragments').after(head);
        }
    }
    function refreshMaps(){
        if(typeof MobileMapWorkshop!=='undefined')MobileMapWorkshop.refresh();
        placeMapHeader();
        if(byId('mobile-preset-note').dataset.preset!==String(game.global.selectedMapPreset))presetNote();
        const value=document.createElement('span');value.innerHTML=prettify(game.resources.fragments.owned);
        byId('mobile-fragments-owned').textContent=value.textContent;
        for(let n=1;n<=5;n++)byId('advMapsPreset'+n).setAttribute('aria-pressed',String(game.global.selectedMapPreset===n));
    }
    function decorateSettings(){
        document.querySelectorAll('#settingSearchResults>.optionContainer,#allSettingsHere>.optionContainer').forEach(row=>{
            if(row.dataset.compactSetting)return;
            const control=row.querySelector('button[id^="toggle"]');if(!control)return;
            const key=control.id.slice(6),option=game.options.menu[key];if(!option)return;
            if(removedSettings.has(key)){row.remove();return;}
            row.dataset.compactSetting=key;
            // The original no-element path updates the same live button without an unsolicited tooltip.
            control.onclick=()=>toggleSetting(key);
            const name=document.createElement('strong');name.id='mobile-setting-name-'+key;name.className='mobile-setting-name';name.textContent=labels[key]||option.titles[0];
            control.removeAttribute('onmouseover');control.removeAttribute('onmouseout');
            control.removeAttribute('aria-label');control.setAttribute('aria-labelledby',name.id+' '+control.id);
            const description=document.createElement('button');description.type='button';description.className='mobile-setting-info mobile-info';description.textContent='Info';description.setAttribute('aria-label','Info '+name.textContent);
            description.onclick=()=>tooltip(name.textContent,'customText','update',option.description);
            const actions=document.createElement('div');actions.className='mobile-setting-actions';actions.append(...row.querySelectorAll(':scope>button'));
            row.append(name,actions,description);
        });
    }
    function compactSettings(){
        const title=document.createElement('h2');title.textContent='Settings';byId('settingsHere').prepend(title);
        MobileSettings.setup(labels,removedSettings,decorateSettings);
        for(const id of ['settingSearchResults','allSettingsHere'])new MutationObserver(decorateSettings).observe(byId(id),{childList:true});
        decorateSettings();
    }
    function decorateDialogs(){
        const names={mazWorld:'Start Zone',mazThrough:'End Zone',mazCell:'Exit at Cell',mazPrio:'Priority',mazPreset:'Use Preset',mazRepeat:'Map Repeat',mazRepeatUntil:'Repeat Until',mazExit:'Exit To',mazTimes:'Zone Repeat'};
        document.querySelectorAll('#mazContainer .mazRow:not(.titles)>div').forEach(field=>{
            if(field.dataset.compactLabel)return;
            const name=Object.keys(names).find(key=>field.classList.contains(key)),checkbox=field.classList.contains('mazCheckbox')?field.querySelector('[aria-label]'):null;
            const text=name?names[name]:checkbox?.getAttribute('aria-label');if(!text)return;
            const label=document.createElement('span');label.className='mobile-config-label';label.textContent=text;field.prepend(label);field.dataset.compactLabel='true';
        });
    }
    compactCombat();compactQueue();compactMaps();compactSettings();
    for(const id of ['tipText','tipText2'])new MutationObserver(decorateDialogs).observe(byId(id),{childList:true,subtree:true});
    return {decorateSettings,refreshMaps};
})();
