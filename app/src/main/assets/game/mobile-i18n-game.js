// V-243: German texts of the original game (stage 2). Stage 1 (mobile-i18n.js) covers the app's own interface; this layer
// translates the original game's texts at their source wherever possible and leaves every engine key unchanged:
// - config texts that saves never keep (tooltip, options titles and descriptions) are replaced once per game object;
// - display names reach buttons and tooltip titles only while they are drawn, the config keeps no German name;
// - remaining composed lines of watched main screen areas are translated after rendering, never inside the message log
//   or elements the original compares with its own literals, listed in the project notes on stage 2.
// The language is constant at runtime (a change saves and reloads), so English devices skip everything.
var createMobileI18nGame = win => {
    const doc=win.document,lang=win.MobileI18n?win.MobileI18n.lang:'en',types=['buildings','jobs','equipment','upgrades'];
    const skipped='script,style,textarea,input,select,code,pre,[contenteditable],[data-original-text],#log';
    let attributes=['title','aria-label'],names={},strings=new Map(),patterns=[],probe=null,fragments=[],fragmentProbe=null,scope='',settings={},active=false;
    // produced remembers every German result: text this layer wrote is never translated again, so no observer loops.
    const cache=new Map(),produced=new Set(),done=new WeakSet();
    // Step 4: further catalog files (extend) add pattern groups, config fields and watched areas to the active catalog.
    const extras=[],fields=[],doneFields=new WeakMap();
    // Branding renames Trimps → Scruffies and research labels first; catalog keys are written in that branded English.
    const brand=value=>win.MobileBranding?win.MobileBranding.text(value):value;
    function lookup(core){
        if(strings.has(core))return strings.get(core);
        const branded=brand(core);
        if(strings.has(branded))return strings.get(branded);
        // Groups of extending catalogs come first: their patterns are anchored on their own texts.
        for(const group of extras){
            if(!group.probe||group.probe.test(branded))for(const [pattern,replace] of group.patterns){const match=branded.match(pattern);if(match)return replace(...match);}
            if(group.fragmentProbe&&group.fragmentProbe.test(branded)){const next=group.fragments.reduce((text,[pattern,replace])=>text.replace(pattern,replace),branded);if(next!==branded)return next;}
        }
        if(!probe||probe.test(branded))for(const [pattern,replace] of patterns){const match=branded.match(pattern);if(match)return replace(...match);}
        // Composed texts (getters, appended sentences): known English pieces are replaced inside the text.
        if(fragmentProbe&&fragmentProbe.test(branded)){const next=fragments.reduce((text,[pattern,replace])=>text.replace(pattern,replace),branded);if(next!==branded)return next;}
        return null;
    }
    function t(value){
        if(!active||typeof value!=='string')return value;
        const core=value.trim();if(!core||!/[A-Za-z]/.test(core)||produced.has(core))return value;
        let next=cache.get(core);
        if(next===undefined){next=lookup(core);if(cache.size>4000){cache.clear();produced.clear();}cache.set(core,next);if(next!==null)produced.add(next.trim());}
        if(next===null)return value;
        const at=value.indexOf(core);return value.slice(0,at)+next+value.slice(at+core.length);
    }
    const name=(type,key)=>active&&names[type]&&Object.hasOwn(names[type],key)?names[type][key]:null;
    // A text property becomes German in place: strings directly, functions and getters through their result.
    function translateProperty(owner,property){
        const d=Object.getOwnPropertyDescriptor(owner,property);if(!d)return;
        if(d.get)Object.defineProperty(owner,property,{...d,get(){const value=d.get.call(this);return Array.isArray(value)?value.map(t):t(value);}});
        else if(typeof d.value==='string')owner[property]=t(d.value);
        else if(typeof d.value==='function')owner[property]=function(...args){return t(d.value.apply(this,args));};
        else if(Array.isArray(d.value))owner[property]=d.value.map(t);
    }
    // Only fields the original save drops (saveOriginal in main.js) are replaced; names, keys and states stay English.
    function translateGame(game){
        if(!active||!game||done.has(game))return game;
        done.add(game);
        for(const type of types)for(const item of Object.values(game[type]||{})){translateProperty(item,'tooltip');translateProperty(item,'blocktip');}
        for(const [key,setting] of Object.entries(game.options?.menu||{})){
            if(done.has(setting))continue;done.add(setting);
            const own=settings[key]||{};
            if(own.titles&&Array.isArray(setting.titles))setting.titles=setting.titles.map((title,i)=>own.titles[i]??t(title));else translateProperty(setting,'titles');
            if(typeof own.description==='string'&&typeof setting.description==='string')setting.description=own.description;else translateProperty(setting,'description');
        }
        translateFields(game);
        return game;
    }
    // Fields of extending catalogs ({portal: ['tooltip']} …); each item field is replaced once, also in new game objects.
    function translateFields(game){
        if(!active||!game)return;
        for(const [type,list] of fields)for(const item of Object.values(game[type]||{})){
            if(!item||typeof item!=='object')continue;
            const own=doneFields.get(item)||new Set();doneFields.set(item,own);
            for(const field of list)if(!own.has(field)){own.add(field);translateProperty(item,field);}
        }
    }
    function hook(fn,wrap){const original=win[fn];if(typeof original==='function')win[fn]=wrap(original);}
    // V-279: an app start loads the stored save and draws its tiles before this script runs; buildings are rarely drawn
    // again, so their names stayed English. The four grids are drawn once more through the hooks.
    function redraw(){
        if(!win.game||!doc?.getElementById('buildingsHere'))return;
        for(const fn of ['drawAllBuildings','drawAllJobs','drawAllUpgrades','drawAllEquipment'])if(typeof win[fn]==='function'){try{win[fn](true);}catch{}}
    }
    // The German name exists only while the original draws the button or tooltip; .name keeps its saved value.
    function withName(type,key,draw){
        const item=win.game?.[type]?.[key],german=name(type,key);
        if(!item||!german)return draw();
        const had=Object.hasOwn(item,'name'),old=item.name;item.name=german;
        try{return draw();}finally{if(had)item.name=old;else delete item.name;}
    }
    function hooks(){
        hook('newGame',original=>function(...args){return translateGame(original.apply(this,args));});
        // The visible name (after the alert badge) is marked German so hyphenation and speech use German rules; the
        // aria-label keeps the plain name.
        hook('makeBuildJobUpgEquipButtonHTML',original=>function(type,what,...rest){
            const html=withName(type,what,()=>original.call(this,type,what,...rest)),german=name(type,what);
            if(!german||typeof html!=='string')return html;
            const badge='class="alert badge">';let out='',tail=html,at;
            while((at=tail.indexOf(badge))>=0&&tail.indexOf('</span>',at)>=0){
                const close=tail.indexOf('</span>',at)+7;out+=tail.slice(0,close);tail=tail.slice(close);
                if(tail.startsWith(german)&&/^[\s<]/.test(tail.slice(german.length))){out+='<span lang="de">'+german+'</span>';tail=tail.slice(german.length);}
            }
            return out+tail;
        });
        hook('tooltip',original=>function(what,isItIn,...rest){
            const result=original.call(this,what,isItIn,...rest),german=types.includes(isItIn)?name(isItIn,what):null;
            const title=doc?.getElementById('tipTitle');
            if(title&&german&&(title.textContent===what||title.textContent===win.game?.[isItIn]?.[what]?.name||title.textContent.startsWith(what+' X '))){title.textContent=german+title.textContent.slice(title.textContent.startsWith(what+' X ')?what.length:title.textContent.length);title.lang='de';title.dataset.i18nGame='';}
            else if(title&&'i18nGame' in title.dataset){title.removeAttribute('lang');delete title.dataset.i18nGame;}
            return result;
        });
    }
    function inScope(node){return !!(scope&&node&&node.closest(scope)&&!node.closest(skipped));}
    function translateText(node){
        if(!inScope(node.parentElement))return;
        // Window roots (#tipText …) are shared with English texts of later steps: only elements inside them are marked German.
        const next=t(node.data);if(next!==node.data){node.data=next;if(node.parentElement.lang!=='de'&&!node.parentElement.matches(scope))node.parentElement.lang='de';}
    }
    function translateAttributes(node){
        if(!inScope(node))return;
        for(const attribute of attributes){const value=node.getAttribute(attribute);if(value===null)continue;const next=t(value);if(next!==value)node.setAttribute(attribute,next);}
    }
    function refresh(root){
        if(!active||!scope||!root)return;
        if(root.nodeType===3)return translateText(root);
        if(root.nodeType!==1||(!root.closest(scope)&&!root.querySelector(scope)))return;
        translateAttributes(root);
        for(const node of root.querySelectorAll(attributes.map(attribute=>'['+attribute+']').join(',')))translateAttributes(node);
        const walker=doc.createTreeWalker(root,4);
        while(walker.nextNode())translateText(walker.currentNode);
    }
    function watch(css){
        // Labels the stylesheets draw (content:) get German rules; html[data-language] comes from stage 1.
        if(css&&doc?.head){const style=doc.createElement('style');style.id='mobile-i18n-game-style';style.textContent=css;doc.head.append(style);}
        if(!scope||!doc?.body)return;
        refresh(doc.body);
        new win.MutationObserver(records=>{
            for(const record of records){
                if(record.type==='childList')record.addedNodes.forEach(refresh);
                else if(record.type==='attributes')translateAttributes(record.target);
                else translateText(record.target);
            }
        }).observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
    }
    // catalog: names {type: {key: German}}, strings {branded English: German}, patterns [[RegExp, replace]], probe RegExp
    // (cheap prefilter for patterns), fragments [[global RegExp, replacement]] with fragmentProbe (pieces replaced inside
    // composed texts), settings {key: {titles, description}}, scope (selector of watched original areas),
    // attributes (further attributes translated in scope, such as data-* labels drawn by CSS), css (German rules for labels
    // the stylesheets draw, and hyphenation of German names).
    function register(code,catalog){
        if(code!==lang||lang==='en'||active)return false;
        names=catalog.names||{};strings=new Map(Object.entries(catalog.strings||{}));patterns=catalog.patterns||[];probe=catalog.probe||null;fragments=catalog.fragments||[];fragmentProbe=catalog.fragmentProbe||null;
        settings=catalog.settings||{};scope=catalog.scope||'';attributes=[...attributes,...(catalog.attributes||[])];active=true;
        translateGame(win.game);hooks();redraw();
        if(doc&&doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',()=>watch(catalog.css));else watch(catalog.css);
        return true;
    }
    // Step 4: a later catalog file joins the active one (same cache, same observer). catalog: strings, patterns with probe,
    // fragments with fragmentProbe (as in register), fields {config type: [text fields the save drops]}, scope (further
    // watched areas). Texts cached before are looked up again.
    function extend(code,catalog){
        if(code!==lang||!active||!catalog)return false;
        for(const [key,value] of Object.entries(catalog.strings||{}))strings.set(key,value);
        extras.push({patterns:catalog.patterns||[],probe:catalog.probe||null,fragments:catalog.fragments||[],fragmentProbe:catalog.fragmentProbe||null});
        for(const [type,list] of Object.entries(catalog.fields||{}))fields.push([type,list]);
        cache.clear();translateFields(win.game);
        if(catalog.scope){scope+=','+catalog.scope;if(doc?.body&&doc.readyState!=='loading')refresh(doc.body);}
        return true;
    }
    // Step 3: a log line becomes German before message() (updates.js) stores it, so the log is never watched or rewritten.
    // "Game Saved!" stays English: message() compares it with that literal. Leading icons, the zone mark of story lines
    // ("Z:12 ") and the cell mark for screen readers ("Cell 4: ") stay around the translated sentence. Log lines carry
    // changing numbers, so the cache keeps a bounded number of lines and starts over when full.
    let log=null;const logCache=new Map(),lead=/^((?:<span[^>]*><\/span>\s*)*)(?:(Z:\d+) )?(?:Cell (\d+): )?/;
    function logLookup(core){
        if(log.strings.has(core))return log.strings.get(core);
        const branded=brand(core);
        if(log.strings.has(branded))return log.strings.get(branded);
        // A pattern that returns null declines the line, so a later catalog can still translate it (review 4f).
        for(const group of log.groups)if(!group.probe||group.probe.test(branded))for(const [pattern,replace] of group.patterns){const match=branded.match(pattern);if(match){const result=replace(...match);if(result!==null)return result;}}
        return null;
    }
    function logLine(value){
        if(!log||typeof value!=='string'||value==='Game Saved!')return value;
        let next=logCache.get(value);
        if(next===undefined){
            const [head,icons,zone,cell]=value.match(lead),core=value.slice(head.length).trim();
            const german=/[A-Za-z]/.test(core)?logLookup(core):null;
            next=german===null?null:icons+(zone?zone+' ':'')+(cell?'Feld '+cell+': ':'')+german;
            if(logCache.size>=500)logCache.clear();
            logCache.set(value,next);
        }
        return next===null?value:next;
    }
    // log catalog: strings {English or branded English: German}, patterns [[RegExp on the branded line, replace]], probe
    // (cheap prefilter for patterns). Only message() is wrapped; its type, icon, class and filter arguments stay as they are.
    // Step 4: several log catalogs (the step 3 log, challenges …) are merged. message() is wrapped once; exact sentences of
    // an earlier catalog win, and each catalog keeps its patterns behind its own probe, tried in the order of registration.
    function registerLog(code,catalog){
        if(code!==lang||!active)return false;
        const group={patterns:catalog.patterns||[],probe:catalog.probe||null};
        if(log){
            for(const [english,german] of Object.entries(catalog.strings||{}))if(!log.strings.has(english))log.strings.set(english,german);
            log.groups.push(group);logCache.clear();return true;
        }
        log={strings:new Map(Object.entries(catalog.strings||{})),groups:[group]};
        hook('message',original=>function(text,...rest){return original.call(this,logLine(text),...rest);});
        return true;
    }
    return {lang,t,name,register,extend,registerLog,logLine,translateGame,refresh,get active(){return active;}};
};
if(typeof module!=='undefined'&&module.exports)module.exports={create:createMobileI18nGame};
if(typeof window!=='undefined'&&window.document)window.MobileI18nGame=createMobileI18nGame(window);
