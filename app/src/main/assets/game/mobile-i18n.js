// V-237: language of the app's own interface (English or German). The original game's texts stay English (stage 1).
// Without a stored choice the first system language decides: German Android shows German, anything else English.
// Catalogs (mobile-i18n-de.js) replace whole own text blocks (MobileTexts, help, ADVISOR) when they load and translate
// short own strings exactly as rendered, only inside the app's own interface; engine keys and saves are never touched.
var createMobileI18n = win => {
    const key='scruffy-colony-language',doc=win.document,languages={en:'English',de:'Deutsch'};
    function detect(){
        try{const value=win.localStorage.getItem(key);if(value==='en'||value==='de')return value;}catch{}
        const nav=win.navigator||{},first=(nav.languages&&nav.languages[0])||nav.language||'';
        return /^de(?:-|_|$)/i.test(first)?'de':'en';
    }
    const lang=detect();
    // The page stays lang="en": most of its text is the original game's. Translated elements get lang="de" (speech, hyphenation).
    if(doc?.documentElement?.dataset)doc.documentElement.dataset.language=lang;
    // Own interface only: the original game's windows keep their English text even where a phrase is identical.
    const scope='#mobile-header,#mobile-nav,#mobile-more,.mobile-save-manager,.mobile-development-banner,#mobile-help-panel,#mobile-save-feedback,#mobile-status,#mobile-recovery,#tipTitle,#mobile-license-text,#mobile-import-result,#mobile-overlay-close,#mobile-achievement-close,#achievementPopup .achievementBtnGo,#boneWrapper,#mobile-bone-note,#mobile-bone-jar-prop,#mobile-combat-tools';
    const skipped='script,style,textarea,code';
    const attributes=['title','aria-label','placeholder','href'];
    let strings=new Map(),patterns=[],links=new Map(),branded=null;
    function lookup(value){
        if(strings.has(value))return strings.get(value);
        // Branding may have renamed a phrase first (Trimps → Scruffies); match its rendered form as well.
        if(win.MobileBranding){
            if(!branded){branded=new Map();for(const [en,de] of strings)branded.set(win.MobileBranding.text(en),de);}
            if(branded.has(value))return branded.get(value);
        }
        for(const [pattern,replace] of patterns){const match=value.match(pattern);if(match)return replace(...match);}
        return null;
    }
    function t(value){
        if(lang==='en'||typeof value!=='string')return value;
        const core=value.trim();if(!core)return value;
        const next=lookup(core);
        return next===null?value:value.slice(0,value.indexOf(core))+next+value.slice(value.indexOf(core)+core.length);
    }
    function register(code,catalog){
        if(code!==lang||lang==='en')return false;
        for(const [name,value] of Object.entries(catalog.globals||{})){
            const current=win[name];
            win[name]=Array.isArray(value)||!current||typeof current!=='object'||Array.isArray(current)?value:Object.freeze({...current,...value});
        }
        strings=new Map(Object.entries(catalog.strings||{}));patterns=catalog.patterns||[];links=new Map(Object.entries(catalog.links||{}));branded=null;
        return true;
    }
    function inScope(node){return node&&node.closest(scope)&&!node.closest(skipped);}
    function translateText(node){
        if(!inScope(node.parentElement))return;
        const next=t(node.data);if(next!==node.data){node.data=next;if(node.parentElement.lang!=='de')node.parentElement.lang='de';}
    }
    function translateAttributes(node){
        if(!inScope(node))return;
        for(const name of attributes){
            const value=node.getAttribute(name);if(value===null)continue;
            const next=name==='href'?links.get(value):t(value);
            if(next&&next!==value)node.setAttribute(name,next);
        }
    }
    function refresh(root){
        if(lang==='en')return;
        if(root.nodeType===3)return translateText(root);
        // The original game replaces large subtrees all the time; only walk those that hold own interface.
        if(root.nodeType!==1||(!root.closest(scope)&&!root.querySelector(scope)))return;
        translateAttributes(root);
        for(const node of root.querySelectorAll('[title],[aria-label],[placeholder],a[href]'))translateAttributes(node);
        const walker=doc.createTreeWalker(root,4);
        while(walker.nextNode())translateText(walker.currentNode);
    }
    function start(){
        if(lang==='en'||!doc.body)return;
        refresh(doc.body);
        new win.MutationObserver(records=>{
            for(const record of records){
                if(record.type==='childList')record.addedNodes.forEach(refresh);
                else if(record.type==='attributes')translateAttributes(record.target);
                else translateText(record.target);
            }
        }).observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
        // Own confirmations and notices are shown by Android dialogs; unknown (original) messages pass unchanged.
        for(const name of ['alert','confirm']){const original=win[name];if(typeof original==='function')win[name]=message=>original.call(win,t(message));}
    }
    function set(value){
        if(!Object.hasOwn(languages,value))return false;
        try{win.localStorage.setItem(key,value);return true;}catch{return false;}
    }
    // More → App → Language. A change applies on the next start: the game is saved first, then the page reloads.
    function page(host){
        const label=doc.createElement('label'),name=doc.createElement('span'),select=doc.createElement('select'),note=doc.createElement('p'),result=doc.createElement('p');
        label.className='mobile-graphic-style mobile-language';name.textContent='Language';select.id='mobile-language';select.setAttribute('aria-label','Language');
        for(const [value,text] of Object.entries(languages)){const option=doc.createElement('option');option.value=value;option.textContent=text;option.lang=value;select.append(option);}
        select.value=lang;label.append(name,select);
        note.className='mobile-language-note';note.textContent='Covers the app’s own menus, help, ADVISOR, the Bone Trader with its purchase notes and the legal texts. In German, the original game is translated as well, apart from Spire Assault, the Player Spire and names that stay English as in guides. Changing the language saves the game and restarts it.';
        result.setAttribute('role','status');
        select.onchange=async()=>{
            if(select.value===lang)return;
            select.disabled=true;result.textContent='Saving and restarting…';
            const saved=typeof win.TrimpsMobile==='undefined'||await win.TrimpsMobile.saveNow().catch(()=>false);
            if(saved===true&&set(select.value)){win.location.reload();return;}
            select.value=lang;select.disabled=false;result.textContent='The language was not changed because the game could not be saved. Please try again.';
        };
        host.append(label,note,result);
    }
    function mount(){
        start();
        win.MobileMore?.registerPage('language','Language','app',page);
    }
    if(doc&&doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount);
    return {lang,t,register,refresh,set,mount,languages};
};
if(typeof module!=='undefined'&&module.exports)module.exports={create:createMobileI18n};
if(typeof window!=='undefined'&&window.document)window.MobileI18n=createMobileI18n(window);
