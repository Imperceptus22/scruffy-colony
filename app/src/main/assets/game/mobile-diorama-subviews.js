// The field guide extends the original mastery table and tooltip; the game owns requirements, prices and purchases.
var MobileMastery = (() => {
    const $ = id => document.getElementById(id);
    // One line per mastery in plain words; numbers follow the original descriptions.
    const effects = {
        portal: 'Portal unlocks right after Zone 20',
        bionic: 'Picks up Bionic Wonderland levels; BW gets Fast Attacks',
        turkimp: 'Turkimps more often, longer and with a higher cap',
        housing: 'Unlocks the late housing as you pass its Zone',
        bounty: 'Bounty unlocks right after Zone 15',
        explorers: 'Picks up SpeedExplorer books automatically',
        voidPower: '+15% attack and health in Void Maps',
        pierce: '25% less enemy damage pierces your block',
        heirloom: 'Spend up to 110% of your Nu on Heirlooms',
        herbalist: 'More attack the more Food you have stored',
        headstart: 'Corruption starts at Zone 176',
        scry: 'Scryer on Corrupted cells: double attack, +50% Dark Essence',
        voidPower2: 'Another +20% attack and health in Void Maps',
        mapLoot: 'Low map level loot penalty starts one level later',
        skeletimp: 'Twice the chance for a Megaskeletimp',
        mapHealth: '+100% health in maps',
        headstart2: 'Corruption starts at Zone 166',
        daily: '+50% attack in Daily Challenges',
        hyperspeed: '100 ms less between fights and attacks',
        blacksmith: 'Zones up to half your best drop all prestiges',
        turkimp2: 'Permanent Turkimp bonus, raised to +100%',
        magimp: '2% chance for a Randimp with a random Rare Kin bonus',
        headstart3: 'Corruption starts at Zone 151',
        mapBattery: 'Map Zone bonus doubles at 10 stacks',
        hyperspeed2: 'Another 100 ms faster up to half your best Zone',
        blacksmith2: 'Zones up to 75% of your best drop all prestiges',
        skeletimp2: 'Skeletimps may appear 10 minutes sooner',
        quickGen: 'Generator speeds up 50% faster; +10 Magmite from Voids at Z230+',
        magmaFlow: 'Two extra Magma cells on Magma Zones',
        explorers2: 'Start each Portal with one extra SpeedExplorer',
        voidPower3: 'Another +30% in Void Maps; Voids get Fast Attacks',
        blacksmith3: 'Zones up to 90% of your best drop all prestiges',
        heirloom2: 'Spend up to 120% of your Nu on Heirlooms',
        maz: 'A second preset for Map at Zone',
        liquification: 'Liquification counts one extra Spire (Universe 1)',
        scry2: 'Whole Void Map in Scryer: +50% Helium',
        magmamancer: 'Magmamancers also raise attack; 5 min head start per Zone',
        mapLoot2: 'Maps get 5 fewer cells (min and max)',
        nature: 'Token trading improves from 10:5 to 10:8',
        kerfluffle: '+10% damage while Fluffy is active, more per Evolution',
        stillRowing: 'Spire row loot bonus rises from 2% to 3%',
        patience: 'Anticipation can reach 45 stacks',
        voidSpecial: 'Free Void Maps after Portal; more Helium/Radon from Voids',
        healthStrength: '+15% damage per Healthy cell in the Zone',
        nature2: '+5 free levels on all Nature Upgrades and Stack Transfers',
        liquification2: 'Liquification counts another extra Spire (Universe 1)',
        stillRowing2: 'Spire rows also add attack (2x the loot bonus)',
        amalg: 'Amalgamator damage bonuses compound',
        voidSpecial2: 'A second Void Map per 100 Zones, the first at Z50',
        bionic2: 'BW maps get Prestigious; +50% attack in higher maps',
        fluffyExp: 'Fluffy gains +25% Exp per completed Evolution',
        fluffyAbility: 'One extra Fluffy ability',
        overkill: 'Overkill one more cell',
        crit: '+1 MegaCrit; Shield crit chance counts again at 50%',
        voidMastery: '5x damage in Voids; Void stacks compound and stack further',
        healthStrength2: 'More Healthy cells per Spire; +20% Helium from them',
        mesmer: 'Triples most Challenge² bonuses',
        liquification3: 'Liquification +2 Spires; Hyperspeed II up to 75%',
        stillMagmamancer: '+60 s Magmamancer head start per Spire row; longer cap',
        angelic: 'Trimps heal 50% of remaining health before each attack'
    };
    let filter = 'all';
    const local = (english, german) => typeof MobileI18n !== 'undefined' && MobileI18n.lang === 'de' ? german : english;
    const illustration = key => 'mobile-assets/mastery-fieldguide/' + key + '.webp';
    function button(text, action, cls) {
        const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text; b.onclick = action; return b;
    }
    // The next mastery is affordable as completeTalentPurchase decides it (same prettify tolerance).
    const affordable = () => game.global.essence >= getNextTalentCost() || prettify(game.global.essence) == prettify(getNextTalentCost());
    // A mastery can be bought now: its row is open, it is not owned, its requirement is owned and the Essence suffices.
    const open = item => !!item.closest('.talentRowUnlocked') && item.classList.contains('talentNotPurchased') && !item.classList.contains('talentReqNeeded') && !item.classList.contains('talentLocked');
    function status(item, afford) {
        if (item.classList.contains('talentPurchased')) return local('✓ Owned', '✓ Gekauft');
        if (!item.closest('.talentRowUnlocked')) return local('Locked', 'Gesperrt');
        if (item.classList.contains('talentReqNeeded')) return local('Needs previous', 'Voraussetzung fehlt');
        return afford ? local('Buy', 'Kaufen') : local('Need Essence', 'Essenz fehlt');
    }
    function focusDetail(key, actions, close) {
        const dialog = $('tooltipDiv');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'tipTitle');
        close.focus({preventScroll:true});
        function trapTab(event) {
            if (event.key !== 'Tab') return;
            const stops = [...dialog.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter(node => node.getClientRects().length);
            const first = stops[0], last = stops[stops.length - 1];
            if (!first) return;
            const active = document.activeElement;
            if (!dialog.contains(active) || active === (event.shiftKey ? first : last)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            }
        }
        document.addEventListener('keydown', trapTab, true);
        // Back, Close and purchase all clear tipCost. A purchase also rebuilds (and may filter out) its entry.
        const cleanup = new MutationObserver(() => {
            if (actions.isConnected) return;
            cleanup.disconnect();
            document.removeEventListener('keydown', trapTab, true);
            if ($('mobile-mastery-detail-buy')) return;
            for (const attr of ['role','aria-modal','aria-labelledby']) dialog.removeAttribute(attr);
            if (dialog.style.display !== 'none') return;
            const info = $('mastery' + key)?.parentElement.querySelector('.mobile-mastery-info');
            const target = info?.getClientRects().length ? info : $('mobile-mastery-filter')?.querySelector('[aria-pressed="true"]');
            if (target?.getClientRects().length) target.focus();
        });
        cleanup.observe(actions.parentElement, {childList:true});
    }
    function showInfo(key) {
        TrimpsUI.infoAction(() => {
            // Explicit Info also works when the player has disabled hover tooltips.
            tooltip(key, 'talents', 'update', undefined, undefined, undefined, undefined, undefined, undefined, true);
            const title = $('tipTitle'), cost = $('tipCost'), item = $('mastery' + key);
            if ($('tooltipDiv').style.display === 'none') return;
            const cover = document.createElement('img');
            cover.className = 'mobile-mastery-cover'; cover.alt = ''; cover.src = illustration(key);
            const tier = document.createElement('small');
            tier.className = 'mobile-mastery-caption'; tier.textContent = local('Tier ', 'Reihe ') + game.talents[key].tier + ' · Mastery';
            title.prepend(cover, tier);
            const summary = document.createElement('span');
            summary.className = 'mobile-mastery-effect'; summary.textContent = effects[key];
            title.append(summary);
            const actions = document.createElement('div');
            actions.className = 'mobile-mastery-detail-actions';
            const buy = button(status(item, affordable()), () => {
                if (!open(item) || !affordable()) return;
                cancelTooltip();
                purchaseTalent(key);
            }, 'mobile-mastery-detail-buy');
            buy.id = 'mobile-mastery-detail-buy'; buy.dataset.key = key;
            buy.disabled = !open(item) || !affordable();
            const close = button(local('Close', 'Schließen'), () => cancelTooltip(), 'mobile-mastery-detail-close');
            actions.append(buy, close);
            if (game.talents[key].purchased && !ctrlPressed) cost.replaceChildren();
            cost.append(actions);
            $('tooltipDiv').scrollTop = 0;
            focusDetail(key, actions, close);
        }, false);
    }
    function setFilter(next) {
        filter = next; const container = $('talentsContainer'); if (!container) return;
        const afford = affordable();
        container.dataset.masteryFilter = filter; container.dataset.masteryAfford = String(afford);
        container.querySelectorAll('#mobile-mastery-filter button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
        for (const item of container.querySelectorAll('#talentsHere .talentItem[id^="mastery"]')) {
            const label = item.querySelector('.mobile-mastery-state');
            if (label) label.textContent = status(item, afford);
        }
        const buy = $('mobile-mastery-detail-buy');
        if (buy) {
            const item = $('mastery' + buy.dataset.key);
            buy.disabled = !item || !open(item) || !afford;
            if (item) buy.textContent = status(item, afford);
        }
        const empty = $('mobile-mastery-empty');
        if (empty) empty.hidden = filter !== 'buyable' || (afford && [...container.querySelectorAll('#talentsHere .talentItem')].some(open));
    }
    function decorate() {
        const here = $('talentsHere'); if (!here) return;
        if (!$('mobile-mastery-filter')) {
            const bar = document.createElement('div'); bar.id = 'mobile-mastery-filter'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Show masteries');
            for (const [key, label] of [['buyable', 'Buyable'], ['all', 'All']]) { const b = button(label, () => setFilter(key), ''); b.dataset.filter = key; bar.append(b); }
            const empty = document.createElement('p'); empty.id = 'mobile-mastery-empty'; empty.textContent = 'Nothing to buy right now.'; empty.hidden = true;
            here.before(bar, empty);
        }
        // Tier numbers come from the row position, so hidden rows (filter) do not renumber the visible ones.
        here.querySelectorAll('tr.talentTierRow').forEach((row, index) => { row.dataset.tier = String(index + 1);
            if (row.querySelector('.talentLocked')) row.dataset.lockedNote = local('Revealed as you buy more masteries', 'Wird mit weiteren Masteries aufgedeckt'); });
        // Entries of tiers beyond the purchase power are anonymous lock tiles without an id: nothing to explain there.
        for (const item of here.querySelectorAll('.talentItem[id^="mastery"]')) {
            const key = item.id.slice('mastery'.length), cell = item.parentElement;
            if (cell.querySelector('.mobile-mastery-info')) continue;
            // Keep the original purchase button and its accessible name. The Field Guide exposes only its action.
            const state = document.createElement('span');
            state.className = 'mobile-mastery-state'; state.hidden = true; item.append(state);
            const art = document.createElement('span');
            art.className = 'mobile-mastery-art'; art.hidden = true; art.setAttribute('aria-hidden', 'true');
            art.style.backgroundImage = 'url("' + illustration(key) + '")';
            const name = game.talents[key].name;
            const heading = document.createElement('strong');
            heading.className = 'mobile-mastery-name'; heading.hidden = true; heading.textContent = name;
            if (name.split(/\s+/).some(word => word.length >= 15)) cell.dataset.longName = 'true';
            const line = document.createElement('span');
            line.className = 'mobile-mastery-effect'; line.textContent = effects[key];
            const info = button('Info', event => { event.stopPropagation(); showInfo(key); }, 'mobile-info mobile-mastery-info');
            info.setAttribute('aria-label', 'Info ' + name);
            cell.append(art, heading, line, info);
        }
        setFilter(filter);
    }
    if (typeof document !== 'undefined') {
        if (typeof displayTalents === 'function') {
            const original = displayTalents;
            displayTalents = function () { const result = original.apply(this, arguments); decorate(); return result; };
        }
        // Essence changes do not rebuild the table; the original number update refreshes the Buy state and the filter.
        if (typeof updateTalentNumbers === 'function') {
            const original = updateTalentNumbers;
            updateTalentNumbers = function () {
                const result = original.apply(this, arguments), container = $('talentsContainer');
                const count = $('talentsAffordable');
                if (count && typeof MobileI18n !== 'undefined' && MobileI18n.lang === 'de') {
                    // The engine compares its English count each tick; localize only the field guide's presentation.
                    const shown = count.textContent.replace(' Affordable', ' finanzierbar');
                    if (count.dataset.label !== shown) count.dataset.label = shown;
                }
                if (container && container.dataset.masteryAfford !== String(affordable())) setFilter(filter);
                return result;
            };
        }
        decorate();
    }
    return { decorate, setFilter, effects };
})();
if (typeof module !== 'undefined') module.exports = MobileMastery;
