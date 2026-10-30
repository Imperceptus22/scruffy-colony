// Presentation and fine pointer control only; original range values and price calculation stay authoritative.
var MobileMapControls = (() => {
    const t=value=>typeof MobileI18n==='undefined'?value:MobileI18n.t(value);
    function bindRange(range, surface = range) {
        let drag = null;
        const paint = position => {
            range.style.setProperty('--map-drag-fill', (position / 9 * 100) + '%');
            range.style.setProperty('--map-thumb-offset', ((position - Number(range.value)) / 9 * drag.width) + 'px');
        };
        surface.addEventListener('pointerdown', event => {
            if (drag || range.disabled || event.button !== 0) return;
            drag = {id:event.pointerId, x:event.clientX, y:event.clientY, lastX:event.clientX,
                position:Number(range.value), width:Math.max(1,range.getBoundingClientRect().width - 22), active:false, changed:false};
        });
        surface.addEventListener('pointermove', event => {
            if (!drag || drag.id !== event.pointerId) return;
            const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
            if (!drag.active) {
                if (Math.abs(dy)>4 && Math.abs(dy)>=Math.abs(dx)) { drag=null; return; }
                if (Math.abs(dx)<=4 || Math.abs(dx)<=Math.abs(dy)*1.2) return;
                drag.active=true;
                drag.lastX=drag.x+Math.sign(dx)*4;
                range.focus({preventScroll:true});
                surface.setPointerCapture(event.pointerId);
            }
            event.preventDefault();
            // Keep fine relative control, but paint every movement; only original integer steps reach the engine.
            drag.position=Math.max(0,Math.min(9,drag.position+(event.clientX-drag.lastX)/drag.width*9*0.75));
            drag.lastX=event.clientX;
            const value=Math.round(drag.position);
            if (Number(range.value)!==value) { range.value=String(value);drag.changed=true;range.dispatchEvent(new Event('input',{bubbles:true})); }
            paint(drag.position);
        });
        const end=event=>{
            if (!drag || drag.id!==event.pointerId) return;
            const changed=drag.changed;drag=null;
            range.style.removeProperty('--map-drag-fill');
            range.style.removeProperty('--map-thumb-offset');
            if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
            if (changed) range.dispatchEvent(new Event('change',{bubbles:true}));
        };
        surface.addEventListener('pointerup',end);
        surface.addEventListener('pointercancel',end);
        surface.addEventListener('lostpointercapture',end);
    }
    let originalCost, price, stock, balance;
    const numberText=value=>{const node=document.createElement('span');node.innerHTML=prettify(value);return node.textContent;};
    function refresh() {
        if (!price) return;
        const cost=originalCost(true), available=game.resources.fragments.owned, valid=Number.isFinite(cost);
        price.textContent=valid?t(numberText(cost)+' Fragments'):t('Choose a valid level');
        stock.textContent=t('Available: '+numberText(available));
        balance.textContent=valid?t((available>=cost?'Remaining: ':'Missing: ')+numberText(Math.abs(available-cost))):'';
        balance.classList.toggle('mobile-map-deficit',valid&&available<cost);
        for(const type of ['loot','size','difficulty']){
            const range=document.getElementById(type+'AdvMapsRange'),text=document.getElementById(type+'AdvMapsText');
            range.style.setProperty('--map-fill',(Number(range.value)/9*100)+'%');
            text.textContent=text.textContent.replace(/^Min /,'').replace(', Max ','–').replace(/ cells$/,'')+(type==='size'?' cells':'');
            range.setAttribute('aria-valuetext',text.textContent+'; quality '+range.value+' of 9');
        }
    }
    function setup() {
        originalCost=window.updateMapCost;
        const create=document.getElementById('mapCreateBtn'),box=document.createElement('section');
        box.id='mobile-map-cost';box.setAttribute('aria-label',t('Map cost'));
        const row=document.createElement('div'),label=document.createElement('span');label.textContent=t('Map cost');
        price=document.createElement('strong');price.id='mobile-map-price';row.append(label,price);
        const details=document.createElement('div');stock=document.createElement('span');balance=document.createElement('span');details.append(stock,balance);box.append(row,details);
        create.before(box);
        document.getElementById('mapCostContainer').hidden=true;
        for(const type of ['loot','size','difficulty']){
            const range=document.getElementById(type+'AdvMapsRange'),wrapper=document.createElement('div'),surface=document.createElement('span');
            wrapper.className='mobile-map-range';surface.className='mobile-range-touch';surface.setAttribute('aria-hidden','true');
            range.before(wrapper);wrapper.append(range,surface);bindRange(range,surface);
        }
        window.updateMapCost=function(getValue){const result=originalCost.apply(this,arguments);if(!getValue)refresh();return result;};
        refresh();
    }
    if(typeof document!=='undefined')setup();
    return {bindRange,refresh};
})();
if(typeof module!=='undefined')module.exports=MobileMapControls;
