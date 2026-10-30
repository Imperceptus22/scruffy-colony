// Approved B: presentation routes over the original game nodes and native save manager.
var MobileMore = (() => {
    const $=id=>document.getElementById(id),more=$('mobile-more');
    const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const button=(label,action)=>{const n=node('button','mm-entry',label);n.type='button';n.setAttribute('aria-label',label);n.onclick=action;return n;};
    let tab='game',sub=null,active=false,owner=game;
    // V-237: texts rewritten every second are written translated, so the language layer has nothing to change.
    const t=text=>window.MobileI18n?MobileI18n.t(text):text;
    // V-200 A (Diorama only): Game, Saves and App form one tile overview without tabs; Saves opens as its own page with
    // Back, so only one navigation level is visible. Classic keeps the three tabs.
    const tiled=()=>document.documentElement.dataset.graphics==='diorama';
    const pages=new Map();
    const tabs=node('nav','mm-tabs');tabs.setAttribute('aria-label','More sections');
    const panes={};for(const key of ['game','saves','app']){panes[key]=node('section','mm-pane');panes[key].id='mm-'+key;}
    const detail=node('section','mm-detail');detail.hidden=true;
    const detailHead=node('header','mm-detail-head'),detailTitle=node('h2','','Settings');detailHead.append(button('‹ Back',()=>back()),detailTitle);detail.append(detailHead);
    const original=[...more.children];more.replaceChildren(node('h1','','More'),tabs,...Object.values(panes),detail);
    // Keep original roots/IDs connected for engine callbacks; their functional children move below.
    const archive=node('div','mm-original');archive.hidden=true;archive.append(...original.filter(n=>n.tagName!=='H1'));more.append(archive);
    const group=(host,label)=>{host.append(node('h2','mm-label',label));const n=node('div','mm-group');host.append(n);return n;};
    const move=(host,selector)=>{const n=typeof selector==='string'?document.querySelector(selector):selector;if(n)host.append(n);return n;};
    const activeSave=move(panes.game,'.mobile-active-save');const runContext=node('p','mm-context');panes.game.append(runContext);
    const quick=node('div','mm-quick');quick.append($('mobile-save-button'),button('Pause game',()=>{$('portalTimer').click();refresh();}));quick.lastElementChild.id='mm-pause';panes.game.append(quick);
    const savesTiles=group(panes.game,'Saves');savesTiles.append(button('Saves & backups',()=>show('saves')));
    savesTiles.classList.add('mm-tiles-only');savesTiles.previousElementSibling.classList.add('mm-tiles-only');
    const run=group(panes.game,'Your run');for(const id of ['mobile-more-portal'])move(run,$(id));move(run,'[data-menu-index="6"]');for(const id of ['mobile-more-heirlooms','mobile-more-bones'])move(run,$(id));
    const progress=group(panes.game,'Progress');move(progress,'[data-menu-index="4"]');move(progress,'[data-menu-index="3"]');move(panes.game,$('achievementTracker'));move(panes.game,$('portalTimer'));
    const savesHead=node('header','mm-detail-head mm-tiles-only');savesHead.append(button('‹ Back',()=>show('game')),node('h2','','Saves & backups'));panes.saves.append(savesHead);
    const saveContext=node('p','mm-save-context');panes.saves.append(saveContext,button('Save now',()=>$('mobile-save-button').click()));
    const slotHost=node('div','mm-slots');panes.saves.append(slotHost);
    const transfers=group(panes.saves,'Backup & transfer');for(const id of ['mobile-export-button','mobile-import-button','mobile-text-button'])move(transfers,$(id));
    const settings=group(panes.app,'Settings');for(const [key,label] of [['General','General'],['QOL','Quality of life'],['Layout','Display & layout'],['Performance','Performance & alerts'],['All','All settings']])settings.append(button(label,()=>openSettings(key)));
    // In the Diorama overview the QoL page (Game) and this settings category sit side by side: name the category apart.
    const qolSettings=settings.children[1];
    const help=group(panes.app,'Help & information');move(help,$('mobile-help'));help.append(button('About this app',()=>openAbout()));
    const settingsHere=$('settingsHere');detail.append(settingsHere);
    const custom=node('section','qol-page');custom.id='mm-qol-page';custom.hidden=true;detail.append(custom);
    const about=node('section','mm-about');about.hidden=true;detail.append(about);for(const id of ['mobile-privacy-button','mobile-licenses-button'])move(about,$(id));about.append(button('Legal notice',()=>TrimpsUI.infoText('Legal notice',MobileTexts.legalNotice)));
    const performanceTabs=node('div','mm-setting-shortcuts');for(const key of ['Performance','Alerts'])performanceTabs.append(button(key,()=>settingTab(key)));settingsHere.before(performanceTabs);performanceTabs.hidden=true;
    const savesButton=$('mobile-game-saves');savesButton.textContent='Saves';savesButton.className='';savesButton.onclick=()=>show('saves');
    for(const [key,label] of [['game','Game'],['saves','Saves'],['app','App']]){const b=key==='saves'?savesButton:button(label,()=>show(key));b.dataset.tab=key;tabs.append(b);}
    function closeSettings(){if(game.options.displayed)toggleSettingsMenu();}
    function show(next){
        if(MobileSaveManager.busy())return;MobileSaveManager.hideEmbedded();closeSettings();tab=next;sub=null;render();
        if(next==='saves')MobileSaveManager.mountSaves(slotHost);
        window.scrollTo(0,0);
    }
    function openSettings(category){
        sub='settings';render();if(!game.options.displayed)toggleSettingsMenu();settingTab(category);performanceTabs.hidden=category!=='Performance';window.scrollTo(0,0);
    }
    function openAbout(){sub='about';render();window.scrollTo(0,0);}
    function render(){
        const overview=tiled()&&!sub&&tab!=='saves';
        qolSettings.textContent=tiled()?'Quality of life settings':'Quality of life';qolSettings.setAttribute('aria-label',qolSettings.textContent);
        for(const [key,pane] of Object.entries(panes))pane.hidden=!!sub||(overview?key==='saves':key!==tab);
        tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false'));
        detail.hidden=!sub;detailTitle.textContent=pages.get(sub)?.label||(sub==='about'?'About this app':'Settings');about.hidden=sub!=='about';settingsHere.hidden=sub!=='settings';custom.hidden=!pages.has(sub);performanceTabs.hidden=true;
    }
    function back(){if(MobileSaveManager.busy())return true;if(!sub&&tiled()&&tab==='saves'){show('game');return true;}if(!sub)return false;closeSettings();sub=null;render();window.scrollTo(0,0);return true;}
    function onPage(name){
        const entering=name==='more'&&!active;active=name==='more';
        if(owner!==game){owner=game;tab='game';sub=null;}
        if(!active){MobileSaveManager.hideEmbedded();closeSettings();sub=null;render();return;}
        if(entering){show(tab);MobileSaveManager.context().catch(()=>{});}refresh();
    }
    function refresh(){
        if(owner!==game){owner=game;tab='game';sub=null;render();}
        // V-265: conditional entries (Current challenge) follow the game state; an open page whose condition ends closes.
        for(const [key,entry,visible] of conditional){const shown=!!visible();entry.hidden=!shown;if(!shown&&sub===key){sub=null;render();}}
        runContext.textContent=t('Universe '+game.global.universe+' · Zone '+game.global.world);
        saveContext.textContent=activeSave.textContent;
        $('mm-pause').textContent=t(game.options.menu.pauseGame.enabled?'Resume game':'Pause game');
    }
    function openPage(key){const page=pages.get(key);if(!page||conditional.some(([k,,visible])=>k===key&&!visible()))return;closeSettings();sub=key;render();custom.replaceChildren();page.build(custom);window.scrollTo(0,0);}
    const conditional=[];
    // V-265: 'run' places the entry in Your run after Perks; visible() hides it while its condition does not hold.
    function registerPage(key,label,location,build,visible){
        pages.set(key,{label,build});const entry=button(label,()=>openPage(key));
        if(location==='run'){const perks=run.querySelector('[data-menu-index="6"]');if(perks)perks.after(entry);else run.append(entry);}
        else (location==='app'?help:progress).append(entry);
        if(visible){entry.hidden=!visible();conditional.push([key,entry,visible]);}
    }
    document.addEventListener('scruffy:graphic-style',()=>render());
    render();return {show,back,onPage,refresh,openSettings,registerPage,openPage,currentPage:()=>active?sub:null};
})();
