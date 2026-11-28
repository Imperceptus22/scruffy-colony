// Present the live engine Time Warp in the Diorama. The Classic adapter and game own the calculations and controls.
var MobileTimeCompass = (() => {
    const warp = offlineProgress;
    const wrapper = warp.wrapperElem;
    const byId = id => document.getElementById(id);
    const de = MobileI18n.lang === 'de';
    const label = (english, german) => de ? german : english;
    const isDiorama = () => MobileGraphicStyle.get() === 'diorama';
    const number = new Intl.NumberFormat(de ? 'de' : 'en', {maximumFractionDigits:1});
    const paths = {
        sand:'M7 3h10M7 21h10M8 4c0 4 1 5 4 8-3 3-4 4-4 8m8-16c0 4-1 5-4 8 3 3 4 4 4 8m-7-2h6',
        map:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15', tools:'M3 7h5m4 0h9M3 17h11m4 0h3M8 4v6m8 4v6',
        info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-10v6m0-10v.3', note:'M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zm3 0v16m3-11h5m-5 4h5',
        world:'M2 18l6-11 4 6 3-5 7 10zM6 11l2 1 2-1', way:'M3 6h14m-3-4 4 4-4 4M5 14v5h14',
        speed:'M3 16a9 9 0 0 1 18 0m-9 0 4-7', close:'M5 5l14 14M19 5 5 19', next:'M9 5l7 7-7 7', warn:'M12 3 2 21h20zM12 8v6m0 3v.2'
    };
    const icon = (key,size=18) => `<svg data-symbol="${key}" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[key]}"/></svg>`;
    const ticks = Array.from({length:48},(_,i) => `<path class="tick" d="M105 12v${i%4 ? 3 : 6}" transform="rotate(${i*7.5} 105 105)"/>`).join('');
    const toolsLabel = label('Controls','Steuerung');
    const mapsLabel = label('Open maps','Maps öffnen');
    const helpLabel = MobileI18nGame.t('What is This?!');
    const compass = document.createElement('section');
    compass.id = 'timeCompass';
    compass.innerHTML = `
        <header class="head"><h2>${label('Making up lost time','Offline-Zeit nachholen')}</h2><button type="button" class="mini" data-act="help" aria-haspopup="dialog" aria-label="${helpLabel}">${icon('info',21)}</button></header>
        <div class="compass-content"><div class="dial-scene"><div class="dial-plate"><div class="dial" role="progressbar" aria-label="${label('Progress','Fortschritt')}" aria-valuemin="0" aria-valuemax="100">
        <svg class="dial-lines" viewBox="0 0 210 210" aria-hidden="true"><circle cx="105" cy="105" r="93" class="edge"/><circle cx="105" cy="105" r="84" class="track"/><circle cx="105" cy="105" r="84" class="hand" pathLength="100" transform="rotate(-90 105 105)"/>${ticks}</svg>
        <div class="dial-middle"><b><span data-value="percent"></span> <em>%</em></b><small>${label('Estimated completion in','Voraussichtlich fertig in')}</small><strong data-value="eta"></strong></div></div>
        <div class="dial-base" data-value="ticks"></div></div></div>
        <div class="paper c-sheet"><div class="offline-band">${icon('sand')}<span data-value="offline"></span></div>
        <div class="places">${icon('world',21)}<span>Zone <b data-value="zone"></b></span><i></i><span>${label('Cell','Feld')} <b data-value="cell"></b></span></div>
        <div class="message">${icon('note',19)}<p data-value="message"></p></div>
        <button type="button" class="context-button dispatch" data-act="context" aria-haspopup="dialog" aria-controls="compassOverlay">
        <span class="context-label" data-value="context"></span><b data-value="map-title"></b><small data-value="map-detail"></small>${icon('next',14)}</button></div></div>
        <footer><div class="indicator">${icon('speed',17)}${icon('warn',17)}<span data-value="status"></span></div><div class="twins">
        <button type="button" class="metal" data-act="maps">${icon('map')}${icon('way')}<span data-value="map-action"></span></button>
        <button type="button" class="amber" data-act="tools" aria-haspopup="dialog" aria-controls="compassOverlay">${icon('tools')}${toolsLabel}</button></div>
        <button type="button" class="end" data-act="end">${MobileI18nGame.t('Stop Here')}</button></footer>`;
    const dialog = document.createElement('dialog');
    dialog.id = 'compassOverlay';
    dialog.className = 'scrim';
    dialog.setAttribute('aria-labelledby','compassTrayTitle');
    dialog.innerHTML = `<section class="tray paper"><header class="tray-top"><h3 id="compassTrayTitle"></h3><button type="button" class="mini" data-act="dismiss" aria-label="${label('Close','Schließen')}">${icon('close')}</button></header>
        <div class="tray-body"><div data-panel="tools">
        <section class="tool-section"><h4 data-value="limiter-title"></h4><div data-slot="limiter"></div></section>
        <section class="tool-section" data-section="combat"><h4>${label('Combat','Kampf')}</h4><div data-slot="fight"></div><h5 data-value="formations-label">${label('Formations','Formationen')}</h5><div data-slot="formations"></div></section>
        <section class="tool-section" data-slot="equality"></section><section class="tool-section"><h4>${label('Calculation','Berechnung')}</h4><p data-value="calculation"></p><p class="notice">${icon('warn')}<span data-value="warning"></span></p></section>
        </div><div data-panel="maps"><div class="map-open" hidden><img alt=""><div><b data-value="active-name"></b><small data-value="active-detail"></small></div></div>
        <p data-value="map-level-note" hidden></p><p data-value="map-feedback" role="status" tabindex="-1" hidden></p></div></div></section>`;
    wrapper.append(compass,dialog);
    const values = Object.fromEntries([...wrapper.querySelectorAll('#timeCompass [data-value], #compassOverlay [data-value]')].map(el => [el.dataset.value,el]));
    const text = (key,value) => { const str = String(value); if (values[key].textContent !== str) values[key].textContent = str; };
    const dial = compass.querySelector('.dial');
    const hand = compass.querySelector('.hand');
    const indicator = compass.querySelector('.indicator');
    const mapAction = compass.querySelector('[data-act="maps"]');
    const toolsPanel = dialog.querySelector('[data-panel="tools"]');
    const mapsPanel = dialog.querySelector('[data-panel="maps"]');
    const activeMap = mapsPanel.querySelector('.map-open');
    const biomeArt = activeMap.querySelector('img');
    const focusRoles = new Map();
    const title = byId('compassTrayTitle');
    const sources = [
        [warp.timeOfflineElem, 'limiter'], [warp.fightBtn, 'fight'], [warp.formationsElem, 'formations'],
        [warp.equalityBtn, 'equality'], [byId('offlineSettingContainer'), 'equality'],
        [warp.mapBtnsElem, 'maps'], [warp.zoneBtnsElem, 'maps']
    ].map(([el,slot]) => {
        const marker = document.createComment(el.id);
        el.before(marker);
        return {el, marker, target: slot === 'maps' ? mapsPanel : dialog.querySelector('[data-slot="'+slot+'"]')};
    });
    let opener = null, panel = '', helpOpen = false;
    const inMap = () => game.global.mapsActive || game.global.preMapsActive;
    function redrawMapActions() {
        warp.updateMapBtns();
        MobileI18nDeAway.render(warp.mapBtnsElem);
        refreshMap();
    }
    function refreshMap() {
        const active = inMap();
        const map = game.global.mapsActive && getCurrentMapObject();
        const count = warp.mapsAllowed;
        const belowMapLevel = count > 0 && !active && game.global.world < 6;
        text('context', active ? label('Active map','Aktive Map') : 'Maps');
        if (map) {
            text('map-title',map.name);
            const items = warp.countMapItems(map.level);
            text('map-detail',label('Level ','Stufe ') + map.level + ' · ' + label('Cell ','Feld ') + (game.global.lastClearedMapCell+2) + ' · ' + (de ? 'Noch '+items+' Gegenstände' : items+' items remain'));
        } else if (active) {
            text('map-title',label('Map chamber','Map-Kammer')); text('map-detail',MobileI18nGame.t('Sitting in the Map Chamber (lame)'));
        } else if (belowMapLevel) {
            text('map-title',MobileI18nGame.t('No maps available'));
            text('map-detail',label('Map levels start at zone 6.','Map-Stufen beginnen in Zone 6.'));
        } else {
            text('map-title',count > 0 ? count + (de ? (count===1 ? ' Map verfügbar' : ' Maps verfügbar') : (count===1 ? ' map available' : ' maps available')) : MobileI18nGame.t('No maps available'));
            const fragments = warp.mapTextElem.lastChild?.textContent || '';
            text('map-detail',count > 0 && /frag/i.test(fragments) ? fragments : MobileI18nGame.t('Gain 1 map for each 8 hours away'));
        }
        text('map-action',active ? MobileI18nGame.t('Back to World') : mapsLabel);
        for (const svg of mapAction.querySelectorAll('svg')) svg.toggleAttribute('hidden',svg.dataset.symbol !== (active ? 'way' : 'map'));
        if (panel === 'maps') {
            title.textContent = values.context.textContent;
            activeMap.hidden = !map;
            values['map-level-note'].hidden = !belowMapLevel;
            warp.mapTextElem.hidden = belowMapLevel;
            if (belowMapLevel) text('map-level-note',values['map-detail'].textContent);
            if (map) {
                text('active-name',map.name);
                text('active-detail',values['map-detail'].textContent);
                const src = DioramaAssets.biomes[map.location] || DioramaAssets.biomes.Random;
                if (biomeArt.getAttribute('src') !== src) biomeArt.src = src;
            }
        }
    }

    function refreshTools() {
        const fight = warp.fightBtn.style.display !== 'none';
        const forms = warp.formationsElem.style.display !== 'none';
        toolsPanel.querySelector('[data-section="combat"]').hidden = !fight && !forms;
        values['formations-label'].hidden = !forms;
        toolsPanel.querySelector('[data-slot="equality"]').hidden = warp.equalityBtn.style.display === 'none' && !byId('offlineSettingContainer').hasChildNodes();
        text('limiter-title',warp.showingEquality ? 'Equality' : MobileI18nGame.t('Speed Limiter'));
        // The same engine node alternates between the range slider and the complete U2 Equality editor.
        const greeting = warp.timeOfflineElem.firstChild;
        if (greeting?.nodeType === Node.TEXT_NODE) {
            const hidden = document.createElement('span');
            hidden.className = 'compass-greeting';
            hidden.hidden = true;
            greeting.before(hidden);
            hidden.append(greeting);
        }
        makeFocusable(toolsPanel);
    }
    function makeFocusable(root) {
        for (const el of root.querySelectorAll('[onclick]:not(button):not(input):not(select):not([tabindex])')) {
            focusRoles.set(el,el.getAttribute('role'));
            el.tabIndex = 0;
            el.setAttribute('role','button');
        }
    }
    function restoreFocusRoles() {
        for (const [el,role] of focusRoles) {
            el.removeAttribute('tabindex');
            if (role === null) el.removeAttribute('role');
            else el.setAttribute('role',role);
        }
        focusRoles.clear();
    }
    function refresh() {
        if (!isDiorama() || !usingRealTimeOffline) return;
        const percent = Number.parseFloat(warp.progressElem.style.width) || 0;
        const eta = warp.extraInfoElem.textContent.match(/\d+:\d\d:\d\d$/)?.[0] || '–';
        text('percent',number.format(percent)); text('eta',eta);
        dial.setAttribute('aria-valuenow',String(percent));
        dial.setAttribute('aria-valuetext',number.format(percent) + ' %, ' + values.eta.previousElementSibling.textContent + ' ' + eta);
        hand.setAttribute('stroke-dasharray',percent + ' 100');
        text('ticks',warp.progressTextElem.textContent.replace(/\s*\([^()]+\)\s*$/,''));
        const duration = warp.formatTime(Math.floor(warp.totalOfflineTime/1000));
        text('offline',(de ? MobileI18nDeAway.duration(duration) : duration) + ' offline');
        text('zone',game.global.world); text('cell',game.global.lastClearedCell+2);
        const details = byId('offlineRunDetails'), breakNode = details.querySelector('br');
        const range = document.createRange();
        range.selectNodeContents(details);
        if (breakNode) range.setEndBefore(breakNode);
        const calculation = range.toString();
        text('calculation',calculation);
        if (breakNode) { range.selectNodeContents(details); range.setStartAfter(breakNode); }
        text('message',range.toString());
        const warning = warp.effectiveElem.textContent;
        text('warning',warning);
        values.warning.parentNode.hidden = !warning;
        text('status',warning || calculation.match(/,\s*([^,()]+)\)$/)?.[1] || MobileI18nGame.t('Starting...'));
        indicator.classList.toggle('is-warn',Boolean(warning));
        for (const svg of indicator.querySelectorAll('svg')) svg.toggleAttribute('hidden',svg.dataset.symbol !== (warning ? 'warn' : 'speed'));
        refreshMap();
        if (panel === 'tools') refreshTools();
    }

    function openPanel(next,trigger) {
        if (dialog.open) return;
        opener = trigger;
        panel = next;
        values['map-feedback'].hidden = true;
        toolsPanel.hidden = next !== 'tools';
        mapsPanel.hidden = next !== 'maps';
        // Reparent live engine nodes only while a panel is open. IDs, listeners and state stay intact.
        for (const {el,target} of sources) if ((target === mapsPanel) === (next === 'maps')) target.append(el);
        title.textContent = next === 'tools' ? toolsLabel : values.context.textContent;
        if (next === 'tools') refreshTools();
        else { refreshMap(); makeFocusable(mapsPanel); }
        dialog.showModal();
        dialog.querySelector('.tray-body').scrollTop = 0;
        dialog.querySelector('[data-act="dismiss"]').focus();
    }
    function closePanel(restore = true) {
        if (!dialog.open) return false;
        dialog.close();
        restoreFocusRoles();
        warp.mapTextElem.hidden = false;
        const greeting = warp.timeOfflineElem.querySelector('.compass-greeting');
        if (greeting) greeting.replaceWith(...greeting.childNodes);
        for (const {el,marker,target} of sources) if (el.parentNode === target) marker.after(el);
        panel = '';
        if (restore && usingRealTimeOffline) opener?.focus({preventScroll:true});
        opener = null;
        return true;
    }
    const help = byId('tooltipDiv2');
    function finishHelp() {
        if (!helpOpen) return;
        helpOpen = false;
        compass.inert = false;
        restoreFocusRoles();
        help.removeAttribute('tabindex');
        help.removeAttribute('role');
        help.removeAttribute('aria-modal');
        help.removeAttribute('aria-labelledby');
        if (usingRealTimeOffline && isDiorama()) compass.querySelector('[data-act="help"]').focus({preventScroll:true});
    }
    function openHelp() {
        tooltip('Lost Time', null, 'update');
        if (help.style.display === 'none') return;
        helpOpen = true;
        compass.inert = true;
        makeFocusable(help);
        help.tabIndex = -1;
        help.setAttribute('role','dialog');
        help.setAttribute('aria-modal','true');
        help.setAttribute('aria-labelledby','tipTitle2');
        help.focus({preventScroll:true});
    }
    new MutationObserver(() => { if (helpOpen && help.style.display === 'none') finishHelp(); }).observe(help,{attributes:true,attributeFilter:['style']});
    function back() {
        if (helpOpen) { cancelTooltip(); finishHelp(); return true; }
        return closePanel();
    }
    compass.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        switch (button.dataset.act) {
            case 'tools': openPanel('tools',button); break;
            case 'context': openPanel('maps',button); break;
            case 'maps':
                if (inMap()) { warp.leaveMap(); redrawMapActions(); }
                else openPanel('maps',button);
                break;
            case 'help': openHelp(); break;
            case 'end': warp.finish(); break;
        }
    });
    dialog.addEventListener('cancel',event => { event.preventDefault(); closePanel(); });
    dialog.addEventListener('click', event => {
        if (event.target === dialog || event.target.closest('[data-act="dismiss"]')) { closePanel(); return; }
        if (event.target.closest('.offlineMapBtn,#offlineZoneBtn')) {
            const leaving = Boolean(event.target.closest('#offlineZoneBtn'));
            redrawMapActions();
            if (leaving ? !inMap() : game.global.mapsActive) closePanel();
            else if (!leaving) {
                text('map-feedback',label('The map could not be started.','Die Map konnte nicht gestartet werden.'));
                values['map-feedback'].hidden = false;
                values['map-feedback'].focus();
            }
        } else if (panel === 'tools') refreshTools();
    });
    document.addEventListener('keydown', event => {
        if (!dialog.open && !helpOpen) return;
        if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); back(); return; }
        if (helpOpen && event.key === 'Tab') {
            const links = [...help.querySelectorAll('button,input,select,[tabindex="0"]')].filter(el => el.getClientRects().length);
            if (links.length && (!links.includes(document.activeElement) || (event.shiftKey ? links[0] : links.at(-1)) === document.activeElement)) {
                event.preventDefault(); (event.shiftKey ? links.at(-1) : links[0]).focus();
            }
        }
        if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"][onclick]:not(button):not(input)')) {
            event.preventDefault(); event.stopImmediatePropagation(); event.target.click();
        }
    },true);
    const update = warp.updateBar;
    warp.updateBar = function (...args) { const result = update.apply(this,args); refresh(); return result; };
    const finish = warp.finish;
    warp.finish = function (...args) {
        closePanel(false);
        if (helpOpen) { cancelTooltip(); finishHelp(); }
        return finish.apply(this,args);
    };
    function applyStyle() {
        compass.hidden = !isDiorama();
        if (compass.hidden) { closePanel(false); if (helpOpen) { cancelTooltip(); finishHelp(); } }
        else refresh();
    }
    document.addEventListener('scruffy:graphic-style',applyStyle);
    applyStyle();
    wrapper.classList.add('compass-ready');
    return {back};
})();
