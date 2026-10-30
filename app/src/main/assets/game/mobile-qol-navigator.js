var MobileQolNavigator=(()=>{
    const definitions=[['storage','AutoStorage','Automatically queue storage before resources overflow.','autoStorageBtn','buildings'],['upgrades','AutoUpgrade','Buy unlocked upgrades automatically.','autoUpgradeBtn','upgrades'],['jobs','AutoJobs','Configure worker allocation for this universe.','autoJobsBtn','jobs','Configure AutoJobs'],['structure','AutoStructure','Configure automatic building purchases.','autoStructureBtn','buildings','Configure AutoStructure'],['equip','AutoEquip','Configure automatic equipment purchases.','autoEquipBtn','equipment','Configure AutoEquip'],['maps','Map At Zone','Configure zone triggers and map presets.','togglemapAtZone2','maps','Set Map At Zone']];
    function entries(state,spoilers){return definitions.filter(d=>state[d[0]]||spoilers).map(([key,name,description,id,page,config])=>({key,name,description,id,page,config,unlocked:!!state[key]}));}
    if(typeof document==='undefined')return{entries};
    const {el,button,note}=MobileQolPages;
    function state(){const g=game.global;return{storage:g.autoStorageAvailable,upgrades:g.autoUpgradesAvailable,jobs:bwRewardUnlocked('AutoJobs'),structure:bwRewardUnlocked('AutoStructure'),equip:g.autoEquipUnlocked,maps:g.canMapAtZone};}
    function hint(key){const voids={storage:'AutoStorage',equip:'AutoEquip',maps:'MapAtZone'};if(voids[key])return 'Original unlock: complete a Void Map at zone '+game.mapUnlocks[voids[key]].world+' or higher in Universe 1.';if(key==='jobs'||key==='structure')return 'Original unlock: complete Bionic Wonderland level '+game.bwRewards[key==='jobs'?'AutoJobs':'AutoStructure'].requires+'.';return 'Original unlock: break the planet at zone 60 in Universe 1. Availability also follows the original challenge rules.';}
    let renderPage=null;
    const environment=()=>({Fluffy,autoBattle,playerSpire,playerSpireTraps,u2Mutations,bwRewardUnlocked,getAllowedTalentTiers,getObsidianStart});
    function snapshot(){
        const saved=MobileQolStore.get('unlockDiscoveries',{}),seen={};
        if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const e of MobileUnlockCatalog.data.entries)if(saved[e.id]===true)seen[e.id]=true;
        const rows=MobileUnlockCatalog.rows(game,seen,environment());let changed=false;
        const count=MobileEquipmentResearch.progress(game),completed=MobileEquipmentResearch.done(game),researchId='mobile:equipmentOptimization';
        rows.push({id:researchId,category:'Research & upgrades',name:'Equipment Optimization',description:'Unlock Buy best for weapons and armor. One-time cost: 1,000 Science and 500 Gems. Kept through portals.',requirement:'All 11 early equipment pieces at prestige II, including Greatsword and Breastplate; Arbalest and Gambeson are not required.',active:completed||count===11,known:completed||count===11||saved?.[researchId]===true,status:completed?'Researched':count+' of 11 at prestige II'});
        if(saved?.[researchId]===true)seen[researchId]=true;
        const perkCount=MobilePerkResearch.progress(game),perkDone=MobilePerkResearch.done(game);
        rows.push({id:'mobile:perkOptimization',category:'Research & upgrades',name:'Perk Optimization',description:'Plan your next perk allocation. One-time cost: 1,000 Science and 500 Gems. Kept through portals.',requirement:'Four completed portal runs; then research Perk Optimization.',active:perkDone||perkCount>=4,known:true,status:perkDone?'Researched':Math.min(perkCount,4)+' of 4 portal runs'});
        for(const row of rows)if(row.active&&!seen[row.id]){seen[row.id]=true;changed=true;}
        if(changed)MobileQolStore.set('unlockDiscoveries',seen);
        return rows;
    }
    function build(host){
        const preferences=el('section'),hideLabel=el('label'),hide=el('input'),copy=el('span');preferences.className='qol-display-preferences';
        hide.type='checkbox';hide.id='qol-hide-storage';hide.setAttribute('role','switch');hide.checked=MobileQolStore.get('hideStorageBuildings',false)===true;
        copy.append(el('strong','Hide storage buildings'),el('small','Hide Barn, Shed and Forge while AutoStorage is on. They reappear when it is off.'));
        hideLabel.append(copy,hide);preferences.append(el('h2','Display preferences'),hideLabel);host.append(preferences);
        hide.onchange=()=>{MobileQolStore.set('hideStorageBuildings',hide.checked);MobileInventory.refresh();TrimpsColony.refresh();};
        // V-206: ADVISOR opens by itself at each new step of the first run (mobile-advisor.js); on by default.
        const advisorLabel=el('label'),advisor=el('input'),advisorCopy=el('span');
        advisor.type='checkbox';advisor.id='qol-advisor-auto';advisor.setAttribute('role','switch');advisor.checked=MobileQolStore.get('advisorAutoOpen',true)!==false;
        advisorCopy.append(el('strong','Show ADVISOR tips automatically'),el('small','In the first run of this save, ADVISOR opens by itself when a new tip is ready. The gold star always opens it.'));
        advisorLabel.append(advisorCopy,advisor);preferences.append(advisorLabel);
        advisor.onchange=()=>MobileQolStore.set('advisorAutoOpen',advisor.checked);
        // V-240: the guided start of a new save (mobile-guided-start.js); on by default, off hides it at once.
        const guideLabel=el('label'),guide=el('input'),guideCopy=el('span');
        guide.type='checkbox';guide.id='qol-guided-start';guide.setAttribute('role','switch');guide.checked=MobileQolStore.get('guidedStart',true)!==false;
        guideCopy.append(el('strong','Show the guided start'),el('small','In a new save, it lights up step by step where to tap until the first fight. Skip passes over one step; switch it off here to end it. Help starts it again.'));
        guideLabel.append(guideCopy,guide);preferences.append(guideLabel);
        guide.onchange=()=>{MobileQolStore.set('guidedStart',guide.checked);MobileGuidedStart.resume();};
        // V-202: the note after a bone find and the Bones row of the Time Portal review; on by default.
        const boneLabel=el('label'),bone=el('input'),boneCopy=el('span');
        bone.type='checkbox';bone.id='qol-bone-hints';bone.setAttribute('role','switch');bone.checked=MobileQolStore.get('boneHints',true)!==false;
        boneCopy.append(el('strong','Show Bone Trader hints'),el('small','After a bone find, a short note offers the Bone Trader; the Time Portal review lists your bones. The bone tag under the header stays.'));
        boneLabel.append(boneCopy,bone);preferences.append(boneLabel);
        bone.onchange=()=>{MobileQolStore.set('boneHints',bone.checked);if(!bone.checked)MobileBoneHints.hideNote();};
        const label=el('label'),spoilers=el('input'),search=el('input'),list=el('div'),message=el('p');
        spoilers.type='checkbox';spoilers.id='qol-show-spoilers';spoilers.checked=MobileQolStore.get('qolSpoilers',false)===true;
        label.className='unlock-spoiler';label.append(spoilers,document.createTextNode('Show undiscovered features (spoilers)'));
        search.type='search';search.id='qol-unlock-search';search.placeholder='Find a feature';search.setAttribute('aria-label','Find a feature');
        host.append(el('p','Your unlocked tools and what comes next. This screen does not unlock or enable features automatically.'),label,search,list,message);message.setAttribute('role','status');
        const actions={'systems:autoStorage':'storage','systems:autoUpgrades':'upgrades','systems:autoEquip':'equip','systems:mapAtZone':'maps','bwRewards:AutoJobs':'jobs','bwRewards:AutoStructure':'structure'};
        const order=['Automation','Buildings & housing','Equipment & items','Jobs','Research & upgrades','Game systems & progression','Maps & discoveries','Heirlooms','Challenges','Perks','Masteries','Nature','Generator','Player Spire','Spire Assault','Companions','Mutators'];
        let signature='';
        function render(rows){
            const current=MobileUnlockCatalog.visible(rows,spoilers.checked,search.value),key=JSON.stringify([spoilers.checked,search.value,current.map(e=>[e.id,e.status])]);if(signature===key)return;signature=key;
            const opened=new Set([...list.querySelectorAll('details[open]')].map(d=>d.dataset.category));list.replaceChildren();
            for(const category of order){const items=current.filter(e=>e.category===category);if(!items.length)continue;
                const section=el('details');section.className='unlock-category';section.dataset.category=category;section.open=opened.has(category)||Boolean(search.value.trim());
                const summary=el('summary'),name=el('strong',category),count=el('span',String(items.length));count.className='unlock-count';summary.append(name,count);section.append(summary);
                for(const e of items){const row=el('article');row.className='unlock-card';row.dataset.unlock=e.id;const heading=el('header');heading.append(el('h2',e.name),el('span',e.status,'unlock-state'));row.append(heading,el('p',e.description),el('p','Unlock: '+e.requirement,'unlock-requirement'));
                    if(e.id==='mobile:equipmentOptimization'&&e.active&&!MobileEquipmentResearch.done(game))row.append(button('Open research',()=>{TrimpsUI.select('upgrades');MobileEquipmentResearch.refresh();document.getElementById('mobile-equipment-research').scrollIntoView({block:'center'});}));
                    if(e.id==='mobile:perkOptimization'&&e.active&&!MobilePerkResearch.done(game))row.append(button('Open research',()=>{TrimpsUI.select('upgrades');MobilePerkResearch.refresh();document.getElementById('mobile-perk-research').scrollIntoView({block:'center'});}));
                    const old=entries(state(),false).find(x=>x.key===actions[e.id]);
                    if(old&&document.getElementById(old.id)?.style.display!=='none')row.append(button(old.config?'Configure '+old.name:'Open '+old.name,()=>{
                        if(!state()[old.key]){message.textContent='This feature is no longer available in the current save.';refresh();return;}
                        const target=document.getElementById(old.id);if(!target||target.style.display==='none'){message.textContent='Unlocked, but unavailable under the current original game rules.';return;}
                        if(old.config)tooltip(old.config,null,'update');else{TrimpsUI.select('colony');document.querySelector('#mobile-nav [data-page="'+old.page+'"]').click();target.scrollIntoView({block:'center'});}
                    }));section.append(row);
                }list.append(section);
            }
            if(!current.length)list.append(el('p',search.value?'No matching discovered features. Enable spoilers to search undiscovered features.':'No discovered features to show yet. Undiscovered names and requirements are hidden.'));
            note(list);
        }
        spoilers.onchange=()=>{MobileQolStore.set('qolSpoilers',spoilers.checked);render(snapshot());};search.oninput=()=>render(snapshot());
        renderPage=rows=>{if(host.isConnected)render(rows);else renderPage=null;};render(snapshot());
    }
    function refresh(){const rows=snapshot();if(renderPage)renderPage(rows);}
    MobileMore.registerPage('qol','Quality of life','game',build);return{entries,state,refresh,snapshot};
})();
if(typeof module!=='undefined')module.exports=MobileQolNavigator;
