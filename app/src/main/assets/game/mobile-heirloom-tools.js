var MobileHeirloomTools=(()=>{
    const types=['Shield','Staff','Core'];
    const key=item=>item&&types.includes(item.type)&&(typeof item.id==='number'||typeof item.id==='string')?JSON.stringify([item.type,item.id,item.rarity]):null;
    function resolve(set,items){if(!set||typeof set!=='object'||!Object.keys(set).length||Object.keys(set).some(t=>!types.includes(t)))return null;const result=[];for(const [type,id] of Object.entries(set)){const matches=items.filter(i=>i.type===type&&key(i)===id);if(matches.length!==1)return null;result.push(matches[0]);}return result;}
    function compare(a,b,scale,innate=()=>[]){if(!a||!b||a.type!==b.type)return null;const names=new Set([...a.mods,...b.mods].map(m=>m[0]).filter(n=>n!=='empty'));
        const rows=[...names].map(mod=>{const v=item=>scale(item.type,mod,item.mods.find(m=>m[0]===mod)?.[1]||0),selected=v(a),equipped=v(b);return{mod,selected,equipped,delta:selected-equipped};});
        const left=innate(a),right=innate(b);for(const mod of new Set([...left,...right].map(m=>m[0]))){const l=left.find(m=>m[0]===mod),r=right.find(m=>m[0]===mod),selected=l?.[1]||0,equipped=r?.[1]||0;rows.push({mod,selected,equipped,delta:selected-equipped,label:(l||r)[2]});}return rows;}
    function innateMods(item){
        if(item.rarity<10)return [];
        // Original calculators cache equipped bonuses by object identity. A read-only view avoids those writes.
        const view={...item};
        if(item.type==='Shield')return [['innate:gamma',scaleHeirloomModUniverse('Shield','gammaBurst',getHazardGammaBonus(view)),'Gamma Burst (Innate)']];
        if(item.type==='Staff')return [['innate:parity',(getHazardParityMult(view)-1)*100,'Parity (Innate)']];
        return [];
    }
    const protectedExtras=(extra,ids)=>extra.filter(i=>ids.includes(key(i)));
    if(typeof document==='undefined')return{key,resolve,compare,protectedExtras};
    const {el,button,number,note}=MobileQolPages,host=el('section',undefined,'qol-page'),content=el('div'),sets=el('div'),message=el('p'),name=el('input'),nameLabel=el('label','Set name');host.id='qol-heirloom-tools';name.id='qol-heirloom-set-name';name.maxLength=32;nameLabel.htmlFor=name.id;
    document.querySelector('#heirloomWrapper .mh-tools').append(host);host.append(content,el('h3','Manual equipment sets'),nameLabel,name,button('Save equipped set',saveSet),sets,message);message.setAttribute('role','status');
    function inventory(){return[...types.map(t=>game.global[t+'Equipped']).filter(i=>i?.name),...game.global.heirloomsCarried,...game.global.heirloomsExtra];}
    function protection(){const data=MobileQolStore.get('heirloomProtection',[]);return Array.isArray(data)?data.filter(v=>typeof v==='string').slice(0,128):[];}
    function profiles(){const data=MobileQolStore.get('heirloomSets',[]);return Array.isArray(data)?data.filter(v=>v&&typeof v.name==='string'&&v.items&&typeof v.items==='object').slice(0,6):[];}
    function say(text){message.textContent=text;}
    function saveSet(){const title=name.value.trim(),items={};for(const t of types){const i=game.global[t+'Equipped'];if(i?.name){if(!key(i)){say('This item has no stable identity. The set was not saved.');return;}items[t]=key(i);}}
        if(!title||!Object.keys(items).length){say('Name the set and equip at least one Heirloom first.');return;}
        const list=profiles(),existing=list.findIndex(s=>s.name===title);if(existing<0&&list.length>=6){say('Six sets are stored. Remove a set first.');return;}if(existing>=0)list[existing]={name:title,items};else list.push({name:title,items});MobileQolStore.set('heirloomSets',list);say(MobileQolStore.error()||'Equipped set saved.');renderSets();}
    function renderSets(){sets.replaceChildren();for(const profile of profiles()){const row=el('div',undefined,'qol-form');row.append(el('strong',profile.name),button('Equip set',()=>{const chosen=resolve(profile.items,inventory());if(!chosen){say('A set member is missing or ambiguous. Nothing was equipped.');return;}
            for(const item of chosen){const location=MobileHeirlooms.locate(item);if(location[0]===-1)continue;selectHeirloom(...location,true);equipHeirloom(true);}populateHeirloomWindow();say('Set equipped using the original equipment actions.');}),button('Remove set',()=>{MobileQolStore.set('heirloomSets',profiles().filter(p=>p.name!==profile.name));renderSets();say('Set removed.');}));sets.append(row);}if(!sets.childElementCount)sets.append(el('p','No saved sets. Sets are applied only when you choose Equip set.'));}
    const isProtected=item=>protection().includes(key(item));
    function protectButton(item){return button(isProtected(item)?'Unprotect item':'Protect item',()=>{const id=key(item),ids=protection();if(!ids.includes(id)&&ids.length>=128){TrimpsUI.infoText('Protection','Protection list is full. Unprotect an older item first.');return;}MobileQolStore.set('heirloomProtection',ids.includes(id)?ids.filter(v=>v!==id):[...ids,id]);MobileHeirlooms.refresh();if(MobileQolStore.error())TrimpsUI.infoText('Protection',MobileQolStore.error());});}
    let signature='';
    function refresh(item,route){
        host.hidden=!heirloomsShown||route!=='tools';
        const equipped=item&&game.global[item.type+'Equipped'];
        if(route==='compare'&&item){const target=document.querySelector('.mh-comparison');target.replaceChildren();
            const pair=el('div',undefined,'mh-pair');for(const [label,h]of [['Equipped',equipped],['Selected',item]]){const side=el('div');side.append(el('small',label),el('strong',h?.name||(typeof MobileI18n==='undefined'?'None equipped':MobileI18n.t('None equipped'))),el('small',h?.name?game.heirlooms.rarityNames[h.rarity]+' '+h.type:''));pair.append(side);}target.append(pair);
            const rows=compare(item,equipped?.name?equipped:{type:item.type,rarity:0,mods:[]},scaleHeirloomModUniverse,innateMods),table=el('table'),head=el('tr');
            for(const label of ['Modifier','Equipped','Selected','Change (pp)'])head.append(el('th',label));const thead=el('thead');thead.append(head);table.append(thead);const body=el('tbody');
            for(const row of rows){const tr=el('tr');for(const value of [row.label||game.heirlooms[item.type][row.mod]?.name||row.mod,number(row.equipped)+'%',number(row.selected)+'%',(row.delta>0?'+':'')+number(row.delta)])tr.append(el('td',value));tr.lastChild.className=row.delta>0?'mh-positive':row.delta<0?'mh-negative':'';body.append(tr);}table.append(body);target.append(table,el('p','Differences are percentage points (pp). Missing modifiers count as 0. Values use the original universe scaling; there is no combined score.'));
            // The Upgrade tab above leads back to the item; no separate details step (V-152).
            if(key(item))target.append(protectButton(item));
        }
        if(route==='details'){const target=document.querySelector('.mh-protection');target.replaceChildren();if(item&&key(item))target.append(protectButton(item));}
        if(host.hidden)return;
        const sig=JSON.stringify([protection(),profiles()]);if(sig===signature)return;signature=sig;content.replaceChildren();
        content.append(el('p','Local sets and protection belong to this save. Protecting temporary items blocks recycling and Portal until you carry, equip or unprotect them. Carry limits still apply.'));renderSets();note(content);
    }
    function block(){cancelTooltip();tooltip('Heirloom protection','customText','update','Carry, equip or unprotect protected temporary Heirlooms before recycling or restarting a run (Portal, challenge restart or universe return). Carry limits still apply.');say('Action blocked by Heirloom protection.');}
    const recycle=recycleHeirloom;recycleHeirloom=function(){if(protection().includes(key(getSelectedHeirloom()))){block();return;}return recycle.apply(this,arguments);};
    const bulk=recycleAllHeirloomsClicked;recycleAllHeirloomsClicked=function(){if(protectedExtras(game.global.heirloomsExtra,protection()).length){block();return;}return bulk.apply(this,arguments);};
    const portal=activatePortal;activatePortal=function(){if(protectedExtras(game.global.heirloomsExtra,protection()).length){block();return;}return portal.apply(this,arguments);};
    const abandon=abandonChallenge;abandonChallenge=function(){if(game.challenges[game.global.challengeActive]?.mustRestart&&protectedExtras(game.global.heirloomsExtra,protection()).length){block();return;}return abandon.apply(this,arguments);};
    const universe=screwThisUniverse;screwThisUniverse=function(confirmed){if(confirmed&&protectedExtras(game.global.heirloomsExtra,protection()).length){block();return;}return universe.apply(this,arguments);};
    const reset=resetGame;resetGame=function(keepPortal){if(keepPortal&&protectedExtras(game.global.heirloomsExtra,protection()).length){block();return;}return reset.apply(this,arguments);};
    return{refresh,key,resolve,compare,protectedExtras,isProtected};
})();
if(typeof module!=='undefined')module.exports=MobileHeirloomTools;
