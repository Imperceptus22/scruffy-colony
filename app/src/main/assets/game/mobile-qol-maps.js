var MobileQolMaps=(()=>{
    if(typeof document==='undefined')return{};
    const {el}=MobileQolPages,$=id=>document.getElementById(id);
    // V-271: the preset editor lies outside the translated areas, so its own texts go through MobileI18n.t (German catalog).
    const t=text=>typeof MobileI18n==='undefined'?text:MobileI18n.t(text);
    const nameLabel=el('label',t('Preset name')),name=el('input');name.id='qol-preset-name';name.maxLength=32;nameLabel.append(name);
    // V-271: no own save button; MobileMapPresets runs checkName before and saveName after the original #advMapsSaveBtn.
    const naming=el('div');naming.id='qol-preset-naming';naming.append(nameLabel);document.querySelector('.mobile-preset-options').append(naming);
    // The selected preset or save changed since the field was filled: nothing is saved, so no name lands on the wrong slot.
    function checkName(){if(lastNameOwner!==game.global||lastNameContext!==nameContext()){refresh();return 'Selected preset changed. Review the current name before saving.';}const n=game.global.selectedMapPreset;return Number.isInteger(n)&&n>=1&&n<=5?'':'Selected preset changed. Review the current name before saving.';}
    // An empty field removes the own name, so the slot shows its placeholder "Preset N" again. One status line for both parts.
    function saveName(){const stale=checkName();if(stale)return stale;const n=game.global.selectedMapPreset,names=namesForSlot(),value=name.value.trim().slice(0,32);names[n-1]=value;MobileQolStore.set('mapNames',names);const error=MobileQolStore.error();refresh();return error?'Preset '+n+' saved without its name. '+error:value?'Preset '+n+' saved as “'+value+'”.':'Preset '+n+' saved.';}
    function namesForSlot(){const raw=MobileQolStore.get('mapNames',[]);return Array.from({length:5},(_,i)=>Array.isArray(raw)&&typeof raw[i]==='string'?raw[i].slice(0,32):'');}
    const nameContext=()=>JSON.stringify([TrimpsMobile.slot(),game.global.uniqueId,game.global.selectedMapPreset]);
    let lastNameKey='',lastNameContext='',lastNameOwner=null;
    function refresh(){
        const names=namesForSlot(),selected=game.global.selectedMapPreset,context=nameContext(),changed=context!==lastNameContext||lastNameOwner!==game.global,key=JSON.stringify([context,names]);
        if(key!==lastNameKey||changed){lastNameKey=key;lastNameContext=context;lastNameOwner=game.global;for(let n=1;n<=5;n++){const slot=$('advMapsPreset'+n);slot.textContent=n+' · '+(names[n-1]||'Preset '+n);slot.setAttribute('aria-label','Map preset '+n+(names[n-1]?' · '+names[n-1]:''));}if(changed){if(document.activeElement===name)name.blur();name.value=names[selected-1]||'';}else if(document.activeElement!==name)name.value=names[selected-1]||'';}
        if(typeof MobileMapPresets!=='undefined')MobileMapPresets.refresh(MobileMapWorkshop.currentView());
    }
    return{refresh,namesForSlot,checkName,saveName};
})();
if(typeof module!=='undefined')module.exports=MobileQolMaps;
