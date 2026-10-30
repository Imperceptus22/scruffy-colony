// A1/S2/M2 decorate original renderers; the engine remains the only authority for actions and costs.
var MobileLateSystems = (() => {
    const $=id=>document.getElementById(id);
    const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const button=(text,action)=>{const b=node('button','',text);b.type='button';b.onclick=action;return b;};
    let assaultView='fight',selectedMutator=null;
    function alchemy(){
        const table=$('alchemyCraftTable');if(!table||lastTooltipTitle!=='Alchemy')return;
        $('tooltipDiv').classList.add('ml-alchemy');
        for(const cell of table.querySelectorAll('.alchemyPopupCraft')){
            if(cell.dataset.mobileRecipe){cell.querySelector('.ml-recipe-cost').textContent=cell.querySelector('.alchemyCraftCost').textContent;continue;}cell.dataset.mobileRecipe='true';
            const details=node('details','ml-recipe'),summary=node('summary');
            summary.append(cell.querySelector('.alchemyPopupName'),cell.querySelector('.alchemyPotionEffect'),node('small','ml-recipe-cost',cell.querySelector('.alchemyCraftCost').textContent));
            details.append(summary,cell.querySelector('.alchemyCraftCost'),cell.querySelector('.alchemyAuto'),cell.querySelector('.alchemyCraftDescription'),cell.querySelector('[id^="alchCraftBtn"]'));
            cell.replaceChildren(details);
            const craft=cell.querySelector('[id^="alchCraftBtn"]');craft.setAttribute('role','button');craft.tabIndex=0;craft.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();craft.click();}};
        }
        const drops=$('alchemyDropsTable');
        if(drops&&!drops.dataset.mobileDrops){
            drops.dataset.mobileDrops='true';const rows=[...drops.rows];
            if(rows.length===2){
                const body=node('tbody');
                for(let i=0;i<rows[0].cells.length;i++){const row=node('tr');row.append(rows[0].cells[i].cloneNode(true),rows[1].cells[i].cloneNode(true));body.append(row);}
                drops.replaceChildren(body);
            }
        }
    }
    function applyAssaultView(){
        const stats=$('autoBattleStatsText'),items=$('autoItemsDiv'),notes=$('autoBattleNotes'),tools=$('ml-assault-tools');
        if(stats)stats.hidden=assaultView!=='fight';if(items)items.hidden=assaultView==='fight';
        if(notes)notes.hidden=assaultView!=='items';if(tools)tools.hidden=false;
        document.querySelectorAll('#ml-assault-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===assaultView)));
    }
    function assault(){
        const menu=$('autoBattleMenuButtons');if(!menu||lastTooltipTitle!=='Spire Assault')return;
        $('tooltipDiv').classList.add('ml-assault');
        if(!$('ml-assault-tabs')){
            const tabs=node('nav');tabs.id='ml-assault-tabs';tabs.setAttribute('aria-label','Spire Assault sections');
            for(const [key,label]of [['fight','Fight'],['items','Items'],['bonuses','Bonuses']]){
                const b=button(label,()=>{assaultView=key;if(key!=='fight')autoBattle.swapPopup(key);applyAssaultView();});b.dataset.view=key;b.setAttribute('role','tab');tabs.append(b);
            }
            const tools=node('details');tools.id='ml-assault-tools';tools.append(node('summary','','Level, AutoLevel & more tools'));
            const head=node('header');head.id='ml-assault-head';const controls=node('div','ml-assault-close');
            for(const [id,label]of [['abHelpBtn','Info'],['abCloseBtn','Close']]){const b=$(id);b.textContent=label;controls.append(b);}
            head.append(controls,$('autoDust'));
            const bars=[...document.querySelectorAll('#tipText .autoBattleBarHolder')],fighters=node('div','ml-fighters');
            for(let i=0;i<2;i++){const card=node('div'),label=bars[i].querySelector('.innerFightBar');label.classList.add('ml-health-label');card.append(node('strong','',i===0?'Huffy':'Enemy'),label,bars[i],bars[i+2]);fighters.append(card);}
            head.append(fighters,tabs);$('autoBattleStatsText').before(head,tools);tools.append($('abLevelButtons'),menu);
        }
        for(const item of document.querySelectorAll('#autoItemsDiv .autoItemContainer')){
            const name=item.querySelector('[id^="itemName"]');if(!name||item.querySelector('.ml-item-info'))continue;
            const key=name.id.slice('itemName'.length);name.onmouseover=null;
            const info=button('Info',()=>autoBattle.hoverItem(key,false,'update'));info.className='ml-item-info';info.setAttribute('aria-label','Info '+autoBattle.cleanName(key));item.append(info);
        }
        applyAssaultView();
    }
    function selectMutator(name){
        if(!Object.hasOwn(u2Mutations.tree,name))return false;selectedMutator=name;renderMutator();return true;
    }
    function renderMutator(){
        const detail=$('ml-mut-detail');if(!detail)return;
        detail.replaceChildren();
        if(!selectedMutator){detail.append(node('p','','Select a Mutator to see its effect and cost. Selecting does not purchase.'));return;}
        const data=u2Mutations.tree[selectedMutator];if(!data)return;
        const available=!data.purchased&&game.global.mutatedSeeds>=u2Mutations.nextCost()&&u2Mutations.checkRequirements(selectedMutator);
        detail.append(node('h2','',data.dn||selectedMutator),node('p','',data.description),node('p','',data.purchased?'Purchased':'Cost: '+prettify(u2Mutations.nextCost())+' Seeds'));
        if(!data.purchased&&!u2Mutations.checkRequirements(selectedMutator))detail.append(node('p','','Requirements not met.'));
        const buy=button(data.purchased?'Purchased':'Buy Mutator',()=>u2Mutations.purchase(selectedMutator));buy.disabled=!available;detail.append(buy);
        document.querySelectorAll('#mutTree .mutatorBox').forEach(b=>b.setAttribute('aria-pressed',String(b.id===selectedMutator+'MutatorBox')));
    }
    function mutators(){
        const root=$('mutTreeWrapper'),tree=$('mutTree');if(!root||!tree||!u2Mutations.open)return;
        root.classList.add('ml-mutators');
        if(!$('ml-mut-detail')){
            const header=node('header','ml-mut-header'),title=node('h1','','Mutators'),stage=node('div','ml-mut-stage'),detail=node('aside');detail.id='ml-mut-detail';detail.setAttribute('aria-live','polite');
            // V-243 step 4d: own label through the stage 1 catalog; Close is not a shared stage 2 string (abCloseBtn compares it).
            $('mutTreeCloseBtn').textContent=typeof MobileI18n==='undefined'?'Close':MobileI18n.t('Close');header.append(title,$('mutTreeCloseBtn'),$('mutSeedCounter'),$('mutMenu'),$('mutZoomButtons'));
            stage.append(tree);root.replaceChildren(header,stage,detail);
            const center=button('Center',()=>{u2Mutations.translateX=0;u2Mutations.translateY=0;u2Mutations.scale=1;u2Mutations.update();});$('mutZoomButtons').append(center);
            const info=$('masteryInfo');info.textContent='Info';info.onmouseover=null;info.onmouseout=null;info.onclick=()=>TrimpsUI.infoAction(()=>tooltip('Mastery Info',null,'update'),false);
            for(const [id,label]of [['mutZoomIn','Zoom in'],['mutZoomOut','Zoom out']]){const b=$(id);b.textContent=id==='mutZoomIn'?'+':'−';b.setAttribute('role','button');b.setAttribute('aria-label',label);b.removeAttribute('aria-hidden');b.tabIndex=0;b.onmouseover=null;b.onmouseout=null;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();b.click();}};}
            for(const el of [header,detail])el.addEventListener('pointerdown',e=>e.stopPropagation());
            stage.style.touchAction='none';
        }
        for(const original of [...tree.querySelectorAll('.mutatorBox')]){
            if(original.dataset.mobileSelect)continue;
            // Cloning discards the original purchase/hover keyboard bindings before wiring selection only.
            const b=original.cloneNode(true),key=b.id.slice(0,-'MutatorBox'.length);original.replaceWith(b);b.dataset.mobileSelect='true';
            b.onclick=()=>selectMutator(key);b.onmouseover=null;b.onmouseout=null;b.onkeydown=null;b.removeAttribute('aria-labelledby');b.setAttribute('aria-label',u2Mutations.tree[key].dn||key);
        }
        renderMutator();
    }
    function wrap(object,name,decorate){const original=object[name];object[name]=function(...args){const result=original.apply(this,args);decorate();return result;};}
    wrap(alchObj,'openPopup',alchemy);
    const originalAssault=autoBattle.popup;
    autoBattle.popup=function(...args){if(!args[0]&&!args[1]&&!args[2]&&!args[3])assaultView='fight';const result=originalAssault.apply(this,args);assault();return result;};
    wrap(autoBattle,'swapPopup',()=>{assaultView=['items','hidden'].includes(autoBattle.popupMode)?'items':'bonuses';assault();});
    const originalHideMode=autoBattle.toggleHideMode;
    autoBattle.toggleHideMode=function(...args){assaultView='items';return originalHideMode.apply(this,args);};
    wrap(u2Mutations,'openTree',mutators);
    return{selectMutator};
})();
