var createMobileGraphicStyle = win => {
    const key='scruffy-colony-graphic-style',root=win.document.documentElement;
    // Diorama is the default (V-167): without a stored choice, with an invalid one or without storage. Classic stays
    // an explicit, stored choice; ?graphics=classic (launcher shortcut) resets to it.
    let current='diorama';
    function apply(next,notify){
        const changed=current!==next;current=next;
        if(root.dataset)root.dataset.graphics=next;else root.setAttribute('data-graphics',next);
        if(changed&&notify){
            const event=win.CustomEvent?new win.CustomEvent('scruffy:graphic-style',{detail:{style:next}}):null;
            if(event)win.document.dispatchEvent(event);
        }
        return current;
    }
    function stored(){try{const value=win.localStorage.getItem(key);return value==='diorama'||value==='classic'?value:'diorama';}catch{return 'diorama';}}
    let reset=false,cleanUrl='';
    try{const url=new URL(win.location.href);reset=url.searchParams.get('graphics')==='classic';if(reset){url.searchParams.delete('graphics');cleanUrl=url.pathname+url.search+url.hash;}}catch{}
    if(reset){try{win.localStorage.setItem(key,'classic');}catch{}try{win.history.replaceState(win.history.state,'',cleanUrl);}catch{}apply('classic',false);}
    else apply(stored(),false);
    return {
        get:()=>current,
        set(value){
            if(value!=='classic'&&value!=='diorama')return current;
            // Without storage the choice still applies for this session; the next start uses the default again.
            try{win.localStorage.setItem(key,value);}catch{}
            return apply(value,true);
        },
        // Art that fails to load switches this session only; a stored choice is never written on the player's behalf.
        fallback(value){return value==='classic'||value==='diorama'?apply(value,true):current;}
    };
};

if(typeof module!=='undefined'&&module.exports)module.exports={create:createMobileGraphicStyle};
if(typeof window!=='undefined'&&window.document)window.MobileGraphicStyle=createMobileGraphicStyle(window);
