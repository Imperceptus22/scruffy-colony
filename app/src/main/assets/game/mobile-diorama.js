var createMobileDiorama=win=>{
    const doc=win.document,style=win.MobileGraphicStyle,assets=win.DioramaAssets||{},originalStyles=new WeakMap(),checked=new Map(),tracked=new Set();
    const targets={buildings:['buildingsHere'],equipment:['equipmentHere'],resources:['resourceColumn','mobile-colony-resources'],jobs:['jobsHere','trimpsColumn'],research:['upgradesHere','mobile-equipment-research'],biomes:['mobile-create-biome','mobile-selected-biome','mobile-maps-scene']};
    const scenes={
        colony:['mobile-colony'], portal:['portalWrapper'], 'heirlooms-display':['heirloomWrapper'],
        'more-settings-desk':['mobile-more'], 'player-spire':['mobile-spire','playerSpirePopout'],
        mutators:['mutTreeWrapper']
    };
    const uiTargets={
        'panel-parchment':'#mobile-colony-content, #mobile-resource-summary, #buildingsHere, #equipmentHere, #jobsHere, #upgradesHere, #mapConfigContainer, #portalWrapper, #heirloomWrapper, #mobile-more, .mm-pane',
        'button-petrol':'button, .btn, .btn-primary, .workBtn', 'button-amber':'.btn-warning',
        'button-disabled':'[disabled], .disabled', 'header-wood':'#mobile-header, #mobile-nav, .mm-detail-head, #mobile-portal-header, .mh-header',
        'frame-current':'.selected, .presetSelectionOn, [aria-current="page"]'
    };
    const element=id=>doc.getElementById(id),all=root=>[root,...root.querySelectorAll('*')];
    const ancestorWithClass=(node,className)=>{for(let parent=node?.parentElement;parent;parent=parent.parentElement)if(parent.classList?.contains?.(className)||parent.className?.split?.(/\s+/).includes(className))return parent;return null;};
    const hasClass=(node,className)=>node?.classList?.contains?.(className)||node?.className?.split?.(/\s+/).includes(className);
    const isLive=node=>node?.isConnected===true||(node?.isConnected!==false&&doc.documentElement.contains?.(node));
    // Hidden nodes (V-169: loading screen, a page not built yet, a hidden tab or view) wait without loading until a
    // ResizeObserver reports them laid out, then bind once; without ResizeObserver only a later decorate binds them.
    const waiting=new Set(),revealed=win.ResizeObserver?new win.ResizeObserver(entries=>{for(const {target} of entries)if(waiting.has(target)&&visible(target)){release(target);if(current()&&isLive(target))bindNode(target);}}):null;
    function wait(node){if(revealed&&!waiting.has(node)){waiting.add(node);revealed.observe(node);}}
    function release(node){if(waiting.delete(node))revealed.unobserve(node);}
    function pruneTracked(){for(const node of tracked)if(!isLive(node))tracked.delete(node);for(const node of waiting)if(!isLive(node))release(node);}
    function addCaption(host,className,text){
        if(!text)return;
        let caption=host.querySelector?.('.'+className)||all(host).slice(1).find(node=>hasClass(node,className));
        if(!caption){caption=doc.createElement('span');caption.className=className;caption.setAttribute('aria-hidden','true');host.append(caption);}
        if(caption.textContent!==text)caption.textContent=text;
        if(caption.hidden===current())caption.hidden=!current();
    }
    function syncCaptionVisibility(){
        const visible=current();
        for(const node of all(doc.body))if(hasClass(node,'diorama-nav-label')||hasClass(node,'diorama-action-label'))if(node.hidden===visible)node.hidden=!visible;
    }
    const current=()=>style.get()==='diorama';
    const visible=node=>!node.getClientRects||node.getClientRects().length>0;
    function restore(node){
        const saved=originalStyles.get(node);if(!saved)return;
        for(const [name,[value,priority]] of saved){if(value)node.style.setProperty(name,value,priority);else node.style.removeProperty(name);}
        originalStyles.delete(node);
    }
    function remember(node,property){
        let saved=originalStyles.get(node);if(!saved){saved=new Map();originalStyles.set(node,saved);}
        if(!saved.has(property))saved.set(property,[node.style.getPropertyValue(property),node.style.getPropertyPriority(property)]);
    }
    function useUrl(node,url,property,eager){
        if(!node||!url)return;
        if(!current()){restore(node);return;}
        if(!isLive(node))return;
        if(!eager&&!visible(node))return wait(node);
        release(node);tracked.add(node);
        let state=checked.get(url);
        if(state==='loaded')return paint(node,property,url);
        if(state==='failed')return style.fallback('classic');
        if(state==='loading')return;
        checked.set(url,'loading');
        const image=new win.Image();image.onload=()=>{checked.set(url,'loaded');if(current()){pruneTracked();tracked.forEach(bindNode);}};
        image.onerror=()=>{checked.set(url,'failed');style.fallback('classic');};image.src=url;
    }
    function setArt(node,domain,key){
        const url=assets[domain]?.[key];if(!node||!url)return;
        const binding=domain+':'+key,existing=node.dataset.dioramaArt;
        if(domain==='ui'&&existing&&!existing.startsWith('ui:'))return;
        if(existing!==binding)node.dataset.dioramaArt=binding;
        useUrl(node,url,'--diorama-art');
    }
    function paint(node,property,url){
        if(!current())return restore(node);
        const value='url('+JSON.stringify(url)+')';if(node.style.getPropertyValue(property)===value)return;
        remember(node,property);
        node.style.setProperty(property,value);
    }
    function scene(node,key){
        const url=assets.scenes?.[key]||assets.biomes?.[key]||assets.terrain?.[key];if(!node||!url)return;
        if(node.dataset.dioramaScene!==key)node.dataset.dioramaScene=key;
        // Map pictures (V-164) paint their own biome even while their workshop view is hidden: an unpainted picture
        // would show the page scene it inherits. The map chamber scene follows the visible map card (mapsScene).
        const biome=!!assets.biomes?.[key];useUrl(node,url,'--diorama-scene',biome&&hasClass(node,'mobile-biome-art'));
        const page=biome&&node.closest?.('.mobile-page');if(page&&page!==node&&page.id!=='mobile-maps')scene(page,key);
    }
    // Map chamber scene: the biome of the visible selected map, else of the visible workshop preview, never a list
    // thumbnail; without a visible card the stylesheet's neutral clearing.
    function mapsScene(){
        const page=element('mobile-maps');if(!page?.dataset)return;
        const art=['mobile-selected-biome','mobile-create-biome'].map(id=>element(id)?.children?.[0]).find(node=>node?.dataset?.biome&&visible(node));
        if(art)return scene(page,art.dataset.biome);
        if(page.dataset.dioramaScene!==undefined){delete page.dataset.dioramaScene;restore(page);tracked.delete(page);}
    }
    function sceneCategory(){
        const content=element('mobile-colony-content');if(!content)return;
        const key={buildings:'building-workshop',equipment:'equipment-armory',jobs:'jobs-camp',upgrades:'research-laboratory'}[content.dataset.category]||'colony';
        scene(content,key);
    }
    // Page key for the per-page Diorama layers: the bottom-navigation page, or the colony tab on the colony page.
    function syncPage(){
        const body=doc.body;if(!body?.dataset)return;
        const page=body.dataset.mobilePage,key=page==='colony'?element('mobile-colony-content')?.dataset?.category||'resources':page;
        if(key&&body.dataset.dioramaPage!==key)body.dataset.dioramaPage=key;
    }
    function sceneTooltip(){
        const title=element('tipTitle')?.textContent?.toLowerCase()||'';
        const key=title.includes('alchemy')?'alchemy':title.includes('spire assault')?'spire-assault':null;
        const tip=element('tooltipDiv');if(key)scene(tip,key);else if(['alchemy','spire-assault'].includes(tip?.dataset?.dioramaScene)){delete tip.dataset.dioramaScene;restore(tip);}
    }
    // V-197: the original Loot Breakdown tabs carry no open state; mark the tab whose name starts the window title.
    // V-270: the title stays English while German shows "Edelsteine"/"Fragmente" on the tabs, so the tab's original
    // getLootBd('…') name counts as well; the visible text still decides for Helium, which the title calls Radon in Universe 2.
    const lootTabName=li=>/getLootBd\('([^']+)'\)/.exec(li.getAttribute?.('onclick')||'')?.[1];
    function markLootTab(){
        const tabs=element('lootBdTabs');if(!tabs)return;
        const title=element('tipTitle')?.textContent||'';
        for(const li of tabs.children){const open=[li.textContent.trim(),lootTabName(li)].some(name=>name&&title.startsWith(name+' '));if(open===('dioOpen' in li.dataset))continue;if(open)li.dataset.dioOpen='';else delete li.dataset.dioOpen;}
    }
    // V-257: a breakdown table wider than the window (Loot Breakdown, Health/Attack …) is scaled through --dio-bd-fit before
    // it would scroll sideways, never below 10px text (and never below 60 %): only then does it scroll. Padding and borders
    // do not scale exactly, so it is measured again until it fits. Measured once per frame and only when the window's text or width
    // changed; writing the scale does not count as a change.
    let tableKey='',tableFrame=0;const slashBreak=/\/(?=[^\s\u200b])/g;
    function fitTables(){
        const text=element('tipText'),tables=[...(text?.querySelectorAll?.('.bdTable,.bdTableSm')||[])];
        // Column heads like Food/Wood/Metal may wrap after their slashes: a zero-width space in the same text node, so the
        // visible text and its translation stay whole (an extra node would split the head for the translation layer).
        if(current())for(const table of tables)for(const cell of table.rows?.[0]?.cells||[])for(const node of cell.childNodes||[])
            if(node.nodeType===3){const next=node.textContent.replace(slashBreak,'/\u200b');if(next!==node.textContent)node.textContent=next;}
        const key=current()+'|'+(text?.clientWidth||0)+'|'+tables.map(t=>t.textContent.length).join(',')+'|'+(element('tipTitle')?.textContent||'');
        if(key===tableKey)return;tableKey=key;
        for(const table of tables){
            if(!table.style)continue;table.style.removeProperty('--dio-bd-fit');
            if(!current()||!table.clientWidth)continue;
            // The smallest text of the table decides: the column heads (.78rem) are a little smaller than the cells (.8rem).
            const sizes=[table.rows?.[0]?.cells?.[0],table.rows?.[1]?.cells?.[0]].filter(Boolean).map(cell=>win.getComputedStyle?parseFloat(win.getComputedStyle(cell).fontSize)||0:0).filter(Boolean);
            const size=sizes.length?Math.min(...sizes):0,least=Math.min(1,Math.max(.6,size?Math.ceil(10/size*1000)/1000:.7));
            for(let fit=1,i=0;i<4&&table.scrollWidth>table.clientWidth+.5&&fit>least;i++){
                fit=Math.max(least,Math.floor(fit*(table.clientWidth-.5)/table.scrollWidth*1000)/1000);table.style.setProperty('--dio-bd-fit',fit.toFixed(3));
            }
        }
    }
    function scheduleTables(){if(tableFrame)return;tableFrame=(win.requestAnimationFrame||(cb=>setTimeout(cb,16)))(()=>{tableFrame=0;fitTables();});}
    function bindNode(node){
        if(!node||node.nodeType&&node.nodeType!==1)return;
        if(node.id?.startsWith('mobile-nav-')&&node.parentElement?.id==='mobile-nav')addCaption(node,'diorama-nav-label',node.getAttribute?.('aria-label')||node.title||'');
        const tile=ancestorWithClass(node,'mobile-inventory-tile');
        if(tile&&hasClass(node,'thing')){
            const action=tile.dataset.type==='equipment'?'Upgrade':tile.dataset.type==='buildings'?'Buy':'';
            addCaption(node,'diorama-action-label',action);
        }
        for(const [domain,roots] of Object.entries(targets)){
            const keys=assets[domain]||{};
            if(roots.some(id=>element(id)===node))for(const [key] of Object.entries(keys))if(node.id===key||node.id===key.toLowerCase())setArt(node,domain,key);
            for(const [key] of Object.entries(keys))if(node.id===key||node.id===key.toLowerCase()){
                setArt(node,domain,key);
                if(domain==='jobs')setArt(ancestorWithClass(node,'mobile-purchase'),'jobs',key);
            }
        }
        if(node.matches)for(const [key,selector] of Object.entries(uiTargets))if(assets.ui?.[key]&&node.matches(selector))setArt(node,'ui',key);
        for(const [key,ids] of Object.entries(scenes))if(ids.includes(node.id))scene(node,key);
        if(node.dataset?.biome)scene(node,node.dataset.biome);
        if(node.dataset?.dioramaScene){const url=assets.scenes?.[node.dataset.dioramaScene]||assets.biomes?.[node.dataset.dioramaScene]||assets.terrain?.[node.dataset.dioramaScene];if(url)useUrl(node,url,'--diorama-scene');}
    }
    function decorate(root=doc.body){
        if(!root)return;
        pruneTracked();
        for(const node of all(root))bindNode(node);
        if(root===doc.body){
            if(assets.terrain?.['terrain-grass'])scene(element('mobile-battle'),'terrain-grass');
            sceneCategory();sceneTooltip();
            for(const id of targets.biomes){const node=element(id);if(node){if(node.dataset.biome)scene(node,node.dataset.biome);for(const child of node.querySelectorAll('[data-biome]'))scene(child,child.dataset.biome);}}
            mapsScene();
        }
    }
    let scheduled=false;const pending=new Set();
    function schedule(records){
        if(records?.length){for(const record of records){if(record.type==='attributes'&&record.attributeName==='data-biome')scene(record.target,record.target.dataset.biome);if(record.target?.nodeType===1)pending.add(record.target);for(const node of record.addedNodes||[])if(node.nodeType===1)pending.add(node);}}
        else pending.add(doc.body);
        if(scheduled)return;scheduled=true;win.requestAnimationFrame(()=>{scheduled=false;for(const root of pending)decorate(root);pending.clear();mapsScene();});
    }
    doc.addEventListener?.('scruffy:graphic-style',()=>{if(current())decorate();else{tracked.forEach(restore);tracked.clear();waiting.forEach(release);}syncCaptionVisibility();syncSelect();fitNames();fitAttacks();fitTables();});
    for(const id of ['buildingsHere','equipmentHere','resourcesHere','resourceColumn','miscColumn','mobile-colony-resources','jobsHere','upgradesHere','mobile-equipment-research','mapsHere','voidMapsHere','challengesHere','equippedHeirlooms','carriedHeirloomsHere','extraHeirloomsHere','heirloomWrapper','portalWrapper','mobile-more','mutTreeWrapper','autoBattleMenuButtons','playerSpirePopout','mobile-nav']){
        const root=element(id);if(root)new win.MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    }
    for(const id of ['preMaps','mapConfigContainer','portalWrapper','heirloomWrapper','tooltipDiv','mutTreeWrapper','playerSpirePopout']){const root=element(id);if(root)new win.MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['style','hidden']});}
    // Workshop views, the selected-map card and the page itself switch through `hidden`: the chamber scene follows.
    const mapsPage=element('mobile-maps');if(mapsPage)new win.MutationObserver(schedule).observe(mapsPage,{attributes:true,attributeFilter:['hidden'],subtree:true});
    const misc=element('miscColumn');if(misc)new win.MutationObserver(schedule).observe(misc,{attributes:true,attributeFilter:['style','hidden'],subtree:true});
    const content=element('mobile-colony-content');if(content)new win.MutationObserver(records=>{syncPage();sceneCategory();schedule(records);}).observe(content,{attributes:true,attributeFilter:['data-category']});
    new win.MutationObserver(records=>{syncPage();schedule(records);fitNames();scheduleAttacks();}).observe(doc.body,{attributes:true,attributeFilter:['data-mobile-page']});
    const tooltip=element('tooltipDiv');if(tooltip)new win.MutationObserver(records=>{sceneTooltip();markLootTab();scheduleTables();schedule(records);}).observe(tooltip,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['style','hidden']});
    for(const id of ['mobile-create-biome','mobile-selected-biome','mobile-maps-scene']){const root=element(id);if(root)new win.MutationObserver(records=>{for(const record of records)if(record.type==='attributes'&&record.attributeName==='data-biome')scene(record.target,record.target.dataset.biome);schedule();}).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-biome']});}
    // Current cell for the zone sign ("Cell 2 of 100"): the original grid holds no cell number, so the
    // original counters are mirrored as data attributes whenever the world or map grid changes.
    function syncCell(){
        const title=element('battleSideTitle'),global=win.game?.global;if(!title||!global)return;
        const inMap=!!global.mapsActive,cells=(inMap?global.mapGridArray:global.gridArray)?.length||0,cleared=Math.max(0,(inMap?global.lastClearedMapCell:global.lastClearedCell)+1);
        const values={cell:String(Math.min(cleared+1,cells)),cells:String(cells)};
        for(const [key,value] of Object.entries(values))if(title.dataset[key]!==value)title.dataset[key]=value;
        // Biome of the running map (original map location) for the painted map ground; the attribute paints nothing in classic.
        const mapGrid=element('mapGrid');if(!mapGrid)return;
        const biome=inMap?String(win.getCurrentMapObject?.()?.location||''):'';
        if(biome&&mapGrid.dataset.biome!==biome)mapGrid.dataset.biome=biome;else if(!biome&&mapGrid.dataset.biome!==undefined)delete mapGrid.dataset.biome;
    }
    for(const id of ['grid','mapGrid']){const root=element(id);if(root)new win.MutationObserver(syncCell).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});}
    // Combat card names stay on one line (V-143): a name wider than its row is scaled down through --dio-name-fit
    // (to 45 % at most, then the stylesheet's ellipsis) instead of wrapping, so the health bars never move. Classic never
    // reads the variable; a hidden card (width 0) keeps the base size until it is measured again.
    function fitNames(){
        for(const id of ['goodGuyName','badGuyName']){
            const node=element(id),title=id==='badGuyName'?node?.parentElement:node;if(!title?.style)continue;
            const old=title.style.getPropertyValue('--dio-name-fit');title.style.removeProperty('--dio-name-fit');
            const room=current()?title.clientWidth:0,need=room?title.scrollWidth:0;
            let fit=room>0&&need>room+1?Math.max(.45,room/need).toFixed(3):'';
            if(fit)title.style.setProperty('--dio-name-fit',fit);else if(old)title.style.removeProperty('--dio-name-fit');
            // V-218: badges keep their size, so the first scale can leave the row a fraction too wide, and the ellipsis
            // then replaces the last badge; shrink the text twice more at most by what is still missing, plus 1px.
            const over=()=>{if(!doc.createRange)return title.scrollWidth-title.clientWidth;const r=doc.createRange();r.selectNodeContents(title);return r.getBoundingClientRect().width-title.clientWidth;};
            for(let i=0,o;fit&&i<2&&+fit>.45&&(o=over())>0;i++){
                fit=Math.max(.45,fit*(title.clientWidth-o-1)/title.clientWidth).toFixed(3);title.style.setProperty('--dio-name-fit',fit);
            }
        }
    }
    // Combat ticks rewrite counters inside the name rows several times a second: measure at most once per frame and only
    // when the visible names changed (or the window was resized).
    // V-218: the enemy row is its whole title: the badges beside the name (#corruptionBuff, #voidBuff, #badDebuffSpan …)
    // are siblings of #badGuyName, and a badge added after the name must refit the row instead of ending it in an ellipsis.
    let fitFrame=0,fitForce=false,fitText='';
    const nameRow=id=>id==='badGuyName'?element(id)?.parentElement:element(id);
    const nameText=()=>['goodGuyName','badGuyName'].map(id=>(nameRow(id)?.textContent||'')+'#'+(nameRow(id)?.querySelectorAll?.('.badge').length||0)).join('|');
    function scheduleFit(force){fitForce=fitForce||force===true;if(fitFrame)return;fitFrame=(win.requestAnimationFrame||(cb=>setTimeout(cb,16)))(()=>{fitFrame=0;const text=nameText();if(!fitForce&&text===fitText)return;fitForce=false;fitText=text;fitNames();});}
    for(const id of ['goodGuyName','badGuyName']){const root=nameRow(id);if(root)new win.MutationObserver(()=>scheduleFit()).observe(root,{childList:true,subtree:true,characterData:true});}
    win.addEventListener?.('resize',()=>scheduleFit(true));
    // Attack lines stay on one line (V-207/V-209): the plaque has its own reserved column; when a very long value still
    // does not fit its column, the value alone is scaled down through --dio-atk-fit on its line (to 55 % at most, then the
    // stylesheet's ellipsis). Values change every attack: measured at most once per frame, only on a change. V-254: the
    // enemy plaque leaves its line and sits as a tag on the right end of the enemy's health bar, so the enemy value always
    // has its column plus the plaque column; the bar's middle and right end are measured first, relative to the plaque's
    // positioned ancestor (--dio-bar-mid/--dio-bar-right on the card).
    const attackLines=()=>['goodGuyAttack','badGuyAttack'].map(element).filter(Boolean);
    // Only the combat pages are measured: the game keeps fighting behind the other tabs.
    const combatPage=()=>/^(battle|maps)$/.test(doc.body?.dataset?.dioramaPage||'');
    let hpKey='';
    function fitAttacks(){
        const active=current()&&combatPage();
        const enemy=element('badGuyCol'),bar=element('badGuyBar')?.parentElement,host=element('badCrit')?.offsetParent;
        let barMid='',barRight='';
        if(active&&bar?.offsetHeight&&host?.getBoundingClientRect){const b=bar.getBoundingClientRect(),h=host.getBoundingClientRect();
            // Absolute offsets start at the padding edge, inside the card's border.
            barMid=Math.round(b.top+b.height/2-h.top-(host.clientTop||0))+'px';barRight=Math.round(h.left+(host.clientLeft||0)+(host.clientWidth||h.right-h.left)-b.right)+'px';}
        if(enemy?.style)for(const [name,value] of [['--dio-bar-mid',barMid],['--dio-bar-right',barRight]])
            if(enemy.style.getPropertyValue(name)!==value){if(value)enemy.style.setProperty(name,value);else enemy.style.removeProperty(name);}
        for(const value of attackLines()){
            const line=value.parentElement;if(!line?.style)continue;
            const old=line.style.getPropertyValue('--dio-atk-fit');line.style.removeProperty('--dio-atk-fit');
            const room=active?value.clientWidth:0,need=room?value.scrollWidth:0;
            const fit=room>0&&need>room?Math.max(.55,Math.floor((room-.5)/need*1000)/1000).toFixed(3):'';
            if(fit)line.style.setProperty('--dio-atk-fit',fit);else if(old)line.style.removeProperty('--dio-atk-fit');
        }
        // The enemy health value leaves room for the Loot chip at the end of its line and is fitted the same way; health
        // changes every hit, so it is measured again only when its length, its room, the page or the window width changed.
        const card=element('badGuyCol'),health=card?.querySelector?.('.mobile-health-value');
        const key=active+'|'+(health?.textContent.length||0)+'|'+(health?.clientWidth||0)+'|'+(win.innerWidth||0);
        if(card?.style&&health&&key!==hpKey){hpKey=key;card.style.removeProperty('--dio-hp-fit');
            // The value is a flex row of spans: its scrollWidth does not report the clipped last span, the text range does.
            const room=active?health.clientWidth:0;let need=room?health.scrollWidth:0;
            if(room&&doc.createRange){const r=doc.createRange();r.selectNodeContents(health);need=Math.max(need,r.getBoundingClientRect().width);}
            if(room>0&&need>room)card.style.setProperty('--dio-hp-fit',Math.max(.55,Math.floor((room-.5)/need*1000)/1000).toFixed(3));}
        // V-221: the Loot chip is centred on the health line itself. The card stretches to the height of the Scruffies card
        // beside it (a block line there), so an offset from the card bottom would land on the bar or the attack line.
        const life=card?.querySelector?.('.mobile-life'),mid=active&&life?.offsetHeight?Math.round(life.offsetTop+life.offsetHeight/2)+'px':'';
        if(card?.style&&card.style.getPropertyValue('--dio-life-mid')!==mid){if(mid)card.style.setProperty('--dio-life-mid',mid);else card.style.removeProperty('--dio-life-mid');}
    }
    let atkFrame=0;
    function scheduleAttacks(){if(atkFrame)return;atkFrame=(win.requestAnimationFrame||(cb=>setTimeout(cb,16)))(()=>{atkFrame=0;fitAttacks();});}
    // V-254: a plaque coming or going is placed on the enemy's health bar (measured with the attack lines).
    for(const id of ['goodGuyAttack','badGuyAttack','badCrit','badGuyHealth','badGuyHealthMax']){const root=element(id);if(root)new win.MutationObserver(scheduleAttacks).observe(root,{childList:true,subtree:true,characterData:true});}
    win.addEventListener?.('resize',()=>{scheduleAttacks();scheduleTables();});
    function syncSelect(){if(select)select.value=style.get();}
    let select;
    const assetsReady=Object.values(assets).some(group=>group&&Object.keys(group).length);
    win.MobileMore?.registerPage('graphic-style','Graphic style','app',host=>{
        const label=doc.createElement('label'),name=doc.createElement('span');label.className='mobile-graphic-style';name.textContent='Graphic style';
        select=doc.createElement('select');select.setAttribute('aria-label','Graphic style');
        for(const [value,text] of [['diorama','Diorama'],['classic','Classic']]){const option=doc.createElement('option');option.value=value;option.textContent=text;select.append(option);}
        select.value=style.get();select.addEventListener('change',()=>{if(select.value==='diorama'&&!assetsReady)style.fallback('classic');else style.set(select.value);});label.append(name,select);host.append(label);
    });
    syncPage();syncCell();decorate();fitNames();fitAttacks();
    if(style.get()==='diorama'&&!assetsReady)style.fallback('classic');
    return {refresh:decorate,fitNames,fitAttacks,fitTables,markLootTab};
};

if(typeof module!=='undefined'&&module.exports)module.exports={create:createMobileDiorama};
if(typeof window!=='undefined'&&window.document)window.MobileDiorama=createMobileDiorama(window);
