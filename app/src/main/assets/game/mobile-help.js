// A read-only archive: browsing never calls the live ADVISOR or changes tutorial progress.
var MobileHelp = (() => {
    let panel=null,content=null,backButton=null,lastFocus=null,chapterOpen=false,indexScroll=0;
    const button=(label,action)=>{const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-label',label);b.onclick=action;return b;};
    function ensurePanel(){
        if(panel)return;
        panel=document.createElement('section');panel.id='mobile-help-panel';panel.hidden=true;
        panel.lang=typeof MobileI18n!=='undefined'?MobileI18n.lang:'en';
        panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','mobile-help-title');
        const header=document.createElement('header'),title=document.createElement('h2');title.id='mobile-help-title';title.textContent='Help';
        backButton=button('Back to overview',back);header.append(backButton,title,button(MobileTexts.close,close));
        content=document.createElement('div');content.id='mobile-help-content';panel.append(header,content);document.body.append(panel);
        window.addEventListener('keydown',event=>{
            if(panel.hidden)return;
            // Keep native button defaults, but isolate the original game's document shortcuts.
            // Keyup still reaches the engine so modifiers held before opening cannot stay stuck.
            event.stopPropagation();
            if(event.key==='Escape'){event.preventDefault();back();}
            if(event.key!=='Tab')return;
            const targets=[...panel.querySelectorAll('button,summary,a[href],[tabindex="-1"]')].filter(n=>!n.hidden&&n.getClientRects().length&&!n.matches('[tabindex="-1"]'));
            const first=targets[0],last=targets.at(-1);
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        },true);
    }
    function heading(text){const h=document.createElement('h3');h.textContent=text;content.append(h);return h;}
    function showChapter(chapter){
        indexScroll=content.scrollTop;content.replaceChildren();chapterOpen=true;backButton.hidden=false;
        const h=heading(MobileBranding.text(chapter.title));h.tabIndex=-1;
        const body=document.createElement('div');body.className='mobile-help-reading';body.innerHTML=MobileBranding.text(chapter.html);
        content.append(body);
        content.scrollTop=0;h.focus();
    }
    function showIndex(){
        delete content.dataset.originalText;
        content.replaceChildren();chapterOpen=false;backButton.hidden=true;
        heading('ADVISOR – Guides');
        const note=document.createElement('p');note.className='mobile-help-note';note.textContent='Your unlocked chapters for reference.';content.append(note);
        for(const chapter of MobileAdvisorChapters){
            // The original tutorial.popup exposes every chapter after the first Portal; reading must not call it.
            if(game.global.totalPortals<1&&chapter.step>game.global.tutorialStep)continue;
            const section=document.createElement('article');section.dataset.advisorStep=chapter.step;
            const title=document.createElement('h3');title.textContent=MobileBranding.text(chapter.title);
            const body=document.createElement('div');body.className='mobile-help-reading';body.innerHTML=MobileBranding.text(chapter.html);
            const goal=document.createElement('p');goal.className='mobile-help-goal';goal.textContent='Goal: '+MobileBranding.text(chapter.goal);
            section.append(title,body,goal);content.append(section);
        }
        heading('Game Guide');
        for(const chapter of MobileHelpGuide)content.append(button(chapter.title,()=>showChapter(chapter)));
        // V-240: the guided start again from its first open step (steps already reached are skipped), in the first run.
        if(typeof MobileGuidedStart!=='undefined'&&game.global.totalPortals===0)content.append(button('Restart the guided start',()=>{close();MobileGuidedStart.restart();}));
        content.scrollTop=indexScroll;
    }
    function open(){
        ensurePanel();cancelTooltip();lastFocus=document.activeElement;indexScroll=0;panel.hidden=false;showIndex();
        panel.querySelector('header button:last-child').focus();
    }
    function close(){if(!panel)return;panel.hidden=true;if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});}
    function back(){if(!panel||panel.hidden)return false;if(chapterOpen)showIndex();else close();return true;}
    return {open,close,back};
})();
