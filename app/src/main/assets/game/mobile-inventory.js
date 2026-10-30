// Selected C layouts. Original prices, purchase handlers, owned IDs and efficiency classes remain authoritative.
var MobileInventory = (() => {
    const resourceNames = {food:'Food',wood:'Wood',metal:'Metal',gems:'Gems',helium:'Helium',science:'Science',fragments:'Fragments',radon:'Radon'};
    function share(cost, owned) {
        if (cost === 0) return '0%';
        const percent = cost / owned * 100;
        if (!Number.isFinite(percent)) return '∞%';
        if (percent < .1) return '<0.1%';
        if (percent >= 1000) {
            const units = [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']];
            const [unit,label] = units.find(([unit]) => percent >= unit);
            return new Intl.NumberFormat('en-US',{maximumFractionDigits:1,useGrouping:false}).format(percent / unit) + label + '%';
        }
        return new Intl.NumberFormat('en-US',{maximumFractionDigits:percent < 1 ? 1 : 0}).format(percent) + '%';
    }
    function queueCounts(entries) {
        return new Map(queueGroups(entries).map(group => [group.name,group.count]));
    }
    function queueGroups(entries) {
        const groups = new Map();
        entries.forEach((entry,index) => {
            const [name,amount] = entry.split('.');
            if (!groups.has(name)) groups.set(name,{name,count:0,indices:[]});
            const group=groups.get(name);group.count+=Number(amount||1);group.indices.push(index);
        });
        return [...groups.values()];
    }
    function purchaseState(name,equipment) {
        const blocked=label=>({key:'unavailable',label});
        if(name==='Hub')return blocked('Automatic');
        if(game[equipment?'equipment':'buildings'][name].locked)return blocked('Not unlocked');
        if(game.options.menu.pauseGame.enabled)return blocked('Game paused');
        if(!equipment&&game.global.clearingBuildingQueue)return blocked('Please wait');
        if(game.options.menu.lockOnUnlock.enabled===1&&Date.now()-1000<=game.global.lastUnlock&&(equipment||!usingRealTimeOffline))return blocked('Please wait');
        if(canAffordBuilding(name,false,false,equipment,true))return {key:'buyable',label:'Available'};
        // canAffordBuilding checks this prerequisite before material costs.
        if(!equipment&&name==='Antenna'&&game.buildings.Antenna.purchased+1>Math.floor((game.global.highestRadonLevelCleared-100)/5))return blocked('Requirement not met');
        return blocked(prices(name,equipment).some(p=>p.missing)?'Not enough resources':'Requirement not met');
    }
    function amountFor(object,equipment) {
        return game.global.buyAmt === 'Max' ? Math.max(1,calculateMaxAfford(object,!equipment,equipment)) : game.global.buyAmt;
    }
    function prices(name, equipment) {
        if (name === 'Hub') return [];
        const object = game[equipment ? 'equipment' : 'buildings'][name];
        let amount = amountFor(object,equipment);
        if (name === 'Antenna') amount = 1;
        return Object.keys(object.cost).map(resource => {
            let cost = parseFloat(getBuildingItemPrice(object,resource,equipment,amount));
            if (equipment) cost = Math.ceil(cost * getEquipPriceMult());
            else if (getPerkLevel('Resourceful')) cost = Math.ceil(cost * Math.pow(1-game.portal.Resourceful.modifier,getPerkLevel('Resourceful')));
            const owned = game.resources[resource].owned;
            // ratio is the numeric share behind the rounded label, so callers can rank costs without parsing it.
            return {resource,cost,share:share(cost,owned),ratio:cost===0?0:Number.isFinite(cost)&&owned>0?cost/owned:Infinity,missing:cost > owned || !Number.isFinite(cost)};
        });
    }
    function efficientChoices() {
        const best = {};
        if (!game.options.menu.equipHighlight.enabled) return best;
        for (const [name,item] of Object.entries(game.equipment)) {
            if (name === 'Shield' || item.locked) continue;
            const stat = item.attack ? 'attack' : item.health ? 'health' : null;
            const costs = prices(name,true);
            if (!stat || costs.length !== 1 || costs[0].resource !== 'metal') continue;
            const gain = item[stat+'Calculated'] * amountFor(item,true), ratio = costs[0].cost / gain;
            if (!(gain > 0) || !Number.isFinite(ratio)) continue;
            if (!best[stat] || ratio < best[stat].ratio) best[stat] = {name,ratio};
        }
        return best;
    }
    function buyBest(stat) {
        if(typeof MobileEquipmentResearch!=='undefined'&&!MobileEquipmentResearch.unlocked())return;
        const choice=efficientChoices()[stat];
        if(choice&&purchaseState(choice.name,true).key==='buyable')buyEquipment(choice.name);
        refresh();
    }
    function syncBestButtons(best) {
        for(const stat of ['attack','health']){
            const button=document.getElementById('mobile-buy-best-'+stat);if(!button)continue;
            const choice=best[stat],state=choice?purchaseState(choice.name,true):null;
            button.disabled=state?.key!=='buyable';
            button.setAttribute('aria-label','Buy best '+(stat==='attack'?'weapon':'armor')+(choice?': '+choice.name:''));
            button.setAttribute('aria-description',state?.label||'Enable efficiency highlighting and unlock equipment to compare.');
        }
    }
    function highlight() {
        const best = efficientChoices();
        syncBestButtons(best);
        for (const name of Object.keys(game.equipment)) {
            if (name === 'Shield') continue;
            const el = document.getElementById(name);
            if (el) swapClass('efficient',Object.values(best).some(item=>item.name===name)?'efficientYes':'efficientNo',el);
        }
        if(typeof MobilePurchaseGuidance!=='undefined'){
            const bestHouse=housingChoices();
            for(const [name,item]of Object.entries(game.buildings))if(item.increase?.what==='trimps.max'){
                const el=document.getElementById(name);if(el)swapClass('efficient',bestHouse?.name===name?'efficientYes':'efficientNo',el);
            }
        }
    }
    let rateOwner=null,rateUniverse=null,ratePaused=null,rateSnapshot=null,houseOwner=null,houseUniverse=null,houseChoice=null;
    function guidanceSnapshot(){
        const now=Date.now(),paused=Boolean(game.options.menu.pauseGame.enabled||(typeof mobileRuntimeSuspended!=='undefined'&&mobileRuntimeSuspended));
        if(rateOwner!==game||rateUniverse!==game.global.universe||ratePaused!==paused){rateOwner=game;rateUniverse=game.global.universe;ratePaused=paused;rateSnapshot=null;}
        if(rateSnapshot&&now-rateSnapshot.now<500){for(const r of Object.keys(rateSnapshot.stocks)){rateSnapshot.stocks[r]=game.resources[r].owned;rateSnapshot.caps[r]=game.resources[r].max>=0?getMaxForResource(r):Infinity;}return rateSnapshot;}
        const rates={},caps={},stocks={};
        for(const r of ['food','wood','metal','gems','fragments','science','helium','radon']){
            const supported=!['helium','radon'].includes(r),loot=supported?Math.max(0,getAvgLootSecond(r)||0):0;
            const shown=!paused&&supported?getPsString(r,true):0;
            const production=shown-(!paused&&game.options.menu.useAverages.enabled&&loot>.001?loot:0);
            rates[r]=Number.isFinite(production)?Math.max(0,production):0;
            stocks[r]=game.resources[r].owned;
            caps[r]=game.resources[r].max>=0?getMaxForResource(r):Infinity;
        }
        rateSnapshot={now,rates,stocks,caps};return rateSnapshot;
    }
    function housingGain(name){
        const item=game.buildings[name];if(name==='Hub'||item?.increase?.what!=='trimps.max')return 0;
        const amount=amountFor(item,false),trimps=game.resources.trimps;
        const hubbable=['Hut','House','Mansion','Hotel','Resort','Gateway','Collector'];
        let hubs=game.buildings.Hub&&!game.buildings.Hub.locked&&hubbable.includes(name)?amount:0;
        if(hubs&&name==='Collector'&&autoBattle.oneTimers.Collectology.owned)hubs*=autoBattle.oneTimers.Collectology.getHubs();
        if(game.global.challengeActive==='Downsize'){
            // realMax reads the global housing count in Downsize, so project only its read-only post-count arithmetic.
            const base=game.global.totalGifts+game.unlocks.impCount.TauntimpAdded+10+countTotalHousingBuildings();
            const project=n=>{n*=trimps.maxMod;if(getPerkLevel('Carpentry'))n=Math.floor(n*Math.pow(1+game.portal.Carpentry.modifier,getPerkLevel('Carpentry')));if(getPerkLevel('Carpentry_II'))n=Math.floor(n*(1+game.portal.Carpentry_II.modifier*getPerkLevel('Carpentry_II')));if(game.global.expandingTauntimp)n=Math.floor(n*game.badGuys.Tauntimp.expandingMult());n=Math.floor(n*alchObj.getPotionEffect('Elixir of Crafting'));if(autoBattle.bonuses.Scaffolding.level)n=Math.floor(n*autoBattle.bonuses.Scaffolding.getMult());if(game.global.universe===2&&u2Mutations.tree.Trimps.purchased)n*=1.5;return n;};
            return project(base+amount+hubs)-project(base);
        }
        const projection=Object.assign(Object.create(trimps),{max:trimps.max+item.increase.by*amount+(hubs?game.buildings.Hub.increase.by*hubs:0)});
        return trimps.realMax.call(projection)-trimps.realMax();
    }
    function housingChoices(){
        if(houseOwner!==game||houseUniverse!==game.global.universe){houseOwner=game;houseUniverse=game.global.universe;houseChoice=null;}
        if(!game.options.menu.equipHighlight.enabled){houseChoice=null;return null;}
        const rows=[];
        for(const[name,item]of Object.entries(game.buildings)){
            if(name==='Hub'||item.locked||!item.cost||item.increase?.what!=='trimps.max'||item.blockU1&&game.global.universe===1||item.blockU2&&game.global.universe===2)continue;
            const score=MobilePurchaseGuidance.housingScore(prices(name,false),housingGain(name));if(score!==null)rows.push({name,score});
        }
        houseChoice=MobilePurchaseGuidance.choose(rows,houseChoice?.name);return houseChoice;
    }
    function purchaseNote(name,equipment,state){
        const snapshot=guidanceSnapshot(),estimate=MobilePurchaseGuidance.eta(prices(name,equipment),snapshot.stocks,snapshot.rates,snapshot.caps);
        if(estimate.kind==='ready')return '';
        if(state.label==='Game paused')return 'Paused';
        if(state.label!=='Not enough resources')return state.label;
        if(estimate.kind!=='time')return{storage:'Storage too small',income:'No current income',unknown:'Estimate unavailable'}[estimate.kind];
        const seconds=Math.ceil(estimate.seconds);return 'Est. '+(seconds>=3600?Math.ceil(seconds/60/60)+'h':seconds>=60?Math.floor(seconds/60)+'m '+seconds%60+'s':seconds+'s');
    }
    function costMarkup(name, equipment=false) {
        const values = prices(name,equipment);
        if (!values.length) return '<span class="mobile-auto-building">Automatic</span>';
        let requirement = '';
        if (name === 'Antenna') {
            // Retain the engine's non-material prerequisite; only its absolute material prices are replaced.
            const original = document.createElement('div'); original.innerHTML = canAffordBuilding(name,false,true);
            requirement = '<span class="mobile-building-requirement">' + original.firstElementChild.textContent + '</span>';
        }
        // Housing names its bottleneck (missing first, else the largest share of stock); Diorama shows only its value.
        const housing=!equipment&&game.buildings[name]?.increase?.what==='trimps.max',key=housing?values.reduce((a,p)=>(p.missing&&!a.missing)||(p.missing===a.missing&&p.ratio>a.ratio)?p:a):null;
        const entries=values.map(p=>{
            const absolute=p.missing||equipment||p.resource==='helium',share=p.share.replace('<','&lt;'),value=absolute?(Number.isFinite(p.cost)?prettify(p.cost):'Unavailable'):share;
            return{p,share,value,label:(resourceNames[p.resource]||p.resource)+(absolute?' cost: ':': ')+value};
        });
        return '<span class="mobile-materials' + (values.length > 3 ? ' mobile-materials-many' : '') + (housing ? ' mobile-materials-bottleneck" role="img" aria-label="' + entries.map(e=>e.label+(e.p.missing?' (not enough)':'')).join(', ') : '') + '" data-count="' + values.length + '">' + entries.map(({p,share,label,value}) => {
            return '<span class="mobile-material' + (p.missing ? ' mobile-material-missing' : '') + (p===key ? ' mobile-material-key' : '') + '"' + (housing ? '' : ' aria-label="' + label + '"') + '><span class="mobile-material-icon" data-resource="' + p.resource + '" aria-hidden="true"></span><b>' + value + '</b>' + (equipment&&!p.missing?'<small>'+share+'</small>':'') + '</span>';
        }).join('') + '</span>' + requirement;
    }
    function markup(type,name,displayName,owned,numeral,alert,efficient) {
        const equipment = type === 'equipment', action = equipment ? 'Upgrade' : 'Buy';
        return `<article class="mobile-inventory-tile" data-item="${name}" data-type="${type}"${equipment?' data-equipment-stat="'+(name==='Shield'||game.equipment[name].health?'health':'attack')+'"':''}><button type="button" class="${efficient}thingColorCanNotAfford thing ${equipment ? 'equipment' : 'building'}Thing" id="${name}" onclick="buy${equipment ? 'Equipment' : 'Building'}('${name}');MobileInventory.refresh()" aria-label="${action} ${displayName}"><strong class="mobile-tile-name"><span id="${name}Alert" class="alert badge">${alert}</span>${displayName}</strong><span class="mobile-tile-core"><img src="mobile-assets/${type}/${name}.svg" alt="" class="mobile-item-art"><span class="mobile-tile-values"><span class="mobile-tile-owned">${equipment ? 'Level ' : ''}<b id="${name}Owned">${owned}</b>${equipment ? numeral : ' <small>owned</small>'}</span><span class="mobile-item-effect"></span></span></span><span class="mobile-pending" hidden></span><span class="mobile-tile-price"></span></button><button id="${name}Info" class="mobile-info" aria-label="Info ${displayName}" onclick="TrimpsUI.info('${name}','${type}')">Info</button></article>`;
    }
    function select(category) {
        let title = document.getElementById('mobile-inventory-title');
        if (!title) { title = document.createElement('h1'); title.id = 'mobile-inventory-title'; document.getElementById('buyCol').prepend(title); }
        title.hidden = !['buildings','equipment'].includes(category);
        title.textContent = category === 'equipment' ? 'Equipment' : 'Buildings';
        let head=document.getElementById('mobile-inventory-head');
        // V-188: AutoStructure joins AutoStorage as a compact switch; both keep their original elements and handlers.
        if(!head){head=document.createElement('div');head.id='mobile-inventory-head';title.before(head);const switches=document.createElement('div');switches.id='mobile-auto-switches';switches.append(...['autoStructureBtn','autoStorageBtn'].map(id=>document.getElementById(id)).filter(Boolean));head.append(title,switches);const storage=document.getElementById('autoStorageBtn');storage.setAttribute('role','button');storage.tabIndex=0;new MutationObserver(()=>{refresh();if(typeof TrimpsColony!=='undefined'&&TrimpsColony)TrimpsColony.refresh();}).observe(storage,{childList:true});}
        head.hidden=title.hidden;head.dataset.category=category;
        // Buy best is a helper in the equipment head beside the title, not a block above the list.
        let controls=document.getElementById('mobile-buy-best');
        if(!controls){controls=document.createElement('div');controls.id='mobile-buy-best';for(const stat of ['health','attack']){const button=document.createElement('button');button.type='button';button.id='mobile-buy-best-'+stat;button.innerHTML='<span aria-hidden="true"></span>Best';button.onclick=()=>buyBest(stat);controls.append(button);}head.append(controls);}
        controls.hidden=category!=='equipment'||(typeof MobileEquipmentResearch!=='undefined'&&!MobileEquipmentResearch.unlocked());
        if(typeof MobilePurchaseGuidance!=='undefined'){
            let legend=document.getElementById('mobile-housing-legend');if(!legend){legend=document.createElement('p');legend.id='mobile-housing-legend';legend.textContent='Outlined: lowest Food + Wood + Metal cost per added Trimp. Gems and Fragments ignored; Helium housing excluded.';document.getElementById('buildingsHere').before(legend);}
            legend.hidden=category!=='buildings'||!game.options.menu.equipHighlight.enabled;
        }
    }
    function syncStorage(){
        const storage=typeof document!=='undefined'&&document.getElementById('autoStorageBtn');
        if(storage){storage.setAttribute('aria-label','AutoStorage '+(game.global.autoStorage?'On':'Off'));storage.setAttribute('aria-pressed',String(!!game.global.autoStorage));}
    }
    function storageHidden(enabled,global){return enabled===true&&global.autoStorage===true&&global.autoStorageAvailable===true;}
    function refresh() {
        syncStorage();
        if(typeof MobileEquipmentResearch!=='undefined')MobileEquipmentResearch.refresh();
        if(typeof MobilePerkResearch!=='undefined')MobilePerkResearch.refresh();
        const hideStorage=storageHidden(typeof MobileQolStore!=='undefined'&&MobileQolStore.get('hideStorageBuildings',false),game.global);
        for(const name of ['Barn','Shed','Forge']){const tile=document.getElementById(name)?.closest('.mobile-inventory-tile');if(tile)tile.toggleAttribute('data-storage-hidden',hideStorage);}
        // Both saved enabled modes now compare all tiers. Preserve their values and the off option.
        game.options.menu.equipHighlight.description = 'Highlight the lowest metal cost per added Attack and Health separately, across all unlocked tiers. Buy best purchases that recommendation once using the selected amount and discounts. Shield is excluded because it costs wood. Housing compares Food + Wood + Metal cost per added Trimp. Gems and Fragments are ignored in this comparison. Helium housing is excluded.';
        const legend=document.getElementById('mobile-housing-legend');if(legend)legend.hidden=document.getElementById('mobile-inventory-head')?.dataset.category!=='buildings'||!game.options.menu.equipHighlight.enabled;
        const counts = queueCounts(game.global.buildingsQueue);
        document.querySelectorAll('.mobile-inventory-tile').forEach(tile => {
            if(tile.closest('[hidden]'))return;
            const {type,item} = tile.dataset, equipment = type === 'equipment', object = game[type][item], action = document.getElementById(item);
            const state=purchaseState(item,equipment);
            action.disabled = state.key !== 'buyable';
            tile.dataset.purchaseState=state.key;
            action.setAttribute('aria-description',state.label);
            const price = tile.querySelector('.mobile-tile-price'), html = costMarkup(item,equipment);
            if (price.innerHTML !== html) price.innerHTML = html;
            if(typeof MobilePurchaseGuidance!=='undefined'){
                let note=tile.querySelector('.mobile-purchase-note');if(!note){note=document.createElement('span');note.className='mobile-purchase-note';action.append(note);}
                const excluded=!equipment&&object.increase?.what==='trimps.max'&&Object.hasOwn(object.cost||{},'helium');
                const estimate=item==='Hub'?'':purchaseNote(item,equipment,state);
                note.textContent=excluded?'Helium cost · not compared'+(estimate?' · '+estimate:''):estimate;note.hidden=!note.textContent;
                action.title=!equipment&&object.increase?.what==='trimps.max'?(Object.hasOwn(object.cost||{},'helium')?'Helium cost · excluded from housing value':'Housing value: Food + Wood + Metal cost per added Trimp. Gems and Fragments ignored.'):'';
            }
            const pending = tile.querySelector('.mobile-pending'), count = counts.get(item)||0;
            pending.hidden = equipment || count === 0;
            if (!pending.hidden) pending.textContent = '+' + prettify(count) + (game.global.crafting === item ? ' building' : ' queued');
            if (equipment) {
                const numeral = document.getElementById(item+'Numeral');
                if (object.prestige === 1 && !numeral.textContent) numeral.textContent = 'I';
                const stat = item === 'Shield' && object.blockNow ? 'block' : object.attackCalculated != null ? 'attack' : 'health';
                const effect = tile.querySelector('.mobile-item-effect');
                effect.innerHTML = '+' + prettify(object[stat+'Calculated']) + ' ' + ({attack:'Attack',health:'Health',block:'Block'})[stat];
                effect.setAttribute('aria-label',effect.textContent + ' per level');
            }
        });
        highlight();
    }
    return {share,queueCounts,queueGroups,purchaseState,prices,efficientChoices,highlight,costMarkup,markup,select,refresh,housingGain,housingChoices,guidanceSnapshot,buyBest,storageHidden};
})();
if (typeof displayEfficientEquipment === 'function') displayEfficientEquipment = MobileInventory.highlight;
if (typeof module !== 'undefined') module.exports = MobileInventory;
