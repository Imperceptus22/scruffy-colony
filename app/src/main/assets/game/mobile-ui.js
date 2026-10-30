// Presentation only: original nodes, unlocks, purchase amounts and actions remain authoritative.
var TrimpsUI = (() => {
    const byId = id => document.getElementById(id);
    let selected = 'colony', returnPage = 'colony';
    const sections = {};
    let refreshUI = null, renderTimer = null;
    function suspend() { if (renderTimer !== null) clearInterval(renderTimer); renderTimer = null; }
    function resume() {
        if (!refreshUI || renderTimer !== null || (typeof mobileRuntimeSuspended !== 'undefined' && mobileRuntimeSuspended)) return;
        refreshUI();
        renderTimer = setInterval(refreshUI, 1000);
    }
    // Research bottleneck from the original red/orange cost spans and wait times: the missing resource that takes
    // longest (orange = exceeds storage, ∞ counts as longest). Only data attributes; Classic paints nothing from them.
    // V-208: Diorama writes the original wait times short ("5 Mins 59 Secs" -> "5:59", "58 Secs" -> "0:58", "1 Hour 5 Mins"
    // -> "1h 05m", "3 Days 4 Hours" -> "3d 4h", "1.59M Years 218 Days" -> "1.59M y"), so cost lines keep one line; Classic
    // keeps the original wording.
    function shortTime(text) {
        if (document.documentElement.dataset.graphics !== 'diorama') return text;
        const pad = n => String(n).padStart(2, '0');
        return text.replace(/(\S+) Years? \d+ Days?/g, '$1 y').replace(/(\d+) Days? (\d+) Hours?/g, '$1d $2h')
            .replace(/(\d+) Hours? (\d+) Mins?/g, (_, h, m) => h + 'h ' + pad(m) + 'm')
            .replace(/(\d+) Mins? (\d+) Secs?/g, (_, m, s) => m + ':' + pad(s)).replace(/(\d+) Secs?/g, (_, s) => '0:' + pad(s));
    }
    function researchBottleneck(price, cost) {
        const unit = {Year:31536000, Day:86400, Hour:3600, Min:60, Sec:1};
        const timeOf = span => (span.textContent.match(/\(([^()]*)\)\s*$/) || [])[1] || '';
        const wait = span => {
            const time = timeOf(span);
            // prettify() writes very long waits as "1.23K Years": a suffixed year count is beyond any plain one.
            if (span.classList.contains('orange') || !time || time === '∞' || time === 'Long Time' || /\d[A-Za-z]+\s*Year/.test(time)) return Infinity;
            return [...time.matchAll(/([\d.,e+]+)\s*(Year|Day|Hour|Min|Sec)/g)].reduce((sum, m) => sum + parseFloat(m[1].replace(/,/g, '')) * unit[m[2]], 0);
        };
        const worst = [...cost.querySelectorAll('span.red, span.orange')].map(span => ({span, wait:wait(span)})).sort((a, b) => b.wait - a.wait)[0];
        if (!worst) { delete price.dataset.bottleneck; delete price.dataset.bottleneckWait; delete price.dataset.bottleneckStorage; return; }
        price.dataset.bottleneck = worst.span.textContent.replace(/ /g, ' ').split(':')[0].trim();
        // V-244: the original computes the wait also when the price exceeds storage (orange); it stays, marked "(Storage)".
        // A share such as "(150.0%)" (stock above a lowered maximum) is no wait: it shows as ∞.
        const time = timeOf(worst.span);
        price.dataset.bottleneckWait = shortTime(time && !/%$/.test(time) ? time : '∞');
        if (worst.span.classList.contains('orange')) price.dataset.bottleneckStorage = ''; else delete price.dataset.bottleneckStorage;
    }
    // The red "(Storage)" after the wait needs its own colour, so it is a child the research sheet orders after ::after;
    // its text comes from the sheet, so screen readers hear it with the line.
    function storageFlag(price) {
        if (price.dataset.bottleneckStorage === undefined || price.querySelector('.mobile-storage-flag')) return;
        const flag = document.createElement('span'); flag.className = 'mobile-storage-flag'; price.append(flag);
    }
    function refreshVisibleLabelsAndPrices() {
        document.querySelectorAll('.mobile-action-label').forEach(label => {
            if(label.closest('[hidden]'))return;
            label.textContent = MobileTexts.actions[label.dataset.type];
            label.parentElement.setAttribute('aria-label', label.textContent + ' ' + label.dataset.item);
        });
        document.querySelectorAll('.mobile-price[data-type][data-item]').forEach(price => {
            if(price.closest('[hidden]'))return;
            const {type, item} = price.dataset;
            const cost = document.createElement('div');
            if (type === 'buildings' && item !== 'Hub') cost.innerHTML = canAffordBuilding(item, false, true);
            else if (type === 'equipment') cost.innerHTML = canAffordBuilding(item, false, true, true);
            else if (type === 'jobs') {
                const amount = game.jobs[item].cost && game.global.buyAmt === 'Max' ? calculateMaxAfford(game.jobs[item], false, false, true) : game.global.buyAmt;
                const keys = Object.keys(game.jobs[item].cost || {});
                price.dataset.resource = keys.join(' ');
                // Design D: original amount and share, shown as "5 · 0%" next to the resource symbol.
                cost.innerHTML = keys.map(key => (keys.length > 1 || !['food', 'gems'].includes(key) ? key + ' ' : '') + checkJobItem(item, false, key, true, amount)).join(', ');
            } else cost.innerHTML = addTooltipPricing(game[type][item], item, type);
            cost.querySelectorAll('.icon-infinity').forEach(node => { node.textContent = '∞'; });
            if (type === 'upgrades') researchBottleneck(price, cost);
            const full = type === 'jobs' ? cost.textContent.replace(/\s*\(([^()]*)\)/g, ' · $1') : cost.textContent;
            price.textContent = shortTime(full);
            if (type === 'upgrades') storageFlag(price);
            // Screen readers keep the original wording ("5 Mins 59 Secs"), not the short clock form.
            if (type === 'jobs' && price.dataset.resource) price.setAttribute('aria-label', 'Cost ' + price.dataset.resource + ': ' + full);
            else if (type === 'jobs') price.removeAttribute('aria-label');
        });
    }
    // V-213: an info window stays open until the player closes it (Close, a tap beside it, Back); no timer closes it.
    // The generation still ends live refreshes (zone info) once the window is replaced.
    let infoGeneration = 0, explicitInfo = false;
    function clearInfoTimer() { infoGeneration++; }
    async function busy(button, action) {
        if(button.getAttribute('aria-busy')==='true')return false;
        const disabled=button.disabled;button.disabled=true;button.setAttribute('aria-busy','true');
        try{return await action();}finally{button.disabled=disabled;button.removeAttribute('aria-busy');}
    }
    function available(name) {
        if (name === 'resources' || name === 'more' || name === 'colony') return true;
        // Trap.first reveals the original population panel before jobs unlock at one Trimp.
        const population = byId('trimps');
        if (name === 'jobs' && population && population.style.visibility !== 'hidden' && population.style.display !== 'none') return true;
        const source = byId(name === 'battle' || name === 'maps' ? 'battleContainer' : name === 'buildings' ? 'buyCol' : name + 'Tab');
        return !!source && source.style.visibility !== 'hidden' && source.style.display !== 'none';
    }
    function syncNavigation() {
        const target = selected === 'maps' ? 'battle' : selected === 'colony' ? TrimpsColony.category() : selected;
        document.querySelectorAll('#mobile-nav button').forEach(button => {
            const visible = available(button.dataset.page);
            if (button.hidden && visible) button.classList.add('mobile-nav-revealed');
            if (!visible) button.classList.remove('mobile-nav-revealed');
            button.hidden = !visible;
            button.setAttribute('aria-current', button.dataset.page === target ? 'page' : 'false');
        });
        byId('mobile-more-button').setAttribute('aria-expanded', String(selected === 'more'));
        if (target !== 'more' && !available(target)) select('resources');
    }
    function select(name) {
        if (typeof MobileMore !== 'undefined' && MobileSaveManager.busy()) return;
        if (!available(name)) name = 'resources';
        const category = MobileTexts.colonyTabs.some(([key]) => key === name) ? name : null;
        if (category) name = 'colony';
        if (!sections[name]) return;
        const previousCategory = selected === 'colony' ? TrimpsColony.category() : null;
        if (['buildings','equipment','jobs','upgrades'].includes(previousCategory) &&
            (name !== 'colony' || (category && category !== previousCategory))) {
            numTab(1);
            updateLabels(true);
            MobileInventory.refresh();
            byId('mobile-job-quantity').textContent = 'Plus hires, minus fires. Amount: 1';
        }
        if (name === 'more' && selected !== 'more') returnPage = selected;
        cancelTooltip();
        selected = name;
        for (const [key, section] of Object.entries(sections)) section.hidden = key !== name;
        const battle = byId('rightCol');
        if (name === 'maps' || name === 'battle') {
            const log = byId('mobile-log-panel');
            if (log) sections.battle.insertBefore(battle, log); else sections.battle.appendChild(battle);
        }
        if (typeof MobileDesign !== 'undefined' && MobileDesign) MobileDesign.mode(name);
        if (category) TrimpsColony.select(category);
        if (typeof MobileMore !== 'undefined') MobileMore.onPage(name);
        syncNavigation();
        if (typeof TrimpsColony !== 'undefined' && TrimpsColony) TrimpsColony.activate(name === 'colony');
        refreshVisibleLabelsAndPrices();
        if(category)MobileInventory.refresh();
        window.scrollTo(0, 0);
    }
    function showMapChamber() {
        if(selected!=='battle'||game.global.lockTooltip)return false;
        const overlays=['tooltipDiv','achievementPopup','achievementHover','heirloomsPopup','heirloomWrapper','playerSpirePopout','portalWrapper','statsWrapper','achievementWrapper','boneWrapper','mobile-generator'];
        if(u2Mutations.open||overlays.some(id=>{const node=byId(id);return node&&!node.hidden&&getComputedStyle(node).display!=='none';}))return false;
        select('maps');
        if(typeof MobileMapWorkshop!=='undefined')MobileMapWorkshop.show('list');
        return true;
    }
    function infoAction(action) {
        cancelTooltip();
        explicitInfo = true;
        try { action(); } finally { explicitInfo = false; }
        if (byId('tooltipDiv').style.display === 'none') return;
        game.global.lockTooltip = true;
    }
    // A tap beside an open window closes it and reaches nothing below. Windows with fields or check boxes (settings,
    // Spire settings, Map At Zone, import, rename …) only close through their own actions, so no input is lost. The tap is
    // read from pointerdown/pointerup, because a disabled button beside the window fires no click; the click that
    // follows the closing tap is swallowed.
    let besideDown = false, swallowUntil = 0;
    function beside(event) {
        const tip = byId('tooltipDiv');
        if (!tip || tip.style.display === 'none' || tip.contains(event.target)) return false;
        return !tip.querySelector('input,select,textarea,.autoCheckbox,.niceCheckbox,[role="checkbox"],[role="switch"]');
    }
    function closeBeside(event) {
        // A new touch ends any wait for the click of the last closing tap (a disabled button fires none).
        if (event.type === 'pointerdown') { swallowUntil = 0; besideDown = beside(event); return; }
        if (event.type === 'pointercancel') { besideDown = false; return; }
        if (event.type === 'pointerup') {
            if (!besideDown || !beside(event)) { besideDown = false; return; }
            // pointerup itself still reaches drag controls (map sliders) so they end their drag; only the click is swallowed.
            besideDown = false; swallowUntil = performance.now() + 700; cancelTooltip(); return;
        }
        if (performance.now() < swallowUntil) { swallowUntil = 0; event.preventDefault(); event.stopPropagation(); return; }
        if (!beside(event)) return;
        event.preventDefault(); event.stopPropagation();
        cancelTooltip();
    }
    // Original zone/map overview (desktop hover on the battle title), rendered by the original function.
    function renderZoneInfo(update) {
        getZoneStats(update ? null : 'update', update);
        const tip = byId('tipText');
        // V-222: the overview is prose, not a breakdown: its rows wrap and stay left instead of scrolling sideways.
        tip.querySelector('table')?.classList.add('mobile-zone-info');
        tip.querySelectorAll('td').forEach(cell => {
            const match = cell.textContent.trim().match(/^Items: (\d+)$/);
            if (!match) return;
            cell.closest('tr').classList.add('mobile-zone-map-row');
            cell.textContent = Number(match[1]) ? 'Items still available: ' + match[1] : 'No items remaining';
        });
    }
    // The live refresh runs from the original 250 ms cost loop. It stops as soon as this info is closed or
    // replaced by another dialog (new info generation), and never lets an error break that loop.
    function zoneInfo() {
        infoAction(() => renderZoneInfo(false));
        if (byId('tooltipDiv').style.display === 'none') { tooltipUpdateFunction = ''; return; }
        const generation = infoGeneration;
        tooltipUpdateFunction = () => {
            if (generation !== infoGeneration || byId('tooltipDiv').style.display === 'none') { tooltipUpdateFunction = ''; return; }
            try { renderZoneInfo(true); } catch (_) { tooltipUpdateFunction = ''; }
        };
    }
    function info(what, type) { infoAction(() => {
        tooltip(what, type, 'update');
        if(type==='equipment'&&what!=='Shield') {
            const item=game.equipment[what],amount=game.global.buyAmt==='Max'?Math.max(1,calculateMaxAfford(item,false,true)):game.global.buyAmt;
            const stat=item.attack?'Attack':'Health',ratio=MobileInventory.prices(what,true)[0].cost/(item[stat.toLowerCase()+'Calculated']*amount);
            const text=byId('tipText');
            text.innerHTML=text.innerHTML.replace(/[^<>]* metal spent per point of (Attack|Health)\./,prettify(ratio)+' metal spent per point of '+stat+'.').replace(/ The most efficient Attack and Health equipment(?: of your highest Tier)? have blue backgrounds\.(?: \(Search Settings for Highlight Equipment to change behavior\))?/,' The outlined equipment has the lowest metal cost per added Attack or Health for the selected purchase amount, across all unlocked tiers.');
        }
    }); }
    function infoText(title, text) { infoAction(() => tooltip(title, 'customText', 'update', text)); }
    function infoDetails(title, actions) {
        infoAction(() => {
            const parts = [];
            for (const action of actions) {
                action(); parts.push(byId('tipText').innerHTML);
                game.global.lockTooltip = false;
            }
            tooltip(title, 'customText', 'update', parts.join('<hr>'));
        });
    }
    function changeJob(name, firing) {
        const job = game.jobs[name];
        if (!job || job.locked || !job.cost || name === 'Amalgamator') return;
        const oldFiring = game.global.firing, oldAmount = game.global.buyAmt;
        try {
            game.global.firing = firing;
            if (firing) {
                const requested = oldAmount === 'Max' ? calculateMaxAfford(job, false, false, true) : oldAmount;
                game.global.buyAmt = Math.max(0, Math.min(job.owned, requested));
                if (game.global.buyAmt < 1) return;
            }
            buyJob(name);
        } finally {
            game.global.firing = oldFiring; game.global.buyAmt = oldAmount;
            updateLabels(true);
            const minus = byId(name + 'Minus');
            if (minus) minus.disabled = job.owned < 1;
        }
    }
    async function showLicense(name) {
        const allowed = ['GPL-3.0.txt','GPL-2.0-original.txt','Bootstrap-MIT.txt','Normalize-MIT.txt','Decimal-MIT.txt','WTFPL-2.0.txt','Apache-2.0.txt','Fraunces-OFL.txt','SpaceGrotesk-OFL.txt','Manrope-OFL.txt','CrimsonPro-OFL.txt','Lucide-ISC.txt','Perky-WTFPL.txt'];
        if (!allowed.includes(name)) return false;
        tooltip('License text', 'customText', 'update', '<pre id="mobile-license-text" style="white-space:pre-wrap">Loading license…</pre>');
        try {
            const response = await fetch('licenses/' + name);
            if (!response.ok) throw new Error('LICENSE');
            const text = await response.text();
            const node = byId('mobile-license-text');
            if (node) node.textContent = text;
            return true;
        } catch (_) {
            const node = byId('mobile-license-text');
            if (node) node.textContent = 'The license text could not be loaded. License files are also included with the source on GitHub.';
            return false;
        }
    }
    function openTextImport() {
        cancelTooltip();
        tooltip('Import save text', 'customText', 'update', MobileTexts.importText);
        game.global.lockTooltip = true;
        byId('mobile-import-text').focus();
    }
    async function submitImportText() {
        const input = byId('mobile-import-text');
        if (!input) return false;
        const button = byId('mobile-import-submit');
        button.disabled = true;
        button.setAttribute('aria-busy','true');
        let ok;
        try{ok=await TrimpsMobile.importSave(input.value);}finally{button.removeAttribute('aria-busy');if(button.isConnected)button.disabled=false;}
        if (ok) cancelTooltip();
        else {
            const feedback = byId('mobile-import-result');
            if (feedback) feedback.textContent = MobileTexts.importTextFailed;
            if (button.isConnected) button.disabled = false;
        }
        return ok;
    }
    function setup() {
        const closeInfo = document.createElement('button');
        closeInfo.id = 'mobile-tooltip-close'; closeInfo.className = 'mobile-tooltip-close';
        // V-213: a small × in the corner of every window, named Close for screen readers.
        closeInfo.type = 'button'; closeInfo.setAttribute('aria-label', MobileTexts.close); closeInfo.onclick = () => cancelTooltip();
        byId('tooltipDiv').prepend(closeInfo);
        for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click']) document.addEventListener(type, closeBeside, true);
        const achievementClose = document.querySelector('#achievementPopup .achievementBtnClose');
        const achievementGo = document.querySelector('#achievementPopup .achievementBtnGo');
        for (const [node, label] of [[achievementClose, MobileTexts.close],[achievementGo, MobileTexts.achievements]]) {
            node.classList.remove('icomoon', 'icon-close', 'icon-newspaper-o');
            node.textContent = label; node.setAttribute('role', 'button'); node.tabIndex = 0;
        }
        achievementClose.id = 'mobile-achievement-close';
        const achievementPopup=byId('achievementPopup'),achievementTitle=byId('achievementPopupTitle');
        const achievementCaption=document.createElement('strong'),achievementTier=document.createElement('span');
        const achievementText=value=>typeof MobileI18n!=='undefined'?MobileI18n.t(value):value;
        achievementCaption.className='mobile-achievement-caption';achievementCaption.textContent=achievementText('Achievement unlocked');
        achievementClose.parentElement.prepend(achievementCaption);
        achievementClose.textContent='×';achievementClose.setAttribute('aria-label',MobileTexts.close);
        achievementGo.id='mobile-achievement-view';achievementGo.textContent=achievementText('View achievements');
        achievementTier.className='mobile-achievement-tier';achievementTitle.after(achievementTier);
        const updateAchievementTier=()=>{const tier=/achieveTier(\d+)/.exec(achievementTitle.className);achievementTier.textContent=tier?achievementText('Tier')+' '+tier[1]:'';};
        new MutationObserver(updateAchievementTier).observe(achievementTitle,{attributes:true,attributeFilter:['class']});
        achievementPopup.append(byId('achievementPopupDescription'),byId('achievementPopupReward'),achievementGo);
        const host = byId('innerWrapper');
        for (const name of ['colony', 'battle', 'maps', 'more']) {
            const section = document.createElement('section');
            section.id = 'mobile-' + name;
            section.className = 'mobile-page';
            section.setAttribute('aria-label', {colony:'Colony', battle:'Combat', maps:'Maps', more:'More'}[name]);
            sections[name] = section;
            host.appendChild(section);
        }
        ['resourceColumn', 'miscColumn', 'trimpsColumn', 'buyCol'].forEach(id => sections.colony.appendChild(byId(id)));
        MobileHas.start();
        sections.battle.innerHTML = MobileTexts.battlePage;
        sections.maps.innerHTML = MobileTexts.mapsPage;
        sections.more.innerHTML = MobileTexts.morePage;
        const saveFeedback=document.createElement('p');saveFeedback.id='mobile-save-feedback';saveFeedback.setAttribute('role','status');saveFeedback.hidden=true;document.body.append(saveFeedback);
        let saveFeedbackTimer=null;
        byId('mobile-save-button').onclick = async event => {
            clearTimeout(saveFeedbackTimer);saveFeedback.hidden=true;
            if(await busy(event.currentTarget,()=>TrimpsMobile.saveNow())===true){
                saveFeedback.textContent='Game saved';saveFeedback.hidden=false;
                saveFeedbackTimer=setTimeout(()=>{saveFeedback.hidden=true;},2000);
            }
        };
        byId('mobile-import-button').onclick = event => busy(event.currentTarget,()=>TrimpsMobile.importFile());
        byId('mobile-text-button').onclick = openTextImport;
        byId('mobile-export-button').onclick = event => busy(event.currentTarget,()=>TrimpsMobile.exportFile());
        byId('mobile-privacy-button').onclick = () => tooltip('Privacy policy', 'customText', 'update', MobileTexts.privacyPolicy);
        byId('mobile-licenses-button').onclick = () => tooltip('Licenses & Source', 'customText', 'update', MobileTexts.licensesPage);
        ['settingsRow', 'logColumn'].forEach(id => sections.more.appendChild(byId(id)));
        // Android document access replaces the old clipboard dialogs, including the legacy Import entry.
        const cells = byId('settingsTable').querySelectorAll('td');
        cells[1].onclick = () => TrimpsMobile.exportFile();
        cells[2].onclick = () => TrimpsMobile.importFile();
        cells[5].addEventListener('click', () => {
            if (game.options.displayed) requestAnimationFrame(() => byId('settingsHere').scrollIntoView({block:'start'}));
        });
        // Keep bundled release notes in this local view; external help links use the system browser.
        cells[7].onclick = () => tooltip('Changes', 'customText', 'update', '<span data-original-text>Original Trimps 5.10.1. <a href="https://trimps.github.io/updates.html">Open original changelog in browser</a>.</span>');
        const header = document.createElement('header');
        header.id = 'mobile-header';
        header.innerHTML = MobileTexts.header;
        document.body.insertBefore(header, byId('mobile-status'));
        MobileBoneHints.start();
        if (typeof MobileBoneShop !== 'undefined') MobileBoneShop.start();
        byId('mobile-more-button').onclick = () => select(selected === 'more' ? returnPage : 'more');
        const nav = document.createElement('nav');
        nav.id = 'mobile-nav'; nav.setAttribute('aria-label', 'Game sections');
        for (const [name, label] of MobileTexts.navigation) {
            const button = document.createElement('button');
            button.dataset.page = name; button.id = 'mobile-nav-' + name; button.setAttribute('aria-label', label); button.title = label;
            button.onclick = () => select(name);
            nav.appendChild(button);
        }
        document.body.appendChild(nav);
        // Player Spire and the Mutator tree only have small glyph close controls; this touch-sized close reuses the Back order.
        const overlayClose = document.createElement('button');
        overlayClose.id = 'mobile-overlay-close'; overlayClose.textContent = MobileTexts.close; overlayClose.hidden = true;
        const syncOverlayClose = () => { overlayClose.hidden = !((u2Mutations.open && typeof MobileLateSystems === 'undefined') || (playerSpire.popupOpen && typeof MobilePlayerSpire === 'undefined')); };
        overlayClose.onclick = () => { back(); syncOverlayClose(); };
        document.body.appendChild(overlayClose);
        document.addEventListener('click', () => requestAnimationFrame(syncOverlayClose));
        // Android WebView text zoom (system font size) scales every computed font size; layers bound to a painted or
        // per-slot width read the factor to stay inside it. The empty probe stays in the header, so measuring on resize
        // adds no DOM mutations for the observers on body.
        const zoomProbe = document.createElement('span');
        zoomProbe.setAttribute('aria-hidden', 'true');
        zoomProbe.style.cssText = 'position:absolute;visibility:hidden;font-size:100px!important';
        header.appendChild(zoomProbe);
        // Large text for layout switches: Android text zoom leaves rem-based container queries untouched, so pages key
        // their large-text layouts on html[data-text-zoom="large"]; a larger root font (browser checks) counts too.
        // Writes only the data attribute, so observing the root style cannot loop.
        const syncTextZoom = () => {
            const root = document.documentElement;
            // Android text zoom already scales the root font, so the larger ratio counts, not their product.
            const zoom = Math.max(parseFloat(getComputedStyle(zoomProbe).fontSize) / 100 || 1, parseFloat(getComputedStyle(root).fontSize) / 16 || 1);
            const value = zoom >= 1.15 ? 'large' : 'normal';
            if (root.dataset.textZoom !== value) root.dataset.textZoom = value;
        };
        new MutationObserver(syncTextZoom).observe(document.documentElement, {attributes:true, attributeFilter:['style']});
        const updateNavigationHeight = () => {
            document.documentElement.style.setProperty('--text-zoom', (parseFloat(getComputedStyle(zoomProbe).fontSize) / 100 || 1).toString());
            syncTextZoom();
            document.documentElement.style.setProperty('--mobile-nav-height', nav.getBoundingClientRect().height + 'px');
            document.documentElement.style.setProperty('--mobile-header-height', header.getBoundingClientRect().height + 'px');
        };
        new ResizeObserver(updateNavigationHeight).observe(nav);
        new ResizeObserver(updateNavigationHeight).observe(header);
        updateNavigationHeight();
        const unlockObserver = new MutationObserver(syncNavigation);
        for (const id of ['battleContainer','buyCol','trimps','jobsTab','upgradesTab','equipmentTab']) unlockObserver.observe(byId(id), {attributes:true,attributeFilter:['style']});
        for (const resource of ['food','wood','metal','trimps']) {
            const label = byId(resource + 'TimeToFill');
            const progress = label.closest('.progress');
            label.classList.add('mobile-fill-time');
            progress.after(label);
        }
        document.querySelectorAll('#battleStatsRow .innerFightBar').forEach(label => {
            const bar = label.closest('.fightBar');
            bar.parentNode.insertBefore(label, bar);
        });
        ['advMapsSaveBtn', 'advMapsResetBtn', 'advMapsRecycleBtn'].forEach((id, index) => {
            const node = byId(id); node.textContent = ['Save', 'Reset', 'Recycle'][index];
            node.setAttribute('role', 'button'); node.tabIndex = 0;
        });
        document.querySelectorAll('#mapLevelContainer .incrementBtn').forEach((node, index) => {
            node.textContent = index ? '+' : '−';
            node.setAttribute('aria-label', index ? 'Increase map level' : 'Decrease map level');
            node.setAttribute('role', 'button'); node.tabIndex = 0;
        });
        // Legacy click targets become focusable without changing their original click handlers.
        document.addEventListener('keydown', event => {
            if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"]')) {
                event.preventDefault(); event.target.click();
            }
        });
        document.addEventListener('click', event => {
            const anchor = event.target.closest('a[href]');
            if (anchor && /^https?:/.test(anchor.href)) anchor.target = '_self';
        }, true);
        // Numeric readouts stay readouts; the adjacent Info button owns their original breakdowns.
        for (const resource of ['food','wood','metal','science','fragments','gems']) {
            const card = byId(resource), button = document.createElement('button');
            button.className = 'mobile-info mobile-resource-info'; button.textContent = 'Info';
            button.setAttribute('aria-label', 'Info ' + resource);
            button.onclick = () => infoDetails(resource, ['food','wood','metal'].includes(resource)
                ? [() => getMaxResources(capitalizeFirstLetter(resource)), () => getPsString(resource)] : [() => getPsString(resource)]);
            card.querySelectorAll('[onclick]').forEach(node => { if (/^get(MaxResources|PsString)/.test(node.getAttribute('onclick'))) node.onclick = null; });
            card.appendChild(button);
        }
        const heliumInfo = document.createElement('button');
        heliumInfo.className = 'mobile-info mobile-resource-info'; heliumInfo.textContent = 'Info';
        heliumInfo.setAttribute('aria-label', 'Info Helium / Radon');
        heliumInfo.onclick = () => info('Helium Per Hour', null);
        byId('helium').appendChild(heliumInfo);
        const trimps = byId('trimps'), title = byId('trimpTitle'), owned = byId('trimpsOwned').parentElement;
        const popHead = document.createElement('div'); popHead.className = 'mobile-pop-head';
        const popSummary = document.createElement('div'); popSummary.className = 'mobile-pop-summary';
        const popTitle = document.createElement('div'); popTitle.className = 'mobile-pop-title';popTitle.append(title, byId('trimpsPs'));
        popSummary.append(popTitle, owned);
        const popToggle = document.createElement('button');popToggle.id = 'mobile-pop-toggle';popToggle.type = 'button';
        popToggle.className = 'icon-chevron-down';popToggle.setAttribute('aria-label','Population details');popToggle.setAttribute('aria-expanded','false');popToggle.setAttribute('aria-controls','mobile-pop-details');
        popHead.append(popSummary, byId('trapArea'), popToggle);
        trimps.prepend(popHead);
        const popStats = document.createElement('div'); popStats.className = 'mobile-pop-stats';popStats.id = 'mobile-pop-details';popStats.hidden = true;
        popToggle.onclick = () => {popStats.hidden = !popStats.hidden;popToggle.setAttribute('aria-expanded',String(!popStats.hidden));};
        popStats.append(byId('unempHide'), byId('empHide')); popHead.after(popStats);
        const breedingCount = document.createElement('div'); breedingCount.className = 'mobile-breeding-count';
        breedingCount.append(byId('trimpsUnemployed'), document.createTextNode(' '), byId('trimpsBreedingTitle'));
        byId('unempHide').replaceChildren(breedingCount);
        const popInfo = document.createElement('button'); popInfo.className = 'mobile-info'; popInfo.textContent = 'Info';
        popInfo.onclick = () => infoDetails('Trimps', [getMaxTrimps, getTrimpPs]);
        popStats.append(popInfo); owned.onclick = null; byId('trimpsPs').onclick = null;
        const queueTitle = document.createElement('h2'); queueTitle.textContent = 'Build Queue'; queueTitle.id = 'mobile-queue-title';
        byId('queueContainer').prepend(queueTitle);
        const jobsHint = document.createElement('p'); jobsHint.id = 'mobile-job-quantity';
        byId('jobsTitleDiv').append(jobsHint);
        // V-41 header: the original free-workspace count, worded in English next to "Jobs".
        const freeJobs = document.createElement('span'); freeJobs.id = 'mobile-job-free';
        const workspaces = byId('jobsTitleUnemployed'); workspaces.after(freeJobs);
        const syncFreeJobs = () => {
            const match = workspaces.textContent.trim().match(/^(\S+)\s+workspaces?$/i);
            if (!match) { freeJobs.textContent = workspaces.textContent; return; }
            const strong = document.createElement('strong'); strong.textContent = match[1];
            freeJobs.replaceChildren(strong, document.createTextNode(match[1] === '1' ? ' free workspace' : ' free workspaces'));
        };
        new MutationObserver(syncFreeJobs).observe(workspaces, {childList:true, characterData:true, subtree:true});
        syncFreeJobs();
        // A custom amount equal to a fixed tab would only repeat it ("+1" twice); while the custom slot is not
        // selected only its symbol shows. Synced immediately when the original updates the slot.
        const customSlot = byId('tab5');
        const syncCustomSlot = () => customSlot.toggleAttribute('data-standard-amount', [1, 10, 25, 100].includes(Number(game.global.lastCustomAmt)));
        new MutationObserver(syncCustomSlot).observe(customSlot, {attributes:true, attributeFilter:['class'], childList:true, characterData:true, subtree:true});
        syncCustomSlot();
        byId('fireBtn').hidden = true;
        for (const id of ['damageDiv','blockDiv']) byId(id).onclick = null;
        const healthInfo = byId('goodGuyCol').querySelector('.innerFightBar');
        healthInfo.onclick = () => infoDetails('Combat stats', [() => getBattleStatBd('attack'), () => getBattleStatBd('block'), () => getBattleStatBd('health')], false);
        healthInfo.setAttribute('role','button'); healthInfo.tabIndex = 0;
        healthInfo.prepend(document.createTextNode('Info · '));
        const sideTitle = byId('battleSideTitle');
        sideTitle.onmouseover = null; sideTitle.onmouseout = null; sideTitle.onclick = zoneInfo;
        sideTitle.setAttribute('role', 'button'); sideTitle.tabIndex = 0; sideTitle.setAttribute('aria-label', 'Zone and map info');
        // V-218: the badges beside the names (Fast, Void and Corruption effects, Pierce, Electric, Crushing Blows …) explain
        // themselves only on desktop hover. A tap opens the same original text as an info window that stays open.
        byId('battleStatsRow').addEventListener('click', event => {
            const badge = event.target.closest?.('.badge[onmouseover]');
            if (!badge || typeof badge.onmouseover !== 'function') return;
            event.preventDefault();
            infoAction(() => badge.onmouseover(event));
        });
        TrimpsColony = ColonyPages.create(sections.colony);
        const decorate = () => {
            document.querySelectorAll('.workBtn, .buyTab, #numTabs li, #battleBtnsColumn .btn, .buyBox .thing[onclick]:not(button)').forEach(node => {
                node.setAttribute('role', 'button'); node.tabIndex = 0;
            });
            byId('mobile-zone').textContent = 'Zone ' + game.global.world;
            byId('mobile-battle-hint').hidden = byId('battleContainer').style.visibility !== 'hidden';
            refreshVisibleLabelsAndPrices();
            document.querySelectorAll('.mobile-job-minus').forEach(button => {
                const job = game.jobs[button.dataset.job]; button.disabled = !job?.cost || job.locked || job.owned < 1 || button.dataset.job === 'Amalgamator';
            });
            document.querySelectorAll('.mobile-job-plus').forEach(button => {
                const job = game.jobs[button.dataset.job]; button.disabled = !job?.cost || job.locked || button.dataset.job === 'Amalgamator';
            });
            byId('mobile-job-quantity').textContent = 'Plus hires, minus fires. Amount: ' + game.global.buyAmt;
            syncNavigation();
            MobileInventory.refresh();
            syncCustomSlot();
            syncOverlayClose();
            if (typeof MobileDesign !== 'undefined' && MobileDesign) MobileDesign.refresh();
            if (typeof MobileBones !== 'undefined') MobileBones.refresh();
            if (typeof MobilePlayerSpire !== 'undefined') MobilePlayerSpire.refresh();
            if (typeof MobileGenerator !== 'undefined') MobileGenerator.refresh();
            TrimpsColony.refresh();
            if(typeof MobileQolMaps!=='undefined')MobileQolMaps.refresh();
        };
        refreshUI = decorate;
        resume();
        select('colony');
    }
    function back() {
        if (typeof MobileSaveManager !== 'undefined' && MobileSaveManager.back()) return true;
        const visible = id => { const node = byId(id); return node && getComputedStyle(node).display !== 'none'; };
        if (visible('achievementPopup')) { closeAchievementPopup(); return true; }
        if (visible('achievementHover')) { closeAchievementPopup(true); return true; }
        if (visible('tooltipDiv') || game.global.lockTooltip) { cancelTooltip(); return true; }
        if (typeof MobileCombatControls !== 'undefined' && MobileCombatControls.back()) return true;
        if (visible('heirloomsPopup')) { closeHeirPopup(); return true; }
        if (visible('heirloomWrapper')) { if(typeof MobileHeirlooms!=='undefined')return MobileHeirlooms.back(); toggleHeirlooms(); return true; }
        if (typeof MobileHelp !== 'undefined' && MobileHelp.back()) return true;
        if (typeof MobileGenerator !== 'undefined' && MobileGenerator.back()) return true;
        if (playerSpire.popupOpen) { if(typeof MobilePlayerSpire!=='undefined')return MobilePlayerSpire.back();playerSpire.closePopup(); return true; }
        if (u2Mutations.open) { u2Mutations.closeTree(); return true; }
        if (typeof MobileDesign !== 'undefined' && MobileDesign?.back()) return true;
        if (typeof TrimpsColony !== 'undefined' && TrimpsColony?.back()) return true;
        if (visible('portalWrapper')) { if(typeof MobilePerky!=='undefined'&&MobilePerky.back())return true; if(typeof MobilePortal!=='undefined'&&MobilePortal.back())return true; cancelPortal(); return true; }
        if (visible('statsWrapper')) { toggleStats(); return true; }
        if (visible('achievementWrapper')) { toggleAchievementWindow(); return true; }
        if (visible('boneWrapper')) { hideBones(); return true; }
        if (selected === 'more' && typeof MobileMore !== 'undefined' && MobileMore.back()) return true;
        if (selected === 'more' && visible('settingsHere')) { toggleSettingsMenu(); window.scrollTo(0,0); return true; }
        if (selected === 'maps') { if(typeof MobileMapPresets!=='undefined'&&MobileMapPresets.back())return true; if(game.global.preMapsActive)MobileMapMenu.returnToWorld();else select('battle'); return true; }
        if (selected === 'more') { select(returnPage); return true; }
        if (selected !== 'colony') { select('colony'); return true; }
        return false;
    }
    setup();
    return {select, shortTime, showMapChamber, syncNavigation, info, infoAction, infoText, zoneInfo, changeJob, isExplicitInfo:() => explicitInfo, clearInfoTimer, back, openTextImport, submitImportText, showLicense, suspend, resume};
})();
