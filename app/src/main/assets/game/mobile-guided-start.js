// Guided start (V-240, user choice 28.10.2026: variant A "spotlight"): a new save in its first run is led step by step to
// the first fight. Each step lights up one existing control (the rest of the screen darkens a little) with a one-sentence
// bubble; the next step starts only when the game reports the goal, a step whose goal is already met is skipped. The light
// never blocks a tap anywhere, Skip passes over one step, Help restarts it and Quality of life switches it off. While it
// runs ADVISOR does not open by itself (mobile-advisor.js); afterwards ADVISOR takes over.
// Progress lives in the local preferences of the save (MobileQolStore), never in the game: no reward, no other cost, no
// earlier unlock; the one exception (V-255) speeds the gathering of the food and wood steps up to their goal. The Trap
// step sets the original custom amount to the Traps still needed (numTab 5, as the player could) and restores the
// previous amount afterwards.
// V-245: a new save opens with a welcome window first; the original's own welcome window no longer shows (updates.js).
// V-249: food and wood are gathered once, for all the guide still needs, and all 5 Traps are bought and built in one go.
// V-252: the first step explains the work bar as a whole. V-246: Skip passes over the current step only. V-247: when a
// goal lacks something, the light and the sentence name what to do first, and the bubble keeps the real goal clear.
var MobileGuidedStart = (() => {
    const TRAPS = 5;
    const queued = (g, name) => (g.global.buildingsQueue || []).reduce((n, entry) => {
        const [what, count] = String(entry).split('.'); return what === name ? n + (Number(count) || 1) : n; }, 0);
    const builtTraps = g => g.buildings.Trap.purchased - queued(g, 'Trap');
    const scruffies = g => g.resources.trimps.owned;
    const res = (g, name) => g.resources[name].owned;
    // Original cost of the next n purchases: a number, or [base, factor] growing with each one owned.
    const price = (cost, owned, n = 1) => { let sum = 0; for (let i = 0; i < n; i++) sum += Array.isArray(cost) ? Math.ceil(cost[0] * Math.pow(cost[1], owned + i)) : Number(cost) || 0; return sum; };
    const trapsLeft = g => Math.max(0, TRAPS - g.buildings.Trap.purchased);
    const trapCost = (g, name, n = trapsLeft(g)) => price(g.buildings.Trap.cost[name], g.buildings.Trap.purchased, n);
    const jobCost = (g, name) => g.jobs[name].owned >= 1 ? 0 : price(g.jobs[name].cost.food, g.jobs[name].owned);
    // What the rest of the guide still needs: the missing Traps, a Farmer and a Lumberjack not hired yet, and the 15 food on
    // hand that let Research appear (original trigger "upgrades": 2 Scruffies and 15 food).
    const RESEARCH_FOOD = 15;
    const foodLeft = g => trapCost(g, 'food') + jobCost(g, 'Farmer') + jobCost(g, 'Lumberjack') + (g.triggers.upgrades.done ? 0 : RESEARCH_FOOD);
    const woodLeft = g => trapCost(g, 'wood');
    const free = g => Math.floor(scruffies(g)) - (Number(g.resources.trimps.employed) || 0);
    // A target is [page, element id, card selector]; the card selector widens the light to the whole tile.
    const T = {
        bar:['resources','mobile-resource-actions'],
        food:['resources','foodCollectBtn'], wood:['resources','woodCollectBtn'], science:['resources','scienceCollectBtn'],
        catch:['jobs','trimpsCollectBtn'], build:['buildings','buildingsCollectBtn'],
        trap:['buildings','Trap','.mobile-inventory-tile'], farmer:['jobs','Farmer','.mobile-purchase'],
        lumberjack:['jobs','Lumberjack','.mobile-purchase'], battle:['upgrades','Battle','.mobile-purchase'],
        fight:['battle','fightBtn'], more:[null,'mobile-more-button']
    };
    // Buy every missing Trap at once on its tile (the amount is set to them), then build the queue. Lacking food or wood,
    // the light goes to Gather or Chop first and says so; the Trap tile stays clear of the bubble.
    function trapTarget(g) {
        if (queued(g, 'Trap') > 0) return {target:T.build, text:'Tap Build so your Traps get made. For now you do this yourself; later you get help.'};
        const n = Math.max(1, trapsLeft(g)), food = trapCost(g, 'food', n), wood = trapCost(g, 'wood', n);
        if (res(g, 'food') < food) return {target:T.food, keep:T.trap, text:'The Traps need more food first: tap Gather.', progress:['Food', res(g, 'food'), food]};
        if (res(g, 'wood') < wood) return {target:T.wood, keep:T.trap, text:'The Traps need more wood first: tap Chop.', progress:['Wood', res(g, 'wood'), wood]};
        // V-267: all Traps still to buy get the story sentence; a rest left by an older save keeps the plain instruction.
        const text = n === TRAPS ? "Now let's see whether we can catch some of the native creatures to help you. First we need to build Traps. Five should do for a start. Tap Trap once."
            : n === 1 ? 'Buy one more Trap on its tile, then tap Build.' : 'Buy ' + n + ' Traps at once: the amount is set to ' + n + '. Tap Trap once, then Build.';
        return {target:T.trap, amount:n, text};
    }
    // Catching needs a Trap that is built and still empty.
    function catchTarget(g, text, goal) {
        if (g.buildings.Trap.owned < 1) return trapTarget(g);
        return {target:T.catch, text, progress:goal ? ['Scruffies', scruffies(g), goal] : null};
    }
    // A worker needs a free Scruffy and food; without them the light goes to Check Traps or Gather first and says why.
    function jobTarget(g, name, target, text) {
        if (free(g) < 1) return catchTarget(g, 'Hiring needs a free Scruffy: tap Check Traps first.');
        const cost = jobCost(g, name);
        if (res(g, 'food') < cost) return {target:T.food, keep:target, text:'The ' + name + ' costs food: tap Gather first.', progress:['Food', res(g, 'food'), cost]};
        return {target, text};
    }
    const battleTarget = g => res(g, 'science') < 10 ? {target:T.science, text:'Battle needs 10 science. Collect more with Research.', progress:['Science', res(g, 'science'), 10]}
        : {target:T.battle, text:'Research Battle: tap it under Research.'};
    const steps = [
        // V-252: no game goal; Next (the Skip button) or a tap on the bar goes on.
        {done:(g, seen) => !!seen.bar, next:true,
         show:() => ({target:T.bar, text:'This is where you work yourself: Gather brings food, Chop wood, later Mine brings metal and Research science. Only one job runs at a time; it keeps going until you choose another.'})},
        {done:g => res(g, 'food') >= foodLeft(g), speed:'food', goal:foodLeft,
         show:g => ({target:T.food, text:'Tap Gather. Food is then collected all the time until you have ' + foodLeft(g) + ': enough for all Traps, workers and Research.', progress:['Food', res(g, 'food'), foodLeft(g)]})},
        {done:g => res(g, 'wood') >= woodLeft(g), speed:'wood', goal:woodLeft,
         show:g => ({target:T.wood, text:'Tap Chop and collect wood until you have ' + woodLeft(g) + ': enough for all Traps.', progress:['Wood', res(g, 'wood'), woodLeft(g)]})},
        {done:g => builtTraps(g) >= TRAPS || scruffies(g) >= TRAPS, show:trapTarget},
        {done:g => scruffies(g) >= TRAPS,
         show:g => catchTarget(g, 'Tap Check Traps until all ' + TRAPS + ' Traps have caught a Scruffy.', TRAPS)},
        {done:g => g.jobs.Farmer.owned >= 1,
         show:g => jobTarget(g, 'Farmer', T.farmer, 'Hire a Farmer with +. He gathers food for you.')},
        {done:g => g.jobs.Lumberjack.owned >= 1,
         show:g => jobTarget(g, 'Lumberjack', T.lumberjack, 'Hire a Lumberjack with +. He chops wood for you.')},
        // Scientists come only after Battle, so the science for it is collected by hand.
        {done:g => res(g, 'science') >= 10 || g.upgrades.Battle.done >= 1,
         show:g => g.triggers.upgrades.done ? {target:T.science, text:'Next we want to research something. How about your Scruffies fighting for you? For that we first need some science. Tap Research and collect 10 science by hand; with it we can then research Battle.', progress:['Science', res(g, 'science'), 10]}
            : scruffies(g) < 2 ? catchTarget(g, 'Research appears with 2 Scruffies: tap Check Traps.', 2)
            : {target:T.food, text:'Research appears at 15 food. Gather food first.', progress:['Food', res(g, 'food'), RESEARCH_FOOD]}},
        {done:g => g.upgrades.Battle.done >= 1, show:battleTarget},
        {done:g => !!g.global.fighting,
         show:g => g.upgrades.Battle.done >= 1 ? {target:T.fight, text:'Tap Fight. Your Scruffies take on the first enemy.'} : battleTarget(g)},
        // V-266: the last step only points at More; its button "End tutorial" ends the guide and ADVISOR opens.
        {done:() => false, end:true,
         show:() => ({target:T.more, text:'Under More you can save now, make a backup and find Help. From here on, ADVISOR helps you.'})}
    ];
    // V-255 (user's wish 29.10.2026): in the food and the wood step, after 5 s of gathering that resource (from the first
    // tap on Gather or Chop in the step) the bubble says "Let's speed this up." and the rest up to the goal comes in evenly
    // over 3 s, ending exactly at the goal, never above it. Only time spent on that job counts: another job pauses it, and
    // a gap longer than 1 s (app in the background) counts as 1 s. b = {ms} per step; returns the amount to add now.
    const SPEED_WAIT = 5000, SPEED_RUN = 3000;
    function speedUp(b, owned, goal, ms) {
        b.ms += Math.max(0, Math.min(ms, 1000));
        if (b.ms < SPEED_WAIT || owned >= goal) return 0;
        if (b.base === undefined) b.base = owned;
        const part = (b.ms - SPEED_WAIT) / SPEED_RUN, want = part >= 1 ? goal : Math.min(goal, b.base + (goal - b.base) * part);
        return Math.max(0, want - owned);
    }
    const activeElapsed = (clock, now, suspended) => { const elapsed = Math.max(0, now - clock.t), paused = suspended || clock.suspended; clock.t = now; clock.suspended = false; return paused ? 0 : elapsed; };
    const suspendClock = (clock, now) => { activeElapsed(clock, now, true); clock.suspended = true; };
    // A new save in its first run: nothing gathered into buildings, jobs or research yet. Older and imported saves with
    // progress are marked done the first time they are seen.
    const fresh = g => g.global.totalPortals === 0 && g.global.world === 1 && g.buildings.Trap.purchased === 0 && scruffies(g) === 0
        && g.jobs.Farmer.owned === 0 && !(g.upgrades.Battle.done >= 1);
    // The first step whose goal is not met yet, from the stored step on; steps.length when every goal is met.
    function next(g, from, seen = {}) { let i = Math.max(0, from | 0); while (i < steps.length && steps[i].done(g, seen)) i++; return i; }
    // A stored state of the 14-step guide (b76/b77, no version) goes on after the new first step: its welcome is past, and
    // the steps from there skip every goal already met, so a save in the middle of the guide neither repeats nor sticks.
    function upgrade(saved, isFresh) {
        if (!saved || typeof saved !== 'object') return {step:0, done:!isFresh, amount:null, welcomed:!isFresh, v:2};
        const amount = saved.amount && typeof saved.amount === 'object' ? saved.amount : null;
        if (saved.v === 2) return {step:Number(saved.step) || 0, done:saved.done === true, amount, welcomed:saved.welcomed !== false, v:2};
        return {step:saved.done === true ? steps.length : 1, done:saved.done === true, amount, welcomed:true, v:2};
    }
    // The Trap step uses the original custom amount n (numTab 5, as the player could). The player's previous amount is taken
    // once into the guide state s of this save, so a reset to 1 by a page change or a restart of the app (which loads
    // lastCustomAmt n) never replaces it; giving it back restores amount, tab and the portal's firstCustomAmt.
    function takeAmount(g, s, tab, n) {
        const gl = g.global; if (gl.buyAmt === n) return false;
        if (!s.amount) s.amount = {tab:gl.numTab, custom:gl.lastCustomAmt, first:gl.firstCustomAmt};
        s.amount.n = n; gl.lastCustomAmt = n; tab(5); gl.firstCustomAmt = s.amount.first; return true;
    }
    // Only the guide's own amount goes back: one the player chose meanwhile (another tab or custom value) stays.
    // A snapshot of the 14-step guide (b76/b77) has no n; its amount was 3.
    function returnAmount(g, s, tab) {
        if (!s.amount) return false;
        const gl = g.global, back = s.amount, n = back.n ?? 3; s.amount = null;
        gl.firstCustomAmt = back.first;
        if (gl.lastCustomAmt === n) gl.lastCustomAmt = back.custom;
        if (gl.numTab === 5 && gl.buyAmt === n) tab(back.tab || 1);
        return true;
    }
    // V-246: Skip leaves the current step for good (the next check starts after it); true on the last step, which ends it.
    const skipTo = (s, at) => { s.step = at + 1; return s.step >= steps.length; };
    if (typeof document === 'undefined') return {steps, next, fresh, builtTraps, takeAmount, returnAmount, upgrade, skipTo, foodLeft, woodLeft, speedUp, activeElapsed, suspendClock, total:steps.length};

    const byId = id => document.getElementById(id);
    const t = text => typeof MobileI18n === 'undefined' ? text : MobileI18n.t(text);
    const store = typeof MobileQolStore === 'undefined' ? {get:(_, f) => f, set:() => false} : MobileQolStore;
    const enabled = () => store.get('guidedStart', true) !== false;
    let memory = null, seen = {}, speed = null, ring, bubble, tail, text, line, count, skip, shown = '', said = '', lastRect = '', timer = 0, frame = 0, chosen = false, welcoming = false, glideAt = -1, glideTimer = 0;
    // Stored state of this save ({step, done, amount, welcomed, v}); kept in memory as well when the device storage is unavailable.
    function state() {
        const id = game.global.uniqueId;
        if (memory && memory.id === id) return memory;
        const saved = store.get('guidedStartState', null);
        memory = {id, ...upgrade(saved, fresh(game))}; seen = {}; speed = null; if (!saved || saved.v !== 2) save(memory); return memory;
    }
    function save(s) { store.set('guidedStartState', {step:s.step, done:s.done, amount:s.amount, welcomed:s.welcomed, v:2}); }
    const active = () => {
        if (typeof game === 'undefined' || !enabled() || game.global.totalPortals !== 0) return false;
        return !state().done;
    };
    function build() {
        ring = document.createElement('div'); ring.id = 'mobile-guide-ring'; ring.setAttribute('aria-hidden', 'true');
        tail = document.createElement('div'); tail.id = 'mobile-guide-tail'; tail.setAttribute('aria-hidden', 'true');
        bubble = document.createElement('section'); bubble.id = 'mobile-guide'; bubble.setAttribute('aria-label', t('Guided start'));
        // Only the sentence is announced, once per new sentence; the counting progress line stays silent.
        text = document.createElement('p'); text.setAttribute('role', 'status'); line = document.createElement('p'); line.className = 'mobile-guide-progress';
        const row = document.createElement('div'); row.className = 'mobile-guide-row';
        count = document.createElement('span'); count.className = 'mobile-guide-step';
        skip = document.createElement('button'); skip.type = 'button'; skip.onclick = () => pass();
        row.append(count, skip); bubble.append(text, line, row);
        for (const node of [ring, tail, bubble]) { node.hidden = true; document.body.append(node); }
        // The first step goes on with Next or with any tap on the work bar.
        byId('mobile-resource-actions')?.addEventListener('click', () => { if (active() && state().step === 0) { seen.bar = true; tick(); } }, true);
        addEventListener('scroll', place, {capture:true, passive:true}); addEventListener('resize', place);
        // An amount tab tapped by the player while the Trap tile is lit (the original #numTabs) is their choice.
        byId('numTabs')?.addEventListener('click', () => { if (active() && current?.amount) chosen = true; }, true);
    }
    function hide() { if (!ring) return; ring.hidden = tail.hidden = bubble.hidden = true; shown = ''; said = ''; lastRect = ''; document.body.removeAttribute('data-mobile-guide'); }
    const windowOpen = () => { const tip = byId('tooltipDiv'); return !!byId('customNumberBox') || (!!tip && getComputedStyle(tip).display !== 'none'); };
    // The amount is set while the Trap tile is lit: leaving a colony page resets the amount to 1 (mobile-ui.js), so it
    // is set again there, never while a window is open (numTab closes it). Given back when the step ends.
    function useAmount(s, n) {
        if (typeof numTab !== 'function' || windowOpen()) return;
        const had = !!s.amount; if (!takeAmount(game, s, numTab, n)) return; if (!had) save(s);
        const label = byId('tab5Text'); if (label && typeof prettify === 'function') label.textContent = '+' + prettify(n);
    }
    function giveAmount(s) {
        if (typeof numTab !== 'function' || !returnAmount(game, s, numTab)) return; save(s);
        const label = byId('tab5Text'); if (label && typeof prettify === 'function') label.textContent = '+' + prettify(game.global.lastCustomAmt);
    }
    let finishing=false;
    async function finish() {
        if(finishing)return;
        finishing=true;
        try{if(typeof MobileEarlyColony!=='undefined'&&!await MobileEarlyColony.completeTutorial())return;}
        finally{finishing=false;}
        const s = state(); s.done = true; s.step = steps.length; giveAmount(s); save(s); hide(); stop();
        // ADVISOR takes over as before: it opens now in the first run when its automatic tips are on.
        const auto = store.get('advisorAutoOpen', true) !== false;
        if (auto && game.global.totalPortals === 0 && !game.global.tutorialOpen && typeof tutorial !== 'undefined') tutorial.openWindow();
    }
    // Skip (Next on the first step): only this step; on the last one ("End tutorial") the guide ends as if it was done.
    function pass() {
        // The step the bubble shows, not one the game reached since the last check.
        const s = state(), at = current && current.at !== undefined ? current.at : next(game, s.step, seen); chosen = false;
        if (skipTo(s, at)) { finish(); return; }
        save(s); tick();
    }
    function restart() { const s = state(); s.done = false; s.step = 0; seen = {}; speed = null; current = null; chosen = false; save(s); store.set('guidedStart', true); resume(); }
    // V-245: the welcome of a new save, before the first step. It says what the game is about and, with the guide on, that a
    // short tutorial follows. Shown once per save (also when the app closes while it is open); the guide waits behind it.
    function welcome() {
        const s = state(); if (s.welcomed || game.global.totalPortals !== 0 || typeof tooltip !== 'function') return false;
        s.welcomed = true; save(s); welcoming = true;
        if (active() && game.global.tutorialOpen && typeof tutorial !== 'undefined') tutorial.closeWindow();
        // V-262: short enough for 360 x 640 px with 130 % text, the button in view without scrolling (mobile-guided-start.css).
        const paragraphs = ['Your Scruffies have landed on a wild planet. Gather resources, build up your colony and fight your way from zone to zone. Research and equipment make you stronger.',
            ...(active() ? ['A short tutorial now shows you the first steps up to the first fight. You can skip any step.'] : []),
            'You play offline. Backup and import are under More.'];
        tooltip('confirm', null, 'update', '<div id="mobile-welcome">' + paragraphs.map(p => '<p>' + t(p) + '</p>').join('') + '</div>', '', t('Welcome to Scruffy Colony'), t("Let's go"), false, true);
        return true;
    }
    const visible = node => !!node && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
    // The control to light up: the target when it is on screen, else the navigation button of its page.
    function resolve(target) {
        const [page, id, card] = target, node = byId(id);
        if (visible(node)) return {node:card ? node.closest(card) || node : node, nav:false};
        const nav = page && byId('mobile-nav-' + page);
        if (nav && visible(nav) && nav.getAttribute('aria-current') !== 'page') return {node:nav, nav:true};
        return {node:null, nav:false};
    }
    // A control under the fixed header or navigation (e.g. Fight below the combat grid) scrolls to the middle.
    function reveal(node) {
        const r = node.getBoundingClientRect(), top = byId('mobile-header')?.getBoundingClientRect().bottom ?? 0;
        const bottom = byId('mobile-nav')?.getBoundingClientRect().top ?? innerHeight;
        if (r.top < top || r.bottom > bottom) node.scrollIntoView?.({block:'center'});
    }
    let current = null;
    function tick() {
        if (typeof mobileRuntimeSuspended !== 'undefined' && mobileRuntimeSuspended) { suspend(); return; }
        if (speed && speed.suspended) { activeElapsed(speed, performance.now(), true); return; }
        if (typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready && !TrimpsMobile.ready()) return;
        if (typeof game === 'undefined') return;
        // The welcome comes first; the light waits while it is open.
        if (welcoming) { if (windowOpen()) { hide(); return; } welcoming = false; }
        else if (welcome()) { hide(); return; }
        // Finished, skipped, switched off or a later run: the player's amount comes back and the check stops.
        if (!active()) { giveAmount(state()); hide(); stop(); return; }
        if (!ring) build();
        const s = state(), at = next(game, s.step, seen);
        if (at >= steps.length) { finish(); return; }
        if (at !== s.step) { s.step = at; chosen = false; save(s); }
        // V-255: the speed-up of the food and wood steps, with the original addResCheckMax (the original's own gathering);
        // like the original's gathering it waits while the game is paused. Another save, a restart or the guide switched
        // off start it over (speed = null in state(), restart() and stop()).
        const kind = steps[at].speed, now = performance.now(), speeding = !!kind && game.global.playerGathering === kind && !game.options.menu.pauseGame.enabled;
        if (!speed || speed.at !== at) speed = {at, ms:0, t:now};
        const elapsed = activeElapsed(speed, now, false);
        if (speeding) { const add = speedUp(speed, res(game, kind), steps[at].goal(game), elapsed); if (add > 0 && typeof addResCheckMax === 'function') addResCheckMax(kind, add); }
        // More (saves, settings, help) is the player's own business: light and bubble step aside there and come back with the
        // game; only the last step, which leads to More, stays (seen on the phone: the bubble covered the save list).
        if (at < steps.length - 1 && byId('mobile-more-button')?.getAttribute('aria-expanded') === 'true') { hide(); current = null; return; }
        // ADVISOR waits while the guided start runs (also after a restart from Help); the gold star still opens it by hand.
        if (game.global.tutorialOpen && !current && typeof tutorial !== 'undefined') tutorial.closeWindow();
        const own = steps[at].show(game), view = speeding && speed.ms >= SPEED_WAIT ? {...own, text:"Let's speed this up."} : own, where = resolve(view.target), keep = view.keep ? resolve(view.keep) : null;
        // Set again after a reset by a page change; once the player taps an amount tab themselves, their choice stays.
        if (!view.amount) giveAmount(s);
        else if (where.node && where.node.contains(byId('Trap')) && !chosen) useAmount(s, view.amount);
        const message = t(view.text) + (where.nav ? ' ' + t('Open this page first.') : '');
        const progress = view.progress ? t(view.progress[0]) + ' ' + Math.min(Math.floor(view.progress[1]), view.progress[2]) + ' / ' + view.progress[2] : '';
        const key = at + '|' + message + '|' + progress;
        if (key !== shown) {
            shown = key; line.textContent = progress; line.hidden = !progress;
            if (message !== said) { said = message; text.textContent = message; }
            count.textContent = t('Step ' + (at + 1) + ' of ' + steps.length); skip.textContent = t(steps[at].next ? 'Next' : steps[at].end ? 'End tutorial' : 'Skip');
            if (where.node && !where.nav && (!current || current.node !== where.node)) reveal(where.node);
        }
        // V-249: light, bubble and tail glide only when the step changes; on scroll and resize they stay on the control.
        if (at !== glideAt) { glideAt = at; clearTimeout(glideTimer); for (const node of [ring, bubble, tail]) node.classList.add('mobile-guide-glide');
            glideTimer = setTimeout(() => { for (const node of [ring, bubble, tail]) node.classList.remove('mobile-guide-glide'); }, 400); }
        current = {...where, at, amount:view.amount, keep:keep && !keep.nav ? keep.node : null};
        bubble.hidden = false; document.body.setAttribute('data-mobile-guide', String(at + 1)); place();
    }
    // Light and bubble follow the control on scroll, resize and every check; the light never takes a tap. The bubble sits
    // below or above the lit control, else above the navigation or under the header, and never over the step's real goal
    // (the card a missing resource is gathered for).
    function place() {
        if (!ring || bubble.hidden) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            const node = current && current.node, navTop = byId('mobile-nav')?.getBoundingClientRect().top ?? innerHeight;
            const headBottom = byId('mobile-header')?.getBoundingClientRect().bottom ?? 0;
            const r = node && node.isConnected ? node.getBoundingClientRect() : null;
            const k = current && current.keep && current.keep.isConnected && visible(current.keep) ? current.keep.getBoundingClientRect() : null;
            const key = [r, k].map(q => q ? [q.left, q.top, q.width, q.height].map(Math.round).join() : 'none').join('|') + '|' + Math.round(navTop) + '|' + bubble.offsetHeight;
            if (key === lastRect) return; lastRect = key;
            ring.hidden = !r; tail.hidden = true;
            const gap = 4, h = bubble.offsetHeight, margin = 12;
            if (r) Object.assign(ring.style, {left:r.left - gap + 'px', top:r.top - gap + 'px', width:r.width + 2 * gap + 'px', height:r.height + 2 * gap + 'px'});
            const clear = (top, q) => !q || top + h <= q.top - gap || top >= q.bottom + gap;
            const fits = top => top >= margin && top + h <= navTop - margin && clear(top, k);
            const below = r && r.bottom + 14, above = r && r.top - 14 - h;
            let top, side = '';
            if (r && fits(below)) { top = below; side = 'below'; }
            else if (r && fits(above)) { top = above; side = 'above'; }
            else top = [navTop - margin - h, headBottom + margin].find(y => fits(y) && clear(y, r)) ?? Math.max(margin, navTop - margin - h);
            bubble.style.top = top + 'px';
            if (side) {
                tail.hidden = false; tail.dataset.side = side; tail.style.top = (side === 'below' ? r.bottom + 7 : r.top - 21) + 'px';
                tail.style.left = Math.min(Math.max(r.left + r.width / 2 - 8, margin + 8), innerWidth - margin - 24) + 'px';
            }
        });
    }
    // The original starts ADVISOR by itself with Battle's unlock (trigger "Battle" at the first science → tutorial.start);
    // during the guided start it is started closed, the gold star opens it as usual.
    if (typeof tutorial !== 'undefined' && typeof tutorial.start === 'function') {
        const original = tutorial.start;
        tutorial.start = function () { const result = original.apply(this, arguments); if (active() && game.global.tutorialOpen) this.closeWindow(); return result; };
    }
    // The first check follows the game's start at once, so ADVISOR (which a new game opens) never shows under the light.
    function start() {
        const ready = () => typeof TrimpsMobile === 'undefined' || !TrimpsMobile.ready || TrimpsMobile.ready();
        const boot = setInterval(() => { if (!ready()) return; clearInterval(boot); resume(); }, 50);
    }
    // The check runs only while the guided start or its welcome can show; Help and the Quality of life switch resume it.
    function suspend() { if (speed) suspendClock(speed, performance.now()); }
    function resume() { if (speed) activeElapsed(speed, performance.now(), true); if (!timer) timer = setInterval(tick, 400); tick(); }
    function stop() { clearInterval(timer); timer = 0; speed = null; }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
    return {active, restart, suspend, resume, enabled, steps, next, fresh, total:steps.length, tick, lit:() => (current && current.node) || null};
})();
if (typeof module !== 'undefined') module.exports = MobileGuidedStart;
