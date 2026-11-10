// View state is independent of the engine's chamber flags. A start intent never enters a save.
var MobileMapMenu = (() => {
    const byId=id=>document.getElementById(id);
    const setText=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
    // V-243 steps 4d/4i: the own map, return and transition labels use the stage 1 catalog (Zur Welt, Map starten …); English stays unchanged.
    const tr=value=>typeof MobileI18n==='undefined'?value:MobileI18n.t(value);
    let pending=null, returning=null, requesting=false, starting=false, inventoryKey='', creationState=null;
    let lastState=null, lastMapActive=false, chamberArrival=null, descriptionKey=null,fragmentBalance=game.resources.fragments.owned,voidRenderKey=null;
    const available=()=>Boolean(game.global.mapsUnlocked);
    function defaultCreationLevel(){
        if(!available())return;
        byId('mapLevelInput').value=game.global.world;
        byId('advExtraLevelSelect').value='0';
        updateMapCost();
    }
    function cancel(){pending=null;returning=null;}
    function beforeTravel(){if(!requesting)cancel();}
    function beforeRun(){if(!starting)cancel();}
    function beforeSwitch(updateOnly,fromTravel){
        // Final-cell wins set chamber/world flags directly, then call the original display-only switch.
        if(updateOnly&&returning?.phase==='travel'&&!game.global.mapsActive&&!game.global.currentMapId&&!game.global.switchToMaps&&!game.global.switchToWorld){
            if(game.global.preMapsActive)returning.phase='arrived';else returning=null;
        }
        if(!updateOnly&&returning){
            if(requesting||(returning.phase==='travel'&&fromTravel&&game.global.switchToMaps))returning.phase='arrived';
            else cancel();
        }
        if(updateOnly||!pending)return;
        if(!fromTravel||pending.arrived||!game.global.switchToMaps||game.global.preMapsActive||game.global.mapsActive)cancel();
        else pending.arrived=true;
    }
    function valid(){return available()&&canRunMap()&&(!game.global.currentMapId||game.global.currentMapId===game.global.lookingAtMap);}
    function travel(){requesting=true;try{mapsClicked();}finally{requesting=false;}}
    function returnToWorld(){
        if(returning)return; // A second tap never means abandoning the waiting soldiers.
        cancel();
        const state=game.global;
        if(!available()||usingRealTimeOffline||game.options.menu.pauseGame.enabled||(!state.mapsActive&&!state.preMapsActive))return;
        if(document.body?.dataset.mobilePage!=='battle')TrimpsUI.select('battle');
        returning={state,id:state.currentMapId,phase:state.preMapsActive?'arrived':'travel',confirmation:null};
        if(!state.preMapsActive&&!state.switchToMaps&&!state.switchToWorld){
            travel();
            // Keep the original warning and original confirm handler, guarded by this transient intent.
            if(state.mapsActive&&!state.switchToMaps&&!state.switchToWorld){
                const intent=returning,confirm=byId('confirmTooltipBtn'),handler=confirm?.onclick;
                if(!intent||!handler){cancel();return;}
                intent.phase='confirm';intent.confirmation=confirm;
                confirm.onclick=function(event){
                    if(returning!==intent||!confirm.isConnected||byId('tooltipDiv').style.display==='none'||game.global!==state||state.currentMapId!==intent.id||usingRealTimeOffline||game.options.menu.pauseGame.enabled){cancel();return;}
                    intent.phase='travel';requesting=true;try{handler.call(this,event);}finally{requesting=false;}refresh();
                };
            }
        }
        refresh();
    }
    function start(){
        if(available()&&game.global.mapsActive&&!game.global.preMapsActive){TrimpsUI.select('battle');return;}
        if(!valid()){canRunMap(true);return;}
        // Repeated taps on Start never mean Abandon. That remains a separate explicit action.
        if(pending)return;
        if(game.global.switchToMaps||game.global.switchToWorld)return;
        pending={id:game.global.lookingAtMap,state:game.global,arrived:game.global.preMapsActive};
        if(!pending.arrived)travel();
        refresh();
    }
    function contextAction(){
        if(returning){if(returning.phase==='travel')travel();refresh();return;}
        if(pending?.arrived){refresh();return;}
        if(pending){
            if(!valid()||pending.id!==game.global.lookingAtMap){cancel();refresh();return;}
            travel();
        }else mapsClicked();
        refresh();
    }
    function inventoryChanged(){inventoryKey='';refresh();}
    function refresh(){
        if(!byId('mobile-map-state'))return;
        const state=game.global,unlocked=available();
        // Leaving Void/Darkness clears the current ID through the original recycle path in the chamber.
        if(returning&&(returning.state!==state||(returning.id!==state.currentMapId&&!(returning.phase==='arrived'&&state.preMapsActive&&!state.currentMapId))||usingRealTimeOffline||game.options.menu.pauseGame.enabled))cancel();
        if(returning?.phase==='confirm'&&(!returning.confirmation.isConnected||byId('tooltipDiv').style.display==='none'))cancel();
        if(returning?.phase==='arrived'){
            if(state.preMapsActive&&!state.mapsActive&&!state.switchToMaps&&!state.switchToWorld){returning=null;travel();TrimpsUI.select('battle');}
            else cancel();
        }
        if(pending&&(pending.state!==state||pending.id!==state.lookingAtMap||!valid()||usingRealTimeOffline))cancel();
        if(pending&&pending.arrived){
            if(!state.preMapsActive||state.mapsActive||state.switchToMaps||state.switchToWorld)cancel();
            else {
                const id=pending.id;cancel();starting=true;
                try{runMap();}finally{starting=false;}
                if(state.mapsActive&&state.currentMapId===id)TrimpsUI.select('battle');
            }
        }
        // The engine already entered the chamber; reveal it without performing another transition.
        if(lastState===state&&lastMapActive&&!state.mapsActive&&state.preMapsActive&&!returning)chamberArrival=state;
        lastState=state;lastMapActive=state.mapsActive;
        if(chamberArrival&&(chamberArrival!==state||!state.preMapsActive||state.mapsActive||document.body?.dataset.mobilePage!=='battle'))chamberArrival=null;
        if(chamberArrival&&!usingRealTimeOffline&&TrimpsUI.showMapChamber())chamberArrival=null;
        byId('preMaps').hidden=!unlocked;
        if(unlocked)byId('preMaps').style.display='block';
        byId('mobile-map-access').hidden=unlocked;
        if(!unlocked)return;
        if(creationState!==state){resetAdvMaps();defaultCreationLevel();creationState=state;}
        refreshMapBiomes();
        if(document.body.dataset.mobilePage==='maps'){
            const key=JSON.stringify(state.mapsOwnedArray);
            if(key!==inventoryKey){refreshMaps();inventoryKey=key;}
            const fragments=game.resources.fragments.owned;
            if(fragments!==fragmentBalance){if(getHighestLevelCleared()>=getUnlockZone('extra'))updateExtraLevelColors();fragmentBalance=fragments;}
        }else descriptionKey=null;
        const current=state.mapsOwnedArray.find(map=>map.id===state.currentMapId);
        const selected=current||state.mapsOwnedArray.find(map=>map.id===state.lookingAtMap);
        if(document.body.dataset.mobilePage==='maps'){
            const run=byId('selectMapBtn'),key=JSON.stringify([selected,typeof MobileI18n==='undefined'?'en':MobileI18n.lang,state.world,state.mapsUnlocked,run.style.visibility,state.lastClearedMapCell,state.challengeActive,state.mapExtraBonus,state.universe,game.mapUnlocks]);
            if(key!==descriptionKey){if(selected)renderMapDescription(selected);else clearMapDescription();descriptionKey=JSON.stringify([selected,typeof MobileI18n==='undefined'?'en':MobileI18n.lang,state.world,state.mapsUnlocked,run.style.visibility,state.lastClearedMapCell,state.challengeActive,state.mapExtraBonus,state.universe,game.mapUnlocks]);}
        }
        if(selected){const card=byId(selected.id);if(card)swapClass('mapElement','mapElementSelected',card);}
        const run=byId('selectMapBtn'),active=Boolean(state.mapsActive&&!state.preMapsActive);
        setText(run,tr(pending?'Waiting for combat to end':active?'Go to current combat':current?'Continue map':'Run map'));
        if(run.getAttribute?.('aria-label')!==run.textContent)run.setAttribute('aria-label',run.textContent);
        const pendingText=String(Boolean(pending));if(run.getAttribute?.('aria-disabled')!==pendingText)run.setAttribute('aria-disabled',pendingText);
        const recycle=byId('recycleMapBtn'),visibility=selected&&!active&&(!selected.noRecycle||current)?'visible':'hidden';if(recycle.style.visibility!==visibility)recycle.style.visibility=visibility;
        setText(byId('recycleMapBtn'),tr(current?.noRecycle?'Abandon map':'Recycle Map'));
        const action=byId('mobile-map-transition');action.hidden=!(pending||current||state.preMapsActive||state.switchToMaps||state.switchToWorld);
        setText(action,tr(state.preMapsActive?'Return to World':state.switchToMaps||state.switchToWorld?'Abandon soldiers':'To map chamber'));
        const note=byId('mobile-map-state');setText(note,tr(returning?'Return to World queued. Wait, or explicitly abandon your soldiers.':pending?'Map start queued. Wait, or explicitly abandon your soldiers.':current?'Finish or abandon the current map before selecting another.':''));note.hidden=!note.textContent;
        const world=byId('mobile-return-world');if(world){world.hidden=!state.mapsActive&&!returning;world.disabled=Boolean(returning);const disabled=String(Boolean(returning));if(world.getAttribute?.('aria-disabled')!==disabled)world.setAttribute('aria-disabled',disabled);}
        const direct=byId('mobile-map-world');if(direct){direct.hidden=!state.preMapsActive&&!state.mapsActive&&!returning;direct.disabled=Boolean(returning);setText(direct,tr(returning?'Return queued · Waiting':'← Return to World'));}
        if(document.body.dataset.mobilePage==='maps'){
            const key=JSON.stringify([state.voidMapsToggled,state.totalVoidMaps,state.preMapsActive,state.mapsUnlocked,state.world,state.challengeActive,state.mapExtraBonus,state.universe,getHighestLevelCleared(),byId('mapLevelInput').value,Fluffy.isRewardActive('stickler'),typeof u2Mutations!=='undefined'&&Boolean(u2Mutations.tree?.Heirlots?.purchased),typeof u2Mutations!=='undefined'&&Boolean(u2Mutations.tree?.Heirmazing?.purchased)]);
            if(key!==voidRenderKey){renderVoidMaps();voidRenderKey=key;}
        }
    }
    function setup(){
        const host=byId('mobile-maps'),note=document.createElement('p');note.id='mobile-map-state';note.setAttribute('role','status');note.hidden=true;
        const action=document.createElement('button');action.id='mobile-map-transition';action.hidden=true;action.onclick=contextAction;
        byId('preMaps').before(note,action);byId('selectMapBtn').onclick=start;
        const world=document.createElement('button');world.id='mobile-return-world';world.type='button';world.hidden=true;world.onclick=returnToWorld;byId('battleBtnsColumn').append(world);
        const direct=document.createElement('button');direct.id='mobile-map-world';direct.type='button';direct.hidden=true;direct.onclick=returnToWorld;host.prepend(direct);
    }
    return {setup,refresh,start,returnToWorld,contextAction,available,cancel,beforeTravel,beforeRun,beforeSwitch,inventoryChanged,defaultCreationLevel};
})();
