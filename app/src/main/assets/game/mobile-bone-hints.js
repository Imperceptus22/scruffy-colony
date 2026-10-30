// V-202 (user, 27.10.2026: building blocks 1, 3 and 4): the Bone Trader becomes visible in play. A small bone tag hangs
// under the header on every page, a short note follows each bone find, and the Time Portal review lists the bones. Single
// run bonuses bought before a portal end with that run (resetGame keeps only bones, Imp-orts and permanent bonuses), so
// the portal offers the trader only after the start: the first note of the new run. Everything appears only once the original shows its Bone Trader button (boneBtnContainer) and
// opens the trader through the original button; costs, sources and purchases stay with the original game.
var MobileBoneHints = (() => {
    const byId = id => document.getElementById(id);
    const bones = () => Number(game.global.b) || 0;
    // The original shows its button after every load, even in a brand-new game; like the unlock catalog (boneTrader),
    // the hints wait until bones exist or were ever spent on Imp-orts, so a new player sees no empty "0" tag.
    const unlocked = () => { const box = byId('boneBtnContainer');
        return !!box && box.style.display !== 'none' && (bones() > 0 || Object.values(game.unlocks?.imps || {}).some(Boolean)); };
    const count = n => (typeof prettify === 'function' ? prettify(n) : String(n));
    const plural = n => n === 1 ? ' bone' : ' bones';
    // More → Game → Quality of life switches the find note and the portal row off; the tag is a display, not a hint.
    const hintsOn = () => typeof MobileQolStore === 'undefined' || MobileQolStore.get('boneHints', true) !== false;
    // V-237: labels rewritten on every sync are written translated (mobile-i18n.js), so they are not changed back and forth.
    const t = text => typeof MobileI18n === 'undefined' ? text : MobileI18n.t(text);
    const open = () => { hideNote(); byId('boneBtnMain')?.click(); };
    let tag, note, jarRing, jarProp, noteTimer = 0, seenGlobal = null, seenBones = 0;
    // V-272: the Diorama combat scene mirrors the enemy to the Scruffies (mobile-diorama-page-battle.css). The tag only
    // reaches into the top of the figure, so only the picture rows at the tag's height have to stay left of it: the opaque
    // extent of every row (alpha above 24) is read once per picture, and --dio-tag-clear moves the figure left by just as much
    // as those rows need (0 when they clear the tag). The rows below may stand under the tag.
    const profiles = new Map();
    function profile(src) {
        if (!profiles.has(src)) profiles.set(src, new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                try {
                    const w = img.naturalWidth, h = img.naturalHeight, canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    const context = canvas.getContext('2d', {willReadFrequently:true}); context.drawImage(img, 0, 0);
                    const data = context.getImageData(0, 0, w, h).data, rows = [];
                    for (let y = 0; y < h; y++) {
                        let left = -1, right = -1;
                        for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 24) { if (left < 0) left = x; right = x + 1; }
                        rows.push(left < 0 ? null : [left, right]);
                    }
                    resolve({w, h, rows});
                } catch { resolve(null); }
            };
            img.onerror = () => resolve(null);
            img.src = src;
        }));
        return profiles.get(src);
    }
    // How many px the figure moves left so that no opaque pixel of the rows at the tag's height lies under the tag (3px air
    // beside it, 1px above and below).
    // box: the figure's box without the move; the picture is contained and centred in it (mobile-design.js), mirror flips it
    // about the box centre (data-mirror).
    function tagClearance(p, box, tagRect, mirror) {
        const k = Math.min((box.right - box.left) / p.w, (box.bottom - box.top) / p.h);
        const left = box.left + (box.right - box.left - p.w * k) / 2, top = box.top + (box.bottom - box.top - p.h * k) / 2;
        let reach = -Infinity;
        for (let y = Math.max(0, Math.floor((tagRect.top - 1 - top) / k)); y < Math.min(p.h, Math.ceil((tagRect.bottom + 1 - top) / k)); y++) {
            const row = p.rows[y]; if (!row) continue;
            reach = Math.max(reach, mirror ? box.left + box.right - (left + row[0] * k) : left + row[1] * k);
        }
        return reach === -Infinity ? 0 : Math.max(0, Math.ceil(reach + 3 - tagRect.left));
    }
    // The box never starts more than 8px left of the scene centre (duel mark, mobile-diorama-page-battle.css). Where a wide
    // tag and a narrow or large-font scene leave less room, the figure gets shorter (its feet stay), down to 60 %, until its
    // rows at the tag's height clear the tag.
    function enemyFit(p, box, tagRect, centre, mirror) {
        const room = Math.max(0, Math.floor(box.left - (centre - 8)));
        for (let scale = 1; scale >= .6; scale = Math.round((scale - .05) * 100) / 100) {
            const shift = tagClearance(p, {left:box.left, right:box.right, top:box.bottom - (box.bottom - box.top) * scale, bottom:box.bottom}, tagRect, mirror);
            if (shift <= room) return {shift, scale};
        }
        return {shift:room, scale:.6};
    }
    let fitRun = 0, watched = false;
    const clearFit = node => { node.style.removeProperty('--dio-tag-clear'); node.style.removeProperty('--dio-tag-fit'); };
    async function fitEnemy() {
        const node = byId('mobile-enemy-art'), scene = byId('mobile-combat-scene'), run = ++fitRun;
        if (!node || !scene || !tag) return;
        const src = /^url\("?([^")]+)"?\)$/.exec(node.style.backgroundImage || '')?.[1];
        if (document.documentElement.dataset.graphics !== 'diorama' || tag.hidden || !src) { clearFit(node); return; }
        const p = await profile(src);
        if (run !== fitRun) return;
        // No profile (the image failed to load): no values of the previous enemy stay behind.
        if (!p) { clearFit(node); return; }
        // Measured without the move (same task, so nothing is painted in between); the move itself never changes the size
        // of the tag or the scene, so it triggers no new fit.
        clearFit(node);
        const b = node.getBoundingClientRect(), t = tag.getBoundingClientRect(), s = scene.getBoundingClientRect();
        if (!b.width || !t.width) return;
        const fit = enemyFit(p, b, t, s.left + s.width / 2, node.hasAttribute('data-mirror'));
        if (fit.shift) node.style.setProperty('--dio-tag-clear', fit.shift + 'px');
        if (fit.scale < 1) node.style.setProperty('--dio-tag-fit', String(fit.scale));
    }
    // The tag changes width with its text and the font size; the scene with the page, the width and the style; the figure
    // with every enemy (mobile-design.js writes its picture and data-mirror). Writes of --dio-tag-clear are no new enemy.
    // The scene comes from mobile-design.js, a later script: start() waits for the document when it runs earlier.
    function watchScene() {
        const node = byId('mobile-enemy-art'), scene = byId('mobile-combat-scene');
        if (watched || !tag || !node || !scene || typeof ResizeObserver === 'undefined') return;
        watched = true;
        let seen = '';
        const sizes = new ResizeObserver(() => { fitEnemy(); }); sizes.observe(tag); sizes.observe(scene);
        new MutationObserver(() => { const key = node.style.backgroundImage + '|' + node.hasAttribute('data-mirror'); if (key !== seen) { seen = key; fitEnemy(); } })
            .observe(node, {attributes:true, attributeFilter:['style', 'data-mirror']});
        new MutationObserver(() => { fitEnemy(); }).observe(document.documentElement, {attributes:true, attributeFilter:['data-graphics']});
    }
    function syncTag() {
        if (!tag) return;
        const show = unlocked();
        tag.hidden = !show;
        watchScene();
        const text = String(count(bones()));
        if (!show) { syncJarProp(null); return; }
        if (tag.lastChild.textContent !== text) tag.lastChild.textContent = text;
        // Bone Jar (decision 28.10.2026): a thin fill line along the tag, the tag glows while the jar is full.
        const jar = typeof MobileBoneShop !== 'undefined' && MobileBoneShop.jarInfo ? MobileBoneShop.jarInfo() : null, shown = !!(jar && jar.available);
        jarRing.hidden = !shown;
        if (shown) jarRing.style.setProperty('--jar', Math.round(jar.fill / jar.size * 100) + '%');
        tag.toggleAttribute('data-jar-full', shown && jar.stage === 2);
        tag.setAttribute('aria-label', t('Bone Trader · ' + text + plural(bones()) + (shown ? ' · Bone Jar ' + jar.fill + ' of ' + jar.size : '')));
        syncJarProp(shown && jar);
    }
    // Bone Jar in the colony scene (MALAUFTRAG C, Diorama Resources only by style sheet): shown with the tag while the jar
    // is offered; stage 0 and 1 show the shop jar small, the full jar the scene prop. A tap opens the packs.
    function syncJarProp(jar) {
        if (!jarProp) return;
        jarProp.hidden = !jar;
        if (!jar) return;
        const src = jar.stage === 2 ? 'mobile-assets/diorama/S13-bone-jar.webp' : MobileBoneShop.jarPicture(jar.stage);
        if (jarProp.dataset.stage !== String(jar.stage)) { jarProp.dataset.stage = String(jar.stage); jarProp.style.setProperty('--jar-art', 'url("' + src + '")'); }
        jarProp.setAttribute('aria-label', t('Bone Jar · ' + jar.fill + ' of ' + jar.size + (jar.stage === 2 ? ' · full' : '') + ' · open Get bones'));
    }
    function hideNote() { if (note) note.hidden = true; clearTimeout(noteTimer); noteTimer = 0; }
    // One note per occasion: a second one while it shows replaces its text and restarts its time.
    // V-263: a bone find shows 3 s (also while touched); New run and the full Bone Jar keep 12 s.
    const FIND_MS = 3000, NOTE_MS = 12000;
    function showNote(heading, detail, ms = NOTE_MS) {
        if (!note) {
            note = document.createElement('div'); note.id = 'mobile-bone-note'; note.setAttribute('role', 'status');
            const icon = document.createElement('span'); icon.className = 'mobile-bone-note-icon'; icon.setAttribute('aria-hidden', 'true');
            const text = document.createElement('div'); text.className = 'mobile-bone-note-text';
            text.append(document.createElement('strong'), document.createElement('span'));
            const go = document.createElement('button'); go.className = 'mobile-bone-note-open'; go.textContent = 'Bone Trader'; go.onclick = open;
            const close = document.createElement('button'); close.className = 'mobile-bone-note-close'; close.textContent = '×';
            close.setAttribute('aria-label', 'Close'); close.onclick = hideNote;
            note.append(icon, text, go, close); document.body.append(note);
        }
        const [title, line] = note.querySelector('.mobile-bone-note-text').children;
        title.textContent = heading; line.textContent = detail;
        note.hidden = false; clearTimeout(noteTimer); noteTimer = setTimeout(hideNote, ms);
    }
    // A load or a portal replaces game.global (resetGame → newGame), so only a rise within the same run object is a find.
    function check() {
        const now = bones();
        if (game.global !== seenGlobal) { seenGlobal = game.global; seenBones = now; syncTag(); return; }
        if (now > seenBones && unlocked() && hintsOn()) showNote('+' + count(now - seenBones) + plural(now - seenBones) + ' found', count(now) + plural(now) + ' in total', FIND_MS);
        // After the find note, so a jar that fills up with this find replaces it with its own note (review).
        if (now > seenBones && typeof MobileBoneShop !== 'undefined') MobileBoneShop.found(now - seenBones);
        seenBones = now; syncTag();
    }
    function start() {
        tag = document.createElement('button'); tag.id = 'mobile-bone-tag'; tag.type = 'button'; tag.hidden = true;
        const icon = document.createElement('span'); icon.className = 'mobile-bone-tag-icon'; icon.setAttribute('aria-hidden', 'true');
        jarRing = document.createElement('span'); jarRing.className = 'mobile-bone-tag-jar'; jarRing.setAttribute('aria-hidden', 'true'); jarRing.hidden = true;
        tag.append(icon, jarRing, document.createElement('span')); tag.onclick = open;
        byId('mobile-header').append(tag);
        jarProp = document.createElement('button'); jarProp.id = 'mobile-bone-jar-prop'; jarProp.type = 'button'; jarProp.hidden = true;
        jarProp.onclick = () => { open(); if (typeof MobileBones !== 'undefined' && MobileBones.openShop) MobileBones.openShop(); };
        document.body.append(jarProp);
        // updateSkeleBtn writes the button text after every change of bones and shows the button on unlock.
        const observer = new MutationObserver(check);
        const text = byId('boneBtnText'), box = byId('boneBtnContainer');
        if (text) observer.observe(text, {childList:true, characterData:true, subtree:true});
        if (box) observer.observe(box, {attributes:true, attributeFilter:['style']});
        // Every start of a new run (portal review footer, original confirmation, Perky) goes through activatePortal; it
        // closes the portal window only when the run really starts.
        if (typeof activatePortal === 'function') {
            const portal = activatePortal;
            activatePortal = function () { const open = portalWindowOpen; const result = portal.apply(this, arguments); if (open && !portalWindowOpen) newRun(); return result; };
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchScene);
        check();
    }
    // Portal review row: the bones only, no purchase before the portal; nothing before the unlock or with hints off.
    function reviewRow(make) {
        if (!unlocked() || !hintsOn()) return null;
        return make(t('Bones'), t(count(bones()) + plural(bones()) + ' · run bonuses after the start'));
    }
    // After a successful portal start (activatePortal above): now run bonuses last for the whole new run.
    function newRun() {
        if (unlocked() && hintsOn() && bones() > 0) showNote('New run', count(bones()) + plural(bones()) + ' for run bonuses');
    }
    // Bones granted outside a find (e.g. a later bone pack purchase) call this first, so they are not reported as found.
    function resync() { seenBones = bones(); syncTag(); }
    // The Bone Jar filled up: one note, only after the unlock and with hints on; true when it was shown.
    function jarFull() {
        if (!unlocked() || !hintsOn()) return false;
        const jar = typeof MobileBoneShop !== 'undefined' && MobileBoneShop.jarInfo ? MobileBoneShop.jarInfo() : null;
        // Opening is a purchase: the note names it and its price (EU principles on in-game currencies).
        showNote('Your Bone Jar is full', '150 bones for ' + (jar && jar.price ? jar.price : 'a purchase') + ' under Get bones'); return true;
    }
    return {start, check, reviewRow, newRun, resync, hideNote, jarFull, sync:syncTag, enemyFit, tagClearance};
})();
if (typeof module !== 'undefined') module.exports = MobileBoneHints;
