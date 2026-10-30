// V-243 step 4a: German texts of the Perks (game.portal, both universes) and Masteries (game.talents). Perk and Mastery
// names stay English like the other glossary terms of the original (players find them in guides); descriptions, tooltip
// lines and the short effect lines of the own Portal and Mastery views become German. Engine keys, names, ids, onclick
// values and saves stay unchanged: tooltip and description are config texts the save drops (saveOriginal in main.js).
var MobileI18nDePerks = (() => {
    const brand = value => typeof MobileBranding === 'undefined' ? value : MobileBranding.text(value);
    const esc = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const one = (n, singular, plural) => n === '1' ? singular : plural;
    const and = list => list.replace(/,? and (?=[^,]*$)/, ' und ');
    // Fixed tooltips of game.portal by engine key. Placeholders of the original ($modifier$) stay; no ASCII quotes and no
    // tilde (tooltip() in updates.js replaces the first ~ of every tooltip).
    const perks = {
        Looting_II: 'Wende dein Geschick beim Bergen von Dingen aus der Spire an und erhöhe alle Beute um 0.25% pro Stufe. Der Preis dieses Perks steigt additiv: Jede Stufe kostet genau 10000 mehr als die vorige.',
        Carpentry_II: 'Du betrachtest die nicht mehr rätselhaften Baupläne jetzt nüchterner und erhöhst so den Wohnraum um 0.25% pro Stufe. Das wirkt multiplikativ zusätzlich zu Carpentry I, der Bonus selbst wächst aber additiv. Auch der Preis dieses Perks steigt additiv: Jede Stufe kostet genau 10000 mehr als die vorige.',
        Motivation_II: 'Corruption und drohender Untergang sind großartige Gründe, etwas härter zu arbeiten! Erhöht das Sammeltempo der Scruffies um 1% pro Stufe. Der Preis dieses Perks steigt additiv: Jede Stufe kostet genau 1000 mehr als die vorige.',
        Power_II: 'Du schöpfst Kraft aus dem Wunsch, eines Tages heimzukehren. Mach deine Scruffies wütend, indem du ihnen ständig davon erzählst, und erhöhe so ihren Schaden um 1% pro Stufe. Der Preis dieses Perks steigt additiv: Jede Stufe kostet genau 500 mehr als die vorige.',
        Toughness_II: 'Du fühlst dich geerdeter, wenn du daran denkst, woher du kommst. Übertrage deine Zähigkeit auf deine Scruffies und erhöhe ihre Health um 1% pro Stufe. Der Preis dieses Perks steigt additiv: Jede Stufe kostet genau 500 mehr als die vorige.',
        Capable: 'Du spürst große Kraft in Fluffy, aber er braucht noch Training. Jede Stufe Capable erlaubt Fluffy 1 weiteres Level. Entfernst du Capable mit einem Respec, fallen alle Boni aus Fluffys Level und Experience vorübergehend weg, alle Exp bleiben aber gespeichert, bis du wieder Punkte vergibst. Jede Stufe Capable kostet 10-mal so viel wie die vorige; ab der ersten Stufe begleitet dich Fluffy durch Portale. <b>Höchstens 10 Stufen.</b>',
        Overkill: 'Du hast das jenseitige Ziel erreicht und Overkill erlangt, großartig! Jede Stufe dieses Perks lässt 0.5% deines Overkill-Schadens den nächsten Gegner treffen. Tötet dieser Schaden den nächsten Gegner, verlierst du für dieses Feld keine Zeit. <b>Höchstens 30 Stufen.</b>',
        Resourceful: 'Die Zeit mit begrenzten Maps hat dich gelehrt, sparsamer zu sein. Jede Stufe senkt die Kosten aller Gebäude um 5% <b>der aktuellen Kosten</b>.',
        Coordinated: 'Nutze dein Wissen über koordinierte Gegner, um die nötige Zahl an Scruffies je Stufe Koordination um 2% <b>der aktuellen Menge (multiplikativ)</b> zu senken; der Wertebonus bleibt gleich.',
        Siphonology: 'Nutze in anderen Dimensionen entdeckte Strategien, um Stapel des Map-Bonusschadens aus Maps niedrigerer Stufe abzuzapfen. Je Stufe Siphonology erhältst du Stapel auch aus Maps eine Stufe unter deiner aktuellen Zone. <b>Höchstens 3 Stufen.</b>',
        Resilience: 'Nutze dein Können im Stärken von Scruffies für eine <b>multiplikative</b> Steigerung der gesamten Health deiner Scruffies um 10%.',
        Meditation: 'In der Dimension of Strong Things hast du gelernt, dir Zeit zu lassen. Jede Stufe Meditation erhöht das Sammeltempo deiner Scruffies um 1% je 10 Minuten in derselben Zone, bis zu 1 Stunde, auch offline. Der Bonus endet, sobald du die aktuelle Zone abschließt. <b>Höchstens 7 Stufen.</b>',
        Relentlessness: 'Du hast zu viele Scruffies fallen sehen, Zeit für härteres Training. Diese Erinnerungen geben deinen Scruffies auf Stufe 1 eine Chance von 5% auf kritische Treffer mit +130% Schaden; jede weitere Stufe bringt 5% Krit-Chance und 30% Krit-Schaden dazu. <b>Höchstens 10 Stufen.</b>',
        Masterfulness: 'Jede Stufe Masterfulness gibt Greed und Tenacity je +1 Stufe über ihre Obergrenze hinaus. Höchstens 10 Stufen.',
        Greed: 'Knapp bei Kasse? Hol dir einfach mehr Ressourcen! Jede Stufe erhöht alle Beute (auch Radon) um 2.5% (multiplikativ). Ab 600 Tributen <b>addiert</b> jeder gekaufte Tribut (bis 1250) 0.015% zum multiplikativen Bonus. Jeder 25. gekaufte Tribut addiert zusätzlich 0.35%. Beispiel: Mit 750 Tributen erhältst du je Stufe Greed einen multiplikativen Beutebonus von 6.8%. <b>Höchstens 40 Stufen.</b>',
        Tenacity: 'Wenn es hart wird, schlag einfach fester zu. Jede Stufe erhöht die Attack deiner Scruffies um 10% (multiplikativ). In der ersten Stunde wird je 2.4 Minuten in einer Zone 1% zum multiplikativen Bonus <b>addiert</b>. Nach 1 Stunde wird alle 12 Minuten 1% <b>addiert</b>, bis zu insgesamt 2 Stunden. Schließt du eine Zone ab, nimmst du 50% der Zeit der letzten Zone (bis 2 Stunden) in die neue mit. Beispiel: Nach einer Stunde in einer Zone erhältst du je Stufe Tenacity einen multiplikativen Attack-Bonus von 35%, nach 2 Stunden von 40%. <b>Höchstens 40 Stufen.</b>',
        Criticality: 'Wenn deine kritischen Treffer einfach nicht genug bringen, probier Criticality! Jede Stufe erhöht den kritischen Schaden deiner Scruffies um 10% (additiv).',
        Equality: 'Dein Portal-Gerät erzeugt eine beruhigende Aura, die die Attack der Gegner UND der Scruffies um 10% (multiplikativ) senkt. Du kannst Equality Scaling einschalten: Dann ist Equality anfangs inaktiv und gewinnt jedes Mal eine Stufe, wenn deine Scruffies sterben, bis zu deiner gekauften Perk-Stufe.',
        Carpentry: 'Du hast schon einige Häuser gebaut und wirst richtig gut darin. Bringst du dein Baufachwissen durch das Portal mit, passen je Stufe 10% mehr Scruffies hinein <b>als derzeit (multiplikativ)</b>.',
        Artisanistry: 'Dir fallen Wege auf, gleich starke Ausrüstung mit deutlich weniger Ressourcen zu fertigen. Mit diesen Ideen senkt jede Stufe die Kosten aller Ausrüstung um 5% <b>der aktuellen Kosten</b>.',
        Range: 'Nutze deine neu entdeckten Führungsqualitäten, um den Mindestschaden deiner Scruffies um 2% pro Stufe zu erhöhen. Stapelt sich bis zu 10-mal und wirkt nicht auf den Höchstschaden. Mit 10 Stufen nutzt jeder Schlag mindestens 100% deines Angriffsschadens.',
        Agility: 'Treib dein Portal zur Höchstleistung und beschleunige den Takt des Universums. Jede Stufe verkürzt die Zeit zwischen den Angriffen von Scruffies und Gegnern um 5% <b>der aktuellen Zeit (multiplikativ)</b>. <b>Höchstens 20 Stufen.</b>',
        Bait: 'Ein paar davon in deinen Fallen locken sicher zusätzliche Scruffies an. Jede Stufe lässt Fallen $modifier$ Scruffy mehr fangen.',
        Trumps: 'Aggressives Strategietraining bringt dir aus jedem Gebietsbonus im Kampf $modifier$ zusätzliche maximale Bevölkerung.',
        Pheromones: 'Nimm Pheromone mit, damit sich deine Scruffies dauerhaft 10% schneller vermehren.',
        Packrat: 'Studiere die uralten, geheimen Hortmethoden der Scruffies. Jede Stufe erhöht um 20%, wie viel Zeug in jede Scheune, jeden Schuppen und jede Schmiede passt.',
        Motivation: 'Übe vor deinen Scruffies das Reden in der Öffentlichkeit. Jede Stufe erhöht die Menge an Ressourcen, die Arbeiter produzieren, um 5%.',
        Power: 'Scruffies lernen durch Vorbild. Ein wenig Bankdrücken mit toten Trunkles sollte alle künftigen Scruffies anspornen, ebenfalls stärker zu werden. Gibt deinen Scruffies dauerhaft 5% mehr Attack.',
        Toughness: 'Bezahl deine Scruffies dafür, dich ein bisschen herumzuschubsen. Wenn du lernst, kein solches Weichei zu sein, werden auch deine Scruffies weniger weich. Gibt deinen Scruffies dauerhaft 5% mehr Health.',
        Prismal: 'Kristallisiere etwas Radon zu einem interdimensionalen Prisma, das du durch Portale mitnehmen kannst. Jede Stufe erhöht den Prismatic Shield deiner Scruffies um 1% und lässt sie sich im Kampf 5% wohler fühlen. Ab 20 Punkten Prismal erhältst du nach Z20 automatisch Prismapracht aus dem Prismatic Palace. <b>Höchstens 100 Stufen.</b>',
        Hunger: 'Wenn Soldaten hungrig werden, sind Gegner kostenloses Essen! Verarbeite Gegner der Welt mit deinem überschüssigen Overkill-Schaden zu gesundem Freilandfleisch! Jede Stufe Hunger lässt deine Scruffies 3% ihres Overkill-Schadens in dauerhaften Schaden umwandeln. <b>Höchstens 30 Stufen.</b>',
        Frenzy: 'Jede Stufe gibt deinen Scruffies bei jedem Angriff eine Chance von 0.1%, für 5 Sekunden je Perk-Stufe in Frenzy zu geraten, mit +50% Attack (additiv) je Perk-Stufe. Sterben deine Scruffies während Frenzy, verfällt die Hälfte der restlichen Frenzy-Zeit. Frenzy lässt sich erneuern, sobald die Hälfte der Gesamtzeit vorbei ist, aber nur, solange die Gruppe lebt, die den Bonus erhalten hat.',
        Smithology: 'Rüstschmieden geben je Perk-Stufe zusätzlich 1% Werte.',
        Expansion: 'Expandierende Teasekins geben je Perk-Stufe zusätzlich 0.01% Wohnraum.'
    };
    // Fixed descriptions of game.talents by engine key.
    const masteries = {
        portal: 'Schaltet das Portal direkt nach Abschluss von Z20 frei.',
        bionic: '<p>Sammelt jedes Level von Bionic Wonderland (BW) automatisch ein, wenn du eine BW-Zone passierst. Wirkt nicht, wenn du in diesem Durchlauf schon ein BW verpasst hast oder eine Zone erreichst, die höher liegt als jedes BW, das du je abgeschlossen hast.</p><p>Außerdem erhalten alle jetzigen und künftigen Bionic Wonderlands den Spezialmodifikator ‚Fast Attacks‘.</p>',
        turkimp: 'Erhöht die Chance, Gobbleby zu finden, um 33%, die Bonuszeit je Gobbleby um 5 Minuten und die Höchstzeit um 10 Minuten.',
        housing: 'Schaltet Villa, Hotel, Kinderstube, Resort, Dimensionstor, Wurmloch, Sammler und alle Super-Unterkünfte automatisch frei, sobald du die Zone passierst, in der sie fallen.',
        bounty: 'Schaltet Kopfgeld direkt nach Abschluss von Z15 frei.',
        explorers: 'Sammelt die Bücher für Schnellentdeckung automatisch ein, wenn du ihre Zone passierst.',
        voidPower: 'Deine Scruffies erhalten in Void Maps 15% mehr Attack und Health.',
        pierce: 'Senkt den Gegnerschaden, der deinen Block durchdringen kann, um 25%.',
        heirloom: 'Du kannst zusätzlich 10% deines Nu für Heirlooms ausgeben, insgesamt 110%.',
        headstart: 'Corruption beginnt 5 Zonen früher, bei Zone 176.',
        voidPower2: 'Deine Scruffies erhalten in Void Maps weitere 20% Attack und Health.',
        mapLoot: 'Der Beuteabzug für niedrige Map-Stufen beginnt 1 Stufe später. Eine Map 1 Stufe unter deiner aktuellen Zone bringt dann so viel Beute wie eine Map auf deiner Zonenstufe.',
        skeletimp: 'Verdoppelt die Chance, dass Rattlord statt Rattlekin erscheint.',
        mapHealth: 'Deine Scruffies erhalten in Maps +100% Health.',
        headstart2: 'Corruption beginnt weitere 10 Zonen früher, bei Zone 166.',
        daily: 'Du erhältst in einer Daily Challenge +50% Attack.',
        hyperspeed: 'Verkürzt die Zeit zwischen Kämpfen und Angriffen um 100ms.',
        turkimp2: 'Lerne, deinen eigenen Gobbleby zu züchten: Der Gobbleby-Bonus steigt von +50% auf +100% und gilt dauerhaft.',
        magimp: 'Gibt in Welt und Maps eine Chance von 2%, Oddle zu finden. Oddles geben beim Tod den Bonus eines zufälligen Rare Kin aus Welt oder Map (je nach Ort).',
        headstart3: 'Corruption beginnt weitere 15 Zonen früher, bei Zone 151.',
        mapBattery: 'Verdoppelt den Zonenbonus für abgeschlossene Maps, sobald du 10 Stapel erreichst.',
        skeletimp2: 'Senkt die Mindestzeit zwischen zwei Rattlekin um 10 Minuten.',
        quickGen: 'Erhöht das Tempo, das der Dimensional Generator je Zone gewinnt, um 50%. Außerdem bringt jede abgeschlossene Void Map ab Z230 +10 Magmite.',
        magmaFlow: 'Lässt in jeder Zone mit Magma zwei zusätzliche Magma-Felder erscheinen.',
        explorers2: 'Nach jedem Portal startest du mit einem zusätzlichen Buch für Schnellentdeckung.',
        voidPower3: 'Deine Scruffies erhalten in Void Maps weitere 30% Attack und Health, und alle jetzigen und künftigen Void Maps erhalten den Spezialmodifikator ‚Fast Attacks‘.',
        heirloom2: 'Du kannst weitere 10% deines Nu für Heirlooms ausgeben, insgesamt 120%.',
        maz: 'Schaltet eine zweite Vorlage für Map at Zone frei!',
        scry2: 'Schließe eine ganze Void Map in Scryer Formation ab, um zusätzlich 50% Helium zu erhalten.',
        magmamancer: 'Magmamanten erhöhen jetzt die Attack der Scruffies um so viel, wie sie Metall erhöhen. Außerdem startet jede Zone nach Magma mit 5 Minuten Guthaben für deine Magmamanten.',
        mapLoot2: 'Senkt die Mindest- und Höchstzahl der Felder beim Erstellen von Maps um 5.',
        nature: 'Verbessert dein Token-Tauschverhältnis von 10:5 auf 10:8.',
        kerfluffle: 'Fluffy gibt dir 10% mehr Schaden, solange er aktiv ist. Jede Evolution von Fluffy bringt weitere 10% Schaden (multiplikativ)',
        stillRowing: 'Erhöht den Beutebonus für eine vollständige Reihe in einer Spire um 50%, von 2% auf 3% zusätzliche Beute.',
        patience: 'Anticipation kann jetzt 45 Stapel erreichen.',
        healthStrength: 'Deine Scruffies erhalten je Healthy-Feld in der aktuellen Zone 15% additiven Schaden.',
        nature2: 'Gibt allen 3 Empowerments of Nature 5 Stufen bei Upgrade und Stack Transfer, ohne die Kosten zu erhöhen.',
        stillRowing2: 'Deine Scruffies erhalten jetzt Attack in Höhe des doppelten Beutebonus jeder abgeschlossenen Spire-Reihe.',
        amalg: 'Der 50%-Schadensbonus jedes Amalgamators wirkt multiplikativ statt additiv.',
        bionic2: 'Gibt Bionic-Wonderland-Maps den Modifikator Prestigious. Jedes Bionic Wonderland hat dann zwei Prestige-Upgrades, auch dein erstes, das sonst nur ein Rivetgruff-Upgrade hat. Außerdem erhältst du +50% Attack in jeder Map, die höher liegt als deine aktuelle Weltzone.',
        overkill: 'Overkill erfasst ein weiteres Feld.',
        stillMagmamancer: 'Jede Zone nach Magma startet je in diesem Durchlauf abgeschlossener Spire-Reihe mit zusätzlich 60 Sekunden Guthaben für deine Magmamanten. Außerdem verlängern je 2 in diesem Durchlauf abgeschlossene Spires die Höchstzeit, die Magmamanten stapeln können, um 10 Minuten!',
        angelic: 'Deine Scruffies heilen sich unmittelbar vor jedem Angriff um 50% ihrer verbleibenden Health. Wegen der gewaltigen Menge an Bösem können sich Scruffies in noch nie abgeschlossenen Spires nicht heilen.'
    };
    const strings = {};
    if (typeof game !== 'undefined' && game) {
        for (const [key, german] of Object.entries(perks)) { const english = game.portal[key] && game.portal[key].tooltip; if (typeof english === 'string') strings[english] = german; }
        for (const [key, german] of Object.entries(masteries)) {
            const d = game.talents[key] && Object.getOwnPropertyDescriptor(game.talents[key], 'description');
            if (d && typeof d.value === 'string') strings[d.value] = german;
        }
    }
    // Own short lines of the Portal atlas (mobile-portal.js) and the Diorama Mastery view (mobile-diorama-subviews.js),
    // written in their English form; keys are stored branded too, because the branding observer renames them first.
    const own = {
        // Portal atlas: the effect labels without a per-level value (labels with one go through the pattern below).
        'Minimum damage':'Mindestschaden', 'Attack after breeding':'Attack nach dem Vermehren', 'Excess damage':'Überschüssiger Schaden', 'Critical hits':'Kritische Treffer',
        'Balance damage':'Schaden ausgleichen', 'Overkill damage':'Overkill-Schaden', 'Attack and health':'Attack und Health', 'Temporary attack bonus':'Vorübergehender Attack-Bonus',
        'Attack over time':'Attack mit der Zeit', 'Production over time':'Produktion mit der Zeit', 'Loot from Tributes':'Beute durch Tribute', 'Smithy effect':'Wirkung der Rüstschmiede',
        'Coordination requirement':'Bedarf für Koordination', 'Fluffy levels':'Fluffy-Level', 'Fluffy experience':'Fluffy-Exp', 'Tauntimp bonus':'Teasekin-Bonus', 'Map levels':'Map-Stufen', 'Greed and Tenacity':'Greed und Tenacity',
        'Original effect · Info':'Wirkung des Originals · Info',
        // Mastery view
        // 'All' only in the watched mastery filter: the Perk filter of mobile-portal.js compares its own 'All' and stays unwatched.
        'Show masteries':'Masteries anzeigen', 'Buyable':'Kaufbar', 'All':'Alle', 'Nothing to buy right now.':'Gerade gibt es nichts zu kaufen.',
        'Portal unlocks right after Zone 20':'Portal direkt nach Zone 20', 'Picks up Bionic Wonderland levels; BW gets Fast Attacks':'Sammelt Bionic-Wonderland-Level ein; BW erhält Fast Attacks',
        'Turkimps more often, longer and with a higher cap':'Gobblebies öfter, länger und mit höherer Obergrenze', 'Unlocks the late housing as you pass its Zone':'Späte Unterkünfte beim Passieren ihrer Zone',
        'Bounty unlocks right after Zone 15':'Kopfgeld direkt nach Zone 15', 'Picks up SpeedExplorer books automatically':'Sammelt Bücher für Schnellentdeckung automatisch',
        '+15% attack and health in Void Maps':'+15% Attack und Health in Void Maps', '25% less enemy damage pierces your block':'25% weniger Gegnerschaden durchdringt deinen Block',
        'Spend up to 110% of your Nu on Heirlooms':'Bis zu 110% deines Nu für Heirlooms', 'More attack the more Food you have stored':'Mehr Attack, je mehr Nahrung du lagerst',
        'Corruption starts at Zone 176':'Corruption beginnt bei Zone 176', 'Scryer on Corrupted cells: double attack, +50% Dark Essence':'Scryer auf Corrupted-Feldern: doppelte Attack, +50% Dark Essence',
        'Another +20% attack and health in Void Maps':'Weitere +20% Attack und Health in Void Maps', 'Low map level loot penalty starts one level later':'Beuteabzug niedriger Map-Stufen 1 Stufe später',
        'Twice the chance for a Megaskeletimp':'Doppelte Chance auf Rattlord', '+100% health in maps':'+100% Health in Maps', 'Corruption starts at Zone 166':'Corruption beginnt bei Zone 166',
        '+50% attack in Daily Challenges':'+50% Attack in Daily Challenges', '100 ms less between fights and attacks':'100 ms weniger zwischen Kämpfen und Angriffen',
        'Zones up to half your best drop all prestiges':'Zonen bis zur Hälfte deiner besten bringen alle Prestiges', 'Permanent Turkimp bonus, raised to +100%':'Dauerhafter Gobbleby-Bonus, erhöht auf +100%',
        '2% chance for a Randimp with a random Rare Kin bonus':'2% Chance auf Oddle mit zufälligem Rare-Kin-Bonus', 'Corruption starts at Zone 151':'Corruption beginnt bei Zone 151',
        'Map Zone bonus doubles at 10 stacks':'Map-Zonenbonus verdoppelt sich bei 10 Stapeln', 'Another 100 ms faster up to half your best Zone':'Weitere 100 ms schneller bis zur Hälfte deiner besten Zone',
        'Zones up to 75% of your best drop all prestiges':'Zonen bis 75% deiner besten bringen alle Prestiges', 'Skeletimps may appear 10 minutes sooner':'Rattlekins können 10 Minuten früher erscheinen',
        'Generator speeds up 50% faster; +10 Magmite from Voids at Z230+':'Generator gewinnt 50% mehr Tempo; +10 Magmite aus Voids ab Z230', 'Two extra Magma cells on Magma Zones':'Zwei zusätzliche Magma-Felder in Magma-Zonen',
        'Start each Portal with one extra SpeedExplorer':'Jedes Portal mit einem zusätzlichen Buch für Schnellentdeckung', 'Another +30% in Void Maps; Voids get Fast Attacks':'Weitere +30% in Void Maps; Voids erhalten Fast Attacks',
        'Zones up to 90% of your best drop all prestiges':'Zonen bis 90% deiner besten bringen alle Prestiges', 'Spend up to 120% of your Nu on Heirlooms':'Bis zu 120% deines Nu für Heirlooms',
        'A second preset for Map at Zone':'Zweite Vorlage für Map at Zone', 'Liquification counts one extra Spire (Universe 1)':'Liquification zählt eine Spire mehr (Universum 1)',
        'Whole Void Map in Scryer: +50% Helium':'Ganze Void Map in Scryer: +50% Helium', 'Magmamancers also raise attack; 5 min head start per Zone':'Magmamanten erhöhen auch Attack; 5 Min. Vorsprung je Zone',
        'Maps get 5 fewer cells (min and max)':'Maps haben 5 Felder weniger (Mindest- und Höchstzahl)', 'Token trading improves from 10:5 to 10:8':'Token-Tausch verbessert sich von 10:5 auf 10:8',
        '+10% damage while Fluffy is active, more per Evolution':'+10% Schaden, solange Fluffy aktiv ist, mehr je Evolution', 'Spire row loot bonus rises from 2% to 3%':'Beutebonus je Spire-Reihe steigt von 2% auf 3%',
        'Anticipation can reach 45 stacks':'Anticipation erreicht bis zu 45 Stapel', 'Free Void Maps after Portal; more Helium/Radon from Voids':'Kostenlose Void Maps nach dem Portal; mehr Helium/Radon aus Voids',
        '+15% damage per Healthy cell in the Zone':'+15% Schaden je Healthy-Feld der Zone', '+5 free levels on all Nature Upgrades and Stack Transfers':'+5 kostenlose Stufen für alle Nature-Upgrades und Stack Transfers',
        'Liquification counts another extra Spire (Universe 1)':'Liquification zählt eine weitere Spire mehr (Universum 1)', 'Spire rows also add attack (2x the loot bonus)':'Spire-Reihen bringen auch Attack (2-facher Beutebonus)',
        'Amalgamator damage bonuses compound':'Schadensboni der Amalgamatoren wirken multiplikativ', 'A second Void Map per 100 Zones, the first at Z50':'Zweite Void Map je 100 Zonen, die erste bei Z50',
        'BW maps get Prestigious; +50% attack in higher maps':'BW-Maps erhalten Prestigious; +50% Attack in höheren Maps', 'Fluffy gains +25% Exp per completed Evolution':'Fluffy erhält +25% Exp je abgeschlossener Evolution',
        'One extra Fluffy ability':'Eine zusätzliche Fähigkeit für Fluffy', 'Overkill one more cell':'Overkill erfasst ein weiteres Feld',
        '+1 MegaCrit; Shield crit chance counts again at 50%':'+1 MegaCrit; Krit-Chance des Shields zählt noch einmal zu 50%', '5x damage in Voids; Void stacks compound and stack further':'5-facher Schaden in Voids; Void-Stapel wirken multiplikativ und stapeln weiter',
        'More Healthy cells per Spire; +20% Helium from them':'Mehr Healthy-Felder je Spire; +20% Helium aus ihnen', 'Triples most Challenge² bonuses':'Verdreifacht die meisten Challenge²-Boni',
        'Liquification +2 Spires; Hyperspeed II up to 75%':'Liquification +2 Spires; Hyperspeed II bis 75%', '+60 s Magmamancer head start per Spire row; longer cap':'+60 s Vorsprung der Magmamanten je Spire-Reihe; längere Obergrenze',
        'Trimps heal 50% of remaining health before each attack':'Scruffies heilen vor jedem Angriff 50% ihrer restlichen Health',
        // Rows of the original mastery table (screen readers) and the cost line of a mastery tooltip (tooltip() in updates.js).
        'Row Finished':'Reihe fertig', 'Locked':'Gesperrt', 'Purchased':'Gekauft', 'Your next mastery costs':'Deine nächste Mastery kostet', 'Respec (20 Bones)':'Respec (20 Knochen)', 'Respec (20 bones)':'Respec (20 Knochen)',
        'You have already purchased this tier!':'Diese Reihe hast du schon gekauft!',
        'You must buy this entire tier to be able to spend all of your Dark Essence.':'Du musst diese ganze Reihe kaufen, um deine ganze Dark Essence ausgeben zu können.',
        'You can afford to purchase this entire tier!':'Du kannst dir diese ganze Reihe leisten!',
        'However, purchasing this entire tier right now may limit which other Masteries you can reach.':'Kaufst du jetzt aber die ganze Reihe, erreichst du womöglich andere Masteries nicht mehr.',
        'You cannot afford to purchase this entire tier.':'Diese ganze Reihe kannst du dir nicht leisten.',
        'You can afford to purchase this whole row! Hold Ctrl when clicking to buy this entire row and any uncompleted rows before it.':'Du kannst dir diese ganze Reihe leisten!',
        // Liquification in Universe 2 (Liquification I and II)
        'This Mastery is currently disabled in Universe 2':'Diese Mastery ist in Universum 2 derzeit abgeschaltet.'
    };
    // German lines already name the Rare Kin as the branding does (Turkimp → Gobbleby …).
    for (const [english, german] of Object.entries(own)) { strings[english] = german; strings[brand(english)] = german; }
    // Requirements in a mastery tooltip name other Masteries (formatListCommasAndStuff in updates.js).
    const required = new Set();
    if (typeof game !== 'undefined' && game) for (const talent of Object.values(game.talents)) for (const key of [].concat(talent.requires || [])) required.add(game.talents[key].name);
    const names = '(?:' + [...required].map(esc).join('|') + ')';
    const needs = new RegExp('^Requires (' + names + '(?:(?:, | and |, and )' + names + ')*)$');
    // Effect labels of the Portal atlas with a per-level value ("Attack +5% per level", "Agility −5% per level").
    const labels = {Attack:'Attack', Health:'Health', 'Attack interval':'Angriffsintervall', Loot:'Beute', Production:'Produktion', Storage:'Lager', 'Building cost':'Gebäudekosten',
        'Equipment cost':'Ausrüstungskosten', 'Trap capture':'Fallenfang', 'Territory bonus':'Gebietsbonus', Breeding:'Vermehrung', 'Maximum population':'Höchstbevölkerung'};
    const level = new RegExp('^(' + Object.keys(labels).map(esc).join('|') + ') ([+−]\\S+) per level$');
    // Tooltip parts of the original around the description: perk price, spent currency, mastery requirements.
    const lastZone = '<p>Your value for "Last Portal Zone" only changes if you Portal after Z99 or collect an Heirloom, meaning it won\'t be reset by early restarts.</p>';
    const lastZoneDe = '<p>Dein Wert „Last Portal Zone“ ändert sich nur, wenn du nach Z99 ein Portal nutzt oder ein Heirloom einsammelst; frühe Neustarts setzen ihn also nicht zurück.</p>';
    const fluffyLead = {'Y':'', 'Counting your Fluffy bonus as half of a Spire, y':'Dein Fluffy-Bonus zählt als halbe Spire. ', 'Counting your two Fluffy bonuses as one Spire, y':'Deine zwei Fluffy-Boni zählen als eine Spire. '};
    const fluffyMore = {'':'', ' and your Fluffy bonus as half of a Spire':', dein Fluffy-Bonus als halbe Spire', ' and your two Fluffy bonuses as another':', deine zwei Fluffy-Boni als eine weitere'};
    const spires = n => n + ' einzigartige ' + one(n, 'Spire', 'Spires');
    const liquid = (verb, total, base, zone, next, nextZone) => 'Du hast umgerechnet ' + spires(total) + ' abgeschlossen; das ergibt ' + base + '% deiner höchsten erreichten Zone (bis Z' + zone + '). Diese Mastery ' +
        (verb === 'is increasing' ? 'erhöht deinen Bonus auf ' + next + '% deiner höchsten erreichten Zone (bis Z' + nextZone + ').' : 'würde deinen Bonus auf ' + next + '% deiner höchsten erreichten Zone (bis Z' + nextZone + ') erhöhen.');
    const chance = text => {
        let m;
        if ((m = text.match(/^You will have a <b>(\S+)%<\/b> chance to find a Runetrinket at Z100\.$/))) return 'Bei Z100 hast du eine Chance von <b>' + m[1] + '%</b>, ein Runetrinket zu finden.';
        if ((m = text.match(/^You have a <b>(\S+)%<\/b> chance to find a Runetrinket at the end of this Zone\.$/))) return 'Am Ende dieser Zone hast du eine Chance von <b>' + m[1] + '%</b>, ein Runetrinket zu finden.';
        if ((m = text.match(/^You will find (\d+) guaranteed Runetrinkets? at the end of this Zone, and have a (\S+)% chance to find 1 extra\.$/)))
            return 'Am Ende dieser Zone findest du ' + m[1] + ' ' + one(m[1], 'sicheres Runetrinket', 'sichere Runetrinkets') + ' und hast eine Chance von ' + m[2] + '% auf 1 weiteres.';
        return null;
    };
    const verb = (yes, now, would) => yes ? now : would;
    const patterns = [
        // Portal atlas and perk tooltip
        [level, (_, label, value) => labels[label] + ' ' + value + ' pro Stufe'],
        [/^(\S+) (Helium Canister|Radon Vial|Bonus Point)(s?)$/, (_, n, what, s) => n + ' ' + ({'Helium Canister':'Heliumkanister', 'Radon Vial':s ? 'Radonphiolen' : 'Radonphiole', 'Bonus Point':s ? 'Bonuspunkte' : 'Bonuspunkt'})[what]],
        [/^You have spent (\S+) (Helium|Radon) on this Perk\.$/, (_, n, what) => 'Für diesen Perk hast du ' + n + ' ' + what + ' ausgegeben.'],
        // Mastery tooltip cost lines
        [/^(\d+) left, Row (Unlocked|Locked)$/, (_, n, state) => n + ' offen, Reihe ' + (state === 'Unlocked' ? 'frei' : 'gesperrt')],
        [/^Locked \(Buy (2 Masteries|1 more Mastery) from Tier (\d+) to unlock (Tier|the next from Tier) (\d+)(?:\. This Mastery also requires (.+))?\)$/, (_, buy, tier, next, target, needs) =>
            'Gesperrt (Kaufe ' + (buy === '2 Masteries' ? '2 Masteries' : '1 weitere Mastery') + ' aus Reihe ' + tier + ', um ' + (next === 'Tier' ? 'Reihe ' + target : 'die nächste aus Reihe ' + target) + ' freizuschalten' +
            (needs ? '. Diese Mastery braucht außerdem ' + and(needs) : '') + ')'],
        [needs, (_, list) => 'Benötigt ' + and(list)],
        [/^(\S+) Dark Essence \(Use Scrying Formation to earn more\)$/, (_, n) => n + ' Dark Essence (mehr bringt Scryer Formation)'],
        // Perk getters (config.js), on the branded text
        [/^Fluffy demands more helium! Each level of Cunning will increase the final amount of Experience Fluffy gains from each Zone by (\S+)% \(additive\)\.$/,
            (_, n) => 'Fluffy verlangt mehr Helium! Jede Stufe Cunning erhöht die Exp, die Fluffy am Ende jeder Zone erhält, um ' + n + '% (additiv).'],
        [/^Fluffy is coming along, but he's coming along slowly\. Each point of Curious will speed up Fluffy's progression by adding (\S+) Exp to the base amount he gains per Zone clear\.$/,
            (_, n) => 'Fluffy macht Fortschritte, aber langsam. Jeder Punkt Curious beschleunigt Fluffys Entwicklung um ' + n + ' Exp zusätzlich zur Grundmenge je abgeschlossener Zone.'],
        [/^Reduce the Zone that Fluffy can start earning Experience at by (\S+)\. With (\S+) levels? in Classy, Fluffy will start earning Experience at Z(\S+)\. <b>Maximum of 75 levels\.<\/b>$/,
            (_, n, levels, zone) => 'Senkt die Zone, ab der Fluffy Exp sammelt, um ' + n + '. Mit ' + levels + ' ' + one(levels, 'Stufe', 'Stufen') + ' Classy sammelt Fluffy ab Z' + zone + ' Exp. <b>Höchstens 75 Stufen.</b>'],
        [/^Use your experiences in understanding the attention span of Scruffies to increase the damage dealt by all soldiers based on how long it took to get an army together\. Increases damage by 2% per level per second up to (\d+) seconds\. <b>Maximum of 10 levels\.<\/b>$/,
            (_, n) => 'Nutze deine Erfahrung mit der Aufmerksamkeitsspanne der Scruffies: Alle Soldaten verursachen mehr Schaden, je länger es gedauert hat, eine Armee zusammenzustellen. Erhöht den Schaden um 2% pro Stufe und Sekunde, bis zu ' + n + ' Sekunden. <b>Höchstens 10 Stufen.</b>'],
        [/^Walk back through the empty Zones, learning how to milk them for every last drop\. Each level permanently increases the amount of resources gained from battle \(Including (Helium|Radon)\) by 5%\.$/,
            (_, what) => 'Geh durch die leeren Zonen zurück und lerne, sie bis zum letzten Tropfen auszuquetschen. Jede Stufe erhöht dauerhaft die Ressourcen aus Kämpfen (auch ' + what + ') um 5%.'],
        [/^Huffy has learned much from Assaulting his Spire, now store some of that knowledge in your Portal! Gain (\S+)% attack and health plus another (\S+)% per Spire Assault level cleared, compounding per perk level\.(?: <br\/><br\/>You are currently gaining (\S+) attack and health\. Your next Spire Assault level will increase this bonus to (\S+), or your next perk level will increase this bonus to (\S+)\.)?$/,
            (_, base, per, now, level, perk) => 'Huffy hat viel aus dem Sturm auf seine Spire gelernt; bewahre etwas von diesem Wissen in deinem Portal auf! Du erhältst ' + base + '% Attack und Health plus weitere ' + per + '% je abgeschlossenem Spire-Assault-Level, multiplikativ je Perk-Stufe.' +
                (now ? ' <br/><br/>Derzeit erhältst du ' + now + ' Attack und Health. Dein nächstes Spire-Assault-Level erhöht den Bonus auf ' + level + ', deine nächste Perk-Stufe auf ' + perk + '.' : '')],
        [/^Grants your Scruffies the ability to locate small Runetrinkets around the World\. Purchasing this Perk will grant your Scruffies a chance per Zone cleared above Z100 to find a Runetrinket\. Each Runetrinket increases your Scruffies' attack, health, and gathered primary resources by 1% \(additive\) per perk level\. You can store a maximum of (\S+) Runetrinkets per perk level, reducing levels in this perk will deactivate any trinkets above cap but not lose them\. Runetrinkets persist through Portal and never reset\. The chance to find a Runetrinket increases by about 50% per level of this Perk, and scales as the Zone number increases \(up to Z200\)\. You'll also find 1 guaranteed Runetrinket every 25 Zones above Z100 for every 2 levels of this perk\. <b>Maximum of 50 levels\.<\/b><br\/><br\/>You have (\S+) Runetrinkets?\. You are currently gaining (\S+) attack, health, and gathered resources and you can store a total of (\S+) Runetrinkets\.<br\/><br\/>(.*)$/,
            (_, cap, have, gain, total, rest) => { const odds = chance(rest); return odds === null ? null : 'Deine Scruffies können kleine Runetrinkets in der Welt aufspüren. Mit diesem Perk haben deine Scruffies je abgeschlossener Zone über Z100 eine Chance, ein Runetrinket zu finden. Jedes Runetrinket erhöht Attack, Health und gesammelte Grundressourcen deiner Scruffies um 1% (additiv) je Perk-Stufe. Du kannst höchstens ' + cap + ' Runetrinkets je Perk-Stufe lagern; senkst du die Stufen, werden Trinkets über der Obergrenze inaktiv, gehen aber nicht verloren. Runetrinkets bleiben über Portale erhalten und werden nie zurückgesetzt. Die Chance auf ein Runetrinket steigt je Stufe dieses Perks um etwa 50% und wächst mit der Zonennummer (bis Z200). Außerdem findest du je 2 Stufen dieses Perks alle 25 Zonen über Z100 1 sicheres Runetrinket. <b>Höchstens 50 Stufen.</b><br/><br/>Du hast ' + have + ' ' + one(have, 'Runetrinket', 'Runetrinkets') + '. Derzeit erhältst du ' + gain + ' Attack, Health und gesammelte Ressourcen und kannst insgesamt ' + total + ' Runetrinkets lagern.<br/><br/>' + odds; }],
        // Mastery getters (config.js), on the branded text
        [/^Your Scruffies learn to harvest special Herbs while collecting Food! Increases Scruffy Attack by a number based on your total stored food\. Grants \+30% Attack at (\S+) Food, or \+300% at (\S+)\. At your current total of (\S+) Food, <b>you (are gaining|would gain) \+(\S+)% Scruffy Attack<\/b>\.$/,
            (_, low, high, food, state, n) => 'Deine Scruffies lernen, beim Nahrungssammeln besondere Kräuter zu ernten! Erhöht die Attack der Scruffies abhängig von deiner gelagerten Nahrung: +30% Attack bei ' + low + ' Nahrung, +300% bei ' + high + '. Bei deinen derzeit ' + food + ' Nahrung <b>' +
                verb(state === 'are gaining', 'erhältst du +' + n + '% Attack', 'würdest du +' + n + '% Attack erhalten') + '</b>.'],
        [/^When fighting Corrupted (or Healthy )?cells in Scryer Formation, grants 50% more Dark Essence and doubles your attack\.$/,
            (_, healthy) => 'Im Kampf gegen Corrupted-' + (healthy ? ' oder Healthy-Felder' : 'Felder') + ' in Scryer Formation erhältst du 50% mehr Dark Essence und doppelte Attack.'],
        [/^Each cleared Zone through Z(\d+) \((half|\d+%) of your highest Zone reached\) will drop all available equipment prestiges from maps\.$/,
            (_, zone, part) => 'Jede abgeschlossene Zone bis Z' + zone + ' (' + (part === 'half' ? 'die Hälfte' : part) + ' deiner höchsten erreichten Zone) lässt alle verfügbaren Prestige-Stufen der Ausrüstung aus Maps fallen.'],
        [/^Reduce the time in between fights and attacks by an additional 100ms through Z(\d+) \((\d+)% of your highest Zone reached\)\.$/,
            (_, zone, part) => 'Verkürzt die Zeit zwischen Kämpfen und Angriffen bis Z' + zone + ' um weitere 100ms (' + part + '% deiner höchsten erreichten Zone).'],
        [/^Increase your Liquification bonus by 5%, as if you had completed 1 extra Spire\. (Y|Counting your Fluffy bonus as half of a Spire, y|Counting your two Fluffy bonuses as one Spire, y)ou have completed (\S+) unique Spires?, giving you (\S+)% of your highest Zone reached \(through Z(\d+)\)\. This mastery (is increasing|would increase) +your bonus to (\S+)% of your highest Zone reached \(through Z(\d+)\)\.$/,
            (_, lead, total, base, zone, state, next, nextZone) => 'Erhöht deinen Liquification-Bonus um 5%, als hättest du 1 Spire mehr abgeschlossen. ' + fluffyLead[lead] + liquid(state, total, base, zone, next, nextZone)],
        [/^Increase your Liquification bonus by another 5%, as if you had completed 1 extra Spire\. Counting Liquification I as one Spire( and your Fluffy bonus as half of a Spire| and your two Fluffy bonuses as another)?, you have completed the equivalent of (\S+) unique Spires?, giving you (\S+)% of your highest Zone reached \(through Z(\d+)\)\. This mastery (is increasing|would increase) +your bonus to (\S+)% of your highest Zone reached \(through Z(\d+)\)\.$/,
            (_, fluffy, total, base, zone, state, next, nextZone) => 'Erhöht deinen Liquification-Bonus um weitere 5%, als hättest du 1 Spire mehr abgeschlossen. Liquification I zählt als eine Spire' + fluffyMore[fluffy || ''] + '. ' + liquid(state, total, base, zone, next, nextZone)],
        [/^Increase your Liquification bonus by <b>10%<\/b>, as if you had completed <b>2 extra Spires<\/b>\. In addition, <b>Hyperspeed II's bonus will also now function up to 75% of your Highest Zone Reached \(through Z(\d+)\) rather than a measly 50%<\/b>\.<br\/><br\/>Counting Liquification I and II as two Spires( and your Fluffy bonus as half of a Spire| and your two Fluffy bonuses as another)?, you have completed the equivalent of (\S+) unique Spires?, giving you (\S+)% of your highest Zone reached \(through Z(\d+)\)\. This mastery (is increasing|would increase) +your bonus to (\S+)% of your highest Zone reached \(through Z(\d+)\)\.$/,
            (_, hyper, fluffy, total, base, zone, state, next, nextZone) => 'Erhöht deinen Liquification-Bonus um <b>10%</b>, als hättest du <b>2 Spires mehr</b> abgeschlossen. Außerdem <b>wirkt der Bonus von Hyperspeed II jetzt bis 75% deiner höchsten erreichten Zone (bis Z' + hyper + ') statt mickriger 50%</b>.<br/><br/>Liquification I und II zählen als zwei Spires' + fluffyMore[fluffy || ''] + '. ' + liquid(state, total, base, zone, next, nextZone)],
        [/^Liquification is disabled in Universe 2, but <b>Hyperspeed II's bonus will now function up to 75% of your Highest Zone Reached \(through Z(\d+)\) rather than a measly 50%<\/b>$/,
            (_, zone) => 'Liquification ist in Universum 2 abgeschaltet, aber <b>der Bonus von Hyperspeed II wirkt jetzt bis 75% deiner höchsten erreichten Zone (bis Z' + zone + ') statt mickriger 50%</b>'],
        [new RegExp('^<p>Receive 1 free Void Map after using your Portal for each 100 Zones reached last run\\. (Helium|Radon) from Void Maps is also increased by 0\\.25% for each Zone reached last run\\.</p><p>You reached <b>Z(\\d+)</b> last Portal, +(earning you|which would earn you) a bonus of (\\S+)% extra (?:Helium|Radon) and (\\d+) Void Maps\\.</p>' + esc(lastZone) + '$'),
            (_, what, zone, state, n, maps) => '<p>Nach jedem Portal erhältst du je 100 im letzten Durchlauf erreichter Zonen 1 kostenlose Void Map. ' + what + ' aus Void Maps steigt außerdem um 0.25% je im letzten Durchlauf erreichter Zone.</p><p>Beim letzten Portal hast du <b>Z' + zone + '</b> erreicht; das ' +
                verb(state === 'earning you', 'bringt dir', 'würde dir') + ' ' + n + '% zusätzliches ' + what + ' und ' + maps + ' Void Maps' + verb(state === 'earning you', '', ' bringen') + '.</p>' + lastZoneDe],
        [new RegExp('^<p>Gain a second Void Map per 100 Zones reached last run, but the first one is earned at Z50 \\(then 150, 250 etc\\)\\. In addition, if (.+?)\'s level (\\d+) bonus is active, this allows \\1 to stack 1 additional Void Map, adding another 50% (Helium|Radon) bonus to the stack\\.</p><p>You reached <b>Z(\\d+)</b> last Portal, +(earning you|which would earn you) a bonus of (\\d+) more Void Maps \\((\\d+) including Void Specialization I\\)\\.</p>' + esc(lastZone) + '$'),
            (_, pet, level, what, zone, state, maps, all) => '<p>Du erhältst je 100 im letzten Durchlauf erreichter Zonen eine zweite Void Map, die erste aber schon bei Z50 (dann 150, 250 usw.). Ist außerdem der Bonus von ' + pet + ' auf Level ' + level + ' aktiv, kann ' + pet + ' 1 weitere Void Map stapeln; das bringt dem Stapel weitere 50% ' + what + '-Bonus.</p><p>Beim letzten Portal hast du <b>Z' + zone + '</b> erreicht; das ' +
                verb(state === 'earning you', 'bringt dir', 'würde dir') + ' ' + maps + ' weitere Void Maps (' + all + ' einschließlich Void Specialization I)' + verb(state === 'earning you', '', ' bringen') + '.</p>' + lastZoneDe],
        [/^(.+?) gains \+25% more Exp per Zone for each completed Evolution\. \1 has Evolved (\d+) times?, (earning|which would earn) you a bonus of \+(\S+)% Exp\.$/,
            (_, pet, n, state, bonus) => pet + ' erhält je abgeschlossener Evolution +25% mehr Exp pro Zone. ' + pet + ' hat sich ' + n + '-mal entwickelt; das ' + verb(state === 'earning', 'bringt dir einen Bonus von +' + bonus + '% Exp.', 'würde dir einen Bonus von +' + bonus + '% Exp bringen.')],
        [/^Gain one extra (.+?) ability\. This works as if \1 Evolved, but doesn't increase \1's damage bonus\.$/,
            (_, pet) => 'Du erhältst eine zusätzliche Fähigkeit von ' + pet + '. Das wirkt, als hätte sich ' + pet + ' entwickelt, erhöht aber nicht den Schadensbonus von ' + pet + '.'],
        [/^<p>Adds \+1 to your MegaCrit modifier, and adds 50% of your Shield Heirloom's Crit Chance to your Crit Chance again\.<\/p>(?:<p>Your Shield currently has a bonus of (\S+)%, so this Mastery (is giving you|would give you) \+(\S+)% additional Crit Chance\.<\/p>|<p>However, you do not currently have Crit Chance on your Shield\.<\/p>)$/,
            (_, bonus, state, n) => '<p>Erhöht deinen MegaCrit-Modifikator um 1 und rechnet 50% der Krit-Chance deines Shield-Heirlooms noch einmal zu deiner Krit-Chance.</p>' +
                (bonus ? '<p>Dein Shield hat derzeit einen Bonus von ' + bonus + '%; diese Mastery ' + verb(state === 'is giving you', 'gibt dir', 'würde dir') + ' +' + n + '% zusätzliche Krit-Chance' + verb(state === 'is giving you', '', ' geben') + '.</p>' : '<p>Dein Shield hat derzeit allerdings keine Krit-Chance.</p>')],
        [/^<p>Grants 3 spectacular bonuses to your Void Maps(, though the first two are currently incompatible with Scruffy\. Scruffy tries but seriously just can't figure out the whole stacking thing yet\.|!)<\/p><p>1\. The (.+?) bonus for stacked Void Maps calculates with compounding gains, rather than additive\. Each Void Map in the stack increases the (Helium|Radon) gain from the stack by x1\.5 rather than \+50%\.<\/p><p>2\. If \2's level (\d+) bonus is active, allows Void Maps to infinitely stack\. HOWEVER, this requires that the bonus \3 does not increase past the amount that \2 can normally stack, which for you would cap the bonus to a (\S+) stack\. To clarify, a 100 stack or a \5 stack map would both grant (\S+)% bonus (Helium|Radon) to each map in the stack, but the entire stack will still be completed instantly and each map in the stack will receive the maximum bonus\.<\/p><p>3\. Your Scruffies gain 5x damage inside Void Maps<\/p>$/,
            (_, intro, pet, what, level, cap, n, what2) => '<p>Gibt deinen Void Maps 3 spektakuläre Boni' + (intro === '!' ? '!' : ', allerdings passen die ersten beiden derzeit nicht zu Scruffy. Scruffy gibt sich Mühe, versteht das mit dem Stapeln aber einfach noch nicht.') +
                '</p><p>1. Der Bonus von ' + pet + ' für gestapelte Void Maps rechnet multiplikativ statt additiv. Jede Void Map im Stapel erhöht den ' + what + '-Ertrag des Stapels um x1.5 statt um +50%.</p><p>2. Ist der Bonus von ' + pet + ' auf Level ' + level + ' aktiv, lassen sich Void Maps unbegrenzt stapeln. ABER: Der ' + what + '-Bonus steigt dabei nicht über das, was ' + pet + ' normal stapeln kann; bei dir endet der Bonus damit bei einem Stapel von ' + cap + '. Zur Klarstellung: Ein Stapel von 100 und einer von ' + cap + ' geben beide jeder Map im Stapel ' + n + '% ' + what2 + '-Bonus, aber der ganze Stapel wird trotzdem sofort abgeschlossen und jede Map im Stapel erhält den Höchstbonus.</p><p>3. Deine Scruffies verursachen in Void Maps 5-fachen Schaden.</p>'],
        [/^<p>Adds 1 extra Healthy cell for every Spire completed this run\. Healthy cells will also drop an additional 20% of the Zone's value in Helium, bringing the total up to 65%\. Spire (\S+) will count for 1 Healthy cell once Healthy cells begin to appear in the World, but does not cause them to start spawning earlier\.<\/p><p>On your current run, you have cleared (no Spires|through Spire \S+), so this Mastery is granting (\d+) extra Healthy cells?\. On your current Zone, you're finding (\d+) Healthy cells\.<\/p>$/,
            (_, first, cleared, n, now) => '<p>Fügt je in diesem Durchlauf abgeschlossener Spire 1 zusätzliches Healthy-Feld hinzu. Healthy-Felder lassen außerdem weitere 20% des Zonenwerts als Helium fallen, insgesamt 65%. Spire ' + first + ' zählt als 1 Healthy-Feld, sobald Healthy-Felder in der Welt erscheinen, lässt sie aber nicht früher auftauchen.</p><p>In diesem Durchlauf hast du ' +
                (cleared === 'no Spires' ? 'noch keine Spire abgeschlossen' : 'alle Spires bis ' + cleared.replace('through ', '') + ' abgeschlossen') + '; diese Mastery gibt dir damit ' + n + ' ' + one(n, 'zusätzliches Healthy-Feld', 'zusätzliche Healthy-Felder') + '. In deiner aktuellen Zone findest du ' + now + ' Healthy-Felder.</p>'],
        [/^<p>Triples the Challenge<sup>(2|2\/3)<\/sup> bonus for all Challenge<sup>\1<\/sup>s that have normal reward scaling \(Does not include (.+?)\)\.<\/p><p>You currently have a C<sup>(2|<span class='icomoon icon-infinity'><\/span>)<\/sup> bonus of (\S+)%\. (?:Removing this Mastery would reduce your bonus by (\S+)%, bringing your total Challenge<sup>\3<\/sup> bonus down to (\S+)%\.|Purchasing this Mastery would increase your bonus by (\S+)%, bringing your total Challenge<sup>\3<\/sup> bonus up to (\S+)%\.)<\/p>$/,
            (_, number, list, total, now, less, low, more, high) => '<p>Verdreifacht den Challenge<sup>' + number + '</sup>-Bonus aller Challenge<sup>' + number + '</sup>s mit normaler Belohnungsskalierung (außer ' + list.replace(' or ', ' oder ') + ').</p><p>Dein C<sup>' + total + '</sup>-Bonus beträgt derzeit ' + now + '%. ' +
                (less !== undefined ? 'Ohne diese Mastery sänke dein Bonus um ' + less + '% auf insgesamt ' + low + '% Challenge<sup>' + total + '</sup>-Bonus.' : 'Mit dieser Mastery stiege dein Bonus um ' + more + '% auf insgesamt ' + high + '% Challenge<sup>' + total + '</sup>-Bonus.') + '</p>']
    ];
    // Cheap prefilter: the start of every text the patterns above translate.
    const probe = new RegExp('^(?:' + Object.keys(labels).map(esc).join('|') + ') [+−]| (?:Helium Canister|Radon Vial|Bonus Point)s?$|^You have spent |^\\d+ left, Row |^Locked \\(|^Requires |Dark Essence \\(Use|^Fluffy (?:demands|is coming)|^Reduce the |^Use your experiences|^Walk back|^Huffy has|^Grants your|^Your Scruffies learn|^When fighting Corrupted|^Each cleared Zone|^Increase your Liquification|^Liquification is disabled|^<p>(?:Receive 1|Gain a second|Adds |Grants 3|Triples)| gains \\+25% more Exp|^Gain one extra ');
    // Respec button of the Mastery head (displayTalents in main.js writes it without comparing). The count "N Affordable"
    // stays English: updateTalentNumbers compares that element with its English text and would rewrite it every tick.
    patterns.push([/^Respec \((\d+) Free!\)$/, (_, n) => 'Respec (' + n + ' gratis!)']);
    const fullProbe = new RegExp(probe.source + '|^Respec \\(');
    // Labels the Diorama Mastery view draws itself (content: in mobile-diorama-subviews.css), German with the same selectors.
    const view = 'html[data-graphics="diorama"][data-language="de"] #talentsContainer #talentsHere ';
    const css = [
        view + 'tr.talentTierRow::before{content:"Reihe " attr(data-tier);}',
        view + '.talentRowUnlocked .talentItem.talentNotPurchased::after{content:"Kaufen";}',
        'html[data-graphics="diorama"][data-language="de"] #talentsContainer[data-mastery-afford="false"] #talentsHere .talentRowUnlocked .talentItem.talentNotPurchased:not(.talentReqNeeded)::after{content:"Essence fehlt";}',
        view + '.talentItem.talentPurchased::after{content:"\\2713  Gekauft";}',
        view + '.talentRowLocked .talentItem.talentNotPurchased::after{content:"\\1F512\\FE0E  Gesperrt";}',
        view + '.talentRowUnlocked .talentItem.talentNotPurchased.talentReqNeeded::after{content:"Vorgänger fehlt";}'
    ].join('\n');
    const catalog = {strings, patterns, probe:fullProbe, fields:{portal:['tooltip'], talents:['description']},
        scope:'.mobile-perk-effect,.mobile-perk-level,.mobile-mastery-effect,#mobile-mastery-filter,#mobile-mastery-empty,#talentsHere th,#talentsHere .talentLocked,#talentRespecBtn,#talentsCost', css, perks, masteries, own, labels};
    if (typeof MobileI18nGame !== 'undefined' && MobileI18nGame.extend('de', catalog) && typeof document !== 'undefined' && document.head) {
        const style = document.createElement('style'); style.id = 'mobile-i18n-perks-style'; style.textContent = css; document.head.append(style);
    }
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDePerks;
