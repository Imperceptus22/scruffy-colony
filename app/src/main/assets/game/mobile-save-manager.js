// Three personal slots; an older test session retains its explicit recovery route.
var MobileSaveManager = (() => {
    const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const button=(text,action)=>{const n=el('button','',text);n.type='button';n.onclick=action;return n;};
    let open=false,generation=0,working=false,info=null;
    const page=el('section','mobile-save-manager');page.hidden=true;page.setAttribute('aria-label','Game saves');
    const head=el('header','mobile-save-manager-head'),title=el('h1','','Game saves'),content=el('div','mobile-save-manager-content'),result=el('p','mobile-save-manager-result');
    result.setAttribute('role','status');head.append(button('Back',()=>close()),title);page.append(head,content,result);document.body.append(page);
    const more=document.getElementById('mobile-more'),files=more.querySelector('.mobile-file-actions');
    const saves=button('Game saves',()=>show('saves'));saves.id='mobile-game-saves';saves.className='mobile-menu-entry';
    const activeLabel=el('p','mobile-active-save');files.after(saves,activeLabel);
    const banner=el('aside','mobile-development-banner');banner.hidden=true;document.body.prepend(banner);
    // Layers that float over the page top (Diorama header and scene bands) start below the visible banner.
    new ResizeObserver(()=>document.documentElement.style.setProperty('--mobile-banner-height',banner.getBoundingClientRect().height+'px')).observe(banner);
    async function context(){
        info=await TrimpsMobile.slotInfo();
        activeLabel.textContent=(info.active==='dev'?'Previous test session':'Save '+(info.active||'selection unavailable'))+' · Import and export use the active save.';
        banner.hidden=info.active!=='dev';
        if(!banner.hidden){const label=el('strong','','Previous test session');const text=el('div','');text.append(label,el('span','','Return to your saved game.'));banner.replaceChildren(text,button('Return to game',()=>act(()=>TrimpsMobile.selectSlot(info.normal))));}
        return info;
    }
    function close(){if(working)return;open=false;generation++;page.hidden=true;saves.focus();}
    async function act(operation,busy='Saving and switching…',failed='The switch was not completed. Check the game status; your stored saves are preserved.'){
        if(working)return false;working=true;const controls=[...page.querySelectorAll('button'),...banner.querySelectorAll('button')].map(n=>[n,n.disabled]);controls.forEach(([n])=>n.disabled=true);result.textContent=busy;
        try {if(!await operation())throw Error(failed);return true;}
        catch(error){result.textContent=error.message==='SCENARIO'?'The test scenario could not be prepared. Your personal saves are preserved.':failed;working=false;controls.forEach(([n,disabled])=>n.disabled=disabled);if(page.closest('[hidden]')){document.body.append(page);page.classList.remove('mobile-saves-embedded');head.hidden=false;open=true;page.hidden=false;}return false;}
    }
    // V-261: the delete question is the app's own dialog, so its buttons name the action in the game's language; the native
    // confirm showed generic Apply/Cancel in the system language. Cancel, Escape and Back answer no; only Delete answers yes.
    const ask=el('dialog','mobile-save-confirm');ask.setAttribute('role','alertdialog');ask.setAttribute('aria-labelledby','mobile-save-confirm-title');document.body.append(ask);
    function confirmDelete(lines,t){
        if(ask.open)return Promise.resolve(false);
        return new Promise(resolve=>{
            const heading=el('h2','',lines[0]);heading.id='mobile-save-confirm-title';
            const actions=el('div','mobile-save-confirm-actions'),cancel=button(t('Cancel'),()=>ask.close('cancel')),yes=button(t('Delete'),()=>ask.close('delete'));
            yes.className='mobile-save-delete btn-danger';actions.append(cancel,yes);
            ask.replaceChildren(heading,...lines.slice(1).map(line=>el('p','',line)),actions);ask.returnValue='';
            ask.addEventListener('close',()=>resolve(ask.returnValue==='delete'),{once:true});
            ask.showModal();cancel.focus();
        });
    }
    // V-248: delete a started save after a clear confirmation. Another slot is emptied and listed again; the active one
    // reloads into a new game. Nothing is deleted when the confirmation is cancelled.
    async function remove(slot,summary,active,host){
        const t=text=>typeof MobileI18n==='undefined'?text:MobileI18n.t(text);
        const lines=[t('Delete Save '+slot.id+' for good?')];
        if(summary)lines.push(t('Zone '+summary.world+' · Universe '+summary.universe)+(slot.modified?' · '+t('Last saved: '+new Date(slot.modified).toLocaleString()):''));
        lines.push(t('It cannot be restored, and its bones are lost with it. To keep a backup, export it first while it is the active save.'));
        if(slot.id===active)lines.push(t('This is the save you are playing: a new game starts in it.'));
        if(!await confirmDelete(lines,t))return;
        if(!await act(()=>TrimpsMobile.deleteSlot(slot.id),'Deleting…','The save could not be deleted. Check the game status.'))return;
        if(slot.id===active)return;
        working=false;[...page.querySelectorAll('button'),...banner.querySelectorAll('button')].forEach(n=>n.disabled=false);
        await show('saves',host);result.textContent='Save '+slot.id+' deleted.';
    }
    async function show(view,host){
        if(working)return;
        (host||document.body).append(page);page.classList.toggle('mobile-saves-embedded',!!host);head.hidden=!!host;
        open=!host;page.hidden=false;content.replaceChildren();result.textContent='Loading…';title.textContent='Game saves';const token=++generation;
        try {
            await context();if(token!==generation)return;
                content.append(el('p','','Your current game is saved before switching. Offline progress follows the original rules.'));
                const state=await TrimpsMobile.slots();if(token!==generation)return;
                for(const slot of state.slots){
                    const row=el('article','mobile-save-slot'),line=el('div','mobile-save-slot-head');line.append(el('h2','','Save '+slot.id));if(slot.id===state.active)line.append(el('span','mobile-save-active','Active'));row.append(line);
                    const source=slot.save||localStorage.getItem(TrimpsMobile.storageKey(slot.id));let valid=!slot.error,summary=null;
                    if(source&&valid){try{summary=(await SaveValidation.validateInWorker(source)).summary;}catch(_){valid=false;}}
                    if(token!==generation)return;
                    const detail=el('p','','');detail.textContent=!valid?'Stored save unavailable. Other slots remain accessible.':summary?'Zone '+summary.world+' · Universe '+summary.universe:'Empty slot';
                    if(valid&&source&&slot.modified){detail.append(el('br',''),document.createTextNode('Last saved: '+new Date(slot.modified).toLocaleString()));}
                    const n=button(slot.id===state.active?'Playing':source?'Continue':'Start new game',()=>act(()=>TrimpsMobile.selectSlot(slot.id)));n.disabled=!valid||slot.id===state.active;if(!source)n.className='mobile-primary';row.append(detail,n);
                    if(source||!valid){const del=button('Delete save',()=>remove(slot,summary,state.active,host));del.className='mobile-save-delete';row.append(del);}
                    content.append(row);
                }
            result.textContent='';
        }catch(_){result.textContent='Stored saves could not be listed. Close this page and try again.';}
    }
    context().catch(()=>{});
    return {show,context,busy:()=>working,mountSaves:host=>show('saves',host),hideEmbedded:()=>{if(working)return false;if(page.classList.contains('mobile-saves-embedded')){generation++;page.hidden=true;}return true;},back:()=>{if(ask.open){ask.close();return true;}if(!open)return false;close();return true;}};
})();
