// Presentation only. Retain original nodes/handlers and never change battle/map state on navigation.
var MobileDesign = (() => {
    const byId=id=>document.getElementById(id);
    let page='colony', lastEnemy='', logScroll=0, followLog=true, logAnchor=null, logSequence=0, queueSignature='';
    function button(text, action, cls='') {
        const node=document.createElement('button');node.textContent=text;node.className=cls;node.onclick=action;return node;
    }
    function group(host,title){const heading=document.createElement('h2');heading.textContent=title;host.append(heading);const box=document.createElement('div');box.className='mobile-menu-group';host.append(box);return box;}
    function setupMore(){
        const more=byId('mobile-more'), table=byId('settingsTable'), cells=[...table.querySelectorAll('td')];
        const discover=group(more,'Discover'), settings=group(more,'Game & Settings');
        const help=button('Help / Game Guide',()=>MobileHelp.open(),'mobile-menu-entry');help.id='mobile-help';discover.prepend(help);
        // V-217: a soft hyphen breaks Achievements as Achieve-ments at large text sizes; the WebView has no English hyphenation.
        for(const [index,label,host] of [[4,'Achieve\u00ADments',discover],[3,'Statistics',discover],[6,null,discover],[5,null,settings]]){
            const cell=cells[index];if(label)cell.textContent=label;cell.classList.add('mobile-menu-entry');cell.dataset.menuIndex=index;cell.setAttribute('role','button');cell.tabIndex=0;host.append(cell);
        }
        for(const [id,label,source] of [['mobile-more-bones','Bone Trader','boneBtnContainer'],['mobile-more-heirlooms','Heirlooms','heirloomBtnContainer'],['mobile-more-portal','Portal','portalBtn']]){
            const node=button(label,()=>byId(source==='portalBtn'?source:source==='boneBtnContainer'?'boneBtnMain':'heirloomsBtn').click(),'mobile-menu-entry');node.id=id;node.dataset.unlockSource=source;discover.append(node);
        }
        table.hidden=true;
        byId('settingsText').firstChild.textContent='Settings';
        const license=byId('mobile-licenses-button');license.classList.add('mobile-menu-entry');settings.append(license);
        const timer=byId('portalTimer'), clock=byId('portalTime');clock.hidden=true;
        const clockLabel=document.createElement('span');clockLabel.innerHTML='Run time <small>Days:Hrs:Min:Sec</small><strong id="mobile-run-clock"></strong>';
        const pauseAction=document.createElement('strong');pauseAction.id='mobile-pause-action';timer.replaceChildren(clock,clockLabel,pauseAction);timer.setAttribute('aria-label','Pause game');
        more.append(byId('achievementTracker'));
        const stopTracking=byId('closeTrackedAchieve');stopTracking.className='mobile-track-close';stopTracking.textContent='';stopTracking.setAttribute('role','button');stopTracking.tabIndex=0;stopTracking.setAttribute('aria-label','Stop tracking achievement');
        const fileHeader=more.querySelector('h2');if(fileHeader){fileHeader.textContent='Save game';more.querySelector('.mobile-file-actions').before(fileHeader);}
        // Existing native file actions are single entries, original hidden table IDs remain for engine updates.
    }
    function setupLog(){
        const panel=document.createElement('section');panel.id='mobile-log-panel';panel.setAttribute('aria-label','Combat Log');
        const head=document.createElement('header'),title=document.createElement('h2');title.textContent='Combat Log';head.append(title);
        panel.append(head,byId('logColumn'));byId('mobile-battle').append(panel);byId('logColumn').hidden=false;
        for(const [kind,label] of Object.entries({Story:'Story',Loot:'Loot',Unlocks:'Unlocks',Combat:'Combat'})){
            const filter=byId(kind+'Filter');filter.dataset.logIcon=kind;filter.setAttribute('aria-label',label+' messages on/off');
        }
        byId('logConfigBtn').setAttribute('aria-label','Configure messages');
        const log=byId('log');
        log.addEventListener('scroll',rememberLog);
        const observer=new MutationObserver(refreshLog);observer.observe(log,{childList:true,subtree:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:['style']});
        byId('logBtnGroup').addEventListener('click',()=>{followLog=true;logScroll=0;logAnchor=null;refreshLog();restoreLog();});refreshLog();
    }
    function rememberLog(){
        if(page!=='battle')return;
        const log=byId('log'),top=log.getBoundingClientRect().top;
        logScroll=log.scrollTop;followLog=logScroll<=10;
        const first=[...log.querySelectorAll('.message')].reverse().find(n=>n.getBoundingClientRect().height&&n.getBoundingClientRect().bottom>top+1);
        logAnchor=first?{id:first.dataset.mobileLogId,offset:first.getBoundingClientRect().top-top}:null;
    }
    function restoreLog(){
        if(page!=='battle')return;
        const log=byId('log'),node=logAnchor&&[...log.querySelectorAll('.message')].find(n=>n.dataset.mobileLogId===logAnchor.id&&n.getBoundingClientRect().height);
        if(followLog)log.scrollTop=0;
        else if(node)log.scrollTop+=node.getBoundingClientRect().top-log.getBoundingClientRect().top-logAnchor.offset;
        else log.scrollTop=logScroll;
        rememberLog();
    }
    function refreshLog(records){
        const log=byId('log');let reordered=false;
        const visibilityChanged=Array.isArray(records)&&records.some(r=>r.type==='attributes'&&r.target.classList.contains('message')&&((/(?:^|;)\s*display\s*:\s*([^;]*)/.exec(r.oldValue||'')?.[1]||'').trim()!==r.target.style.display));
        if(visibilityChanged){followLog=true;logScroll=0;logAnchor=null;}
        // Preserve the engine's chronological DOM for batching, trimming and filters. Only visual order changes.
        [...log.querySelectorAll('.message')].forEach((node,index)=>{if(!node.dataset.mobileLogId)node.dataset.mobileLogId=String(++logSequence);const order=String(-index);if(node.style.order!==order){node.style.order=order;reordered=true;}});
        const visible=[...byId('log').querySelectorAll('.message')].filter(n=>n.style.display!=='none');
        for(const kind of ['Story','Loot','Unlocks','Combat'])byId(kind+'Filter').setAttribute('aria-pressed',String(game.global.messages[kind].enabled));
        // Move only an existing leading timestamp into a metadata span; never invent or translate log content.
        for(const node of visible){if(node.querySelector('.mobile-message-time'))continue;for(const text of [...node.childNodes]){
            if(text.nodeType!==3)continue;const match=/^(\s*)(\d{2,}:\d{2}:\d{2}(?::\d{2})?)\s/.exec(text.textContent);if(!match)continue;
            const stamp=document.createElement('span');stamp.className='mobile-message-time';stamp.textContent=match[0];text.before(stamp);text.textContent=text.textContent.slice(match[0].length);break;
        }}
        // Original save notices also replace content without changing order or visibility.
        if(reordered||visibilityChanged||(Array.isArray(records)&&records.some(r=>r.type==='childList'||r.type==='characterData')))restoreLog();
    }
    function refreshMore(){
        const paused=game.options.menu.pauseGame.enabled===1,timer=byId('portalTimer');timer.classList.add('mobile-menu-entry');timer.dataset.paused=String(paused);timer.setAttribute('aria-pressed',String(paused));
        byId('mobile-run-clock').textContent=byId('portalTime').textContent.replace(/\s*\(PAUSED\)/,'').trim();
        // V-237: written translated, so the language layer has nothing to change every second.
        const action=window.MobileI18n?MobileI18n.t(paused?'Resume game':'Pause game'):paused?'Resume game':'Pause game';byId('mobile-pause-action').textContent=action;timer.setAttribute('aria-label',action);
    }
    function setupQueue(){
        const summary=document.createElement('p');summary.id='mobile-queue-summary';byId('mobile-queue-title').after(summary);
        const groups=document.createElement('div');groups.id='mobile-queue-groups';byId('queueItemsHere').before(groups);
        new MutationObserver(refreshQueue).observe(byId('queueItemsHere'),{childList:true,subtree:true,attributes:true,attributeFilter:['style']});refreshQueue();
    }
    function setupButtonFeedback(){
        let pressed=null,timer=null,started=0;
        const release=()=>{const node=pressed;clearTimeout(timer);timer=setTimeout(()=>{node?.classList.remove('mobile-pressed');if(pressed===node)pressed=null;},Math.max(0,120-(performance.now()-started)));};
        const press=event=>{const node=event.target.closest?.('button,.btn,.thing,.formationBtn,[role="button"],a[onclick],.queueItem,.mobile-menu-entry');
            if(!node||node.id==='autoStorageBtn'||node.matches(':disabled,[aria-disabled="true"],.thingColorCanNotAfford,[aria-busy="true"]'))return;
            // V-210: Diorama paints grid cells by their exact class list; a pressed class would drop the tile art for a flat plate.
            if(node.matches('.battleCell')&&document.documentElement.dataset.graphics==='diorama')return;
            clearTimeout(timer);pressed?.classList.remove('mobile-pressed');pressed=node;started=performance.now();node.classList.add('mobile-pressed');
        };
        document.addEventListener('pointerdown',press,true);document.addEventListener('pointerup',release,true);document.addEventListener('pointercancel',release,true);
        document.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))press(event);},true);
        document.addEventListener('keyup',event=>{if(['Enter',' '].includes(event.key))release();},true);
        window.addEventListener('blur',release);
    }
    function refreshQueue(){
        const entries=game.global.buildingsQueue,summary=byId('mobile-queue-summary');
        const first=entries[0]?.split('.'),time=byId('queueTimeRemaining')?.textContent.replace(/^\s*-\s*/,'').replace(/ Seconds?/,' s').trim();
        const text=first ? first[0]+' ×'+(first[1]||1)+(time ? ' · '+time : ' · Waiting') : 'No buildings queued';
        if(summary.textContent!==text)summary.textContent=text;summary.hidden=false;
        const groups=MobileInventory.queueGroups(entries);
        byId('mobile-queue-title').textContent='Build Queue · '+groups.length+' type'+(groups.length===1?'':'s');
        const progress=byId('mobile-queue-progress');
        if(progress)progress.firstElementChild.style.transform=entries.length ? (byId('animationDiv')?.style.transform||'scaleX(0)') : 'scaleX(0)';
        const originalRows=[...byId('queueItemsHere').children];
        const signature=JSON.stringify([entries,originalRows.map(row=>row.id)]);
        if(signature===queueSignature)return;
        queueSignature=signature;
        const host=byId('mobile-queue-groups'),open=new Set([...host.querySelectorAll('details[open]')].map(row=>row.dataset.queueType));
        host.replaceChildren();
        for(const group of groups){
            const details=document.createElement('details');details.dataset.queueType=group.name;details.open=open.has(group.name);
            const heading=document.createElement('summary');heading.textContent=group.name+' ×'+prettify(group.count);
            const state=document.createElement('small');state.textContent=group.indices[0]===0?'Building · Details':'Waiting · Details';heading.append(state);details.append(heading);
            for(const index of group.indices){
                const original=originalRows[index];if(!original)continue;
                const amount=entries[index].split('.')[1]||1;
                const cancel=button('Cancel order '+(index+1)+' · ×'+prettify(Number(amount))+'',()=>original.click());
                cancel.dataset.originalQueueId=original.id;details.append(cancel);
            }
            host.append(details);
        }
    }
    function setupCombat(){
        const scene=document.createElement('div');scene.id='mobile-combat-scene';scene.setAttribute('aria-hidden','true');
        scene.innerHTML='<img class="mobile-trimp-art" src="mobile-assets/trimps.png" alt=""><div id="mobile-enemy-art"></div><span class="mobile-duel-mark"></span>';
        byId('battleHeadContainer').prepend(scene);
        byId('gridContainer').before(byId('battleSideTitle'));
        byId('gridContainer').after(byId('battleBtnsColumn'));
        const stances=byId('colStances');byId('battleStatsRow').after(stances);
        for(const [id,stats] of [['goodGuyCol','goodGuyStatsRow'],['badGuyCol','badGuyRow']]){
            const col=byId(id), bar=col.querySelector('.fightBar'), readout=col.querySelector('.innerFightBar');
            readout.classList.add('mobile-health-value');readout.removeAttribute('role');readout.removeAttribute('tabindex');
            if(id==='goodGuyCol'){
                const old=readout.onclick;readout.onclick=null;
                if(readout.firstChild?.nodeType===3&&readout.firstChild.textContent.startsWith('Info'))readout.firstChild.remove();
                byId('colGoodGuyName').append(button('Info',old,'mobile-info mobile-battle-values-info'));
            }
            const life=document.createElement('div');life.className='mobile-life';const label=document.createElement('span');label.textContent='Health';life.append(label,readout);
            col.append(life,bar,byId(stats));
        }
        byId('damageDiv').onclick=null;byId('blockDiv').onclick=null;
        // Replace only the original label text, retaining values, critical markers and original node identities.
        for(const id of ['goodGuyAttack','badGuyAttack']){
            const unit=byId(id).nextSibling;
            if(unit?.nodeType===3&&/DMG/.test(unit.textContent)){
                const icon=document.createElement('span');icon.className='mobile-stat-icon mobile-stat-attack';icon.setAttribute('role','img');icon.setAttribute('aria-label','Damage');
                unit.before(icon);unit.textContent=unit.textContent.replace(/\s*DMG/,' ');
            }
        }
        const loot=byId('lootBdBtn');loot.textContent='Loot';loot.onclick=()=>TrimpsUI.infoAction(()=>getLootBd('Food/Wood/Metal'),false);
        // Keep the original map chamber independent of the battle display.
        byId('mobile-maps').append(byId('preMaps'));
        byId('preMaps').before(byId('voidMapsBtn'));
        const hint=document.createElement('p');hint.id='mobile-map-access';hint.textContent='Maps unlock as you progress in the original game.';byId('mobile-maps').append(hint);
        MobileMapMenu.setup();
        const mapsText=byId('mapsBtnText');mapsText.onclick=()=>TrimpsUI.select('maps');
        const settings=mapsText.nextElementSibling;settings.classList.add('mobile-map-settings');settings.setAttribute('role','button');settings.tabIndex=0;settings.setAttribute('aria-label','Map settings');
        // Give both sides the same header/life/bar/stats rows while preserving every original live node.
        const good=byId('goodGuyCol'),bad=byId('badGuyCol');
        const goodHeading=document.createElement('div');goodHeading.className='mobile-combat-heading';goodHeading.append(byId('goodGuyName'),document.querySelector('.mobile-battle-values-info'));good.firstElementChild.replaceWith(goodHeading);
        const badHeading=document.createElement('div');badHeading.className='mobile-combat-heading';badHeading.append(byId('badGuyName').parentElement,byId('lootBdContainer'));bad.firstElementChild.replaceWith(badHeading);
        byId('lootBdBtn').setAttribute('role','button');byId('lootBdBtn').tabIndex=0;
        const observer=new MutationObserver(refreshEnemy);observer.observe(byId('badGuyName'),{childList:true,subtree:true,characterData:true});
    }
    function refreshEnemy(){
        // Original resetGame replaces this heading on load/import; regroup its live count afterward.
        const count=byId('trimpsFighting');
        if(!count.parentElement.classList.contains('mobile-army-count')){
            const before=count.previousSibling,after=count.nextSibling,badge=document.createElement('span');badge.className='mobile-army-count';count.before(badge);if(before?.nodeType===3)badge.append(before);badge.append(count);if(after?.nodeType===3)badge.append(after);
        }
        const state=game.global, cells=state.mapsActive?state.mapGridArray:state.gridArray;
        const branded=value=>typeof MobileBranding==='undefined'?value:MobileBranding.text(value);
        const label=branded(byId('badGuyName').textContent.trim());
        const displayName=key=>branded(game.badGuys[key]?.displayName||key.replaceAll('_',' '));
        const names=Object.keys(MobileEnemyArt.entries);
        const labelName=names.find(key=>label===displayName(key))||names.sort((a,b)=>b.length-a.length).find(key=>label.endsWith(' '+displayName(key)));
        const cellName=cells[(state.mapsActive?state.lastClearedMapCell:state.lastClearedCell)+1]?.name;
        const name=cellName||labelName||'';
        const pending=Boolean(!state.fighting&&cellName&&labelName!==cellName&&label!==displayName(cellName)&&!label.endsWith(' '+displayName(cellName)));
        byId('badGuyCol').classList.toggle('mobile-enemy-pending',pending);byId('badGuyCol').dataset.enemyName=displayName(name);
        const key=name+'|'+state.mapsActive;if(key===lastEnemy)return;lastEnemy=key;
        const node=byId('mobile-enemy-art'), entry=MobileEnemyArt.get(name);
        const inset=entry&&!entry.standalone&&['snake','squid'].includes(entry.family);
        node.replaceChildren();
        node.style.backgroundImage=entry&&!inset?'url("'+entry.src+'")':'none';
        // Include the head above its atlas cell, without exposing neighbouring sprites.
        if(inset){const x=(entry.cell%3)*418,y=Math.floor(entry.cell/3)*418-30;node.innerHTML='<svg viewBox="'+x+' '+y+' 418 448" preserveAspectRatio="xMidYMax meet"><defs><clipPath id="mobile-enemy-clip"><rect x="'+x+'" y="'+y+'" width="418" height="448"/></clipPath></defs><image href="'+entry.src+'" width="1254" height="1254" clip-path="url(#mobile-enemy-clip)"/></svg>';}
        node.style.backgroundSize=entry?.standalone||entry?.family==='elephant'?'contain':'300% 300%';
        node.style.backgroundPosition=entry?.standalone||entry?.family==='elephant'?'center':entry?((entry.cell%3)*50)+'% '+(Math.floor(entry.cell/3)*50)+'%':'center';
        node.dataset.family=entry?.family||'unknown';node.toggleAttribute('data-mirror',!!entry?.mirror);node.dataset.detail=entry?String(entry.detail):'0';
        node.classList.toggle('mobile-art-unknown',!entry);
        // V-212: the next enemies' images load and decode during this fight.
        if(typeof MobilePreload!=='undefined'){const index=(state.mapsActive?state.lastClearedMapCell:state.lastClearedCell)+1;for(const cell of cells.slice(index+1,index+4))MobilePreload.keep(MobileEnemyArt.get(cell?.name)?.src);}
    }
    function decorateAchievements(){
        byId('achievementsHere').querySelectorAll('.achievementContainer').forEach(node=>{
            if(node.dataset.mobileAchieve)return;
            const match=/startTrackAchieve\('([^']+)',\s*(\d+)\)/.exec(node.getAttribute('onclick')||'');if(!match)return;
            const [key,index]=[match[1],Number(match[2])], achieve=game.achievements[key];if(!achieve)return;
            node.dataset.mobileAchieve='true';node.setAttribute('role','button');node.tabIndex=0;
            const label=document.createElement('strong');label.className='mobile-achieve-name';label.textContent=achieve.names[index];
            const status=document.createElement('span');status.className='mobile-achieve-status';status.textContent='Level '+achieve.tiers[index]+' · '+(node.classList.contains('achieveColorGreen')?'Completed':node.classList.contains('achieveColorYellow')?'Available now':node.classList.contains('achieveColorRed')?'Unavailable this run':'Not completed');
            const showDetail=()=>displayAchievementPopup(key,true,index);
            const detail=button('Info',showDetail,'mobile-achieve-info');detail.setAttribute('aria-label','Info '+label.textContent);
            // Keep the original tracker click; its description stays visible while browsing the list.
            node.addEventListener('click',showDetail);
            const original=document.createElement('span');original.className='mobile-achieve-markers';original.append(...node.childNodes);
            node.replaceChildren(label,status,detail,original);detail.addEventListener('click',event=>event.stopPropagation());
            node.onmouseover=null;node.onmouseout=null;
        });
    }
    function specialistViews(){
 byId('natureContainer').querySelectorAll('.infoSpanNature').forEach(n=>{if(!n.querySelector('.mobile-nature-info-title')){const label=document.createElement('span');label.className='mobile-nature-info-title';label.textContent='Info · ';n.prepend(label);}});
 const tree=byId('mutTree');if(tree&&typeof MobileLateSystems==='undefined'&&!byId('mobile-mut-scroll')){const scroll=document.createElement('div');scroll.id='mobile-mut-scroll';const canvas=document.createElement('div');canvas.id='mobile-mut-canvas';tree.before(scroll);scroll.append(canvas);canvas.append(tree);const hint=document.createElement('p');hint.id='mobile-mut-hint';hint.textContent='Swipe to move the tree. Zoom with + / −.';scroll.before(hint);requestAnimationFrame(()=>{scroll.scrollLeft=225;scroll.scrollTop=100;});}
 for(const [id,label] of [['mutZoomIn','+'],['mutZoomOut','−'],['abHelpBtn','Info'],['abCloseBtn','Close']]){const n=byId(id);if(n&&n.textContent!==label){n.textContent=label;n.setAttribute('role','button');n.tabIndex=0;n.setAttribute('aria-label',label);}}
 }
 function mode(name){
        const returning=name==='battle'&&page!=='battle';page=name;document.body.dataset.mobilePage=name;refresh();
        if(returning)requestAnimationFrame(restoreLog);
    }
    function refresh(){
        const blockName=byId('goodGuyBlockName'),isBlock=blockName.textContent.trim()==='BLK';
        blockName.classList.toggle('mobile-stat-block',isBlock);
        if(isBlock){blockName.setAttribute('role','img');blockName.setAttribute('aria-label','Block');}
        else {blockName.removeAttribute('role');blockName.removeAttribute('aria-label');}
        refreshEnemy();specialistViews();refreshMore();refreshQueue();refreshLog();if(typeof MobileMore!=='undefined')MobileMore.refresh();
        byId('roboTrimpBtn').hidden=getComputedStyle(byId('chainHolder')).visibility==='hidden';
        byId('pastUpgradesBtn').hidden=game.global.totalPortals<1;
        MobileMapMenu.refresh();
        if(typeof MobileCompact!=='undefined')MobileCompact.refreshMaps();
        if(typeof MobileCombatControls!=='undefined')MobileCombatControls.refresh();
        if(typeof MobileQolNavigator!=='undefined')MobileQolNavigator.refresh();
        if(typeof MobileEarlyColony!=='undefined')MobileEarlyColony.refresh();
        byId('mobile-maps').dataset.chamber=String(game.global.preMapsActive);
        byId('mobile-maps').dataset.mapActive=String(game.global.mapsActive);
        document.querySelectorAll('[data-unlock-source]').forEach(node=>{
            const source=byId(node.dataset.unlockSource);node.hidden=source.style.display==='none'||source.style.visibility==='hidden';
        });
        // The engine updates original achievements when opened/filtered. The observer decorates only new nodes.
    }
    setupMore();setupCombat();setupQueue();setupLog();setupButtonFeedback();
    byId('achievementMainButtons').after(byId('achievementHover'));
    const originalAchievementWindow=toggleAchievementWindow;
    toggleAchievementWindow=()=>{
        originalAchievementWindow();
        if(!trimpAchievementsOpen)closeAchievementPopup(true);
        else {
            const title=document.querySelector('.achievementMainTitle');
            const parent=byId(document.documentElement.dataset.graphics==='diorama'?'achievementMainButtons':'achievementHeader');
            if(title.parentElement!==parent)parent.prepend(title);
        }
    };
    byId('portalTimer').addEventListener('click',refreshMore);
    const turkimpInfo=button('Info',()=>TrimpsUI.infoAction(()=>tooltip('Well Fed',null,'update')),'mobile-info');turkimpInfo.setAttribute('aria-label','Info Turkimp');byId('turkimpBuff').append(turkimpInfo);
    byId('natureContainer').querySelectorAll('.natureBuyIcon').forEach(node=>{
        const match=/naturePurchase\('([^']+)',\s*'([^']+)'(?:,\s*'([^']+)')?\)/.exec(node.getAttribute('onclick'));if(!match)return;
        const [,doing,spending,to]=match;
        const label=document.createElement('strong');label.className='mobile-nature-label';label.textContent=doing==='convert'?spending+' → '+to:doing==='stackTransfer'?'Retain stacks':doing==='uberEmpower'?'Enlightenment':'Upgrade';node.prepend(label);
        node.setAttribute('role','button');node.tabIndex=0;node.setAttribute('aria-label',label.textContent+' '+spending);
        const info=button('Info',event=>{event.stopPropagation();TrimpsUI.infoAction(()=>natureTooltip('update',doing,spending,to));},'mobile-info');node.append(info);node.onmouseover=null;node.onmouseout=null;
    });
    byId('natureContainer').querySelectorAll('.infoSpanNature').forEach(node=>{const type=node.id.replace('infoSpan','');node.onclick=()=>TrimpsUI.infoAction(()=>natureTooltip('update','description',type));node.setAttribute('role','button');node.tabIndex=0;});
    byId('tab5Text2').textContent='';byId('tab5Text2').setAttribute('aria-label','Custom amount');byId('tab5Text2').title='Custom amount';
    const achievementsObserver=new MutationObserver(decorateAchievements);achievementsObserver.observe(byId('achievementsHere'),{childList:true,subtree:true});
    mode('colony');
    return {mode,refresh,back:()=>false};
})();
