// Presentation only: reuse original controls, identity, prices, unlocks and actions.
var MobileMapWorkshop = (() => {
    const t=value=>typeof MobileI18n==='undefined'?value:MobileI18n.t(value);
    const byId=id=>document.getElementById(id),art={Forest:[0,0],Mountain:[768,0],Sea:[0,512],Depths:[768,512]};
    let view='create',state=null,lastSelectedText='';
    const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const button=(text,action)=>{const n=el('button','',text);n.type='button';n.onclick=action;return n;};
    function translateLabels(root){if(!root||typeof MobileI18n==='undefined'||MobileI18n.lang!=='de')return;if(root.id==='selectedMapContainer')byId('mobile-selected-map-stats').style.gridTemplateColumns='repeat(auto-fit,minmax(120px,1fr))';const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const node=walker.currentNode,next=t(node.data);if(next!==node.data)node.data=next;}}
    // Classic pictures for the other map locations (V-165): Atlantis shares the Sea painting, Gardens (location
    // "Plentiful") and Farmlands show their biome tile, special maps a symbol; unknown locations keep the neutral mark.
    // Diorama paints every known location from DioramaAssets.biomes over these (mobile-diorama-map-specials.js).
    const sprite={Atlantis:'Sea'},tile={Plentiful:'M06-Gardens.webp',Farmlands:'M07-Farmlands.webp'};
    const glyph={Void:'◇',Darkness:'◐',Hell:'♨',Wall:'▦',Block:'◘',Doom:'⌂',Prison:'▥',Bionic:'⚙',Star:'✶',Melting:'⚒',Frozen:'❄',Prismatic:'◆'};
    function picture(biome,cls=''){
        const box=el('div','mobile-biome-art '+cls);box.setAttribute('aria-hidden','true');box.dataset.biome=biome;
        const painting=art[biome]||art[sprite[biome]];
        if(painting){
            const [x,y]=painting;box.innerHTML='<svg viewBox="'+x+' '+y+' 768 512" preserveAspectRatio="xMidYMid slice"><image href="mobile-assets/map-biomes.png" width="1536" height="1024"/></svg>';
        }else if(tile[biome]){
            box.innerHTML='<svg viewBox="0 0 444 444" preserveAspectRatio="xMidYMid meet"><image href="mobile-assets/diorama/'+tile[biome]+'" width="444" height="444"/></svg>';
        }else {box.classList.add('mobile-biome-neutral');box.append(el('span','',glyph[biome]||'⌘'));}
        return box;
    }
    function setPicture(host,biome){if(host.firstElementChild?.dataset.biome!==biome)host.replaceChildren(picture(biome));}
    const selected=()=>game.global.mapsOwnedArray.find(m=>m.id===(game.global.currentMapId||game.global.lookingAtMap));
    const resource=map=>game.mapConfig.locations[map.location]?.resourceType;
    const scales=map=>map.location==='Void'||map.location==='Darkness';
    const level=map=>scales(map)?game.global.world:map.level;
    function show(next){if(next==='create'&&game.global.voidMapsToggled)toggleVoidMaps();view=next;refresh();window.scrollTo(0,0);}
    function setup(){
        const pre=byId('preMaps'),create=el('section'),list=el('section');create.id='mobile-workshop-create';list.id='mobile-workshop-list';
        create.setAttribute('aria-label',t('Map Workshop'));list.setAttribute('aria-label',t('My Maps'));
        const children=[...pre.children];
        for(const id of ['mapsCreateRow','advMapsRow','advMapsRow2'])create.append(byId(id));
        for(const n of children)if(n.parentElement===pre)list.append(n);
        pre.append(create,list);
        list.append(byId('mobile-map-state'),byId('mobile-map-transition'));
        const stock=el('p','mobile-list-fragments');stock.id='mobile-list-fragments';list.prepend(stock);
        const tabs=el('nav','mobile-workshop-tabs');tabs.setAttribute('aria-label','Map views');
        const createTab=button(t('Create Map'),()=>show('create')),listTab=button(t('My Maps'),()=>show('list'));createTab.id='mobile-workshop-create-tab';listTab.id='mobile-workshop-list-tab';tabs.append(createTab,listTab);
        pre.before(byId('mobile-map-presets-head'),tabs);
        byId('mobile-map-presets-head').querySelector('h2').textContent=t('Map Workshop');
        byId('mobile-map-presets-head').after(byId('mobile-map-world'));
        const hero=el('div','mobile-workshop-hero');hero.id='mobile-create-biome';
        const caption=el('p','mobile-biome-caption');caption.id='mobile-create-biome-caption';
        create.prepend(hero,caption,byId('mobile-fragments'));
        byId('mobile-maps-scene').hidden=true;
        const bench=byId('mobile-map-presets'),benchTitle=el('h3','',t('Map Presets'));bench.prepend(benchTitle);
        const details=el('details','mobile-preset-options'),summary=el('summary','',t('Manage preset'));details.append(summary,bench.querySelector('.mobile-map-preset-actions'),byId('mobile-preset-note'));bench.append(details);
        const biome=byId('advBiomeContainer'),tiles=el('div','mobile-biome-tiles');tiles.id='mobile-biome-tiles';
        for(const name of Object.keys(art)){const b=button('',()=>{const select=byId('biomeAdvMapsSelect');select.value=name;select.dispatchEvent(new Event('change',{bubbles:true}));refresh();});b.dataset.biome=name;b.append(picture(name),el('span','',name));tiles.append(b);}
        biome.append(tiles);byId('mapLevelContainer').after(biome);
        const advanced=el('details','mobile-map-advanced');advanced.id='mobile-map-advanced';advanced.append(el('summary','',t('More options')),byId('advMapsRow2'));create.append(advanced);
        const createActions=el('div','mobile-map-create-actions');createActions.append(byId('mapCostContainer'),byId('mapCreateBtn'));create.append(createActions);
        const buy=byId('mapCreateBtn').onclick;byId('mapCreateBtn').textContent=t('Create map');byId('mapCreateBtn').onclick=function(event){const count=game.global.mapsOwnedArray.length;buy.call(this,event);if(game.global.mapsOwnedArray.length>count)show('list');};
        byId('advMapsRecycleBtn').textContent=t('Recycle All');
        const selectedHero=el('div','mobile-workshop-hero');selectedHero.id='mobile-selected-biome';byId('selectedMapContainer').prepend(selectedHero);
        const meta=el('p','mobile-map-meta');meta.id='mobile-selected-map-meta';byId('selectedMapName').after(meta);
        const name=byId('selectedMapName');name.setAttribute('role','button');name.tabIndex=0;name.onclick=()=>{const map=selected();if(map)info(map.id);};
        byId('biomeAdvMapsSelect').addEventListener('change',refresh);
        // Added map cards retain their original selection handlers; only the name opens Info.
        for(const id of ['mapsHere','voidMapsHere'])byId(id).addEventListener('click',event=>{const name=event.target.closest('.thingName');if(name){event.stopPropagation();info(name.closest('.mapThing').id);}},true);
        translateLabels(create);
        refresh();
    }
    function fields(map){
        const values=[['Level',String(level(map))+(scales(map)?' · '+t('scales with Zone'):'')],['Biome',t(map.location)],['Resource',t(resource(map)||'—')],['Cells',map.size],['Difficulty',Math.floor(map.difficulty*100)+'%'],['Loot',Math.floor(map.loot*100)+'%'],['Items',map.location==='Void'?'—':itemCount(map)]];
        values.forEach(([label,value],i)=>values[i]=[t(label),value]);
        if(map.bonus&&mapSpecialModifierConfig[map.bonus])values.push([t('Special'),mapSpecialModifierConfig[map.bonus].name||mapSpecialModifierConfig[map.bonus].abv]);
        if(map.voidBuff&&voidBuffConfig[map.voidBuff])values.push([t('Void effect'),voidBuffConfig[map.voidBuff].title]);
        return values;
    }
    function itemCount(map){
        // The original count-only routine advances the seasonal egg seed. Info must not do so.
        const seed=game.global.eggSeed;try{return addSpecials(true,true,scales(map)?{...map,level:level(map)}:map);}finally{game.global.eggSeed=seed;}
    }
    function info(id){
        const map=game.global.mapsOwnedArray.find(m=>m.id===id);if(!map)return;
        const body=el('div','mobile-map-info'),hero=picture(map.location,'mobile-workshop-hero');body.append(hero,el('h2','',map.name));
        const grid=el('dl','mobile-map-info-values');body.append(grid);
        const run=el('section','mobile-map-run');run.append(el('h3','',t('This run')));const time=el('p'),items=el('p'),progress=el('p');run.append(time,items,progress);body.append(run);
        const actions=el('div','mobile-map-info-actions'),combat=button(t('Go to current combat'),()=>{cancelTooltip();TrimpsUI.select('battle');});actions.append(button(t('Back'),()=>cancelTooltip()),combat);body.append(actions);
        const update=()=>{
            const values=fields(map);values.forEach(([label,value],index)=>{let field=grid.children[index];if(!field){field=el('div');field.append(el('dt','',label),el('dd'));grid.append(field);}if(field.lastElementChild.textContent!==String(value))field.lastElementChild.textContent=String(value);});
            const current=game.global.currentMapId===id,elapsed=current&&game.global.mapStarted>0?(getGameTime()-game.global.mapStarted)/1000:null;
            run.hidden=!current;
            combat.hidden=!current;
            time.textContent=Number.isFinite(elapsed)&&elapsed>=0?t(formatSecondsForZoneTime(elapsed)+' in this map'):t('Time on this map is unavailable');
            items.textContent=map.location==='Void'?t('Items: individual count unavailable'):t(values.find(([label])=>label===t('Items'))[1]+' items still available');
            progress.textContent=t(Math.max(0,game.global.lastClearedMapCell+1)+' / '+map.size+' cells completed');
        };update();
        TrimpsUI.infoAction(()=>{tooltip('Map info','customText','update','');byId('tipText').replaceChildren(body);},false);
        const origin=game.global;
        tooltipUpdateFunction=()=>{if(!body.isConnected||game.global!==origin||!game.global.mapsOwnedArray.includes(map)){tooltipUpdateFunction='';return;}update();};
    }
    function refresh(){
        if(typeof MobileMapControls!=='undefined')MobileMapControls.refresh();
        if(!byId('mobile-workshop-create'))return;
        if(state!==game.global){state=game.global;view='create';}
        if(game.global.voidMapsToggled)view='list';
        const balance=el('span');balance.innerHTML=prettify(game.resources.fragments.owned);const balanceText=t('Fragments')+' · '+balance.textContent;if(byId('mobile-list-fragments').textContent!==balanceText)byId('mobile-list-fragments').textContent=balanceText;
        byId('mobile-workshop-create').hidden=view!=='create';byId('mobile-workshop-list').hidden=view!=='list';
        if(typeof MobileMapPresets!=='undefined')MobileMapPresets.refresh(view);
        const title=t(view==='manage'?'Manage preset':view==='create'?'Map Workshop':'My Maps'),heading=byId('mobile-map-presets-head').querySelector('h2');if(heading.textContent!==title)heading.textContent=title;
        for(const v of ['create','list'])byId('mobile-workshop-'+v+'-tab').setAttribute('aria-pressed',String(v===view));
        const biome=byId('biomeAdvMapsSelect').value;setPicture(byId('mobile-create-biome'),biome);
        const caption=t(biome)+' · '+t(game.mapConfig.locations[biome]?.resourceType||'Random biome');if(byId('mobile-create-biome-caption').textContent!==caption)byId('mobile-create-biome-caption').textContent=caption;
        for(const tile of byId('mobile-biome-tiles').children){tile.hidden=![...byId('biomeAdvMapsSelect').options].some(o=>o.value===tile.dataset.biome&&!o.disabled);tile.setAttribute('aria-pressed',String(tile.dataset.biome===biome));}
        byId('mobile-map-advanced').hidden=byId('advMapsRow2').style.display==='none';
        const map=selected(),selectedContainer=byId('selectedMapContainer');selectedContainer.hidden=!map;
        if(map){setPicture(byId('mobile-selected-biome'),map.location);const text=t((scales(map)?'Zone '+level(map)+' · scales with Zone':'Lv '+map.level)+' · '+map.location+' · '+(resource(map)||'—')+' · '+map.size+' cells');if(byId('mobile-selected-map-meta').textContent!==text)byId('mobile-selected-map-meta').textContent=text;byId('selectedMapName').setAttribute('aria-label',t('Map info: '+map.name));if(map.location==='Darkness')byId('mapStatsItems').textContent=String(itemCount(map));const selectedText=selectedContainer.textContent;if(selectedText!==lastSelectedText){translateLabels(selectedContainer);lastSelectedText=selectedContainer.textContent;}}
        for(const map of game.global.mapsOwnedArray){const card=byId(map.id);if(!card?.classList.contains('mapThing'))continue;
            if(!card.querySelector('.mobile-map-thumb')){card.prepend(picture(map.location,'mobile-map-thumb'));const meta=el('span','mobile-map-card-meta');card.append(meta);}
            const cardMeta=card.querySelector('.mobile-map-card-meta'),cardText=t(map.location)+' · '+t(resource(map)||'—');if(cardMeta.textContent!==cardText)cardMeta.textContent=cardText;
            // The shared TrimpsUI keyboard delegate already activates role=button exactly once.
            const name=card.querySelector('.thingName');name?.setAttribute('role','button');if(name){name.tabIndex=0;name.setAttribute('aria-label',t('Map info: '+map.name));}
        }
    }
    setup();return {refresh,show,info,itemCount,currentView:()=>view};
})();
