// V-274 (variant A, user choice 29.10.2026): the original "Configure Maps" window (tooltip('Configure Maps', null, 'update'),
// #tooltipDiv2) as the parchment list of the info windows in Diorama. After the original has drawn the window, the original
// option containers are moved into three groups; each row shows the name of the setting, step marks for its current value
// and the original button as the value plate. Buttons, ids and onclick stay those of the game, so one tap cycles the value
// as before. Own texts (title, Close, group headings, names, On/Off of Repeat) live here in English and German.
// Classic keeps the original window untouched; mobile-diorama-configure-maps.css styles the marked window only.
// To withdraw it, delete this file, mobile-diorama-configure-maps.css and their two lines in index.html.
var createMobileConfigureMaps = win => {
    const doc=win.document;
    const groups=[['repeat',['repeatBtn2','repeatUntil','repeatVoids','climbBw']],['leave',['exitTo','mapsOnSpire','mapAtZone']],['loot',['mapLoot','extraMapBtns']]];
    const texts={
        en:{title:'Configure Maps',close:'Close',on:'On',off:'Off',value:(i,n)=>'Value '+i+' of '+n,
            groups:{repeat:'Repeat',leave:'Leaving maps',loot:'Loot and display'},
            names:{repeatBtn2:'Repeat map',repeatUntil:'Repeat until',repeatVoids:'Void Maps',climbBw:'Bionic Wonderland',exitTo:'After a map',
                mapsOnSpire:'At Spires',mapAtZone:'Maps at Zone',mapLoot:'Map loot',extraMapBtns:'Map controls'}},
        de:{title:'Maps einstellen',close:'Schließen',on:'An',off:'Aus',value:(i,n)=>'Wert '+i+' von '+n,
            groups:{repeat:'Wiederholen',leave:'Maps verlassen',loot:'Beute und Anzeige'},
            names:{repeatBtn2:'Map wiederholen',repeatUntil:'Wiederholen bis',repeatVoids:'Void Maps',climbBw:'Bionic Wonderland',exitTo:'Nach der Map',
                mapsOnSpire:'An Spires',mapAtZone:'Maps bei Zone',mapLoot:'Map-Beute',extraMapBtns:'Map-Knöpfe'}}
    };
    const lang=()=>win.MobileI18n&&win.MobileI18n.lang==='de'?'de':'en';
    const idOf=key=>key==='repeatBtn2'?key:'toggle'+key+'CM';
    // Groups with the settings the original drew (it leaves out locked ones); unknown later settings join the last group.
    function plan(present){
        const known=new Set(groups.flatMap(([,keys])=>keys)),out=groups.map(([id,keys])=>({id,keys:keys.filter(key=>present.includes(key))}));
        out[out.length-1].keys.push(...present.filter(key=>!known.has(key)));
        return out.filter(group=>group.keys.length);
    }
    const steps=(index,count)=>Array.from({length:count},(_,i)=>i===index?'●':'○').join(' ');
    function state(key){
        if(key==='repeatBtn2')return {index:win.game&&win.game.global.repeatMap?1:0,count:2};
        const option=win.game&&win.game.options.menu[key];
        return option&&Array.isArray(option.titles)?{index:option.enabled,count:option.titles.length}:null;
    }
    const keyOf=button=>button.id==='repeatBtn2'?'repeatBtn2':(button.id.match(/^toggle(.+)CM$/)||[])[1];
    function sync(list){
        const text=texts[lang()];
        for(const row of list.querySelectorAll('.mobile-cm-row')){
            const key=row.dataset.key,s=state(key),button=doc.getElementById(idOf(key)),marks=row.querySelector('.mobile-cm-steps');
            if(!s||!marks)continue;
            const next=steps(s.index,s.count),label=text.value(s.index+1,s.count);
            if(marks.textContent!==next)marks.textContent=next;
            if(marks.getAttribute('aria-label')!==label)marks.setAttribute('aria-label',label);
            // The original writes "Repeat On/Off"; under the name Repeat map the plate says only On/Off.
            if(key==='repeatBtn2'&&button){const value=s.index?text.on:text.off;if(button.textContent!==value)button.textContent=value;}
        }
    }
    function enhance(){
        const tip=doc.getElementById('tooltipDiv2'),title=doc.getElementById('tipTitle2'),body=doc.getElementById('tipText2');
        const host=body&&body.querySelector('.maxCenter');
        if(!tip||!title||!host||doc.documentElement.dataset.graphics!=='diorama')return false;
        const code=lang(),text=texts[code],german=code==='de';
        const buttons=[...host.querySelectorAll('.settingsBtn')].filter(button=>keyOf(button));
        if(!buttons.length)return false;
        title.textContent=text.title;if(german)title.lang='de';
        const close=doc.createElement('button');close.type='button';close.className='mobile-cm-close';close.textContent='×';close.setAttribute('aria-label',text.close);
        close.onclick=()=>win.cancelTooltip();title.append(close);
        // The English sentence "Customize your settings for running maps!" repeats the title.
        for(const node of [...body.children])if(node.tagName==='DIV'&&!node.id&&node!==host)node.hidden=true;
        const done=tip.querySelector('#tipCost2')?.querySelector('#confirmTooltipBtn');
        if(done){done.textContent=text.close;if(german)done.lang='de';}
        const list=doc.createElement('div');list.className='mobile-cm-list';
        const byKey=new Map(buttons.map(button=>[keyOf(button),button]));
        for(const group of plan([...byKey.keys()])){
            const section=doc.createElement('section'),heading=doc.createElement('h3');
            section.className='mobile-cm-group';heading.textContent=text.groups[group.id];if(german)heading.lang='de';section.append(heading);
            for(const key of group.keys){
                const button=byKey.get(key),row=doc.createElement('div'),name=doc.createElement('span'),marks=doc.createElement('span');
                row.className='mobile-cm-row';row.dataset.key=key;
                name.className='mobile-cm-name';name.id='mobile-cm-name-'+key;name.textContent=text.names[key]||'';if(german)name.lang='de';
                marks.className='mobile-cm-steps';marks.id='mobile-cm-steps-'+key;marks.setAttribute('role','img');
                // The original button itself, with its id, classes and onclick, moves into the row.
                button.setAttribute('aria-describedby',name.id+' '+marks.id);
                row.append(name,marks,button.closest('.optionContainer')||button);section.append(row);
            }
            list.append(section);
        }
        host.replaceChildren(list);
        tip.dataset.mobileConfigureMaps='';
        sync(list);
        // A tap updates the marks right after the original onclick (it bubbles to the list); the observer follows changes
        // the original makes in other ways (hotkeys, the map sidebar).
        list.addEventListener('click',()=>sync(list));
        if(win.MutationObserver)new win.MutationObserver(()=>sync(list)).observe(list,{subtree:true,childList:true,characterData:true});
        return true;
    }
    function after(what,isItIn){
        const tip=doc.getElementById('tooltipDiv2');if(!tip)return;
        if(what==='Configure Maps'&&isItIn==null&&enhance())return;
        // Another window drew into #tooltipDiv2 (Geneticistassist, Generator, Lost Time …): the mark goes with the list.
        if('mobileConfigureMaps' in tip.dataset&&!tip.querySelector('.mobile-cm-list')){delete tip.dataset.mobileConfigureMaps;doc.getElementById('tipTitle2')?.removeAttribute('lang');}
    }
    function install(){
        const original=win.tooltip;
        if(typeof original!=='function'||original.mobileConfigureMaps)return false;
        const wrapped=function(what,isItIn,...rest){const result=original.call(this,what,isItIn,...rest);after(what,isItIn);return result;};
        wrapped.mobileConfigureMaps=true;win.tooltip=wrapped;
        // A style change while the window is open draws it again, so Classic gets the original layout back.
        doc.addEventListener('scruffy:graphic-style',()=>{
            const tip=doc.getElementById('tooltipDiv2');
            if(tip&&tip.style.display!=='none'&&tip.querySelector('#repeatBtn2'))win.tooltip('Configure Maps',null,'update');
        });
        return true;
    }
    return {groups,texts,plan,steps,enhance,install};
};
if(typeof module!=='undefined'&&module.exports)module.exports={create:createMobileConfigureMaps};
if(typeof window!=='undefined'&&window.document){window.MobileConfigureMaps=createMobileConfigureMaps(window);window.MobileConfigureMaps.install();}
