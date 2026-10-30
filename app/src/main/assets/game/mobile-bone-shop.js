// V-220: bone packs through Google Play. Prices always come from Play, never from this file;
// the native shop (BoneShop.kt) sends a grant only for a purchase Play reports as purchased. The bones are written through
// TrimpsMobile.applySaveChange, the durable save transaction (locked during slot switches, imports, other changes, Time
// Warp and pause): only a committed save with the bones is confirmed, so the purchase is consumed only then. Until the
// change goes through, it is tried again every few seconds. Without Play the Get bones tab says so.
// V-201 step 2: bones_120 holds 130 bones; the first purchase of each consumable pack counts twice (decided natively);
// the one-time Starter and Supporter packs stay owned for the Play account ("entitled") and are offered until owned.
var MobileBoneShop = (() => {
    const packs = {bones_25:25, bones_120:130, bones_300:300, bones_700:700, starter_pack:100, supporter_pack:150, bone_jar:150};
    const oneTime = {starter_pack:'Starter pack', supporter_pack:'Supporter pack'};
    // Bone Jar (decision 28.10.2026): every bone found adds 4 to the jar on this device, up to 150; opened only when full,
    // as a purchase of bone_jar whose 150 bones the native shop credits. Bought bones never fill it; nothing expires.
    const JAR = 'bone_jar', jarSize = 150, jarPerBone = 4, jarKey = 'scruffy-colony-bone-jar';
    const readJar = () => { try { const n = Number(localStorage.getItem(jarKey)); return Number.isFinite(n) && n > 0 ? Math.min(jarSize, Math.floor(n)) : 0; } catch (_) { return 0; } };
    const writeJar = n => { try { localStorage.setItem(jarKey, String(n)); } catch (_) {} };
    // The "jar is full" note shows once per filling (decision 28.10.2026, switchable with the bone hints).
    const noted = () => { try { return localStorage.getItem(jarKey + '-noted') === '1'; } catch (_) { return true; } };
    const setNoted = on => { try { localStorage.setItem(jarKey + '-noted', on ? '1' : '0'); } catch (_) {} };
    let products = [], state = 'off', note = '', started = false, busy = false, buying = false, lastBuy = '', jar = readJar();
    const queue = [], handled = new Set(), entitled = new Set();
    let panel = null;
    const post = message => { try { TrimpsShop.postMessage(JSON.stringify(message)); return true; } catch (_) { return false; } };
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    function start() {
        if (started || typeof TrimpsShop === 'undefined') return;
        started = true; state = 'loading';
        TrimpsShop.onmessage = event => receive(event.data);
        hello();
    }
    // The first message waits for a loaded game, so a grant never lands before the save it belongs to.
    function hello() {
        if (typeof TrimpsMobile !== 'undefined' && TrimpsMobile.ready()) { if (!post({type:'hello'})) state = 'off'; changed(); }
        else setTimeout(hello, 1000);
    }
    function receive(raw) {
        let message; try { message = JSON.parse(raw); } catch (_) { return; }
        switch (message.event) {
            case 'products':
                products = (Array.isArray(message.products) ? message.products : [])
                    .filter(p => packs[p.id] && packs[p.id] === p.bones && typeof p.price === 'string' && p.price.length < 40)
                    .map(p => ({id:p.id, bones:p.bones, price:p.price, oneTime:Boolean(oneTime[p.id]), bonus:!oneTime[p.id] && p.bonus === true,
                        micros:Number.isSafeInteger(p.micros) && p.micros > 0 ? p.micros : 0, currency:/^[A-Z]{3}$/.test(p.currency) ? p.currency : ''}))
                    .sort((a, b) => a.oneTime - b.oneTime || a.bones - b.bones);
                state = products.length ? 'ready' : 'off';
                // A jar that filled up while the product was unavailable gets its note now (review).
                if (jar >= jarSize && jarInfo().available && !noted() && typeof MobileBoneHints !== 'undefined' && MobileBoneHints.jarFull && MobileBoneHints.jarFull()) setNoted(true);
                break;
            case 'unavailable': state = 'off'; break;
            case 'grant':
                // A one-time pack brings exactly its bones; a consumable pack a multiple (quantity, first-purchase bonus).
                if (typeof message.token === 'string' && message.token && !handled.has(message.token) && packs[message.product]
                    && Number.isInteger(message.bones) && message.bones > 0 && message.bones % packs[message.product] === 0
                    && (!oneTime[message.product] || message.bones === packs[message.product])) {
                    handled.add(message.token); queue.push(message); drain();
                }
                break;
            case 'entitled': if (oneTime[message.product]) { entitled.add(message.product); if (lastBuy === message.product && !buying) note = ''; } break;
            case 'pending': buying = false; note = 'Your purchase is pending. The bones arrive as soon as Google Play confirms the payment.'; break;
            case 'canceled': buying = false; note = 'Purchase canceled. No bones were added.'; break;
            case 'error': buying = false; note = 'Google Play could not complete the purchase. No bones were added.'; break;
            case 'owned': buying = false; note = oneTime[lastBuy] ? 'This pack already belongs to your Google account.'
                : 'An earlier purchase of this pack is still being completed. Its bones arrive in a moment; then you can buy it again.'; break;
        }
        changed();
    }
    async function drain() {
        if (busy) return; busy = true;
        // A locked transaction (pause, slot switch …) is tried again after 5 s; repeated failures wait longer (up to a
        // minute), so a lasting save problem does not pause the game every few seconds.
        let delay = 5000;
        try {
            while (queue.length) {
                const grant = queue[0];
                if (await credit(grant)) { queue.shift(); delay = 5000; } else { await wait(delay); delay = Math.min(60000, delay * 2); }
            }
        } finally { busy = false; }
    }
    async function credit(grant) {
        let saved = false;
        try {
            saved = await TrimpsMobile.applySaveChange(data => {
                if (!data || !data.global || typeof data.global.b !== 'number') return false;
                data.global.b += grant.bones; return true;
            }, 'Bone purchase', {token:grant.token, product:grant.product, bonus:grant.bonus === true});
        } catch (_) {}
        if (!saved) {
            note = 'Your purchase is safe with Google Play. The bones are added as soon as the game runs and can be saved (not while paused or during offline progress).';
            changed(); return false;
        }
        synced();
        post({type:'credited', token:grant.token});
        buying = false; note = '';
        if (grant.bonus === true) { const pack = products.find(p => p.id === grant.product); if (pack) pack.bonus = false; }
        if (grant.product === JAR) { jar = 0; writeJar(0); setNoted(false); }
        changed();
        const what = grant.product === JAR ? 'Your Bone Jar brought ' + prettify(grant.bones) + ' bones'
            : oneTime[grant.product] ? 'Your ' + oneTime[grant.product] + ' brought ' + prettify(grant.bones) + ' bones'
            : 'Your purchase of ' + prettify(grant.bones) + ' bones' + (grant.bonus === true ? ' (first-purchase bonus included)' : '') + ' was successful';
        // V-237: the info window lies outside the translated interface, so its text is translated here (mobile-i18n.js).
        const t = text => typeof MobileI18n === 'undefined' ? text : MobileI18n.t(text);
        TrimpsUI.infoText(t('Bones added'), t(what + ' – you now have ' + prettify(game.global.b) + ' bones. '
            + 'Bones belong to this save on this device: export a backup under More → Saves & backups to keep them safe.'));
        return true;
    }
    // Bone count, the bone tag (no find note for bought bones) and the open trader follow the new count.
    function synced() {
        if (typeof MobileBoneHints !== 'undefined') MobileBoneHints.resync();
        if (typeof bonesShown !== 'undefined' && bonesShown && typeof updateBones === 'function') updateBones();
        if (typeof MobileBones !== 'undefined') MobileBones.refresh();
    }
    function buy(id, shown) {
        if (buying) return;
        const current = products.find(p => p.id === id);
        if (state !== 'ready' || !current || (shown && ['id', 'bones', 'price', 'bonus'].some(key => shown[key] !== current[key]))) {
            note = 'This offer is no longer available. Please check the current packs and prices.';
            changed(); return;
        }
        if (id === JAR && jar < jarSize) return;
        buying = true; note = ''; lastBuy = id;
        if (!post({type:'buy', product:id})) { buying = false; note = 'Google Play could not complete the purchase. No bones were added.'; }
        changed();
    }
    // Smallest consumable pack that covers what is missing for a price, or the largest one (quiet, no
    // pressure). The one-time packs are not offered here.
    function packFor(missing) {
        if (state !== 'ready' || missing <= 0) return null;
        const bones = products.filter(p => !p.oneTime && p.id !== JAR);
        return bones.find(p => p.bones >= missing) || bones[bones.length - 1] || null;
    }
    // A bone found in play (MobileBoneHints: a rise of the count within the same run, never a purchase) fills the jar.
    function found(count) {
        if (!Number.isInteger(count) || count <= 0 || jar >= jarSize) return;
        jar = Math.min(jarSize, jar + count * jarPerBone); writeJar(jar); render();
        if (jar >= jarSize && jarInfo().available && !noted() && typeof MobileBoneHints !== 'undefined' && MobileBoneHints.jarFull && MobileBoneHints.jarFull()) setNoted(true);
    }
    // Shown only where the jar can really be opened (Play products loaded): the bone tag ring and the Get bones card.
    function jarInfo() {
        const pack = state === 'ready' ? products.find(p => p.id === JAR) : null;
        return {available: !!pack, price: pack ? pack.price : '', fill: jar, size: jarSize,
            stage: jar >= jarSize ? 2 : jar >= jarSize / 3 ? 1 : 0};
    }
    // Real-money value of a bone price (CPC principles 2025): the range between the dearest and the cheapest bone of the
    // repeatable packs at the Play prices, without first-purchase bonus, one-time packs or jar. Empty without Play prices.
    let rate = {list:null};
    function rates() {
        if (rate.list === products) return rate;
        rate = {list:products};
        const repeatable = products.filter(p => !p.oneTime && p.id !== JAR);
        if (!repeatable.length || repeatable.some(p => !p.micros || !p.currency || p.currency !== repeatable[0].currency)) return rate;
        try { rate.format = new Intl.NumberFormat(undefined, {style:'currency', currency:repeatable[0].currency}); } catch (_) { return rate; }
        const each = repeatable.map(p => p.micros / 1e6 / p.bones);
        rate.low = Math.min(...each); rate.high = Math.max(...each);
        return rate;
    }
    function money(bones) {
        const {format, low:lowRate, high:highRate} = rates();
        if (!(bones > 0) || !format) return '';
        const low = lowRate * bones, high = highRate * bones;
        const [a, b] = [format.format(low), format.format(high)];
        // formatRange writes the currency symbol only once, which keeps the price column narrow.
        return '≈ ' + (a === b ? a : typeof format.formatRange === 'function' ? format.formatRange(low, high) : a + '–' + b);
    }
    const jarPicture = stage => 'mobile-assets/diorama/R10-bone-jar-' + stage + '.webp';
    // Show the value: what a pack pays for at the original prices (Bone Portal 100, run bonuses 20-25).
    function worth(bones) {
        const portals = Math.floor(bones / 100), runs = Math.floor((bones % 100) / 20), parts = [];
        if (portals) parts.push(portals + (portals === 1 ? ' Bone Portal' : ' Bone Portals'));
        if (runs) parts.push(runs + (runs === 1 ? ' run bonus' : ' run bonuses'));
        return parts.length ? 'Buys ' + parts.join(' + ') : '';
    }
    const thanks = 'Supporter · thank you for supporting Scruffy Colony!';
    // Shown before any purchase: where bones live, what cannot be restored, and that statutory rights stay untouched.
    const terms = 'Before you buy: bones belong to this save on this device. There is no cloud backup – uninstalling the app, clearing its data or losing the device without an exported backup loses them, and they cannot be restored automatically. Starter and Supporter packs stay owned on your Google account, but their bones are added only once. Your statutory rights, including withdrawal and warranty, are not affected. For refunds use Google Play or write to scruffycolony@it-solutions-kissing.de.';
    const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
    function render() {
        if (typeof MobileBoneHints !== 'undefined' && MobileBoneHints.sync) MobileBoneHints.sync();
        if (!panel) return;
        const intro = el('p', 'mobile-bone-shop-note');
        intro.textContent = state === 'ready' ? 'Bone packs are bought through Google Play. Bones go to this save at once.'
            : state === 'loading' ? 'Loading prices from Google Play …'
            : 'Buying bones is not available right now. It needs this app from Google Play and a Google account on this device.';
        const jarPack = state === 'ready' ? products.find(p => p.id === JAR) : null;
        const jarCard = jarPack ? (() => {
            const card = el('div', 'mobile-bone-offer mobile-bone-pack mobile-bone-jar'); card.dataset.pack = JAR;
            // Stage 0 (under a third), 1, 2 (full): the painted jar of that stage (MALAUFTRAG A, R10-bone-jar-0/1/2).
            const stage = jarInfo().stage; card.dataset.stage = String(stage);
            const pic = el('span', 'mobile-bone-pic'); pic.setAttribute('aria-hidden', 'true');
            pic.style.setProperty('--pic', 'url("' + jarPicture(stage) + '")');
            const full = jar >= jarSize, controls = el('div', 'mobile-bone-controls'), button = el('button', 'mobile-bone-buy', 'Buy');
            const shown = {...jarPack};
            button.disabled = buying || !full; button.onclick = () => buy(JAR, shown);
            button.setAttribute('aria-label', full ? 'Buy the Bone Jar: ' + jarSize + ' bones for ' + jarPack.price : 'Bone Jar not full yet');
            controls.append(button);
            const detail = el('p', 'mobile-bone-effect');
            detail.append(prettify(jar) + ' / ' + jarSize + ' bones', document.createElement('br'),
                'Fills by ' + jarPerBone + ' for every bone you find. When full, buy its ' + jarSize + ' bones through Google Play.');
            const meter = el('span', 'mobile-bone-jar-meter'); meter.setAttribute('role', 'progressbar'); meter.setAttribute('aria-label', 'Bone Jar');
            meter.setAttribute('aria-valuemin', '0'); meter.setAttribute('aria-valuemax', String(jarSize)); meter.setAttribute('aria-valuenow', String(jar));
            meter.style.setProperty('--fill', (jar / jarSize * 100).toFixed(1) + '%');
            card.append(pic, el('strong', '', 'Bone Jar'), el('span', 'mobile-bone-price', jarPack.price), detail, meter, controls);
            return card;
        })() : null;
        const cards = (state === 'ready' ? products : []).filter(pack => !entitled.has(pack.id) && pack.id !== JAR).map(pack => {
            const card = el('div', 'mobile-bone-offer mobile-bone-pack'); card.dataset.pack = pack.id;
            const pic = el('span', 'mobile-bone-pic'); pic.setAttribute('aria-hidden', 'true');
            pic.style.setProperty('--pic', 'url("' + (typeof MobileBones !== 'undefined' ? MobileBones.icon('boosts') : '') + '")');
            const controls = el('div', 'mobile-bone-controls'), button = el('button', 'mobile-bone-buy', 'Buy');
            const title = pack.oneTime ? oneTime[pack.id] : prettify(pack.bones) + ' Bones';
            button.setAttribute('aria-label', 'Buy ' + (pack.oneTime ? oneTime[pack.id] + ' with ' : '') + pack.bones + ' bones for ' + pack.price
                + (pack.bonus ? ', first purchase adds ' + pack.bones + ' bones' : ''));
            const shown = {...pack};
            button.disabled = buying; button.onclick = () => buy(shown.id, shown);
            controls.append(button);
            // What the pack contains, in plain words: one-time packs, the first-purchase bonus and what the bones buy.
            const lines = [];
            if (pack.id === 'starter_pack') lines.push('One-time · ' + prettify(pack.bones) + ' bones');
            // V-231: the only extra of the Supporter pack is shown in full here, so nothing is hidden behind the purchase.
            if (pack.id === 'supporter_pack') lines.push('One-time · ' + prettify(pack.bones) + ' bones + this thank-you line at the top of Get bones: “' + thanks + '”');
            if (pack.bonus) lines.push('First purchase: +' + prettify(pack.bones) + ' bones extra');
            const value = worth(pack.bones); if (value) lines.push(value);
            const detail = el('p', 'mobile-bone-effect');
            lines.forEach((line, i) => { if (i) detail.append(document.createElement('br')); detail.append(line); });
            card.append(pic, el('strong', '', title), el('span', 'mobile-bone-price', pack.price), detail, controls);
            if (pack.bonus) card.dataset.bonus = 'true';
            return card;
        });
        const badge = el('p', 'mobile-bone-supporter', thanks); badge.hidden = !entitled.has('supporter_pack');
        const status = el('p', 'mobile-bone-shop-status', note); status.hidden = !note; status.setAttribute('role', 'status');
        const info = el('p', 'mobile-bone-shop-terms', terms); info.id = 'mobile-bone-shop-terms'; info.tabIndex = -1;
        panel.replaceChildren(badge, ...(jarCard ? [jarCard] : []), ...cards, status, intro, info);
    }
    function changed() {
        render();
        if (typeof MobileBones !== 'undefined') MobileBones.refresh();
    }
    function attach(node) { panel = node; render(); }
    return {start, attach, packFor, buy, receive, worth, found, jarInfo, jarPicture, money, jar:() => jar, note:() => note, state:() => state, owned:id => entitled.has(id), available:() => typeof TrimpsShop !== 'undefined'};
})();
if (typeof module !== 'undefined') module.exports = MobileBoneShop;
