// Presentation adapter: original costs, eligibility and confirmation handlers remain authoritative.
var MobileBones = (() => {
    const byId = id => document.getElementById(id);
    // Offer symbols (Diorama only; Previous graphics hides .mobile-bone-pic). Keys are the original bonus keys.
    const D = 'mobile-assets/diorama/', icons = {boneportal:D+'B05-Gateway.webp',
        goldMaps:'mobile-assets/diorama-field/F16-unique-map.webp', quickTrimps:D+'B14-Nursery.webp', sharpTrimps:D+'E05-Dagger.webp',
        heliumy:D+'R07-Helium.webp', voidMaps:D+'M08-Void.webp', boosts:D+'R09-Bones.webp', exotic:D+'B18-Trap.webp', multitasking:D+'J05-Trainer.webp'};
    const icon = key => icons[key] || D + 'R09-Bones.webp';
    // Imp-ort portraits follow the original badGuys key (row id), never the displayed name.
    const portrait = key => (typeof MobileEnemyArt !== 'undefined' && MobileEnemyArt.get(key)?.src) || icon('boosts');
    // Prices of the original updateBoneBtnColors/purchaseMisc; display check only, purchase stays with the original handlers.
    const goodiePrices = [['heliumPurchaseBtn',100]];
    let selected = 'imports', offers = 'imports', panels, tabs, bar, back, shopStatus;
    // V-224: bones can be bought for real money (V-220), so the random-rarity Heirloom for 30 bones is no longer sold.
    // The original purchaseMisc('heirloom') is refused here; Heirlooms from Void Maps and existing ones stay untouched.
    if (typeof purchaseMisc === 'function') {
        const originalPurchaseMisc = purchaseMisc;
        purchaseMisc = function (what) { if (what !== 'heirloom') return originalPurchaseMisc.apply(this, arguments); };
    }
    // V-237: texts that are compared again or painted from an attribute are written translated (mobile-i18n.js).
    const t = text => typeof MobileI18n === 'undefined' ? text : MobileI18n.t(text);
    const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
    function infoButton(title, text) {
        const button = document.createElement('button');
        button.className = 'mobile-info'; button.textContent = 'Info';
        button.setAttribute('aria-label', 'Info ' + title);
        button.onclick = () => TrimpsUI.infoText(title, typeof text === 'function' ? text() : text);
        return button;
    }
    // Picture with an optional slanted status stamp; the stamp word is painted from data-stamp (Diorama CSS).
    function picture(src, stamp) {
        const pic = el('span', 'mobile-bone-pic'); pic.setAttribute('aria-hidden', 'true');
        pic.style.setProperty('--pic', 'url("' + src + '")');
        if (stamp) pic.dataset.stamp = t(stamp); else delete pic.dataset.stamp;
        return pic;
    }
    // Owned/active/max: the action keeps its word and gains a check mark class; colour is never the only signal.
    function mark(button, done, locked) {
        button.classList.toggle('mobile-bone-done', !!done); button.classList.toggle('mobile-bone-locked', !done && !!locked);
    }
    function select(name) {
        selected = name; if (name !== 'shop') offers = name;
        for (const [key, panel] of Object.entries(panels)) panel.hidden = key !== name;
        tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-selected', String(button.dataset.panel === name)));
        if (back) back.hidden = name !== 'shop';
        strip();
    }
    // V-229 (Diorama, user choice A + D): Get bones is a gold button beside the plaque and in the following strip instead
    // of a fourth tab; it opens the packs as their own view with Back. Classic keeps the tab (mobile.css hides these).
    function openShop() {
        select('shop');
        const wrapper = byId('boneWrapper'), scene = wrapper.querySelector('.mobile-bone-scene');
        const below = scene.getBoundingClientRect().bottom - wrapper.getBoundingClientRect().top;
        if (below < 0) wrapper.scrollTop += below;
    }
    // Only bones stand between the player and the offer: the original button names its price in bones, as in
    // "Golden Maps (20 bones)" or "Shrine (3/10, 40 Bones)". Locked (icon), disabled in a challenge, active or maxed: none.
    const lockedByBones = text => /\d\s*bones\)\s*$/i.test(String(text).trim());
    // Cheapest offer not bought yet in the open section; when the bones do not cover it, how many are missing.
    function shortfall(list, have) {
        const cheapest = list.filter(offer => offer.price > 0).sort((a, b) => a.price - b.price)[0];
        return cheapest && have < cheapest.price ? t(prettify(cheapest.price - have) + ' short for ' + cheapest.name) : '';
    }
    function strip() {
        if (!bar) return;
        if (shopStatus) {
            const note = t(MobileBoneShop.note());
            if (shopStatus.textContent !== note) shopStatus.textContent = note;
            shopStatus.hidden = selected === 'shop' || !note;
        }
        const count = prettify(game.global.b);
        if (bar.firstElementChild.lastChild.textContent !== count) bar.firstElementChild.lastChild.textContent = count;
        // Offers in a hidden holder (Permanent before every Rare Kin, Bone Portal before the first portal) do not count.
        const list = selected === 'shop' ? [] : [...panels[selected].querySelectorAll('[data-bone-price]')].filter(controls => controls.offsetParent !== null).map(controls => ({
            price: Number(controls.dataset.bonePrice), name: controls.closest('tr,.mobile-bone-offer')?.querySelector('strong')?.textContent || ''}));
        const text = shortfall(list, game.global.b), short = bar.querySelector('.mobile-bone-short');
        if (short.textContent !== text) short.textContent = text;
    }
    // Bone Portal becomes an offer with the same anatomy as the other cards. The original button and the ids
    // showBones() writes into (heliumGainedMisc, bonePortalDescription) are moved.
    function goodie(area, key, name, cost, effect) {
        const card = el('div', 'mobile-bone-offer'); card.dataset.offer = key;
        const button = area.querySelector('.boneBtn'), original = button.textContent.trim();
        const desc = el('div', 'mobile-bone-effect'); desc.append(...effect);
        const controls = el('div', 'mobile-bone-controls');
        controls.append(infoButton(name, () => original + '<br>' + desc.textContent), button); controls.dataset.boneCost = cost; controls.dataset.bonePrice = cost;
        card.append(picture(icon(key)), el('strong', '', name), el('span', 'mobile-bone-price', cost + ' Bones'), desc, controls);
        area.replaceChildren(card);
    }
    function setup() {
        const columns = [...byId('boneBuyRow').children];
        panels = {imports:byId('boneImportsColumn'), permanent:columns[0], extras:byId('boneMiscColumn')};
        tabs = document.createElement('nav'); tabs.id = 'mobile-bone-tabs'; tabs.setAttribute('aria-label','Bone Trader sections');
        // V-220: Get bones (Google Play packs, mobile-bone-shop.js) only where the native shop exists.
        const shop = typeof MobileBoneShop !== 'undefined' && MobileBoneShop.available();
        if (shop) { panels.shop = el('div', 'mobile-bone-shop'); panels.shop.id = 'mobile-bone-shop'; byId('boneBuyRow').append(panels.shop); MobileBoneShop.attach(panels.shop); }
        for (const [name, label] of [['imports','Rare Kin'],['permanent','Permanent'],['extras','Extras'],...(shop ? [['shop','Get bones']] : [])]) {
            const button = document.createElement('button'); button.dataset.panel = name; button.textContent = label;
            button.onclick = () => name === 'shop' ? openShop() : select(name); tabs.append(button);
        }
        // Following strip (Diorama): bone count, what the cheapest offer of the open section still lacks, Get bones.
        bar = el('div'); bar.id = 'mobile-bone-bar'; bar.hidden = true;
        const count = el('span', 'mobile-bone-bar-count'), mini = el('span', 'mobile-bone-coin'); mini.setAttribute('aria-hidden', 'true');
        count.append(mini, el('span', '', '0')); bar.append(count, el('span', 'mobile-bone-short'));
        if (shop) { const get = el('button', 'mobile-bone-bar-get', 'Get bones'); get.onclick = openShop; bar.append(get); }
        byId('boneBuyRow').before(bar, tabs);
        if (shop) {
            const details = el('button', 'mobile-bone-shop-details', 'Purchase information');
            details.onclick = () => {
                openShop();
                const info = byId('mobile-bone-shop-terms');
                info.scrollIntoView({block:'start'}); info.focus({preventScroll:true});
            };
            shopStatus = el('p', 'mobile-bone-shop-status'); shopStatus.hidden = true; shopStatus.setAttribute('role', 'status');
            tabs.after(details, shopStatus);
            back = el('button', 'mobile-bone-shop-back', 'Back'); back.hidden = true;
            back.setAttribute('aria-label', 'Back to the Bone Trader offers'); back.onclick = () => select(offers);
            panels.shop.before(back);
        }
        const description = panels.imports.querySelector('.boneBuyDesc');
        const explanation = document.createElement('div'); explanation.className = 'mobile-bone-intro';
        explanation.innerHTML = '<span>Permanent Rare Kin · 50 Bones each</span>';
        explanation.append(infoButton('Rare Kin', () => description.innerHTML)); description.before(explanation); description.hidden = true;
        const close = byId('boneWrapper0').querySelector('[onclick="hideBones()"]');
        close.textContent = 'Close'; close.setAttribute('role','button'); close.tabIndex = 0;
        close.classList.add('mobile-bone-close'); close.setAttribute('aria-label', 'Close Bone Trader');
        // Scene band (Diorama): the original head row carries the scene; the balance becomes a plaque beside a bone.
        byId('boneWrapper0').firstElementChild.classList.add('mobile-bone-scene');
        const owned = byId('boneOwnedContainer'), balance = el('div', 'mobile-bone-balance'), coin = el('span', 'mobile-bone-coin');
        coin.setAttribute('aria-hidden', 'true');
        // "You have" stays for Previous graphics; Diorama shows only the bone and the count as a plain line (V-235).
        const have = el('span', 'mobile-bone-have', 'You have ');
        balance.append(coin, have, byId('bonesOwned')); owned.replaceChildren(byId('boneTitleContainer'), balance);
        if (shop) { const get = el('button', 'mobile-bone-get-main', 'Get bones'); get.onclick = openShop; owned.append(get); }
        // The strip shows while the scene band is scrolled out of the trader.
        if (typeof IntersectionObserver === 'function') new IntersectionObserver(entries => { bar.hidden = entries[entries.length - 1].isIntersecting; },
            {root: byId('boneWrapper')}).observe(byId('boneWrapper0').firstElementChild);
        panels.imports.querySelectorAll('.importLocation').forEach((node,index) => node.textContent = index ? 'In Maps' : 'In the World');
        const portal = el('b', 'mobile-bone-gain'); portal.append(byId('heliumGainedMisc'));
        const portalDesc = el('span'); portalDesc.append(byId('bonePortalDescription'));
        goodie(byId('buyHeliumArea'), 'boneportal', 'Bone Portal', 100, [portal, portalDesc]);
        // V-224: showBones() still sets buyHeirloomArea to display:block and setHeirRareText() still writes into it, so the
        // original area stays in the document, inside a hidden holder that keeps it out of sight and out of reach.
        const retired = el('div'); retired.hidden = true; retired.append(byId('buyHeirloomArea'));
        byId('boneMiscColumn').append(retired);
        panels.extras.querySelector('.boneBuyTitle').textContent = 'Instant';
    }
    function goodies() {
        // updateBoneBtnColors keeps the original state classes; the label follows the same price check.
        for (const [id, cost] of goodiePrices) {
            const button = byId(id), on = game.global.b >= cost;
            button.setAttribute('role','button'); button.tabIndex = 0; button.textContent = t(on ? 'Buy' : 'Locked');
            button.setAttribute('aria-disabled', String(!on)); mark(button, false, !on);
        }
    }
    function imports() {
        for (const [name, owned] of Object.entries(game.unlocks.imps)) {
            const row = byId(name); if (!row || row.closest('#boneWrapper') === null) continue;
            const cells = [...row.cells], desc = game.badGuys[name].dropDesc;
            row.onclick = null; row.classList.add('mobile-bone-import');
            cells[0].innerHTML = '<strong>' + name + '</strong><span class="mobile-bone-price">' + (owned ? 'Unlocked' : '50 Bones') + '</span>';
            cells[0].prepend(picture(portrait(name), owned && 'Owned'));
            cells[1].textContent = desc;
            const controls = row.insertCell(); controls.className = 'mobile-bone-controls';
            controls.append(infoButton(name, desc));
            const purchase = document.createElement('button'); purchase.className = 'mobile-bone-buy'; purchase.dataset.import = name;
            purchase.textContent = owned ? 'Active' : 'Buy'; purchase.disabled = owned || game.global.b < 50;
            mark(purchase, owned, !owned && game.global.b < 50); controls.dataset.boneCost = owned ? '' : 50;
            if (owned) delete controls.dataset.bonePrice; else controls.dataset.bonePrice = 50;
            purchase.onclick = () => {
                if (game.unlocks.imps[name] || game.global.b < 50) return;
                selectImp(name); byId('importPurchaseBtn').click();
            };
            controls.append(purchase);
        }
    }
    function bonusCards(containerId, bonuses, suffix) {
        for (const [name, bonus] of Object.entries(bonuses)) {
            const card = byId(name + suffix), purchase = byId(name + 'PurchaseBtn');
            if (!card || card.dataset.mobileBone) continue;
            card.dataset.mobileBone = 'true'; card.classList.add('mobile-bone-offer');
            const text = document.createElement('div'); text.innerHTML = bonus.text;
            const desc = document.createElement('p'); desc.className = 'mobile-bone-effect'; desc.textContent = text.textContent;
            const heading = document.createElement('strong'); heading.textContent = bonus.name;
            const price = document.createElement('span'); price.className = 'mobile-bone-price';
            const permanent = suffix === 'permaBonusBox';
            price.textContent = permanent ? (bonus.owned === 10 ? '10/10 · Max' : bonus.owned + '/10 · ' + getNextPermaBonePrice(name) + ' Bones') : bonus.cost + ' Bones';
            const originalState = purchase.textContent;
            const controls = document.createElement('div'); controls.className = 'mobile-bone-controls';
            controls.append(infoButton(bonus.name, originalState + '<br>' + bonus.text), purchase);
            const enabled = purchase.classList.contains('boneBtnStateOn'), done = permanent ? bonus.owned === 10 : !!bonus.owned;
            purchase.textContent = enabled ? 'Buy' : (permanent ? (done ? 'Max' : 'Locked') : (done ? 'Active' : 'Locked'));
            purchase.setAttribute('role','button'); purchase.tabIndex = enabled ? 0 : -1;
            purchase.setAttribute('aria-disabled', String(!enabled)); mark(purchase, !enabled && done, !enabled);
            controls.dataset.boneCost = enabled || done ? '' : (permanent ? getNextPermaBonePrice(name) : bonus.cost);
            if (!done && lockedByBones(originalState)) controls.dataset.bonePrice = permanent ? getNextPermaBonePrice(name) : bonus.cost;
            card.replaceChildren(picture(icon(name), done && (permanent ? 'Max' : 'Active')), heading, price, desc, controls);
        }
        const title = t('Until the next portal');
        byId(containerId).querySelectorAll('.boneBuyTitle').forEach(node => { if (node.textContent !== title) node.textContent = title; });
    }
    // Keep the displayed pack with its handler; never silently substitute a new price at purchase time.
    function getBones() {
        if (typeof MobileBoneShop === 'undefined') return;
        byId('boneWrapper').querySelectorAll('[data-bone-cost]').forEach(controls => {
            const cost = Number(controls.dataset.boneCost), pack = cost ? MobileBoneShop.packFor(cost - game.global.b) : null;
            let button = controls.querySelector('.mobile-bone-get');
            const text = pack ? t('Get ' + prettify(pack.bones) + ' bones · ' + pack.price) : '';
            if (!pack) { button?.remove(); return; }
            if (!button) { button = el('button', 'mobile-bone-get'); controls.append(button); }
            if (button.textContent !== text) button.textContent = text;
            const shown = {...pack};
            button.onclick = () => MobileBoneShop.buy(shown.id, shown);
        });
    }
    // CPC principles 2025: every bone price also shows its real-money value (MobileBoneShop.money). The packs in Get bones
    // carry their Play price already. Without Play prices nothing is added.
    function realMoney() {
        byId('boneWrapper').querySelectorAll('.mobile-bone-price').forEach(price => {
            if (price.closest('#mobile-bone-shop')) return;
            const bones = Number(((price.firstChild && price.firstChild.textContent) || '').match(/(\d+) (?:Bones|Knochen)$/)?.[1]);
            const text = bones && typeof MobileBoneShop !== 'undefined' && MobileBoneShop.money ? MobileBoneShop.money(bones) : '';
            let money = price.querySelector('.mobile-bone-money');
            if (!text) { money?.remove(); return; }
            if (!money) { money = el('small', 'mobile-bone-money'); price.append(money); }
            if (money.textContent !== text) money.textContent = text;
        });
    }
    function render() {
        if (!panels) setup();
        // Opening starts at the scene band; the observer brings the strip back once it is scrolled out.
        if (!byId('boneWrapper').scrollTop) bar.hidden = true;
        // updateBones rebuilds bonus cards; updateImports rebuilds original import rows on opening/purchase.
        for (const row of byId('boneImportsColumn').querySelectorAll('.mobile-bone-import')) {
            while (row.cells.length > 2) row.deleteCell(2);
        }
        imports();
        bonusCards('singleRunBonuses', game.singleRunBonuses, 'SingleBonusBox');
        bonusCards('permaBoneBonuses', game.permaBoneBonuses, 'permaBonusBox');
        goodies();
        getBones();
        realMoney();
        select(selected);
    }
    function refresh() {
        if (!panels || !bonesShown) return;
        // Original updateBones may redraw these offers while the trader stays open.
        bonusCards('singleRunBonuses', game.singleRunBonuses, 'SingleBonusBox');
        bonusCards('permaBoneBonuses', game.permaBoneBonuses, 'permaBonusBox');
        panels.imports.querySelectorAll('[data-import]').forEach(button => {
            const owned = game.unlocks.imps[button.dataset.import]; button.disabled = owned || game.global.b < 50;
            mark(button, owned, !owned && game.global.b < 50);
        });
        if (goodiePrices.some(([id, cost]) => byId(id).textContent !== t(game.global.b >= cost ? 'Buy' : 'Locked'))) goodies();
        getBones();
        realMoney();
        strip();
    }
    return {render, refresh, realMoney, icon, portrait, shortfall, lockedByBones, openShop: () => { if (panels && panels.shop) openShop(); }};
})();
if (typeof module !== 'undefined') module.exports = MobileBones;
