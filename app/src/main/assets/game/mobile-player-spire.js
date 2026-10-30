// A: tower plan and toolbar. The original engine owns every action and cell identity.
var MobilePlayerSpire = (() => {
    const $ = id => document.getElementById(id);
    let view = 'tower', root, scroll, panes, signature = '', queued = false, owner, storyOpen=false;
    const node = (tag, cls, text) => { const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; };
    function button(text, action, cls='') { const n=node('button',cls,text);n.type='button';n.onclick=()=>{action();refresh();};return n; }
    const info = action => TrimpsUI.infoAction(action, false);
    const occupants = new Map();
    function enhanceEnemy(index) {
        const cell=$('playerSpireCell'+index), enemy=playerSpire.layout[index]?.occupiedBy;
        if(!cell)return;
        const badge=cell.querySelector('.playerSpireEnemy'), occupied=!!(enemy?.name||enemy?.dead);
        cell.dataset.occupied=String(occupied);
        const changed=occupants.get(index)!==enemy;occupants.set(index,enemy);
        if(!badge||!occupied||badge.querySelector('.ms-enemy-health'))return;
        badge.classList.add('ms-enemy-marker');
        if(changed)badge.classList.add('ms-enemy-arrival');
        const pct=enemy.dead?0:Math.max(0,Math.min(100,enemy.health/enemy.maxHealth*100));
        badge.style.setProperty('--enemy-health',pct+'%');
        const icon=badge.querySelector('.spireUniqueIcon');
        if(icon){icon.className='ms-enemy-suit';icon.textContent={spades:'♠',diamonds:'♦',clubs:'♣',heart:'♥'}[enemy.name]||'●';}
        if(enemy.dead){badge.querySelector('.playerSpireEnemyText').textContent='×';badge.classList.add('ms-enemy-dead');}
        const health=node('span','ms-enemy-health');health.setAttribute('aria-hidden','true');badge.append(health);
        badge.setAttribute('aria-label',enemy.dead?'Defeated enemy':enemy.name+' · '+(playerSpire.settings.percentHealth?prettify(pct)+'%':prettify(enemy.health))+' health'+(enemy.slowedFor?' · slowed':'')+(enemy.shockTurns>=0?' · shocked':'')+(enemy.toxicity?' · poison '+prettify(enemy.toxicity):''));
    }
    function show(next) { if(playerSpire.popupOpen)mount();view=next; refresh(); if(scroll)scroll.scrollTop=0; }
    function back() { if(!playerSpire.popupOpen)return false;if(view!=='tower')show('tower');else playerSpire.closePopup();return true; }
    function preset(slot, action) {
        playerSpire.presetTooltip(slot);
        // Reuse the engine's availability checks, confirmations and note field verbatim.
        if(action) [...document.querySelectorAll('#tipText .spirePresetBtns span')].find(n=>n.textContent.startsWith(action))?.click();
    }
    function mount() {
        root=$('playerSpirePopout'); if(!root||!playerSpire.popupOpen)return false;
        if($('mobile-spire'))return true;
        owner=game; view='tower';signature='';root.classList.add('mobile-spire-host');
        const shell=node('section','mobile-spire');shell.id='mobile-spire';
        const header=node('header','ms-header');const backBtn=button('‹',back);backBtn.setAttribute('aria-label','Back');
        const title=node('h1','','Player Spire');title.id='ms-title';const close=button('×',()=>playerSpire.closePopup());close.setAttribute('aria-label','Close Player Spire');header.append(backBtn,title,close);
        const wallet=button('',()=>info(()=>playerSpire.infoTooltip('Runestones','update')),'ms-wallet');wallet.id='ms-wallet';
        scroll=node('div','ms-scroll');panes={};for(const name of ['tower','upgrades','controls']){const p=node('section','ms-pane');p.dataset.view=name;panes[name]=p;scroll.append(p);}
        const status=node('div','ms-status');status.id='ms-status';
        for(const name of ['Threat','Spirestones','Enemies']){const b=button('',()=>info(()=>playerSpire.infoTooltip(name,'update')));b.dataset.stat=name;status.append(b);}
        const boardTitle=node('h2','','Spire plan');boardTitle.id='ms-floor-count';
        const board=$('playerSpireSpirePanel');board.classList.add('ms-board');
        const growth=node('p','ms-growth');growth.id='ms-growth';
        const tools=node('div','ms-tools');tools.id='ms-tools';
        const selection=node('div','ms-selection');selection.id='ms-selection';
        panes.tower.append(status,boardTitle,board,growth,node('h2','','Build · select, then tap a cell'),tools,selection);
        const footer=node('nav','ms-nav');footer.setAttribute('aria-label','Player Spire views');
        for(const [key,label] of [['tower','Tower'],['upgrades','Upgrades'],['controls','Layouts']]){const b=button(label,()=>show(key));b.dataset.view=key;footer.append(b);}
        shell.append(header,wallet,scroll,footer);root.append(shell);enhanceCells();return true;
    }
    function enhanceCells() {
        if(!playerSpire.popupOpen)return;
        document.querySelectorAll('#playerSpireSpireSpirePanel > .playerSpireCell').forEach(cell=>{
            const index=Number(cell.id.replace('playerSpireCell','')),trap=playerSpire.layout[index]?.trap.name||'';
            cell.onmousedown=null;cell.onmouseover=null;cell.setAttribute('role','button');cell.tabIndex=0;
            cell.setAttribute('aria-label','Floor '+(Math.floor(index/5)+1)+', column '+(index%5+1)+': '+(trap||'Empty'));
            cell.dataset.trap=trap;cell.dataset.floor=String(Math.floor(index/5)+1);cell.dataset.first=String(index%5===0);
            cell.onclick=()=>{if(!playerSpire.sealed){playerSpire.buildTrap(index);refresh();}};
            enhanceEnemy(index);
        });
        const story=$('playerSpireTutorial');if(story){story.setAttribute('aria-label','Story and quest');story.classList.add('ms-story');if(!story.parentElement.classList.contains('ms-story-details')){const details=node('details','ms-story-details');details.open=storyOpen;details.ontoggle=()=>{storyOpen=details.open;};details.append(node('summary','','Story & quest'));story.before(details);details.append(story);}}
    }
    function renderTools() {
        const tools=$('ms-tools');tools.replaceChildren();
        if(playerSpire.sealed)return;
        for(const [name,trap] of Object.entries(playerSpireTraps)){
            if(trap.locked)continue;
            const b=button('',()=>playerSpire.selectTrap(name));b.dataset.trap=name;b.setAttribute('aria-pressed',String(playerSpire.selectedTrap===name));
            b.append(node('span','ms-trap-symbol icomoon icon-'+trap.icon),node('strong','',name),node('small','',trap.isTower&&trap.owned>=10?'Max placed':prettify(playerSpire.getTrapCost(name))+' Rs'));
            tools.append(b);
        }
        const selected=playerSpire.selectedTrap,selection=$('ms-selection');selection.replaceChildren();
        selection.append(node('span','',selected?(playerSpireTraps[selected]?selected+' selected · '+prettify(playerSpire.getTrapCost(selected))+' Rs next':({sell:'Sell a trap or tower',shiftUp:'Shift up',shiftDown:'Shift down'}[selected]||selected)):'Choose a tool, then tap a cell.'));
        if(selected)selection.append(button('Info',()=>info(()=>playerSpire.trapTooltip(selected,'update'))));
    }
    function renderUpgrades() {
        const pane=panes.upgrades;pane.replaceChildren();
        if(playerSpire.sealed){pane.append(node('p','','The Spire is sealed.'));return;}
        for(const [name,trap] of Object.entries(playerSpireTraps)){
            if(trap.locked)continue;
            const row=node('article','ms-upgrade');row.dataset.trap=name;
            row.append(node('h2','',name+' '+(trap.isTower?'Tower':'Trap')+' '+romanNumeral(trap.level)),node('p','',trap.owned+' placed · next costs '+prettify(playerSpire.getTrapCost(name))+' Rs'));
            const up=trap.upgrades?.[trap.level-1];
            if(playerSpire.tutorialStep>=4&&up){
                row.append(node('h3','','Next: '+name+' '+romanNumeral(trap.level+1)+' · '+prettify(up.cost)+' Rs'));
                const effect=node('p');effect.innerHTML=up.description;row.append(effect);
                if(up.unlockAt>game.global.highestLevelCleared+1)row.append(node('p','','Reach Z'+up.unlockAt));
                const actions=node('div','ms-actions');const buy=button('Upgrade',()=>playerSpire.buyUpgrade(name),'ms-primary');buy.disabled=playerSpire.runestones<up.cost||game.global.highestLevelCleared+1<up.unlockAt;
                actions.append(button('Upgrade info',()=>info(()=>playerSpire.upgradeTooltip(name,'update'))),buy);row.append(actions);
            }else row.append(node('p','',up?'Continue the Spire quest to unlock upgrades.':'All upgrades installed.'),button('Trap info',()=>info(()=>playerSpire.trapTooltip(name,'update'))));
            pane.append(row);
        }
    }
    function renderControls() {
        const pane=panes.controls;pane.replaceChildren();
        if(playerSpire.sealed){pane.append(node('p','','The Spire is sealed. Bonuses from 11 of each Tower remain active. Unsealing removes the 11th towers.'),button('Unseal Spire',()=>playerSpire.unseal()));return;}
        for(const slot of [1,2]){
            const layout=playerSpire['savedLayout'+slot],counts={};for(const name of layout)if(name)counts[name]=(counts[name]||0)+1;
            const row=node('article','ms-layout');row.append(node('h2','','Layout '+slot),node('p','',Object.entries(counts).map(([n,c])=>c+' '+n).join(' · ')||'Empty'),node('p','','Total cost: '+prettify(playerSpire.getSavedLayoutPrice(slot))+' Rs'));
            const note=node('p');note.innerHTML=playerSpire['layout'+slot+'Note'];row.append(note);
            const actions=node('div','ms-actions');actions.append(button('Save current',()=>preset(slot,'Save')));
            if(Object.keys(counts).length)actions.append(button('Load',()=>preset(slot,'Load'),'ms-primary'));
            row.append(actions,button('Details & note',()=>preset(slot)));pane.append(row);
        }
        pane.append(node('h2','','Spire controls'),button(playerSpire.paused?'Resume Spire':'Pause Spire',()=>playerSpire.togglePause()));
        const modes=node('div','ms-actions');for(const [key,label] of [['sell','Sell'],['shiftUp','Shift up'],['shiftDown','Shift down']])modes.append(button(label,()=>{playerSpire.selectTrap(key);show('tower');}));pane.append(modes);
        pane.append(button('Sell all traps & towers',()=>{
            // The original control contains the original refund and pause warning/confirmation.
            const original=[...$('spireTrapsWindow').querySelectorAll('[onclick]')].find(n=>n.textContent==='Sell All');
            if(original)original.click();else{playerSpire.enlarge();[...$('spireTrapsWindow').querySelectorAll('[onclick]')].find(n=>n.textContent==='Sell All')?.click();}
        },'ms-danger'));
        const options=node('div','ms-actions');options.append(button('Settings',()=>playerSpire.settingsTooltip()),button(playerSpire.smallMode?'Enlarge view':'Compact view',()=>playerSpire.smallMode?playerSpire.enlarge():playerSpire.shrink()));pane.append(options);
        pane.append(button('Story & quest',()=>{show('tower');const details=root.querySelector('.ms-story-details');if(details){details.open=true;details.scrollIntoView({block:'start'});}}));
        if(playerSpire.canSeal()&&playerSpire.tutorialStep>=4){const text=node('p');text.textContent='Seal the Spire to gain bonuses from 11 of each Tower. Enemies stop spawning. You can unseal through Settings.';pane.append(text,button('Seal Spire',()=>playerSpire.seal()));}
    }
    function refresh() {
        if(!playerSpire.popupOpen)return;
        if(owner&&owner!==game){playerSpire.closePopup();owner=null;return;}
        if(!mount())return;
        const banner=document.querySelector('.mobile-development-banner');root.style.setProperty('--ms-top',(banner?banner.getBoundingClientRect().height:0)+'px');
        root.classList.toggle('ms-compact',!!playerSpire.smallMode);
        $('ms-title').textContent={tower:'Player Spire',upgrades:'Traps & Upgrades',controls:'Layouts & Controls'}[view];
        for(const [name,pane] of Object.entries(panes))pane.hidden=name!==view;
        root.querySelectorAll('.ms-nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.view===view?'page':'false'));
        $('ms-wallet').textContent='Runestones  '+prettify(playerSpire.runestones)+'  ·  +'+prettify(playerSpire.getRsPs())+'/s';
        const stats={Threat:playerSpire.getDifficultyHtml().replace(/^(Threat|T): /,''),Spirestones:playerSpire.getSpirestoneHtml().replace(/^(Spirestones|Ss): /,'').replace(/<[^>]*>/g,''),Enemies:playerSpire.currentEnemies+' / '+playerSpire.maxEnemies};
        for(const b of $('ms-status').children){const name=b.dataset.stat;b.replaceChildren(node('small','',name),node('strong','',stats[name]));}
        $('ms-floor-count').textContent='Spire plan · '+playerSpire.rowsAllowed+' floors';
        $('ms-growth').textContent=playerSpire.sealed?'Spire sealed':playerSpire.tutorialStep<4?'Follow the Story & quest to grow your Spire.':playerSpire.getNextRowCost()===-1?'Maximum floors reached.':'Next floor · Threat '+stats.Threat+' · Spirestones '+stats.Spirestones;
        const next=JSON.stringify([playerSpire.selectedTrap,playerSpire.smallMode,playerSpire.sealed,playerSpire.paused,playerSpire.tutorialStep,game.global.highestLevelCleared,playerSpire.savedLayout1,playerSpire.savedLayout2,playerSpire.layout1Note,playerSpire.layout2Note,Object.entries(playerSpireTraps).map(([n,t])=>[n,t.locked,t.level,t.owned,playerSpire.runestones>=playerSpire.getTrapCost(n),t.upgrades?.[t.level-1]?.cost<=playerSpire.runestones])]);
        if(next!==signature){signature=next;renderTools();renderUpgrades();renderControls();}
        enhanceCells();
    }
    function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh();});}
    const closeOriginal=playerSpire.closePopup;playerSpire.closePopup=function(...args){owner=null;return closeOriginal.apply(this,args);};
    const drawEnemy=playerSpire.drawEnemy;playerSpire.drawEnemy=function(index){const result=drawEnemy.call(this,index);enhanceEnemy(index);return result;};
    for(const name of ['openPopup','drawInfo','drawSpire','drawSpireCell','drawSmallInfo','redrawUpgrades','seal','unseal','saveLayout']){
        const original=playerSpire[name];playerSpire[name]=function(...args){const result=original.apply(this,args);schedule();return result;};
    }
    return {refresh,back,show};
})();
