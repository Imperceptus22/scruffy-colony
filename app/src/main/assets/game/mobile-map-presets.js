// C: keep the five original preset controls and their save/reset handlers.
var MobileMapPresets=(()=>{
    const $=id=>document.getElementById(id),el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
    const button=(label,click)=>{const n=el('button',label);n.type='button';n.onclick=click;return n;};
    const bench=$('mobile-map-presets'),slots=bench.querySelector('.mobile-map-slots'),oldOptions=bench.querySelector('.mobile-preset-options');
    const toolbar=el('div'),choose=button('',()=>setOpen(choices.hidden)),manage=button('',()=>{setOpen(false);MobileMapWorkshop.show('manage');$('mobile-preset-editor-back').focus();}),choices=el('div');
    toolbar.id='mobile-preset-toolbar';choose.id='mobile-preset-choose';choose.setAttribute('aria-expanded','false');choose.setAttribute('aria-controls','mobile-preset-choices');
    const t=text=>typeof MobileI18n==='undefined'?text:MobileI18n.t(text);
    manage.id='mobile-preset-manage';manage.setAttribute('aria-label',t('Manage preset'));manage.title=t('Manage preset');
    choices.id='mobile-preset-choices';choices.hidden=true;choices.append(slots);toolbar.append(choose,manage);bench.querySelector('h3').textContent=t('Map preset');bench.append(toolbar,choices);
    const editor=el('section');editor.id='mobile-preset-editor';editor.hidden=true;editor.setAttribute('aria-label',t('Manage map preset'));
    const backButton=button(t('Back to map creation'),()=>{MobileMapWorkshop.show('create');choose.focus();});backButton.id='mobile-preset-editor-back';
    const intro=el('p',t('Choose the slot you want to update.')),editorSlots=el('div'),selected=el('p'),settings=el('section');
    editorSlots.id='mobile-preset-editor-slots';selected.id='mobile-preset-selected';settings.className='mobile-preset-editor-settings';
    const settingsTitle=el('h3',t('Map settings')),current=el('p'),actions=bench.querySelector('.mobile-map-preset-actions');current.id='mobile-preset-current-settings';
    // V-271: one Save Preset button. The original saveAdvMaps (inline onclick) saves the settings; the name check runs first
    // in the capture phase and stops the whole save, the name is stored after it and one status line replaces the note.
    // The note keeps its preset mark, so the compact adapter does not replace the line with its slot hint.
    const save=$('advMapsSaveBtn');
    const note=text=>{const n=$('mobile-preset-note');n.dataset.preset=String(game.global.selectedMapPreset);n.textContent=t(text);};
    save.textContent=t('Save Preset');save.setAttribute('aria-label',t('Save Preset'));
    settings.addEventListener('click',event=>{if(event.target!==save)return;const stale=MobileQolMaps.checkName();if(stale){event.stopPropagation();note(stale);}},true);
    save.addEventListener('click',()=>note(MobileQolMaps.saveName()));
    $('advMapsResetBtn').textContent=t('Reset current values');$('advMapsResetBtn').setAttribute('aria-label',t('Reset current values'));
    settings.append(settingsTitle,current,actions,$('mobile-preset-note'));
    editor.append(backButton,intro,editorSlots,selected,$('qol-preset-naming'),settings);$('preMaps').append(editor);oldOptions.remove();
    let lastView='',owner=game.global;
    function setOpen(open){choices.hidden=!open;choose.setAttribute('aria-expanded',String(open));}
    for(let n=1;n<=5;n++){$('advMapsPreset'+n).dataset.slotNumber=n;$('advMapsPreset'+n).addEventListener('click',()=>{setOpen(false);MobileQolMaps.refresh();refresh(MobileMapWorkshop.currentView());if(MobileMapWorkshop.currentView()==='create')choose.focus();});}
    const originalBack=$('mobile-map-back').onclick;$('mobile-map-back').onclick=function(event){if(!back())originalBack.call(this,event);};
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&back()){event.preventDefault();}});
    // Reuse the same nodes in both views, retaining their identities and Original handlers.
    function refresh(view){
        if(owner!==game.global){owner=game.global;setOpen(false);}
        const editing=view==='manage';editor.hidden=!editing;document.querySelector('.mobile-workshop-tabs').hidden=editing;
        if(lastView!==view){lastView=view;setOpen(false);(editing?editorSlots:choices).append(slots);}
        const n=game.global.selectedMapPreset,names=MobileQolMaps.namesForSlot(),name=names[n-1]||'Preset '+n;
        for(let i=1;i<=5;i++)$('advMapsPreset'+i).setAttribute('aria-pressed',String(i===n));
        const label=n+' · '+name;if(choose.textContent!==label)choose.textContent=label;
        choose.setAttribute('aria-label',t('Choose map preset: '+label));
        const selectedLabel=t(name+' · Slot '+n+' of 5');if(selected.textContent!==selectedLabel)selected.textContent=selectedLabel;
        const value=t('Current creation settings: Level '+$('mapLevelInput').value+' · '+$('biomeAdvMapsSelect').value+'. Save to slot '+n+'.');if(current.textContent!==value)current.textContent=value;
    }
    function back(){if(!$('mobile-maps').getClientRects().length)return false;if(!choices.hidden){setOpen(false);choose.focus();return true;}if(MobileMapWorkshop.currentView()==='manage'){MobileMapWorkshop.show('create');choose.focus();return true;}return false;}
    refresh(MobileMapWorkshop.currentView());return{refresh,back};
})();
MobileQolMaps.refresh();
