// V-243 step 4g: German texts of Fluffy and Scruffy, the Heirloom window and the quests of the Quest challenge.
// Names stay English like the other glossary terms of the original: Fluffy, Scruffy, Cruffys, Heirloom item and modifier
// names, rarities (Common … Mutated; they are also part of the saved item names), Shield/Staff/Core, Nullifium/Nu and
// Spirestones/Ss. Engine keys, saves and the English texts stay unchanged:
// - Fluffy is a global of main.js that saves never contain: its tooltip, pat lines, Exp breakdown and the ability
//   descriptions (rewardConfig) become German at the source, through their result, only inside the Fluffy window;
// - the Heirloom window keeps its own observer with its own short words (Equip, Carry, Empty …), so they never reach the
//   shared catalog of stage 2 or other windows; user given item names are never looked at;
// - quest descriptions are saved with an active Quest challenge, so they stay English in the config and become German
//   only in the message log and in the zone info line.
var MobileI18nDeLate = (() => {
    const brand = value => typeof MobileBranding === 'undefined' ? value : MobileBranding.text(value);
    const one = (n, singular, plural) => n === '1' ? singular : plural;
    const res = {food:'Nahrung', wood:'Holz', metal:'Metall', science:'Wissenschaft', gems:'Edelsteine'};
    // A translator over exact texts and anchored patterns on the branded text. German results are remembered and never
    // translated again (idempotent, no observer loops); surrounding whitespace stays.
    function translator(strings, patterns) {
        const map = new Map(Object.entries(strings)), cache = new Map(), produced = new Set();
        for (const [english, german] of Object.entries(strings)) map.set(brand(english), german);
        function find(core) {
            if (map.has(core)) return map.get(core);
            const branded = brand(core);
            if (map.has(branded)) return map.get(branded);
            for (const [pattern, replace] of patterns) { const match = branded.match(pattern); if (match) { const out = replace(...match); if (out != null) return out; } }
            return null;
        }
        return value => {
            if (typeof value !== 'string') return value;
            const core = value.trim();
            if (!core || !/[A-Za-z]/.test(core) || produced.has(core)) return value;
            let next = cache.get(core);
            if (next === undefined) { next = find(core); if (cache.size > 2000) { cache.clear(); produced.clear(); } cache.set(core, next); if (next !== null) produced.add(next.trim()); }
            if (next === null) return value;
            const at = value.indexOf(core);
            return value.slice(0, at) + next + value.slice(at + core.length);
        };
    }
    // Text between tags of a markup string; tags and their attributes (onclick code, styles) stay as they are.
    // keep (optional) names a tag whose text is never translated, such as the h5 with an Heirloom's own name.
    const markup = (tr, keep) => html => typeof html === 'string' ? html.replace(/(^|>)([^<>]+)(?=<|$)/g, (_, lead, text, at, all) =>
        lead + (keep && keep.test(all.slice(all.lastIndexOf('<', at), at + 1)) ? text : tr(text))) : html;

    // ---------------------------------------------------------------- Fluffy and Scruffy (main.js, var Fluffy)
    // Fixed ability descriptions (Fluffy.rewardConfig) by engine key.
    const rewards = {
        stickler: 'Erhöht die Chance auf die höchste verfügbare Heirloom-Seltenheit um 5% und senkt die Chance auf die niedrigste um 5%.',
        purifier: 'Corrupted- und Healthy-Gegner in aktiven Spires haben mit 50% Chance keine Spezialfähigkeit.',
        lucky: 'Schließt du eine Map mit Cache ab, findest du mit +25% Chance einen zweiten Cache.',
        overkiller: 'Overkill erreicht jetzt einen weiteren Gegner.',
        eliminator: 'Corrupted- und Healthy-Gegner in aktiven Spires haben keine Spezialfähigkeiten mehr.',
        liquid: 'Erhöht deinen Liquification-Bonus um 2.5% (eine halbe Spire).',
        voidance: 'Nach jedem Portal startest du mit zwei doppelt gestapelten Void Maps.',
        critChance: 'Gibt deinen Scruffies zusätzlich 50% Krit-Chance.',
        voidelicious: 'Nach jedem Portal startest du mit je 1 Void Map jedes Namens (insgesamt 16).',
        naturesWrath: 'Verbessert die Empowerments of Nature! Poison erhält +10 auf die Stack-Transfer-Rate, die Helium-Belohnungen von Wind steigen auf das 5-Fache, und der Schadensbonus von Ice verdoppelt sich.',
        voidSiphon: 'Deine Scruffies erhalten für jede abgeschlossene Void Map 5% Attack. Der Bonus addiert sich und verfällt beim Portal.',
        plaguebrought: 'Deine Scruffies erhalten +50% auf ihren Plaguebringer-Modifikator, und alle Nature-Stapel bauen sich doppelt so schnell auf.',
        trapper: 'Fallen sind 10-mal größer und wirksamer.',
        healthy: 'Deine Scruffies erhalten +50% Health.',
        prism: 'Fügt dem Prismatic Shield deiner Scruffies 25% ihrer maximalen Health hinzu.',
        gatherer: 'Ressourcen, die deine Scruffies sammeln, verdoppeln sich.',
        reincarnate: 'Würde eine Gruppe Scruffies sterben, wird sie stattdessen mit 20% Chance vollständig geheilt. Das wirkt nicht, wenn die Scruffies mit einem einzigen Treffer getötet wurden.',
        heirloopy: 'Die Heirloom-Modifikatoren Pet Exp, Plaguebringer, Void Map Drop Chance und Crit Chance werden in Universum 2 nicht mehr abgeschwächt.',
        shieldlayer: 'Gibt deinem Prismatic Shield eine zusätzliche Schicht.',
        tenacity: 'Jede Zone beginnt mit zusätzlich 15% der Tenacity-Zeit der vorigen Zone, schon angerechnet.',
        smithy: 'Senkt den multiplikativen Kostenanstieg aller Materialien der Rüstschmiede um 20% (von x50 auf x40 je gekaufter Rüstschmiede).',
        biggerbetterheirlooms: 'Du kannst zusätzlich 30% deines insgesamt verdienten Nullifiums für alle deine Heirlooms ausgeben.',
        justdam: 'Bringt nur Schaden und keinen weiteren Bonus. Wird sich eines Tages zu etwas Stärkerem entwickeln!',
        bigSeeds: 'Du erhältst 10-mal so viele Mutated Seeds als Beute.',
        bigDust: 'Scruffy bringt Huffy bei, bei den Gegnern von Spire Assault 5-mal so viel Dust zu finden.',
        scruffBurst: 'Gamma Burst braucht 1 Angriff weniger, bis er auslöst.',
        radortle2: 'Scruffys Bonus aus Stufe 3, der den Radon-Ertrag nach der höchsten Zone des letzten Portals erhöht, richtet sich jetzt nach deiner höchsten jemals erreichten Zone in Universum 2.',
        doubleCrit: 'Deine Scruffies erhalten +20% Double Crit.',
        cruf1: 'Multipliziert das verdiente Radon mit 1.5.',
        cruf2: 'Multipliziert das verdiente Radon mit 2 und gibt deinen Scruffies 5% mehr Health und Attack.',
        cruf3: 'Multipliziert das verdiente Radon mit 2.5 und erhöht alle erbeuteten oder gesammelten Ressourcen um 15%.',
        cruf4: 'Multipliziert das verdiente Radon mit 3 und gibt +20% Chance auf Void Maps als Beute.',
        cruf5: 'Gibt 35% Krit-Chance und erhöht den Grund-Krit-Schaden um 50%.',
        cruf6: 'Multipliziert das verdiente Radon mit 1.75 und erhöht die Health- und Attack-Boni von Cruffys für deine Scruffies um 10%.',
        cruf7: 'Multipliziert das verdiente Radon mit 2 und erhöht den Ressourcenbonus aus Stufe 3 um 25%.',
        cruf8: 'Multipliziert das verdiente Radon mit 1.1, und Cruffys bleibt nach dem Ende von Nurture noch 5 Zonen und gibt alle Boni außer Radon.',
        cruf9: 'Multipliziert das verdiente Radon mit 1.1 und erhöht die Attack-, Health- und Ressourcenboni von Cruffys für deine Scruffies um weitere 20%. Cruffys bleibt nach dem Ende von Nurture 5 weitere Zonen in deinem Universum.'
    };
    const zones = n => n + ' ' + one(n, 'Zone', 'Zonen');
    const cruffysTail = /^Multiplies Radon earned by 1\.04, and increases Cruffys' Scruffy attack, health, and resource bonuses by an additional 10%\. Cruffys will stay in your Universe for 1 additional Zone after Nurture ends for every 2 levels earned \(11, 13, 15 etc\)\. This is repeatable up to 10 times to a max level of 19\.(?:<br\/><br\/><b>Currently multiplying Radon earned by (\S+), increasing attack, health and resources by (\S+)% and Cruffys will stay for (\d+) additional Zones?\.<\/b>)?$/;
    // Ability descriptions written by getters (their values change), on the branded text.
    const rewardPatterns = [
        [/^(Helium|Radon) gain from all sources is increased by 25%\.$/, (_, what) => 'Der Ertrag an ' + what + ' aus allen Quellen steigt um 25%.'],
        [/^Allows up to two Void Maps with the same name to stick together\. After completing this 2x Void Map, (Fluffy|Scruffy) will clear the extra one instantly, granting 50% more (Helium|Radon) than normal and a second Heirloom\.$/,
            (_, pet, what) => 'Bis zu zwei Void Maps mit gleichem Namen können sich stapeln. Schließt du diese doppelte Void Map ab, erledigt ' + pet + ' die zweite sofort; das bringt 50% mehr ' + what + ' als sonst und ein zweites Heirloom.'],
        [/^Start each U2 run with 1 extra Void Map for every 5 Void Maps cleared on your last U2 run\. \((\d+) cleared so far this run, granting (\d+) extra next run\)$/,
            (_, n, m) => 'Jeder Durchlauf in U2 beginnt mit 1 zusätzlichen Void Map je 5 Void Maps, die du im letzten U2-Durchlauf abgeschlossen hast. (In diesem Durchlauf bisher ' + n + ' abgeschlossen, das bringt im nächsten ' + m + ' zusätzliche)'],
        [/^Adds 100% to the reward modifier of all Daily Challenges\.$/, () => 'Erhöht den Belohnungsmodifikator aller Daily Challenges um 100%.'],
        [/^Adds \+2x to your MegaCrit multiplier, increasing (.+?) damage to (\S+)x and (.+?) damage to (\S+)x\.$/,
            (_, first, a, second, b) => 'Erhöht deinen MegaCrit-Multiplikator um +2x: Der Schaden von ' + first + ' steigt auf ' + a + 'x, der von ' + second + ' auf ' + b + 'x.'],
        [/^Allows an additional 4 Void Maps with the same name to stick together, bringing the max stack size to (\d+)\. Each map in the stack that (Fluffy|Scruffy) clears grants an additional 50% Helium to all other maps in the stack, giving a bonus of up to \+(\S+)% to each of the (\d+) \2 maps from a \1 stack\.$/,
            (_, size, pet, bonus, n) => 'Weitere 4 Void Maps mit gleichem Namen können sich stapeln, ein Stapel fasst damit bis zu ' + size + '. Jede Map im Stapel, die ' + pet + ' erledigt, gibt allen anderen Maps im Stapel zusätzlich 50% Helium; in einem Stapel aus ' + size + ' erhält so jede der ' + n + ' Maps von ' + pet + ' bis zu +' + bonus + '%.'],
        [/^Doubles the amount of resources gained from Battle \(excluding (Helium|Radon)\)\.$/, (_, what) => 'Verdoppelt die Ressourcen aus Kämpfen (außer ' + what + ').'],
        // Branding names the Exotic Imports Rare Kin (V-226).
        [/^Increases the chance of finding (?:Exotic Imports|Rare Kin), bringing the average from (\S+) per zone to (\S+)\.$/, (_, a, b) => 'Erhöht die Chance auf Rare Kin: im Schnitt ' + b + ' statt ' + a + ' je Zone.'],
        [/^Increases Radon gain from all sources by 3% for each Zone you reached on your last Portal in this Universe \(compounding\)\. You reached Z(\d+) last Portal, worth \+(\S+)% Radon\.$/,
            (_, zone, n) => 'Erhöht den Radon-Ertrag aus allen Quellen um 3% für jede Zone, die du beim letzten Portal in diesem Universum erreicht hast (multiplikativ). Beim letzten Portal hast du Z' + zone + ' erreicht, das sind +' + n + '% Radon.'],
        [/^Increases Radon gain from all sources by 3% for each Zone you reached on your best Portal in this Universe \(compounding\)\. Your highest Zone reached is Z(\d+), worth \+(\S+)% Radon\.$/,
            (_, zone, n) => 'Erhöht den Radon-Ertrag aus allen Quellen um 3% für jede Zone deines besten Portals in diesem Universum (multiplikativ). Deine höchste erreichte Zone ist Z' + zone + ', das sind +' + n + '% Radon.'],
        [/^Your Scruffies gain \+4% Attack and \+0\.25% Crit Chance per Spire Assault level cleared while on a Daily Challenge\. You have cleared (-?\d+) SA levels, granting \+(\S+)% Attack and \+(\S+)% Crit Chance on Daily Challenges\.$/,
            (_, n, a, c) => 'In Daily Challenges erhalten deine Scruffies je abgeschlossenem Spire-Assault-Level +4% Attack und +0.25% Krit-Chance. Du hast ' + n + ' SA-Level abgeschlossen; das bringt in Daily Challenges +' + a + '% Attack und +' + c + '% Krit-Chance.'],
        [/^Scruffy's level 18 bonus that grants extra Void Maps now starts each U2 run with <b>1\.5<\/b> extra Void Maps for every 5 Void Maps cleared on your BEST U2 run\. \((\d+) cleared on your best run, granting (\d+) extra next run\)$/,
            (_, n, m) => 'Scruffys Bonus aus Stufe 18 mit zusätzlichen Void Maps startet jeden U2-Durchlauf jetzt mit <b>1.5</b> zusätzlichen Void Maps je 5 Void Maps, die du in deinem BESTEN U2-Durchlauf abgeschlossen hast. (Im besten Durchlauf ' + n + ' abgeschlossen, das bringt im nächsten ' + m + ' zusätzliche)'],
        [/^Your Scruffies gain \+50% Health per Scruffy level\. Scruffy is currently level (\d+), granting \+(\S+)% Health\.$/,
            (_, level, n) => 'Deine Scruffies erhalten +50% Health je Stufe von Scruffy. Scruffy hat derzeit Stufe ' + level + ', das bringt +' + n + '% Health.'],
        [cruffysTail, (_, radon, bonus, stay) => 'Multipliziert das verdiente Radon mit 1.04 und erhöht die Attack-, Health- und Ressourcenboni von Cruffys für deine Scruffies um weitere 10%. Cruffys bleibt nach dem Ende von Nurture je 2 erreichten Stufen (11, 13, 15 usw.) 1 weitere Zone in deinem Universum. Das wiederholt sich bis zu 10-mal, bis Stufe 19.' +
            (radon ? '<br/><br/><b>Derzeit wird das verdiente Radon mit ' + radon + ' multipliziert, Attack, Health und Ressourcen steigen um ' + bonus + '%, und Cruffys bleibt ' + zones(stay).replace(/^(\d+) /, '$1 weitere ') + '.</b>' : '')]
    ];
    const pet = '(Fluffy|Scruffy|Cruffys)';
    const genitive = name => name + (name.endsWith('s') ? '’' : 's');
    // Pat lines and moods (getFluff), with or without the leading "- " of the tooltip.
    const moods = {
        "He's enjoying the grind.": 'Er genießt die Plackerei.', "He can't wait to get stronger.": 'Er kann es kaum erwarten, stärker zu werden.',
        'He could probably use a shower.': 'Eine Dusche könnte ihm nicht schaden.', "He's growing up so fast.": 'Er wird so schnell groß.',
        'His fur is looking healthy today.': 'Sein Fell sieht heute gesund aus.', "He's feeling quite capable.": 'Er fühlt sich ziemlich fähig.',
        'He still drools a bit in his sleep.': 'Im Schlaf sabbert er noch ein bisschen.', 'He loves a good game of fetch.': 'Er liebt eine gute Runde Stöckchenholen.',
        "He's been practicing juggling.": 'Er hat Jonglieren geübt.', 'He does a flip.': 'Er macht einen Salto.',
        "He's the only Scruffy not scared by your campfire ghost stories.": 'Er ist der einzige Scruffy, den deine Gruselgeschichten am Lagerfeuer nicht erschrecken.'
    };
    const pats = {
        ' makes a purr-like sound.': ' schnurrt beinahe.', ' reminds you to scratch behind the ears.': ' erinnert dich daran, ihn hinter den Ohren zu kraulen.',
        ' appreciates the pat!': ' freut sich über das Streicheln!', " thinks you're the best.": ' findet dich großartig.',
        ' frickin loves pats!': ' liebt Streicheleinheiten über alles!', ' looks quite happy.': ' sieht ziemlich glücklich aus.'
    };
    const proud = {
        "'s just chillin.": ' chillt einfach.', " can now predict the future, though he won't tell you what's going to happen.": ' kann jetzt die Zukunft vorhersagen, verrät dir aber nicht, was passieren wird.',
        "'s looking pretty buff.": ' sieht ziemlich muskulös aus.', "'s smelling great today.": ' riecht heute großartig.', ' is a model Scruffy.': ' ist ein Muster-Scruffy.',
        ' can do anything.': ' kann einfach alles.', ' once killed a Slitherkin with a well-timed insult.': ' hat einmal Slitherkin mit einer gut getimten Beleidigung erledigt.',
        ' can juggle 3 dozen scientists without breaking a sweat.': ' jongliert mit drei Dutzend Forschern, ohne ins Schwitzen zu kommen.',
        ' does a barrel roll.': ' macht eine Fassrolle.', "'s thinking about writing a book.": ' denkt darüber nach, ein Buch zu schreiben.'
    };
    const esc = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const alt = object => Object.keys(object).map(esc).join('|');
    const fluffPatterns = [
        [new RegExp('^(- )?(' + alt(moods) + ')$'), (_, dash, mood) => (dash || '') + moods[mood]],
        [new RegExp('^(- )?(Fluffy|Scruffy)(' + alt(pats) + ") You've pet \\2 (\\d+) times?\\.$"), (_, dash, name, line, n) => (dash || '') + name + pats[line] + ' Du hast ' + name + ' ' + n + '-mal gestreichelt.'],
        [new RegExp('^(- )?(Fluffy|Scruffy)(' + alt(proud) + ')$'), (_, dash, name, line) => (dash || '') + name + proud[line]],
        [/^(- )?(FLUFFY|SCRUFFY) SMASH$/, (_, dash, name) => (dash || '') + name + ' ZERSCHMETTERT']
    ];
    // Lines of the Fluffy window (tooltip, refreshTooltip) and of its Exp breakdown (expBreakdown), on the branded text.
    const fluffyStrings = {
        Level: 'Stufe', Ability: 'Fähigkeit', '+Damage': '+Schaden', 'Evolve!': 'Entwickeln!', 'Abort Evolution': 'Evolution abbrechen',
        'From Mutators. Currently granting 1.3x.': 'Aus den Mutators. Derzeit 1.3x.'
    };
    const fluffyPatterns = [
        ...fluffPatterns,
        [/^Level (\d+)$/, (_, n) => 'Stufe ' + n],
        [/^Lv (\d+)$/, (_, n) => 'Stufe ' + n],
        [/^\+(\S+)% damage$/, (_, n) => '+' + n + '% Schaden'],
        [/^- Cruffys cannot gain Experience after the Nurture Challenge ends, but will stick around for (-?\d+) more Zones\.$/, (_, n) => '- Cruffys erhält nach dem Ende der Challenge Nurture keine Exp mehr, bleibt aber noch ' + zones(n) + '.'],
        [new RegExp('^- ' + pet + "'s level and damage bonus are currently reduced\\. \\1 will return to level (\\d+) when points are placed back in Capable\\.$"),
            (_, name, n) => '- Stufe und Schadensbonus von ' + name + ' sind derzeit gesenkt. ' + name + ' kehrt auf Stufe ' + n + ' zurück, sobald du wieder Punkte in Capable setzt.'],
        [new RegExp('^- ' + pet + ' needs  at least one point of Capable to gain any Exp(\\. Complete Spire II to unlock Capable!)?$'),
            (_, name, locked) => '- ' + name + ' braucht mindestens einen Punkt in Capable, um Exp zu sammeln.' + (locked ? ' Schließe Spire II ab, um Capable freizuschalten!' : '')],
        [new RegExp('^- ' + pet + ' needs  more points in Capable to gain Exp above level (\\d+)\\.$'), (_, name, n) => '- ' + name + ' braucht mehr Punkte in Capable, um über Stufe ' + n + ' hinaus Exp zu sammeln.'],
        [new RegExp('^- ' + pet + ' cannot gain any Experience from Zones lower than (\\d+)$'), (_, name, n) => '- ' + name + ' erhält in Zonen unter ' + n + ' keine Exp.'],
        [new RegExp('^- ' + pet + ' is earning (\\S+) Exp per Zone\\. \\1 needs (\\S+) more Exp to level(?:, equivalent to repeating your current run to this zone about (\\S+) more times?)?\\.$'),
            (_, name, gain, need, runs) => '- ' + name + ' erhält ' + gain + ' Exp je Zone und braucht noch ' + need + ' Exp bis zur nächsten Stufe' +
                (runs === undefined ? '' : '; das entspricht etwa ' + runs + ' ' + one(runs, 'weiteren Durchlauf', 'weiteren Durchläufen') + ' bis zu dieser Zone') + '.'],
        [new RegExp('^' + pet + ' is ready to Evolve! This will reset his damage bonus and most abilities back to level 0, but he will regrow to be stronger than ever\\. You can cancel this Evolution at any point to return to level 10\\.$'),
            (_, name) => name + ' kann sich entwickeln! Dabei fallen sein Schadensbonus und die meisten Fähigkeiten auf Stufe 0 zurück, aber er wächst stärker als je zuvor nach. Du kannst diese Evolution jederzeit abbrechen und zu Stufe 10 zurückkehren.'],
        [new RegExp('^- ' + pet + "'s Exp gain at the end of each Zone is equal to:$"), (_, name) => '- So viel Exp erhält ' + name + ' am Ende jeder Zone:'],
        // Exp breakdown (Fluffy.expBreakdown)
        [/^Applies when running a Daily Challenge, and matches the extra (Helium|Radon) from your Daily\. Currently (\S+)\. Does not apply to Best (Fluffy|Scruffy) Exp\.$/,
            (_, what, n, name) => 'Gilt in einer Daily Challenge und entspricht dem zusätzlichen ' + what + ' deiner Daily. Derzeit ' + n + '. Zählt nicht zur Bestmarke der ' + name + '-Exp.'],
        [/^Your Zone number\. Currently (\d+)\.$/, (_, n) => 'Die Nummer deiner Zone. Derzeit ' + n + '.'],
        [/^The amount of levels placed in the (Cunning|Curious) Perk\. Currently (\d+)\.$/, (_, perk, n) => 'Deine Stufen im Perk ' + perk + '. Derzeit ' + n + '.'],
        [/^The Zone Fluffy can start earning Experience at\. This value is normally 301, and is currently reduced by (\d+) thanks to (?:(\d+) levels? of )?Classy\.$/,
            (_, n, levels) => 'Die Zone, ab der Fluffy Exp sammelt. Normal ist das Zone 301, derzeit ' + n + ' weniger dank ' + (levels ? levels + ' ' + one(levels, 'Stufe', 'Stufen') + ' ' : '') + 'Classy.'],
        [/^The bonus modifier applied from "Pet Exp" on a Plagued or higher tier Staff\. Currently (\S+)\.$/, (_, n) => 'Der Bonusmodifikator von ‚Pet Exp‘ auf einem Staff der Seltenheit Plagued oder höher. Derzeit ' + n + '.'],
        [/^The bonus modifier from the Flufffocus Mastery \(\+25% exp per Prestige\)\. (Fluffy|Scruffy) has evolved (\d+) times?, bringing this modifier to (\S+)\.$/,
            (_, name, n, m) => 'Der Bonusmodifikator der Mastery Flufffocus (+25% Exp je Evolution). ' + name + ' hat sich ' + n + '-mal entwickelt, der Modifikator beträgt damit ' + m + '.'],
        [/^The bonus from your Knowledge Towers\. You have (\d+) Knowledge Towers?, granting a bonus of (\S+)% each, bringing this modifier to (\S+)\.$/,
            (_, n, each, m) => 'Der Bonus deiner Knowledge Towers. Du hast ' + n + ' ' + one(n, 'Knowledge Tower', 'Knowledge Towers') + ' mit je ' + each + '% Bonus; der Modifikator beträgt damit ' + m + '.'],
        [/^From Enlightened Ice\. Equal to \(1 \+ \(0\.0025 \* Ice Levels\)\), currently (\S+)\. Does not apply to Best Fluffy Exp\.$/,
            (_, n) => 'Aus Enlightened Ice. Entspricht (1 + (0.0025 * Ice-Stufen)), derzeit ' + n + '. Zählt nicht zur Bestmarke der Fluffy-Exp.'],
        [/^From Nurture\. Increases Exp gain by 10% \(compounding\) per constructed Laboratory\. Currently granting (\S+)x\.$/, (_, n) => 'Aus Nurture. Erhöht die Exp je gebautem Labor um 10% (multiplikativ). Derzeit ' + n + 'x.'],
        [/^From the Battlescruff Spire Assault reward\. Increases Scruffy XP gained by 2% per level cleared, currently granting (\S+)x\.$/,
            (_, n) => 'Aus der Spire-Assault-Belohnung Battlescruff. Erhöht Scruffys Exp um 2% je abgeschlossenem Level, derzeit ' + n + 'x.'],
        [/^From the Frigid Challenge\. Currently granting (\S+)x\.$/, (_, n) => 'Aus der Challenge Frigid. Derzeit ' + n + 'x.'],
        [/^From knowledge gained in Stuffy's Spire\. Currently granting (\S+)x\.$/, (_, n) => 'Aus dem Wissen aus Stuffy’s Spire. Derzeit ' + n + 'x.']
    ];
    const fluffyText = translator(fluffyStrings, fluffyPatterns), rewardText = translator({}, rewardPatterns), fluffyHtml = markup(fluffyText);
    // Fluffy keeps its methods; only their German result is new. rewardConfig: strings by key, getters through their result.
    const doneFluffy = new WeakSet();
    function translateFluffy(F, doc) {
        if (!F || typeof F !== 'object' || doneFluffy.has(F)) return F;
        doneFluffy.add(F);
        for (const [key, entry] of Object.entries(F.rewardConfig || {})) {
            const d = Object.getOwnPropertyDescriptor(entry, 'description');
            if (!d) continue;
            if (d.get) Object.defineProperty(entry, 'description', {...d, get() { return rewardText(d.get.call(this)); }});
            else if (typeof d.value === 'string' && Object.hasOwn(rewards, key)) entry.description = rewards[key];
        }
        const wrap = (fn, change) => { const original = F[fn]; if (typeof original === 'function') F[fn] = function (...args) { return change(original.apply(this, args), args); }; };
        wrap('tooltip', result => Array.isArray(result) ? result.map(fluffyHtml) : fluffyHtml(result));
        wrap('getFluff', fluffyText);
        // expBreakdown writes its line into #fluffyExpBreakdown; the German line replaces it right there.
        wrap('expBreakdown', result => { const elem = doc?.getElementById?.('fluffyExpBreakdown'); if (elem) { const next = fluffyHtml(elem.innerHTML); if (next !== elem.innerHTML) elem.innerHTML = next; } return result; });
        return F;
    }

    // ---------------------------------------------------------------- Quests (config.js, game.challenges.Quest)
    // Possessive with the gender of each resource (die Nahrung, das Holz …).
    const yours = {food:'deine Nahrung', wood:'dein Holz', metal:'dein Metall', gems:'deine Edelsteine', science:'deine Wissenschaft'};
    const quests = [
        [/^Quintuple \(x5\) your (food|wood|metal|gems|science)$/, (_, key) => 'Verfünffache (x5) ' + yours[key]],
        [/^Double your (food|wood|metal|gems|science)$/, (_, key) => 'Verdopple ' + yours[key]],
        [/^Complete 5 Maps at Zone level$/, () => 'Schließe 5 Maps auf Zonenstufe ab'],
        [/^One-shot 5 world enemies$/, () => 'Besiege 5 Gegner der Welt mit je einem Treffer'],
        [/^Don't let your shield break before Cell 100$/, () => 'Lass deinen Schild vor Feld 100 nicht brechen'],
        [/^Don't run a map before Cell 100$/, () => 'Starte vor Feld 100 keine Map'],
        [/^Buy a Smithy$/, () => 'Kaufe eine Rüstschmiede']
    ];
    const quest = text => { for (const [pattern, replace] of quests) { const match = text.match(pattern); if (match) return replace(...match); } return null; };
    const progress = {'Quest Complete!': 'Quest erfüllt!', 'Failed!': 'Gescheitert!', 'Still Earnable!': 'Noch erreichbar!'};
    const questProgress = text => {
        if (Object.hasOwn(progress, text)) return progress[text];
        if (/^\d+ \/ \d+$/.test(text)) return text;
        const match = text.match(/^(\S+) \/ (\S+) (food|wood|metal|gems|science)$/);
        return match ? match[1] + ' / ' + match[2] + ' ' + res[match[3]] : null;
    };

    // ---------------------------------------------------------------- Heirlooms (window, popup, chances, tooltip)
    const where = {Equipped: 'Ausgerüstet', Carried: 'Mitgeführt', Temporary: 'Temporär'};
    const heirloomStrings = {
        // Original window (index.html, main.js)
        'You have': 'Du hast', and: 'und', Equipped: 'Ausgerüstet', Carried: 'Mitgeführt', Temporary: 'Temporär',
        Unequip: 'Ablegen', 'Equip On Portal': 'Beim Portal ausrüsten', "Don't Equip On Portal": 'Beim Portal nicht ausrüsten', 'Equip on Portal': 'Beim Portal ausrüsten',
        Equip: 'Ausrüsten', Swap: 'Tauschen', 'Stop Carrying': 'Nicht mehr mitführen', Carry: 'Mitführen', Recycle: 'Recyceln', 'Recycle All': 'Alle recyceln',
        Sort: 'Sortieren', Replace: 'Ersetzen', Empty: 'Leer', Save: 'Speichern', Cancel: 'Abbrechen', 'At Max!': 'Am Maximum!',
        'Gamma Burst (Innate)': 'Gamma Burst (fest)', 'Parity (Innate)': 'Parity (fest)',
        'Gain a gathering bonus based on worker distribution equality': 'Sammelbonus je nachdem, wie gleichmäßig deine Arbeiter verteilt sind',
        "Tip: You can click on this Heirloom's name or icon in this window to change them!": 'Tipp: Tippe in diesem Fenster auf Namen oder Symbol des Heirlooms, um sie zu ändern!',
        "Can't replace mods other than 'Empty' at this tier.": 'Auf dieser Seltenheit lassen sich nur leere Modifikatoren ersetzen.',
        'You Found an Heirloom!': 'Du hast ein Heirloom gefunden!', 'Current Heirloom Drop Rates': 'Aktuelle Fundchancen für Heirlooms', 'Max Rarity': 'Höchste Seltenheit',
        'Heirlooms are powerful items that can drop with a variety of bonuses and a variety of rarities. You will earn one Heirloom every time a Void Map is completed, and you have a better chance to get higher rarities if you complete the Void Map at higher zones.':
            'Heirlooms sind mächtige Gegenstände mit verschiedenen Boni und Seltenheiten. Für jede abgeschlossene Void Map erhältst du ein Heirloom, und je höher die Zone, in der du die Void Map abschließt, desto besser stehen die Chancen auf höhere Seltenheiten.',
        "You can click on the icon of any Heirloom to select it. Once you've selected an Heirloom, you can Equip, Carry, or Recycle it. Only equipped Heirlooms give you stats, and you can only have one of each type of Heirloom equipped at a time. You can click a stat to upgrade or replace it. You can also click on the Heirloom's name on this menu to rename it, or click on the icon to change it.":
            'Tippe auf das Symbol eines Heirlooms, um es auszuwählen. Ein ausgewähltes Heirloom kannst du ausrüsten, mitführen oder recyceln. Nur ausgerüstete Heirlooms geben dir Boni, und von jeder Art kannst du nur eines zugleich ausrüsten. Tippe auf einen Wert, um ihn zu verbessern oder zu ersetzen. In diesem Fenster kannst du außerdem auf den Namen des Heirlooms tippen, um es umzubenennen, oder auf das Symbol, um es zu ändern.',
        'The currency to upgrade and replace stats,': 'Die Währung zum Verbessern und Ersetzen von Werten,', 'Nullifium, or Nu': 'Nullifium oder Nu',
        ', can only be gathered by recycling an Heirloom.': ', erhältst du nur, indem du ein Heirloom recycelst.',
        'You can upgrade any Staff and Shield to the value of your total earned Nu. Nu is not spent, but dictates how powerful each of your Heirlooms can be!':
            'Du kannst jeden Staff und jedes Shield bis zum Wert deines insgesamt verdienten Nu verbessern. Nu wird nicht ausgegeben, sondern bestimmt, wie stark jedes deiner Heirlooms werden kann!',
        'Your Equipped Heirlooms will always stay with you when you Portal, along with any Heirlooms in your "Carried" slots.': 'Deine ausgerüsteten Heirlooms bleiben beim Portal immer bei dir, ebenso alle Heirlooms auf deinen Plätzen unter „Mitgeführt“.',
        'Any Heirlooms in the "Temporary" section will be recycled for Nullifium on portal.': 'Alle Heirlooms im Bereich „Temporär“ werden beim Portal zu Nullifium recycelt.',
        'ADDS this amount on to your total Prismatic Shield. This modifier can only function in the Radon Universe.': 'ADDIERT diesen Wert zu deinem gesamten Prismatic Shield. Dieser Modifikator wirkt nur im Radon-Universum.',
        'Reduces the Equality penalty on your Scruffies by this amount without changing Enemy reduction.': 'Senkt den Equality-Malus deiner Scruffies um diesen Wert, ohne die Abschwächung der Gegner zu ändern.',
        'Gives your Scruffies this chance to crit for 1 tier higher than they would have.': 'Gibt deinen Scruffies diese Chance, einen Krit 1 Stufe höher zu landen als sonst.',
        '*Void Map Drop Chance on Hazardous and higher Heirlooms has a lower percentage than previous Heirloom tiers, but also causes 1 extra Void Map to drop every 10th zone you clear.':
            '*Void Map Drop Chance hat auf Heirlooms ab Hazardous einen niedrigeren Prozentwert als auf früheren Seltenheiten, lässt aber zusätzlich in jeder 10. abgeschlossenen Zone 1 weitere Void Map fallen.',
        // Own workbench (mobile-heirlooms.js), tools (mobile-heirloom-tools.js) and chances (mobile-heirloom-chances.js)
        Back: 'Zurück', 'Close Heirlooms': 'Heirlooms schließen', 'Heirloom tools': 'Heirloom-Werkzeuge', 'Recycle all temporary': 'Alle temporären recyceln',
        Chances: 'Chancen', Help: 'Hilfe', Upgrade: 'Verbessern', Compare: 'Vergleichen', Rename: 'Umbenennen', 'Replace modifier': 'Modifikator ersetzen',
        'New modifier': 'Neuer Modifikator', Modifier: 'Modifikator', 'Previous zone range': 'Vorheriger Zonenbereich', 'Next zone range': 'Nächster Zonenbereich',
        Close: 'Schließen', Open: 'Öffnen', 'Change Heirloom icon': 'Heirloom-Symbol ändern', 'Rename Heirloom': 'Heirloom umbenennen', Protected: 'Geschützt',
        'Temporary items are recycled on Portal. Protect items you want to keep.': 'Temporäre Heirlooms werden beim Portal recycelt. Schütze, was du behalten willst.',
        'Carried slots are full': 'Alle Plätze zum Mitführen sind belegt', 'Heirloom help': 'Heirloom-Hilfe', 'Drop chances': 'Fundchancen',
        'Manual equipment sets': 'Eigene Ausrüstungssätze', 'Set name': 'Name des Satzes', 'Save equipped set': 'Ausgerüsteten Satz speichern',
        'This item has no stable identity. The set was not saved.': 'Dieses Heirloom hat keine feste Kennung. Der Satz wurde nicht gespeichert.',
        'Name the set and equip at least one Heirloom first.': 'Gib dem Satz einen Namen und rüste zuerst mindestens ein Heirloom aus.',
        'Six sets are stored. Remove a set first.': 'Sechs Sätze sind gespeichert. Entferne zuerst einen.', 'Equipped set saved.': 'Ausgerüsteter Satz gespeichert.',
        'Equip set': 'Satz ausrüsten', 'Remove set': 'Satz entfernen', 'Set removed.': 'Satz entfernt.',
        'A set member is missing or ambiguous. Nothing was equipped.': 'Ein Teil des Satzes fehlt oder ist nicht eindeutig. Es wurde nichts ausgerüstet.',
        'Set equipped using the original equipment actions.': 'Satz mit den Aktionen des Originals ausgerüstet.',
        'No saved sets. Sets are applied only when you choose Equip set.': 'Keine gespeicherten Sätze. Ein Satz wird nur angewendet, wenn du „Satz ausrüsten“ wählst.',
        'Unprotect item': 'Schutz aufheben', 'Protect item': 'Schützen', Selected: 'Ausgewählt', 'Change (pp)': 'Änderung (Pp.)',
        'Differences are percentage points (pp). Missing modifiers count as 0. Values use the original universe scaling; there is no combined score.':
            'Unterschiede in Prozentpunkten (Pp.). Fehlende Modifikatoren zählen als 0. Die Werte nutzen die Universumsskalierung des Originals; es gibt keine Gesamtwertung.',
        'Local sets and protection belong to this save. Protecting temporary items blocks recycling and Portal until you carry, equip or unprotect them. Carry limits still apply.':
            'Eigene Sätze und Schutz gehören zu diesem Spielstand. Geschützte temporäre Heirlooms blockieren Recyceln und Portal, bis du sie mitführst, ausrüstest oder den Schutz aufhebst. Die Grenzen fürs Mitführen gelten weiter.',
        'Action blocked by Heirloom protection.': 'Aktion durch Heirloom-Schutz blockiert.',
        'Heirloom chances': 'Heirloom-Chancen', 'Next rarity increase': 'Nächste höhere Seltenheit'
    };
    const kinds = {shield: 'Shields', staff: 'Staffs', core: 'Cores'};
    const heirloomPatterns = [
        [/^(\S+) \/ (\S+) (Nu|Ss) Allocated - (\S+) Available$/, (_, spent, allowed, what, free) => spent + ' / ' + allowed + ' ' + what + ' vergeben – ' + free + ' frei'],
        [/^(\S+)% (Gamma Burst|Parity) \(Innate\)$/, (_, n, what) => n + '% ' + what + ' (fest)'],
        [/^(Add|Replace) \((\S+) (Nu|Ss)\)$/, (_, verb, n, what) => (verb === 'Add' ? 'Hinzufügen' : 'Ersetzen') + ' (' + n + ' ' + what + ')'],
        // The workbench link repeats the replace button with " modifier" (mobile-heirlooms.js), from its English or German text.
        [/^(Add|Replace|Hinzufügen|Ersetzen) \((\S+) (Nu|Ss)\) modifier$/, (_, verb, n, what) => 'Modifikator ' + (/^(Add|Hinzufügen)$/.test(verb) ? 'hinzufügen' : 'ersetzen') + ' (' + n + ' ' + what + ')'],
        [/^Each upgrade adds (\S+)%$/, (_, n) => 'Jede Verbesserung bringt ' + n + '%'],
        [/^Max of (\S+)%$/, (_, n) => 'Höchstens ' + n + '%'],
        [/^Recycle \(\+(\S+) (Nullifium|Spirestones)\)$/, (_, n, what) => 'Recyceln (+' + n + ' ' + what + ')'],
        [/^Increases the damage dealt by Lightning Trap( and Shocked |, Shocked, and its column boost to Fire and Poison Traps )by (\S+)%\.$/,
            (_, more, n) => 'Erhöht den Schaden von Lightning Trap' + (more === ' and Shocked ' ? ' und Shocked' : ', Shocked und ihren Spaltenbonus für Fire und Poison Traps') + ' um ' + n + '%.'],
        [/^Increases the damage dealt by Fire Traps on the same Floor as a Strength Tower by (\S+)%\. Does not increase the world bonus to Scruffies\.$/,
            (_, n) => 'Erhöht den Schaden von Fire Traps auf demselben Floor wie ein Strength Tower um ' + n + '%. Erhöht nicht den Weltbonus für Scruffies.'],
        [/^Increases the amount of Poison damage compounded by the Condenser Tower by (\S+)%\. Does not increase the world bonus to Scruffies\.$/,
            (_, n) => 'Erhöht den Poison-Schaden, den der Condenser Tower multipliziert, um ' + n + '%. Erhöht nicht den Weltbonus für Scruffies.'],
        [/^(\S+)% of all non-lethal damage and nature stacks you afflict on your current enemy are copied onto the next enemy\. Plaguebringer damage cannot bring an enemy below 5% health, but nature stacks will continue to accumulate\.$/,
            (_, n) => n + '% des nicht tödlichen Schadens und der Nature-Stapel, die du deinem aktuellen Gegner zufügst, gehen auch auf den nächsten Gegner über. Plaguebringer-Schaden senkt einen Gegner nicht unter 5% Health, Nature-Stapel bauen sich aber weiter auf.'],
        [/^Each attack by your Scruffies adds 1 stack of Charging\. When Charging reaches (\d+) stacks, your Scruffies will release a burst of energy, dealing (\S+)% of their attack damage\. Stacks reset after releasing a Burst or when your Scruffies die\.$/,
            (_, stacks, n) => 'Jeder Angriff deiner Scruffies bringt 1 Stapel Charging. Erreicht Charging ' + stacks + ' Stapel, setzen deine Scruffies einen Energiestoß frei, der ' + n + '% ihres Angriffsschadens verursacht. Die Stapel verfallen nach dem Stoß oder wenn deine Scruffies sterben.'],
        // Workbench status, capacity, lists and comparison (mobile-heirlooms.js, mobile-heirloom-tools.js)
        [/^(.+) · (Equipped|Carried|Temporary)$/, (_, item, at) => item + ' · ' + where[at]],
        [/^Carried (\d+) \/ (\d+) · all types$/, (_, n, max) => 'Mitgeführt ' + n + ' / ' + max + ' · alle Arten'],
        [/^(\d+) (Shield|Staff|Core) · (\d+) total$/, (_, n, type, all) => n + ' ' + type + ' · ' + all + ' insgesamt'],
        [/^No (shield|staff|core)s here\.$/, (_, type) => 'Hier gibt es keine ' + kinds[type] + '.'],
        [/^Compare (.+)$/, (_, what) => what + ' vergleichen'],
        // Chances (setHeirRareText in main.js, drawn by mobile-heirloom-chances.js)
        [/^(?:(U\d) )?Zones (\d+) through (\d+)$/, (_, u, a, b) => (u ? u + ' ' : '') + 'Zonen ' + a + ' bis ' + b],
        [/^(?:(U\d) )?Zones (\d+)\+$/, (_, u, a) => (u ? u + ' ' : '') + 'Zonen ab ' + a],
        [/^Zone (\d+) in Universe (\d+)$/, (_, zone, u) => 'Zone ' + zone + ' in Universum ' + u]
    ];
    const heirloomText = translator(heirloomStrings, heirloomPatterns), heirloomHtml = markup(heirloomText, /^<h5 [^>]*id="selectedHeirloomTitle"/);
    // Watched Heirloom areas and the elements inside them that show user given names (never translated); an item icon
    // (.heirloomThing in main.js generateHeirloomIcon) carries the item name as its aria-label (step 4i).
    const heirloomRoots = ['heirloomWrapper', 'heirloomsPopup', 'heirRare'];
    const heirloomSkipped = 'script,style,textarea,input,select,option,[contenteditable],[data-original-text],#selectedHeirloomTitle,.heirloomThing,#renameContainer,.mh-item strong,.mh-pair strong,[id$="EquippedName"],.mh-item-mods,#qol-heirloom-tools .qol-form > strong';
    function watchHeirlooms(doc, Observer, route) {
        const translateNode = node => {
            const parent = node.parentElement;
            if (!parent || parent.closest(heirloomSkipped)) return;
            // The workbench title shows the item's own name on its upgrade and replace pages.
            if (parent.matches('.mh-header h1') && /^(?:details|replace)$/.test(route())) return;
            const next = heirloomText(node.data);
            if (next !== node.data) node.data = next;
        };
        // The name title carries an own label (aria-label 'Rename Heirloom'); its text, the name, is skipped above.
        const translateAttributes = element => {
            if (element.closest(heirloomSkipped) && !element.matches('#selectedHeirloomTitle')) return;
            for (const attribute of ['aria-label', 'title']) { const value = element.getAttribute(attribute); if (value === null) continue; const next = heirloomText(value); if (next !== value) element.setAttribute(attribute, next); }
        };
        const refresh = root => {
            if (root.nodeType === 3) return translateNode(root);
            if (root.nodeType !== 1) return;
            translateAttributes(root);
            for (const element of root.querySelectorAll('[aria-label],[title]')) translateAttributes(element);
            const walker = doc.createTreeWalker(root, 4);
            while (walker.nextNode()) translateNode(walker.currentNode);
        };
        const observer = new Observer(records => {
            for (const record of records) {
                if (record.type === 'childList') record.addedNodes.forEach(refresh);
                else if (record.type === 'attributes') translateAttributes(record.target);
                else translateNode(record.target);
            }
        });
        for (const id of heirloomRoots) {
            const root = doc.getElementById(id);
            if (!root) continue;
            refresh(root);
            observer.observe(root, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'title']});
        }
    }

    // "A Whole New World" (updates.js), shown once Fluffy reaches Evolution 8 Level 10.
    const world = "<p>Fluffy has reached Evolution 8 Level 10! He levitates above the ground, then realizes he seems a bit like a showoff so he floats back down. He strikes a good balance between power and humility by just having his eyes glow a little bit; you have to admit it's a good look on him.</p><p>Anyways, Fluffy walks over to your Portal Device and gives it a good smack. He uses some nifty telepathic powers to inform you that you can now use your Portal Device to travel to a different Universe, one that he himself handpicked for its usefulness.</p><p>He continues to inform you that the Magma on this planet is beginning to harden, blocking later Spires behind impenetrable walls of Obsidian. If we want to have any hope of reaching them, we'll need a tremendous amount of energy from this new Universe!</p><p><b>You can now travel back and forth between Universe 1 - \"The Helium Universe\", and Universe 2 - \"The Radon Universe\". See the top left of your Portal for more information.</b></p>";
    const worldDe = '<p>Fluffy hat Evolution 8 Stufe 10 erreicht! Er schwebt über dem Boden, merkt dann, dass er wie ein Angeber wirkt, und sinkt wieder herab. Er findet die richtige Mischung aus Macht und Bescheidenheit, indem er nur ein wenig mit den Augen leuchtet; du musst zugeben, dass ihm das gut steht.</p>' +
        '<p>Jedenfalls geht Fluffy zu deinem Portal Device und verpasst ihm einen ordentlichen Klaps. Mit ein paar praktischen telepathischen Kräften lässt er dich wissen, dass du mit deinem Portal Device jetzt in ein anderes Universum reisen kannst, das er selbst wegen seines Nutzens ausgesucht hat.</p>' +
        '<p>Weiter erzählt er dir, dass das Magma dieses Planeten zu erstarren beginnt und spätere Spires hinter undurchdringlichen Mauern aus Obsidian versperrt. Wenn wir sie je erreichen wollen, brauchen wir eine gewaltige Menge Energie aus diesem neuen Universum!</p>' +
        '<p><b>Du kannst jetzt zwischen Universum 1 – „The Helium Universe“ und Universum 2 – „The Radon Universe“ hin- und herreisen. Mehr dazu oben links in deinem Portal.</b></p>';
    // ---------------------------------------------------------------- Shared catalog: tooltip windows (#tipText, #tipCost)
    // Long sentences and distinct buttons only; short words of the Heirloom window stay in its own observer above.
    const strings = {
        'Click for more detailed info': 'Für mehr Details tippen', Pat: 'Streicheln', 'Show Cruffys Info': 'Cruffys anzeigen', 'Show Scruffy Info': 'Scruffy anzeigen',
        "Ask About Stuffy's Spire": 'Nach Stuffy’s Spire fragen', 'Abort Evolution': 'Evolution abbrechen',
        [world]: worldDe,
        // Heirloom dialogs (updates.js "Unequip Heirloom", mobile-heirloom-tools.js protection)
        'Leave it equipped': 'Ausgerüstet lassen', 'Place in Temporary': 'In Temporär legen',
        'Would you like to leave this Heirloom equipped or put it in Temporary Storage?': 'Möchtest du dieses Heirloom ausgerüstet lassen oder in den temporären Bereich legen?',
        'Would you like to purchase another Carried slot, leave this Heirloom equipped, or put it in Temporary Storage?': 'Möchtest du einen weiteren Platz zum Mitführen kaufen, dieses Heirloom ausgerüstet lassen oder es in den temporären Bereich legen?',
        'If you use your Portal while this Heirloom is in Temporary Storage, it will be recycled!': 'Nutzt du dein Portal, während dieses Heirloom im temporären Bereich liegt, wird es recycelt!',
        "You have no more room to carry another Heirloom, and you've already purchased the maximum amount of slots.": 'Du hast keinen Platz mehr, um ein weiteres Heirloom mitzuführen, und hast schon die höchste Zahl an Plätzen gekauft.',
        "You have no more room to carry another Heirloom, and don't have enough Nullifium to purchase another Carried slot.": 'Du hast keinen Platz mehr, um ein weiteres Heirloom mitzuführen, und nicht genug Nullifium für einen weiteren Platz.',
        'You have no more room to carry another Heirloom, but you do have enough Nullifium to purchase another Carried slot!': 'Du hast keinen Platz mehr, um ein weiteres Heirloom mitzuführen, aber genug Nullifium für einen weiteren Platz!',
        'Carry, equip or unprotect protected temporary Heirlooms before recycling or restarting a run (Portal, challenge restart or universe return). Carry limits still apply.':
            'Führe geschützte temporäre Heirlooms mit, rüste sie aus oder hebe ihren Schutz auf, bevor du recycelst oder einen Durchlauf neu beginnst (Portal, Neustart einer Challenge oder Rückkehr in ein Universum). Die Grenzen fürs Mitführen gelten weiter.'
    };
    const patterns = [
        // Quest line of the zone info (updates.js getZoneStats): "Quest: <description>. Progress: <progress>"
        [/^Quest: (.+?)(?:\. Progress: (.+))?$/, (_, description, now) => {
            const german = quest(description), state = now === undefined ? '' : questProgress(now);
            return german === null || state === null ? null : 'Quest: ' + german + (now === undefined ? '' : '. Fortschritt: ' + state);
        }],
        [new RegExp("^You are about to abort " + pet + "'s Evolution\\. This will return you to level 10 on your last Evolution, but you will permanently lose all Experience earned towards the current Evolution\\. Are you sure you want to abort\\?$"),
            (_, name) => 'Du brichst gleich die Evolution von ' + name + ' ab. Damit kehrst du zu Stufe 10 deiner letzten Evolution zurück, verlierst aber dauerhaft alle Exp, die du für die laufende Evolution gesammelt hast. Willst du wirklich abbrechen?'],
        // Heirloom confirmations (main.js recycleHeirloom, recycleAllHeirloomsClicked, replaceMod)
        [/^You are about to recycle (.+) for (\S+) (Nullifium|Spirestones)\. Are you sure\?$/, (_, item, n, what) => 'Willst du ' + item + ' wirklich für ' + n + ' ' + what + ' recyceln?'],
        [/^You have (\d+) extra Heirlooms?, which will be recycled for (\S+) Nullifium (?: and (\S+) Spirestones)?\. Are you sure\?$/,
            (_, n, nu, ss) => 'Du hast ' + n + ' ' + one(n, 'zusätzliches Heirloom; es wird', 'zusätzliche Heirlooms; sie werden') + ' für ' + nu + ' Nullifium' + (ss ? ' und ' + ss + ' Spirestones' : '') + ' recycelt. Bist du sicher?'],
        [/^You are about to (?:add|replace (.+?) with) (.+) for (\S+) (Nullifium|Spirestones)\. {1,2}Are you sure\?$/,
            (_, old, mod, n, what) => old === undefined ? 'Willst du ' + mod + ' für ' + n + ' ' + what + ' hinzufügen?' : 'Willst du ' + old + ' für ' + n + ' ' + what + ' durch ' + mod + ' ersetzen?'],
        [/^Buy a Slot \((\S+) Nu\)$/, (_, n) => 'Platz kaufen (' + n + ' Nu)']
    ];
    const probe = /^(?:Quest: |You are about to |You have \d+ extra Heirloom|Buy a Slot)/;
    // Message log (main.js, updates.js, config.js)
    const logPatterns = [
        [/^You have a new quest! <b>(.+?)<\/b>\. Good luck!$/, (_, description) => { const german = quest(description); return german === null ? null : 'Du hast eine neue Quest: <b>' + german + '</b>. Viel Glück!'; }],
        [/^Your Worshippers successfully inspire Scruffy, granting (\S+) Exp!$/, (_, n) => 'Deine Anbeter inspirieren Scruffy und bringen ihm ' + n + ' Exp!'],
        [/^Scruffy gave you (\d+) free Void Maps!$/, (_, n) => 'Scruffy hat dir ' + n + ' ' + one(n, 'kostenlose Void Map', 'kostenlose Void Maps') + ' geschenkt!'],
        [/^You have completed the Frozen Castle! The map has melted, but you managed to find an? (\S+) Heirloom!$/, (_, rarity) => 'Du hast das Frozen Castle abgeschlossen! Die Map ist geschmolzen, aber du hast ein ' + rarity + '-Heirloom gefunden!']
    ];
    const logProbe = /^(?:You have a new quest|Your Worshippers successfully|Scruffy gave you|You have completed the Frozen Castle)/;

    const catalog = {rewards, rewardPatterns, fluffyStrings, fluffyPatterns, fluffyText, rewardText, fluffyHtml, translateFluffy, quests, quest, questProgress,
        heirloomStrings, heirloomPatterns, heirloomText, heirloomHtml, heirloomRoots, heirloomSkipped, strings, patterns, probe, logPatterns, logProbe};
    function install(win) {
        const layer = win.MobileI18nGame;
        if (!layer || !layer.active || layer.lang !== 'de') return false;
        if (!layer.extend('de', {strings, patterns, probe})) return false;
        layer.registerLog('de', {patterns: logPatterns, probe: logProbe});
        const doc = win.document;
        translateFluffy(win.Fluffy, doc);
        // The hover tooltip of an Heirloom (tooltip('Heirloom') in updates.js) is the item markup in #tipText.
        if (typeof win.displaySelectedHeirloom === 'function') {
            const original = win.displaySelectedHeirloom;
            win.displaySelectedHeirloom = function (...args) { const result = original.apply(this, args); return args[2] && typeof result === 'string' ? heirloomHtml(result) : result; };
        }
        const route = () => { try { return win.MobileHeirlooms?.route?.() || ''; } catch { return ''; } };
        if (doc && typeof doc.getElementById === 'function' && win.MutationObserver) {
            if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => watchHeirlooms(doc, win.MutationObserver, route)); else watchHeirlooms(doc, win.MutationObserver, route);
        }
        return true;
    }
    catalog.install = install;
    if (typeof window !== 'undefined') install(window);
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeLate;
