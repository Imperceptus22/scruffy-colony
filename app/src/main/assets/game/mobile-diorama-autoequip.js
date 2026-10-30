// V-276: AutoEquip on the Diorama equipment page as a compact switch plus its own gear in the card head beside the two
// Best buttons (user choice A, 29.10.2026), instead of the original full-width red row under the card. The original
// #autoEquipBtn keeps its element, handlers (toggleAutoEquip, Configure AutoEquip), inline display and colour class; in
// Diorama it only moves into #mobile-auto-equip inside the head's tool group and moves back to its original column in
// Classic. While AutoEquip is locked the original keeps it display:none, so the switch does not show.
var createMobileDioramaAutoEquip = win => {
    const doc=win.document,root=doc.documentElement,byId=id=>doc.getElementById(id);
    const button=byId('autoEquipBtn'),text=byId('autoEquipText'),gear=button?.children[1],home=button?.parentElement;
    if(!button||!text||!gear||!home)return null;
    let host=null,tools=null;
    const german=()=>root.dataset.language==='de';
    const diorama=()=>root.dataset.graphics==='diorama';
    function label(){
        const on=button.classList.contains('colorSuccess');
        text.setAttribute('aria-pressed',String(on));
        text.setAttribute('aria-label','AutoEquip '+(german()?(on?'an':'aus'):(on?'on':'off')));
        gear.setAttribute('aria-label',german()?'AutoEquip konfigurieren':'Configure AutoEquip');
    }
    // The original divs become keyboard and screen reader buttons; their own onclick stays the action.
    for(const node of [text,gear]){
        node.setAttribute('role','button');node.tabIndex=0;
        node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();node.click();}});
    }
    // Best and AutoEquip share one tool group, so on a narrow head (360 px, 130 %) both wrap together under the title.
    // Leaving Diorama unwraps the group again (below), so Classic keeps its head exactly as before.
    function ensureTools(){
        const best=byId('mobile-buy-best');
        if(!tools&&best&&best.parentElement?.id==='mobile-inventory-head'){
            tools=doc.createElement('div');tools.id='mobile-equip-tools';tools.style.display='contents';best.before(tools);tools.append(best);
        }
        if(!host){host=doc.createElement('div');host.id='mobile-auto-equip';}
        return tools;
    }
    function place(){
        if(!diorama()){
            if(button.parentElement!==home)home.append(button);
            host?.remove();
            const best=byId('mobile-buy-best');if(tools&&best?.parentElement===tools)tools.before(best);
            tools?.remove();tools=null;
            return;
        }
        if(!ensureTools())return;
        if(host.parentElement!==tools)tools.append(host);
        if(button.parentElement!==host)host.append(button);
    }
    new win.MutationObserver(label).observe(text,{childList:true,characterData:true,subtree:true});
    new win.MutationObserver(label).observe(button,{attributes:true,attributeFilter:['class']});
    new win.MutationObserver(label).observe(root,{attributes:true,attributeFilter:['data-language']});
    doc.addEventListener('scruffy:graphic-style',place);
    // The head and its Best buttons appear with the first MobileInventory.select (mobile-inventory.js).
    if(win.MobileInventory?.select){const select=win.MobileInventory.select;win.MobileInventory.select=function(){const result=select.apply(this,arguments);place();return result;};}
    place();label();
    return {place,label};
};
if(typeof module!=='undefined'&&module.exports)module.exports={create:createMobileDioramaAutoEquip};
if(typeof window!=='undefined'&&window.document)window.MobileDioramaAutoEquip=createMobileDioramaAutoEquip(window);
