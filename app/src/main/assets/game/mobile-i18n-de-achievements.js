// V-243 step 4e: German texts of the Achievements window (game.achievements, both universes): group titles, the
// description of every tier, progress lines, the reward, status and lock lines of the detail, popup and tracker, the head
// of the window (bonus, Golden Upgrades, help) and the screen reader table and notice.
// - Config texts: title (saveOriginal in main.js deletes it from every save), description and progress (functions, never
//   saved) are replaced once per game object; getters and functions keep their engine logic, only their English result is
//   matched by a template on the branded text. Achievement names stay English: they are keys of the engine
//   (names.indexOf('Realtor'), giveSingleAchieve(name), checkFeatEarnable) and players find them so in guides.
// - The original writes no log line for an achievement; the notice is the popup (#achievementPopup) and, with screen reader
//   hints, screenReaderAssert("Completed Achievement! …"), both German here.
// - Watched areas are only the lines around the names (detail, popup, tracker, head, help, own status line of
//   mobile-design.js, screen reader table); no area the original compares with its own literal (trackAchievement only
//   tests the progress line for emptiness). Numbers keep the format of prettify() ("1.5K").
var MobileI18nDeAchievements = (() => {
    const brand = value => typeof MobileBranding === 'undefined' ? value : MobileBranding.text(value);
    const esc = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const one = (n, singular, plural) => n === '1' ? singular : plural;
    // Group titles by engine key. The later Spire speed groups have getters with romanNumeral(): their titles are matched
    // by a pattern, because the option Roman numerals switches between Spire II and Spire 2.
    const titles = {
        zones:'Zonenfortschritt', zones2:'Zonenfortschritt: U2', damage:'Scruffy-Schaden', trimps:'Scruffies im Besitz', housing:'Immobilien',
        portals:'Portale insgesamt', totalZones:'Abgeschlossene Zonen', totalMaps:'Abgeschlossene Maps', totalHelium:'Heliumsammlung',
        totalRadon:'Radonsammlung', heliumHour:'Helium pro Stunde', totalHeirlooms:'Heirloom-Sammlung', totalGems:'Edelsteinsammlung',
        dailyHelium:'Daily-Bonus', humaneRun:'Schonender Durchlauf', mapless:'Ohne Maps unterwegs', shielded:'Gut abgeschirmt',
        mutatedSeeds:'Mutated-Seeds-Sammlung', blockTimed:'Tempo: The Block', wallTimed:'Tempo: The Wall', angerTimed:'Tempo: Anger',
        doomTimed:'Tempo: Doom', prisonTimed:'Tempo: The Prison', bionicTimed:'Tempo: Bionic', starTimed:'Tempo: Star', spireTimed:'Tempo: Spire',
        spire2Timed:'Tempo: Spire II', spire3Timed:'Tempo: Spire III', spire4Timed:'Tempo: Spire IV', spire5Timed:'Tempo: Spire V',
        spire6Timed:'Tempo: Spire VI', spire7Timed:'Tempo: Spire VII', bigWallTimed:'U2-Tempo: Big Wall', palaceTimed:'U2-Tempo: Palace',
        atlantrimpTimed:'U2-Tempo: Atlantrimp', meltingTimed:'U2-Tempo: Melting', stuffySpireTimed:'U2-Tempo: Stuffy', oneOffs:'Glanzleistungen', oneOffs2:'U2-Glanzleistungen'
    };
    // Feats (oneOffs, oneOffs2) by name: the English description with {} for a prettify() or romanNumeral() value (the
    // option Roman numerals switches between II and 2), and the German one.
    const feats = {
        'Forgot Something':['Complete the Dimension of Anger before buying Bounty', 'Schließe die Dimension of Anger ab, bevor du Kopfgeld kaufst'],
        Underachiever:['Reach Z30 with no respec and 60 or less He spent', 'Erreiche Z30 ohne Respec und mit höchstens 60 ausgegebenem He'],
        Hoarder:['Have over {} traps at once', 'Besitze gleichzeitig mehr als {0} Fallen'],
        'Needs Block':['Die 50 times to a single Voidsnimp', 'Stirb 50-mal durch einen einzigen Voidcoil'],
        Underbalanced:['Beat Balance, never having more than 100 stacks', 'Schließe Balance ab, ohne je mehr als 100 Stapel zu haben'],
        Peacekeeper:['Reach Zone 10 with 5 or fewer dead Trimps', 'Erreiche Zone 10 mit höchstens 5 toten Scruffies'],
        'Elite Feat':['Reach exactly 1337 He/Hr', 'Erreiche genau 1337 He/Std.'],
        Grounded:['Attack 20 times without dying in Electricity', 'Greife in Electricity 20-mal an, ohne zu sterben'],
        Maptastic:['Create a perfect Map', 'Erstelle eine perfekte Map'],
        'Now What':['Use up all 7 Daily Challenges', 'Spiele alle 7 Daily Challenges'],
        Swag:['Equip a magnificent or better Staff and Shield', 'Rüste Staff und Shield der Seltenheit Magnificent oder besser aus'],
        'Workplace Safety':['Reach Z60 with 1000 or fewer dead Trimps', 'Erreiche Z60 mit höchstens 1000 toten Scruffies'],
        'No Time for That':['Reach Z120 without using manual research', 'Erreiche Z120, ohne von Hand zu forschen'],
        'Tent City':['Reach Z75 without buying any housing', 'Erreiche Z75, ohne Unterkünfte zu kaufen'],
        'Consolation Prize':['Find a Common heirloom at Z146 or higher', 'Finde ab Z146 ein Heirloom der Seltenheit Common'],
        Holey:['Spend over {} total He on Wormholes', 'Gib insgesamt mehr als {0} He für Wurmlöcher aus'],
        Shaggy:['Reach Z60 with rank {} or lower equipment', 'Erreiche Z60 mit Ausrüstung von höchstens Rang {0}'],
        'One-Hit Wonder':['Kill an Improbability in one hit', 'Erschlage Oddity mit einem einzigen Treffer'],
        Survivor:['Beat a Lv 60+ Destructive Void Map with no deaths', 'Schließe eine Destructive Void Map ab Level 60 ohne Tote ab'],
        'Thick Skinned':['Beat Crushed without being crit past Z5', 'Schließe Crushed ab, ohne nach Z5 kritisch getroffen zu werden'],
        'Great Host':['Kill an enemy with 100 stacks of Nom', 'Erschlage einen Gegner mit 100 Stapeln Nom'],
        Unbroken:['Break the Planet with 5 or fewer lost battles', 'Zerbrich den Planeten mit höchstens 5 verlorenen Kämpfen'],
        Unemployment:['Reach Z60 without hiring a single Trimp', 'Erreiche Z60, ohne einen einzigen Scruffy einzustellen'],
        'Very Sneaky':['Complete a Zone above 99 without falling below 150 stacks on Life', 'Schließe in Life eine Zone über 99 ab, ohne unter 150 Stapel zu fallen'],
        'Extra Crispy':['Spend at least 10 minutes breeding an army with Geneticists', 'Lass eine Armee mit Genetikern mindestens 10 Minuten lang heranwachsen'],
        'Trimp is Poison':['Beat Toxicity, never having more than 400 stacks', 'Schließe Toxicity ab, ohne je mehr als 400 Stapel zu haben'],
        Realtor:['Own 100 of all housing buildings', 'Besitze von jeder Unterkunft 100 Stück'],
        'Gotta Go Fast':['Overkill every possible world cell before Z60', 'Erfasse vor Z60 jedes mögliche Weltfeld mit Overkill'],
        Grindless:['Complete Watch without entering maps or buying Nurseries', 'Schließe Watch ab, ohne Maps zu betreten oder Kinderstuben zu kaufen'],
        Leadership:['Complete Lead with 100 or fewer lost battles', 'Schließe Lead mit höchstens 100 verlorenen Kämpfen ab'],
        Defender:['Build your 10th Spire Floor', 'Baue dein 10. Spire-Stockwerk'],
        Stoned:['Kill {} enemies in your Spire', 'Erschlage {0} Gegner in deiner Spire'],
        Swagmatic:['Equip a Magmatic Staff and Shield', 'Rüste Staff und Shield der Seltenheit Magmatic aus'],
        Brr:["Bring a world enemy's attack below 1", 'Senke die Attack eines Gegners in der Welt unter 1'],
        'Unsatisfied Customer':['Complete Lead with 1 or fewer Gigastations', 'Schließe Lead mit höchstens 1 Gigastation ab'],
        'Organic Trimps':['Complete Corrupted without Geneticists', 'Schließe Corrupted ohne Genetiker ab'],
        Fhtagn:['Complete a Void Map at Z215 on Domination', 'Schließe in Domination eine Void Map in Z215 ab'],
        Invincible:['Complete The Spire with 0 deaths', 'Schließe die Spire ohne Tote ab'],
        Mighty:['Overkill an Omnipotrimp', 'Erfasse Crownmaw mit Overkill'],
        'Mother Lode':['Defeat a Healthy enemy with 200 stacks of wind', 'Besiege einen Healthy-Gegner mit 200 Stapeln Wind'],
        Infected:["Build up a Poison debuff that's 1000x higher than your attack", 'Baue einen Poison-Debuff auf, der 1000-mal so hoch ist wie deine Attack'],
        Challenged:['Earn a Challenge<sup>2</sup> bonus of 2000%', 'Erreiche einen Challenge<sup>2</sup>-Bonus von 2000%'],
        'Bionic Sniper':['Complete a Bionic Wonderland map 45 levels higher than your Zone number', 'Schließe eine Bionic-Wonderland-Map ab, deren Level 45 über deiner Zonennummer liegt'],
        Nerfed:['Beat the Spire with no respec and {} or less He Spent', 'Schließe die Spire ohne Respec und mit höchstens {0} ausgegebenem He ab'],
        Obliterate:['Defeat an enemy on Obliterated', 'Besiege in Obliterated einen Gegner'],
        "M'Algamator":['Find an Amalgamator on Z1', 'Finde einen Amalgamator in Z1'],
        'Critical Luck':['Get 10 Red Crits in a row', 'Lande 10 rote Krits in Folge'],
        AntiScience:['Beat Z75 on the Scientist V challenge', 'Schließe Z75 in der Challenge Scientist V ab'],
        HeMergency:['Gain at least 01189998819991197253 He from one Bone Portal', 'Erhalte durch ein einziges Bone Portal mindestens 01189998819991197253 He'],
        Eradicate:['Kill an Enemy on Eradicated', 'Erschlage in Eradicated einen Gegner'],
        Invisible:['Complete Spire {} with no deaths', 'Schließe Spire {0} ohne Tote ab'],
        'Power Tower':['Build your 20th Spire Floor', 'Baue dein 20. Spire-Stockwerk'],
        'Bionic Nuker':['Complete a Bionic Wonderland map 200 levels higher than your Zone number', 'Schließe eine Bionic-Wonderland-Map ab, deren Level 200 über deiner Zonennummer liegt'],
        Hypercoordinated:['Complete Spire {} on the Coordinate challenge', 'Schließe Spire {0} in der Challenge Coordinate ab'],
        Nerfeder:['Beat Spire {} with no respec and {} or less He spent', 'Schließe Spire {0} ohne Respec und mit höchstens {1} ausgegebenem He ab'],
        Imploderated:['Beat Imploding Star on Obliterated', 'Schließe Imploding Star in Obliterated ab'],
        Wildfire:['Close 750 Nurseries at the same time', 'Habe 750 Kinderstuben gleichzeitig geschlossen'],
        Unessenceted:['Earn Dark Essence with no respec and 0 He spent', 'Verdiene Dark Essence ohne Respec und ohne ausgegebenes He'],
        Melted:['Reach Magma on Obliterated', 'Erreiche in Obliterated die Magma-Zonen'],
        Screwed:['Break the Planet on Eradicated', 'Zerbrich den Planeten in Eradicated'],
        // Universe 2
        'Eliter Feat':['Reach exactly 1337 Rn/Hr', 'Erreiche genau 1337 Rn/Std.'],
        "Don't Need Luck":['One-shot a Dimension of Rage enemy on Unlucky while Unlucky', 'Erschlage in Unlucky einen Gegner der Dimension of Rage mit einem Treffer, während Unlucky auf dir liegt'],
        'Perfectly Balanced':['Complete Downsize with an equal amount of Huts, Houses, Mansions, Hotels and Resorts', 'Schließe Downsize mit gleich vielen Hütten, Häusern, Villen, Hotels und Resorts ab'],
        Resourceyphobe:['Complete Transmute without hiring a single Trimp', 'Schließe Transmute ab, ohne einen einzigen Scruffy einzustellen'],
        Upsized:['Complete Unbalance with 500 stacks of Unbalance', 'Schließe Unbalance mit 500 Stapeln Unbalance ab'],
        Unpoppable:['Complete Bublé without using Prismal or respeccing Perks', 'Schließe Bublé ab, ohne Prismal zu nutzen oder deine Perks mit Respec neu zu verteilen'],
        Pwnd:['Complete Duel without ever falling below 20 points', 'Schließe Duel ab, ohne je unter 20 Punkte zu fallen'],
        Solid:['Complete Melt without ever having more than 150 stacks', 'Schließe Melt ab, ohne je mehr als 150 Stapel zu haben'],
        Coastapalooza:['Complete Trappapalooza without Trapping on or above Z50', 'Schließe Trappapalooza ab, ohne ab Z50 Fallen zu stellen'],
        Witherproof:['Complete Wither with {} stacks of Hardened', 'Schließe Wither mit {0} Stapeln Hardened ab'],
        Huffstle:['Reach a session score of 100-0 at L5+ in SA', 'Erreiche in SA ab L5 einen Sitzungsstand von 100-0'],
        'Just Smack It':['Kill a L20+ SA Enemy without Shock, Bleed or Poison', 'Erschlage in SA einen Gegner ab L20 ohne Shock, Bleed und Poison'],
        'Close Call':['Complete Revenge with exactly 19 stacks', 'Schließe Revenge mit genau 19 Stapeln ab'],
        'Level Up':['Complete 80/80 quests on Quest', 'Schließe in Quest 80/80 Quests ab'],
        Unassisted:['Complete Archaeology without ever having more than 0 of one Relic', 'Schließe Archaeology ab, ohne je mehr als 0 von einem Relikt zu haben'],
        'Clear Skies':['Complete Storm without ever encountering a Stormcloud', 'Schließe Storm ab, ohne je einer Stormcloud zu begegnen'],
        'Actually Insane':['Complete Insanity with 500 stacks without running a map above lvl 50', 'Schließe Insanity mit 500 Stapeln ab, ohne eine Map über Level 50 zu spielen'],
        "You're Doing it Wrong":['Finish Berserk after reaching 20 Weakened Stacks before Z100', 'Schließe Berserk ab, nachdem du vor Z100 20 Weakened-Stapel erreicht hast'],
        'The Tortoise and the Bugs':['Reach 100 Swarm Stacks before Z120 then complete Exterminate', 'Erreiche vor Z120 100 Swarm-Stapel und schließe dann Exterminate ab'],
        'Nurtured AF':['Reach L19 Cruffys by Z70 then complete Nurture', 'Bringe Cruffys bis Z70 auf L19 und schließe dann Nurture ab'],
        'Heavy Trinker':['Collect 7500 Runetrinkets', 'Sammle 7500 Runetrinkets'],
        Peace:['Complete all 25 Mayhems', 'Schließe alle 25 Mayhems ab'],
        'Mad Scientist':['Complete a Z155 Void Map with 10 Gas Brews and 0 Void Pots', 'Schließe eine Void Map in Z155 mit 10 Gas Brews und 0 Void Pots ab'],
        'Burn Baby Burn':['Complete Hypothermia with at least 400 Embers', 'Schließe Hypothermia mit mindestens 400 Embers ab'],
        Unbreakable:['Complete Glass without ever having more than 2 stacks', 'Schließe Glass ab, ohne je mehr als 2 Stapel zu haben'],
        'Heroic Huffy':['Beat a level 100 SA Enemy', 'Besiege in SA einen Gegner auf Level 100'],
        'Double Trouble':['Kill a Bad Guy with two different Mutations', 'Erschlage einen Gegner mit zwei verschiedenen Mutationen']
    };
    // Head of the window: the random line after the bonus (toggleAchievementWindow in updates.js), help and fixed lines.
    // The head reads "You are dealing 5% extra damage" + line + "."; German lines keep the leading comma or space.
    const lines = {
        ', better get some more achievements':', besorg dir besser noch ein paar Erfolge', ", you'd do fine with a few more achievements":', ein paar Erfolge mehr würden dir guttun',
        'but you wish you had a few more achievements':'und wünschst dir trotzdem ein paar Erfolge mehr',
        ', your achievement game shows promise':', dein Erfolgsspiel ist vielversprechend', 'on your path to achievement':'auf deinem Weg zum Erfolg', ', thanks to your achievements':', dank deiner Erfolge',
        ', thanks to your bounty of achievements':', dank deiner Fülle an Erfolgen', ', must be all those achievements':', das liegt bestimmt an den vielen Erfolgen',
        ', you are one with the achievements':', du bist eins mit den Erfolgen', 'and you water your achievements daily':'und gießt deine Erfolge täglich',
        ', your Trimps are mighty impressed':', deine Scruffies sind mächtig beeindruckt', ', your achievements are mind blowing':', deine Erfolge sind umwerfend',
        '. You wake up, achieve, then sleep':'. Du wachst auf, hast Erfolg und schläfst wieder', ', you have achievement in your blood':', dir liegt der Erfolg im Blut',
        ', your achievements are beyond mortal comprehension':', deine Erfolge übersteigen jedes sterbliche Verständnis',
        ', Trimps far and wide tell stories of your achievement':', Scruffies nah und fern erzählen von deinen Erfolgen', ', you have achieved achievement':', du hast den Erfolg erreicht',
        ', everything you touch turns to achievement':', alles, was du berührst, wird zu Erfolg',
        ', your achievements have achieved achievement':', deine Erfolge haben Erfolg', ', news of your achievement spreads throughout the galaxy':', die Kunde deiner Erfolge verbreitet sich in der ganzen Galaxie',
        ', achievements bend to your will':', Erfolge beugen sich deinem Willen', ', your achievements transcend reality':', deine Erfolge übersteigen die Wirklichkeit',
        ', word of your achievement spreads throughout the universe':', die Kunde deiner Erfolge verbreitet sich im ganzen Universum', ', everyone else is super jealous':', alle anderen sind super neidisch',
        ', the achievements of your achievements have achieved achievement':', die Erfolge deiner Erfolge haben Erfolg', ', your achievements have gained sentience':', deine Erfolge haben ein Bewusstsein erlangt',
        ', everyone else just stays home':', alle anderen bleiben einfach zu Hause', ", you appear if someone says 'Achievement' 3 times in a mirror":', du erscheinst, wenn jemand dreimal ‚Erfolg‘ in einen Spiegel sagt',
        ', news of your achievement spreads throughout the multiverse':', die Kunde deiner Erfolge verbreitet sich im ganzen Multiversum', ". It's actually over 9000":'. Es sind tatsächlich über 9000',
        ', everyone else is legitimately impressed':', alle anderen sind ernsthaft beeindruckt', ', your great great grand achievements have achieved achievement':', die Ururenkel deiner Erfolge haben Erfolg',
        'If achievement was a game, you would win':'Wäre Erfolg ein Spiel, würdest du gewinnen',
        '. You achieved enlightenment, then your enlightenment started achieving':'. Du hast Erleuchtung erlangt, dann hat deine Erleuchtung Erfolge gesammelt',
        ', your Trimps tell all their friends how cool you are':', deine Scruffies erzählen allen Freunden, wie cool du bist', ', you now gain your sustenance from achievements':', du ernährst dich jetzt von Erfolgen',
        ', your achievements bring all the Trimps to the Barn':', deine Erfolge locken alle Scruffies in die Scheune',
        'Achievements':'Erfolge', 'You are dealing':'Du verursachst', '% extra damage':'% zusätzlichen Schaden',
        'You can earn achievements by doing stuff. Each achievement will boost the amount of damage your Trimps can deal, and later achievements grant a larger bonus. You can learn more about an achievement by hovering your mouse over it.':
            'Erfolge erhältst du, indem du Dinge tust. Jeder Erfolg erhöht den Schaden deiner Scruffies, und spätere Erfolge bringen einen größeren Bonus. Mehr über einen Erfolg erfährst du, wenn du ihn antippst.',
        'Click on an Achievement on this screen to track it!':'Tippe hier auf einen Erfolg, um ihn zu verfolgen!',
        'You have completed every Achievement!':'Du hast alle Erfolge abgeschlossen!',
        // Detail, popup and tracker (displayAchievementPopup, trackAchievement), screen reader table (displayAchievements).
        'Locked':'Gesperrt', 'Reward:':'Belohnung:', 'Progress:':'Fortschritt:', 'Complete!':'Abgeschlossen!', 'Not Earnable!':'Nicht erreichbar!', 'Still Earnable!':'Noch erreichbar!',
        'Row Finished!':'Reihe abgeschlossen!', 'Achievement Tier Values':'Werte der Erfolgsstufen', 'Not complete, failed for this run.':'Nicht abgeschlossen, in diesem Durchlauf gescheitert.',
        'Not complete':'Nicht abgeschlossen', "You're in the wrong Universe!":'Du bist im falschen Universum!', 'This run is already too long!':'Dieser Durchlauf dauert schon zu lange!', 'Completed':'Abgeschlossen',
        // Progress lines without values (humaneRun, mapless, shielded)
        'You need to portal to become eligible':'Nutze erst das Portal, um teilnehmen zu können', 'You lost too many fights!':'Du hast zu viele Kämpfe verloren!',
        "You've lost once this Zone, be careful!":'Du hast in dieser Zone schon einmal verloren, sei vorsichtig!', 'You must be in Universe 2!':'Du musst in Universum 2 sein!', 'Already earned!':'Schon erreicht!',
        // Compatibility notice for old saves (tooltip 'New Achievements' in updates.js; text and buttons, the title stays).
        'The universe has taken an interest in your achievements, and has begun tracking them. You already have some completed thanks to your previous adventures, would you like to see them?':
            'Das Universum interessiert sich für deine Erfolge und hat begonnen, sie zu verfolgen. Dank deiner bisherigen Abenteuer hast du schon einige abgeschlossen. Möchtest du sie sehen?',
        'Check Achievements':'Erfolge ansehen', 'No, That Sounds Dumb':'Nein, das klingt doof'
    };
    const strings = {};
    for (const [english, german] of Object.entries(lines)) { strings[english] = german; strings[brand(english)] = german; }
    // A feat or template with {} becomes an anchored pattern on the branded text; plain ones are exact strings.
    const patterns = [];
    for (const [english, german] of Object.values(feats)) {
        if (!english.includes('{}')) { strings[english] = german; strings[brand(english)] = german; continue; }
        const pattern = new RegExp('^' + brand(english).split('{}').map(esc).join('([^<>]*?)') + '$');
        patterns.push([pattern, (_, ...values) => german.replace(/\{(\d)\}/g, (m, i) => values[i])]);
    }
    // Times of formatMinutesForDescriptions (main.js): "5 mins", "1 min", "2 hours", "1:30".
    const time = value => {
        let m;
        if ((m = value.match(/^(\d+) mins?$/))) return m[1] + ' Min.';
        if ((m = value.match(/^(\d+) hours?$/))) return m[1] + ' Std.';
        if (/^\d+:\d\d$/.test(value)) return value + ' Std.';
        return value;
    };
    // Real Estate: German name of the building (stage 2 names) with its article.
    const buildingNames = {Hut:'Hütte', House:'Haus', Mansion:'Villa', Hotel:'Hotel', Resort:'Resort', Gateway:'Dimensionstor', Wormhole:'Wurmloch', Collector:'Sammler', Warpstation:'Warpstation'};
    const first = {Hut:'deine erste', Mansion:'deine erste', Warpstation:'deine erste', Collector:'deinen ersten'};
    const places = {'the Spire':'die Spire'};
    // Descriptions of the tier groups (description(number) in config.js), on the branded text.
    const describe = [
        [/^Complete Zone (\d+)$/, (_, n) => 'Schließe Zone ' + n + ' ab'],
        [/^Complete Zone (\d+) in Universe 2$/, (_, n) => 'Schließe Zone ' + n + ' in Universum 2 ab'],
        [/^Reach\s+(.+?) displayed damage$/, (_, n) => 'Erreiche ' + n + ' angezeigten Schaden'],
        [/^Have\s+(.+?) total Scruffies$/, (_, n) => 'Besitze insgesamt ' + n + ' Scruffies'],
        [/^Build your first\s+(Hut|House|Mansion|Hotel|Resort|Gateway|Wormhole|Collector|Warpstation)$/, (_, key) => 'Baue ' + (first[key] || 'dein erstes') + ' ' + buildingNames[key]],
        [/^Use the Dimensional Generator$/, () => 'Nutze den Dimensional Generator'],
        [/^Use the Portal\s+(.+?) times?$/, (_, n) => 'Nutze das Portal ' + (n === '1' ? 'einmal' : n + '-mal')],
        [/^Clear\s+(.+?) total (Zones|Maps)$/, (_, n, what) => 'Schließe insgesamt ' + n + ' ' + (what === 'Zones' ? 'Zonen' : 'Maps') + ' ab'],
        [/^Gather\s+(.+?) total (Helium|Radon)$/, (_, n, what) => 'Sammle insgesamt ' + n + ' ' + what],
        [/^Reach\s+(.+?) Helium Per Hour$/, (_, n) => 'Erreiche ' + n + ' Helium pro Stunde'],
        [/^Collect\s+(.+?) (Heirloom|Gem)(s?)$/, (_, n, what, s) => 'Sammle ' + n + ' ' + (what === 'Heirloom' ? (s ? 'Heirlooms' : 'Heirloom') : (s ? 'Edelsteine' : 'Edelstein'))],
        [/^Earn\s+(.+?) Helium from the Daily Challenge$/, (_, n) => 'Verdiene ' + n + ' Helium durch die Daily Challenge'],
        [/^Collect\s+(.+?) Mutated Seeds$/, (_, n) => 'Sammle ' + n + ' Mutated Seeds'],
        [/^Reach Z(\d+) after losing no more than one fight per Zone\.$/, (_, n) => 'Erreiche Z' + n + ' und verliere dabei höchstens einen Kampf pro Zone.'],
        [/^Reach U2 Z(\d+) without ever entering a Map\.$/, (_, n) => 'Erreiche in U2 Z' + n + ', ohne je eine Map zu betreten.'],
        [/^Reach U2 Z(\d+) without your Shield falling below (\d+)%\.$/, (_, n, p) => 'Erreiche in U2 Z' + n + ', ohne dass dein Prismatic Shield unter ' + p + '% fällt.'],
        [/^Clear\s+(.+?) in less than ([^<>]+?) from start of run$/, (_, place, t) => 'Schließe ' + (places[place] || place) + ' in weniger als ' + time(t) + ' nach Beginn des Durchlaufs ab'],
        [/^Defeat Stuffy in less than ([^<>]+?) from start of run$/, (_, t) => 'Besiege Stuffy in weniger als ' + time(t) + ' nach Beginn des Durchlaufs']
    ];
    // Progress lines (progress() in config.js).
    const progress = [
        [/^Highest is (.+)$/, (_, n) => 'Höchster Wert: ' + n],
        [/^Currently at (.+)$/, (_, n) => 'Derzeit ' + n],
        [/^Best run is (.+)$/, (_, t) => 'Bester Durchlauf: ' + time(t)],
        [/^(\S+) total$/, (_, n) => n + ' insgesamt'],
        [/^You lost more than once on Z(\d+)$/, (_, n) => 'Du hast in Z' + n + ' mehr als einmal verloren'],
        [/^You ran a Map on Z(\d+)$/, (_, n) => 'Du hast in Z' + n + ' eine Map gespielt'],
        [/^Your Shield has already hit (\S+)% this run\.$/, (_, n) => 'Dein Prismatic Shield ist in diesem Durchlauf schon auf ' + n + '% gefallen.'],
        [/^Still Earnable! Lowest is (\S+)%$/, (_, n) => 'Noch erreichbar! Tiefster Wert: ' + n + '%']
    ];
    // A progress value inside a composed line: German already (the source is translated) or translated here.
    const inner = value => {
        if (Object.hasOwn(strings, value)) return strings[value];
        for (const [pattern, replace] of progress) { const m = value.match(pattern); if (m) return replace(...m); }
        return value;
    };
    // Descriptions of the speed and run groups come wrapped in a small-font span; the span stays around the German text.
    const span = "<span style='font-size: .8em'>";
    for (const [pattern, replace] of describe) {
        patterns.push([pattern, replace]);
        patterns.push([new RegExp('^' + esc(span) + pattern.source.slice(1, -1) + '</span>$'), (_, ...m) => span + replace(_, ...m) + '</span>']);
    }
    patterns.push(...progress,
        // Detail, popup and tracker lines around the progress (displayAchievementPopup)
        [/^Speed: Spire (\S+)$/, (_, n) => 'Tempo: Spire ' + n],
        [/^Progress: (Too slow! )?(.+)$/, (_, slow, value) => 'Fortschritt: ' + (slow ? 'Zu langsam! ' : '') + inner(value)],
        [/^Row Finished! \((.+)\)$/, (_, value) => 'Reihe abgeschlossen! (' + inner(value) + ')'],
        [/^You're in the wrong Universe! (.+)$/, (_, value) => 'Du bist im falschen Universum! ' + inner(value)],
        [/^\+(\S+)% Damage$/, (_, n) => '+' + n + '% Schaden'],
        // Own status line of mobile-design.js and the screen reader table
        [/^Level (\d+) · (Completed|Available now|Unavailable this run|Not completed)$/, (_, n, state) => 'Stufe ' + n + ' · ' +
            ({Completed:'Abgeschlossen', 'Available now':'Jetzt erreichbar', 'Unavailable this run':'In diesem Durchlauf nicht erreichbar', 'Not completed':'Nicht abgeschlossen'})[state]],
        [/^Tier (\d+) is worth (\S+)% damage$/, (_, n, value) => 'Stufe ' + n + ' bringt ' + value + '% Schaden'],
        // The screen reader table writes "Locked" and ", Tier N" into one text node (updates.js).
        [/^Locked, Tier (\d+)$/, (_, n) => 'Gesperrt, Stufe ' + n],
        [/^(.*), Tier (\d+)$/, (_, name, n) => name + ', Stufe ' + n],
        // Golden Upgrades under the bonus (setGoldenBonusAchievementText in updates.js)
        [/^You will find one Golden Upgrade every (\d+) Zones\.(?: Frequency increases at (\S+)% bonus damage\.)?(?: Start with 1 extra Golden Upgrade after each Portal for every (\S+)% earned (?:between (\S+?)%? and (\S+)|above (\S+))%\. Currently gaining (\S+) extra Golden Upgrades?\.)?$/,
            (_, every, next, step, from, to, above, count) => 'Alle ' + every + ' Zonen findest du ein Goldenes Upgrade.' +
                (next ? ' Ab ' + next + '% Bonusschaden kommen sie häufiger.' : '') +
                (step ? ' Nach jedem Portal startest du mit 1 zusätzlichen Goldenen Upgrade je ' + step + '% ' + (above ? 'über ' + above + '%' : 'zwischen ' + from + '% und ' + to + '%') +
                    '. Derzeit erhältst du ' + count + ' ' + one(count, 'zusätzliches Goldenes Upgrade', 'zusätzliche Goldene Upgrades') + '.' : '')]);
    // Cheap prefilter: the start of every text the patterns above translate.
    const probe = new RegExp('^(?:' + esc(span) + ')?(?:Complete Zone |Reach |Have\\s|Build your first|Use the |Clear |Gather |Collect |Earn |Defeat Stuffy |Highest is |Currently at |Best run is |Speed: Spire |You(?:\'re)? |Your Shield |Still Earnable! Lowest|Progress: |Row Finished! \\(|\\+\\S+% Damage$|Level \\d+ · |Tier \\d+ is worth )|^\\S+ total$|, Tier \\d+$|' +
        Object.values(feats).filter(([english]) => english.includes('{}')).map(([english]) => '^' + esc(brand(english).split('{}')[0])).join('|'));
    // Screen reader notice when an achievement is reached (displayAchievementPopup): the name stays, the description is German.
    const notice = text => typeof text === 'string' && text.startsWith('Completed Achievement! ') ? 'Erfolg erreicht! ' + text.slice(23) : text;
    // Only lines around the names; the names (titles of detail, popup and tracker) are checked unchanged in the tests.
    const scope = '#achievementHeader,#achievementHelpContainer,#achievementHoverTitle,#achievementHoverDescription,#achievementHoverProgress,#achievementHoverReward,' +
        '#achievementPopupTitle,#achievementPopupDescription,#achievementPopupReward,#achievementTrackerTitle,#achievementTrackerDescription,#achievementTrackerProgress,' +
        '#achievementTrackerReward,#achievementsHere .mobile-achieve-status,.screenReaderAchievements';
    const catalog = {strings, patterns, probe, fields:{achievements:['title', 'description', 'progress']}, scope, titles, feats, lines, notice, time};
    if (typeof game !== 'undefined' && game) for (const [key, german] of Object.entries(titles)) {
        try { const english = game.achievements[key] && game.achievements[key].title; if (typeof english === 'string') strings[english] = german; } catch (e) { /* title getter before main.js */ }
    }
    if (typeof MobileI18nGame !== 'undefined' && MobileI18nGame.extend('de', catalog) && typeof window !== 'undefined') {
        const root = window;
        // Title of the compatibility notice: only the shown title changes, lastTooltipTitle keeps 'New Achievements'.
        if (typeof root.tooltip === 'function') {
            const original = root.tooltip;
            root.tooltip = function (what, ...rest) {
                const result = original.call(this, what, ...rest), title = typeof document !== 'undefined' && document.getElementById('tipTitle');
                if (!title) return result;
                if (what === 'New Achievements' && title.textContent === 'New Achievements') { title.textContent = 'Neue Erfolge'; title.lang = 'de'; title.dataset.i18nAchievements = ''; }
                else if ('i18nAchievements' in title.dataset) { delete title.dataset.i18nAchievements; if (!('i18nGame' in title.dataset)) title.removeAttribute('lang'); }
                return result;
            };
        }
        if (typeof root.screenReaderAssert === 'function') { const original = root.screenReaderAssert; root.screenReaderAssert = function (text, ...rest) { return original.call(this, notice(text), ...rest); }; }
        // With every achievement done, the original writes its sentence straight into #achievementsHere (not watched, the names
        // live there); the German sentence is written once in its place.
        if (typeof root.displayAchievements === 'function') {
            const original = root.displayAchievements;
            root.displayAchievements = function (...args) {
                const result = original.apply(this, args), list = typeof document !== 'undefined' && document.getElementById('achievementsHere');
                if (list && list.textContent.trim() === 'You have completed every Achievement!') list.innerHTML = '<br/><br/><span lang="de">' + strings['You have completed every Achievement!'] + '</span>';
                return result;
            };
        }
    }
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeAchievements;
