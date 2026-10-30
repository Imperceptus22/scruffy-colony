// Read-only touch descriptions. Never execute an unlock's reward or message function.
var MobileLoot = (() => {
    const resources={Food:'Extra Food',Wood:'Extra Wood',Metal:'Extra Metal',Science:'Extra Science',Fragments:'Extra Fragments',Gems:'Extra Gems',Helium:'Extra Helium',Radon:'Extra Radon','Food/Wood/Metal':'Food, Wood or Metal loot'};
    const plain=text=>String(text).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
    function describe(state,cell,maps){
        // Seasonal eggs have their own original collect action, rather than ordinary combat loot.
        if(!cell?.special||cell.special==='easterEgg')return null;
        const key=cell.special,entry=(maps?state.mapUnlocks:state.worldUnlocks)?.[key];if(!entry)return null;
        const item=state.upgrades?.[key]||state.jobs?.[key]||state.equipment?.[key];
        const title=plain(entry.title||key.replaceAll('_',' '));
        const original=typeof entry.message==='string'?entry.message:typeof item?.tooltip==='string'?item.tooltip:null;
        const description=resources[entry.title]?resources[entry.title]+' when this combat cell is completed. The amount follows the original rules.':original?plain(original):'This reward is granted when the combat cell is completed, following the original rules.';
        return german(state,key,item,{title,description},resources[entry.title]?null:original);
    }
    // V-280: in German the cell info names the item and tells the find like the log (stage 2: names and log catalog);
    // the own sentences go through stage 1. English and texts without a German version stay as they are.
    function german(state,key,item,entry,original){
        const stage2=typeof MobileI18nGame!=='undefined'&&MobileI18nGame.active?MobileI18nGame:null;
        // Plans for a building name the building (Mansion → Villa); its tooltip never becomes the find text.
        const type=(item&&['upgrades','jobs','equipment'].find(type=>state[type]?.[key]===item))||(state.buildings?.[key]?'buildings':null);
        const stage1=typeof MobileI18n!=='undefined'&&typeof MobileI18n.t==='function'?MobileI18n.t:null;
        let title=(stage2&&type&&stage2.name(type,key))||(stage2?stage2.t(entry.title):entry.title);
        if(stage2&&title===entry.title&&stage1)title=stage1(entry.title);
        let description=entry.description;
        if(original&&stage2){const line=stage2.logLine(original);if(line!==original)description=plain(line);}
        else if(!original&&stage1)description=stage1(description);
        return{title,description};
    }
    function setup(){
        // V-210: the tapped cell keeps its art and only carries data-mobile-picked while its info is open.
        let picked=null;
        const unpick=()=>{picked?.removeAttribute('data-mobile-picked');picked=null;};
        // V-214 (Diorama): the info shows the tapped painted tile enlarged, copied from the cell's own background, so it
        // is exactly the cell of the grid (ground and motif), in the square format of the painted tiles; a cell without a
        // painted image (gradients, dark or liquid grids, Classic) shows no picture.
        function art(node){
            if(document.documentElement.dataset.graphics!=='diorama')return '';
            const style=getComputedStyle(node),box=node.getBoundingClientRect();
            if(!/url\(/.test(style.backgroundImage||'')||!box.width||!box.height)return '';
            const tile=document.createElement('div');tile.className='mobile-cell-art';tile.setAttribute('aria-hidden','true');
            Object.assign(tile.style,{backgroundImage:style.backgroundImage,backgroundSize:style.backgroundSize,backgroundPosition:style.backgroundPosition,
                backgroundRepeat:style.backgroundRepeat,backgroundColor:style.backgroundColor,aspectRatio:'1'});
            return tile.outerHTML;
        }
        function show(node){
            const maps=node.closest('#mapGrid')!==null,index=Number(node.id.replace(maps?'mapCell':'cell',''));
            const entry=describe(game,game.global[maps?'mapGridArray':'gridArray'][index],maps);if(!entry)return false;
            const text=document.createElement('p');text.className='mobile-loot-info';text.textContent=entry.description;
            const picture=art(node);
            TrimpsUI.infoText(entry.title,picture+text.outerHTML);
            unpick();if(document.getElementById('tooltipDiv').style.display!=='none'){picked=node;node.dataset.mobilePicked='';}
            return true;
        }
        const tip=document.getElementById('tooltipDiv');
        if(tip)new MutationObserver(()=>{if(picked&&(tip.style.display==='none'||!tip.querySelector('.mobile-loot-info')))unpick();}).observe(tip,{attributes:true,attributeFilter:['style'],childList:true,subtree:true});
        for(const id of ['grid','mapGrid']){
            const grid=document.getElementById(id);
            const decorate=()=>grid.querySelectorAll('.battleCell').forEach(node=>{
                const maps=id==='mapGrid',index=Number(node.id.replace(maps?'mapCell':'cell',''));
                const entry=describe(game,game.global[maps?'mapGridArray':'gridArray'][index],maps);
                if(entry){node.dataset.mobileLoot='';node.setAttribute('role','button');node.tabIndex=0;node.setAttribute('aria-label','Info: '+entry.title);}
                else if(node.hasAttribute('data-mobile-loot')){node.removeAttribute('data-mobile-loot');node.removeAttribute('role');node.removeAttribute('tabindex');node.setAttribute('aria-label',node.title||'');}
            });
            grid.addEventListener('click',event=>{const node=event.target.closest('[data-mobile-loot]');if(node&&show(node)){event.preventDefault();event.stopPropagation();}},true);
            new MutationObserver(decorate).observe(grid,{childList:true,subtree:true});decorate();
        }
        // Original keyboard shortcuts use document capture, so intercept only loot keys before them.
        window.addEventListener('keydown',event=>{const node=event.target.closest?.('[data-mobile-loot]');if(node&&(event.key===' '||event.key==='Enter')&&show(node)){event.preventDefault();event.stopPropagation();}},true);
    }
    if(typeof document!=='undefined')setup();
    return{describe};
})();
if(typeof module==='object')module.exports=MobileLoot;
