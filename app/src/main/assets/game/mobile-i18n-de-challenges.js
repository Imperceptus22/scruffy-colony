// V-243 step 4b: German challenge texts of Universe 1 (rules, goals and rewards in the Portal, Current challenge under More
// and the View Current Challenge pane) and the completion and failure notices of the challenges of both universes.
// - Config texts: description, squaredDescription and unlockString are the fields saveOriginal (main.js) deletes from every
//   save, so they are replaced once per game object, like the info texts of step 2. Getters stay getters (their English
//   result is matched by a template). Names, keys and states stay English.
// - Composed sentences of the original (selectChallenge, getCurrentChallengePane, getSpecialSquaredRewards, C² progress)
//   are translated where they are shown, only when the challenge itself is German, so no paragraph mixes both languages.
// - Step 4c: the rules of Universe 2 (texts and getter templates) and the Daily: its modifiers (dailyModifiers in main.js)
//   are wrapped at the source, its frame (day row, reward line) is translated where it is shown.
// - Challenge names, Perk names, map names, Zone, Map, Helium, Radon, Attack, Health and Block stay English (glossary);
//   numbers keep the format of prettify() ("1.5K"). No German text contains ASCII double quotes or "Trimp".
var MobileI18nDeChallenges = (() => {
    const brand = value => typeof MobileBranding === 'undefined' ? value : MobileBranding.text(value);
    const esc = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // An English template with {} for each changing value (number, zone, name) becomes an anchored pattern on the branded
    // text; the German template names the values {0}, {1} … Values never contain tags, so a value cannot run past a sentence.
    function template(english, german) {
        const pattern = new RegExp('^' + brand(english).split('{}').map(esc).join('([^<>]*?)') + '$');
        return [pattern, (_, ...values) => typeof german === 'function' ? german(...values) : german.replace(/\{(\d)\}/g, (m, i) => values[i])];
    }
    const both = ' Die Regeln beider Challenges gelten, und dieser Challenge<sup>2</sup>-Durchlauf zählt für die höchste Zone und die C<sup>2</sup>-Boni beider Challenges.';
    // Rules that Universe 2 repeats between description and squaredDescription.
    const tweak = 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der ';
    const unluckyRules = tweak + 'der Mindestschaden deiner Scruffies drastisch sinkt, ihr Höchstschaden aber deutlich steigt. Bei jedem Angriff deiner Scruffies öffnen sich 5 alternative Zeitlinien. Ist die erste Ziffer der minimalen Attack deiner Scruffies gerade, wird die Zeitlinie Wirklichkeit, in der deine Scruffies den meisten Schaden verursacht haben. Ist die erste Ziffer ungerade, wird stattdessen die Zeitlinie Wirklichkeit, in der sie den wenigsten Schaden verursacht haben.';
    const downsizeRules = tweak + 'Scruffies unglaublich ungesellig sind und sich mit keinem anderen Scruffy ein Haus teilen wollen. Jede Unterkunft bietet nur 1 Scruffy Platz, aber die bessere Stimmung und die kleinere Gesellschaft lassen alle Scruffies je Sekunde 5x so viele Ressourcen sammeln.';
    const transmuteRules = tweak + 'Metall weder als Beute fällt noch gesammelt werden kann. Am Ende jeder Zone werden deine Nahrung, dein Holz und deine Wissenschaft vollständig verbraucht, und 75% der verbrauchten Ressourcen (netto) werden zu Metall.';
    const unbalanceRules = 'Alle Gegner haben 50% mehr Attack, Gegner in Maps 100% mehr Health und Gegner in der Welt 200% mehr Health. Ab Zone 6 erhältst du für jeden in der Welt erschlagenen Gegner einen Stapel ‚Unbalance‘. Für jeden in einer Map erschlagenen Gegner verlierst du einen Stapel Unbalance. Jeder Stapel Unbalance senkt deine Attack um 1%, erhöht aber das Sammeltempo deiner Scruffies um 1%.';
    const duelRules = 'Deine Scruffies gegen die Gegner! Beide Teams beginnen mit 50 Punkten, und die Krit-Chance jedes Teams entspricht genau den Punkten des ANDEREN Teams. Ein kritischer Treffer stiehlt dem anderen Team 1 Punkt, ein gewonnener Kampf 2 Punkte und ein mit einem einzigen Treffer gewonnener Kampf 5 Punkte.';
    const trappaRules = 'Reise in eine Dimension, in der sich Scruffies in Gefangenschaft nicht vermehren – so lernst du, keine so schwachen Scruffies mehr zu züchten. Außerdem setzen Scruffies in dieser Realität, wenn sie in eine Falle gehen, einen unglücklichen Strahlungsstoß frei, der sofort 10% deiner Vorräte an Nahrung, Holz, Metall und Wissenschaft vernichtet.';
    const witherRules = 'Reise in eine ultragruselige andere Realität mit schrecklichen Gegnern. Gegner heilen sich vor jedem Angriff um 25% ihrer maximalen Health. Heilt sich ein Gegner jemals wieder auf 100% Health, verfällt deine Armee in Verzweiflung und welkt sofort dahin. Jeder Gegner, den deine Scruffies in der Welt oder in Maps auf Weltstufe erschlagen, gibt deinen Scruffies 1 Stapel Hardness (bis zu 10,000 Stapel, je Stapel +0.1% Health) und allen Gegnern 1 Stapel Horror (je Stapel +0.05% Attack). Wird eine Gruppe Scruffies durch Wither getötet, verlieren die Scruffies die Hälfte ihrer Stapel Hardness und blockieren das Heilen und Wither des Gegners für so viele Felder, wie 10% der verlorenen Stapel Hardness entsprechen.';
    const questRules = (zone, start) => 'Reise in eine andere Realität, in der Scruffies Quests lieben. Gegner dieser Realität erhalten ab ' + zone + ' je Zone 10% zusätzliche Health (multiplikativ). Dafür bekommst du ' + start + ' Erfüllst du die Quest, erhältst du für den Rest der Zone einen Radon-Multiplikator von 2x (nicht stapelbar), und die Attack deiner Scruffies steigt für den Rest der Challenge um 10% (multiplikativ). Den Fortschritt der Quest findest du in den Meldungen oder im Info-Fenster der Zone.';
    const berserkRules = 'Reise in eine Dimension voller kleiner Ärgernisse, die deine Scruffies garantiert zur Raserei treiben. Alle Gegner dieser Dimension haben 50% mehr Attack und Health. Bei jedem Angriff werden deine Scruffies mit 5% Wahrscheinlichkeit Frenzied, und jeder Gegner, den sie im Zustand Frenzied erschlagen, erhöht ihre Frenzy, bis zu 25 Stapel. Im Zustand Frenzied heilt jeder erschlagene Gegner deine Scruffies um 1% ihrer maximalen Health, und jeder Stapel bringt +50% Attack und -2% maximale Health. Stirbt eine Gruppe im Zustand Frenzied oder wird sie aufgegeben, erhalten deine Scruffies einen dauerhaften Stapel Weakened, der ihre Health außerhalb von Frenzy je Stapel um 4.99% senkt. Erreichen die Stapel Weakened 20, können Scruffies nicht mehr Frenzied werden.';
    const glassRules = n => 'Reise in eine Dimension mit zerbrechlichen, aber gefährlichen Gegnern. Alle Gegner sind schnell und haben x100 Attack. Triffst du einen Gegner, ohne ihn zu töten, entsteht ein Stapel Glass. Jeder Stapel Glass erhöht den Grundmultiplikator der Gegner-Attack um +1x. Je 100 Glass verdoppeln sich Attack und Health der Gegner. Je ' + n + ' Glass erhalten Gegner einen Stapel Crystallized, und die Stapel Glass fallen auf 0 zurück. Jeder Stapel Crystallized senkt die Health der Gegner um 20% (multiplikativ), gibt ihnen aber auch 10% Wahrscheinlichkeit, einen Angriff zu reflektieren; bei 10 Stapeln Crystallized scheiterst du an dieser Challenge. Jeder getötete Gegner auf Weltstufe oder höher entfernt zwei Stapel Glass plus einen für jeden Stapel Crystallized auf dem Gegner, Crystallized lässt sich aber nie entfernen.';
    const smithRules = n => 'Reise in eine Dimension, in der es kaum geschickte Metallhandwerker gibt. In dieser Dimension kannst du keine eigenen Rüstschmieden bauen! Im ersten Feld jeder 25. Zone steht ein Ubersmith mit ' + n + 'x Health, und Ubersmiths sind immer schnell. Nach 10 Angriffen verwandelt sich der Ubersmith zurück in einen normalen Gegner der Welt mit normaler Health. Deine Scruffies erhalten aber 1 Stapel Enhanced Armor, wenn sie dem Ubersmith 0.0001% seiner Health genommen haben, einen weiteren für 1% und einen dritten, wenn sie den Ubersmith töten. Jeder Stapel Enhanced Armor gibt deinen Scruffies 25% (multiplikativ) Health und Attack, solange sie im Universum bleiben.';
    // Plain config texts by challenge and field (Daily excluded).
    const texts = {
        Discipline: {
            description: 'Stimme das Portal so ab, dass es dich in ein Universum zurückbringt, in dem Scruffies weniger diszipliniert sind – so lernst du, ein besserer Scruffy-Trainer zu werden. Der Mindestschaden deiner Scruffies sinkt drastisch, ihr Höchstschaden steigt dafür deutlich. Schließt du The Dimension Of Anger ab, wird der Schaden deiner Scruffies wieder normal.',
            squaredDescription: 'Stimme das Portal so ab, dass es dich in ein Universum zurückbringt, in dem Scruffies weniger diszipliniert sind – so lernst du, ein besserer Scruffy-Trainer zu werden. Der Mindestschaden deiner Scruffies sinkt drastisch, ihr Höchstschaden steigt dafür deutlich.'
        },
        Metal: {
            description: 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der es keine Bergleute gibt – so zwingst du dich zu sparsamen Strategien beim Herstellen von Ausrüstung. Schließt du The Dimension Of Anger ab, ohne die Challenge zu beenden, werden Bergleute wieder freigeschaltet.',
            squaredDescription: 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der es keine Bergleute gibt – so zwingst du dich zu sparsamen Strategien beim Herstellen von Ausrüstung.'
        },
        Size: {
            description: 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der Scruffies größer und stärker sind – so musst du lernen, größere Unterkünfte zu bauen. Deine Scruffies sammeln 50% mehr Ressourcen, aber in deine Unterkünfte passen 50% weniger Scruffies. Schließt du The Dimension of Anger ab, ohne die Challenge zu beenden, werden deine Werte wieder normal.',
            squaredDescription: 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der Scruffies größer und stärker sind – so musst du lernen, größere Unterkünfte zu bauen. Deine Scruffies sammeln 50% mehr Ressourcen, aber in deine Unterkünfte passen 50% weniger Scruffies.'
        },
        Balance: {
            description: 'Deine Forscher haben eine chaotische Dimension voller Helium entdeckt. Alle Gegner haben 100% mehr Health, Gegner in der Welt verursachen 17% mehr Schaden und Gegner in Maps 135% mehr Schaden. Ab Zone 6 erhältst du für jeden in der Welt erschlagenen Gegner einen Stapel ‚Unbalance‘. Für jeden in einer Map erschlagenen Gegner verlierst du einen Stapel Unbalance. Jeder Stapel Unbalance senkt deine Health um 1%, erhöht aber das Sammeltempo deiner Scruffies um 1%. Unbalance stapelt sich höchstens bis 250. Schließt du <b>Zone 40</b> mit dieser Challenge ab, erhältst du zusätzlich 100% des gesamten Heliums, das du in diesem Portal bis dahin verdient hast. Diese Challenge ist wiederholbar!',
            squaredDescription: 'Deine Forscher haben eine chaotische Dimension voller Helium entdeckt, das sich nicht ernten lässt, aber hübsch ist. Alle Gegner haben 100% mehr Health, Gegner in der Welt verursachen 17% mehr Schaden und Gegner in Maps 135% mehr Schaden. Ab Zone 6 erhältst du für jeden in der Welt erschlagenen Gegner einen Stapel ‚Unbalance‘. Für jeden in einer Map erschlagenen Gegner verlierst du einen Stapel Unbalance. Jeder Stapel Unbalance senkt deine Health um 1%, erhöht aber das Sammeltempo deiner Scruffies um 1%. Unbalance stapelt sich höchstens bis 250.'
        },
        Meditate: {
            description: 'Besuche eine Dimension, in der alles stärker ist, und lerne, deine Scruffies besser zu trainieren. Alle Gegner haben +100% Health und +50% Attack, aber deine Scruffies sammeln 25% schneller. Schließt du <b>‚Trimple of Doom‘ (33)</b> ab, wird die Welt wieder normal.',
            squaredDescription: 'Besuche eine Dimension, in der alles stärker ist, und lerne, deine Scruffies besser zu trainieren. Alle Gegner haben +100% Health und +50% Attack, aber deine Scruffies sammeln 25% schneller.'
        },
        Decay: {
            description: 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der zusätzliches Chaos dich lehrt, einen friedlichen Ort zu schaffen. Du erhältst 10x Beute (außer Helium), 10x Sammeln und 5x Attack für deine Scruffies, aber jede Sekunde kommt ein Stapel Decay hinzu. Jeder Stapel Decay senkt Beute, Sammeln und Attack deiner Scruffies um 0.5% des aktuellen Werts. Die Stapel setzen sich in jeder neuen Weltzone zurück und enden bei 999. Schließt du <b>Zone 55</b> mit dieser Challenge ab, kannst du beim Erstellen von Maps das Biom Gardens wählen, und alle künftig erstellten Gardens-Maps erhalten +25% Beute.'
        },
        Trimp: {
            description: 'Stimme das Portal so ab, dass es dich in eine Dimension bringt, in der Scruffies explodieren, wenn mehr als 1 gleichzeitig kämpft. Koordination kannst du nicht erforschen, aber wenn du <b>‚The Block‘ (11)</b> abschließt, lernst du, deine Scruffies viel länger am Leben zu halten.',
            squaredDescription: 'Stimme das Portal so ab, dass es dich in eine Dimension bringt, in der Scruffies explodieren, wenn mehr als 1 gleichzeitig kämpft. Koordination kannst du nicht erforschen.'
        },
        Trapper: {
            description: 'Reise in eine Dimension, in der sich Scruffies in Gefangenschaft nicht vermehren, und lerne neue Wege, Lagen mit geringem Zuwachstempo zu nutzen. Schließt du <b>‚Trimple Of Doom‘ (33)</b> mit dieser Challenge ab, wird dein Zuwachstempo wieder normal. Boni, durch die Unterkünfte schon mit Scruffies gefüllt sind, wirken in einer Dimension ohne Vermehrung nicht.',
            squaredDescription: 'Reise in eine Dimension, in der sich Scruffies in Gefangenschaft nicht vermehren und Boni, durch die Unterkünfte schon mit Scruffies gefüllt sind, einfach nicht wirken. Viel Glück!'
        },
        Electricity: {
            description: 'Bring dein Portal mit den Schlüsseln, die du in The Prison gefunden hast, in eine äußerst gefährliche Dimension. Dort setzen Gegner deine Scruffies unter Strom: Jeder Angriff legt einen Stapel Schwächung auf, der deinen Scruffies je Runde und Stapel 10% ihrer gesamten Health als Schaden zufügt und ihre Attack je Stapel um 10% senkt. Schließt du <b>‚The Prison‘ (80)</b> ab, erhältst du zusätzlich 200% des gesamten Heliums, das du in diesem Portal bis vor Zone 80 verdient hast. Wiederholbar!',
            squaredDescription: 'Bring dein Portal mit den Schlüsseln, die du in The Prison gefunden hast, in eine äußerst gefährliche Dimension. Dort setzen Gegner deine Scruffies unter Strom: Jeder Angriff legt einen Stapel Schwächung auf, der deinen Scruffies je Runde und Stapel 10% ihrer gesamten Health als Schaden zufügt und ihre Attack je Stapel um 10% senkt.'
        },
        Frugal: {
            description: 'Begib dich in eine Dimension, in der Ausrüstung billig ist, aber kein Prestige erhalten kann – so lernst du, besser mit Ressourcen und Ausrüstung umzugehen. Schließt du <b>‚Dimension of Anger‘ (20)</b> mit dieser Challenge ab, kehren die fehlenden Bücher in die Maps zurück, und dank deiner neuen Sparsamkeit erhöhen Megabücher das Sammeltempo dauerhaft um 60% statt 50%.'
        },
        Life: {
            description: 'Erkunde eine Dimension, die sonst von Untoten bevölkert ist, gerade aber von einem sich schnell ausbreitenden Virus heimgesucht wird, das Dinge wieder zum Leben erweckt. Alle Gegner dieser Dimension haben 500% zusätzliche Attack und 1000% zusätzliche Health. Greifen deine Scruffies einen normalen untoten Gegner an, erhalten sie 1 Stapel Unliving, der Attack und Health deiner Scruffies je Stapel um 10% (additiv) erhöht. Scruffies tragen höchstens 150 Stapel Unliving, und ein Angriff auf einen lebenden Gegner entfernt 5 Stapel Unliving. Schließt du <b>Zone 110</b> ab, erhältst du zusätzlich 400% des gesamten Heliums, das du in diesem Portal bis dahin verdient hast. Wiederholbar!'
        },
        Mapocalypse: {
            description: 'Erlebe eine leicht verzerrte Fassung der Dimension ‚Electricity‘, um das Verhältnis zwischen Maps und Welt zu verstehen. Alles funktioniert genau wie bei Electricity, aber alle Maps haben 300% zusätzliche Schwierigkeit. Schließt du <b>‚The Prison‘ (80)</b> ab, wird die Welt wieder normal. Du <b>erhältst</b> die Helium-Belohnung von Electricity.'
        },
        Coordinate: {
            description: 'Besuche eine Dimension, in der Gegner koordiniert, aber nie schnell sind, und studiere natürlich entstandene Koordination. Schließt du <b>‚Dimension of Anger‘ (20)</b> mit dieser Challenge ab, verlieren alle Gegner ihre Koordination.',
            squaredDescription: 'Besuche eine Dimension, in der Gegner koordiniert, aber nie schnell sind – zermürbe sie!'
        },
        Crushed: {
            description: 'Reise in eine Dimension mit heliumreicher Atmosphäre, in der Gegner aber mit 50% Wahrscheinlichkeit einen kritischen Treffer mit +400% Schaden landen, solange dein Block nicht so hoch ist wie deine aktuelle Health. Schließt du <b>Bionic Wonderland (Z125)</b> ab, erhältst du zusätzlich 400% des gesamten Heliums, das du in diesem Portal bis vor Z125 verdient hast. Diese Challenge ist wiederholbar.'
        },
        Slow: {
            description: 'Legenden erzählen von einer Dimension voller unglaublich schneller Gegner, in der es Baupläne für eine mächtige, aber längst vergessene Waffe und ein Rüstungsteil gibt. In dieser Dimension greifen alle Gegner zuerst an, doch schließt du <b>Zone 120</b> mit dieser Challenge ab, kannst du diese neuen Ausrüstungsteile für immer herstellen.',
            squaredDescription: 'Legenden erzählen von einer Dimension voller unglaublich schneller Gegner, und du willst offenbar dorthin, um etwas zu beweisen. In dieser Dimension greifen alle Gegner zuerst an – pass auf deine Health auf!'
        },
        Nom: {
            description: 'Reise in eine Dimension, in der Gegner Scruffies lecker finden. Stirbt eine Gruppe Scruffies, frisst der Gegner sie, erhält 25% (multiplikativ) mehr Angriffsschaden und heilt 5% seiner maximalen Health. Die methanreiche Atmosphäre lässt deine Scruffies nach jedem Angriff 5% ihrer gesamten Health verlieren, aber die Gegner sind zu groß und langsam, um zuerst anzugreifen. Schließt du <b>Zone 145</b> ab, erhältst du zusätzlich 450% des gesamten Heliums, das du in diesem Portal bis dahin verdient hast. Wiederholbar!',
            squaredDescription: 'Reise in eine Dimension, in der Gegner Scruffies lecker finden. Stirbt eine Gruppe Scruffies, frisst der Gegner sie, erhält 25% (multiplikativ) mehr Angriffsschaden und heilt 5% seiner maximalen Health. Die methanreiche Atmosphäre lässt deine Scruffies nach jedem Angriff 5% ihrer gesamten Health verlieren, aber die Gegner sind zu groß und langsam, um zuerst anzugreifen.'
        },
        Mapology: {
            description: 'Reise in eine Dimension mit wenigen Maps und lerne, einfallsreicher zu sein. Für jede abgeschlossene Weltzone erhältst du 1 Map-Credit, und jede Map kostet 1 Credit. Schließt du <b>Zone 100</b> mit dieser Challenge ab, kehrst du in deine ursprüngliche Dimension zurück. Doppeltes Prestige von Scientist IV wirkt während dieser Challenge nicht.',
            squaredDescription: 'Reise in eine Dimension mit wenigen Maps und lerne, einfallsreicher zu sein. Für jede abgeschlossene Weltzone erhältst du 1 Map-Credit, und jede Map kostet 1 Credit. <b>Doppeltes Prestige von Scientist IV und die Mastery Blacksmithery wirken nicht, solange diese Challenge aktiv ist.</b>'
        },
        Toxicity: {
            description: 'Reise in eine Dimension voller Helium, aber auch voller giftiger Gegner. Alle Gegner haben 5x Attack und 2x Health. Bei jedem Angriff auf einen Gegner verlieren deine Scruffies 5% ihrer Health, und es werden Giftstoffe frei, die das Zuwachstempo deiner Scruffies um 0.3% (des aktuellen Werts) senken, aber alle erhaltenen Ressourcen um 0.15% erhöhen (auch Helium), bis zu 1500-mal gestapelt. Die Stapel setzen sich zurück, wenn du eine Zone abschließt. Schließt du <b>Zone 165</b> mit dieser Challenge ab, erhältst du zusätzlich 400% des gesamten Heliums, das du in diesem Portal bis dahin verdient hast. Wiederholbar!',
            squaredDescription: 'Reise in eine Dimension voller Ruhm, den das Erlegen giftiger Gegner bringt. Alle Gegner haben 5x Attack und 2x Health. Bei jedem Angriff auf einen Gegner verlieren deine Scruffies 5% ihrer Health, und es werden Giftstoffe frei, die das Zuwachstempo deiner Scruffies um 0.3% (des aktuellen Werts) senken, aber alle gefundene Beute um 0.15% erhöhen, bis zu 1500-mal gestapelt. Die Stapel setzen sich zurück, wenn du eine Zone abschließt.'
        },
        Devastation: {
            description: 'Reise in eine raue Dimension, in der Scruffies für die Fehler früherer Generationen bestraft werden. Wird deine Armee getötet, trifft jeder überschüssige Schaden die nächste kämpfende Gruppe Scruffies mit 750%. Schließt du <b>Imploding Star (Zone 170)</b> ab, wird die Welt wieder normal.'
        },
        Watch: {
            description: 'Reise in eine seltsame Dimension, in der das Leben zugleich leichter und schwerer ist. Am Ende jeder Weltzone fallen alle verfügbaren Ausrüstungs-Upgrades, und alle freien Scruffies werden gleichmäßig auf Bauer, Holzfäller und Bergmann verteilt. Dafür werden Ressourcenproduktion und Beute aus allen Quellen halbiert, und alle Gegner verursachen 25% mehr Schaden. Schließt du <b>Zone 180</b> mit dieser Challenge ab, erhältst du zusätzlich 200% des gesamten Heliums, das du in diesem Portal bis dahin verdient hast.',
            squaredDescription: 'Reise in eine seltsame Dimension, in der das Leben zugleich leichter und schwerer ist. Am Ende jeder Weltzone fallen alle verfügbaren Ausrüstungs-Upgrades, und alle freien Scruffies werden gleichmäßig auf Bauer, Holzfäller und Bergmann verteilt. Dafür werden Ressourcenproduktion und Beute aus allen Quellen halbiert, und alle Gegner verursachen 25% mehr Schaden. Lehn dich zurück und lass die Scruffies das selbst regeln – du weißt, dass du es willst.'
        },
        Lead: {
            description: 'Reise in eine Dimension, in der das Leben je nach Zeit leichter oder schwerer ist. In ungeraden Zonen erhältst du aus allen Quellen doppelte Ressourcen, und deine Scruffies haben 50% zusätzliche Attack. Zu Beginn einer geraden Zone erhalten alle Gegner 200 Stapel <b>Momentum</b>. Jedes abgeschlossene Feld der Welt entfernt 1 Stapel; jeder Stapel erhöht Schaden und Health des Gegners um 4% und den Blockdurchschlag um 0.1%. Greifen deine Scruffies an, ohne ihr Ziel zu töten, verlieren sie je Gegnerstapel 0.03% ihrer Health. Schließt du <b>Zone 180</b> mit dieser Challenge ab, erhältst du zusätzlich 300% des gesamten Heliums, das du in diesem Portal bis dahin verdient hast.',
            squaredDescription: 'Reise in eine Dimension, in der das Leben je nach Zeit leichter oder schwerer ist. In ungeraden Zonen erhältst du aus allen Quellen doppelte Ressourcen, und deine Scruffies haben 50% zusätzliche Attack. Zu Beginn einer geraden Zone erhalten alle Gegner 200 Stapel <b>Momentum</b>. Jedes abgeschlossene Feld der Welt entfernt 1 Stapel; jeder Stapel erhöht Schaden und Health des Gegners um 4% und den Blockdurchschlag um 0.1%. Greifen deine Scruffies an, ohne ihr Ziel zu töten, verlieren sie je Gegnerstapel 0.03% ihrer Health.'
        },
        Domination: {
            description: 'Reise in eine Dimension, in der die stärksten Gegner Kraft aus den schwächeren ziehen. Die meisten Gegner haben 90% weniger Health und Attack, aber der letzte Gegner jeder Weltzone und Map verursacht 2.5x Schaden, hat 7.5x Health und heilt sich bei jedem Angriff auf deine Scruffies um 5%. Dafür lässt er dreimal so viel Helium fallen! Schließt du <b>Zone 215</b> ab, erhältst du außerdem weitere 100% des Heliums, das du in diesem Portal bis dahin aus allen Quellen verdient hast, und wirst sofort in deine normale Dimension zurückversetzt!'
        },
        Experience: {
            description: 'Fluffy erzählt dir von einer besonderen Dimension mit ein paar Sehenswürdigkeiten, die er gern sehen würde. Ab Z300 enthält jede Map auf Weltstufe oder höher mit 20% Wahrscheinlichkeit ein Wonder. Schließt du dieses Feld ab, erhält Fluffy Exp im Wert von 3 Zonen, aber Attack und Health der Gegner steigen für den Rest der Challenge um 15% (multiplikativ). Nach einem gefundenen Wonder lässt sich 5 Weltzonen lang kein weiteres finden. Die Challenge ist abgeschlossen, wenn du Bionic Wonderland XXXIII (L605) oder höher abschließt, während du in der Welt bei Z601 oder darüber bist, oder wenn du Z700 abschließt. Endet die Challenge, erhält Fluffy für jedes gesehene Wonder zusätzlich 5% aller während der Challenge verdienten Erfahrung, plus weitere 50% für jede in dieser Challenge abgeschlossene BW-Stufe über XXXIII (bis zu +350% für XL). Diese Challenge ist wiederholbar!'
        },
        Enlightened: {
            squaredDescription: 'Zwischen den Dimensionen Meditate und Discipline passen die Bedingungen genau, und das Portal lässt sich so einstellen, dass du beide zugleich besuchst! Die Regeln beider Challenges gelten, und dieser Challenge<sup>2</sup>-Durchlauf zählt für die höchste Zone und die C<sup>2</sup>-Boni von Discipline<sup>2</sup> und Meditate<sup>2</sup>. Zwei Squiddles mit einer Klappe!'
        },
        Paralysis: {
            squaredDescription: 'Ein weiteres Paar verträglicher Dimensionen wurde gefunden! Diesmal lässt sich das Portal so einstellen, dass du Electricity<sup>2</sup> und Slow<sup>2</sup> zugleich besuchst.' + both + ' Schockierend effizient!'
        },
        Nometal: {
            squaredDescription: 'Noch eine Kombi-Dimension wurde gefunden! Trotze der Dimension Nom<sup>2</sup> und gönn dir zugleich <strike>die Qual</strike> den Spaß von Metal<sup>2</sup>!' + both + ' Schmeckt nach Effizienz!'
        },
        Topology: {
            squaredDescription: 'Deine Forscher haben ein weiteres Paar kombinierbarer Dimensionen gefunden! Beweise dein Können mit Maps auf einem Abenteuer in den Dimensionen Balance<sup>2</sup> und Mapology<sup>2</sup> zugleich!' + both + ' Map-imale Effizienz!'
        },
        Waze: {
            squaredDescription: 'Ob du es glaubst oder nicht: Deine Forscher haben ein weiteres passendes Dimensionspaar entdeckt! Sieh staunend zu, wie sich deine riesigen Scruffies durch die Dimensionen Watch<sup>2</sup> und Size<sup>2</sup> zugleich bewegen!' + both + ' Eine riesige Zeitersparnis, die du selbst sehen willst!'
        },
        Toxad: {
            squaredDescription: 'Deine Forscher haben ein 6. passendes Dimensionspaar entdeckt! Führe deine Scruffies durch giftiges Gelände und zeig dem Universum, wer hier das Sagen hat, indem du dich den Dimensionen Toxicity<sup>2</sup> und Lead<sup>2</sup> zugleich stellst!' + both + ' Eine gefährlich gute Zeit.'
        },
        // Universe 2 (step 4c). Getters with a fixed text (Insanity, Berserk, Exterminate) are listed here as well.
        Unlucky: {
            description: 'Deine Scruffies kommen in diesem rauen Universum nicht weit, wenn sie nicht lernen, ihr Glück zu beherrschen. ' + unluckyRules + ' Schließt du <b>Dimension of Rage (Zone 15)</b> ab, ist diese Challenge abgeschlossen!',
            squaredDescription: unluckyRules
        },
        Downsize: {
            description: downsizeRules + ' Schließt du <b>Prismatic Palace (Zone 20)</b> ab, ist diese Challenge abgeschlossen!',
            squaredDescription: downsizeRules
        },
        Transmute: {
            description: transmuteRules + ' Schließt du <b>Zone 25</b> ab, ist diese Challenge abgeschlossen!',
            squaredDescription: transmuteRules
        },
        Unbalance: {
            description: 'Deine Forscher haben eine neue chaotische Dimension entdeckt! ' + unbalanceRules + ' Unbalance stapelt sich höchstens bis 500. Schließt du <b>Zone 35</b> ab, ist diese Challenge abgeschlossen!',
            squaredDescription: 'Reise in eine lustige chaotische Dimension! ' + unbalanceRules
        },
        'Bublé': {
            description: 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der Scruffies wirklich, wirklich ungern Schaden nehmen. Deine Scruffies beginnen in dieser Realität mit zusätzlichen 250% Prismatic Shield, doch sobald sie auch nur den geringsten Schaden an ihrer Health nehmen, weigern sie sich weiterzukämpfen, und die Challenge endet. Schließt du <b>Zone 40</b> ab, ohne zu scheitern, ist diese Challenge abgeschlossen, und du erhältst zusätzlich 500% des gesamten Radons, das du in diesem Portal bis dahin verdient hast. Scheiterst du an dieser Challenge, erhältst du zusätzlich 200% des gesamten Radons, das du in diesem Portal bis zu dieser Stelle verdient hast.'
        },
        Duel: {
            description: duelRules + ' Ein Team unter 20 Punkten erhält 10x Health, ein Team unter 10 Punkten greift immer zuerst an, und ein Team über 50 Punkten erhält 3x Schaden. Schließt du <b>Zone 45</b> ab, ist diese Challenge abgeschlossen!',
            squaredDescription: duelRules + ' Ein Team unter 20 Punkten erhält 10x Health, Gegner greifen zuerst an, wenn sie weniger als 10 Punkte haben (<b>Scruffies können in dieser Challenge im Challenge<sup>3</sup>-Modus nicht schnell werden!</b>), und ein Team über 50 Punkten erhält 3x Schaden.'
        },
        Melt: {
            description: 'Stimme das Portal so ab, dass es dich in eine andere Realität bringt, in der es reichlich Risiko und Radon gibt. Du erhältst 10x Beute (außer Radon), 10x Sammeln und 5x Attack für deine Scruffies, aber jede Sekunde kommt ein Stapel Melt hinzu. Jeder Stapel Melt senkt Beute, Sammeln und Attack deiner Scruffies um 1% des aktuellen Werts. Die Stapel setzen sich mit jeder abgeschlossenen Zone zurück und enden bei 500. Schließt du <b>Melting Point (Zone 50) <i>oder</i> Zone 55</b> ab, ist diese Challenge abgeschlossen, und du erhältst zusätzlich 400% des gesamten bis Z50 gesammelten Radons. Diese Challenge ist wiederholbar!'
        },
        Trappapalooza: {
            description: trappaRules + ' Also, na ja, pass darauf auf. Schließt du <b>Melting Point (Zone 50)</b> ab, ist diese Challenge abgeschlossen!',
            squaredDescription: trappaRules + ' Aber du weißt ja, dass du darauf aufpassen musst.'
        },
        Quagmire: {
            description: 'Reise in eine äußerst schlammige Dimension. Hier fällt das Gehen schwer, was Agility erschwert. Deine Scruffies beginnen jeden Durchlauf mit 100 Stapeln Motivated, die alle erhaltene Beute je Stapel um 40% erhöhen (auch Radon). Nach jeder Zone erhalten deine Scruffies 1 Stapel Exhausted, der ihren Schaden und ihr Zuwachstempo je Stapel in der Welt um 10% und in Maps um 5% senkt (multiplikativ). Je 10 Stapel Exhausted greifen deine Scruffies außerdem 100 ms langsamer an. Dazu kannst du eine besondere Map namens ‚The Black Bog‘ spielen, die immer mit der Zonenstufe skaliert und so furchterregend ist, dass dort keine Rare Kin erscheinen können. Schließt du ‚The Black Bog‘ ab, verlieren deine Scruffies 1 Stapel Exhausted, aber auch 1 Stapel Motivated. Stapel Exhausted können negativ werden und erhöhen dann Schaden und Zuwachstempo. Schließt du Z70 ab oder fällt Motivated auf 0 Stapel, während diese Challenge aktiv ist, endet die Challenge, und die Welt wird wieder normal. Endet die Challenge mit dem Abschluss von Z70, erhältst du zusätzlich 250% des gesamten verdienten Radons.'
        },
        Wither: {
            description: witherRules + ' Schließt du <b>Zone 70</b> ab, ist diese Challenge abgeschlossen.'
        },
        Revenge: {
            description: 'Reise in eine außergewöhnlich raue Dimension voller rachsüchtiger Kreaturen, die Scruffies eingeschlossen. Gegner haben in Zonen mit gerader Nummer 10x Health. Wird deine Armee getötet, trifft jeder überschüssige Schaden die nächste kämpfende Gruppe Scruffies mit 750%. Jedes Mal, wenn eine Gruppe Scruffies durch diesen überschüssigen Schaden stirbt, erhalten deine Scruffies einen Stapel ‚Revenge‘, der ihre Attack und Health um 20% (additiv) erhöht. Erreichen deine Scruffies jedoch jemals 20 Stapel Revenge, scheiterst du sofort an der Challenge. Schließt du <b>Zone 80</b> mit weniger als 20 Stapeln Revenge ab, ist diese Challenge abgeschlossen.'
        },
        Quest: {
            description: questRules('Z6', 'ab Zone 6 in jeder Zone eine zufällige Quest.') + ' Schließt du <b>Zone 85</b> ab, ist diese Challenge abgeschlossen, und die Attack der Scruffies und die Health der Gegner werden wieder normal.'
        },
        Archaeology: {
            description: 'Reise in eine Dimension mit vielen vergrabenen Relikten. Zu Beginn dieser Challenge erhältst du Zugang zu 5 besonderen neuen Upgrades namens Relikte: Vier erhöhen multiplikativ deine Attack, dein Zuwachstempo, dein Radon und deinen Ressourcengewinn (Nahrung, Holz, Metall, Wissenschaft und Edelsteine), eines senkt die Attack der Gegner. Alle diese Upgrades kosten Wissenschaft und werden teurer, sobald eines von ihnen gekauft wird. Die Relikte für Attack, Zuwachstempo, Radon, Ressourcengewinn und Gegner-Health verlieren jedoch in jeder Zone 1 Reliktstufe und können negativ werden. Alle Radon-Funde haben in dieser Dimension einen Grundbonus von +200%. Schließt du <b>Z90</b> mit dieser Challenge ab, erhältst du zusätzlich +500% des gesamten verdienten Radons. Nach dem ersten Abschluss dieser Challenge kannst du Maps mit kleinen und großen Research Caches erstellen! Nach dem zweiten Abschluss schaltest du eine starke Anpassung für AutoGold frei.'
        },
        Insanity: {
            description: 'Reise in eine Dimension, in der Instabilität den Verstand übernimmt. In Maps über deiner Weltstufe kann in jedem Feld ein Dreadle erscheinen; die Wahrscheinlichkeit hängt von der tatsächlichen Stufe der Map und von ihrer Stufe im Vergleich zu deiner aktuellen Weltzone ab. Dreadles sind stärker als gewöhnliche Gegner und geben dir, wenn sie getötet werden, einen Stapel Insanity. Höchstens 500 Stapel sind möglich. Insanity senkt deine Health um 1% (multiplikativ), erhöht aber alle erhaltenen Ressourcen (auch Radon) um 13.133% (additiv). Jede gespielte Map (n Stufen unter der Weltstufe) senkt deine aktuelle Insanity um 2n und deine maximale Insanity um n. Die Challenge endet nach dem Abschluss von Z110. Für den Abschluss dieser Challenge erhältst du zusätzlich 500% des gesamten verdienten Radons und ein Gefühl tiefer Zufriedenheit.'
        },
        Berserk: {
            description: berserkRules + ' Wegen der lästigen Art dieser Dimension wirkt die Mastery Angelic nicht. Schließt du Z115 ab, wird deine Welt wieder normal.',
            squaredDescription: berserkRules + ' Wegen der lästigen Art dieser Dimension wirken die Mastery Angelic und der Perk Frenzy nicht.'
        },
        Exterminate: {
            description: 'Reise in eine Dimension voller fieser Käfer. Alle gewöhnlichen Gegner der Welt sind schnelle Käfer mit viel Attack und wenig Health. Tötet eine Gruppe Scruffies einen Käfer, wird diese Gruppe bis zu ihrem Tod Experienced und greift dadurch schnelle Gegner zuerst an. Wer aber Zeit in Maps vertrödelt, lässt den Schwarm wachsen: Jede in diesem Universum gestartete Map gibt allen Gegnern der Welt dauerhaft +50% Attack und Health (additiv). Schließt du Z120 mit dieser Challenge ab, schaltest du ein besonderes neues Gebäude frei!'
        },
        Hypothermia: {
            description: 'Reise in eine Dimension, in der Wärme kaum zu finden ist. Jedes Mal, wenn du eine neue Zone mit genug Holz beginnst, bauen deine Scruffies automatisch ein Bonfire, das je Zone und aktivem Bonfire 1 Stapel Ember erzeugt. Stapel Ember erhöhen das verdiente Radon um +300% (additiv) und die Werte der Gegner um 3% (multiplikativ). Stapel Ember senken gesammeltes und erbeutetes Holz in der Welt um 5% (multiplikativ), in Maps nur, solange gerade ein Bonfire brennt. Jedes Bonfire brennt 5 Zonen lang, bevor es erlischt, aber nur 1 erlischt alle 5 Zonen. Die für ein Bonfire nötige Holzmenge steigt mit jedem gebauten Bonfire. Außerdem ist die Luft so kalt, dass die Tür deines Schiffs zugefroren ist: Solange diese Challenge aktiv ist, lassen sich Perks nicht ändern. Schließt du <b>Frozen Castle</b> mit dieser Challenge ab, erhältst du zusätzlich 400% des gesamten Radons, das du in diesem Portal bis dahin verdient hast, und die Welt wird wieder normal. Schließt du Z200 ab, ohne Frozen Castle abzuschließen, scheiterst du an der Challenge. Der erste Abschluss dieser Challenge schaltet einen neuen Perk frei!'
        }
    };
    // Getters with changing values (Scientist, Corrupted, Frigid, Obliterated, Eradicated): their English result is matched.
    const scientist = (start, extra) => 'Attempt modifying the portal to ' + start + '. Until you perfect the technique, you will start with <b>_</b> science but will be unable to research or hire scientists' + extra + ". Choose your upgrades wisely! Clearing <b>'The Block' (11)</b> with this challenge active will cause you to * each time you use your portal.";
    const scientistDe = (start, extra) => 'Versuche, das Portal so umzubauen, dass es ' + start + '. Bis du die Technik beherrschst, beginnst du mit <b>_</b> Wissenschaft, kannst aber weder forschen noch Forscher einstellen' + extra + '. Wähle deine Upgrades mit Bedacht! Schließt du <b>‚The Block‘ (11)</b> mit dieser Challenge ab, gilt künftig bei jedem Portal: *.';
    const getters = [
        template(scientist('harvest resources when travelling', ''), scientistDe('auf Reisen Ressourcen erntet', '')),
        template(scientist('retain positive qualities from previous dimensions', " and <b style='color: maroon'>all enemy damage will be 10X higher</b>"),
            scientistDe('positive Eigenschaften früherer Dimensionen bewahrt', ", und <b style='color: maroon'>aller Schaden der Gegner ist 10x höher</b>")),
        template('Travel to a dimension where enemies have 3X attack and Corruption runs rampant, beginning at Z60. The Corruption in this dimension grants helium, but 50% less than normal. Improbabilities and Void Maps will still not gain strength or double reward until Z{}. Completing <b>Zone 190</b> with this challenge active will reward you with an extra 200% helium earned from any source during this portal up to that point, and will instantly transport you back to your normal dimension.',
            'Reise in eine Dimension, in der Gegner 3x Attack haben und Corruption ab Z60 wuchert. Die Corruption dieser Dimension bringt Helium, aber 50% weniger als normal. Oddities und Void Maps werden trotzdem erst ab Z{0} stärker und bringen erst dann doppelte Belohnung. Schließt du <b>Zone 190</b> mit dieser Challenge ab, erhältst du zusätzlich 200% des Heliums, das du in diesem Portal bis dahin aus allen Quellen verdient hast, und kehrst sofort in deine normale Dimension zurück.'),
        template('Travel to a frighteningly cold dimension where Trimps usually cannot crit. If a World enemy deals 20% damage to your Trimps in one hit, your Trimps will shatter and instantly die, and shards of ice will lower gathering speed by 1% (compounding). Completing a Void Map will grant your Trimps 1 stack of Warmth per map for each 10 levels of Void Map completed (50 stacks for a Z500 Void Map), which will clear all stacks of Shattering, protect your Trimps from Shattering stacks and allow them to Crit for that many World or Map cells (stacks do not decrease in Void Maps).  Completing <b>Z{}</b> with this Challenge active will grant your Trimps a permanent, stacking, additive <b>{}%</b> bonus to Helium, Trimp Attack, Trimp Health, and Fluffy Experience. Each time Frigid is completed, the reward for next time increases by an additional 2.5%, Frigid enemies will gain 10x Attack and Health, and Trimps gain 5% fewer stacks of Warmth for completing Void Maps. <b>You have completed Frigid {} / {} maximum times. Your Trimps have +{}% Attack, Health, Helium, and Fluffy Experience, and your next run of Frigid will spawn Bad Guys with {}x Attack and Health.',
            'Reise in eine erschreckend kalte Dimension, in der Scruffies normalerweise keine kritischen Treffer landen. Fügt ein Gegner der Welt deinen Scruffies mit 1 Treffer 20% Schaden zu, zerspringen sie und sterben sofort, und Eissplitter senken das Sammeltempo um 1% (multiplikativ). Jede abgeschlossene Void Map gibt deinen Scruffies je 10 Stufen der Void Map 1 Stapel Warmth (50 Stapel für eine Void Map in Z500). Warmth entfernt alle Stapel Shattering, schützt deine Scruffies vor neuen Shattering-Stapeln und lässt sie für ebenso viele Felder in Welt oder Maps kritisch treffen (in Void Maps sinken die Stapel nicht). Schließt du <b>Z{0}</b> mit dieser Challenge ab, erhalten deine Scruffies einen dauerhaften, stapelbaren, additiven Bonus von <b>{1}%</b> auf Helium, Attack und Health der Scruffies sowie Fluffy-Erfahrung. Mit jedem Abschluss von Frigid steigt die Belohnung für das nächste Mal um weitere 2.5%, Gegner in Frigid erhalten 10x Attack und Health, und Scruffies bekommen für abgeschlossene Void Maps 5% weniger Stapel Warmth. <b>Du hast Frigid {2} von höchstens {3} Mal abgeschlossen. Deine Scruffies haben +{4}% Attack, Health, Helium und Fluffy-Erfahrung, und in deinem nächsten Frigid-Durchlauf erscheinen Gegner mit {5}x Attack und Health.'),
        template("Against your better judgement, travel to a dimension that's simply just not very friendly. Liquimps are unable to liquify, enemies have {}x attack and health, and equipment is {}x more expensive. Every 10 Zones, enemy attack and health will increase by another 10x.",
            'Reise wider besseres Wissen in eine Dimension, die einfach nicht sehr freundlich ist. Ripplekins können sich nicht verflüssigen, Gegner haben {0}x Attack und Health, und Ausrüstung ist {1}x teurer. Alle 10 Zonen steigen Attack und Health der Gegner nochmals auf das 10-Fache.'),
        template("If you thought Obliterated was not very friendly, wait until you see this dimension! Liquimps are unable to liquify, enemies have {}x attack and health, and equipment is {}x more expensive. Every 2 Zones, enemy attack and health will increase by another {}x. <b>However, you'll earn 1 extra Coordination per Zone you clear for the first 100 Zones! Oh and Magma, Corruption, and Nature start at Z1.</b>",
            'Wenn du Obliterated schon unfreundlich fandest, warte ab, bis du diese Dimension siehst! Ripplekins können sich nicht verflüssigen, Gegner haben {0}x Attack und Health, und Ausrüstung ist {1}x teurer. Alle 2 Zonen steigen Attack und Health der Gegner nochmals auf das {2}-Fache. <b>Dafür erhältst du in den ersten 100 Zonen für jede abgeschlossene Zone 1 zusätzliche Koordination! Ach ja, Magma, Corruption und Nature beginnen bei Z1.</b>')
    ];
    // Getters of Universe 2 (step 4c), one template per branch of the original. Mayhem, Pandemonium and Desolation may
    // start with a NOTICE line (see notice below), which is translated on its own.
    const witherEn = "Travel to an ultra scary alternate reality with horrific Bad Guys. Enemies heal for 25% of their maximum health before each attack. If an enemy ever heals itself back to 100% health, your army will fall to despair and instantly wither away. Every enemy slain by your Trimps in the World or World-level Maps grants 1 stack of Hardness to your Trimps (stacking up to 10,000 and increasing Health by 0.1% per stack) and 1 stack of Horror to all enemies (increasing Attack by 0.05% per stack). Whenever a group of Trimps is killed by Wither, Trimps lose half of their stacks of Hardness and block the enemy's ability to heal and Wither for an amount of cells equal to 10% of the Hardness stacks lost. Plaguebringer";
    const stormEn = 'Travel to a dimension that storms year-round. Trimps gain Static stacks after every attack, damaging them for {}% of their max health per stack. Enemies gain Cloudy stacks after every attack. Every {} Cloudy stacks creates a Storm Cloud on that enemy, causing them to gain max health and damage but take extra damage from Gamma Bursts. When a Bad Guy dies, any Storm Clouds it had before dying are transferred to the next Bad Guy in the form of Cloudy stacks. In maps, Cloudy stacks cannot accrue and Storm Clouds have no effect, but Trimps have -0.05% attack per Cloudy stack on the enemy. Defeating an enemy in a map will remove 1 Cloudy stack.';
    const stormDe = 'Reise in eine Dimension, in der das ganze Jahr über Sturm herrscht. Scruffies erhalten nach jedem Angriff Stapel Static, die ihnen je Stapel {0}% ihrer maximalen Health als Schaden zufügen. Gegner erhalten nach jedem Angriff Stapel Cloudy. Je {1} Stapel Cloudy bilden über diesem Gegner eine Sturmwolke, durch die er maximale Health und Schaden gewinnt, aber durch Gamma Bursts zusätzlichen Schaden nimmt. Stirbt ein Gegner, gehen alle Sturmwolken, die er vor seinem Tod hatte, als Stapel Cloudy auf den nächsten Gegner über. In Maps sammeln sich keine Stapel Cloudy, und Sturmwolken wirken nicht, aber Scruffies haben je Stapel Cloudy auf dem Gegner -0.05% Attack. Jeder in einer Map besiegte Gegner entfernt 1 Stapel Cloudy.';
    const stormEnd = ' Completing <b>Z105</b> with this Challenge active will return the Dimension to normal', stormEndDe = ' Schließt du <b>Z105</b> mit dieser Challenge ab, wird die Dimension wieder normal';
    const nurtureEn = "Travel to a dimension filled with gigantic monsters. All enemies have 2x attack, World enemies have 2x health and map enemies have 10x health. Luckily, Scruffy has a brother in this dimension who will help you out if you level him up! You'll gain access to the special Laboratory building while on this challenge, which will give bonus Exp to Scruffy's brother, Cruffys. Check the Scruffy and Laboratory tooltips while on this Challenge for more info. Clearing <b>Z135</b> with this Challenge active will grant an additional 400% of all Radon earned during this portal up until that point, and will (mostly) return the world to normal.";
    const nurtureDe = 'Reise in eine Dimension voller riesiger Monster. Alle Gegner haben 2x Attack, Gegner der Welt 2x Health und Gegner in Maps 10x Health. Zum Glück hat Scruffy in dieser Dimension einen Bruder, der dir hilft, wenn du ihn aufsteigen lässt! Während dieser Challenge hast du Zugang zum besonderen Gebäude Labor, das Scruffys Bruder Cruffys zusätzliche Exp gibt. Mehr dazu während dieser Challenge in den Info-Fenstern von Scruffy und Labor. Schließt du <b>Z135</b> mit dieser Challenge ab, erhältst du zusätzlich 400% des gesamten Radons, das du in diesem Portal bis dahin verdient hast, und die Welt wird (größtenteils) wieder normal.';
    const alchemyEn = 'Travel to a dimension where maps are filled with useful herbs. Collect different herbs from different types of maps, and use Alchemy to create powerful potions to strengthen your Trimps. Clearing <b>Z155</b> with this Challenge active will grant an additional 400% of all Radon earned during this portal up until that point, and will return the world to normal. You can repeat this challenge!';
    const alchemyDe = 'Reise in eine Dimension, in der Maps voller nützlicher Kräuter sind. Sammle verschiedene Kräuter aus verschiedenen Map-Typen und braue mit Alchemy mächtige Tränke, die deine Scruffies stärken. Schließt du <b>Z155</b> mit dieser Challenge ab, erhältst du zusätzlich 400% des gesamten Radons, das du in diesem Portal bis dahin verdient hast, und die Welt wird wieder normal. Diese Challenge ist wiederholbar!';
    const mayhemEn = "Travel to a very hectic dimension. The final Cell of each Zone is a Poisonous boss enemy, and all Map enemies are also Poisonous. Poisonous Enemies stack 20% of their damage on your Trimps as poison, which is taken as damage after each attack until your Trimps die. Each Zone starts with {} stacks of Mayhem, and each stack increases the damage and health of the final Cell Boss Enemy for that Zone by 10%. Completing a map at world level or above reduces the Mayhem stacks for that Zone by 1 and an additional 1 for each level of the Map above the Zone's level (For example, a level 15 map will remove 3 stacks per completion when at Z13). Completing <b>Z100</b> with this Challenge active will grant your Trimps a permanent, stacking, additive <b>{}%</b> bonus to Radon or Helium, and Trimp Attack and Health in Universes 1 and 2. Each time Mayhem is completed, the reward for next time increases by an additional 10% and Enemies gain 3x damage and health for all future runs of Mayhem. The amount of Mayhem stacks that each Zone starts with is always equal to 1000 minus 5 for each highest Zone cleared above Z100 in this Universe (You have cleared Z{} and start each Zone with {} stacks) <b>You have completed Mayhem {} / {} maximum times. Your Trimps have +{}% Attack, Health, and Helium or Radon, and your next run of Mayhem will spawn Bad Guys with {}x Attack and Health.</b>";
    const mayhemDe = 'Reise in eine sehr hektische Dimension. Das letzte Feld jeder Zone ist ein giftiger Boss-Gegner, und auch alle Gegner in Maps sind giftig. Giftige Gegner stapeln 20% ihres Schadens als Gift auf deine Scruffies, das nach jedem Angriff als Schaden wirkt, bis deine Scruffies sterben. Jede Zone beginnt mit {0} Stapeln Mayhem, und jeder Stapel erhöht Schaden und Health des Boss-Gegners im letzten Feld dieser Zone um 10%. Jede abgeschlossene Map auf Weltstufe oder höher senkt die Stapel Mayhem dieser Zone um 1 und um 1 weiteren für jede Stufe, die die Map über der Zone liegt (eine Map der Stufe 15 entfernt in Z13 zum Beispiel 3 Stapel je Abschluss). Schließt du <b>Z100</b> mit dieser Challenge ab, erhalten deine Scruffies einen dauerhaften, stapelbaren, additiven Bonus von <b>{1}%</b> auf Radon bzw. Helium sowie Attack und Health der Scruffies in Universum 1 und 2. Mit jedem Abschluss von Mayhem steigt die Belohnung für das nächste Mal um weitere 10%, und Gegner erhalten für alle künftigen Mayhem-Durchläufe 3x Schaden und Health. Die Zahl der Stapel Mayhem zu Beginn jeder Zone beträgt immer 1000 minus 5 für jede höchste abgeschlossene Zone über Z100 in diesem Universum (du hast Z{2} abgeschlossen und beginnst jede Zone mit {3} Stapeln). <b>Du hast Mayhem {4} von höchstens {5} Mal abgeschlossen. Deine Scruffies haben +{6}% Attack, Health und Helium bzw. Radon, und in deinem nächsten Mayhem-Durchlauf erscheinen Gegner mit {7}x Attack und Health.</b>';
    const pandEn = "Travel to a chaotically windy dimension. Map enemies at or below World level will obliterate 75% of your Metal, Wood and Food after each enemy killed. For each map level above world level, 5% (additively) fewer resources will be destroyed, with +10 map enemies destroying only 25%. You start the Challenge with 100 stacks of Order. Each Zone, 10% of your current Order stacks will be converted into Pandemonium stacks on the Enemy. Each Pandemonium stack increases Enemy's attack and health by 100% per stack, and has 10x effect on the final boss of each Zone. The final boss is a Windy enemy who will blow away 1% of your Food, Wood and Metal per stack of Pandemonium per attack. Completing a map grants you 1 Order stack for each level above your World Zone (Max 100), and reduces enemy Pandemonium by the same amount. Completing <b>Z150</b> with this Challenge active will grant your Trimps a permanent, stacking, additive <b>{}%</b> bonus to Helium or Radon, Trimp Attack, Trimp Health, and Resources Gathered in Universe 1 and 2. Each time Pandemonium is completed, the reward for next time increases by an additional 10%, Enemies gain 5x damage and health, and Equipment is 5x more expensive for all future runs of Pandemonium. Starting on your fourth run, the Wind will be too strong for Trimps to hold a Shield. Another piece of equipment will be disabled every 2 completions after Shield is lost. Bone Charges can be gained but not spent during this Challenge. <b>You have completed Pandemonium {} / {} maximum times. Your Trimps have +{}% Attack, Health, Radon or Helium, and gathered resources in U1 and U2, and your next run of Pandemonium will spawn Bad Guys with {}x Attack and Health";
    const pandDe = 'Reise in eine chaotisch windige Dimension. Gegner in Maps auf oder unter der Weltstufe vernichten nach jedem getöteten Gegner 75% deiner Vorräte an Metall, Holz und Nahrung. Je Map-Stufe über der Weltstufe wird 5% (additiv) weniger vernichtet; Gegner in Maps mit +10 vernichten nur noch 25%. Du beginnst die Challenge mit 100 Stapeln Order. In jeder Zone werden 10% deiner aktuellen Stapel Order zu Stapeln Pandemonium auf dem Gegner. Jeder Stapel Pandemonium erhöht Attack und Health des Gegners um 100% und wirkt beim letzten Boss jeder Zone 10x so stark. Der letzte Boss ist ein windiger Gegner, der je Stapel Pandemonium und Angriff 1% deiner Vorräte an Nahrung, Holz und Metall wegweht. Jede abgeschlossene Map gibt dir 1 Stapel Order für jede Stufe über deiner Weltzone (höchstens 100) und senkt das Pandemonium des Gegners um denselben Wert. Schließt du <b>Z150</b> mit dieser Challenge ab, erhalten deine Scruffies einen dauerhaften, stapelbaren, additiven Bonus von <b>{0}%</b> auf Helium bzw. Radon, Attack und Health der Scruffies sowie gesammelte Ressourcen in Universum 1 und 2. Mit jedem Abschluss von Pandemonium steigt die Belohnung für das nächste Mal um weitere 10%, und für alle künftigen Pandemonium-Durchläufe erhalten Gegner 5x Schaden und Health, und Ausrüstung wird 5x teurer. Ab deinem vierten Durchlauf ist der Wind zu stark, als dass Scruffies einen Schild halten könnten. Nach dem Verlust des Schilds fällt alle 2 Abschlüsse ein weiteres Ausrüstungsteil weg. Bone Charges kannst du während dieser Challenge erhalten, aber nicht ausgeben. <b>Du hast Pandemonium {1} von höchstens {2} Mal abgeschlossen. Deine Scruffies haben in U1 und U2 +{3}% Attack, Health, Radon bzw. Helium und gesammelte Ressourcen, und in deinem nächsten Pandemonium-Durchlauf erscheinen Gegner mit {4}x Attack und Health';
    const pand = (...v) => pandDe.replace(/\{(\d)\}/g, (m, i) => v[i]);
    const desoEn = "Travel to a bitterly cold dimension. Every completed Zone reduces the temperature of the world, lowering your Trimps' attack, health, and resources (gathered and looted) by <b>{}%</b>. The enemies in this dimension are even colder and will apply a stack of Chilled with every attack they land. Upon death Bad Guys explode, dealing 5x their attack in damage and applying another 20 stacks of Chilled to your Trimps. Each stack of Chilled reduces your Trimps' attack by 0.2% and their health by 0.1%. Fortunately maps are still nice and warm in this dimension, and attacking map enemies at world level or above will cause 1 stack of Chilled to be lost, plus another stack for each map level above world level. Additionally, if a map above world level is cleared, 1% of all Chilled stacks will be cleared for each level. Completing <b>Z{}</b> with this Challenge active will grant your Trimps a permanent, stacking, additive <b>{}%</b> bonus to Helium or Radon, Trimp Attack, Trimp Health, Resources Gathered, <b>and Mutated Seeds earned</b> in Universe 1 and 2. Each time Desolation is completed, the reward for next time increases by an additional 10%, 2 more Zones will need to be completed for all future runs of Desolation, and Desolation enemies will gain 10x Attack and Health, and the Trimp stat reduction for each completed Zone increases by 0.2%. <b>You have completed Desolation {} / {} maximum times. Your Trimps have +{}% Attack, Health, Radon or Helium, gathered resources, and Mutated Seeds in U1 and U2, and your next run of Desolation will spawn Bad Guys with {}x Attack and Health";
    const desoDe = 'Reise in eine bitterkalte Dimension. Jede abgeschlossene Zone senkt die Temperatur der Welt und damit Attack, Health und Ressourcen (gesammelt und erbeutet) deiner Scruffies um <b>{0}%</b>. Die Gegner dieser Dimension sind noch kälter und legen mit jedem Treffer einen Stapel Chilled auf. Beim Tod explodieren Gegner, verursachen Schaden in Höhe ihrer 5-fachen Attack und legen deinen Scruffies weitere 20 Stapel Chilled auf. Jeder Stapel Chilled senkt die Attack deiner Scruffies um 0.2% und ihre Health um 0.1%. Zum Glück sind Maps in dieser Dimension noch schön warm: Greifst du Gegner in Maps auf Weltstufe oder höher an, verlierst du 1 Stapel Chilled plus einen weiteren für jede Map-Stufe über der Weltstufe. Wird außerdem eine Map über der Weltstufe abgeschlossen, verschwinden je Stufe 1% aller Stapel Chilled. Schließt du <b>Z{1}</b> mit dieser Challenge ab, erhalten deine Scruffies einen dauerhaften, stapelbaren, additiven Bonus von <b>{2}%</b> auf Helium bzw. Radon, Attack und Health der Scruffies, gesammelte Ressourcen <b>und verdiente Mutated Seeds</b> in Universum 1 und 2. Mit jedem Abschluss von Desolation steigt die Belohnung für das nächste Mal um weitere 10%, alle künftigen Desolation-Durchläufe brauchen 2 abgeschlossene Zonen mehr, Gegner in Desolation erhalten 10x Attack und Health, und die Senkung der Scruffy-Werte je abgeschlossener Zone steigt um 0.2%. <b>Du hast Desolation {3} von höchstens {4} Mal abgeschlossen. Deine Scruffies haben in U1 und U2 +{5}% Attack, Health, Radon bzw. Helium, gesammelte Ressourcen und Mutated Seeds, und in deinem nächsten Desolation-Durchlauf erscheinen Gegner mit {6}x Attack und Health';
    const glassEn = n => "Travel to a dimension with fragile but dangerous Enemies. All Bad Guys are Fast and have x100 Attack. Hitting a Bad Guy without killing it creates a stack of Glass. Each Glass stack increases the base Enemy Attack multiplier by +1x. Every 100 Glass, Enemy Attack and Health doubles. Every " + n + " Glass, Enemies gain a Crystallized stack and Glass stacks reset to 0. Each Crystallized stack reduces Enemy Health by 20% (compounding) but also gives them a 10% chance to reflect an attack, and reaching 10 Crystallized stacks fails this Challenge. Killing an Enemy at or above World level removes two stacks of Glass plus one for every Crystallized stack on the Enemy, but Crystallized can never be removed.";
    const smithEn = n => "Travel to a dimension that is severely lacking in skilled Metalworkers. While in this dimension, you'll be unable to construct your own Smithies! On the first cell of every 25th Zone is an Ubersmith with " + n + "x Health, and Ubersmiths are always fast. After being attacked 10 times, the Ubersmith will transform back into a regular World enemy with normal health. However, your Trimps will gain 1 stack of Enhanced Armor if they removed 0.0001% of the Ubersmith's health, another stack for 1%, and a third stack if they kill the Ubersmith. Each stack of Enhanced Armor grants 25% (compounding) Health and Attack to your Trimps while they remain in the Universe.";
    getters.push(
        template(witherEn + ' is disabled during Wither<sup>3</sup>', witherRules + ' Plaguebringer ist während Wither<sup>3</sup> deaktiviert.'),
        template(witherEn + ' and Overkill are disabled during Wither<sup>3</sup>', witherRules + ' Plaguebringer und Overkill sind während Wither<sup>3</sup> deaktiviert.'),
        template("Travel to an alternate reality where Trimps really love questing. Enemies in this reality gain 10% extra health each zone starting at Z{} (compounding). However, you'll also get a random Quest each Zone starting at the same Zone. Your Quest start Zone is always equal to your highest Zone on C3 minus 80, but never lower than 6. Completing this quest will grant a 2x Radon multiplier for the rest of the Zone (does not stack), and will increase your Trimps' attack by 10% for the rest of the Challenge (compounding). Check messages or the Zone info tooltip for quest progress.",
            zone => questRules('Z' + zone, 'ab derselben Zone in jeder Zone eine zufällige Quest. Deine Startzone für Quests ist immer deine höchste Zone in C3 minus 80, aber nie niedriger als 6.')),
        template(mayhemEn, mayhemDe),
        template(stormEn, stormDe),
        template(stormEn + stormEnd + '.', stormDe + stormEndDe + '.'),
        template(stormEn + stormEnd + ' and reward you with a brand new building to help with the weather!', stormDe + stormEndDe + ', und du erhältst ein brandneues Gebäude, das dir mit dem Wetter hilft!'),
        template(nurtureEn, nurtureDe),
        template(nurtureEn + ' <b>Complete this Challenge with Cruffys at Level 10 or higher to earn a new Perk!</b>', nurtureDe + ' <b>Schließe diese Challenge mit Cruffys auf Level 10 oder höher ab, um einen neuen Perk zu erhalten!</b>'),
        template(pandEn + ' and all Equipment will be {}x more expensive.</b>', (...v) => pand(...v) + ' und alle Ausrüstung ist ' + v[5] + 'x teurer.</b>'),
        template(pandEn + ', all Equipment will be {}x more expensive, and the first {} Equipment{} will be disabled.</b>',
            (...v) => pand(...v) + ', alle Ausrüstung ist ' + v[5] + 'x teurer, und ' + (v[7] ? 'die ersten ' + v[6] + ' Ausrüstungsteile sind' : 'das erste Ausrüstungsteil ist') + ' deaktiviert.</b>'),
        template(alchemyEn, alchemyDe),
        template(alchemyEn + ' <b>Complete this Challenge once to unlock the ability to create a brand new type of map that should greatly aid your Alchemy.</b>', alchemyDe + ' <b>Schließe diese Challenge einmal ab, um eine brandneue Art von Map erstellen zu können, die deiner Alchemy sehr helfen dürfte.</b>'),
        template(glassEn('{}') + ' Completing <b>Z175</b> with this Challenge active will permanently cause all Radon earned to be increased by 10% (compounding) per Zone between Z175 and the Glass ceiling at Z400.',
            n => glassRules(n) + ' Schließt du <b>Z175</b> mit dieser Challenge ab, steigt alles verdiente Radon dauerhaft um 10% (multiplikativ) je Zone zwischen Z175 und der Glasdecke bei Z400.'),
        template(glassEn('{}'), glassRules),
        template(smithEn('{}') + ' Completing <b>Zone 200</b> will return you to your normal dimension where you can once again construct Smithies.',
            n => smithRules(n) + ' Schließt du <b>Zone 200</b> ab, kehrst du in deine normale Dimension zurück und kannst wieder Rüstschmieden bauen.'),
        template(smithEn('{}'), smithRules),
        template(desoEn, desoDe)
    );
    // "You have already completed X N times" before the rules of Mayhem, Pandemonium and Desolation.
    const notice = /^<b>NOTICE: You have already completed (\S+) (\d+) times, and will no longer gain a bonus for future runs\.<\/b><br\/?>/;
    const noticeDe = (_, name, n) => '<b>HINWEIS: Du hast ' + name + ' schon ' + times(n) + ' abgeschlossen und erhältst für künftige Durchläufe keinen Bonus mehr.</b><br/>';
    // unlockString of both universes completes "Du schaltest diese Challenge frei, sobald du …" (selectChallenge).
    const unlocks = {'have 30 total Helium': 'insgesamt 30 Helium hast', "clear 'The Prison' at Zone 80": '‚The Prison‘ in Zone 80 abschließt',
        'reach 4500% Challenge<sup>2</sup> bonus': 'einen Challenge<sup>2</sup>-Bonus von 4500% erreichst'};
    function unlock(value) {
        if (Object.hasOwn(unlocks, value)) return unlocks[value];
        const zone = value.match(/^ ?reach Zone (\d+)\.?$/);
        return zone ? 'Zone ' + zone[1] + ' erreichst' : null;
    }
    function german(key, field, english) {
        if (typeof english !== 'string') return null;
        if (field === 'unlockString') return unlock(english);
        if (key === 'Daily') return field === 'description' ? dailyFramed(english) : null;
        const own = texts[key]?.[field];
        if (typeof own === 'string') return own;
        const branded = brand(english), head = branded.match(notice), body = head ? branded.slice(head[0].length) : branded;
        for (const [pattern, replace] of getters) { const match = body.match(pattern); if (match) return (head ? noticeDe(...head) : '') + replace(...match); }
        return null;
    }
    // Rewards of Scientist (getScientistInfo in main.js), branded; German as a sentence after "gilt bei jedem Portal: ".
    const scientistRewards = [
        ['start with 5000 Science, 100 Food, 100 Wood, 10 Traps, and 1 Foreman', 'Du beginnst mit 5000 Wissenschaft, 100 Nahrung, 100 Holz, 10 Fallen und 1 Vorarbeiter'],
        ['start with 5000 Science, 100 Food, 100 Wood, 10 Traps', 'Du beginnst mit 5000 Wissenschaft, 100 Nahrung, 100 Holz und 10 Fallen'],
        ['start with 5 Barns, 5 Sheds, 5 Forges, and T2 Equipment unlocked', 'Du beginnst mit 5 Scheunen, 5 Schuppen, 5 Schmieden und freigeschalteter T2-Ausrüstung'],
        ['start with full Trimps and 200% player efficiency', 'Du beginnst mit vollen Scruffies und 200% Spielereffizienz'],
        ['earn two levels of each prestige upgrade per map, unlock AutoPrestiges, and your Warpstations will build instantly, skipping the queue. This bonus will apply',
            'Du erhältst je Map zwei Stufen jedes Prestige-Upgrades, schaltest AutoPrestiges frei, und deine Warpstations werden sofort ohne Bauliste gebaut'],
        ['earn two levels of each prestige upgrade per map. This bonus will apply', 'Du erhältst je Map zwei Stufen jedes Prestige-Upgrades'],
        ...['Helium', 'Radon'].map(kind => ['permanently increase all ' + kind + ' found by 0.5% per zone (compounding). You\'ll also start with 1000% player efficiency and 50 Barns, Sheds, and Forges',
            'Alles gefundene ' + kind + ' steigt dauerhaft um 0.5% je Zone (multiplikativ). Außerdem beginnst du mit 1000% Spielereffizienz und je 50 Scheunen, Schuppen und Schmieden'])
    ].map(([english, de]) => [brand(english), de]);
    const reward = english => (scientistRewards.find(([key]) => key === english) || [])[1];
    // Composed sentences around a German challenge text (selectChallenge, getSpecialSquaredRewards, getSquaredDescriptionInRun),
    // applied to the branded text or the browser-serialized markup. Every pattern needs English words, so a German result
    // never matches again. sup(n) is the ² / ³ mark the original writes as <sup>2</sup>.
    const sup = '<sup>(\\d)<\\/sup>', infinity = '<sup><span class=["\']icomoon icon-infinity["\']><\\/span><\\/sup>';
    const frames = [
        [/^Click a challenge below to learn more about and\/or run it!$/, () => 'Wähle eine Challenge, um mehr über sie zu erfahren oder sie zu starten.'],
        [/(^|>)You will unlock this challenge once you ([\s\S]+)$/, (_, at, rest) => at + 'Du schaltest diese Challenge frei, sobald du ' + rest + '.'],
        [/ You will not earn a new perk\./g, () => ' Einen neuen Perk erhältst du nicht.'], [/ You will also earn a new Perk!/g, () => ' Du erhältst außerdem einen neuen Perk!'],
        [/ You have already completed this challenge!/g, () => ' Diese Challenge hast du schon abgeschlossen!'],
        [new RegExp('This challenge issues rewards differently than most other Challenge' + sup + 's\\.', 'g'), (_, n) => 'Diese Challenge vergibt ihre Belohnung anders als die meisten Challenge<sup>' + n + '</sup>.'],
        [/ You will gain (\S+)% attack and health, and (\S+)% Helium/g, (_, a, h) => ' Du erhältst ' + a + '% Attack und Health sowie ' + h + '% Helium'],
        [/ You will gain (\S+)% to your bonus/g, (_, a) => ' Du erhältst ' + a + '% Bonus'],
        [/ for every (\S+) Zone(s?) reached\./g, (_, n, s) => ' für ' + (s ? 'je ' + n + ' erreichte Zonen' : 'jede erreichte Zone') + '.'],
        [/ Every (\S+) Zone(s?) reached,/g, (_, n, s) => s ? ' Nach je ' + n + ' erreichten Zonen' : ' Nach jeder erreichten Zone'],
        [/ this bonus will increase by (\S+)%(?: attack and health, and (\S+)% Helium)?\./g, (_, a, h) => ' steigt dieser Bonus um ' + a + '%' + (h ? ' Attack und Health sowie ' + h + '% Helium' : '') + '.'],
        // selectChallenge in Challenge² mode
        [new RegExp('( and y|Y)our highest Zone reached for (\\S+?)' + sup + ' is Z(\\d+)(?: \\(Capped to (\\d+) by Obsidian\\))?, ', 'g'),
            (_, and, name, n, zone, cap) => (and === 'Y' ? 'Deine' : ' und deine') + ' höchste erreichte Zone für ' + name + '<sup>' + n + '</sup> ist Z' + zone + (cap ? ' (durch Obsidian auf ' + cap + ' begrenzt)' : '') + ', '],
        [new RegExp('earning you (\\S+)% Challenge' + sup + ' bonus, and adding (\\S+)% to your total Challenge(' + infinity + ') bonus\\.', 'g'),
            (_, a, n, b, mark) => 'das bringt dir ' + a + '% Challenge<sup>' + n + '</sup>-Bonus und ' + b + '% für deinen gesamten Challenge' + mark + '-Bonus.'],
        [/earning you (\S+)% extra attack and health, and (\S+)% more Helium from all sources\./g, (_, a, h) => 'das bringt dir ' + a + '% zusätzliche Attack und Health und ' + h + '% mehr Helium aus allen Quellen.'],
        [new RegExp('Zones above Z(\\d+) are worth 5x more Challenge' + sup + ' bonus!', 'g'), (_, z, n) => 'Zonen über Z' + z + ' bringen 5x so viel Challenge<sup>' + n + '</sup>-Bonus!'],
        // getSquaredDescriptionInRun (Current challenge in a Challenge² run)
        [/You are currently at Zone (\d+)/g, (_, z) => 'Du bist derzeit in Zone ' + z],
        [new RegExp(', your previous highest for (\\S+?)' + sup + ' was Zone (\\d+)', 'g'), (_, name, n, z) => ', deine bisherige Bestmarke für ' + name + '<sup>' + n + '</sup> war Zone ' + z],
        [new RegExp(', your best for (\\S+?)' + sup + ' is Zone (\\d+)', 'g'), (_, name, n, z) => ', deine Bestmarke für ' + name + '<sup>' + n + '</sup> ist Zone ' + z],
        [new RegExp("\\. If you (abandon the challenge|use the portal) now, you'll add (\\S+)% to your total Challenge" + sup + ' bonus, bringing it to (\\S+)%\\.', 'g'),
            (_, how, a, n, b) => '. Wenn du jetzt ' + (how === 'use the portal' ? 'das Portal nutzt' : 'die Challenge aufgibst') + ', kommen ' + a + '% zu deinem gesamten Challenge<sup>' + n + '</sup>-Bonus hinzu, der damit auf ' + b + '% steigt.'],
        [new RegExp(' Your new Challenge(' + infinity + ') bonus will be (\\S+)%\\.', 'g'), (_, mark, a) => ' Dein neuer Challenge' + mark + '-Bonus beträgt dann ' + a + '%.'],
        [new RegExp('\\. If you (abandon the challenge|use the portal) now, your total Challenge' + sup + ' bonus will stay at (\\S+)%\\.', 'g'),
            (_, how, n, a) => '. Wenn du jetzt ' + (how === 'use the portal' ? 'das Portal nutzt' : 'die Challenge aufgibst') + ', bleibt dein gesamter Challenge<sup>' + n + '</sup>-Bonus bei ' + a + '%.'],
        [new RegExp("You'll need to reach at least Zone (\\d+) before you'll add anything to your current Challenge" + sup + ' bonus of (\\S+)%\\.', 'g'),
            (_, z, n, a) => 'Du musst mindestens Zone ' + z + ' erreichen, bevor etwas zu deinem aktuellen Challenge<sup>' + n + '</sup>-Bonus von ' + a + '% hinzukommt.'],
        // The Scientist reward the original puts into the German text in place of *.
        [new RegExp(scientistRewards.map(([english]) => esc(english)).join('|'), 'g'), english => reward(english)]
    ];
    const framed = text => frames.reduce((value, [pattern, replace]) => value.replace(pattern, replace), brand(text));
    // Own texts of the Portal's challenge step (mobile-portal.js) and fixed lines of the original around the challenge text.
    const screen = {
        'Choose a Challenge': 'Challenge wählen', '✓ completed · ↻ repeatable': '✓ abgeschlossen · ↻ wiederholbar', 'No Challenge': 'Keine Challenge',
        'Complete original rules · Goal and reward': 'Vollständige Regeln · Ziel und Belohnung', 'Rule': 'Regel', 'Goal': 'Ziel', 'Reward': 'Belohnung',
        'Lower minimum damage, higher maximum damage.': 'Geringerer Mindestschaden, höherer Höchstschaden.', 'Complete Dimension of Anger.': 'Schließe Dimension of Anger ab.',
        'No Miners until the Challenge is completed.': 'Keine Bergleute, bis die Challenge abgeschlossen ist.', 'See the original conditions.': 'Siehe die vollständigen Bedingungen.',
        'Complete rules, goal and reward below the list.': 'Vollständige Regeln, Ziel und Belohnung unter der Liste.',
        "You don't have an active challenge.": 'Du hast keine aktive Challenge.', 'You do not currently have an active challenge.': 'Du hast derzeit keine aktive Challenge.',
        'Click a challenge below to learn more about and/or run it!': 'Wähle eine Challenge, um mehr über sie zu erfahren oder sie zu starten.'
    };
    const screenPatterns = [[/^Perk (\S+) is already unlocked\.$/, (_, perk) => 'Perk ' + perk + ' ist schon freigeschaltet.'], [/^Unlocks the Perk (\S+)\.$/, (_, perk) => 'Schaltet den Perk ' + perk + ' frei.']];
    function screenText(value) {
        const core = value.trim();
        if (Object.hasOwn(screen, core)) return value.replace(core, screen[core]);
        for (const [pattern, replace] of screenPatterns) { const match = core.match(pattern); if (match) return value.replace(core, replace(...match)); }
        return value;
    }
    // Completion and failure notices of the challenges of both universes (config.js, main.js). Exact lines by the English of
    // the original; lines with values as patterns on the branded line. "You have a new quest!" stays English with its quest.
    const done = name => 'Du hast die Challenge ' + name + ' abgeschlossen!';
    const notices = {
        'You have completed the <b>Discipline Challenge!</b> You have unlocked a new perk, and your Trimps have regained their Discipline.': 'Du hast die <b>Challenge Discipline</b> abgeschlossen! Du hast einen neuen Perk freigeschaltet, und deine Scruffies haben ihre Disziplin zurück.',
        'You have completed the <b>Metal Challenge!</b> You have unlocked a new perk, and Miners have returned to your game.': 'Du hast die <b>Challenge Metal</b> abgeschlossen! Du hast einen neuen Perk freigeschaltet, und Bergleute sind zurück im Spiel.',
        'You have completed the <b>Size Challenge!</b> You have unlocked a new perk, and your Trimps have been reduced down to their normal size.': 'Du hast die <b>Challenge Size</b> abgeschlossen! Du hast einen neuen Perk freigeschaltet, und deine Scruffies sind wieder auf normale Größe geschrumpft.',
        'You can research science again!': 'Du kannst wieder forschen!',
        'You are all out of Map Credits! Clear some more Zones to earn some more.': 'Du hast keine Map-Credits mehr! Schließe weitere Zonen ab, um neue zu verdienen.',
        "You have completed the 'Meditate' challenge! The dimension has returned to normal, and you have unlocked a new perk!": 'Du hast die Challenge ‚Meditate‘ abgeschlossen! Die Dimension ist wieder normal, und du hast einen neuen Perk freigeschaltet!',
        'You have completed the Decay challenge! All stats have been returned to normal, and you can now create more powerful Gardens maps at will!': done('Decay') + ' Alle Werte sind wieder normal, und du kannst jetzt jederzeit stärkere Gardens-Maps erstellen!',
        "You have completed the <b>Trimp Challenge!</b> You have unlocked the 'Resilience' perk, and your Trimps can fight together again.": 'Du hast die <b>Challenge Scruffy</b> abgeschlossen! Du hast den Perk ‚Resilience‘ freigeschaltet, und deine Scruffies können wieder gemeinsam kämpfen.',
        "You have completed the 'Trapper' challenge! Your Trimps now remember how to breed, and you have unlocked a new perk!": 'Du hast die Challenge ‚Trapper‘ abgeschlossen! Deine Scruffies wissen wieder, wie man sich vermehrt, und du hast einen neuen Perk freigeschaltet!',
        "You have completed the 'Frugal' challenge! You can once again find equipment upgrades in maps, and Megabooks now increase gather rates by an extra 10%!": 'Du hast die Challenge ‚Frugal‘ abgeschlossen! In Maps findest du wieder Ausrüstungs-Upgrades, und Megabücher erhöhen das Sammeltempo um zusätzliche 10%!',
        "You have completed the 'Coordinate' challenge! The Bad Guys on this world no longer fight together, and have regained their speed. You have unlocked the 'Coordinated' perk!": 'Du hast die Challenge ‚Coordinate‘ abgeschlossen! Die Gegner dieser Welt kämpfen nicht mehr gemeinsam und sind wieder schnell. Du hast den Perk ‚Coordinated‘ freigeschaltet!',
        'You have completed the Slow challenge! You have found the patterns for the Gambeson and the Arbalest!': done('Slow') + ' Du hast die Baupläne für Gambeson und Armbrust gefunden!',
        "You have completed the Mapology challenge! You have unlocked the 'Resourceful' Perk! Cheaper stuff!": done('Mapology') + ' Du hast den Perk ‚Resourceful‘ freigeschaltet! Billigere Sachen!',
        "You have completed the <b>Unlucky Challenge!</b> You have unlocked a new perk, and your Trimps' damage has normalized.": 'Du hast die <b>Challenge Unlucky</b> abgeschlossen! Du hast einen neuen Perk freigeschaltet, und der Schaden deiner Scruffies ist wieder normal.',
        'You have completed the <b>Downsize Challenge!</b> You have unlocked a new perk, and your Trimps are once again willing to share houses.': 'Du hast die <b>Challenge Downsize</b> abgeschlossen! Du hast einen neuen Perk freigeschaltet, und deine Scruffies teilen sich wieder Häuser.',
        'You have completed the <b>Transmute Challenge!</b> You have unlocked a new perk, and Miners have returned to your game.': 'Du hast die <b>Challenge Transmute</b> abgeschlossen! Du hast einen neuen Perk freigeschaltet, und Bergleute sind zurück im Spiel.',
        'You have completed the Unbalance challenge! You have unlocked the Equality Perk!': done('Unbalance') + ' Du hast den Perk Equality freigeschaltet!',
        'You have completed the Duel challenge! You have unlocked the Criticality Perk!': done('Duel') + ' Du hast den Perk Criticality freigeschaltet!',
        "You have completed the 'Trappapalooza' challenge! Your Trimps now remember how to breed, and you have unlocked a new perk!": 'Du hast die Challenge ‚Trappapalooza‘ abgeschlossen! Deine Scruffies wissen wieder, wie man sich vermehrt, und du hast einen neuen Perk freigeschaltet!',
        'You have failed the Revenge Challenge! Better luck next time!': 'Du bist an der Challenge Revenge gescheitert! Mehr Glück beim nächsten Mal!',
        'You have completed the Quest challenge! Your World has been returned to normal and you have unlocked the Greed Perk!': done('Quest') + ' Deine Welt ist wieder normal, und du hast den Perk Greed freigeschaltet!',
        "Now that you've mastered the skill of Archaeology, you've gained the ability to use a more powerful Custom Golden Upgrade automator! See the AutoGold tooltip or Ctrl Click AutoGold for more info.":
            'Jetzt, da du Archaeology beherrschst, kannst du eine stärkere Automatik für eigene Golden Upgrades nutzen! Mehr dazu im Info-Fenster von AutoGold.',
        "You've gained the ability to create Small and Large Research Caches in Maps!": 'Du kannst jetzt in Maps kleine und große Research Caches erstellen!',
        'You have completed the Storm Challenge and unlocked the Antenna building!': 'Du hast die Challenge Storm abgeschlossen und das Gebäude Antenne freigeschaltet!',
        'You have completed the Berserk challenge! You have unlocked the Frenzy Perk and your world has been returned to normal.': done('Berserk') + ' Du hast den Perk Frenzy freigeschaltet, und deine Welt ist wieder normal.',
        'You have completed the Exterminate Challenge! You have unlocked the Hub, a revolutionary new way to store your extra Trimps!': done('Exterminate') + ' Du hast den Knotenpunkt freigeschaltet, eine revolutionäre neue Art, überzählige Scruffies unterzubringen!',
        'You have also unlocked the Observation Perk!': 'Außerdem hast du den Perk Observation freigeschaltet!',
        "You have unlocked the ability to create Farmlands Maps! Farmlands Maps have +100% Loot in Universe 2 and rotate between the other map types based on the zone at which they're run. See the Map Creation biome selection tooltip for more info!":
            'Du kannst jetzt Farmlands-Maps erstellen! Farmlands-Maps haben in Universum 2 +100% Beute und wechseln je nach Zone, in der du sie spielst, zwischen den anderen Map-Typen. Mehr dazu im Info-Fenster zur Biom-Auswahl beim Erstellen von Maps!',
        'You completed Z200 without completing Frozen Castle, and have failed Hypothermia! Your world has been returned to normal.': 'Du hast Z200 abgeschlossen, ohne Frozen Castle abzuschließen, und bist an Hypothermia gescheitert! Deine Welt ist wieder normal.',
        'You hit 10 Crystallized stacks and have failed the Glass Challenge! Your World has been returned to normal.': 'Du hast 10 Stapel Crystallized erreicht und bist an der Challenge Glass gescheitert! Deine Welt ist wieder normal.',
        'You have completed the Glass Challenge! Your World has been returned to normal, and from now on every Zone above Z175 will grant an extra 10% compounding Radon per Zone!': done('Glass') + ' Deine Welt ist wieder normal, und ab jetzt bringt jede Zone über Z175 zusätzlich 10% Radon je Zone (multiplikativ)!',
        'You have completed the Smithless Challenge! Your World has been returned to normal and you have unlocked the Smithology Perk!': done('Smithless') + ' Deine Welt ist wieder normal, und du hast den Perk Smithology freigeschaltet!',
        "I'm terribly sorry, but your Trimp<sup>2</sup> run appears to have more than one Trimp fighting, which kinda defeats the purpose. Your score for this Challenge<sup>2</sup> will be capped at 230.":
            'Es tut mir furchtbar leid, aber in deinem Scruffy<sup>2</sup>-Durchlauf kämpft offenbar mehr als 1 Scruffy, was den Sinn ziemlich verfehlt. Deine Wertung für diese Challenge<sup>2</sup> wird bei 230 gedeckelt.'
    };
    const times = n => n + '-mal';
    const logPatterns = [
        [/^You have completed the (\S+) [Cc]hallenge! You have been rewarded with (\S+) (Helium|Radon), and you may repeat the challenge\.$/, (_, name, n, kind) => done(name) + ' Du erhältst ' + n + ' ' + kind + ' als Belohnung und kannst die Challenge wiederholen.'],
        [/^You have completed the (\S+) [Cc]hallenge! You have been rewarded with (\S+) (Helium|Radon)\.$/, (_, name, n, kind) => done(name) + ' Du erhältst ' + n + ' ' + kind + ' als Belohnung.'],
        [/^You have completed the (\S+) [Cc]hallenge! You have gained an extra (\S+) Radon, and your world has been returned to normal\.$/, (_, name, n) => done(name) + ' Du erhältst zusätzlich ' + n + ' Radon, und deine Welt ist wieder normal.'],
        [/^You have completed the (\S+) challenge! Your world has been returned to normal, and you have unlocked the (\S+) perk!$/, (_, name, perk) => done(name) + ' Deine Welt ist wieder normal, und du hast den Perk ' + perk + ' freigeschaltet!'],
        [/^You have completed the Mapocalypse challenge! You have unlocked the 'Siphonology' Perk, and have been rewarded with (\S+) Helium\.$/, (_, n) => done('Mapocalypse') + ' Du hast den Perk ‚Siphonology‘ freigeschaltet und erhältst ' + n + ' Helium als Belohnung.'],
        [/^You have completed the <b>Scientist Challenge!<\/b> From now on, you'll (.+?) every time you portal\. You've unlocked Scientists, and <b>Don't forget that you can click Research on your Science again!<\/b>$/,
            (all, phrase) => reward(phrase) ? 'Du hast die <b>Challenge Scientist</b> abgeschlossen! Ab jetzt gilt bei jedem Portal: ' + reward(phrase) + '. Du hast die Forschung Forschergruppe freigeschaltet, und <b>vergiss nicht: Du kannst wieder auf Forschen tippen!</b>' : null],
        [/^You have completed all (\d+) Frigid Challenges! You are now gaining a total of \+(\S+)% to Helium, Damage, Health and Fluffy Experience for your accomplishments\.$/,
            (_, n, a) => 'Du hast alle ' + n + ' Frigid-Challenges abgeschlossen! Für deine Leistungen erhältst du jetzt insgesamt +' + a + '% auf Helium, Schaden, Health und Fluffy-Erfahrung.'],
        [/^You have completed the Frigid Challenge! Your Scruffies have gained \+(\S+)% Helium, Damage, Health, and Fluffy Experience, and future runs of this Challenge will be 10x more difficult\. You have now completed Frigid (\d+) times?\. Your new total Frigid bonus is \+(\S+)%\.$/,
            (_, a, n, b) => done('Frigid') + ' Deine Scruffies erhalten +' + a + '% Helium, Schaden, Health und Fluffy-Erfahrung, und künftige Durchläufe dieser Challenge werden 10x schwerer. Du hast Frigid jetzt ' + times(n) + ' abgeschlossen. Dein neuer Frigid-Bonus beträgt insgesamt +' + b + '%.'],
        [/^You have completed the Mayhem Challenge! Your Scruffies have gained \+(\S+)% Helium or Radon and Scruffy Attack and Health in Universe 1 and 2, and future runs of this Challenge will be 3x more difficult\. You have now completed Mayhem (\d+) times?\. Your new total Mayhem bonus is \+(\S+)%$/,
            (_, a, n, b) => done('Mayhem') + ' Deine Scruffies erhalten in Universum 1 und 2 +' + a + '% Helium bzw. Radon sowie Attack und Health, und künftige Durchläufe dieser Challenge werden 3x schwerer. Du hast Mayhem jetzt ' + times(n) + ' abgeschlossen. Dein neuer Mayhem-Bonus beträgt insgesamt +' + b + '%.'],
        [/^You have completed the Pandemonium Challenge! Your Scruffies have gained \+(\S+)% Radon or Helium, Damage, Health and Gathered Resources in Universe 1 and 2, and future runs of this Challenge will be 5x more difficult\. You have now completed Pandemonium (\d+) times?\. Your new total Pandemonium bonus is \+(\S+)%$/,
            (_, a, n, b) => done('Pandemonium') + ' Deine Scruffies erhalten in Universum 1 und 2 +' + a + '% Radon bzw. Helium, Schaden, Health und gesammelte Ressourcen, und künftige Durchläufe dieser Challenge werden 5x schwerer. Du hast Pandemonium jetzt ' + times(n) + ' abgeschlossen. Dein neuer Pandemonium-Bonus beträgt insgesamt +' + b + '%.'],
        [/^You have completed the Desolation Challenge! Your Scruffies have gained \+(\S+)% Radon or Helium, Damage, Health, Gathered Resources, and Mutated Seeds in Universe 1 and 2, and future runs of this Challenge will be 10x more difficult, require 2 more completed Zones to finish, and reduce stats by an extra 0\.2% per Zone cleared\. You have now completed Desolation (\d+) times?\. Your new total Desolation bonus is \+(\S+)%$/,
            (_, a, n, b) => done('Desolation') + ' Deine Scruffies erhalten in Universum 1 und 2 +' + a + '% Radon bzw. Helium, Schaden, Health, gesammelte Ressourcen und Mutated Seeds, und künftige Durchläufe dieser Challenge werden 10x schwerer, brauchen 2 abgeschlossene Zonen mehr bis zum Ziel und senken die Werte je abgeschlossener Zone um zusätzliche 0.2%. Du hast Desolation jetzt ' + times(n) + ' abgeschlossen. Dein neuer Desolation-Bonus beträgt insgesamt +' + b + '%.'],
        [/^You completed (\S+) again, just for fun!$/, (_, name) => 'Du hast ' + name + ' noch einmal abgeschlossen, einfach zum Spaß!'],
        [/^Fluffy has Experienced the Wonder of ([^!<]+)!$/, (_, map) => 'Fluffy hat das Wonder von ' + map + ' erlebt!'],
        [/^You have completed the Experience Challenge! Fluffy has gained an additional (\S+) Experience \((\S+) earned, (\S+)% from (\d+) Wonders? \+ (\S+)% from extra BW tiers\), and your World has been returned to normal\.$/,
            (_, xp, held, a, n, b) => done('Experience') + ' Fluffy erhält zusätzlich ' + xp + ' Erfahrung (' + held + ' verdient, ' + a + '% durch ' + n + ' Wonder + ' + b + '% durch zusätzliche BW-Stufen), und deine Welt ist wieder normal.'],
        [/^Oh no, you failed the Bublé challenge! You have been rewarded with (\S+) extra Radon, and you may try again\.$/, (_, n) => 'Oh nein, du bist an der Challenge Bublé gescheitert! Du erhältst ' + n + ' zusätzliches Radon als Belohnung und kannst es erneut versuchen.'],
        [/^You have completed the Bublé challenge! You're a hero among Scruffies! You have been rewarded with (\S+) extra Radon, and you may repeat the challenge\.$/,
            (_, n) => done('Bublé') + ' Du bist ein Held unter den Scruffies! Du erhältst ' + n + ' zusätzliches Radon als Belohnung und kannst die Challenge wiederholen.'],
        [/^You have completed your quest! You've completed (\d+) \/ (\d+) quests\.$/, (_, a, b) => 'Quest erfüllt! Du hast ' + a + ' von ' + b + ' Quests erfüllt.'],
        [/^Oh no, you failed your quest! You've completed (\d+) \/ (\d+) quests\.$/, (_, a, b) => 'Oh nein, deine Quest ist gescheitert! Du hast ' + a + ' von ' + b + ' Quests erfüllt.'],
        [/^You have completed your first Hypothermia challenge! You have gained an extra (\S+) Radon, unlocked the Masterfulness Perk, and your world has been returned to normal!$/,
            (_, n) => 'Du hast deine erste Challenge Hypothermia abgeschlossen! Du erhältst zusätzlich ' + n + ' Radon, hast den Perk Masterfulness freigeschaltet, und deine Welt ist wieder normal!'],
        [/^Your Scruffies gained (\d+) stacks? of Enhanced Armor from that Ubersmith\. Your Scruffies now have (\d+) total stacks?\.$/,
            (_, a, b) => 'Deine Scruffies haben von diesem Ubersmith ' + a + ' Stapel Enhanced Armor erhalten. Deine Scruffies haben jetzt insgesamt ' + b + ' Stapel.'],
        [/^You have completed the Daily challenge! You have been rewarded with (\S+) extra (Helium|Radon)!$/, (_, n, kind) => 'Du hast die Daily-Challenge abgeschlossen! Du erhältst ' + n + ' zusätzliches ' + kind + ' als Belohnung!'],
        [/^You have (\d+) Map Credits? left!$/, (_, n) => 'Du hast noch ' + n + ' Map-' + (n === '1' ? 'Credit' : 'Credits') + '!']
    ];
    const logProbe = /^(?:You have|You completed|Oh no|Fluffy has|Your Scruffies gained)/;
    // Daily modifiers (dailyModifiers in main.js, step 4c): description(str) and stackDesc(str, stacks) are wrapped, so
    // the list in the Portal, the running Daily and the stack tooltips read German; the values come from the English text.
    const per = (n, one, many) => n === '1' ? one : many;
    const res = {Food: 'Nahrung', Wood: 'Holz', Metal: 'Metall'};
    const dailyTexts = [
        template('Trimp min damage reduced by {}% (additive).', 'Der Mindestschaden der Scruffies sinkt um {0}% (additiv).'),
        template('Trimp max damage increased by {}% (additive).', 'Der Höchstschaden der Scruffies steigt um {0}% (additiv).'),
        template('Enemies stack a debuff with each attack, damaging Trimps for {}% of total health per turn per stack, resets on Trimp death.',
            'Gegner legen mit jedem Angriff einen Stapel Schwächung auf, der deinen Scruffies je Runde und Stapel {0}% ihrer gesamten Health als Schaden zufügt. Die Stapel verschwinden, wenn deine Scruffies sterben.'),
        template('Your Trimps are taking {}% damage after each attack.', 'Deine Scruffies erleiden nach jedem Angriff {0}% Schaden.'),
        template('Enemies stack a debuff with each attack, reducing Trimp attack by {}% per stack. Stacks cap at {} and reset on Trimp death.',
            'Gegner legen mit jedem Angriff einen Stapel Schwächung auf, der die Attack deiner Scruffies je Stapel um {0}% senkt. Die Stapel sind auf {1} begrenzt und verschwinden, wenn deine Scruffies sterben.'),
        template('Your Trimps have {}% less attack.', 'Deine Scruffies haben {0}% weniger Attack.'),
        template('All housing can store {}% fewer Trimps', 'In alle Unterkünfte passen {0}% weniger Scruffies.'),
        template('Gain {}% more resources from gathering', 'Du erhältst beim Sammeln {0}% mehr Ressourcen.'),
        template('Gain {}% less Metal, Food, Wood, and Gems from all sources', 'Du erhältst aus allen Quellen {0}% weniger Metall, Nahrung, Holz und Edelsteine.'),
        template('Enemy attack increased by {}%.', 'Die Attack der Gegner steigt um {0}%.'),
        template('Enemy health increased by {}%.', 'Die Health der Gegner steigt um {0}%.'),
        template('Enemy attack in maps increased by {}%.', 'Die Attack der Gegner in Maps steigt um {0}%.'),
        template('Enemy health in maps increased by {}%.', 'Die Health der Gegner in Maps steigt um {0}%.'),
        template('Enemies have a 25% chance to crit for {}% of normal damage.', 'Gegner landen mit 25% Wahrscheinlichkeit einen kritischen Treffer mit {0}% des normalen Schadens.'),
        template('Your Trimps have +{}% Crit Chance.', 'Deine Scruffies haben +{0}% Krit-Chance.'),
        template('Your Trimps have -{}% Crit Chance.', 'Deine Scruffies haben -{0}% Krit-Chance.'),
        template('Your Trimps lose {}% of their max health after each attack.', 'Deine Scruffies verlieren nach jedem Angriff {0}% ihrer maximalen Health.'),
        template('Your Trimps breed {}% slower', 'Deine Scruffies vermehren sich {0}% langsamer.'),
        template('Trimps have {}% less attack on odd numbered Zones', 'In Zonen mit ungerader Nummer haben Scruffies {0}% weniger Attack.'),
        template('Trimps have {}% more attack on even numbered Zones', 'In Zonen mit gerader Nummer haben Scruffies {0}% mehr Attack.'),
        template('Gain a stack after killing an enemy, increasing all non {} loot by {}%. Stacks cap at {}, and reset after clearing a Zone.',
            'Jeder getötete Gegner gibt dir einen Stapel, der alle Beute außer {0} um {1}% erhöht. Die Stapel sind auf {2} begrenzt und setzen sich mit jeder abgeschlossenen Zone zurück.'),
        template('Your Trimps are finding {}% more loot!', 'Deine Scruffies finden {0}% mehr Beute!'),
        template('Gain a stack after killing an enemy, reducing breed speed by {}% (compounding). Stacks cap at {}, and reset after clearing a Zone.',
            'Jeder getötete Gegner gibt dir einen Stapel, der das Zuwachstempo um {0}% senkt (multiplikativ). Die Stapel sind auf {1} begrenzt und setzen sich mit jeder abgeschlossenen Zone zurück.'),
        template('Your Trimps are breeding {}% slower.', 'Deine Scruffies vermehren sich {0}% langsamer.'),
        template('Enemies gain a stack of Bloodthirst whenever Trimps die. Every {} stacks, enemies will heal to full and gain an additive 50% attack. Stacks cap at {} and reset after killing an enemy.',
            'Gegner erhalten jedes Mal einen Stapel Bloodthirst, wenn Scruffies sterben. Je {0} Stapel heilen sich die Gegner vollständig und erhalten additiv 50% Attack. Die Stapel sind auf {1} begrenzt und verschwinden, wenn ein Gegner getötet wird.'),
        template('This Bad Guy will heal to full and gain attack in {} stack{},  and gains 1 stack whenever Trimps die.',
            n => 'Dieser Gegner heilt sich nach ' + n + ' ' + per(n, 'weiteren Stapel', 'weiteren Stapeln') + ' vollständig und erhält Attack; er erhält 1 Stapel, wenn Scruffies sterben.'),
        template('This Bad Guy will heal to full and gain attack in {} stack{},  gains 1 stack whenever Trimps die, and currently has {}% more attack.',
            (n, s, a) => 'Dieser Gegner heilt sich nach ' + n + ' ' + per(n, 'weiteren Stapel', 'weiteren Stapeln') + ' vollständig und erhält Attack, erhält 1 Stapel, wenn Scruffies sterben, und hat derzeit ' + a + '% mehr Attack.'),
        template('This Bad Guy currently has {}% more attack.', 'Dieser Gegner hat derzeit {0}% mehr Attack.'),
        template('Enemies instantly deal {}% of their attack damage when killed.', 'Getötete Gegner verursachen sofort {0}% ihres Angriffsschadens.'),
        template('Enemies instantly deal {}% of their attack damage when killed unless your block is as high as your maximum health.', 'Getötete Gegner verursachen sofort {0}% ihres Angriffsschadens, außer dein Block ist so hoch wie deine maximale Health.'),
        template('Enemies have a {}% chance to dodge your attacks on {} Zones.', (n, kind) => kind === 'odd' || kind === 'even' ? 'Gegner weichen deinen Angriffen in Zonen mit ' + (kind === 'odd' ? 'ungerader' : 'gerader') + ' Nummer mit ' + n + '% Wahrscheinlichkeit aus.' : null),
        template('Gain a stack after killing an enemy, increasing Trimp attack by {}% (additive). Stacks cap at {}, and reset when your Trimps die.',
            'Jeder getötete Gegner gibt dir einen Stapel, der die Attack deiner Scruffies um {0}% erhöht (additiv). Die Stapel sind auf {1} begrenzt und verschwinden, wenn deine Scruffies sterben.'),
        template('Your Trimps are dealing {}% more damage.', 'Deine Scruffies verursachen {0}% mehr Schaden.'),
        [new RegExp('^40% of Bad Guys in (?:the first (\\S+) rows of)? the World will be mutated into (' + esc(brand('Hulking Mutimps')) + '|' + esc(brand('Mutimps')) + ')\\.$'),
            (_, rows, name) => '40% der Gegner ' + (rows ? 'in den ersten ' + rows + ' Reihen der Welt' : 'in der Welt') + ' werden zu ' + name + '.'],
        template('All enemies gain {} stack{} of Empower whenever your Trimps die in the World. Empower increases the attack and health of Bad Guys in the World by 0.2% per stack, can stack to 9999, and never resets.',
            'Alle Gegner erhalten {0} Stapel Empower, wenn deine Scruffies in der Welt sterben. Empower erhöht Attack und Health der Gegner in der Welt je Stapel um 0.2%, stapelt sich bis 9999 und setzt sich nie zurück.'),
        template('This Bad Guy is Empowered and has {}% more health and attack.', 'Dieser Gegner ist Empowered und hat {0}% mehr Health und Attack.'),
        template('Trimps gain a stack of Pressure every {} seconds. Each stack of pressure reduces Trimp health by 1%. Max of {} stacks, stacks reset after clearing a Zone.',
            (t, n) => 'Scruffies erhalten alle ' + t + ' ' + per(t, 'Sekunde', 'Sekunden') + ' einen Stapel Pressure. Jeder Stapel Pressure senkt die Health der Scruffies um 1%. Die Stapel sind auf ' + n + ' begrenzt und setzen sich mit jeder abgeschlossenen Zone zurück.'),
        template('Your Trimps are under a lot of pressure. Maximum health is reduced by {}%.', 'Deine Scruffies stehen unter großem Druck. Ihre maximale Health ist um {0}% gesenkt.'),
        template("Enemies have a{} {}% chance to reflect an attack, dealing {}% of damage taken back to your Trimps (will not reflect damage done above the Enemy's max health).",
            (_, n, d) => 'Gegner werfen einen Angriff mit ' + n + '% Wahrscheinlichkeit zurück und fügen deinen Scruffies ' + d + '% des erlittenen Schadens zu (Schaden über der maximalen Health des Gegners wird nicht zurückgeworfen).'),
        template('Heirloom combat and resource bonuses are reduced by {}%.', 'Die Kampf- und Ressourcenboni der Heirlooms sind um {0}% gesenkt.'),
        template('Equipment is {}% cheaper.', 'Ausrüstung ist {0}% billiger.'),
        template('Enemies in Void Maps have +{}% increased Attack and Health', 'Gegner in Void Maps haben +{0}% mehr Attack und Health.'),
        template('Every 30 seconds, your stored {} is reduced by {}%', (list, n) => {
            const items = list.split(/, and |, | and /);
            if (!items.every(item => Object.hasOwn(res, item))) return null;
            const de = items.map(item => res[item]);
            return 'Alle 30 Sekunden sinken deine Vorräte an ' + (de.length > 1 ? de.slice(0, -1).join(', ') + ' und ' + de.at(-1) : de[0]) + ' um ' + n + '%.';
        })
    ];
    function dailyText(english) {
        if (typeof english !== 'string') return null;
        const branded = brand(english);
        for (const [pattern, replace] of dailyTexts) { const match = branded.match(pattern); if (match) { const out = replace(...match); if (out) return out; } }
        return null;
    }
    function wrapDaily(mods) {
        if (!mods || seen.has(mods)) return;
        seen.add(mods);
        for (const mod of Object.values(mods)) for (const field of ['description', 'stackDesc']) {
            const original = mod[field];
            if (typeof original === 'function') mod[field] = function (...args) { const value = original.apply(this, args); return dailyText(value) ?? value; };
        }
    }
    // The frame of the Daily in the Portal (getDailyTopText, getDailyChallenge) and of the running Daily
    // (getCurrentDailyDescription, getDailyRewardText), on the original markup or as the browser serializes it.
    const days = {Sunday: 'Sonntag', Monday: 'Montag', Tuesday: 'Dienstag', Wednesday: 'Mittwoch', Thursday: 'Donnerstag', Friday: 'Freitag', Saturday: 'Samstag'};
    const letters = {S: 'S', M: 'M', T: 'D', W: 'M', F: 'F'}, dayNames = Object.keys(days).join('|');
    const gains = {'Radon': 'Radon', 'Helium': 'Helium', 'Nu from Heirlooms earned during the run': 'Nu aus Heirlooms dieses Durchlaufs', 'Mutated Seeds': 'Mutated Seeds',
        'Scruffy Exp': 'Scruffy-Exp', 'Fluffy Exp': 'Fluffy-Exp', 'Dark Essence': 'Dark Essence', 'Nature Tokens': 'Nature Tokens'};
    function gained(list) {
        const items = list.split(/,\s*(?:and\s+)?|\s+and\s+/).map(item => item.trim()).filter(Boolean);
        if (!items.length || !items.every(item => Object.hasOwn(gains, item))) return null;
        const de = items.map(item => gains[item]);
        return de.length > 1 ? de.slice(0, -1).join(', ') + ' und ' + de.at(-1) : de[0];
    }
    const dailyFrames = [
        [/aria-label=(["'])Available Dailies\1/g, (_, q) => 'aria-label=' + q + 'Verfügbare Dailies' + q],
        [new RegExp('(dailyTop[^"\'>]*["\']>)(' + dayNames + '|[SMTWF])(<br\\/?>)', 'g'), (_, at, day, br) => at + (days[day] || letters[day]) + br],
        [/(<br\/?>)Done</g, (_, br) => br + 'Erledigt<'],
        [new RegExp('>(' + dayNames + ') (\\d{4}-\\d\\d-\\d\\d)<', 'g'), (_, day, date) => '>' + days[day] + ' ' + date + '<'],
        [new RegExp('>(' + dayNames + ') resets in <', 'g'), (_, day) => '>' + days[day] + ' startet in <'],
        [/You have already attempted this Daily Challenge!/g, () => 'Diese Daily-Challenge hast du schon versucht!'],
        [/Challenge has no end point, and grants an <u><b>additional (\S+)%<\/b><\/u> of all (.+?) earned before finishing\./g,
            (all, n, list) => gained(list) ? 'Die Challenge hat kein Ende und bringt dir <u><b>zusätzlich ' + n + '%</b></u> von allem, was du bis zum Beenden an ' + gained(list) + ' verdienst.' : all],
        [/ <b>Can only be run once!<\/b> Reward does not count toward Bone Portals or affect best (Rn|He)\/Hr stat\./g,
            (_, kind) => ' <b>Nur einmal spielbar!</b> Die Belohnung zählt nicht für Bone Portals und ändert den Bestwert ' + kind + '/Std. nicht.']
    ];
    const dailyFramed = text => typeof text === 'string' ? dailyFrames.reduce((value, [pattern, replace]) => value.replace(pattern, replace), brand(text)) : text;
    // Tooltip of a day in the Daily row (updates.js, "Switch Daily"), in the tooltip window of the main catalog.
    const tipPatterns = [[new RegExp('^Click to view (today|' + dayNames + ")s challenge, which resets in less than (\\d+) days?\\.$"),
        (_, day, n) => 'Tippe, um die Challenge von ' + (days[day] || 'heute') + ' zu sehen; sie wechselt in weniger als ' + n + ' ' + per(n, 'Tag', 'Tagen') + '.']];
    function translate(game) {
        if (!game || !game.challenges || seen.has(game)) return game;
        seen.add(game);
        for (const [key, challenge] of Object.entries(game.challenges)) for (const field of ['description', 'squaredDescription', 'unlockString']) {
            const d = Object.getOwnPropertyDescriptor(challenge, field);
            if (!d) continue;
            if (d.get) { english.set(key + '|' + field, () => d.get.call(challenge)); Object.defineProperty(challenge, field, {...d, get() { const value = d.get.call(this); return german(key, field, value) ?? value; }}); }
            else if (typeof d.value === 'string') { const next = german(key, field, d.value); if (next !== null) challenge[field] = next; }
            else if (typeof d.value === 'function') challenge[field] = function (...args) { const value = d.value.apply(this, args); return german(key, field, value) ?? value; };
        }
        return game;
    }
    const seen = new WeakSet(), english = new Map();
    let win = null;
    // German rules exist for this challenge in the shown mode (plain text, or a getter whose English result is matched);
    // otherwise the composed sentences around it stay English as well.
    function covered(key, squared) {
        const field = squared ? 'squaredDescription' : 'description';
        if (!key) return false;
        // The Daily's modifiers are German at their source; its getter would build a new Daily, so it is not called here.
        if (key === 'Daily') return !!win?.dailyModifiers && seen.has(win.dailyModifiers);
        if (typeof texts[key]?.[field] === 'string') return true;
        const getter = english.get(key + '|' + field);
        try { return !!getter && german(key, field, getter()) !== null; } catch { return false; }
    }
    function pane(text) {
        const g = win.game.global, key = g.challengeActive;
        if (typeof text !== 'string' || !covered(key, g.runningChallengeSquared)) return text;
        if (key === 'Daily') return dailyFramed(text.replace(/^You have the (\S*) ?Daily challenge active\. /, (_, date) => 'Aktiv ist die Daily-Challenge' + (date ? ' vom ' + date : '') + '. '));
        // The C² rules stand in ASCII quotes after the first sentence (getSquaredDescriptionInRun); German quotes instead.
        return framed(brand(text).replace(/^You have the (\S+) challenge active\. (?:"([^"]*)" )?/, (_, name, rules) => 'Aktiv ist die Challenge ' + name + '. ' + (rules === undefined ? '' : '„' + rules + '“ ')));
    }
    // The challenge step of the Portal: own labels and fixed lines become German as text nodes; the selected challenge's
    // text gets its composed sentences when its rules are German (or nothing is selected: hint, unlock condition).
    const targets = '#mobile-portal-challenges>h2,#mobile-challenge-legend,#mobile-challenge-rules>summary,#mobile-challenge-facts,#challenge0,#specificChallengeDescription,#viewChallengeText';
    function show(element) {
        const doc = win.document;
        if (element.id === 'specificChallengeDescription') {
            const key = win.game?.global?.selectedChallenge;
            if (!key || covered(key, !!win.challengeSquaredMode)) {
                const html = element.innerHTML, next = key === 'Daily' ? dailyFramed(html) : framed(html);
                if (next !== brand(html)) element.innerHTML = next;
            }
        }
        const walker = doc.createTreeWalker(element, 4);
        while (walker.nextNode()) { const node = walker.currentNode, next = screenText(node.data); if (next !== node.data) node.data = next; }
    }
    function watch() {
        const root = win.document.getElementById('portalWrapper');
        if (!root) return;
        const refresh = () => root.querySelectorAll(targets).forEach(show);
        refresh();
        new win.MutationObserver(records => {
            const touched = new Set();
            for (const record of records) {
                const node = record.target.nodeType === 1 ? record.target : record.target.parentElement;
                const element = node?.closest?.(targets) || null;
                if (element) touched.add(element);
                else if (record.type === 'childList') record.addedNodes.forEach(added => { if (added.nodeType === 1) { if (added.matches(targets)) touched.add(added); added.querySelectorAll(targets).forEach(inner => touched.add(inner)); } });
            }
            touched.forEach(show);
        }).observe(root, {subtree: true, childList: true, characterData: true});
    }
    const catalog = {texts, getters, unlock, scientistRewards, frames, framed, screen, screenText, notices, logPatterns, logProbe, german, covered, pane,
        dailyTexts, dailyText, dailyFramed, tipPatterns};
    function install(target) {
        win = target;
        const layer = win.MobileI18nGame;
        if (!layer || !layer.active || layer.lang !== 'de') return false;
        translate(win.game);
        wrapDaily(win.dailyModifiers);
        if (typeof layer.extend === 'function') layer.extend('de', {patterns: tipPatterns, probe: /^Click to view /});
        const hook = (fn, wrap) => { if (typeof win[fn] === 'function') win[fn] = wrap(win[fn]); };
        hook('newGame', original => function (...args) { return translate(original.apply(this, args)); });
        hook('getCurrentChallengePane', original => function (...args) { return pane(original.apply(this, args)); });
        layer.registerLog('de', {strings: notices, patterns: logPatterns, probe: logProbe});
        const doc = win.document;
        if (doc && typeof doc.getElementById === 'function') { if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', watch); else watch(); }
        return true;
    }
    catalog.install = install;
    if (typeof window !== 'undefined') install(window);
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeChallenges;
