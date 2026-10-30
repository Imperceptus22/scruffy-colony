// Mastery helpers for the Diorama sub views (V-192). The original displayTalents keeps building the table, prices,
// purchases and requirements; this adapter only adds one short effect line per mastery (own texts, the original text
// stays behind Info), an Info button beside each entry, a monogram for the symbol and a "Buyable / All" filter.
// Classic hides the additions (mobile-b2.css); the look lives in mobile-diorama-subviews.css.
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
    // One uniform medallion per mastery: the initials of its capitalised words, without the level numeral. Several
    // original icon glyphs have no symbol in the app and showed a placeholder rhomb.
    const monogram = name => name.split(/\s+/).filter(w => /^[A-Z]/.test(w) && !/^[IVX]+$/.test(w)).slice(0, 2).map(w => w[0]).join('');
    // The name without the screen reader status the original appends to .talentName in that mode.
    const nameOf = (key, node) => (game.talents[key] && game.talents[key].name) || (node ? node.textContent : key);
    function button(text, action, cls) {
        const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text; b.onclick = action; return b;
    }
    // The next mastery is affordable as completeTalentPurchase decides it (same prettify tolerance).
    const affordable = () => game.global.essence >= getNextTalentCost() || prettify(game.global.essence) == prettify(getNextTalentCost());
    // A mastery can be bought now: its row is open, it is not owned, its requirement is owned and the Essence suffices.
    const open = item => !!item.closest('.talentRowUnlocked') && item.classList.contains('talentNotPurchased') && !item.classList.contains('talentReqNeeded') && !item.classList.contains('talentLocked');
    function setFilter(next) {
        filter = next; const container = $('talentsContainer'); if (!container) return;
        const afford = affordable();
        container.dataset.masteryFilter = filter; container.dataset.masteryAfford = String(afford);
        container.querySelectorAll('#mobile-mastery-filter button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
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
        here.querySelectorAll('tr.talentTierRow').forEach((row, index) => { row.dataset.tier = String(index + 1); });
        // Entries of tiers beyond the purchase power are anonymous lock tiles without an id: nothing to explain there.
        for (const item of here.querySelectorAll('.talentItem[id^="mastery"]')) {
            const key = item.id.replace(/^mastery/, ''), name = item.querySelector('.talentName'), icon = item.querySelector('.talentIcon');
            if (icon && !icon.dataset.mono) icon.dataset.mono = monogram(nameOf(key, name));
            if (effects[key] && !item.querySelector('.mobile-mastery-effect')) {
                const line = document.createElement('span'); line.className = 'mobile-mastery-effect'; line.textContent = effects[key];
                (name || item).after(line);
            }
            const cell = item.parentElement;
            if (cell && !cell.querySelector('.mobile-mastery-info')) {
                // Long original texts (Master of the Void, Liquification) stay open until closed: no auto close.
                const info = button('Info', event => { event.stopPropagation(); TrimpsUI.infoAction(() => tooltip(key, 'talents', 'update'), false); }, 'mobile-info mobile-mastery-info');
                info.setAttribute('aria-label', 'Info ' + nameOf(key, name));
                cell.append(info);
            }
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
                if (container && container.dataset.masteryAfford !== String(affordable())) setFilter(filter);
                return result;
            };
        }
        decorate();
    }
    return { decorate, setFilter, effects, monogram };
})();
if (typeof module !== 'undefined') module.exports = MobileMastery;
