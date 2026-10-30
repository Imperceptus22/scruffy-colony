// V-243: German texts of the original game (stage 2), with the names of the project glossary. Keys are the original
// engine keys (names) or the English text after branding (strings); saves and engine keys are never changed.
var MobileI18nDeGame = (() => {
    const names = {
        buildings: {
            Trap:'Falle',Barn:'Scheune',Shed:'Schuppen',Forge:'Schmiede',Hut:'Hütte',House:'Haus',Mansion:'Villa',Hotel:'Hotel',Resort:'Resort',
            Gateway:'Dimensionstor',Wormhole:'Wurmloch',Collector:'Sammler',Warpstation:'Warpstation',Hub:'Knotenpunkt',Gym:'Trainingshalle',
            Smithy:'Rüstschmiede',Tribute:'Tribut',Nursery:'Kinderstube',Microchip:'Mikrochip',Antenna:'Antenne',Laboratory:'Labor'
        },
        jobs: {
            Farmer:'Bauer',Lumberjack:'Holzfäller',Miner:'Bergmann',Scientist:'Forscher',Trainer:'Trainer',Explorer:'Entdecker',Dragimp:'Draken',
            Geneticist:'Genetiker',Magmamancer:'Magmamant',Amalgamator:'Amalgamator',Meteorologist:'Meteorologe',Worshipper:'Anbeter'
        },
        equipment: {
            Shield:'Schild',Dagger:'Dolch',Boots:'Stiefel',Mace:'Streitkolben',Helmet:'Helm',Polearm:'Stangenwaffe',Pants:'Hose',Battleaxe:'Streitaxt',
            Shoulderguards:'Schulterschutz',Greatsword:'Zweihänder',Breastplate:'Brustpanzer',Arbalest:'Armbrust',Gambeson:'Gambeson'
        },
        upgrades: {
            attackRelic:'Angriffsrelikt',enemyAttackRelic:'Gegnerangriffsrelikt',radonRelic:'Radonrelikt',scienceRelic:'Ressourcenrelikt',breedRelic:'Brutrelikt',
            Coordination:'Koordination',Gigastation:'Gigastation',Battle:'Kampfkunst',Bloodlust:'Blutrausch',Prismatic:'Prisma',Blockmaster:'Blockmeister',
            Trapstorm:'Fallensturm',Shieldblock:'Schildblock',Bounty:'Kopfgeld',Egg:'Ei',Prismalicious:'Prismapracht',Anger:'Zorn',Rage:'Wut',
            Gymystic:'Gymystik',SuperShriek:'Superschrei',Formations:'Formationen',Dominance:'Dominanz',Barrier:'Barriere',
            Miners:'Bergleute',Scientists:'Forschergruppe',Trainers:'Trainerteam',Explorers:'Entdeckertrupp',Magmamancers:'Magmamanten',
            UberHut:'Super-Hütte',UberHouse:'Super-Haus',UberMansion:'Super-Villa',UberHotel:'Super-Hotel',UberResort:'Super-Resort',
            Supershield:'Schildschmied',Dagadder:'Messerkunst',Bootboost:'Stiefelnaht',Megamace:'Keulenkunst',Hellishmet:'Hartkappe',Polierarm:'Langschaft',
            Pantastic:'Festnaht',Axeidic:'Axtkunst',Smoldershoulder:'Breitschulter',Greatersword:'Breitklinge',Bestplate:'Brustschmiede',Harmbalest:'Bolzenwerk',GambesOP:'Steppwerk',
            Potency:'Potenz',TrainTacular:'Trainingswunder',Efficiency:'Effizienz',
            Speedminer:'Erzgespür',Speedlumber:'Scharfe Äxte',Speedfarming:'Reiche Ernte',Speedscience:'Geistesblitz',Speedexplorer:'Schnellentdeckung',
            Megaminer:'Megabergbau',Megalumber:'Megaholz',Megafarming:'Megaernte',Megascience:'Megaforschung'
        }
    };
    // Display names by engine key and by the branded label (Knifecraft …), for composed labels such as "Info Dagadder".
    const brand = value => typeof MobileBranding === 'undefined' ? value : MobileBranding.text(value);
    // V-243 step 4d: the reward of a Scientist level (getScientistInfo in main.js) in the Microchip sentence, German from the
    // challenge catalog (loaded later, looked up when the sentence is translated); unknown rewards stay English.
    const scientistReward = what => { const rewards = typeof MobileI18nDeChallenges === 'undefined' ? [] : MobileI18nDeChallenges.scientistRewards || []; const hit = rewards.find(([english]) => english === what); return hit ? hit[1] : what; };
    let byLabel = null;
    function nameOf(value) {
        if (!byLabel) {
            byLabel = new Map();
            for (const type of Object.keys(names)) for (const [key, german] of Object.entries(names[type])) { byLabel.set(key, german); byLabel.set(brand(key), german); }
        }
        return byLabel.get(value) ?? value;
    }
    // Time words of the original (calculateTimeToMax, build queue) and the short Diorama forms (mobile-ui.js shortTime).
    const units = [[/\b1 Years?\b/g, '1 Jahr'], [/\b(\S+) Years?\b/g, '$1 Jahre'], [/\b1 Days?\b/g, '1 Tag'], [/\b(\d+) Days?\b/g, '$1 Tage'],
        [/\b(\d+) Hours?\b/g, '$1 Std.'], [/\b(\d+) Mins?\b(?!\.)/g, '$1 Min.'], [/\b(\d+(?:\.\d+)?) (?:Secs?|Seconds?)\b/g, '$1 Sek.'],
        [/\bLong Time\b/g, 'Sehr lange'], [/(^|\()(\d+)d (\d+)h(?=$|\))/g, '$1$2 T $3 h'], [/(^|\()(\S+) y(?=$|\))/g, '$1$2 J']];
    const time = value => units.reduce((text, [pattern, german]) => text.replace(pattern, german), value);
    // Only English words: "Min." (German) must never match again, or the observer would rewrite its own result.
    const timeWords = /\b(?:Years?|Days?|Hours?|Mins?(?!\.)|Secs?|Seconds?|Long Time)\b|(?:^|\()\d+d \d+h(?:$|\))|(?:^|\()\S+ y(?:$|\))/;
    const resources = 'Food|Wood|Metal|Science|Gems|Fragments|Helium|Radon';
    // V-251: the basic resources read German (glossary); Helium and Radon stay names. Save keys (food, wood …) never change.
    const resourceNames = {Food:'Nahrung', Wood:'Holz', Metal:'Metall', Science:'Wissenschaft', Gems:'Edelsteine', Fragments:'Fragmente', Helium:'Helium', Radon:'Radon'};
    const costWords = {Food:'Nahrungskosten', Wood:'Holzkosten', Metal:'Metallkosten', Science:'Wissenschaftskosten', Gems:'Edelsteinkosten', Fragments:'Fragmentkosten', Helium:'Heliumkosten', Radon:'Radonkosten'};
    // The original also writes the save keys (food: 10 (5 Mins), "Needs science", info "metal"); shown, they read German too.
    const keyNames = {food:'Nahrung', wood:'Holz', metal:'Metall', science:'Wissenschaft', gems:'Edelsteine', fragments:'Fragmente', helium:'Helium', radon:'Radon'};
    const keyed = text => text.replace(/(^|, )(food|wood|metal|science|gems|fragments|helium|radon)(?=:\s)/g, (_, before, key) => before + keyNames[key]);
    const strings = {
        'Food': 'Nahrung', 'Wood': 'Holz', 'Metal': 'Metall', 'Science': 'Wissenschaft', 'Gems': 'Edelsteine', 'Fragments': 'Fragmente',
        'food': 'Nahrung', 'wood': 'Holz', 'metal': 'Metall', 'science': 'Wissenschaft', 'gems': 'Edelsteine', 'fragments': 'Fragmente',
        // Colony pages, tiles and build queue (mobile-inventory.js, mobile-ui.js, mobile-design.js)
        'Buildings': 'Gebäude', 'Equipment': 'Ausrüstung', 'Upgrades': 'Forschung', 'Jobs': 'Berufe',
        'Build Queue': 'Bauliste', 'No buildings queued': 'Keine Gebäude in der Bauliste', 'Show or hide build queue': 'Bauliste ein- oder ausblenden',
        // V-268: the Build button reads German like the guided start that names it.
        'Build': 'Bauen', 'Build manually · Build': 'Selbst bauen · Bauen', 'Build manually · Bauen': 'Selbst bauen · Bauen', 'Build manually · Baut': 'Selbst bauen · Baut', 'Building': 'Baut', 'Paused': 'Pausiert',
        'owned': 'vorhanden', 'Owned:': 'Anzahl:', 'Building · Details': 'Baut · Details', 'Waiting · Details': 'Wartet · Details', 'Level': 'Stufe', 'Level:': 'Stufe:', 'Buy': 'Kaufen', 'Upgrade': 'Verbessern',
        'Custom amount': 'Eigene Menge', 'Colony': 'Kolonie',
        'Outlined: lowest Food + Wood + Metal cost per added Scruffy. Gems and Fragments ignored; Helium housing excluded.':
            'Umrandet: geringste Kosten an Nahrung, Holz und Metall je zusätzlichem Scruffy. Edelsteine und Fragmente zählen nicht; Unterkünfte für Helium sind ausgenommen.',
        'Housing value: Food + Wood + Metal cost per added Scruffy. Gems and Fragments ignored.':
            'Wohnwert: Kosten an Nahrung, Holz und Metall je zusätzlichem Scruffy. Edelsteine und Fragmente zählen nicht.',
        // Resources and population
        'Gather': 'Sammeln', 'Gathering': 'Sammelt', 'Chop': 'Hacken', 'Chopping': 'Hackt', 'Mine': 'Abbauen', 'Mining': 'Baut ab',
        'Research': 'Forschen', 'Researching': 'Forscht', 'Gather a resource': 'Ressource sammeln', 'Population details': 'Details zur Bevölkerung',
        'Check Traps (': 'Fallen prüfen (', 'Trapping (': 'Fängt (', 'free workspaces': 'freie Arbeitsplätze', 'free workspace': 'freier Arbeitsplatz',
        'While gathering Food, Wood or Metal': 'Beim Sammeln von Nahrung, Holz oder Metall', 'permanent': 'dauerhaft', 'Permanent bonus': 'Dauerhafter Bonus', 'Time remaining': 'Restzeit',
        // Combat page
        'Combat': 'Kampf', 'Combat Log': 'Kampfprotokoll', 'Combat tools': 'Kampfwerkzeuge', 'Damage': 'Schaden', 'Zone and map info': 'Zonen- und Map-Info',
        'Story': 'Geschichte', 'Loot': 'Beute', 'Unlocks': 'Freischaltungen', 'Configure messages': 'Meldungen einstellen',
        'AutoFight On': 'AutoFight an', 'AutoFight Off': 'AutoFight aus', 'AutoStorage On': 'AutoStorage an', 'AutoStorage Off': 'AutoStorage aus', 'Auto On': 'Auto an', 'Auto Off': 'Auto aus',
        'Repeat On': 'Wiederholen an', 'Repeat Off': 'Wiederholen aus', 'Return queued': 'Rückkehr geplant', 'World': 'Welt',
        // V-260: map chamber (stock and cost box) and the Equipment Optimization card of the app (mobile-equipment-research.js)
        'Available Fragments': 'Verfügbare Fragmente', 'Map cost': 'Map-Kosten', 'Choose a valid level': 'Wähle eine gültige Stufe',
        'Equipment Optimization': 'Ausrüstungsoptimierung', 'Owned: 0': 'Anzahl: 0', 'Research Equipment Optimization': 'Ausrüstungsoptimierung erforschen',
        'Info Equipment Optimization': 'Info Ausrüstungsoptimierung', 'Science 1.00K · Gems 500': 'Wissenschaft 1.00K · Edelsteine 500', 'Saving research…': 'Forschung wird gespeichert…',
        'Unlock Buy best for weapons and armor. Each tap buys the current efficiency recommendation. All 11 early equipment pieces must reach prestige II. Costs 1,000 Science and 500 Gems once. Kept through portals.':
            'Schaltet \'Buy best\' für Waffen und Rüstung frei. Jedes Tippen kauft die aktuelle Empfehlung nach Effizienz. Alle 11 frühen Ausrüstungsteile müssen Prestige II erreichen. Kostet einmalig 1000 Wissenschaft und 500 Edelsteine. Bleibt über Portale erhalten.',
        'Research complete. Buy best is unlocked.': 'Forschung abgeschlossen. \'Buy best\' ist freigeschaltet.',
        'Research result is unverified. Reload to recover the stored save.': 'Das Forschungsergebnis ist nicht bestätigt. Lade neu, um den gespeicherten Spielstand wiederherzustellen.',
        'Research was not applied. Your previous save is preserved.': 'Die Forschung wurde nicht übernommen. Dein bisheriger Spielstand bleibt erhalten.'
    };
    // V-260: job prices with the resource in front ("wood 5 · 0%", several kinds of cost) read German; "Cost food wood:" lists them.
    const keySource = 'food|wood|metal|science|gems|fragments|helium|radon';
    const spaced = text => text.replace(new RegExp('(^|, |: )(' + keySource + ')(?= [\\d∞])', 'g'), (_, before, key) => before + keyNames[key]);
    const keyList = text => text.replace(new RegExp('^(?:' + keySource + ')(?: (?:' + keySource + '))+(?=:\\s)'), list => list.split(' ').map(key => keyNames[key]).join(', '));
    const actions = {Buy:'Kaufen', Upgrade:'Verbessern', Fire:'Entlassen', Hire:'Einstellen'};
    const patterns = [
        [/^Build Queue · (\d+) types?$/, (_, n) => 'Bauliste · ' + n + (n === '1' ? ' Art' : ' Arten')],
        [/^(\S+) ×(\d+) · (.+)$/, (_, key, n, rest) => nameOf(key) + ' ×' + n + ' · ' + (rest === 'Waiting' ? 'Wartet' : time(rest).replace(/^(\S+) s$/, '$1 Sek.'))],
        [/^\+(\S+) queued$/, (_, n) => '+' + n + ' geplant'],
        // V-279: the tile of the building under construction (mobile-inventory.js).
        [/^\+(\S+) building$/, (_, n) => '+' + n + ' im Bau'],
        // Screen reader labels name the item first, as German says it: "Falle kaufen", "Bauer einstellen".
        [/^(Buy|Upgrade|Info|Fire|Hire|Erforschen|Kaufen|Verbessern) (\S+)$/, (_, action, key) => action === 'Info' ? 'Info ' + nameOf(key) : nameOf(key) + ' ' + (actions[action] || action).toLowerCase()],
        [/^(\S+) ×(\S+)$/, (_, key, n) => nameOf(key) + ' ×' + n],
        [/^Cancel order (\d+) · ×(\S+)$/, (_, n, amount) => 'Auftrag ' + n + ' abbrechen · ×' + amount],
        [/^Worker bonus: (.+)$/, (_, resource) => 'Bonus für Arbeitskräfte: ' + (resourceNames[resource] || resource)],
        [/^(\+\S+) (Health|Attack) per level$/, (_, n, stat) => n + ' ' + stat + ' je Stufe'],
        [new RegExp('^(?:(?:' + resources + ') cost: \\S+(?: \\(not enough\\))?(?:, |$))+$'), all => all.replace(new RegExp('(' + resources + ') cost: ', 'g'), (_, resource) => costWords[resource] + ': ').replace(/ \(not enough\)/g, ' (reicht nicht)')],
        [/^Cost (.+)$/, (_, rest) => 'Kosten ' + spaced(keyed(keyList(time(rest))))],
        [new RegExp('^(?:(?:' + keySource + ') [\\d∞][^,]*(?:, |$))+$'), all => spaced(time(all))],
        [/^(\S+) Fragments$/, (_, n) => n + ' Fragmente'],
        [/^(Available|Remaining|Missing): (\S+)$/, (_, word, n) => ({Available:'Verfügbar', Remaining:'Übrig', Missing:'Fehlt'})[word] + ': ' + n],
        [new RegExp('^(Gather|Chop|Mine|Research) · (' + resources + ')$'), (_, action, resource) => strings[action] + ' · ' + resourceNames[resource]],
        [/^Plus hires, minus fires\. Amount: (.+)$/, (_, n) => 'Plus stellt ein, Minus entlässt. Menge: ' + n],
        [/^AutoFight · AutoFight (On|Off)$/, (_, on) => 'AutoFight · AutoFight ' + (on === 'On' ? 'an' : 'aus')],
        [/^(Story|Loot|Unlocks|Combat) messages on\/off$/, (_, kind) => 'Meldungen „' + strings[kind] + '“ ein/aus'],
        // V-258: a switched-off log filter reads "Unlocks off" (filterMessage in updates.js); German says "Freischaltungen aus".
        [/^(Story|Loot|Unlocks|Combat) off$/, (_, kind) => strings[kind] + ' aus'],
        [/^([+-]?\S+)\/sec$/, (_, n) => n + '/s'],
        // Cost lines (addTooltipPricing, colony prices): the resource keys read German (V-251), waiting times become German.
        [/^(?:food|wood|metal|science|gems|fragments|helium|radon):\s[\s\S]*$/, all => keyed(time(all))],
        [new RegExp('^(?=[\\s\\S]*\\([^()]*(?:' + timeWords.source + ')[^()]*\\)|[\\s\\S]*\\((?:\\d+d \\d+h|\\S+ y)\\)|(?:[\\d.,]+[A-Za-z]* (?:Years?|Days?|Hours?|Mins?|Secs?|Seconds?) ?)+$|Long Time$|\\d+d \\d+h$|\\S+ y$)[\\s\\S]+$'), all => time(all)]
    ];
    const probe = new RegExp('^(?:food|wood|metal|science|gems|fragments|helium|radon):\\s|×|queued| building$|^Cancel order|^Worker bonus|types?$|^(?:Buy|Upgrade|Info|Fire|Hire|Erforschen|Kaufen|Verbessern) |per level|cost: |^Cost |^(?:Gather|Chop|Mine|Research) · |Amount|AutoFight|messages| off$|/sec$|^(?:' + keySource + ') [\\d∞]| Fragments$|^(?:Available|Remaining|Missing): |' + timeWords.source);
    // Original areas of the main screen (stage 1 keeps the app's own frame): colony pages, combat page and the cost line of info windows.
    // V-260: of the map page only the chamber's fragment stock and cost box (own texts); presets and sliders are not watched.
    const scope = '#mobile-colony,#mobile-battle,#tipCost,#mobile-fragments,#mobile-map-cost';
    // Labels the stylesheets draw themselves (content:), German where the original layout shows them.
    const css = [
        // Long German names break with a hyphen in narrow tiles instead of inside a word (the drawn name carries lang="de").
        'html[data-language="de"] :is(.thingName,.mobile-tile-name) [lang="de"]{hyphens:auto;-webkit-hyphens:auto;overflow-wrap:normal;word-break:normal;}',
        // Setting names and states are German words of their own (the translation layer marks them lang="de").
        'html[data-language="de"] #settingsHere :is(.mobile-setting-name,.settingBtn)[lang="de"]{hyphens:auto;-webkit-hyphens:auto;overflow-wrap:normal;word-break:normal;}',
        // "Kaufen" and "Verbessern" are longer than Buy/Upgrade: the Diorama tile action keeps beside price and picture.
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page] #buyHere :is(#buildingsHere,#equipmentHere) .mobile-inventory-tile .diorama-action-label:not([hidden]){min-width:0!important;padding:0 7px!important;font-size:.72rem!important;}',
        // Only the active order gets a German word; waiting orders keep their × cancel mark (mobile-inventory.css).
        'html[data-language="de"] #queueItemsHere .queueItem:first-child::after{content:"Aktiv";}',
        // The Diorama log pictograms (V-258 A) carry a short caption per icon key; the key itself picks the icon and stays.
        // "Freisch." keeps the 60px pictogram at 360px with large text (the button text says "Freischaltungen").
        ...Object.entries({Story:'Geschichte', Loot:'Beute', Unlocks:'Freisch.', Combat:'Kampf'}).map(([key, german]) =>
            'html[data-graphics="diorama"][data-language="de"] body:is([data-diorama-page="battle"],[data-diorama-page="maps"]) #mobile-log-panel .logFlt[data-log-icon="' + key + '"]::after{content:"' + german + '";}'),
        'html[data-language="de"] #badGuyCol.mobile-enemy-pending::after{content:"Nächster Gegner:\\A" attr(data-enemy-name);}',
        'html[data-graphics="diorama"][data-language="de"] body:is([data-diorama-page="battle"],[data-diorama-page="maps"]) #battleBtnsColumn.mobile-combat-primary>#mobile-combat-more::after{content:"Werkzeuge";}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="resources"] #mobile-resource-block .mobile-fill-time::before{content:"Voll: ";}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="resources"] #mobile-resource-actions::before{content:"Ressourcen";}',
        'html[data-graphics="diorama"][data-language="de"] body:is([data-diorama-page="battle"],[data-diorama-page="maps"]) #battleContainer #gridRow>#mobile-combat-map-head #battleSideTitle[data-cell]:not([data-cells="0"])::before{content:"Feld " attr(data-cell) " von " attr(data-cells);}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="upgrades"] #upgradesHere .mobile-purchase:has(>.thingColorCanNotAfford)>.mobile-price[data-bottleneck]::before{content:"Braucht " attr(data-bottleneck);}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="upgrades"] #upgradesHere .mobile-purchase:has(>.thingColorCanNotAfford)>.mobile-price[data-bottleneck]>.mobile-storage-flag::before{content:"(Lager)";}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="upgrades"] #buyTabs::before{content:"Forschung";}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="upgrades"] #upgradesHere:has(>.goldenUpgradeThing:not([data-colony-page-hidden]))::before{content:"Goldenes Upgrade \\00b7  wähle eines";}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="upgrades"] #upgradesHere>.goldenUpgradeThing .thingOwned::before{content:"Gekauft ";}',
        // V-253: why Golden Upgrades appear (Diorama card row, Classic heading).
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="upgrades"] #upgradesHere:has(>.goldenUpgradeThing:not([data-colony-page-hidden]))::after{content:"Kostenlos. Ab 15% Erfolgsbonus alle 50 Zonen, mit höherem Bonus öfter. Antippen zeigt Details, dann wählen.";}',
        'html[data-language="de"]:not([data-graphics="diorama"]) #upgradesHere:has(>.goldenUpgradeThing:not([data-colony-page-hidden]))::before{content:"Goldenes Upgrade \\00b7  wähle eines";}',
        'html[data-language="de"]:not([data-graphics="diorama"]) #upgradesHere:has(>.goldenUpgradeThing:not([data-colony-page-hidden]))::after{content:"Kostenlos. Ab 15% Erfolgsbonus alle 50 Zonen, mit höherem Bonus öfter. Antippen zeigt Details, dann wählen.";}',
        'html[data-graphics="diorama"][data-language="de"] body[data-diorama-page="equipment"] #buyHere .mobile-inventory-tile [id$="Numeral"]:not(:empty)::before{content:"Rang ";}'
    ].join('\n');
    // Step 2: info texts of buildings, jobs, equipment and research. Keys are the original config texts with their
    // placeholders ($incby$, {s}, ~, $modifier$, <coord>, @, ?), which the original fills in after translation.
    // "Trimp{s}" stays in German texts where the original adds the plural; branding shows it as Scruffy/Scruffies.
    const tooltips = {
        'Increases your maximum food by 100%.': 'Erhöht dein Lager für Nahrung um 100%.',
        'Increases your maximum wood by 100%.': 'Erhöht dein Lager für Holz um 100%.',
        'Increases your maximum metal by 100%.': 'Erhöht dein Lager für Metall um 100%.',
        'Has room for $incby$ more lovely Trimp{s}. All Trimp housing has enough workspaces for only half of the Trimps that can live there.':
            'Bietet Platz für $incby$ weitere Trimp{s}. Jede Unterkunft hat nur für die Hälfte ihrer Bewohner Arbeitsplätze.',
        'A better house for your Trimps! Each house supports up to $incby$ more Trimp{s}.': 'Ein besseres Haus für deine Scruffies! Jedes Haus bietet Platz für bis zu $incby$ weitere Trimp{s}.',
        'A pretty sick mansion for your Trimps to live in. Each Mansion supports $incby$ more Trimp{s}.': 'Eine ziemlich schicke Villa für deine Scruffies. Jede Villa bietet Platz für $incby$ weitere Trimp{s}.',
        'A fancy hotel for many Trimps to live in. Complete with room service and a mini bar. Supports $incby$ Trimp{s}.': 'Ein feines Hotel für viele Scruffies, mit Zimmerservice und Minibar. Bietet Platz für $incby$ Trimp{s}.',
        'A huge resort for your Trimps to live in. Sucks for the ones still stuck in huts. Supports $incby$ Trimp{s}.': 'Ein riesiges Resort für deine Scruffies. Pech für alle, die noch in Hütten wohnen. Bietet Platz für $incby$ Trimp{s}.',
        'A Gateway to another dimension, where your Trimps can sleep and work. Supports $incby$ Trimp{s}.': 'Ein Tor in eine andere Dimension, in der deine Scruffies schlafen und arbeiten können. Bietet Platz für $incby$ Trimp{s}.',
        'Use your crazy, helium-cooled, easy-to-aim wormhole generator to create easy-to-travel links to other colonizable planets where your Trimps can sleep and work. Each supports $incby$ Trimps. <b>This building costs helium to create.</b>':
            'Dein verrückter, heliumgekühlter und leicht auszurichtender Wurmlochgenerator schafft bequeme Wege zu anderen besiedelbaren Planeten, auf denen deine Scruffies schlafen und arbeiten können. Jedes Wurmloch bietet Platz für $incby$ Scruffies. <b>Dieses Gebäude kostet Helium.</b>',
        'Each collector allows you to harvest more of the power of your home star, allowing your Trimps to colonize a larger chunk of your solar system. Each supports $incby$ Trimp{s}.':
            'Jeder Sammler erntet mehr Energie deines Heimatsterns, sodass deine Scruffies einen größeren Teil deines Sonnensystems besiedeln können. Jeder bietet Platz für $incby$ Trimp{s}.',
        'Create a gigantic Warpstation, capable of housing tons of Trimps and instantly transporting them back to the home planet when needed. Supports $incby$ Trimps.':
            'Baue eine gigantische Warpstation, die massenhaft Scruffies beherbergt und sie bei Bedarf sofort auf den Heimatplaneten zurückbringt. Bietet Platz für $incby$ Scruffies.',
        '<p>Cannot be purchased directly. Level is always equal to your total amount of Huts, Houses, Mansions, Hotels, Resorts, Gateways, and Collectors. Supports $incby$ Trimps.</p><p>Automatically unlocks on reaching Zone 60 in Universe 2</p>':
            '<p>Kann nicht direkt gekauft werden. Die Stufe entspricht immer der Gesamtzahl deiner Hütten, Häuser, Villen, Hotels, Resorts, Dimensionstore und Sammler. Bietet Platz für $incby$ Scruffies.</p><p>Wird automatisch freigeschaltet, sobald du in Universum 2 Zone 60 erreichst.</p>',
        'A building where your Trimps can work out. Each Gym increases the amount of damage each trimp can block by $incby$~':
            'Ein Gebäude, in dem deine Scruffies trainieren. Jede Trainingshalle erhöht den Schaden, den jeder Scruffy blocken kann, um $incby$~',
        'Pay a tribute of food to your Dragimp, increasing his appetite and his speed. He will gather gems 5% faster (compounding).':
            'Zahle deinem Draken einen Tribut in Nahrung. Das steigert seinen Appetit und sein Tempo: Er sammelt Edelsteine 5% schneller (multiplikativ).',
        'Construct a gem-powered nursery, where baby Trimps can grow up faster. Increases Trimps per second from breeding by 1% (compounding).':
            'Baue eine mit Edelsteinen betriebene Kinderstube, in der junge Scruffies schneller aufwachsen. Erhöht den Zuwachs an Scruffies pro Sekunde um 1% (multiplikativ).',
        "Congratulations, you've purchased all 5 Microchips!": 'Glückwunsch, du hast alle 5 Mikrochips gekauft!',
        // Jobs
        'Train one of your Trimps in the ancient art of farming. Each Farmer harvests $modifier$ food per second.': 'Bring einem deiner Scruffies die alte Kunst des Ackerbaus bei. Jeder Bauer erntet $modifier$ Nahrung pro Sekunde.',
        'Show a Trimp how to cut one of those weird trees down. Each Lumberjack hauls back $modifier$ logs per second.': 'Zeig einem Scruffy, wie man diese seltsamen Bäume fällt. Jeder Holzfäller schleppt $modifier$ Stämme pro Sekunde heran.',
        'Send your misbehaving Trimps to the mines for some therapeutic work. Each Miner can find and smelt $modifier$ bars of metal per second.': 'Schick deine frechen Scruffies zur Therapie in die Minen. Jeder Bergmann findet und schmilzt $modifier$ Barren Metall pro Sekunde.',
        'It takes some patience, but you can teach these Trimps to do some research for you. Each Scientist records $modifier$ units of pure science each second.': 'Es braucht etwas Geduld, aber du kannst diesen Scruffies das Forschen beibringen. Jeder Forscher sammelt $modifier$ Einheiten reiner Wissenschaft pro Sekunde.',
        'Each explorer will find an average of $modifier$ fragments each second.': 'Jeder Entdecker findet durchschnittlich $modifier$ Fragmente pro Sekunde.',
        '<p>Each Geneticist will increase the health of each Trimp by 1% (compounding), but slows the rate at which baby Trimps grow by 2% (compounding).</p>':
            '<p>Jeder Genetiker erhöht die Health jedes Scruffys um 1% (multiplikativ), verlangsamt aber das Aufwachsen junger Scruffies um 2% (multiplikativ).</p>',
        // Equipment
        'A big, wooden shield. Adds $healthCalculated$ health to each soldier per level.': 'Ein großer Holzschild. Gibt jedem Soldaten $healthCalculated$ Health pro Stufe.',
        'A big, wooden shield. Adds $blockCalculated$ block to each soldier per level.': 'Ein großer Holzschild. Gibt jedem Soldaten $blockCalculated$ Block pro Stufe.',
        'Better than nothing. Adds $attackCalculated$ attack to each soldier per level.': 'Besser als nichts. Gibt jedem Soldaten $attackCalculated$ Attack pro Stufe.',
        'At least their feet will be safe. Adds $healthCalculated$ health to each soldier per level.': 'Wenigstens sind die Füße sicher. Gibt jedem Soldaten $healthCalculated$ Health pro Stufe.',
        "It's kind of heavy for your Trimps, but they'll manage. Adds $attackCalculated$ attack to each soldier per level.": 'Ziemlich schwer für deine Scruffies, aber sie schaffen das. Gibt jedem Soldaten $attackCalculated$ Attack pro Stufe.',
        "Provides a decent amount of protection to the Trimps' heads, adding $healthCalculated$ health to each soldier per level.": 'Schützt die Köpfe der Scruffies ordentlich und gibt jedem Soldaten $healthCalculated$ Health pro Stufe.',
        'This thing is big and pointy. It adds $attackCalculated$ attack to each soldier per level.': 'Groß und spitz. Gibt jedem Soldaten $attackCalculated$ Attack pro Stufe.',
        'Pants designed specificially for the little Trimps! Adds $healthCalculated$ health to each soldier per level.': 'Eine Hose, eigens für die kleinen Scruffies geschneidert! Gibt jedem Soldaten $healthCalculated$ Health pro Stufe.',
        'This weapon is pretty intimidating, but your Trimps think they can handle it. Adds $attackCalculated$ attack to each soldier per level.': 'Diese Waffe ist ziemlich einschüchternd, aber deine Scruffies trauen sie sich zu. Gibt jedem Soldaten $attackCalculated$ Attack pro Stufe.',
        "These shoulderguards will help keep your Trimps' necks and shoulders safe, and they look cool too. Adds $healthCalculated$ health to each soldier per level.": 'Dieser Schulterschutz schützt Nacken und Schultern deiner Scruffies und sieht dazu noch gut aus. Gibt jedem Soldaten $healthCalculated$ Health pro Stufe.',
        "This sword looks sweet. Seriously, if you could see it you'd think it looked sweet. Trust me. Adds $attackCalculated$ attack to each soldier per level.": 'Dieses Schwert sieht klasse aus. Ehrlich, wenn du es sehen könntest, fändest du es auch. Glaub mir. Gibt jedem Soldaten $attackCalculated$ Attack pro Stufe.',
        'Some real, heavy duty armor. Everyone looks badass in heavy duty armor. Adds $healthCalculated$ health to each soldier per level.': 'Eine echte, schwere Rüstung. In schwerer Rüstung sieht jeder knallhart aus. Gibt jedem Soldaten $healthCalculated$ Health pro Stufe.',
        'A powerful ranged weapon. Your Trimps can do some damage with this sucker. Adds $attackCalculated$ attack to each soldier per level.': 'Eine starke Fernwaffe. Damit richten deine Scruffies einigen Schaden an. Gibt jedem Soldaten $attackCalculated$ Attack pro Stufe.',
        "A cozy and thick padded jacket that goes under the breastplate. Your Trimps think they're great! Adds $healthCalculated$ health to each soldier per level.": 'Eine dicke, gemütlich gepolsterte Jacke für unter den Brustpanzer. Deine Scruffies finden sie großartig! Gibt jedem Soldaten $healthCalculated$ Health pro Stufe.',
        // Research
        'This book will teach your soldiers how to utilize the buddy system. Fighting will now require <coord>% more Trimps (rounded up), but attack and health will grow for each new Trimp.':
            'Dieses Buch bringt deinen Soldaten das Zusammenhalten bei. Ein Kampf braucht dann <coord>% mehr Scruffies (aufgerundet), aber Attack und Health wachsen mit jedem neuen Scruffy.',
        "Prestige your Warpstation, increasing the amount of Trimps it can house by 20% and the base cost by 75%. There's no turning back, learning these blueprints will make your previous model of Warpstation obsolete but functional, and you will keep all Trimps housed there. Learning this will build one new Warpstation. <b>Holding Ctrl will cause as many Warpstations as you currently own to be purchased immediately after Gigastation, if you can afford them.</b>":
            "Hebt deine Warpstation auf die nächste Prestige-Stufe: Sie bietet 20% mehr Scruffies Platz, der Grundpreis steigt um 75%. Es gibt kein Zurück: Mit diesen Bauplänen ist dein bisheriges Modell veraltet, bleibt aber in Betrieb, und alle Scruffies darin bleiben wohnen. Das Erforschen baut eine neue Warpstation. <b>Steht die Einstellung Gigastation-Steuerung auf „Warpstations nachkaufen“, werden direkt nach der Gigastation so viele Warpstations gekauft, wie du gerade besitzt, sofern du sie dir leisten kannst.</b>",
        'Figure out how to teach these Trimps to kill some Bad Guys.': 'Finde heraus, wie diese Scruffies ein paar Gegner besiegen können.',
        'This book will teach your Trimps to Battle on their own.': 'Dieses Buch bringt deinen Scruffies bei, selbstständig zu kämpfen.',
        'Polish the strange Prism you found. When your Trimps bring the polished Prism to Battle, they gain <b>50%</b> of their maximum Health as <b>Prismatic Shield</b>!. All enemy damage hits your Prismatic Shield before Health, and Prismatic Shield always regenerates to full after an enemy is killed.':
            'Poliere das seltsame Prisma, das du gefunden hast. Nehmen deine Scruffies das polierte Prisma mit in den Kampf, erhalten sie <b>50%</b> ihrer maximalen Health als <b>Prismatischen Schild</b>! Gegnerischer Schaden trifft zuerst den Prismatischen Schild, und er lädt sich nach jedem besiegten Gegner wieder voll auf.',
        'This book will increase the block gained from each Gym by 50%.': 'Dieses Buch erhöht den Block jeder Trainingshalle um 50%.',
        'This book details the fine art of teaching your foremen to actually do stuff instead of just sitting around. When asked, your foremen will start construction on a new Trap if the queue is empty.':
            'Dieses Buch beschreibt die hohe Kunst, deine Vorarbeiter zum Arbeiten statt Herumsitzen zu bringen. Auf Wunsch beginnen sie mit dem Bau einer neuen Falle, wenn die Bauliste leer ist.',
        'This book explains methods of using a shield to actually block damage. The current shield will need to be completely destroyed and rebuilt, but it will give block instead of health. <b>This is permanent</b>. $Your Shield Must be Prestige III or higher$':
            'Dieses Buch erklärt, wie man mit einem Schild tatsächlich Schaden blockt. Der jetzige Schild muss vollständig zerstört und neu gebaut werden, gibt danach aber Block statt Health. <b>Das ist dauerhaft</b>. $Dein Schild muss mindestens Prestige III haben$',
        'This book will teach your Farmers, Lumberjacks, Miners, Scientists, and Explorers to all be twice as productive.': 'Dieses Buch macht deine Bauern, Holzfäller, Bergleute, Forscher und Entdecker doppelt so produktiv.',
        "Your top scientists are pretty sure this is a Dragimp egg. They know Dragimps love shiny things, maybe it'll come out for some gems.": 'Deine besten Forscher sind ziemlich sicher, dass das ein Drakenei ist. Draken lieben Glitzerkram, vielleicht kommt der Draken für ein paar Edelsteine heraus.',
        'Once again, this Prism will need to be polished before it can offer your Trimps any protection. After it\'s polished, this Prism will grant an additional 50% Prismatic Shield to your Trimps!':
            'Auch dieses Prisma muss poliert werden, bevor es deine Scruffies schützt. Danach gibt es deinen Scruffies zusätzlich 50% Prismatischen Schild!',
        "Your scientists are pissed. Not because of anything you did, but this gem seems to be making them mad. It'll take some research, but you think you can create a map to the place the gem originated from.":
            'Deine Forscher sind stinksauer. Nicht deinetwegen, sondern weil dieser Edelstein sie wütend zu machen scheint. Mit etwas Forschung kannst du wohl eine Map zu seinem Fundort erstellen.',
        'Unsurprisingly, that Rage Gem you brought back has everyone up the walls. You should probably hurry up and figure out a way to extract the map from inside before your Scientists end up killing each other.':
            'Wenig überraschend bringt der mitgebrachte Wut-Edelstein alle auf die Palme. Beeil dich lieber, die Map aus seinem Inneren zu holen, bevor sich deine Forscher gegenseitig umbringen.',
        'This book will cause each gym you purchase to increase the block provided by all Gyms by 5%. Each consecutive level of this upgrade will increase the block provided by an additional 1%. <b>The extra block provided compounds per Gym.</b>':
            'Mit diesem Buch erhöht jede gekaufte Trainingshalle den Block aller Trainingshallen um 5%. Jede weitere Stufe dieses Upgrades legt 1% mehr drauf. <b>Der zusätzliche Block wirkt je Trainingshalle multiplikativ.</b>',
        "The air may be filled with pollution, but your Trimps seem to be getting smarter and a battle technique from what could only be a past life has crept into your memory. This would probably be a good opportunity to teach it to your Trimps. Once researched, you will be able to enter the 'Heap Formation'. This can be toggled to increase your Trimps' health by 4x, but reduce block and attack by half.":
            "Die Luft mag verschmutzt sein, aber deine Scruffies werden klüger, und dir fällt eine Kampftechnik ein, die nur aus einem früheren Leben stammen kann. Eine gute Gelegenheit, sie deinen Scruffies beizubringen. Danach kannst du die 'Heap Formation' wählen: Sie vervierfacht die Health deiner Scruffies, halbiert aber Block und Attack.",
        'Another formation has crept back into your memory. Where are these coming from? Who are you? Who cares, this one will allow your Trimps to deal 4x damage at the cost of half health and block.':
            'Dir ist eine weitere Formation eingefallen. Woher kommen die nur? Wer bist du? Egal: Mit dieser verursachen deine Scruffies vierfachen Schaden, bei halber Health und halbem Block.',
        'Woah, you just remembered that all Trimps lifting their shields in the same direction at the same time can produce a nice protecting wall. Seems like common sense now that you thought of it. This formation increases block by 4x and cuts the amount of block that enemies can pierce by 50%, at the cost of half attack and health.':
            'Wow, dir fällt ein: Heben alle Scruffies ihre Schilde gleichzeitig in dieselbe Richtung, entsteht eine schützende Wand. Klingt jetzt ganz logisch. Diese Formation vervierfacht den Block und halbiert den Teil des Blocks, den Gegner durchdringen können, bei halber Attack und Health.',
        "You really don't like reading books, but it seems better than mining yourself.": 'Du liest wirklich nicht gern, aber es ist immer noch besser, als selbst Erz abzubauen.',
        "You really don't believe it, but that book indicates that Trimps can be smart. Better read it and find out how.": 'Kaum zu glauben, aber laut diesem Buch können Scruffies klug sein. Lies es lieber und finde heraus, wie.',
        'This book holds all of the secrets of upper management. Train your Trimps to train other Trimps.': 'Dieses Buch enthält alle Geheimnisse der Chefetage. Bring deinen Scruffies bei, andere Scruffies zu trainieren.',
        'This book will allow you to hire trimps who can create map fragments for you!': 'Mit diesem Buch kannst du Scruffies einstellen, die Map-Fragmente für dich beschaffen!',
        'Your scientists think they can study this book to figure out how to train Trimps as Magmamancers. According to your scientists, according to legend, Magmamancers require gems instead of food as sustainance and can increase the rate of Metal gathering more and more as they stay on the same Zone.':
            'Deine Forscher glauben, mit diesem Buch Scruffies zu Magmamanten ausbilden zu können. Laut deinen Forschern, die sich auf eine Legende berufen, leben Magmamanten von Edelsteinen statt Nahrung und steigern den Metallertrag immer weiter, je länger sie in derselben Zone bleiben.',
        'This book will increase the space gained from each Hut by 100%.': 'Dieses Buch erhöht den Platz jeder Hütte um 100%.',
        'This book will increase the space gained from each House by 100%.': 'Dieses Buch erhöht den Platz jedes Hauses um 100%.',
        'This book will increase the space gained from each Mansion by 100%.': 'Dieses Buch erhöht den Platz jeder Villa um 100%.',
        'This book will increase the space gained from each Hotel by 100%.': 'Dieses Buch erhöht den Platz jedes Hotels um 100%.',
        'This book will increase the space gained from each Resort by 100%.': 'Dieses Buch erhöht den Platz jedes Resorts um 100%.',
        'This book will teach your trimps how to be 10% more efficient at making baby Trimps!': 'Dieses Buch macht deine Scruffies beim Nachwuchs 10% effizienter!',
        'This book will teach your Trainers to increase block by an additional 5%!': 'Mit diesem Buch erhöhen deine Trainer den Block um weitere 5%!',
        'This book will teach you how to be twice as productive in everything you do! Hurray! <b>Note that this applies only to your productivity, not workers.</b>': 'Dieses Buch macht dich bei allem doppelt so produktiv! Hurra! <b>Das gilt nur für deine eigene Arbeit, nicht für Arbeitskräfte.</b>',
        'This book will teach your Trimps how to mine 25% faster!': 'Mit diesem Buch bauen deine Scruffies 25% schneller ab!',
        'This book will teach your Trimps how to cut wood 25% faster!': 'Mit diesem Buch hacken deine Scruffies 25% schneller Holz!',
        'This book will teach your Trimps how to farm 25% faster!': 'Mit diesem Buch ernten deine Scruffies 25% schneller!',
        'This book will teach your Trimps how to science things 25% faster!': 'Mit diesem Buch forschen deine Scruffies 25% schneller!',
        'This book will teach your Trimps how to explore 300% more efficiently!': 'Mit diesem Buch entdecken deine Scruffies 300% effizienter!',
        'This book will teach your Trimps how to mine ?% faster!': 'Mit diesem Buch bauen deine Scruffies ?% schneller ab!',
        'This book will teach your Trimps how to chop wood ?% faster!': 'Mit diesem Buch hacken deine Scruffies ?% schneller Holz!',
        'This book will teach your Trimps how to farm ?% faster!': 'Mit diesem Buch ernten deine Scruffies ?% schneller!',
        'This book will teach your Trimps how to science things ?% faster!': 'Mit diesem Buch forschen deine Scruffies ?% schneller!'
    };
    // Equipment prestige research: one sentence per item with the original "@" for the next value.
    // [accusative, subject with verb, English stat word] per item (V-275: the item itself falls back to level 1).
    const prestiges = {shield:['deinen Schild','Der Schild fällt','stats'], dagger:['deinen Dolch','Der Dolch fällt','attack'], boots:['deine Stiefel','Die Stiefel fallen','health'],
        mace:['deinen Streitkolben','Der Streitkolben fällt','attack'], helmet:['deinen Helm','Der Helm fällt','health'], polearm:['deine Stangenwaffe','Die Stangenwaffe fällt','attack'],
        pants:['deine Hose','Die Hose fällt','health'], axe:['deine Streitaxt','Die Streitaxt fällt','attack'], shoulderguards:['deinen Schulterschutz','Der Schulterschutz fällt','health'],
        greatsword:['deinen Zweihänder','Der Zweihänder fällt','attack'], breastplate:['deinen Brustpanzer','Der Brustpanzer fällt','health'],
        arbalest:['deine Armbrust','Die Armbrust fällt','attack'], gambeson:['deinen Gambeson','Der Gambeson fällt','health']};
    const prestigeGain = {stats:'steigen seine Werte', attack:'steigt Attack', health:'steigt Health'};
    for (const [item, [german, falls, english]] of Object.entries(prestiges)) {
        tooltips['Researching this will prestige your ' + item + '. This will bring your ' + item + ' to level 1 and vastly increase the cost of further upgrades, but will vastly increase the amount of ' + english + ' given. @'] =
            'Hebt ' + german + ' auf die nächste Prestige-Stufe. ' + falls + ' dabei auf Stufe 1 zurück und weitere Verbesserungen werden deutlich teurer, dafür ' + prestigeGain[english] + ' stark. @';
    }
    const tipPatterns = [
        // V-253: the Golden Upgrade window (tooltip goldenUpgrades in updates.js and the effects in config.js). The names
        // (Golden Helium, Golden Void …) stay English like on the options; "Free" is its cost line.
        [/^Increase (Helium|Radon) gain by (\S+)%\.$/, (_, resource, n) => 'Erhöht dein gewonnenes ' + resource + ' um ' + n + '%.'],
        [/^Increase Scruffy attack and health by (\S+)%\.$/, (_, n) => 'Erhöht Attack und Health der Scruffies um ' + n + '%.'],
        [/^Decrease the minimum amount of enemies between Void Map drops by (\S+)%\.$/, (_, n) => 'Senkt die Mindestzahl an Gegnern zwischen zwei Void-Map-Funden um ' + n + '%.'],
        [/^You can only choose one of these (two|three) Golden Upgrades\. Choose wisely\.\.\.$/, (_, n) => 'Du kannst nur eines dieser ' + (n === 'two' ? 'zwei' : 'drei') + ' goldenen Upgrades wählen. Wähle mit Bedacht …'],
        [/^Each time Golden Upgrades are unlocked, they will increase in strength\. You are currently gaining (\S+)% from purchasing this upgrade (\S+) times? since your last portal\.$/,
            (_, pct, n) => 'Goldene Upgrades werden mit jeder Freischaltung stärker. Derzeit bringt dir dieses Upgrade ' + pct + '%; du hast es seit deinem letzten Portal ' + n + '-mal gewählt.'],
        [/^This upgrade would put you over 72% increased Void Map chance, which would destabilize the universe\. You don't want to destabilize the universe, do you\?$/,
            () => 'Dieses Upgrade würde deinen Void-Map-Bonus über 72% heben und das Universum destabilisieren. Das willst du doch nicht, oder?'],
        [/^Note: The absolute maximum value for Golden Void is \+72%\. Golden Void will no longer be able to be purchased if it would increase your bonus above 72%\. Plan carefully!$/,
            () => 'Hinweis: Golden Void ist auf höchstens +72% begrenzt. Würde es deinen Bonus über 72% heben, lässt es sich nicht mehr wählen. Plane sorgfältig!'],
        [/^You can't earn (Helium|Radon) while running a Challenge$/, (_, resource) => 'Während einer Challenge kannst du kein ' + resource + ' verdienen'],
        [/^Free$/, () => 'Kostenlos'],
        [/^Free \((\S+) remaining\)$/, (_, n) => 'Kostenlos (noch ' + n + ')'],
        [/^Each Trap allows you to catch (\S+) things?\.$/, (_, n) => 'Jede Falle fängt ' + n + (n === '1' ? ' Ding.' : ' Dinge.')],
        [/^Build a Smithy to help produce better Equipment for your Scruffies\. Each Smithy in your village increases Scruffy Attack and Health by (\S+)% \(compounding\)\.$/,
            (_, n) => 'Baue eine Rüstschmiede für bessere Ausrüstung deiner Scruffies. Jede Rüstschmiede in deinem Dorf erhöht Attack und Health der Scruffies um ' + n + '% (multiplikativ).'],
        [/^Each trainer will increase the base amount your soldiers can block by (\S+)%\.$/, (_, n) => 'Jeder Trainer erhöht den Grundblock deiner Soldaten um ' + n + '%.'],
        [/^Each trainer will increase the base amount your soldiers can block by (\S+)%\. \((\S+)% increased by (\S+)% thanks to (.+)\)$/,
            (_, n, base, bonus, item) => 'Jeder Trainer erhöht den Grundblock deiner Soldaten um ' + n + '%. (' + base + '%, erhöht um ' + bonus + '% dank ' + item + ')'],
        [/^Worshippers always cost 25% of the total amount of Food gathered and looted from World or Maps in your previous 4 Zones \(not including current Zone\)\. Each Worshipper grants a 0\.5% chance to grant 25-50% of an entire Zone worth of Scruffy Exp per World Cell cleared\. However, (\S+) Worshippers? will stop Worshipping after each Zone cleared\. Max of 50\.$/,
            (_, n) => 'Anbeter kosten immer 25% der Nahrung, die du in den letzten 4 Zonen (ohne die aktuelle) in der Welt und in Maps gesammelt und erbeutet hast. Jeder Anbeter gibt je geräumtem Weltfeld eine Chance von 0.5% auf 25–50% der Scruffy Exp einer ganzen Zone. Nach jeder geräumten Zone ' + (n === '1' ? 'hört jedoch 1 Anbeter' : 'hören jedoch ' + n + ' Anbeter') + ' mit dem Anbeten auf. Höchstens 50.']
    ];
    // Pieces of composed info texts (tooltip() additions, getters with several paragraphs).
    const fragments = [
        [/(\S+) (wood|metal) spent per point of (Attack|Health|Block)\./g, (_, n, resource, stat) => n + ' ' + keyNames[resource] + ' je Punkt ' + stat + '.'],
        [/ \((\S+) after Trainers\)/g, ' ($1 mit Trainern)'],
        [/ The most efficient Attack and Health equipment( of your highest Tier)? have blue backgrounds\./g, (_, tier) => ' Die effizienteste Ausrüstung für Attack und Health' + (tier ? ' deiner höchsten Stufe' : '') + ' ist blau hinterlegt.'],
        [/ \(Search Settings for Highlight Equipment to change behavior\)/g, ' (Ändern kannst du das mit der Einstellung „Ausrüstung hervorheben“)'],
        [/ The outlined equipment has the lowest metal cost per added Attack or Health for the selected purchase amount, across all unlocked tiers\./g,
            ' Die umrandete Ausrüstung bringt für die gewählte Kaufmenge am meisten Attack oder Health je Metall, über alle freigeschalteten Stufen.'],
        [/Your next (\w+) will grant (\S+) (attack|health|block)\./g, (_, item, value, stat) => 'Nächste Stufe (' + nameOf(item) + '): ' + value + ' ' + stat[0].toUpperCase() + stat.slice(1) + '.'],
        [/ and increases the base block of all Gyms by (\S+)% \(compounding\)\./g, ' und erhöht den Grundblock aller Trainingshallen um $1% (multiplikativ).'],
        [/<b> You had (\S+) Warpstations when you purchased your last Gigastation \((\S+)\)\.<\/b>/g, '<b> Beim Kauf deiner letzten Gigastation ($2) hattest du $1 Warpstations.</b>'],
        [/ You had (\S+) Warpstations when you purchased your last Gigastation \((\S+)\)\./g, ' Beim Kauf deiner letzten Gigastation ($2) hattest du $1 Warpstations.'],
        [/You need enough room for (\S+) max Scruffies\./g, 'Du brauchst Platz für $1 Scruffies.'],
        [/You need (\S+) unemployeed Scruffies available\./g, 'Du brauchst $1 freie Scruffies.'],
        [/ You are short (\S+) Scruff(?:y|ies)\./g, (_, n) => ' Es ' + (n === '1' ? 'fehlt 1 Scruffy.' : 'fehlen ' + n + ' Scruffies.')],
        [/You have purchased (\S+) total Nurseries\./g, 'Du hast insgesamt $1 Kinderstuben gekauft.'],
        [/Magma is generally not conducive to a healthy Nursery environment\. Each Nursery will still increase Scruffies per second from breeding by 1% \(compounding\), but 10% of your active Nurseries will shut down each Zone as the Magma moves closer\. Safety first!/g,
            'Magma ist für eine gesunde Kinderstube eher ungeeignet. Jede Kinderstube erhöht den Zuwachs an Scruffies pro Sekunde weiter um 1% (multiplikativ), aber in jeder Zone schließen 10% deiner aktiven Kinderstuben, weil das Magma näher rückt. Sicherheit geht vor!'],
        [/Owning (\S+) Geneticists? multiplies your breed speed by (\S+), and adds (\S+) Health\./g, (_, n, speed, health) => 'Mit ' + n + (n === '1' ? ' Genetiker' : ' Genetikern') + ' wird dein Zuwachstempo mit ' + speed + ' multipliziert, und du erhältst ' + health + ' Health.'],
        [/Unlocks a(nother)? Scientist level, upgrading your portal and <b>allowing you to (.+?) every time you Portal to this Universe<\/b>\./g,
            (_, another, what) => 'Schaltet ' + (another ? 'eine weitere' : 'eine') + ' Scientist-Stufe frei, verbessert dein Portal, und <b>bei jedem Portal in dieses Universum gilt: ' + scientistReward(what) + '</b>.'],
        [/Microchips attach directly to your Portal Device, and only ever have to be purchased once\. Your Portal Device has room for 5 total Microchips\./g,
            'Mikrochips werden direkt an dein Portalgerät angeschlossen und nur einmal gekauft. Dein Portalgerät hat Platz für insgesamt 5 Mikrochips.'],
        [/Build a giant Laboratory that Cruffys can use for research\. Each Laboratory constructed increases Cruffys' Exp gain by 10% \(compounding\), but will pollute the world with toxic waste and research chemicals, increasing all Enemy attack and health by 3\.5% \(compounding\)\./g,
            'Baue ein riesiges Labor, in dem Cruffys forschen können. Jedes Labor erhöht die Exp von Cruffys um 10% (multiplikativ), verschmutzt aber die Welt mit Giftmüll und Laborchemikalien und erhöht so Attack und Health aller Gegner um 3.5% (multiplikativ).'],
        [/Currently increasing Cruffys' Exp by (\S+)% and Enemy attack and health by (\S+)%\./g, 'Erhöht derzeit die Exp von Cruffys um $1% sowie Attack und Health der Gegner um $2%.'],
        [/Increase the amount of Radon gained from all sources by (\S+)% per Meteorologist hired\. Meteorologists require some time to get situated after being hired, and must be active for an entire Zone before they can start collecting any extra Radon\./g,
            'Erhöht das Radon aus allen Quellen um $1% je eingestelltem Meteorologen. Meteorologen brauchen nach der Einstellung etwas Zeit und müssen eine ganze Zone lang aktiv sein, bevor sie zusätzliches Radon sammeln.'],
        [/(\d[\d.,]*[A-Za-z]*) Meteorologists? (?:is|are) currently collecting, granting (\S+)% extra Radon\./g, (_, n, pct) => (n === '1' ? 'Derzeit sammelt 1 Meteorologe und bringt ' : 'Derzeit sammeln ' + n + ' Meteorologen und bringen ') + pct + '% zusätzliches Radon.'],
        [/You have (\d[\d.,]*[A-Za-z]*) Meteorologists?, but (\d[\d.,]*[A-Za-z]*) (?:was|were) hired on this Zone and (?:is|are) not yet available\./g, (_, n, fresh) => 'Du hast ' + n + ' Meteorologen, aber ' + fresh + (fresh === '1' ? ' wurde in dieser Zone eingestellt und ist' : ' wurden in dieser Zone eingestellt und sind') + ' noch nicht bereit.'],
        [/Thanks to your super cool Antenna array, you're also gaining \+(\S+)% extra Food from gathering(?: and |, )Wood from chopping(?:(?:, | and ) ?Health for your Soldiers)?(?:, and Metal from mining)?!/g,
            (all, pct) => 'Dank deines tollen Antennenfelds bekommst du außerdem +' + pct + '% mehr ' + ['Nahrung beim Sammeln', 'Holz beim Hacken', ...(all.includes('Health') ? ['Health für deine Soldaten'] : []), ...(all.includes('Metal') ? ['Metall beim Abbauen'] : [])].join(', ').replace(/, ([^,]*)$/, ' und $1') + '!'],
        [/Train a Magmamancer to craft pickaxe heads infused with Gems and Magma, custom for the unique rocks in each Zone\. The more Magmamancers you have and the longer you spend in one Zone, the more Metal your Scruffies will be able to gather!/g,
            'Bilde einen Magmamanten aus, der Spitzhacken mit Edelsteinen und Magma für das besondere Gestein jeder Zone fertigt. Je mehr Magmamanten du hast und je länger du in einer Zone bleibst, desto mehr Metall sammeln deine Scruffies!'],
        [/For each 10 minutes you spend in a Zone with Magmamancers up to (\S+) minutes, your Magmamancer bonus will increase by 20% \(compounding\)\. Your current bonus is <b>(\S+)%<\/b>, and /g,
            'Für je 10 Minuten in einer Zone mit Magmamanten (bis zu $1 Minuten) steigt dein Magmamanten-Bonus um 20% (multiplikativ). Dein aktueller Bonus beträgt <b>$2%</b>, und '],
        [/you've been on this Zone for over (\S+) minutes \(Max\)\./g, 'du bist seit über $1 Minuten in dieser Zone (Maximum).'],
        [/you've been on this Zone for (\S+) minutes?\. In (\S+) minutes?, this bonus will increase to (\S+)%\./g, 'du bist seit $1 Min. in dieser Zone. In $2 Min. steigt der Bonus auf $3%.'],
        [/Your next Magmamancer will increase the total bonus by (\S+)% \(compounding\)/g, 'Dein nächster Magmamant erhöht den Gesamtbonus um $1% (multiplikativ)'],
        [/After training your first Magmamancer, your bonus metal will be (\S+)%\./g, 'Mit deinem ersten Magmamanten beträgt dein Metallbonus $1%.'],
        [/Each Antenna increases the bonus granted per Meteorologist by a flat 0\.05% \(20 Antennas would double their bonus\), but only 1 Antenna can be built for every 5 Zones completed above Z100 in Universe 2 on your highest run ever\. Thanks to the extra-dimensional origin of the Antenna design, these Antennas persist in the world when you use your Time Portal!/g,
            'Jede Antenne erhöht den Bonus je Meteorologe pauschal um 0.05% (20 Antennen verdoppeln ihn), aber je 5 Zonen über Z100 in Universum 2, die du in deinem besten Durchlauf geschafft hast, lässt sich nur 1 Antenne bauen. Dank ihrer Herkunft aus einer anderen Dimension bleiben die Antennen erhalten, wenn du das Time Portal nutzt!'],
        [/Once 5 antennas have been built, your Scruffies can use the new advanced weather data to increase the yield of crops and trees, granting 50% of the Meteorologist's bonus percentage to Food and Wood income as well\./g,
            'Ab 5 Antennen nutzen deine Scruffies die neuen Wetterdaten für bessere Ernten und mehr Holz: 50% des Meteorologen-Bonus gelten auch für Nahrung und Holz.'],
        [/Once 10 Antennas have been built, your Soldiers can use the data to always properly dress for the weather, granting 50% of the Meteorologist's bonus percentage to Soldier Health\./g,
            'Ab 10 Antennen ziehen sich deine Soldaten immer passend zum Wetter an: 50% des Meteorologen-Bonus gelten auch für die Health der Soldaten.'],
        [/Once 15 Antennas have been built, the network will be strong enough to locate rich mineral deposits all over the planet, granting 50% of the Meteorologist's bonus percentage to Mining income!/g,
            'Ab 15 Antennen findet das Netz reiche Erzvorkommen auf dem ganzen Planeten: 50% des Meteorologen-Bonus gelten auch für den Abbau!'],
        [/Once 20 Antennas have been built, the network becomes so strong that all non-Radon Meteorologist bonuses are increased to 75% of the Meteorologist's bonus! For each 5 Antennas built after 20, the Meteorologists' non-Radon bonuses are increased by another 25%\./g,
            'Ab 20 Antennen ist das Netz so stark, dass alle Meteorologen-Boni außer Radon auf 75% des Meteorologen-Bonus steigen! Je 5 weitere Antennen erhöhen diese Boni um weitere 25%.'],
        [/This book will teach your Rivetgruff how to do a much better job of shrieking, allowing MagnetoShriek to be used on multiple Corrupted cells in addition to Oddities\. Upgraded MagnetoShriek starts off only being able to affect 1 cell at a time, but each use after purchasing this upgrade will extend the bonus by one additional cell, up to a max of 5 cells \(resets on portal\)\. <br\/><br\/> Each new Bionic Wonderland clear starting at Z185 will permanently increase the cell count cap by 1\./g,
            'Dieses Buch bringt deinem Rivetgruff das richtige Kreischen bei: MagnetoShriek wirkt dann neben Oddities auch auf mehrere Corrupted-Felder. Anfangs trifft das verbesserte MagnetoShriek nur 1 Feld, jede weitere Nutzung nach dem Kauf erweitert den Bonus um ein Feld, bis höchstens 5 (zurückgesetzt beim Portal). <br/><br/> Jedes neu geräumte Bionic Wonderland ab Z185 erhöht die Höchstzahl dauerhaft um 1.'],
        [/ <b>You have cleared (\S+) Bionic Wonderlands? at 185 or higher, and your MagnetoShriek cell count cap will be (\S+)<\/b>/g, ' <b>Du hast $1 Bionic Wonderland ab 185 geräumt; die Höchstzahl der MagnetoShriek-Felder ist $2.</b>'],
        [/Amalgamators cannot be hired or fired manually\. They are magical beings that could barely be considered Scruffies anymore, and they will automatically show up to your town whenever your total population to army size ratio rises above <b>(\S+):1<\/b>\. Completing Spires II through V will each divide this ratio by 10\. If your ratio ever falls below (\S+):1, an Amalgamator will leave\. Note however that Amalgamators won't ever show up or leave while you are in an active Spire\. Your current ratio is <b>(\S+):1<\/b>\. At your current army size, you need <b>(\S+)<\/b> total Scruffies to trigger the next Amalgamator\./g,
            'Amalgamatoren lassen sich nicht von Hand einstellen oder entlassen. Diese magischen Wesen sind kaum noch Scruffies und kommen von selbst in deine Stadt, sobald das Verhältnis deiner Bevölkerung zur Armeegröße über <b>$1:1</b> steigt. Jede abgeschlossene Spire von II bis V teilt dieses Verhältnis durch 10. Fällt es unter $2:1, geht ein Amalgamator. In einer aktiven Spire kommen und gehen keine Amalgamatoren. Dein Verhältnis beträgt <b>$3:1</b>. Bei deiner Armeegröße brauchst du insgesamt <b>$4</b> Scruffies für den nächsten Amalgamator.'],
        [/Amalgamators fuse some of your spare Scruffies to other soldiers, greatly strengthening them\. Each Amalgamator increases the amount of Scruffies that must be sent into each battle by 1000x \(compounding\), increases health by 40x \(compounding\), and increases damage by 50% \((compounding|additive)\)\./g,
            (_, kind) => 'Amalgamatoren verschmelzen übrige Scruffies mit Soldaten und machen sie viel stärker. Jeder Amalgamator vertausendfacht die Zahl der Scruffies, die in jeden Kampf ziehen müssen (multiplikativ), multipliziert die Health mit 40 (multiplikativ) und erhöht den Schaden um 50% (' + (kind === 'additive' ? 'additiv' : 'multiplikativ') + ').'],
        [/In addition, having at least one Amalgamator will cause Anticipation stacks to increase based on when the last soldiers were sent, rather than being based on time spent actually breeding\./g,
            'Außerdem richten sich die Anticipation-Stapel mit mindestens einem Amalgamator danach, wann zuletzt Soldaten losgeschickt wurden, nicht nach der tatsächlichen Zuchtzeit.'],
        [/Some say the Amalgamators are a curse, some say they're a blessing\. The Amalgamators themselves mostly just say "Blerghhhh"\./g, 'Manche halten die Amalgamatoren für einen Fluch, andere für einen Segen. Die Amalgamatoren selbst sagen meist nur „Blerghhhh“.'],
        [/Decreases all Enemy Attack by (\S+)%\. You currently have (\S+)% to Enemy Attack\./g, 'Senkt die Attack aller Gegner um $1%. Derzeit hast du $2% auf die Attack der Gegner.'],
        [/Increases all (Attack|Radon|Breed Speed|Resource Gain)( \(Food, Wood, Metal, Science, and Gems\))? by (\S+)%\. You currently have (\S+)% to (?:Attack|Radon|Breed Speed|Resource Gain)\./g,
            (_, stat, list, n, now) => { const german = {Attack:'Attack', Radon:'Radon', 'Breed Speed':'Zuchttempo', 'Resource Gain':'Ressourcenertrag'}[stat]; return 'Erhöht ' + german + (list ? ' (Nahrung, Holz, Metall, Wissenschaft und Edelsteine)' : '') + ' um ' + n + '%. Derzeit hast du ' + now + '% auf ' + german + '.'; }],
        [/<br\/><br\/><b>Hold Ctrl while clicking any relic upgrade to access the Relic Automator!<\/b>/g, ''],
        [/You have discovered (\S+) of these Relics and (\S+) total Relics\. Each Relic has a max of 50 positive levels at a time\. Cost increases based on total purchased Relics\./g,
            'Du hast $1 dieser Relikte und insgesamt $2 Relikte entdeckt. Jedes Relikt hat höchstens 50 positive Stufen gleichzeitig. Die Kosten steigen mit der Zahl gekaufter Relikte.'],
        [/Build an antenna for your Meteorologists to use in their meteorological duties\. /g, 'Baue eine Antenne für die Arbeit deiner Meteorologen. ']
    ];
    const fragmentProbe = /Super cool Antenna|super cool Antenna|Once \d+ [Aa]ntennas|MagnetoShriek|Amalgamator|Enemy Attack by|Increases all|Relic|spent per point|outlined equipment|after Trainers|most efficient|Search Settings|Your next|base block of all Gyms|Warpstations when|You need|You are short|Nurser|Geneticist|Scientist level|Microchips attach|Laboratory|Cruffys|Meteorologist|Magmamancer|Antenna|you've been on this Zone/;
    // Settings: names of the setting rows (mobile-compact.js), state titles and descriptions (config.js options.menu).
    // Desktop hints the touch layer removes in English (Ctrl, Shift, hotkeys) are left out in German as well.
    const settingNames = {
        'Screen reader hints':'Hinweise für Bildschirmleser','Autosave':'Automatisch speichern','Save and exit':'Speichern und beenden','Rich Presence':'Rich Presence',
        'Number format':'Zahlenformat','Build animation':'Bauanimation','Bar outlines':'Balkenränder','Menu formatting':'Menüformat','Perk level format':'Format der Perk-Stufen',
        'Perk button size':'Größe der Perk-Knöpfe','Progress bars':'Fortschrittsbalken','Generator animation':'Generator-Animation','Confirm Wormhole':'Wurmloch bestätigen',
        'Highlight equipment':'Ausrüstung hervorheben','New unlocks':'Neue Freischaltungen','Achievement popups':'Erfolgsmeldungen','Prioritize map loot':'Map-Beute zuerst',
        'Repeat maps':'Maps wiederholen','Exit maps':'Maps verlassen','Repeat Void Maps':'Void Maps wiederholen','Confirm Bone purchases':'Knochenkäufe bestätigen','Alerts':'Hinweise',
        'Breeding time':'Zuchtzeit','Fade in':'Einblenden','Roman numerals':'Römische Zahlen','Map statistics':'Map-Statistik','Average values':'Durchschnittswerte',
        'Heirloom popups':'Heirloom-Meldungen','Confirm Portal Challenge':'Portal-Challenge bestätigen','Detailed Perk info':'Ausführliche Perk-Info','Travel behavior':'Wechselverhalten',
        'Extra map controls':'Zusätzliche Map-Steuerung','Geneticistassist target':'Geneticistassist-Ziel','Liquification':'Liquification','Overkill colors':'Overkill-Farben',
        'Build queue':'Bauliste','Maps at Spires':'Maps an Spires','Maps at Zone':'Maps bei Zone','Timestamps':'Zeitstempel','Geneticistassist firing':'Entlassen durch Geneticistassist',
        'Mastery info':'Mastery-Info','Large popups':'Große Popups','Generator start mode':'Startmodus des Generators','Snow effect':'Schnee','Seasonal enemies':'Saisonale Gegner',
        'Geneticist deployment':'Einsatz nach Genetikern','Fire for jobs':'Für Berufe entlassen','Gigastation controls':'Gigastation-Steuerung','Heirloom animations':'Heirloom-Animationen',
        'Continue Bionic Wonderland':'Bionic Wonderland fortsetzen','Offline progress':'Offline-Fortschritt','Archaeology automation':'Archaeology-Automatik',
        'Completed achievements':'Abgeschlossene Erfolge','Spire display':'Spire-Anzeige','Spire Assault display':'Spire-Assault-Anzeige','Save on pause':'Beim Pausieren speichern',
        'Pause game':'Spiel pausieren','Allow pausing':'Pausieren erlauben','Delete save':'Spielstand löschen'
    };
    const settingTitles = {
        'Hide Screen Read Info':'Bildschirmleser-Info aus','Show Screen Read Info':'Bildschirmleser-Info an','Not Saving':'Speichert nicht','Auto Saving':'Speichert automatisch',
        'Save and Exit':'Speichern und beenden','Rich Presence Off':'Rich Presence aus','Rich Presence On':'Rich Presence an','DRP Portal Only':'DRP nur beim Portal',
        'Scientific Notation':'Wissenschaftlich','Standard Formatting':'Standard','Engineering Notation':'Technisch','Alphabetic Notation':'Alphabetisch','Hybrid Notation':'Hybrid','Logarithmic Notation':'Logarithmisch',
        'No Queue Animation':'Keine Bauanimation','Queue Animation':'Bauanimation','No Outline':'Ohne Rand','Outline':'Mit Rand','No Menu Formatting':'Menü ohne Format','Formatting Menu':'Menü formatiert',
        'No Perk Formatting':'Perk-Stufen ohne Format','Formatting Perk Levels':'Perk-Stufen formatiert','Large Perk Buttons':'Große Perk-Knöpfe','Small Perk Buttons':'Kleine Perk-Knöpfe','Tiny Perk Buttons':'Winzige Perk-Knöpfe',
        'No Progress Bars':'Keine Balken','Progress Bars':'Fortschrittsbalken','Performance Bars':'Sparsame Balken','Generator Animation Off':'Generator-Animation aus','Generator Animation On':'Generator-Animation an',
        'Not Confirming':'Ohne Bestätigung','Confirming':'Mit Bestätigung','No Equip Highlight':'Nicht hervorheben','Highlight Equipment':'Ausrüstung hervorheben','Highlight All Tiers':'Alle Stufen hervorheben',
        'Not Locking':'Nicht sperren','Locking':'Kurz sperren','No Achieve Popup':'Keine Erfolgsmeldung','Popup Achievements':'Erfolge melden','Tier First':'Stufe zuerst','Equip First':'Ausrüstung zuerst',
        'Repeat Forever':'Immer wiederholen','Repeat to 10':'Bis 10 wiederholen','Repeat for Items':'Für Items wiederholen','Repeat for Any':'Für alles wiederholen','Exit to Maps':'Zu den Maps','Exit to World':'Zur Welt',
        'One Void Map':'Eine Void Map','Finish All Voids':'Alle Void Maps','Not Confirming Rare':'Seltenes ohne Bestätigung','Confirming Rare Stuff':'Seltenes bestätigen','Not Alerting':'Ohne Hinweis','Alerting':'Mit Hinweis',
        'Less Breed Timer':'Kurze Zuchtanzeige','More Breed Timer':'Ausführliche Zuchtanzeige','Not Fading':'Ohne Einblenden','Fading':'Einblenden','Arabic Numerals':'Arabische Zahlen','Roman Numerals':'Römische Zahlen',
        'Minimalist Maps':'Schlichte Maps','Extra Map Info':'Mehr Map-Info','Not Averaging':'Ohne Durchschnitt','Averaging':'Mit Durchschnitt','No Heirloom Pop':'Keine Heirloom-Meldung','Popping Heirlooms':'Heirlooms melden',
        'Pop Highest Heirloom':'Nur höchstes Heirloom','No Portal Challenge Alert':'Kein Challenge-Hinweis','Portal Challenge Alert':'Challenge-Hinweis','Minimal Perk Info':'Knappe Perk-Info','Extra Perk Info':'Ausführliche Perk-Info',
        'Wait to Travel':'Auf Soldaten warten','Auto Abandon':'Sofort wechseln','Less Map Buttons':'Weniger Map-Knöpfe','Extra Map Buttons':'Mehr Map-Knöpfe','Geneticistassist Settings':'Geneticistassist einstellen',
        'Liquification Off':'Liquification aus','Liquification On':'Liquification an','No Overcolors':'Ohne Overkill-Farbe','Normal Overkill Colors':'Overkill-Farben','Connected Overkill Colors':'Durchgehende Overkill-Farben',
        'Not Forcing Queue':'Bauliste nicht erzwingen','Forcing Queue':'Bauliste erzwingen','Keep Fighting at Spires':'An Spires weiterkämpfen','Map at Spires':'Maps an Spires','Map at Top 2 Spires':'Maps an den 2 höchsten Spires',
        'Map at Top Spire':'Maps an der höchsten Spire','No Map At Zone':'Kein Map at Zone','No Timestamps':'Ohne Zeitstempel','Local Timestamps':'Uhrzeit','Run Timestamps':'Durchlaufzeit',
        'Limited GA Firing':'GA entlässt begrenzt','Geneticistassist Fire':'GA darf entlassen','No GA Firing':'GA entlässt nicht','No Mastery Info':'Keine Mastery-Info','Alert Mastery':'Mastery-Hinweis','Show Essence':'Essence anzeigen',
        'Hybrid Alerts':'Hybrid-Hinweise','Block Big Popups':'Große Popups blockieren','Allow Big Popups':'Große Popups erlauben','Default Generator':'Wie zuletzt',
        'No Snow':'Kein Schnee','Show Snow':'Schnee zeigen','No Pumpkimps':'Keine Gourdles','Show Pumpkimps':'Gourdles zeigen','Bordered Pumpkimps':'Gourdles mit Rand','No Gene Sending':'Kein Gene Send',
        'Using Gene Send':'Gene Send nutzen','Enforce Gene Send':'Gene Send erzwingen','Wait For Gene Send':'Auf Gene Send warten','Not Firing For Jobs':'Nicht für Berufe entlassen','Firing For Jobs':'Für Berufe entlassen',
        'Dynamic Giga Ctrl':'Nur Gigastation','Always Giga Ctrl':'Warpstations nachkaufen','No Heirloom Animations':'Ohne Heirloom-Animation','Heirloom Animations':'Heirloom-Animation',
        "Don&apos;t Climb BW":'BW nicht fortsetzen','Climb BW':'BW fortsetzen','No Offline Progress':'Kein Offline-Fortschritt','Hybrid Offline':'Hybrid offline','Time Warp Only':'Nur Time Warp',
        'Trustworthy Trimps Only':'Nur Trustworthy Trimps','Archaeology Automator':'Archaeology-Automatik','Hiding Achieves':'Erledigte ausblenden','Showing All Achieves':'Alle Erfolge zeigen',
        'View the Spire':'Spire ansehen','View Spire Assault':'Spire Assault ansehen',"Don't Save on Pause":'Beim Pausieren nicht speichern','Save on Pause':'Beim Pausieren speichern','Not Paused':'Läuft',
        'Disable Pausing':'Pausieren aus','Enable Pausing':'Pausieren an','Delete Save':'Spielstand löschen'
    };
    const settingTexts = {
        'Hides or displays the ScreenReaderInfo box.':'Blendet das Info-Feld für Bildschirmleser ein oder aus.',
        'Automatically save the game once per minute.':'Speichert das Spiel einmal pro Minute automatisch.',
        'Save the game, then close it! Your Trimps will be here when you get back.':'Speichert das Spiel und schließt es. Deine Scruffies warten hier auf dich.',
        'This setting controls how often Trimps will send Rich Presence information to Discord. Rich Presence is what allows your friends in Discord to see that you&apos;re playing Trimps, and some information about your progress. Discord&apos;s Rich Presence can also be disabled globally in Discord&apos;s settings if you never want this information shown in any game.<br/><br/><b>Rich Presence Off</b> wont send any information about your save to Discord.<br/><br/><b>Rich Presence On</b> is the default, and will periodically send Discord an update on your progress that your friends can see.<br/><br/><b>DRP Portal Only</b> will only update Discord&apos;s Rich Presence once on game load, and then once per Portal.':
            'Legt fest, wie oft das Spiel Rich-Presence-Daten an Discord sendet. Damit sehen deine Freunde in Discord, dass du spielst, und etwas zu deinem Fortschritt. Rich Presence lässt sich in den Discord-Einstellungen auch für alle Spiele abschalten.<br/><br/><b>Rich Presence aus</b> sendet nichts über deinen Spielstand an Discord.<br/><br/><b>Rich Presence an</b> ist Standard und meldet Discord regelmäßig deinen Fortschritt.<br/><br/><b>DRP nur beim Portal</b> aktualisiert Rich Presence nur beim Laden und dann einmal je Portal.',
        'Swap between Standard Formatting (12.7M, 540B), Engineering Notation (12.7e6, 540e9), Scientific Notation (1.27e7, 5.40e11), Alphabetic Notation (12.7b, 540c), Hybrid Notation (Standard up to e96, then Engineering. Mimics Standard pre 4.6), and Logarithmic Notation (10^7.10, 10^8.73). Hold Ctrl while clicking to configure Logarithmic and Hybrid Notation.':
            'Wechselt zwischen Standard (12.7M, 540B), Technisch (12.7e6, 540e9), Wissenschaftlich (1.27e7, 5.40e11), Alphabetisch (12.7b, 540c), Hybrid (Standard bis e96, danach Technisch; wie Standard vor 4.6) und Logarithmisch (10^7.10, 10^8.73).',
        'Toggle on or off the building queue blue color animation.':'Schaltet die blaue Animation der Bauliste ein oder aus.',
        'Toggle on or off a black bar at the end of all progress bars. Can help discern where the progress bar ends.':'Zeigt am Ende jedes Fortschrittsbalkens einen schwarzen Strich, damit man sein Ende besser erkennt.',
        'Toggle on or off large number formatting for jobs and buildings on the left menu.':'Schaltet die Formatierung großer Zahlen bei Berufen und Gebäuden im Menü ein oder aus.',
        'Toggle on or off large number formatting for Perk levels.':'Schaltet die Formatierung großer Zahlen bei Perk-Stufen ein oder aus.',
        'Shrink the size of perk buttons in the Portal and View Perks windows. <b>Large Perk Buttons</b> is default and fits 5 buttons per row. <b>Small Perk Buttons</b> shrinks the size to fit 6 per row, and <b>Tiny Perk Buttons</b> fits 7 per row.':
            'Verkleinert die Perk-Knöpfe im Portal und unter View Perks. <b>Große Perk-Knöpfe</b> ist Standard mit 5 Knöpfen pro Reihe, <b>Kleine Perk-Knöpfe</b> zeigt 6 und <b>Winzige Perk-Knöpfe</b> 7 pro Reihe.',
        'Toggle progress bars to on, off, or performance. Performance and off will reduce CPU usage.':'Schaltet Fortschrittsbalken an, aus oder auf sparsam. Sparsam und aus verringern die Prozessorlast.',
        'Toggle Dimensional Generator animations on or off. This includes both the clock hand and filling tank animations.':'Schaltet die Animationen des Dimensional Generator ein oder aus, also Uhrzeiger und füllenden Tank.',
        'Toggles on or off the confirmation popup on scary purchases like Wormholes.':'Schaltet die Rückfrage bei heiklen Käufen wie Wurmlöchern ein oder aus.',
        'Enables/disables blue highlighting of equipment based on resource efficiency. Default is to only show highest available tier, or you can set this to <b>Highlight All Tiers</b> to check old tiers of Equipment too.':
            'Hebt die Ausrüstung mit dem besten Verhältnis von Kosten zu Wirkung blau hervor. Standard ist nur die höchste verfügbare Stufe; mit <b>Alle Stufen hervorheben</b> werden auch ältere Stufen geprüft.',
        'Enables/disables the locking of buildings, jobs, upgrades, and equipment for 1 second after unlocking something new. Useful to prevent accidental purchases.':'Sperrt Gebäude, Berufe, Forschung und Ausrüstung nach einer neuen Freischaltung für 1 Sekunde. Das verhindert versehentliche Käufe.',
        'Decide whether or not you want popups on completing an achievement.':'Legt fest, ob ein abgeschlossener Erfolg gemeldet wird.',
        '<p><b>Repeat Forever</b> will cause the map to continually repeat if Repeat Maps is enabled.</p><p><b>Repeat to 10</b> will repeat unless you have 10 Map Bonus stacks.</p><p><b>Repeat for Items</b> will repeat unless there are no more special items left for that level of map.</p><p><b>Repeat for Any</b> will repeat unless there are no special items available AND you can not earn more Map Bonus stacks.</p><p><b>This setting only matters if Repeat is on. Toggling Repeat off will still leave the map when it is finished no matter what.</b></p>':
            '<p><b>Immer wiederholen</b> wiederholt die Map ohne Ende, solange Repeat an ist.</p><p><b>Bis 10 wiederholen</b> wiederholt, bis du 10 Map-Bonus-Stapel hast.</p><p><b>Für Items wiederholen</b> wiederholt, solange es für diese Map-Stufe noch besondere Items gibt.</p><p><b>Für alles wiederholen</b> wiederholt, solange es noch besondere Items gibt ODER du weitere Map-Bonus-Stapel bekommen kannst.</p><p><b>Die Einstellung zählt nur, wenn Repeat an ist. Ist Repeat aus, verlässt du die Map nach dem Abschluss in jedem Fall.</b></p>',
        'Choose whether to go to the Maps Screen or World after completing a map.':'Legt fest, ob es nach einer Map zu den Maps oder zur Welt geht.',
        'Decide if you want to continue running the rest of your Void Maps after finishing one.':'Legt fest, ob nach einer Void Map die übrigen Void Maps weiterlaufen.',
        'Hide popup confirmation messages when spending rare resources in the Bone Trader or Heirlooms menus.':'Blendet Rückfragen beim Ausgeben seltener Ressourcen im Knochenhändler und bei Heirlooms aus.',
        'Display time to breed a full group of soldiers next to the current breed timer.':'Zeigt neben der Zuchtanzeige auch die Zeit bis zu einer vollen Soldatengruppe.',
        'Toggle on or off the fade in effect on elements.':'Schaltet das Einblenden von Elementen ein oder aus.',
        'Show either Roman Numerals or Arabic Numerals for Equipment Prestiges.':'Zeigt Prestige-Stufen der Ausrüstung in römischen oder arabischen Zahlen.',
        'Toggle on or off adding extra information to map items.':'Blendet zusätzliche Angaben bei Maps ein oder aus.',
        'Toggle whether or not loot from maps and the world should be counted in the loot breakdown and tooltip calculations. Calculates a moving average of the loot. If you want to clear the average, try toggling it off and on again.':
            'Legt fest, ob Beute aus Maps und der Welt in die Beuteübersicht und die Info-Berechnungen einfließt. Berechnet einen gleitenden Durchschnitt; aus- und wieder einschalten setzt ihn zurück.',
        'Decide whether or not you want popups on looting an Heirloom.<br/><br/><b>Pop Highest Heirloom</b> will only show a popup if you find the highest available tier Heirloom for your current level.':
            'Legt fest, ob ein gefundenes Heirloom gemeldet wird.<br/><br/><b>Nur höchstes Heirloom</b> meldet nur Heirlooms der höchsten Stufe, die in deiner aktuellen Zone möglich ist.',
        'Decide whether or not an alert should be displayed when attempting to Portal without a Challenge selected.':'Legt fest, ob ein Hinweis kommt, wenn du ohne gewählte Challenge durch das Portal willst.',
        'Decide whether or not to show extra information on Perk buttons.':'Legt fest, ob Perk-Knöpfe zusätzliche Angaben zeigen.',
        'Decide whether or not to wait for soldiers to die on switching between maps and world. Toggling this on will automatically abandon your soldiers.':'Legt fest, ob beim Wechsel zwischen Maps und Welt gewartet wird, bis die Soldaten fallen. Eingeschaltet werden sie sofort zurückgelassen.',
        'Toggle the button menu to the right of the map grid.':'Blendet die Knöpfe rechts neben dem Map-Raster ein oder aus.',
        'Customize your three available Geneticistassist targets, choose options for firing and sending, and decide whether or not Geneticistassist should start automatically when unlocked each run.':
            'Stellt die drei Ziele von Geneticistassist sowie Entlassen und Losschicken ein und legt fest, ob Geneticistassist in jedem Durchlauf nach der Freischaltung automatisch startet.',
        'Enable or disable Liquification. Nothing in game should be impossible to complete with Liquification enabled, but if you just want to slow things down then you have every right to do so.':
            'Schaltet Liquification ein oder aus. Mit Liquification bleibt alles im Spiel machbar, aber wenn du es langsamer magst, darfst du es abschalten.',
        'Choose if you would like to see a different cell color for cells that you overkilled. <b>No Overcolors</b> will not change any colors based on Overkill. <b>Normal Overkill Colors</b> is the default setting, and shows a special color for cells that were Overkilled. <b>Connected Overkill Colors</b> will show the Overkill cell colors for all cells while Overkilling.':
            'Legt fest, ob übersprungene (overkilled) Felder anders gefärbt werden. <b>Ohne Overkill-Farbe</b> ändert keine Farben. <b>Overkill-Farben</b> ist Standard und färbt übersprungene Felder. <b>Durchgehende Overkill-Farben</b> färbt beim Overkill alle betroffenen Felder.',
        'Choose whether you would like the game to pause combat by sending you to maps when you reach a Spire. <b>Keep Fighting at Spires</b> will not interrupt you when reaching a Spire, <b>Map at Spires</b> will send you to maps on every Spire, <b>Map at Top 2 Spires</b> will send you to maps at the highest and second highest level Spire reached, and <b>Map at Top Spire</b> will switch to maps only on the single highest Spire reached.':
            'Legt fest, ob der Kampf an einer Spire unterbrochen wird und es zu den Maps geht. <b>An Spires weiterkämpfen</b> unterbricht nicht, <b>Maps an Spires</b> wechselt an jeder Spire, <b>Maps an den 2 höchsten Spires</b> an der höchsten und zweithöchsten erreichten Spire und <b>Maps an der höchsten Spire</b> nur an der höchsten.',
        'A powerful tool to customize when where and how your maps should be automatically started.<br/><br/><b>Configure with hotkey Z.</b>':'Ein mächtiges Werkzeug, um festzulegen, wann, wo und wie Maps automatisch starten.',
        'Choose whether or not to display timestamps in the message log. <b>Local Timestamps</b> will log the current time according to your computer, <b>Run Timestamps</b> will log how long it has been since your run started. Note that toggling this setting will not add or remove timestamps from previous messages, but will add or remove them to or from any new ones.':
            'Legt fest, ob das Protokoll Zeitstempel zeigt. <b>Uhrzeit</b> zeigt die Uhrzeit deines Geräts, <b>Durchlaufzeit</b> die Zeit seit Beginn des Durchlaufs. Die Änderung gilt nur für neue Meldungen.',
        '<p>Toggle between <b>Limited GA Firing</b>, <b>Geneticistassist Fire</b> and <b>No GA Firing</b>.</p><p><b>Limited GA Firing</b> will prevent Geneticistassist from firing Farmers, Lumberjacks, or Miners.</p><p><b>Geneticistassist Fire</b> is the default value, and allows Geneticistassist to fire anything.</p><p><b>No GA Firing</b> prevents your Geneticistassist from being able to fire anything at all, including other Geneticists.</p>':
            '<p>Wählt zwischen <b>GA entlässt begrenzt</b>, <b>GA darf entlassen</b> und <b>GA entlässt nicht</b>.</p><p><b>GA entlässt begrenzt</b> verhindert, dass Geneticistassist Bauern, Holzfäller oder Bergleute entlässt.</p><p><b>GA darf entlassen</b> ist Standard und erlaubt Geneticistassist, alle zu entlassen.</p><p><b>GA entlässt nicht</b> verhindert jedes Entlassen durch Geneticistassist, auch von Genetikern.</p>',
        'Disable the snow effect in the world. <b>This will take effect on the next Zone after this setting is changed</b>. This setting is temporary, and will melt when the snow does.':'Schaltet den Schnee in der Welt ab. <b>Das wirkt ab der nächsten Zone</b>. Die Einstellung ist vorübergehend und schmilzt mit dem Schnee.',
        '<p>Choose between <b>Show Pumpkimps</b>, <b>Bordered Pumpkimps</b>, and <b>No Pumpkimps</b>. This setting applies only to the visual effect of Pumpkimp Zones in the world, does not apply to maps, and has no impact on how many Pumpkimps or Pumpkimp Zones actually spawn. This setting is temporary and will rot away after the Pumpkimp season!</p><p><b>Show Pumpkimps</b> is the default, and displays Pumpkimp Zones as normal.</p><p><b>Bordered Pumpkimps</b> displays Pumpkimp cells by changing the border color instead of the background color.</p><p><b>No Pumpkimps</b> will not show any indicator at all that a world Zone is a Pumpkimp Zone. Pumpkimps will still spawn at the same rate.</p>':
            '<p>Wählt zwischen <b>Gourdles zeigen</b>, <b>Gourdles mit Rand</b> und <b>Keine Gourdles</b>. Das betrifft nur die Darstellung der Gourdle-Zonen in der Welt, nicht Maps und nicht, wie viele Gourdles erscheinen. Die Einstellung ist vorübergehend und verrottet nach der Gourdle-Saison!</p><p><b>Gourdles zeigen</b> ist Standard und zeigt Gourdle-Zonen normal.</p><p><b>Gourdles mit Rand</b> markiert Gourdle-Felder mit der Randfarbe statt der Hintergrundfarbe.</p><p><b>Keine Gourdles</b> zeigt gar nicht an, dass eine Zone eine Gourdle-Zone ist. Gourdles erscheinen trotzdem gleich oft.</p>',
        '<p>When <b>Using Gene Send</b> is enabled, as long as you have one Geneticist, AutoFight will automatically send soldiers to fight if they have been breeding for longer than your Geneticistassist setting.</p><p>When <b>Enforce Gene Send</b> is enabled, as long as you have one Geneticist, AutoFight will never send a group of Trimps to fight unless you are at max population or you have reached your set Geneticistassist timer.</p><p>Finally, if you choose <b>Wait For Gene Send</b> and have at least one Geneticist, AutoFight will only send Trimps to fight after they have been breeding long enough to reach your set Geneticistassist timer. This guarantees that Anticipation and Geneticist levels build up for as long as your set timer, but may result in no soldiers being sent for some time while you sit at full population.</p>':
            '<p>Bei <b>Gene Send nutzen</b> schickt AutoFight, sobald du einen Genetiker hast, Soldaten in den Kampf, wenn sie länger als dein Geneticistassist-Ziel gezüchtet wurden.</p><p>Bei <b>Gene Send erzwingen</b> schickt AutoFight, sobald du einen Genetiker hast, nur dann eine Gruppe in den Kampf, wenn die Bevölkerung voll ist oder dein Geneticistassist-Timer erreicht ist.</p><p>Bei <b>Auf Gene Send warten</b> schickt AutoFight, sobald du einen Genetiker hast, Scruffies erst in den Kampf, wenn sie lange genug für deinen Geneticistassist-Timer gezüchtet wurden. So bauen sich Anticipation und Genetiker-Stufen über die volle Zeit auf, aber bei voller Bevölkerung kann eine Weile niemand losgeschickt werden.</p>',
        'When enabled, hiring Trimps for jobs with scaling price increases (Trainer, Explorer, etc) while you have no workspaces will attempt to fire Farmers, Lumberjacks and Miners until you have enough room.':
            'Eingeschaltet werden beim Einstellen für Berufe mit steigenden Preisen (Trainer, Entdecker usw.) ohne freie Arbeitsplätze so lange Bauern, Holzfäller und Bergleute entlassen, bis genug Platz ist.',
        'When enabled, all Gigastation purchases will act as if the Ctrl key was held, regardless of whether or not it actually was held. When disabled, you will have to hold Ctrl to tell Gigastations to automatically purchase Warpstations (See Gigastation tooltip for more info).':
            'Eingeschaltet kauft jeder Kauf einer Gigastation so viele Warpstations nach, wie du vorher hattest, sofern du sie dir leisten kannst. Ausgeschaltet baut eine Gigastation nur ihre eine neue Warpstation.',
        'Enable/Disable animations on Heirlooms.':'Schaltet Animationen bei Heirlooms ein oder aus.',
        'Decide whether or not you want your Trimps to automatically run the next Bionic Wonderland once they&apos;ve gotten all of the items from their current one. Repeat Maps must be toggled on for Climb BW to work.':
            'Legt fest, ob deine Scruffies automatisch das nächste Bionic Wonderland starten, sobald sie alle Items des aktuellen haben. Dafür muss Repeat Maps an sein.',
        'Customize the Archaeology Automator. Has no effect unless running the Archaeology Challenge.':'Stellt die Archaeology-Automatik ein. Wirkt nur in der Archaeology Challenge.',
        'Show or hide completed achievements.':'Blendet abgeschlossene Erfolge ein oder aus.',
        'Your Spire is Sealed, but you can look at it here if you want to.':'Deine Spire ist versiegelt, aber hier kannst du sie dir ansehen.',
        'Save when pausing the game. Note that regardless of this setting, the game will not be saved on pause if AutoSave is disabled.':'Speichert beim Pausieren. Ist automatisches Speichern aus, wird beim Pausieren nie gespeichert.',
        'Pause your game. This will pause all resource gathering, offline progress, and timers. (Hotkey: Space)':'Pausiert das Spiel: Sammeln, Offline-Fortschritt und alle Zeitmesser halten an.',
        'You can pause the game by clicking the run timer in the bottom right of the screen. This setting allows you to remove that ability!':'Das Spiel lässt sich über die Laufzeitanzeige pausieren. Mit dieser Einstellung schaltest du das ab.',
        'Delete your save and start fresh. Your Trimps will not be happy.':'Löscht deinen Spielstand für einen Neuanfang. Deine Scruffies werden nicht begeistert sein.',
        '<p><b>No Offline Progress</b> will cause no extra resources to be earned and no time to be warped when you return to the game. The Portal and Zone timers will not advance while offline, and the game will be in the same state you left it when you come back. This can be useful for speedrun achievements or if you just really really don&apos;t trust your Trimps when you&apos;re gone.</p><p><b>Hybrid Offline</b> combines Time Warp and Trustworthy Trimps into the best offline experience that Science can buy. Time Warp caps at 24 hours, so using Hybrid Offline will grant Trustworthy Trimps at the beginning of your Time Warp for all offline time over 24 hours, and will also grant Trustworthy Trimps for any extra time should you choose to end Time Warp early. Note that the Portal Time and Time in Zone clocks will advance for all time granted by Trustworthy Trimps and by Time Warp.</p><p><b>Time Warp Only</b> will grant up to 24 hours of your offline progress as Time Warp without granting any extra resources from Trustworthy Trimps at the beginning (for time over 24 hours), or at the end (for canceled Time Warp time). This can also be useful for timed runs or tracking stats, as the time added will be capped to however much time you spend in Time Warp.</p><p><b>Trustworthy Trimps Only</b> will skip Time Warp when you come back and grant resources for all time offline from Trustworthy Trimps. For when you want to get back in the game as soon as possible!</p><p style=&apos;text-align: center&apos;><b>This setting can be changed from the Time Warp screen<br/>or in Settings -> Other. Ctrl click from Settings to limit speed, or use the slider during Time Warp.</b></p>':
            '<p><b>Kein Offline-Fortschritt</b> bringt bei der Rückkehr keine Ressourcen und keinen Time Warp. Portal- und Zonenzeit laufen offline nicht weiter; das Spiel ist so, wie du es verlassen hast. Nützlich für Speedrun-Erfolge oder wenn du deinen Scruffies in deiner Abwesenheit wirklich nicht traust.</p><p><b>Hybrid offline</b> verbindet Time Warp und Trustworthy Trimps zum besten Offline-Erlebnis. Time Warp reicht höchstens 24 Stunden; Hybrid gibt für Offline-Zeit über 24 Stunden zu Beginn Trustworthy Trimps und ebenso für die Restzeit, wenn du Time Warp früher beendest. Portal- und Zonenzeit laufen für die ganze so gewährte Zeit weiter.</p><p><b>Nur Time Warp</b> gibt bis zu 24 Stunden Offline-Fortschritt als Time Warp, ohne zusätzliche Ressourcen aus Trustworthy Trimps am Anfang (über 24 Stunden) oder am Ende (abgebrochene Time-Warp-Zeit). Nützlich für Zeitläufe oder Statistiken, weil nur die Zeit im Time Warp zählt.</p><p><b>Nur Trustworthy Trimps</b> überspringt Time Warp und gibt Ressourcen für die ganze Offline-Zeit. Für alle, die schnell wieder ins Spiel wollen!</p><p style=&apos;text-align: center&apos;><b>Die Einstellung lässt sich auch im Time-Warp-Bildschirm ändern<br/>oder unter Einstellungen → Sonstiges. Mit dem Schieberegler im Time Warp begrenzt du das Tempo.</b></p>',
        'Choose whether or not to force instant-craft buildings to use the queue. Currently applies  only to Warpstation. May be useful for double checking prices before building!':'Legt fest, ob sofort gebaute Gebäude trotzdem in die Bauliste kommen. Gilt derzeit nur für die Warpstation. Praktisch, um Preise vor dem Bau zu prüfen!',
        'Choose whether or not to force instant-craft buildings to use the queue. Currently applies  to Warpstation and AutoStorage. May be useful for double checking prices before building!':'Legt fest, ob sofort gebaute Gebäude trotzdem in die Bauliste kommen. Gilt derzeit für Warpstation und AutoStorage. Praktisch, um Preise vor dem Bau zu prüfen!',
        'Toggle on or off the display of yellow alert icons when unlocking something new.':'Blendet bei neuen Freischaltungen gelbe Hinweiszeichen ein oder aus.',
        'Toggle on or off the display of blue alert icons when unlocking something new.':'Blendet bei neuen Freischaltungen blaue Hinweiszeichen ein oder aus.'
    };
    const settingPatterns = [
        [/^Repeat (\d+) Times?$/, (_, n) => n + '× wiederholen'],
        [/^Map At Z(.+)$/, (_, zone) => 'Map at Zone ' + zone],
        [/^Info (.+)$/, (_, label) => 'Info ' + (Object.hasOwn(settingNames, label) ? settingNames[label] : keyNames[label] || nameOf(label))]
    ];
    const settingFragments = [
        [/<p>Choose which upgrades you want first if it has been a while since you last ran maps\.<\/p><p><b>Tier First<\/b> will cause maps to drop all items for the lowest tier before moving to the next\. \(([^)]*)\)<\/p><p><b>Equip First<\/b> will start from Shield and drop all available Shield prestiges before continuing to Dagger and so on\. \(Shield III -> Shield IV -> Dagger III\)<\/p>/g,
            '<p>Legt fest, welche Upgrades zuerst kommen, wenn du länger keine Maps gespielt hast.</p><p><b>Stufe zuerst</b> lässt Maps erst alle Items der niedrigsten Stufe fallen, dann die nächste. ($1)</p><p><b>Ausrüstung zuerst</b> beginnt beim Schild mit allen verfügbaren Prestige-Stufen und macht dann mit dem Dolch weiter. (Shield III -> Shield IV -> Dagger III)</p>'],
        [/Choose what you would like to see on your Mastery Tab! <b>No Mastery Info<\/b> will keep the tab clean and static\. <b>Alert Mastery<\/b> will show an alert on the tab as soon as a new Mastery becomes affordable\. <b>Show Essence<\/b> will always show your total amount of unspent essence on the tab\. <b>Hybrid Alerts<\/b> will show your total amount of unspent essence on the tab, but will switch to the alert icon once you have enough essence for a new Mastery\./g,
            'Legt fest, was der Mastery-Reiter zeigt. <b>Keine Mastery-Info</b> hält ihn schlicht. <b>Mastery-Hinweis</b> zeigt einen Hinweis, sobald du dir eine neue Mastery leisten kannst. <b>Essence anzeigen</b> zeigt immer deine unverbrauchte Essence. <b>Hybrid-Hinweise</b> zeigt die Essence und wechselt zum Hinweis, sobald eine neue Mastery bezahlbar ist.'],
        [/<br\/><br\/>This setting also controls the Mutator tab!/g, '<br/><br/>Die Einstellung gilt auch für den Mutator-Reiter!'],
        [/<p>This setting applies to big popups that occur after hitting certain milestones each portal\. This setting will currently block: the Oddity popup/g, '<p>Betrifft die großen Popups, die in jedem Durchlauf an bestimmten Meilensteinen erscheinen. Derzeit blockiert: das Popup bei Oddity'],
        [/, the popup at Corruption/g, ', das Popup bei Corruption'], [/, the popup at The Spire/g, ', das Popup bei The Spire'], [/, the popup on reaching Magma/g, ', das Popup beim Erreichen von Magma'],
        [/, the popup on reaching Mutation/g, ', das Popup beim Erreichen von Mutation'], [/, and the popup on reaching Stuffy&#39;s Spire\./g, ' und das Popup beim Erreichen von Stuffy&#39;s Spire'],
        [/<\/p><p>Note that this setting only blocks large popups once your Highest Zone Reached is 20 Zones past the location of the popup\.<\/p>/g, '.</p><p>Ein großes Popup wird erst blockiert, wenn deine höchste erreichte Zone 20 Zonen hinter seiner Stelle liegt.</p>'],
        [/<p>Choose what mode the Dimensional Generator should start each run on\. <b>Default Generator<\/b> will continue with whatever setting you were using at the end of your last run\. <b>The rest of the settings<b> are named by what mode will be set to active at the start of each run\.<\/p>/g,
            '<p>Legt fest, in welchem Modus der Dimensional Generator jeden Durchlauf beginnt. <b>Wie zuletzt</b> behält den Modus vom Ende deines letzten Durchlaufs. <b>Die übrigen Einstellungen</b> heißen wie der Modus, der zu Beginn jedes Durchlaufs aktiv wird.</p>'],
        [/<p><b>Hold Ctrl while clicking to open the Generator State Configuration menu\.<\/b><\/p>/g, '<p><b>Generator-Modi je Zone legst du im Dimensional Generator unter „Zone rules“ fest.</b></p>']
    ];
    const settingFragmentProbe = /Choose which upgrades|Mastery Tab|Mutator tab|big popups|the popup|Highest Zone Reached|Dimensional Generator should start|Generator State/;
    // Step 2 joins the main screen catalog; setting labels come first so "Info Autosave" finds its German name.
    const allPatterns = [...settingPatterns, ...patterns, ...tipPatterns];
    const allProbe = new RegExp(probe.source + '|^Each Trap|^Build a Smithy|^Each trainer|^Worshippers|^Repeat \\d|^Map At Z|^Info ' +
        '|^Increase (?:Helium|Radon|Scruffy) |^Decrease the minimum amount|^You can only choose one|^Each time Golden|^This upgrade would put|^Note: The absolute maximum|^You can\'t earn|^Free(?: \\(|$)');
    const catalog = {names, strings:{...strings, ...tooltips, ...settingNames, ...settingTitles, ...settingTexts}, patterns:allPatterns, probe:allProbe,
        fragments:[...fragments, ...settingFragments], fragmentProbe:new RegExp(fragmentProbe.source + '|' + settingFragmentProbe.source),
        settings:{}, scope:scope + ',#tipText,#settingsHere', css, attributes:['data-action-label','data-short-label','data-bottleneck-wait','data-bottleneck'], nameOf};
    if (typeof MobileI18nGame !== 'undefined') MobileI18nGame.register('de', catalog);
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeGame;
