// Compact A workbench: original functions own every inventory/modification action.
var MobileHeirlooms = (() => {
    function locate(item, state = game.global) {
        if (!item?.name) return null;
        for (const type of ['Shield','Staff','Core']) if (state[type+'Equipped'] === item) return [-1,type+'Equipped'];
        for (const key of ['heirloomsCarried','heirloomsExtra']) {
            const index = state[key].indexOf(item);
            if (index >= 0) return [index,key];
        }
        return null;
    }
    function inventory(type, state = game.global) {
        const equipped = state[type+'Equipped'];
        return {equipped:equipped?.name ? [equipped] : [], carried:state.heirloomsCarried.filter(x=>x.type===type), temporary:state.heirloomsExtra.filter(x=>x.type===type)};
    }
    // V-152: an item opens on the upgrade controls of its first modifier that can still grow (else the first real one).
    function preferredMod(item, full = () => false) {
        const mods = (item?.mods || []).map((m,index) => [m,index]), real = mods.filter(([m]) => m[0] !== 'empty');
        return (real.find(([m]) => !full(m)) || real[0] || mods[0] || [null,null])[1];
    }
    if (typeof document === 'undefined') return {locate,inventory,preferredMod};
    const byId = id => document.getElementById(id), root = byId('heirloomWrapper');
    const node = (tag,cls,text) => { const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n; };
    const button = (text,action,cls='') => {const n=node('button',cls,text);n.type='button';n.onclick=action;return n;};
    let route='collection', type='Shield', focused=null, mod=null, depth=0, rendering=false, collectionScroll=0, toolsReturn='collection';
    const originalSelect=selectHeirloom, originalSelectMod=selectMod;
    root.classList.add('mobile-heirlooms');
    const banner=document.querySelector('.mobile-development-banner');
    const reserveBanner=()=>{const size=(banner&&!banner.hidden?banner.getBoundingClientRect().height:0)+'px';root.style.setProperty('--mh-dev-offset',size);document.body.style.setProperty('--mh-dev-offset',size);};
    if(banner)new ResizeObserver(reserveBanner).observe(banner);
    reserveBanner();
    const header=node('header','mh-header'), title=node('h1','','Heirlooms');
    header.append(button('‹',()=>back(),'mh-back'),title,button('×',()=>toggleHeirlooms(),'mh-close'));
    header.firstChild.setAttribute('aria-label','Back');header.lastChild.setAttribute('aria-label','Close Heirlooms');
    const more=button('⋮',()=>{toolsReturn=route;show('tools');},'mh-more');more.setAttribute('aria-label','Heirloom tools');header.insertBefore(more,header.lastChild);
    const wallet=node('div','mh-wallet');root.prepend(header,wallet);wallet.append(byId('nullifiumContainer'));
    const capacity=node('span','mh-capacity');wallet.append(capacity);
    const scroll=node('div','mh-scroll'), collection=node('section','mh-collection'), tabs=node('nav','mh-types'), lists=node('div','mh-lists'), preview=node('section','mh-preview');
    root.append(scroll);scroll.append(collection);
    const collectionActions=node('div','mh-collection-actions');collection.append(collectionActions);
    collectionActions.append(byId('sortHeirloomsBtn'),byId('recycleAllHeirloomsBtn'));
    byId('recycleAllHeirloomsBtn').textContent='Recycle all temporary';
    collection.append(tabs,lists);
    const tools=node('section','mh-tools');scroll.append(tools);tools.append(node('h2','','Heirloom tools'),collectionActions,button('Chances',()=>{lastMainHeirIndex=-1;toggleHeirloomChances();}),button('Help',()=>toggleHeirloomHelp()));
    const detailTabs=node('nav','mh-detail-tabs'), comparison=node('section','mh-comparison');
    detailTabs.append(button('Upgrade',()=>show('details')),button('Compare',()=>show('compare')));scroll.append(detailTabs,comparison);
    const detail=node('section','mh-detail'), status=node('div','mh-status'), detailName=node('div','mh-detail-name');
    scroll.append(detail);detailName.append(status,button('Rename',()=>{renameHeirloom();accessibility();}));
    detail.append(detailName,byId('selectedHeirloom'),byId('modBreakdown'));
    const protection=node('div','mh-protection');detail.append(protection);
    const replaceLink=button('Replace modifier',()=>show('replace'),'mh-replace-link');byId('modBreakdown').append(replaceLink);
    const replace=node('section','mh-replace'), replaceTitle=node('h2'), replaceAvailable=node('p','mh-replace-available');
    scroll.append(replace);const label=node('label','','New modifier');label.htmlFor='modReplaceSelect';
    replace.append(replaceTitle,replaceAvailable,label,byId('modReplaceBox'));
    const help=byId('heirloomHelp'), chances=byId('heirloomDropChances');
    scroll.append(collection,detailTabs,comparison,detail,replace,help,chances,tools);
    const footer=node('footer','mh-actions');root.append(footer);
    footer.append(preview);
    for (const id of ['equippedHeirloomsBtnGroup','carriedHeirloomsBtnGroup','extraHeirloomsBtnGroup']) footer.append(byId(id));
    root.prepend(header,wallet,scroll,footer);
    byId('heirloomTitleBar').hidden=true;byId('heirloomSelections').parentElement.hidden=true;
    // Static original controls keep their IDs and inline handlers, now as real buttons.
    for (const id of ['sortHeirloomsBtn','recycleAllHeirloomsBtn','unequipHeirloomBtn','heirloomPortalBtn','equipHeirloomBtn','stopCarryHeirloomBtn','equipHeirloomBtn2','carryHeirloomBtn','recycleHeirloomBtn','modReplaceBtn','modUpgradeBtn','modUpgradeBtn10','modUpgradeBtn100']) {
        const old=byId(id), next=document.createElement('button');
        for(const attr of old.attributes)next.setAttribute(attr.name,attr.value);
        next.type='button';next.innerHTML=old.innerHTML;old.replaceWith(next);
    }
    for(const [id,label] of [['heirloomChanceLeft','Previous zone range'],['heirloomChanceRight','Next zone range']]) {byId(id).setAttribute('aria-label',label);byId(id).setAttribute('role','button');byId(id).tabIndex=0;}
    root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"]:not(button)')){e.preventDefault();e.target.click();}});
    for(const [selector,label] of [['.icon-close','Close'],['.icon-archive','Open']]) {
        const old=document.querySelector('#heirloomsPopupBtns '+selector),next=button(label,()=>{});
        next.setAttribute('onclick',old.getAttribute('onclick'));old.replaceWith(next);
    }
    function decorateItem(host) {
        for(const item of host.querySelectorAll('.selectedHeirloomItem'))for(const text of [...item.childNodes])if(text.nodeType===3)text.remove();
    }
    const displayOriginal=displaySelectedHeirloom;
    displaySelectedHeirloom=function(...args){const result=displayOriginal.apply(this,args);if(args[5])decorateItem(byId('heirloomsPopupHere'));return result;};
    function accessibility() {
        for(const n of detail.querySelectorAll('[onclick]:not(button):not(input):not(select)')) {n.setAttribute('role','button');n.tabIndex=0;}
        byId('selectedHeirloomIcon')?.setAttribute('aria-label','Change Heirloom icon');
        byId('selectedHeirloomTitle')?.setAttribute('aria-label','Rename Heirloom');
    }
    function show(next) {
        if(route==='collection')collectionScroll=scroll.scrollTop;
        route=next;sync();scroll.scrollTop=next==='collection'?collectionScroll:0;
    }
    function choose(item,open=false) {
        const location=locate(item);if(!location)return;
        focused=item;mod=null;originalSelect(...location);
        // The original modifier selection only displays costs; upgrading stays on the original x1/x10/x100 buttons.
        if(open)mod=preferredMod(item,m=>{const config=game.heirlooms[item.type][m[0]];return !config||checkModCap(m,config,item)||!!config.max&&m[1]>=config.max[item.rarity];});
        show(open?'details':'collection');
        // Items with many modifiers: scroll just far enough that the upgrade buttons clear the action footer.
        const box=byId('modUpgradeBox');if(open&&box?.offsetParent){const over=box.getBoundingClientRect().bottom-scroll.getBoundingClientRect().bottom;if(over>0)scroll.scrollTop+=over+8;}
    }
    function row(item) {
        // One tap opens the item view (Upgrade first, Compare beside it).
        const n=button('',()=>choose(item,true),'mh-item');n.classList.toggle('is-selected',focused===item);n.setAttribute('aria-pressed',String(focused===item));
        const icon=node('span','mh-item-icon '+getHeirloomIcon(item)+' heirloomRare'+item.rarity);icon.setAttribute('aria-hidden','true');
        const text=node('span','mh-item-text');text.append(node('strong','',item.name),node('small','',game.heirlooms.rarityNames[item.rarity]+' '+item.type));
        const summary=item.mods.filter(m=>m[0]!=='empty').slice(0,3).map(m=>(game.heirlooms[item.type][m[0]]?.name||m[0])+': '+prettify(scaleHeirloomModUniverse(item.type,m[0],m[1]))+'%').join(' · ');
        text.append(node('small','mh-item-mods',summary));
        if(typeof MobileHeirloomTools!=='undefined'&&MobileHeirloomTools.isProtected(item))text.append(node('small','mh-protected','Protected'));
        n.append(icon,text,node('span','mh-item-chevron','›'));return n;
    }
    function renderCollection() {
        tabs.replaceChildren();
        const types=['Shield','Staff'];if(game.stats.coresFound.value+game.stats.coresFound.valueTotal>0)types.push('Core');
        if(!types.includes(type))type='Shield';
        for(const t of types){const count=Object.values(inventory(t)).reduce((n,items)=>n+items.length,0);const n=button((t==='Staff'?'Staffs':t+'s')+' '+count,()=>{type=t;focused=null;mod=null;sync();});n.setAttribute('aria-pressed',String(type===t));tabs.append(n);}
        const groups=inventory(type);lists.replaceChildren();
        for(const [key,label] of [['equipped','Equipped'],['carried','Carried'],['temporary','Temporary']]) {
            const section=node('section','mh-section'), h=node('h2','',label);
            if(key==='carried')h.append(node('span','',game.global.heirloomsCarried.length+' / '+getMaxCarriedHeirlooms()));
            if(key==='temporary')h.append(node('span','',groups[key].length+' '+type+' · '+game.global.heirloomsExtra.length+' total'));
            section.append(h);for(const item of groups[key])section.append(row(item));
            if(!groups[key].length)section.append(node('p','mh-empty','No '+type.toLowerCase()+'s here.'));
            if(key==='temporary')section.append(node('p','mh-note','Temporary items are recycled on Portal. Protect items you want to keep.'));
            lists.append(section);
        }
        preview.replaceChildren();preview.hidden=!locate(focused);
        if(focused&&locate(focused)) {
            preview.append(button('Compare '+focused.name,()=>show('compare'),'mh-primary'));
        }
    }
    function sync() {
        if(rendering||!heirloomsShown)return;
        rendering=true;
        try {
            const location=locate(focused);
            if(focused&&!location){focused=null;mod=null;route='collection';}
            if(focused && !byId('heirloomNameInput')) {
                // Actions always receive the current identity, including after Sort, Carry or Swap.
                const replacement=byId('modReplaceSelect').value;
                originalSelect(...location);
                if(mod!==null&&focused.mods[mod]) {
                    originalSelectMod(mod);
                    // A confirmation rebuild must keep the user's still-allowed choice.
                    const select=byId('modReplaceSelect');
                    if([...select.options].some(option=>option.value===replacement))select.value=replacement;
                }
                status.textContent=game.heirlooms.rarityNames[focused.rarity]+' '+focused.type+' · '+(location[0]===-1?'Equipped':location[1]==='heirloomsCarried'?'Carried':'Temporary');
                byId('carryHeirloomBtn').disabled=game.global.heirloomsCarried.length>=getMaxCarriedHeirlooms();
                byId('carryHeirloomBtn').title=byId('carryHeirloomBtn').disabled?'Carried slots are full':'';
            }
            capacity.textContent='Carried '+game.global.heirloomsCarried.length+' / '+getMaxCarriedHeirlooms()+' · all types';
            title.textContent=route==='details'||route==='replace'?focused?.name||'Heirlooms':route==='compare'?'Compare '+(focused?.type==='Staff'?'Staffs':focused?.type+'s'):route==='help'?'Heirloom help':route==='chances'?'Drop chances':route==='tools'?'Heirloom tools':'Heirlooms';
            collection.hidden=route!=='collection';detail.hidden=route!=='details';replace.hidden=route!=='replace';
            tools.hidden=route!=='tools';comparison.hidden=route!=='compare';detailTabs.hidden=!['details','compare'].includes(route);detailTabs.children[0].setAttribute('aria-pressed',String(route==='details'));detailTabs.children[1].setAttribute('aria-pressed',String(route==='compare'));
            help.style.display=route==='help'?'block':'none';chances.style.display=route==='chances'?'flex':'none';
            footer.hidden=!['collection','details','compare'].includes(route)||!focused;preview.hidden=route!=='collection'||!location;
            for(const [id,key] of [['equippedHeirloomsBtnGroup',focused?.type+'Equipped'],['carriedHeirloomsBtnGroup','heirloomsCarried'],['extraHeirloomsBtnGroup','heirloomsExtra']])byId(id).hidden=!['details','compare'].includes(route)||!location||location[1]!==key;
            if(route==='collection')renderCollection();
            if(focused&&mod!==null){replaceLink.textContent=byId('modReplaceBtn').textContent+' modifier';replaceTitle.textContent=byId('selectedHeirloom').querySelectorAll('.heirloomMod:not(.innate)')[mod]?.textContent||'Modifier';replaceAvailable.textContent=byId('selectedHeirloom').querySelector('.heirloomSpent')?.textContent||'';}
            decorateItem(byId('selectedHeirloom'));
            byId('selectedHeirloom').querySelectorAll('.heirloomMod:not(.innate)').forEach((n,index)=>n.setAttribute('aria-current',String(index===mod)));
            accessibility();
            if(typeof MobileHeirloomTools!=='undefined')MobileHeirloomTools.refresh(focused,route);
        } finally {rendering=false;}
    }
    function back() {
        if(!heirloomsShown)return false;
        if(byId('heirloomNameInput')){renameHeirloom(true);return true;}
        if(route==='replace'){show('details');return true;}
        if(route==='help'||route==='chances'){show('tools');return true;}
        if(route==='tools'){show(toolsReturn==='tools'?'collection':toolsReturn);return true;}
        // Upgrade and Compare are one item view: Back leaves it for the list without a selection left behind.
        if(route==='details'||route==='compare'){focused=null;mod=null;show('collection');return true;}
        if(route!=='collection'){show('collection');return true;}
        if(focused){focused=null;mod=null;sync();return true;}
        toggleHeirlooms();return true;
    }
    const hooks=['toggleHeirlooms','populateHeirloomWindow','selectHeirloom','selectMod','upgradeMod','replaceMod','equipHeirloom','unequipHeirloom','carryHeirloom','stopCarryHeirloom','recycleHeirloom','recycleAllHeirloomsClicked','toggleHeirloomOnPortal','sortHeirlooms','renameHeirloom','saveHeirloomIcon','swapFromPopup','toggleHeirloomHelp','toggleHeirloomChances'];
    for(const name of hooks) {
        const original=window[name];
        window[name]=function(...args) {
            depth++;
            try {
                const result=original.apply(this,args);
                if(name==='toggleHeirlooms'){route='collection';focused=null;mod=null;collectionScroll=0;}
                if(name==='selectHeirloom'||name==='selectMod'||(name==='swapFromPopup'&&result)) {
                    const selected=getSelectedHeirloom();if(locate(selected))focused=selected;
                    if(name==='selectMod'){mod=args[0];route='details';}
                    if(name==='swapFromPopup'&&result){mod=null;route='details';type=focused.type;}
                }
                if(name==='toggleHeirloomHelp')route=help.style.display==='none'?'collection':'help';
                if(name==='toggleHeirloomChances')route=chances.style.display==='none'?'collection':'chances';
                return result;
            } finally {depth--;if(!depth&&!rendering)sync();}
        };
    }
    return {back,locate,inventory,preferredMod,route:()=>route,choose,show,refresh:sync};
})();
if(typeof module!=='undefined')module.exports=MobileHeirlooms;
