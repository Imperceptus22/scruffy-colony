var MobileQolPages=(()=>{
    const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
    const button=(label,action)=>{const e=el('button',label);e.type='button';e.onclick=action;return e;};
    const number=value=>{const e=el('span');e.innerHTML=prettify(value);return e.textContent;};
    function note(host){const e=el('p',MobileQolStore.error(),'qol-storage-note');e.hidden=!e.textContent;host.append(e);return e;}
    function changelog(host){
        host.classList.add('qol-page');host.append(el('p','Release notes are bundled offline from the project changelog.'));
        const add=entry=>{const d=el('details');d.append(el('summary',(entry.label||entry.version)+' · '+entry.title));const list=el('ul');for(const text of entry.notes)list.append(el('li',text));d.append(list);host.append(d);return d;};
        MobileChangelog.slice(0,10).forEach((entry,index)=>{add(entry).open=index===0;});
        const earlier=MobileChangelog.slice(10);
        if(earlier.length){const more=button('Show earlier versions',()=>{more.remove();earlier.forEach(add);});host.append(more);}
    }
    // V-198: feedback goes through the contact form on the website, opened in the system browser (GameWebViewClient);
    // the app itself sends nothing. The version line is selectable and copyable so a report can be matched.
    const feedbackUrl='https://scruffycolony.de/support.html#contact-title';
    function feedback(host){
        host.classList.add('qol-page','qol-feedback');
        host.append(el('p','Tell us what you like, what is missing or what went wrong. The button opens the contact form on scruffycolony.de in your browser; the app itself sends nothing and no save leaves your device.'));
        const version=(TrimpsMobile.version?.()||'').replace(/^(\d+)\.00(?=$|-)/,'$1.0'),build=TrimpsMobile.build?.();
        const field=el('input');field.readOnly=true;field.value='Scruffy Colony '+(version||'?')+(build?' (build '+build+')':'');
        const label=el('label');label.append(el('span','Please mention your app version:'),field);host.append(label);
        const copy=button('Copy version',()=>{field.select();let ok=false;try{ok=document.execCommand('copy');}catch{}copy.textContent=ok?'Copied':'Select and copy the line above';});host.append(copy);
        const link=el('a','Open contact form in browser','qol-link');link.href=feedbackUrl;host.append(link);
    }
    // V-265: read-only view of the running challenge. Name, rules, completion condition and, where the original provides
    // it, progress or run bonus (Challenge² zone and bonus, Daily bonus) come from the original's own "View Current
    // Challenge" text (getCurrentChallengePane, the same text the Perks view shows); nothing is rewritten or written back.
    const runningChallenge=()=>typeof game!=='undefined'&&!!game.global.challengeActive;
    function currentChallenge(host){
        host.classList.add('qol-page','qol-challenge');
        const name=game.global.challengeActive,challenge=game.challenges[name];
        host.append(el('h3',name+(game.global.runningChallengeSquared?(game.global.universe===2?'³':'²'):''),'qol-challenge-name'));
        const text=el('div',undefined,'qol-challenge-text');
        text.innerHTML=typeof getCurrentChallengePane==='function'?getCurrentChallengePane():(challenge?.description||'');
        host.append(text);
    }
    MobileMore.registerPage('challenge','Current challenge','run',currentChallenge,runningChallenge);
    MobileMore.registerPage('changelog','Changelog','app',changelog);
    MobileMore.registerPage('feedback','Feedback','app',feedback);return{el,button,number,note};
})();
