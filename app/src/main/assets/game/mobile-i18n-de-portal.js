// V-243 step 4d: German frame of the Portal (both universes), the Mutators of Universe 2 and the Mastery Info window.
// - Own Portal labels (mobile-portal.js) pass through translate(): MobilePortal compares its labels before writing, so the
//   German text is handed over at the source instead of being rewritten in the DOM (no observer loop with its schedule()).
//   The Perk filter (All, Combat, Economy, Scruffies) stays English: open() compares its own 'All'.
// - The original confirmation sentences of activateClicked (main.js) become German as one piece of markup (html()).
// - Mutator descriptions (u2Mutations.tree in objects.js) are replaced once at the source; the save keeps only purchase
//   flags (u2Mutations.save), names (dn) and keys stay English like Perk and Mastery names.
// - Fixed buttons of the original Portal, the Mutator header, the own Mutator panel (mobile-late-systems.js) and the Mastery
//   Info, Respec and Mutator tooltips are translated in the watched areas of the main catalog (extend()).
// Numbers keep prettify() ("1.5K"); no German text contains ASCII double quotes or "Trimp".
var MobileI18nDePortal = (() => {
    const brand = value => typeof MobileBranding === 'undefined' ? value : MobileBranding.text(value);
    const one = (n, singular, plural) => n === '1' ? singular : plural;
    const res = {Helium: 'Helium', Radon: 'Radon', 'Bonus Points': 'Bonuspunkte', Bonuspunkte: 'Bonuspunkte'};
    // Own labels of mobile-portal.js (exact, after trimming).
    const portal = {
        'New run': 'Neuer Durchlauf', 'Perk Atlas': 'Perk-Atlas',
        'Browse Perks →': 'Perks ansehen →', 'Upgrade Perks →': 'Perks verbessern →', 'Jumps to step 2 of the flow': 'Springt zu Schritt 2 des Ablaufs',
        'Browse Challenges →': 'Challenges ansehen →', 'Choose Challenge': 'Challenge wählen', 'No Challenge': 'Keine Challenge',
        'Apply changes': 'Änderungen übernehmen', 'Review new run': 'Neuen Durchlauf prüfen', 'Start new run': 'Neuen Durchlauf starten',
        'Manage Perks without ending your current run.': 'Verwalte deine Perks, ohne den aktuellen Durchlauf zu beenden.',
        'Prepare Perks and choose a Challenge for your next run.': 'Bereite deine Perks vor und wähle eine Challenge für deinen nächsten Durchlauf.',
        '← Overview': '← Übersicht', '← Challenge': '← Challenge', '← Perks': '← Perks', 'Next: Perks →': 'Weiter: Perks →', 'Next: Review →': 'Weiter: Prüfen →',
        'Close': 'Schließen', 'Save': 'Speichern', 'Load': 'Laden', 'Rename': 'Umbenennen', 'Export': 'Exportieren', 'Import': 'Importieren', 'Scruffies at a stone Time Portal in the forest': 'Scruffies an einem steinernen Time Portal im Wald',
        'earned in total': 'insgesamt verdient', 'spent on Perks': 'für Perks ausgegeben', 'Portals used': 'Portale genutzt',
        'Prepare new run': 'Neuen Durchlauf vorbereiten', '1 Challenge · 2 Perks · 3 Review': '1 Challenge · 2 Perks · 3 Prüfen',
        'New run steps': 'Schritte des neuen Durchlaufs', 'Review': 'Prüfen', 'Change': 'Wechseln',
        'Presets · Load, Save and Import/Export': 'Presets · Laden, Speichern und Import/Export', 'Perk categories': 'Perk-Kategorien',
        'Add or remove Perk levels': 'Perk-Stufen hinzufügen oder entfernen', '+ Add': '+ Hinzufügen', '− Remove': '− Entfernen',
        'Universe': 'Universum', 'Challenge mode': 'Challenge-Modus', 'Respec & Tools': 'Respec & Werkzeuge', 'Info Equality Scaling': 'Info Equality Scaling',
        'Your current run will end': 'Dein aktueller Durchlauf endet', 'No changes': 'Keine Änderungen', 'Edit': 'Ändern', 'Keep editing selection': 'Auswahl weiter bearbeiten',
        'Resources, buildings, jobs and current combat will reset. Permanent progress such as Perks, Helium/Radon and Bones is retained under the original rules.':
            'Ressourcen, Gebäude, Berufe und der laufende Kampf werden zurückgesetzt. Dauerhafter Fortschritt wie Perks, Helium/Radon und Knochen bleibt nach den Originalregeln erhalten.'
    };
    const amount = '(\\S+) (Helium|Radon|Bonus Points|Bonuspunkte)(?: Left Over| übrig)?';
    const challenge = name => name === 'No Challenge' ? 'Keine Challenge' : name;
    const portalPatterns = [
        [/^Selected: (.+)$/, (_, name) => 'Ausgewählt: ' + challenge(name)],
        [new RegExp('^' + amount + ' available · (\\S+) spent on Perks( · Hypothermia: Perk changes are disabled\\.)?$'),
            (_, n, what, spent, cold) => n + ' ' + res[what] + ' verfügbar · ' + spent + ' für Perks ausgegeben' + (cold ? ' · Hypothermia: Perk-Änderungen sind gesperrt.' : '')],
        [/^(\S+) left · (\S+) spent on Perks$/, (_, n, spent) => n + ' übrig · ' + spent + ' für Perks ausgegeben'],
        [/^Universe (\d) · (Helium|Radon)(?: · (.+))?$/, (_, n, what, name) => 'Universum ' + n + ' · ' + what + (name === undefined ? '' : ' · ' + challenge(name))],
        [/^Mode · (C[²³]) bonus (\S+)$/, (_, c, n) => 'Modus · ' + c + '-Bonus ' + n],
        [/^Increase (.+): (.+)$/, (_, perk, price) => perk + ' erhöhen: ' + price],
        [/^Remove (.+): Original amount$/, (_, perk) => perk + ' senken: ursprünglicher Betrag'],
        [/^Edit (Challenge|Perks)$/, (_, what) => what + ' ändern']
    ];
    // Leading and trailing whitespace stays (text nodes such as " earned in total").
    function portalText(value) {
        if (typeof value !== 'string') return value;
        const core = value.trim();
        if (!core || !/[A-Za-z]/.test(core)) return value;
        let next = Object.hasOwn(portal, core) ? portal[core] : null;
        if (next === null) { const branded = brand(core); if (Object.hasOwn(portal, branded)) next = portal[branded]; }
        if (next === null) for (const [pattern, replace] of portalPatterns) { const match = core.match(pattern); if (match) { next = replace(...match); break; } }
        if (next === null) return value;
        const at = value.indexOf(core);
        return value.slice(0, at) + next + value.slice(at + core.length);
    }
    // The original confirmation of a new run (activateClicked in main.js), on the original markup or as the browser
    // serializes it (double quotes, &gt;). Every pattern needs English words, so a German result never matches again.
    const confirmation = [
        [/You are about to run the (<b[^>]*>)(.+?) Challenge(<sup>\d<\/sup>)?<\/b>/g, (_, b, name, sup) => 'Du startest gleich ' + b + 'die Challenge' + (sup || '') + ' ' + name + '</b>'],
        [/You don't have a Challenge selected! Challenges add some extra rules to your Portal in exchange for a reward at the end\. Click that you're not ready and select one from the right side of this screen!/g,
            () => 'Du hast keine Challenge gewählt! Challenges geben deinem Portal zusätzliche Regeln und am Ende eine Belohnung. Geh zurück und wähle eine Challenge aus!'],
        [/You can disable this warning under Settings -(?:>|&gt;) Pop-ups and Alerts\./g, () => 'Diese Warnung kannst du in den Einstellungen unter Pop-ups und Hinweise abschalten.'],
        [/Are you sure you want to enter the portal\? You will lose all progress other than the portal-compatible upgrades you've earned, such as Helium, Perks, Bones, and (?:Rare Kin|Exotic Imports)\. Who knows where or when it will send you\./g,
            () => 'Willst du das Portal wirklich betreten? Du verlierst allen Fortschritt außer den portaltauglichen Verbesserungen, die du verdient hast, etwa Helium, Perks, Knochen und Rare Kin. Wer weiß, wohin oder wann es dich schickt.'],
        [/^All set\?$/, () => 'Alles bereit?'],
        [/You still have the Daily challenge active! If you portal right now, your reward will be applied at the beginning of your next run\. Alternatively, click 'Finish Daily' in the World or inside 'View Perks' to get the bonus now\./g,
            () => 'Deine Daily-Challenge läuft noch! Nutzt du jetzt das Portal, erhältst du die Belohnung zu Beginn deines nächsten Durchlaufs. Du kannst auch in der Welt oder unter ‚View Perks‘ auf ‚Finish Daily‘ tippen, um den Bonus sofort zu bekommen.'],
        [/You have (\S+) extra Heirlooms? \(highest rarity is ([^)<]+)\), which will be recycled for (\S+) Nullifium {1,2}(?:and (\S+) Spirestones )?if you portal now\. Make sure you carry any that you want to save!/g,
            (_, n, rarity, nu, stones) => 'Du hast ' + n + ' ' + one(n, 'überzähliges Heirloom', 'überzählige Heirlooms') + ' (höchste Seltenheit: ' + rarity + '). Nutzt du jetzt das Portal, ' +
                one(n, 'wird es', 'werden sie') + ' für ' + nu + ' Nullifium' + (stones ? ' und ' + stones + ' Spirestones' : '') + ' recycelt. Nimm alle mit, die du behalten willst!'],
        [/You have (\S+) Magmite, which is enough purchase an upgrade for your Dimensional Generator! If you portal now, (\d+)% of your Magmite will decay\./g,
            (_, n, pct) => 'Du hast ' + n + ' Magmite, genug für ein Upgrade deines Dimensional Generator! Nutzt du jetzt das Portal, zerfallen ' + pct + '% deines Magmite.'],
        [/>Spend Magmite</g, () => '>Magmite ausgeben<'],
        // Step 4i: the Challenge² line of the review (getSquaredDescriptionInRun(true) in main.js) uses the sentence frames of
        // the challenge catalog, so it reads like View Perks; it ends with its own </b>.
        [/(<div class=["']squaredError portalError["']>)(<b>You are currently at Zone [\s\S]*?<\/b>)(?=<\/div>)/g,
            (_, open, line) => open + (typeof MobileI18nDeChallenges === 'undefined' ? line : MobileI18nDeChallenges.framed(line))]
    ];
    const portalHtml = value => typeof value === 'string' ? confirmation.reduce((text, [pattern, replace]) => text.replace(pattern, replace), brand(value)) : value;
    // Mutator descriptions by key (branded English of objects.js); getters are matched by templates below.
    const mutators = {
        Scruffy: 'Scruffy erhält 30% mehr Exp aus allen Quellen.',
        NovaScruff: 'Scruffy erhält 300% der Exp der Zone, wenn du einen primären Nova-Gegner tötest.',
        Worship: 'Je Zone überlegt es sich ein Anbeter anders und bleibt.',
        Nullifium: 'Du erhältst 10% mehr Nullifium beim Recyceln von Heirlooms.',
        Heirlots: 'In U2 über Z200 steigt die Chance auf deine höchste verfügbare Heirloom-Stufe um 5%, die Chance auf die niedrigste sinkt um 5%.',
        Heirmazing: 'In U2 findest du alle Heirlooms 1 Belohnungsstufe höher als normal.',
        Slowva: 'Greifst du einen Nova-Gegner an, erhältst du nur alle 2 Angriffe einen Stapel Blinded.',
        Poppin: '+5% Chance, dass in Mutated-Zonen eine zusätzliche Nova erscheint.',
        Worship2: 'Anbeter verlassen Scruffy nicht mehr.',
        Health: 'Du erhältst in U2 +50% Health.',
        Trimps: 'In U2 passen 50% mehr Scruffies in die Unterkünfte.',
        Tauntimps: 'Hast du in U2 alle 10 Zonen weniger Teasekins gesehen als erwartet, wird die fehlende Zahl sofort gezüchtet. Erwarte alle 10 Zonen 2 Teasekins mehr als sonst.',
        AvgExotic: 'Hast du in U2 ab Zone 15 alle 10 Zonen weniger Lashkins, Sproutkins oder Magnettles gesehen als erwartet, wird die fehlende Zahl sofort gezüchtet. Erwarte alle 10 Zonen von jedem 2 mehr als sonst.',
        Attack: 'Du erhältst in U2 +50% Attack.',
        Radon: 'Du erhältst 25% mehr Radon aus Mutationen in U2.',
        AllRadon: 'Du erhältst in U2 über Z201 +50% Radon.',
        Unrage: 'Raging-Felder beginnen mit 4-facher statt 5-facher Attack.',
        CritChance: 'Du erhältst in U2 +25% Krit-Chance.',
        GeneHealth: 'Teilt das Zuwachstempo durch 50 und multipliziert die Health mit 10.',
        GeneAttack: 'Teilt das Zuwachstempo durch 50 und multipliziert die Attack mit 10.',
        Ragiffium: 'Raging-Felder lassen 5% des Nullifium-Werts der höchsten verfügbaren Heirloom-Stufe deiner aktuellen Zone fallen.',
        Decompress: 'Compressed-Gegner erhalten je enthaltenem Feld 20% weniger Attack und Health.',
        MaxOverkill: 'Bei Overkill in U2 erfasst Overkill +1 Feld.',
        Smashing: '+5% Chance, dass in Mutated-Zonen ein zusätzliches Compressed-Feld erscheint.',
        Smashing2: '+5% Chance, dass in Mutated-Zonen ein zusätzliches Compressed-Feld erscheint.',
        MaZ: 'Du erhältst in Universum 2 eine zusätzliche Zeile für Map at Zone.',
        Loot: 'Alle Beute außer Radon steigt in U2 um 50%.',
        RandLoot: 'Felder in Randomized-Reihen lassen beim Tod je Reihennummer, mit der sie getauscht wurden, 0.5 Sekunden der Nahrungs-, Holz- und Metallproduktion fallen. Kämpfst du zum Beispiel in Reihe 2 gegen ein Feld mit den Werten aus Reihe 9, erhältst du je Feld 4.5 Sekunden Produktion. Deine Anbeter machen sich nichts aus dieser mutierten Nahrung, deine übrigen Scruffies haben nichts dagegen.',
        Dust: 'Huffy erhält 25% mehr Dust aus allen Quellen.',
        RandLoot2: 'Randomized-Reihen bringen 50% mehr Sekunden Beute (0.75 Sekunden je Reihe).',
        Dust2: 'Huffy erhält weitere 25% Dust aus allen Quellen.',
        Runed: 'Erhöht deine Obergrenze für Runetrinkets um 50%. Gibst du diesen Mutator wieder ab, endet jeder Bonus aus Runetrinkets über deiner Obergrenze, die Runetrinkets selbst bleiben aber.',
        MadMap: '100% deines Schadens können in Maps jeder Stufe Overkill erzielen. Liegt die Map über deiner Overkill-Zone in der Welt, erfasst Overkill höchstens 1 Feld.',
        Randimp1: 'Oddles geben beim Fund die Beute von zwei verschiedenen Rare Kin.',
        Randimp2: 'Oddles geben beim Fund die Beute von drei verschiedenen Rare Kin.'
    };
    // English of each fixed description, to check that the original text is still the one translated.
    const mutatorEnglish = {};
    const mutatorGetters = [
        [/^0\.5% of your damage can Overkill 1 cell in U2, up to 30% of your Highest Zone reached \(Overkill up to Z(\d+)\)\. U1 Masteries that increase Overkill do not apply in U2\.$/,
            (_, zone) => '0.5% deines Schadens können in U2 Overkill auf 1 Feld erzielen, bis 30% deiner höchsten erreichten Zone (Overkill bis Z' + zone + '). Masteries aus U1, die Overkill erhöhen, wirken in U2 nicht.'],
        [/^You can Overkill in U2 for an additional 10% of your Highest Zone \(up to (\d+)% of Highest Zone, or Z(\d+)\)\.$/,
            (_, pct, zone) => 'Overkill wirkt in U2 für weitere 10% deiner höchsten Zone (bis ' + pct + '% deiner höchsten Zone, also Z' + zone + ').'],
        [/^You can Liquify Zones up to 10% of your Highest Zone\. \(Up to Z(\d+)\)$/, (_, zone) => 'Liquification wirkt in Zonen bis 10% deiner höchsten Zone (bis Z' + zone + ').'],
        [/^You can Liquify for an additional 10% of your Highest Zone \(up to 20% of Highest Zone, or Z(\d+)\)$/,
            (_, zone) => 'Liquification wirkt für weitere 10% deiner höchsten Zone (bis 20% deiner höchsten Zone, also Z' + zone + ').'],
        [/^Your Overkill Zones no longer start until after Liquification\.(?: \(With your currently purchased Mutators, Overkill up to (\S+)% of Highest Zone, or Z(\d+)\))?$/,
            (_, pct, zone) => 'Deine Overkill-Zonen beginnen erst nach der Liquification.' + (pct ? ' (Mit deinen gekauften Mutators reicht Overkill bis ' + pct + '% deiner höchsten Zone, also Z' + zone + '.)' : '')],
        [/^Increases Scruffy Attack by a number based on your total stored Science\. Grants \+30% Attack at (\S+) Science, or \+300% at (\S+)\. At your current total of (\S+) Science, <b>you (are gaining|would gain) \+(\S+)% Scruffy Attack<\/b>$/,
            (_, low, high, now, state, n) => 'Erhöht die Attack der Scruffies abhängig von deiner gelagerten Wissenschaft: +30% Attack bei ' + low + ' Wissenschaft, +300% bei ' + high + '. Bei deinen derzeit ' + now + ' Wissenschaft <b>' +
                (state === 'are gaining' ? 'erhältst du +' + n + '% Attack' : 'würdest du +' + n + '% Attack erhalten') + '</b>.']
    ];
    function mutatorText(english) {
        if (typeof english !== 'string') return null;
        const branded = brand(english);
        for (const [pattern, replace] of mutatorGetters) { const match = branded.match(pattern); if (match) return replace(...match); }
        return null;
    }
    const seen = new WeakSet();
    function translateMutators(tree) {
        if (!tree || seen.has(tree)) return;
        seen.add(tree);
        for (const [key, item] of Object.entries(tree)) {
            const d = Object.getOwnPropertyDescriptor(item, 'description');
            if (!d) continue;
            if (d.get) Object.defineProperty(item, 'description', {...d, get() { const value = d.get.call(this); return mutatorText(value) ?? value; }});
            else if (typeof d.value === 'string' && Object.hasOwn(mutators, key)) { mutatorEnglish[key] = d.value; item.description = mutators[key]; }
        }
    }
    // Watched areas of the main catalog: fixed original buttons of the Portal, the Mutator header and panel, and the tooltip
    // window (already watched) for Mastery Info, Respec and Mutator tooltips.
    const strings = {
        // Portal (index.html, main.js, objects.js)
        'Clear All Perks': 'Alle Perks zurücksetzen', 'View Current Challenge': 'Aktuelle Challenge ansehen', 'Select New Challenge': 'Neue Challenge wählen',
        'Helium Left Over': 'Helium übrig', 'Radon Left Over': 'Radon übrig', 'Bonus Points': 'Bonuspunkte',
        'Respec Mutators On Portal': 'Mutator-Respec beim Portal', 'Cancel Mutator Respec': 'Mutator-Respec abbrechen',
        'You can respec your perks once per portal. Clicking cancel after clicking this button will not consume your respec.':
            'Einen Respec deiner Perks hast du einmal pro Portal. Tippst du nach diesem Knopf auf Abbrechen, wird dein Respec nicht verbraucht.',
        'You can only respec your Mutators when you are activating your Portal. Make sure your Mutator setup will work for your entire run!':
            'Einen Respec deiner Mutators gibt es nur beim Aktivieren deines Portals. Achte darauf, dass deine Mutators für den ganzen Durchlauf passen!',
        'Swap to Mutators': 'Zu den Mutators',
        // Mutator header (objects.js openTree) and own panel (mobile-late-systems.js)
        'Show Names': 'Namen zeigen', 'Hide Names': 'Namen verbergen', 'Show Masteries': 'Masteries zeigen', 'close': 'Schließen',
        'Center': 'Mitte', 'Mastery Information': 'Mastery-Info', 'Zoom in': 'Vergrößern', 'Zoom out': 'Verkleinern', 'Buy Mutator': 'Mutator kaufen', 'Requirements not met.': 'Voraussetzungen nicht erfüllt.',
        'Select a Mutator to see its effect and cost. Selecting does not purchase.': 'Wähle einen Mutator, um Wirkung und Kosten zu sehen. Auswählen kauft ihn nicht.',
        // Mastery Info (updates.js), Respec Masteries and its confirmation
        'Blacksmithery Not Purchased': 'Blacksmithery nicht gekauft', 'Hyperspeed Not Purchased': 'Hyperspeed nicht gekauft',
        'Liquification not owned in this Universe': 'Liquification besitzt du in diesem Universum nicht', 'Overkill not owned in this Universe': 'Overkill besitzt du in diesem Universum nicht',
        'Click to Respec, refunding all Dark Essence that was spent on Masteries.': 'Tippe für einen Respec: Alle für Masteries ausgegebene Dark Essence wird erstattet.',
        'This will return all Dark Essence that was spent on Masteries at the cost of 20 bones. Are you sure?': 'Damit erhältst du alle für Masteries ausgegebene Dark Essence zurück; das kostet 20 Knochen. Bist du sicher?',
        'Free!': 'Gratis!', '20 Bones': '20 Knochen'
    };
    const seeds = /^Seeds Available: (\S+)([\s ]+\|[\s ]+)(?:Next Mutator Costs: (\S+)|All Mutators Purchased!)$/;
    const patterns = [
        [/^Change to Universe (\d)$/, (_, n) => 'Zu Universum ' + n + ' wechseln'],
        [seeds, (_, n, bar, cost) => 'Verfügbare Seeds: ' + n + bar + (cost ? 'Nächster Mutator kostet: ' + cost : 'Alle Mutators gekauft!')],
        [/^Cost: (\S+) Seeds$/, (_, n) => 'Kosten: ' + n + ' Seeds'],
        [/^You need (\S+) more Seeds to afford this!$/, (_, n) => 'Dir fehlen noch ' + n + ' Seeds, um dir das leisten zu können!'],
        [/^You must first purchase (.+)!$/, (_, list) => 'Kaufe zuerst ' + list.replace(/,? (?:and|-or-) (?=[^,]*$)/, m => / -or- /.test(m) ? ' oder ' : ' und ') + '!'],
        [/^Purchase (\d+) more Mutators? to unlock this ring!$/, (_, n) => 'Kaufe noch ' + n + ' ' + one(n, 'Mutator', 'Mutators') + ', um diesen Ring freizuschalten!'],
        [/^U(\d) Masteries and Helpful Info:$/, (_, n) => 'Masteries in U' + n + ' und nützliche Infos:'],
        [/^You can Liquify in this Universe through Z(\d+) \((\d+)% of your highest Zone reached\)\.$/, (_, zone, pct) => 'In diesem Universum wirkt Liquification bis Z' + zone + ' (' + pct + '% deiner höchsten erreichten Zone).'],
        [/^You can Overkill (\d+) cells? in this Universe(?: through Z(\d+) \((\d+)% of your highest Zone reached\))?\.$/,
            (_, n, zone, pct) => 'In diesem Universum erfasst Overkill ' + n + ' ' + one(n, 'Feld', 'Felder') + (zone ? ' bis Z' + zone + ' (' + pct + '% deiner höchsten erreichten Zone)' : '') + '.'],
        [/^Your first 3 Respecs are free, and you still have (\d+) left! When there are no more left, each respec will cost 20 Bones\.$/,
            (_, n) => 'Deine ersten 3 Respecs sind gratis, und du hast noch ' + n + ' übrig! Danach kostet jeder Respec 20 Knochen.'],
        [/^This will return all Dark Essence that was spent on Masteries, and will use (one of )?your remaining (\d+) free Mastery Respecs?\.$/,
            (_, of, n) => 'Damit erhältst du alle für Masteries ausgegebene Dark Essence zurück; dafür ' + (of ? 'verbrauchst du einen deiner ' + n + ' verbleibenden kostenlosen Mastery-Respecs.' : 'verbrauchst du deinen letzten kostenlosen Mastery-Respec.')]
    ];
    const probe = /^(?:Change to Universe |Seeds Available: |Cost: \S+ Seeds$|You need \S+ more Seeds|You must first purchase |Purchase \d+ more Mutator|U\d Masteries and|You can Liquify in this|You can Overkill \d|Your first 3 Respecs|This will return all Dark)/;
    const scope = '#clearPerksBtn,#swapToCurrentChallengeBtn,#swapPortalUniverseBtn,#portalHelium,#respecMutatorsBtn,#swapToMutatorsBtn,' +
        '.ml-mut-header>h1,#mutTreeCloseBtn,#mutSeedCounter,#u2MutShowNameBtn,#swapToMasteryBtn,#mutZoomButtons>button,#mutZoomIn,#mutZoomOut,#ml-mut-detail>p,#ml-mut-detail>button';
    const catalog = {portal, portalPatterns, portalText, portalHtml, confirmation, mutators, mutatorEnglish, mutatorGetters, mutatorText, strings, patterns, probe, scope};
    function install(win) {
        const layer = win.MobileI18nGame;
        if (!layer || !layer.active || layer.lang !== 'de') return false;
        if (win.u2Mutations) translateMutators(win.u2Mutations.tree);
        layer.extend('de', {strings, patterns, probe, scope});
        if (win.MobilePortal && typeof win.MobilePortal.translate === 'function') win.MobilePortal.translate(portalText, portalHtml);
        return true;
    }
    catalog.install = install;
    catalog.translateMutators = translateMutators;
    if (typeof window !== 'undefined') install(window);
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDePortal;
