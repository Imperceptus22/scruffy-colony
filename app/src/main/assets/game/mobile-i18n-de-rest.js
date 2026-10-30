// V-243 step 4i: the last German texts of the original game before 1.00. Engine keys, saves and English stay unchanged.
// - Breakdown windows (updates.js getBattleStatBd, getPsString, getTrimpPs, getMaxTrimps, getMaxResources, getLootBd) and
//   the zone overview (getZoneStats): an own observer translates only text inside their tables (.bdTable, .bdTableSm) and
//   the loot tabs (#lootBdTabs) with its own short words (Base, Total, Level …), which never reach the shared catalog.
//   Names stay English like everywhere: Perks, Masteries, Challenges, Mutators, Golden Upgrades, Rare Kin, potions, stack
//   names of the challenge rules (Exhausted, Frenzied …), Fluffy's abilities, Heirloom types, Spire Assault and Player
//   Spire rows. Buildings, jobs, equipment and research use their German stage 2 names.
// - Window titles of these breakdowns, the Perk Preset, Export/Import Perks and Change Universe tooltips and their own
//   buttons (Refresh, Apply, Got it …) are set after the original tooltip() has drawn them; lastTooltipTitle stays English.
//   Fixed custom texts of badges (Void buffs, Map/Void Corruption) are handed over German at the source.
// - Long sentences of tooltip windows (Perk Presets, Mastery tab, Change Universe, Decay/Melt, the Auspicious Presence
//   stories after Void Maps) join the shared catalog (extend), keyed by their branded English.
// - The message log gets the Void stories (Bone Trader duplicates, the end of a Void Map, Fluffy clearing Void Maps), the
//   Helium of Corrupted and Healthy cells and the remaining fixed notices (registerLog).
// Numbers keep prettify() ("1.5K"); no German text contains ASCII double quotes or "Trimp".
var MobileI18nDeRest = (() => {
    const brand = value => typeof MobileBranding === 'undefined' ? value : MobileBranding.text(value);
    const one = (n, singular, plural) => n === '1' ? singular : plural;
    const res = {Food: 'Nahrung', Wood: 'Holz', Metal: 'Metall', Science: 'Wissenschaft', Gems: 'Edelsteine', Fragments: 'Fragmente', Helium: 'Helium', Radon: 'Radon',
        food: 'Nahrung', wood: 'Holz', metal: 'Metall', 'Food/Wood/Metal': 'Nahrung/Holz/Metall'};
    const branded = object => Object.fromEntries(Object.entries(object).map(([english, german]) => [brand(english), german]));
    // A translator over exact texts, anchored patterns on the branded text and an optional fallback. German results are
    // remembered and never translated again (idempotent, no observer loops); surrounding whitespace stays.
    function translator(strings, patterns, fallback) {
        const map = new Map(Object.entries(strings)), cache = new Map(), produced = new Set();
        for (const [english, german] of Object.entries(strings)) map.set(brand(english), german);
        function find(core) {
            if (map.has(core)) return map.get(core);
            const text = brand(core);
            if (map.has(text)) return map.get(text);
            for (const [pattern, replace] of patterns) { const match = text.match(pattern); if (match) { const out = replace(...match); if (out != null) return out; } }
            return fallback ? fallback(core) : null;
        }
        return value => {
            if (typeof value !== 'string') return value;
            // Diorama lets column heads such as Food/Wood/Metal wrap after their slashes with zero-width spaces.
            const core = value.trim().replace(/​/g, '');
            if (!core || !/[A-Za-z]/.test(core) || produced.has(core)) return value;
            let next = cache.get(core);
            if (next === undefined) { next = find(core); if (cache.size > 2000) { cache.clear(); produced.clear(); } cache.set(core, next); if (next !== null) produced.add(next.trim()); }
            if (next === null) return value;
            const at = value.indexOf(value.trim());
            return value.slice(0, at) + next + value.slice(at + value.trim().length);
        };
    }

    // ------------------------------------------------------------------ Breakdown tables and the zone overview (own observer)
    const breakdownStrings = {
        // Column heads and units
        Base: 'Basis', Level: 'Stufe', Total: 'Gesamt', Amount: 'Menge', 'Line Total': 'Zeilenwert', 'Per Cell:': 'Je Feld:', 'Per Zone:': 'Je Zone:', Damage: 'Schaden',
        // Production and population
        Breeding: 'Zucht', You: 'Du', 'Average Loot': 'Durchschnittliche Beute', 'Sharing Food': 'Geteilte Nahrung', 'Multitasking (Bones)': 'Multitasking (Knochen)',
        Farmers: 'Bauern', Lumberjacks: 'Holzfäller', Miners: 'Bergleute', Scientists: 'Forscher', Dragimps: 'Draken', Explorers: 'Entdecker', Trainers: 'Trainer',
        Geneticists: 'Genetiker', Meteorologists: 'Meteorologen', Magmamancers: 'Magmamanten', Nurseries: 'Kinderstuben', 'Dragimp Scouting': 'Erkundung der Draken',
        Housing: 'Unterkünfte', 'Generated Housing': 'Erzeugte Unterkünfte', 'Territory Bonus': 'Gebietsbonus', 'Antenna Array': 'Antennenfeld', 'Antenna Network': 'Antennennetz',
        // Combat
        Soldiers: 'Soldaten', Formation: 'Formation', Achievements: 'Erfolge', 'Shield Layer': 'Schildschicht', 'Prisms (Scruffy)': 'Prismen (Scruffy)',
        'Prismatic (Z2)': 'Prisma (Z2)', 'Prismalicious (Z20)': 'Prismapracht (Z20)', 'Chilled Enemy': 'Chilled-Gegner', 'Relic Strength': 'Reliktstärke',
        'Resource Relic': 'Ressourcenrelikt', 'Radon Relic': 'Radonrelikt', 'Breed Relic': 'Brutrelikt', 'Finished Quests!': 'Abgeschlossene Quests!', 'Completed Quest!': 'Quest erfüllt!',
        'Lack Discipline': 'Fehlende Disziplin', 'Unharnessed Luck': 'Ungezähmtes Glück', 'Toxic Air': 'Giftige Luft', 'Broken Planet': 'Zerbrochener Planet',
        // Effects of challenges and Daily modifiers; the names in brackets stay (stack names of the rules stay as well)
        Huge: 'Riesig', 'Huge (Size)': 'Riesig (Size)', 'Shattered (Frigid)': 'Zersplittert (Frigid)', 'Solitary (Downsize)': 'Einzelgänger (Downsize)',
        'Tweaky (Toxicity)': 'Aufgedreht (Toxicity)', 'Strength (Balance)': 'Stärke (Balance)', 'Strength (Unbalance)': 'Stärke (Unbalance)', 'Sanity (Decay)': 'Vernunft (Decay)',
        'Sanity (Melt)': 'Vernunft (Melt)', 'Sleepy (Watch)': 'Schläfrig (Watch)', 'Determined (Lead)': 'Entschlossen (Lead)', 'Insane (Insanity)': 'Wahnsinnig (Insanity)',
        'Weakness (Balance)': 'Schwäche (Balance)', 'Weakness (Unbalance)': 'Schwäche (Unbalance)', 'Weakness (Daily)': 'Schwäche (Daily)', 'Dedicated (Daily)': 'Hingabe (Daily)',
        'Famine (Daily)': 'Hungersnot (Daily)', 'Dysfunctional (Daily)': 'Funktionsstörung (Daily)', 'Toxic (Daily)': 'Giftig (Daily)', 'Oddly Weak (Daily)': 'Seltsam schwach (Daily)',
        'Even Stronger (Daily)': 'Noch stärker (Daily)', 'Rampage (Daily)': 'Amoklauf (Daily)', 'Large (Daily)': 'Groß (Daily)', 'Minimalist (Daily)': 'Minimalismus (Daily)',
        'Prodigal (Daily)': 'Verschwendung (Daily)', 'Rallying Cry (Duel)': 'Schlachtruf (Duel)', 'Winning (Duel)': 'Siegeszug (Duel)',
        'Advanced Processing (Glass)': 'Fortgeschrittene Verarbeitung (Glass)', 'Overheating (Magma)': 'Überhitzung (Magma)', 'Spore Cloud (Spire)': 'Sporenwolke (Spire)',
        'Swiftness (Wind)': 'Schnelligkeit (Wind)', 'Domination (Boss Only)': 'Domination (nur Boss)', 'Hypothermia (Wood only)': 'Hypothermia (nur Holz)',
        // Loot
        'Map Bonus': 'Map-Bonus', 'Map Loot': 'Map-Beute', 'Low Map Level': 'Niedrige Map-Stufe', 'Extra Map Zones': 'Zusätzliche Map-Zonen', 'Mutated Zone': 'Mutated-Zone',
        'Total Per Zone': 'Gesamt je Zone', 'Spire Rows': 'Spire-Reihen', 'Healthy Value': 'Healthy-Wert', 'Corruption Value': 'Corruption-Wert', 'Mutation Total': 'Mutationen gesamt',
        'Corruption Bonus': 'Corruption-Bonus', 'Improbability Bonus': brand('Improbability') + '-Bonus', 'Omnipotrimp Bonus': brand('Omnipotrimp') + '-Bonus',
        Food: 'Nahrung', Wood: 'Holz', Metal: 'Metall', Science: 'Wissenschaft', Gems: 'Edelsteine', Fragments: 'Fragmente', 'Food/Wood/Metal': 'Nahrung/Holz/Metall',
        // Zone overview: map resource and the own item line of mobile-ui.js
        Any: 'Beliebig', Scaling: 'Wechselnd', 'No items remaining': 'Keine Items mehr'
    };
    const zoneTime = time => {
        let match = time.match(/^(\d+) seconds?$/);
        if (match) return match[1] + ' Sek.';
        match = time.match(/^(\d+) mins?, (\d+) secs?$/);
        return match ? match[1] + ' Min., ' + match[2] + ' Sek.' : time;
    };
    const breakdownPatterns = [
        [/^(\S+) \((\d+) mins?\)$/, (_, level, n) => level + ' (' + n + ' Min.)'],
        [/^(\S+) minutes \(\+(\S+)%\)$/, (_, n, pct) => n + ' Min. (+' + pct + '%)'],
        [/^(\S+%) \((\S+%) Total\)$/, (_, a, b) => a + ' (' + b + ' gesamt)'],
        [/^(\S+) Cells?$/, (_, n) => n + ' ' + one(n, 'Feld', 'Felder')],
        [/^Lv (\S+)$/, (_, n) => 'Stufe ' + n],
        [/^(Frigid|Mayhem|Pandemonium|Desolation) Completions$/, (_, name) => 'Abschlüsse ' + name],
        [/^Item (?:Attack|Health|Block|Prismatic Shield)$/, () => 'Beitrag'],
        [/^Heirloom - (Food|Wood|Metal) \(Staff\)$/, (_, what) => 'Heirloom – ' + res[what] + ' (Staff)'],
        [/^Stacked Map(s?) \((Fluffy|Scruffy)\)$/, (_, s, pet) => 'Gestapelte Map' + s + ' (' + pet + ')'],
        [/^Your Prismatic Shield is equal to (\S+)% of your Scruffies' maximum Health\. All enemy damage hits your Prismatic Shield before Health, and Prismatic Shield always regenerates to full after an enemy is killed\.$/,
            (_, n) => 'Dein Prismatic Shield entspricht ' + n + '% der maximalen Health deiner Scruffies. Jeder Schaden der Gegner trifft zuerst dein Prismatic Shield und erst dann die Health, und das Prismatic Shield lädt sich nach jedem getöteten Gegner wieder ganz auf.'],
        // Zone overview (getZoneStats); the map name stays as written
        [/^Zone (\d+), Cell (\d+)$/, (_, zone, cell) => 'Zone ' + zone + ', Feld ' + cell],
        [/^(.+), Level (\d+)((?: \([^()]*\))?), Cell (\d+)$/, (_, map, level, tag, cell) => map + ', Stufe ' + level + tag + ', Feld ' + cell],
        [/^You have been (in this Zone|on this map) for (.+)$/, (_, where, time) => 'Du bist seit ' + zoneTime(time) + (where === 'in this Zone' ? ' in dieser Zone' : ' auf dieser Map')],
        [/^(\d+) groups? of Scruffies (?:has|have) died in this Spire\.$/, (_, n) => n + ' ' + one(n, 'Gruppe Scruffies ist', 'Gruppen Scruffies sind') + ' in dieser Spire umgekommen.'],
        [/^You have (\d+) Void Maps?(?: \((\d+) stacks\))?$/, (_, n, stacks) => 'Du hast ' + n + ' ' + one(n, 'Void Map', 'Void Maps') + (stacks ? ' (' + stacks + ' Stapel)' : '')],
        [/^Items still available: (\d+)$/, (_, n) => 'Noch verfügbare Items: ' + n]
    ];
    // Single names of buildings, jobs, equipment and research (Gym, Shield, Potency …) take their stage 2 German name.
    let layer = null;
    const kinds = ['equipment', 'buildings', 'jobs', 'upgrades'];
    const named = core => { if (!layer) return null; for (const kind of kinds) { const german = layer.name(kind, core); if (german) return german; } return null; };
    const breakdownText = translator(breakdownStrings, breakdownPatterns, named);
    // "Challenge² Rewards": the word after the superscript joins it ("Challenge²-Belohnungen").
    const joined = {Rewards: '-Belohnungen'};
    const breakdownAreas = '.bdTable,.bdTableSm,#lootBdTabs';
    function watchBreakdowns(doc, Observer) {
        const translateNode = node => {
            const parent = node.parentElement;
            if (!parent || !parent.closest(breakdownAreas) || parent.closest('script,style,textarea,input,select')) return;
            const core = node.data.trim();
            if (Object.hasOwn(joined, core) && node.previousSibling && node.previousSibling.nodeName === 'SUP') { node.data = joined[core]; parent.lang = 'de'; return; }
            const next = breakdownText(node.data);
            if (next !== node.data) { node.data = next; if (parent.lang !== 'de') parent.lang = 'de'; }
        };
        const refresh = root => {
            if (root.nodeType === 3) return translateNode(root);
            if (root.nodeType !== 1) return;
            const walker = doc.createTreeWalker(root, 4);
            while (walker.nextNode()) translateNode(walker.currentNode);
        };
        const tip = doc.getElementById('tipText');
        if (!tip) return null;
        refresh(tip);
        const observer = new Observer(records => {
            for (const record of records) {
                if (record.type === 'childList') record.addedNodes.forEach(refresh);
                else translateNode(record.target);
            }
        });
        observer.observe(tip, {subtree: true, childList: true, characterData: true});
        return observer;
    }

    // ------------------------------------------------------------------ Window titles and own buttons of the tooltip window
    const titleStrings = {
        'Helium Per Hour': 'Helium pro Stunde', 'Radon Per Hour': 'Radon pro Stunde',
        'Trimps Per Second': 'Scruffies pro Sekunde', 'Max Trimps': 'Höchstzahl Scruffies', 'World Info': 'Zoneninfo',
        'Fast': 'Schnell', 'Superheated': 'Überhitzt', 'Electric': 'Elektrisch', 'Pierce': 'Durchschlag', 'Nom': 'Gefräßig', 'Momentum': 'Schwung',
        'Toxic': 'Giftig', 'Poisoned': 'Vergiftet', 'Chilled': 'Abgekühlt', 'Breezy': 'Windig', 'Domination: Dominating': 'Domination: Dominierend',
        'Domination: Weak': 'Domination: Geschwächt', 'Crushing Blows': 'Zerschmetternde Hiebe', 'Well Fed': 'Gut genährt',
        'Map Corruption': 'Map-Corruption', 'Void Corruption': 'Void-Corruption',
        'Save Perk Preset': 'Perk-Preset speichern', 'Rename Perk Preset': 'Perk-Preset umbenennen', 'Load Perk Preset': 'Perk-Preset laden',
        'Import Perk Preset': 'Perk-Preset importieren', 'Export Perk Setup': 'Perk-Verteilung exportieren', 'Export Perks': 'Perks exportieren',
        'Import Perks': 'Perks importieren', 'Change Universe': 'Universum wechseln', 'Empty Slot': 'Leerer Platz'
    };
    const titlePatterns = [
        [/^(Food|Wood|Metal|Science|Gems|Fragments) Per Second$/, (_, what) => res[what] + ' pro Sekunde'],
        [/^Max (Food|Wood|Metal)$/, (_, what) => 'Höchstmenge ' + res[what]],
        // Diorama marks the open loot tab whose visible name starts the title (mobile-diorama.js markLootTab).
        [/^(Food\/Wood\/Metal|Fragments|Gems|Helium|Radon) Loot Breakdown$/, (_, what) => res[what] + ' – Beuteaufschlüsselung'],
        [/^Rename Preset (\d+)$/, (_, n) => 'Preset ' + n + ' umbenennen']
    ];
    const titleText = translator(titleStrings, titlePatterns);
    const breakdowns = /^get(?:PsString|TrimpPs|BattleStatBd|MaxTrimps|MaxResources|LootBd)\(/;
    const buttons = [
        // [tooltip what, test on the attached function or null, element id, English, German]
        ['confirm', breakdowns, 'confirmTooltipBtn', 'Refresh', 'Aktualisieren'],
        ['Rename Preset', null, 'confirmTooltipBtn', 'Apply', 'Übernehmen'],
        ['Export Perks', null, 'confirmTooltipBtn', 'Got it', 'Verstanden'],
        ['Export Perks', null, 'clipBoardBtn', 'Copy to Clipboard', 'In die Zwischenablage kopieren'],
        ['Import Perks', null, 'confirmTooltipBtn', 'Import', 'Importieren']
    ];
    // Fixed texts the original hands to tooltip(…, 'customText', …): enemy badges, Void buffs, Corruption and own notices.
    const customStrings = branded({
        'This Bad Guy is fast and attacks first': 'Dieser Gegner ist schnell und greift zuerst an.',
        'This Omnipotrimp is Superheated, and will explode on death.': 'Dieser Crownmaw ist überhitzt und explodiert beim Tod.',
        'This Bad Guy is electric and stacks a debuff on your Trimps': 'Dieser Gegner ist elektrisch und fügt deinen Scruffies mit jedem Angriff einen Debuff zu.',
        'This Bad Guy is nice and plump from eating Trimps. Increases attack damage by 25% per stack': 'Dieser Gegner hat sich an Scruffies satt gefressen. Sein Angriffsschaden steigt pro Stapel um 25%.',
        'Your current health is higher than your block, making you vulnerable to critical strikes from your enemies. Better fix that...': 'Deine aktuelle Health ist höher als dein Block. Dadurch bist du anfällig für kritische Treffer der Gegner. Ändere das besser …',
        'This Bad Guy attacks twice - once before you, and once again after you.': 'Dieser Gegner greift zweimal an – einmal vor dir und noch einmal nach dir.',
        'This map is reducing the repopulation speed of your Trimps by 80%.': 'Diese Map senkt das Nachwuchstempo deiner Scruffies um 80%.',
        'This Bad Guy has a 25% chance to crit you for 400% extra damage.': 'Dieser Gegner trifft dich mit 25% Wahrscheinlichkeit kritisch und richtet dabei 400% zusätzlichen Schaden an.',
        'This Bad Guy has a 30% chance to dodge your attacks.': 'Dieser Gegner weicht deinen Angriffen mit 30% Wahrscheinlichkeit aus.',
        'This Bad Guy has an additional 2x attack.': 'Dieser Gegner hat 2x Attack zusätzlich.',
        'This Bad Guy has an additional 5x health.': 'Dieser Gegner hat 5x Health zusätzlich.',
        'This Bad Guy attacks twice for 1.5x damage - once before you, and once again after you.': 'Dieser Gegner greift zweimal mit 1.5x Schaden an – einmal vor dir und noch einmal nach dir.',
        'This Bad Guy has a 25% chance to crit you for 600% extra damage.': 'Dieser Gegner trifft dich mit 25% Wahrscheinlichkeit kritisch und richtet dabei 600% zusätzlichen Schaden an.',
        'This Bad Guy has an additional 2.5x attack.': 'Dieser Gegner hat 2.5x Attack zusätzlich.',
        'This Bad Guy has an additional 7.5x health.': 'Dieser Gegner hat 7.5x Health zusätzlich.',
        'Every time this Bad Guy attacks, you will lose an additional 20% of your <b>current</b> health.': 'Bei jedem Angriff dieses Gegners verlierst du zusätzlich 20% deiner <b>aktuellen</b> Health.',
        'Every time this Bad Guy attacks, you will lose an additional 30% of your <b>current</b> health.': 'Bei jedem Angriff dieses Gegners verlierst du zusätzlich 30% deiner <b>aktuellen</b> Health.',
        'Click on an Heirloom from your inventory to equip it!': 'Tippe auf ein Heirloom in deinem Bestand, um es auszurüsten!',
        'Protection list is full. Unprotect an older item first.': 'Die Schutzliste ist voll. Hebe zuerst den Schutz eines älteren Heirlooms auf.',
        'Local preferences could not be read. Gameplay saves are unaffected.': 'Lokale Einstellungen konnten nicht gelesen werden. Spielstände sind nicht betroffen.',
        'Local preferences are full. Remove older entries and try again.': 'Der Speicher für lokale Einstellungen ist voll. Entferne ältere Einträge und versuche es erneut.',
        'Preferences are kept for this session only. Device storage is unavailable.': 'Einstellungen gelten nur für diese Sitzung. Der Gerätespeicher ist nicht verfügbar.',
        'These preferences could not be stored.': 'Diese Einstellungen konnten nicht gespeichert werden.'
    });
    const customPatterns = [
        [/^(\S+)% of the damage from this Bad Guy pierces through block$/, (_, pct) => pct + '% des Schadens dieses Gegners durchdringt den Block.'],
        [/^The displayed value for (Helium|Radon) Per Hour is simply a calculation of how much \1 you've earned so far this run, divided by the amount of hours you've spent so far on this run\.<br\s*\/?><br\s*\/?>This value is <b>not<\/b> production like the other resources\. \1 is always earned from killing strong Bad Guys and never produced automatically\.$/,
            (_, name) => name + ' pro Stunde zeigt, wie viel ' + name + ' du in diesem Durchlauf bisher verdient hast, geteilt durch die bisherige Laufzeit in Stunden.<br><br>Dieser Wert ist <b>keine</b> automatische Produktion wie bei den anderen Ressourcen. ' + name + ' erhältst du durch das Besiegen starker Gegner; es wird nie automatisch produziert.'],
        [/^This (map|Void Map) has become unstable due to Corruption\. Enemy attack increased by (\S+)X, and health increased by (\S+)X\.( Helium at the end of the map is now double what you would earn from a World Zone, including Corrupted cells!)?$/,
            (_, kind, attack, health, helium) => (kind === 'map' ? 'Diese Map' : 'Diese Void Map') + ' ist durch die Corruption instabil geworden. Die Attack der Gegner steigt auf das ' + attack + '-Fache, ihre Health auf das ' + health + '-Fache.' +
                (helium ? ' Am Ende der Map gibt es jetzt doppelt so viel Helium wie in einer Zone der Welt, Corrupted-Felder eingeschlossen!' : '')]
    ];
    function customText(text) {
        if (Object.hasOwn(customStrings, text)) return customStrings[text];
        const value = brand(text);
        if (Object.hasOwn(customStrings, value)) return customStrings[value];
        for (const [pattern, replace] of customPatterns) { const match = value.match(pattern); if (match) return replace(...match); }
        for (const [pattern, replace] of mutationPatterns) { const match = value.match(pattern); if (match) return replace(...match); }
        return null;
    }
    function decorate(doc, what, attached) {
        if (!doc || typeof doc.getElementById !== 'function') return;
        const title = doc.getElementById('tipTitle');
        if (title) { const next = titleText(title.textContent); if (next !== title.textContent) { title.textContent = next; title.lang = 'de'; } }
        if (what === 'Helium Per Hour') {
            const text = doc.getElementById('tipText'), next = text && customText(text.innerHTML);
            if (next != null) { text.innerHTML = next; text.lang = 'de'; }
        }
        for (const [name, test, id, english, german] of buttons) {
            if (what !== name || (test && !(typeof attached === 'string' && test.test(attached)))) continue;
            const button = doc.getElementById(id);
            if (button && button.textContent === english) { button.textContent = german; button.lang = 'de'; }
        }
    }
    function wrapTooltip(win) {
        const original = win.tooltip;
        if (typeof original !== 'function' || original.mobileI18nRest) return false;
        const wrapped = function (...args) {
            if (args[1] === 'customText' && typeof args[3] === 'string') { const next = customText(args[3]); if (next !== null) args[3] = next; }
            const result = original.apply(this, args);
            decorate(win.document, args[0], args[4]);
            return result;
        };
        wrapped.mobileI18nRest = true;
        win.tooltip = wrapped;
        return true;
    }

    // ------------------------------------------------------------------ Shared catalog: tooltip windows (#tipText, #tipCost)
    const presence = 'From the void, an auspicious presence reaches out and fills your mind. You feel at peace with the world. It asks you what you desire most';
    const presenceDe = 'Aus der Leere greift eine verheißungsvolle Präsenz nach dir und erfüllt deinen Geist. Du bist im Frieden mit der Welt. Sie fragt dich, was du dir am meisten wünschst';
    const strings = branded({
        // Perk Presets of the Portal (updates.js tooltip 'Perk Preset', 'Rename Preset', 'Export Perks', 'Import Perks')
        'Click to save your current perk loadout to the selected preset': 'Tippe, um deine aktuelle Perk-Verteilung im gewählten Preset zu speichern.',
        'Click to set a name for your currently selected perk preset': 'Tippe, um dem gewählten Perk-Preset einen Namen zu geben.',
        'Click to load your currently selected perk preset.': 'Tippe, um das gewählte Perk-Preset zu laden.',
        'You must have your Respec active to load a preset!': 'Zum Laden eines Presets muss dein Respec aktiv sein!',
        'Click to import a perk setup from a text string': 'Tippe, um eine Perk-Verteilung aus einem Text zu importieren.',
        'Click to export a copy of your current perk setup to share with friends, or to save and import later!': 'Tippe, um deine aktuelle Perk-Verteilung zu exportieren – zum Teilen mit Freunden oder um sie zu sichern und später wieder zu importieren!',
        'This Preset slot is empty!': 'Dieser Preset-Platz ist leer!',
        "Select this slot and then click 'Save' to save your current Perk configuration to this slot. You'll be able to load this configuration back whenever you want, as long as you have your Respec active.":
            'Wähle diesen Platz und tippe dann auf ‚Speichern‘, um deine aktuelle Perk-Verteilung hier abzulegen. Du kannst sie jederzeit wieder laden, solange dein Respec aktiv ist.',
        'This Preset holds:': 'Dieses Preset enthält:',
        'Type a name below for your Perk Preset! This name will show up on the Preset bar and make it easy to identify which Preset is which.':
            'Gib unten einen Namen für dein Perk-Preset ein! Er erscheint in der Preset-Leiste, damit du die Presets leicht auseinanderhältst.',
        'Max of 1,000 for most perks': 'Bei den meisten Perks höchstens 1,000',
        'It may not look like much, but all of your perks are in here! You can share this string with friends, or save it to your computer to import later!':
            'Sieht nach wenig aus, aber hier stecken alle deine Perks drin! Du kannst diesen Text mit Freunden teilen oder ihn auf deinem Gerät sichern und später importieren!',
        'Import your perks from a text string!': 'Importiere deine Perks aus einem Text!', 'Error, not copied': 'Fehler, nicht kopiert',
        // importPerks() (main.js), shown under the Import button
        'Something went really wrong, what did you even just try to do?!': 'Da ist etwas gewaltig schiefgelaufen – was wolltest du denn gerade tun?!',
        "This doesn't look like a valid perk string.": 'Das sieht nicht nach einem gültigen Perk-Text aus.',
        'This looks like a save string, rather than a perk string. To import a save string, use the Import button on the main screen.':
            'Das sieht nach einem Spielstand aus, nicht nach einem Perk-Text. Einen Spielstand importierst du mit dem Knopf Import im Hauptbildschirm.',
        "This perk setup would require a respec, but you don't have one available.": 'Diese Perk-Verteilung bräuchte einen Respec, aber du hast keinen.',
        // Mastery tab (tooltip 'Mastery'); the number between the two pieces stands in its own <b>
        'Click to view your masteries.': 'Tippe, um deine Masteries anzusehen.', 'Click to view your Mutators.': 'Tippe, um deine Mutators anzusehen.',
        'You currently have': 'Du hast derzeit',
        // Change Universe; the red line is split by Challenge<sup>2</sup>, so the German sentence ends after it
        'Fluffy suggests having at least 15,000% Challenge': 'Fluffy empfiehlt dir, vor der Reise nach Universum 2 mindestens 15,000% Belohnungsbonus aus Challenge',
        'reward bonus before heading to Universe 2, but he trusts you to make your own decisions!': 'zu haben, aber er traut dir eigene Entscheidungen zu!',
        "You will earn Radon instead of Helium in Universe 2. It's an entirely new Universe to explore!": 'In Universum 2 verdienst du Radon statt Helium. Ein ganz neues Universum, das du erkunden kannst!',
        // Auspicious Presence stories after the last cell of a Void Map (config.js AutoStorage … AutoEquip); titles are names
        [presence + ', and without a second thought you reply that you wish your Trimps were smart enough to manage storage structures on their own. The presence lets you know that it is done, then dissipates. You instantly regret not asking to go home.']:
            presenceDe + ', und ohne nachzudenken antwortest du, dass deine Scruffies klug genug sein sollen, ihre Lagergebäude selbst zu verwalten. Die Präsenz lässt dich wissen, dass es erledigt ist, und löst sich auf. Sofort bereust du, nicht darum gebeten zu haben, nach Hause zu kommen.',
        [presence + '. Wait... hasn\'t this happened before? Last time you asked for your Trimps to be smart enough to manage storage structures on their own. You can make it better this time! You excitedly ask for your Trimps to waste less resources when managing resources on their own. The presence lets you know that it is done, then dissipates. You get serious déjà-vu while regretting not asking to go home.']:
            presenceDe + '. Moment … ist das nicht schon einmal passiert? Letztes Mal hast du dir gewünscht, dass deine Scruffies ihre Lagergebäude selbst verwalten können. Diesmal kannst du es besser machen! Aufgeregt wünschst du dir, dass deine Scruffies beim Verwalten ihrer Ressourcen weniger verschwenden. Die Präsenz lässt dich wissen, dass es erledigt ist, und löst sich auf. Du hast ein heftiges Déjà-vu und bereust, nicht darum gebeten zu haben, nach Hause zu kommen.',
        'From now on, storage facilities will be constructed instantly. If you collect more resources from one source than you can hold, the extra resources will be used to build new storage facilities without wasting any resources. You may not be home, but your Trimps are now quite talented!':
            'Ab jetzt werden Lagergebäude sofort gebaut. Sammelst du aus einer Quelle mehr Ressourcen, als du lagern kannst, baut der Überschuss neue Lagergebäude, ohne dass etwas verloren geht. Du bist zwar nicht zu Hause, aber deine Scruffies sind jetzt ziemlich begabt!',
        [presence + ". Wait... how many times has this happened now? You're fairly positive that there was something you regretted not asking last time, but you can't quite remember. You've asked for Trimps to be able to manage storage structures, and you've asked for them to be better at managing those structures. Even though you're content with your storage solutions, you suddenly realize the perfect request! You wish the Trimps would stop pushing so far through the Zones while you're sleeping, so you ask for a way to tell the Trimps to stop fighting at a Zone of your choosing. The presence lets you know that it is done, then dissipates. You realize as soon as it leaves that you could have asked to go home, but you don't really want to anymore. Next time you'll make sure to ask for invincible Trimps though, that may have been a better choice."]:
            presenceDe + '. Moment … wie oft ist das jetzt schon passiert? Du bist dir ziemlich sicher, dass du letztes Mal etwas bereut hast, kommst aber nicht mehr darauf, was es war. Du hast dir gewünscht, dass Scruffies Lagergebäude verwalten können, und dann, dass sie es besser können. Mit deinen Lagern bist du zufrieden, doch plötzlich kommt dir der perfekte Wunsch! Die Scruffies sollen aufhören, sich so weit durch die Zonen zu kämpfen, während du schläfst; also bittest du um eine Möglichkeit, ihnen zu sagen, in welcher Zone sie aufhören sollen. Die Präsenz lässt dich wissen, dass es erledigt ist, und löst sich auf. Kaum ist sie weg, wird dir klar, dass du darum hättest bitten können, nach Hause zu kommen, aber eigentlich willst du das gar nicht mehr. Nächstes Mal wünschst du dir aber ganz bestimmt unbesiegbare Scruffies, das wäre vielleicht die bessere Wahl gewesen.',
        "From now on, you have access to the Map At Zone setting. This setting can be accessed through the Map Sidebar, Settings, or the 'Configure Maps' popup!":
            'Ab jetzt hast du Zugriff auf die Einstellung Map at Zone. Du erreichst sie über die Map-Seitenleiste, die Einstellungen oder das Fenster ‚Configure Maps‘!',
        "From the void, a suspicious presence reaches out and fills some of your mind. Before it even says anything, you immediately ask for peace on the planet and for you to be sent home. Unfortunately for you, the Suspicious Presence lets you know that you must have it confused with its sibling, and that it doesn't actually take requests. It blows a strange bubble thing at one of your Trimps and takes off. Dang!":
            'Aus der Leere greift eine zwielichtige Präsenz nach dir und erfüllt einen Teil deines Geistes. Noch bevor sie etwas sagt, bittest du sofort um Frieden auf dem Planeten und darum, nach Hause geschickt zu werden. Leider teilt dir die zwielichtige Präsenz mit, dass du sie wohl mit ihrem Geschwister verwechselst und dass sie gar keine Wünsche erfüllt. Sie pustet ein seltsames Blasending auf einen deiner Scruffies und verschwindet. Mist!',
        'From now on, your AutoUpgrade button can now cycle to a mode where no Coordinations are bought.': 'Ab jetzt kann dein Knopf AutoUpgrade auch in einen Modus wechseln, der keine Koordinationen kauft.',
        [presence + ". Wait... This has DEFINITELY happened before... hasn't it? You're pretty sure it has, but you have no actual memory of it. But you do... but also you don't. Wait, who even are you? Where are you? What are you?"]:
            presenceDe + '. Moment … DAS ist doch GANZ SICHER schon einmal passiert … oder? Du bist dir ziemlich sicher, aber du erinnerst dich nicht wirklich daran. Doch, tust du … aber auch wieder nicht. Moment, wer bist du überhaupt? Wo bist du? Was bist du?',
        "You sit on the ground and contemplate things for a few hours while the Auspicious Presence waits patiently. You finally stand up and demand that the Trimps become smart enough to level up their own equipment! You can't see how this could go badly. The presence lets you know that it is done, then it dissipates. As soon as it is gone, you realize you could have just asked for invincible Trimps, but you're pretty sure you'll remember next time.":
            'Du setzt dich auf den Boden und denkst ein paar Stunden über alles nach, während die verheißungsvolle Präsenz geduldig wartet. Schließlich stehst du auf und verlangst, dass die Scruffies klug genug werden, ihre Ausrüstung selbst zu verbessern! Du kannst dir nicht vorstellen, wie das schiefgehen könnte. Die Präsenz lässt dich wissen, dass es erledigt ist, und löst sich auf. Kaum ist sie weg, wird dir klar, dass du dir einfach unbesiegbare Scruffies hättest wünschen können, aber nächstes Mal denkst du bestimmt daran.',
        'From now on, you have access to AutoEquip!': 'Ab jetzt hast du Zugriff auf AutoEquip!'
    });
    const mutationEffectText = {
        'this Bad Guy attacks twice - once before you, and once again after you.': 'greift dieser Gegner zweimal an – einmal vor dir und noch einmal nach dir.',
        'every time this Bad Guy attacks, you will lose an additional 20% of your <b>current</b> health.': 'verlierst du bei jedem Angriff dieses Gegners zusätzlich 20% deiner <b>aktuellen</b> Health.',
        'this Bad Guy has an additional 2x attack.': 'hat dieser Gegner 2x Attack zusätzlich.',
        'this Bad Guy has an additional 5x health.': 'hat dieser Gegner 5x Health zusätzlich.',
        'this Bad Guy has a 30% chance to dodge your attacks.': 'weicht dieser Gegner deinen Angriffen mit 30% Wahrscheinlichkeit aus.',
        'this Bad Guy has a 25% chance to crit you for 400% extra damage.': 'trifft dich dieser Gegner mit 25% Wahrscheinlichkeit kritisch und richtet dabei 400% zusätzlichen Schaden an.',
        'this Bad Guy attacks twice for 1.5x damage - once before you, and once again after you.': 'greift dieser Gegner zweimal mit 1.5x Schaden an – einmal vor dir und noch einmal nach dir.',
        'this Bad Guy has a 25% chance to crit you for 600% extra damage.': 'trifft dich dieser Gegner mit 25% Wahrscheinlichkeit kritisch und richtet dabei 600% zusätzlichen Schaden an.',
        'every time this Bad Guy attacks, you will lose an additional 30% of your <b>current</b> health.': 'verlierst du bei jedem Angriff dieses Gegners zusätzlich 30% deiner <b>aktuellen</b> Health.',
        'this Bad Guy has an additional 2.5x attack.': 'hat dieser Gegner 2.5x Attack zusätzlich.',
        'this Bad Guy has an additional 7.5x health.': 'hat dieser Gegner 7.5x Health zusätzlich.'
    };
    const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mutationPatterns = Object.entries(mutationEffectText).flatMap(([english, german]) => {
        const escaped = escapeRegExp(english), capitalized = escapeRegExp(english[0].toUpperCase() + english.slice(1));
        const suffix = ' It will also drop (\\S+)% of the helium you would normally get from completing this Zone\\.';
        return [
            [new RegExp('^All (corrupted|Healthy) enemies currently deal (\\S+)X damage and have (\\S+)X health\\. In addition, ' + escaped + suffix + '$'),
                (_, kind, attack, health, helium) => 'Alle ' + (kind === 'corrupted' ? 'Corrupted' : 'Healthy') + '-Gegner verursachen derzeit das ' + attack + '-Fache an Schaden und haben das ' + health + '-Fache an Health. Außerdem ' + german + ' Er lässt außerdem ' + helium + '% des Heliums fallen, das du für den Abschluss dieser Zone normalerweise erhalten würdest.'],
            [new RegExp('^' + capitalized + suffix + '$'),
                (_, helium) => german[0].toUpperCase() + german.slice(1) + ' Er lässt außerdem ' + helium + '% des Heliums fallen, das du für den Abschluss dieser Zone normalerweise erhalten würdest.']
        ];
    });
    const patterns = [
        // Enemy badges and updates.js tooltips; numbers are copied directly from the original text.
        [/^This Bad Guy is toxic\. You will obtain (\S+)% more resources! Oh, also, this Bad Guy has (\S+)x attack, (\S+)x health, your Scruffies will lose (\S+)% health each time they attack, and the toxic air is causing your Scruffies to breed (\S+)% slower\. These stacks will reset after clearing the Zone\.$/,
            (_, loot, attack, health, loss, breed) => 'Dieser Gegner ist giftig. Du erhältst ' + loot + '% mehr Ressourcen! Außerdem hat er ' + attack + 'x Attack und ' + health + 'x Health. Deine Scruffies verlieren bei jedem Angriff ' + loss + '% ihrer Health, und die giftige Luft verlangsamt ihre Zucht um ' + breed + '%. Die Stapel werden nach Abschluss der Zone zurückgesetzt.'],
        [/^This Bad Guy has (\S+)% more damage and health, pierces an additional (\S+)% block, and each attack that does not kill it will cause your Scruffies to lose (\S+)% of their health\.$/,
            (_, more, pierce, loss) => 'Dieser Gegner verursacht ' + more + '% mehr Schaden, hat ' + more + '% mehr Health und durchdringt zusätzlich ' + pierce + '% des Blocks. Jeder Angriff, der ihn nicht tötet, kostet deine Scruffies ' + loss + '% ihrer Health.'],
        [/^This enemy is harmed by the Empowerment of Poison, and is taking (\S+) extra damage per turn\.$/,
            (_, damage) => 'Dieser Gegner wird von der Gift-Ermächtigung geschädigt und erleidet pro Zug ' + damage + ' zusätzlichen Schaden.'],
        [/^This enemy has been chilled by the Empowerment of Ice, is taking (\S+)% more damage, and is dealing (\S+)% less damage with each normal attack\.(<div style=["']margin-top: 10px["']><b>.*?<\/b><\/div>)?$/,
            (_, more, less, overkill='') => 'Dieser Gegner wurde durch die Eis-Ermächtigung abgekühlt. Er erleidet ' + more + '% mehr Schaden und verursacht mit jedem normalen Angriff ' + less + '% weniger Schaden.' + (overkill ? overkill.replace('You will earn +1 Overkill during Ice Zones once you reach Level 50, and a second Overkill cell at Level 100!', 'Ab Stufe 50 erhältst du in Eis-Zonen +1 Overkill; auf Stufe 100 kommt ein zweites Overkill-Feld hinzu!').replace('You are earning +1 Overkill during Ice Zones! Earn another at Level 100!', 'Du erhältst in Eis-Zonen +1 Overkill! Auf Stufe 100 kommt ein weiteres Overkill-Feld hinzu!').replace('Your Ice level is', 'Deine Eis-Stufe ist').replace(' over', ' über').replace(' 100, and you are gaining an additional 2 cells of Overkill during Ice Zones!', ' 100 und du erhältst in Eis-Zonen zusätzlich 2 Overkill-Felder!') : '')],
        [/^There is a rather large amount of Wind swelling around this enemy, increasing all Helium gained by (\S+)% and all other resources by (\S+)%\.$/,
            (_, helium, other) => 'Um diesen Gegner wirbelt eine große Menge Wind. Dadurch erhältst du ' + helium + '% mehr Helium und ' + other + '% mehr von allen anderen Ressourcen.'],
        [/^There is a rather large amount of Wind swelling around this enemy, increasing all non-Helium\s+resources by (\S+)%\.$/,
            (_, other) => 'Um diesen Gegner wirbelt eine große Menge Wind. Dadurch erhältst du ' + other + '% mehr Ressourcen außer Helium.'],
        [/^You will earn \+1 Overkill during Ice Zones once you reach Level 50, and a second Overkill cell at Level 100!$/, () => 'Ab Stufe 50 erhältst du in Eis-Zonen +1 Overkill; auf Stufe 100 kommt ein zweites Overkill-Feld hinzu!'],
        [/^You are earning \+1 Overkill during Ice Zones! Earn another at Level 100!$/, () => 'Du erhältst in Eis-Zonen +1 Overkill! Auf Stufe 100 kommt ein weiteres Overkill-Feld hinzu!'],
        [/^Your Ice level is 100, and you are gaining an additional 2 cells of Overkill during Ice Zones!$/, () => 'Deine Eis-Stufe ist 100 und du erhältst in Eis-Zonen zusätzlich 2 Overkill-Felder!'],
        [/^Your Ice level is over 100, and you are gaining an additional 2 cells of Overkill during Ice Zones!$/, () => 'Deine Eis-Stufe ist über 100 und du erhältst in Eis-Zonen zusätzlich 2 Overkill-Felder!'],
        [/^This Bad Guy is Dominating! It has (\S+)x attack, (\S+)x health, and heals for (\S+)% of its max health after each attack\. However, it will also drop (\S+)x Helium!$/,
            (_, attack, health, heal, helium) => 'Dieser Gegner dominiert! Er hat ' + attack + 'x Attack und ' + health + 'x Health und heilt sich nach jedem Angriff um ' + heal + '% seiner maximalen Health. Dafür lässt er ' + helium + 'x Helium fallen!'],
        [/^This Bad Guy is having its power siphoned by an even worse Bad Guy! It deals (\S+)% less damage and has (\S+)% less health\.$/,
            (_, damage, health) => 'Ein noch schlimmerer Gegner saugt diesem Gegner die Kraft ab! Er verursacht ' + damage + '% weniger Schaden und hat ' + health + '% weniger Health.'],
        [/^That Gobbleby was delicious, and you have leftovers\. If you set yourself to gather (Food|Wood|Metal), (Food|Wood|Metal), or (Food|Wood|Metal) while this buff is active, you can share with your workers to increase their gather speed by (\S+)%$/,
            (_, a, b, c, pct) => 'Der Gobbleby war köstlich, und es ist noch etwas übrig. Wenn du während dieses Buffs ' + ({Food:'Nahrung',Wood:'Holz',Metal:'Metall'}[a]) + ', ' + ({Food:'Nahrung',Wood:'Holz',Metal:'Metall'}[b]) + ' oder ' + ({Food:'Nahrung',Wood:'Holz',Metal:'Metall'}[c]) + ' sammelst, kannst du deinen Arbeitern etwas abgeben und so ihr Sammeltempo um ' + pct + '% erhöhen.'],
        // V-313 source currently emits 50% or 100%; accepting the original dynamic value also keeps a future 75% branch readable.
        [/^This enemy is missing an effect thanks to Fluffy! It will still drop (\S+)% of the helium you would normally get from completing this Zone\.$/,
            (_, pct) => 'Diesem Gegner fehlt dank Fluffy ein Effekt! Er lässt trotzdem ' + pct + '% des Heliums fallen, das du für den Abschluss dieser Zone normalerweise erhalten würdest.'],
        ...mutationPatterns,
        // Change Universe (updates.js)
        [/^Click this button to have your next Portal bring you to Universe (\d) - The (Helium|Radon) Universe\. (Helium|Radon) Perks and (Fluffy|Scruffy) can't come with you, but \4's good pal (Fluffy|Scruffy) will be waiting for you\.$/,
            (_, n, what, old, pet, next) => 'Tippe auf diesen Knopf, damit dich dein nächstes Portal nach Universum ' + n + ' bringt – The ' + what + ' Universe. ' + old + '-Perks und ' + pet +
                ' können nicht mit, aber ' + pet + 's guter Freund ' + next + ' wartet dort auf dich.'],
        // Decay and Melt (updates.js tooltip 'Decay'); "Trimp attack" is branded to "Scruffy attack"
        [/^Things are quickly becoming tougher\. Gathering, looting, and Scruffy attack are reduced by (\S+)%\.$/,
            (_, n) => 'Alles wird schnell härter. Sammeln, Beute und die Attack der Scruffies sind um ' + n + '% gesenkt.'],
        // importPerks() (main.js)
        [/^Cannot set (\S+) to level (\S+)\.$/, (_, perk, n) => perk + ' kann nicht auf Stufe ' + n + ' gesetzt werden.'],
        [/^You don't have enough (Helium|Radon) to afford this perk setup\.$/, (_, what) => 'Du hast nicht genug ' + what + ' für diese Perk-Verteilung.']
    ];
    const probe = /^(?:Click this button to have|Things are quickly becoming|Cannot set |You don't have enough (?:Helium|Radon) to afford|This Bad Guy is (?:toxic|Dominating|having its power siphoned)|This Bad Guy has \S+% more damage and health|This enemy is (?:harmed by the Empowerment of Poison|missing an effect thanks to Fluffy)|This enemy has been chilled|There is a rather large amount of Wind swelling|You (?:will earn|are earning) \+1 Overkill|Your Ice level is|That Gobbleby was delicious|All (?:corrupted|Healthy) enemies currently deal|This Bad Guy|Every time this Bad Guy)/;

    // ------------------------------------------------------------------ Message log
    const vial = what => what === 'Radon' ? 'Radonphiolen' : 'Heliumkanister';
    const logStrings = {
        // Bone Trader with a duplicate Void Map (config.js boneTrader … checkDupe)
        "Before you even see the original Void Map, the Bone Trader appears in front of you and hands you the Void Map's duplicate. With his mission successful, the Bone Trader then wanders to a nearby bush to check for bones, then vanishes in a disappointed puff of smoke.":
            'Noch bevor du die ursprüngliche Void Map überhaupt siehst, taucht der Knochenhändler vor dir auf und drückt dir ihr Duplikat in die Hand. Mission erfüllt: Er schlendert noch zu einem Busch in der Nähe, sucht dort nach Knochen und verschwindet dann in einer enttäuschten Rauchwolke.',
        'You hear a THWACK like someone smacking two bones together right next to your frickin ear. Rather miffed, you turn around to see nothing but a Void Map on the ground. About 15 trimplengths away you spot the rear end of the Bone Trader sticking out from behind a rock, but you decide not to say anything.':
            'Direkt neben deinem verflixten Ohr macht es KLONK, als hätte jemand zwei Knochen aneinandergeschlagen. Ziemlich verärgert drehst du dich um und siehst nichts als eine Void Map auf dem Boden. Etwa 15 Scruffylängen entfernt ragt das Hinterteil des Knochenhändlers hinter einem Felsen hervor, aber du beschließt, nichts zu sagen.',
        "The Bone Trader pops into existence quite a distance in front of you, clearly wearing a chef's apron and holding a spoon carved from bone. He tosses a Void Map in your general direction, then quickly disappears. You may have just interrupted the cooking of some soup.":
            'Ein ganzes Stück vor dir ploppt der Knochenhändler ins Dasein, eindeutig mit Kochschürze und einem aus Knochen geschnitzten Löffel. Er wirft eine Void Map ungefähr in deine Richtung und verschwindet schnell wieder. Vielleicht hast du ihn gerade beim Suppekochen gestört.',
        'You almost stumble and fall in a hole right in front of you that definitely was not there a minute ago. You look down and see the Bone Trader staring up at you with a warm smile, holding up a Void Map. You take the Void Map, thank the Bone Trader, and the hole fills back in instantly.':
            'Beinahe stolperst du in ein Loch direkt vor dir, das vor einer Minute ganz sicher noch nicht da war. Du schaust hinunter, und der Knochenhändler lächelt dir warm entgegen und hält eine Void Map hoch. Du nimmst die Void Map, dankst dem Knochenhändler, und das Loch schließt sich sofort wieder.',
        // Remaining fixed notices (main.js, updates.js, config.js); PlayFab lines never show (no network in the app)
        "Sorry, it looks like your browser storage has been corrupted. Please clear your storage by going to Tools -> Clear Recent History -> Cookies and set time range to 'Everything'. This will remove the corrupted browser storage across all sites.":
            'Leider sieht es so aus, als sei dein Browserspeicher beschädigt. Leere bitte deinen Speicher über Extras -> Neueste Chronik löschen -> Cookies und stelle den Zeitraum auf ‚Alles‘. Damit wird der beschädigte Browserspeicher auf allen Websites entfernt.',
        "It looks like your import code isn't working properly. Please make sure that your export code is saved in a text file compatible with all of the characters. If you believe this code should be working, you can Email it to Trimpsgame@gmail.com and I will do my best to restore it for you!":
            'Dein Import-Code scheint nicht richtig zu funktionieren. Achte bitte darauf, dass dein Export-Code in einer Textdatei gespeichert ist, die alle Zeichen unterstützt. Wenn du glaubst, dass der Code funktionieren sollte, kannst du ihn per E-Mail an Trimpsgame@gmail.com schicken, und ich tue mein Bestes, ihn für dich wiederherzustellen!',
        "Your browser is preventing Trimps from accessing localStorage, and you will not be able to save or load your progress. Please check your browser settings to ensure that 3rd party cookies are not disabled, and that you're not using any addons that might interrupt storage! <br/><br/> AutoSave has been disabled to prevent damage to your save. If you previously had a save file, it should still be waiting for you once you fix your browser settings.":
            'Dein Browser verhindert den Zugriff auf localStorage, daher kannst du deinen Fortschritt weder speichern noch laden. Prüfe bitte in deinen Browsereinstellungen, dass Drittanbieter-Cookies nicht deaktiviert sind und keine Erweiterungen den Speicher stören! <br/><br/> AutoSave ist deaktiviert, damit dein Spielstand keinen Schaden nimmt. Wenn du schon einen Spielstand hattest, wartet er noch auf dich, sobald du deine Browsereinstellungen korrigiert hast.',
        "You can't import a save from the beta version to this version!": 'Du kannst keinen Spielstand aus der Betaversion in diese Version importieren!',
        "Welcome to 2.3! Since you are currently past Zone 70, you have automatically unlocked the new Challenge - 'Trapper' and the new Job - 'Geneticist'":
            'Willkommen bei 2.3! Da du schon über Zone 70 hinaus bist, hast du automatisch die neue Challenge ‚Trapper‘ und den neuen Beruf ‚Genetiker‘ freigeschaltet.',
        "Welcome to 2.3! Since you have previously cleared up to at least Zone 70, you have unlocked the new Challenge - 'Trapper'!":
            'Willkommen bei 2.3! Da du schon mindestens bis Zone 70 gekommen bist, hast du die neue Challenge ‚Trapper‘ freigeschaltet!',
        "Due to a rework of the current Masteries, all of your spent Dark Essence has been refunded for free! Don't forget to repurchase your Masteries!":
            'Wegen einer Überarbeitung der Masteries hast du deine gesamte ausgegebene Dark Essence kostenlos zurückerhalten! Vergiss nicht, deine Masteries neu zu kaufen!',
        "Welcome to Patch 4.5! Since you have already cleared Spire I, you have been given 20 bones and earned 5% Zone Liqufication. Click 'What's New' to see what's new!":
            'Willkommen bei Patch 4.5! Da du Spire I schon abgeschlossen hast, hast du 20 Knochen und 5% Liquification für Zonen erhalten. Unter ‚What’s New‘ siehst du, was neu ist!',
        "<span style='color: #1ab1d6; font-size: 1.2em;'>WELCOME TO 4.9!</span> Due to a rework of the current Masteries, all of your spent Dark Essence has been refunded for free! Don't forget to repurchase your Masteries!":
            "<span style='color: #1ab1d6; font-size: 1.2em;'>WILLKOMMEN BEI 4.9!</span> Wegen einer Überarbeitung der Masteries hast du deine gesamte ausgegebene Dark Essence kostenlos zurückerhalten! Vergiss nicht, deine Masteries neu zu kaufen!",
        "Since you've previously cleared Spire V, you've unlocked the brand new <b>Classy</b> perk!": 'Da du Spire V schon abgeschlossen hast, hast du den brandneuen Perk <b>Classy</b> freigeschaltet!',
        'You have no more use for Dark Essence!': 'Du hast keine Verwendung mehr für Dark Essence!',
        'You see a strange light radiating out of a strange ice cube in a strange spot in the Zone. You have a nearby Trimp crack it open, and find a map to a Frozen Castle!':
            'An einer seltsamen Stelle der Zone strahlt ein seltsames Licht aus einem seltsamen Eiswürfel. Ein Scruffy in der Nähe bricht ihn für dich auf, und du findest eine Map zu einem Frozen Castle!',
        "You shake the Presimpt before opening it, and can tell there's something special in this one. Yup! That thoughtful Presimpt gave you a perfectly preserved bone!":
            'Du schüttelst ' + brand('Presimpt') + ' vor dem Öffnen und merkst, dass etwas Besonderes darin steckt. Tatsächlich! Das aufmerksame ' + brand('Presimpt') + ' hat dir einen perfekt erhaltenen Knochen geschenkt!',
        'Get a leg up with PANTS! Until your next trou... browser refresh, you can enable the useless but stylish PANTS ONLY AutoPrestige setting! Denim-ite!':
            'Mit PANTS bist du allen ein Hosenbein voraus! Bis zum nächsten Hosen… äh, Neuladen des Browsers kannst du die nutzlose, aber stilvolle AutoPrestige-Einstellung PANTS ONLY einschalten! Jeanial!',
        'Please use a number greater than 0!': 'Bitte gib eine Zahl größer als 0 ein!',
        'You have completed The Black Bog! 1 stack of Exhausted and Motivated have been removed from your Trimps.': 'Du hast The Black Bog abgeschlossen! Deine Scruffies verlieren je 1 Stapel Exhausted und Motivated.'
    };
    const arrival = {'the next Void map': 'in der nächsten Void Map', 'the world': 'in der Welt', 'your map chamber': 'in deiner Map Chamber'};
    const logPatterns = [
        // End of a Void Map (config.js voidMaps fire); the boss is branded (Cthulimp → its own name)
        [/^(\S+) and the map it came from crumble into the darkness\. You find yourself instantly teleported to (the next Void map|the world|your map chamber)(?: with an extra (\S+) (Helium|Radon)!|\.)$/,
            (_, foe, to, n, what) => foe + ' zerfällt samt seiner Map in der Dunkelheit. Sofort findest du dich ' + arrival[to] + ' wieder' + (n ? ', mit zusätzlich ' + n + ' ' + what + '!' : '.')],
        [/^Before you even realized you were in a new Void Map, (Fluffy|Scruffy) snuck to the end and quickly stole all the loot\.(?: You gained another (\S+) (Helium|Radon)!)?$/,
            (_, pet, n, what) => 'Noch bevor du merkst, dass du in einer neuen Void Map bist, hat sich ' + pet + ' ans Ende geschlichen und flink die ganze Beute stibitzt.' + (n ? ' Du erhältst weitere ' + n + ' ' + what + '!' : '')],
        [/^Before you even realize what's happening, (Fluffy|Scruffy) has entered and cleared the remaining (\S+) Void Maps and quickly stole all the loot!(?: After earning a bonus on each of \+(\S+)% (Helium|Radon), you've earned an additional (\S+) (?:Helium|Radon)!)?$/,
            (_, pet, n, pct, what, amount) => 'Noch bevor du begreifst, was passiert, hat ' + pet + ' die übrigen ' + n + ' Void Maps betreten, abgeschlossen und flink die ganze Beute stibitzt!' +
                (pct ? ' Mit +' + pct + '% ' + what + ' auf jede davon erhältst du zusätzlich ' + amount + ' ' + what + '!' : '')],
        // Helium of Corrupted and Healthy cells (main.js mutations)
        [/^The corruption quickly swirls into the air and dissipates\. <span class='helium'>You see (\S+) canisters of (Helium|Radon) left on the ground and pick them up\. Useful!<\/span>$/,
            (_, n, what) => "Die Corruption wirbelt schnell in die Luft und verfliegt. <span class='helium'>Du siehst " + n + ' ' + vial(what) + ' auf dem Boden liegen und hebst sie auf. Praktisch!</span>'],
        [/^The land looks even healthier now that the Bad Guy is dead! <span class='helium'>You find (\S+) canisters of (Helium|Radon) and figure it was worth it\.<\/span>$/,
            (_, n, what) => "Jetzt, wo der Gegner tot ist, wirkt das Land noch gesünder! <span class='helium'>Du findest " + n + ' ' + vial(what) + ' und meinst, dass es sich gelohnt hat.</span>']
    ];
    const logProbe = /^(?:\S+ and the map it came from|Before you even reali[sz]e|The corruption quickly swirls|The land looks even healthier)/;

    const catalog = {breakdownStrings, breakdownPatterns, breakdownText, breakdownAreas, joined, watchBreakdowns, titleStrings, titlePatterns, titleText, buttons, customStrings, customPatterns, customText,
        decorate, wrapTooltip, strings, patterns, probe, logStrings, logPatterns, logProbe};
    function install(win) {
        layer = win.MobileI18nGame;
        if (!layer || !layer.active || layer.lang !== 'de') { layer = null; return false; }
        if (!layer.extend('de', {strings, patterns, probe})) return false;
        layer.registerLog('de', {strings: logStrings, patterns: logPatterns, probe: logProbe});
        wrapTooltip(win);
        const doc = win.document;
        if (doc && typeof doc.getElementById === 'function' && win.MutationObserver) {
            if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => watchBreakdowns(doc, win.MutationObserver)); else watchBreakdowns(doc, win.MutationObserver);
        }
        return true;
    }
    catalog.install = install;
    if (typeof window !== 'undefined') install(window);
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeRest;
