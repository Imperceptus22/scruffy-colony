// V-243 step 3: German lines of the message log (message() in updates.js). Keys are the original English sentence or the
// sentence after branding (Scruffies, renamed enemies); patterns always see the branded sentence, so enemy names arrive
// renamed. Map, Zone, Helium, Heirloom, Portal, Perk and Challenge stay English as in the glossary; names of unique maps
// (The Block, Bionic Wonderland …) and caches stay English because the map list shows them so. Numbers keep the format
// of prettify() ("1.5K"). Texts here never contain ASCII double quotes, so they are safe wherever the original quotes HTML.
var MobileI18nDeLog = (() => {
    const names = typeof MobileI18nDeGame === 'undefined' ? {equipment:{}} : MobileI18nDeGame.names;
    // Story: hints when something new appears (game.triggers in config.js), new runs, the Void and the zone texts of
    // Universe 1 up to Zone 100 (getWorldText in updates.js; the zone mark "Z:12 " is kept by the mechanism).
    const story = {
        "Maybe there's something meaty and delicious here to Trap.": 'Vielleicht gibt es hier etwas Fleischiges und Leckeres zu fangen.',
        "It's time to get some Trimps up in here.": 'Zeit, ein paar Scruffies hierherzuholen.',
        "You'll need some wood to build stuff...": 'Zum Bauen brauchst du etwas Holz …',
        'Ah wood, the building material of kings. The building material of everyone else too, but still.': 'Ah, Holz, das Baumaterial der Könige. Und auch das aller anderen, aber trotzdem.',
        'The food stores are getting pretty full, maybe you should start thinking about a Barn.': 'Die Nahrungsvorräte werden ziemlich voll. Vielleicht solltest du über eine Scheune nachdenken.',
        'You almost forgot how to build a Barn, but now you remember. Proud of you!': 'Fast hättest du vergessen, wie man eine Scheune baut, aber jetzt fällt es dir wieder ein. Stolz auf dich!',
        'A nice Shed would allow you to keep more wood on hand.': 'Mit einem schönen Schuppen hättest du mehr Holz zur Hand.',
        "Wet wood won't work! Better get a Shed going.": 'Nasses Holz taugt nichts! Zeit für einen Schuppen.',
        'A nice Forge would allow you to store more metal.': 'In einer schönen Schmiede könntest du mehr Metall lagern.',
        'What better place to store metal than a building that can smelt it?': 'Wo ließe sich Metall besser lagern als in einem Gebäude, das es schmelzen kann?',
        "There's a weird impish little creature in the trap. A Trimp, you decide to call it. Since you're so creative, you could probably train this Trimp to help out.":
            'In der Falle sitzt ein seltsames, koboldhaftes kleines Wesen. Du beschließt, es Scruffy zu nennen. Kreativ, wie du bist, könntest du diesem Scruffy bestimmt beibringen, dir zu helfen.',
        'You caught your very first Trimp in this new dimension! It can smell other Trimps on you and looks confused. You promptly send him off to work!':
            'Du hast deinen allerersten Scruffy in dieser neuen Dimension gefangen! Er riecht andere Scruffies an dir und schaut verwirrt. Du schickst ihn sofort an die Arbeit!',
        'This planet feels so familiar, yet so foreign. Maybe it\'s time to start sciencing things.': 'Dieser Planet wirkt so vertraut und doch so fremd. Vielleicht ist es Zeit, mit dem Forschen anzufangen.',
        "Where would you be in life without Science? Not this dimension, that's for sure.": 'Wo wärst du ohne Wissenschaft? Jedenfalls nicht in dieser Dimension.',
        'War... what is it good for? Exploration, or something.': 'Krieg … wofür ist der gut? Für Erkundung oder so.',
        'As you finally step out into the Battle Zones, the first thing you notice is that your Heirlooms feel weaker here. Oh well, 1000 more times into the fray...':
            'Als du endlich in die Kampfzonen trittst, merkst du als Erstes, dass sich deine Heirlooms hier schwächer anfühlen. Na ja, noch 1000 Mal ins Getümmel …',
        "Doesn't seem like all of these little guys will fit in your ship. Luckily, you remember how to make small huts for shelter.":
            'Sieht nicht so aus, als passten all die Kleinen in dein Schiff. Zum Glück weißt du noch, wie man kleine Hütten als Unterschlupf baut.',
        'The newly established Trimp zoning committee is too busy drooling to approve anything, so you take it on yourself to start building some Huts.':
            'Der neu gegründete Bauausschuss der Scruffies ist zu sehr mit Sabbern beschäftigt, um irgendetwas zu genehmigen. Also baust du selbst ein paar Hütten.',
        "It's starting to get pretty crowded up in here. Maybe you should start building some better housing.": 'Langsam wird es hier ziemlich voll. Vielleicht solltest du bessere Unterkünfte bauen.',
        'The TZC has finally approved a House blueprint. To your surprise, it looks fairly decent! You decide to immediately build some.':
            'Der Bauausschuss hat endlich einen Bauplan für ein Haus genehmigt. Zu deiner Überraschung sieht er ganz ordentlich aus! Du baust sofort ein paar.',
        'Your Trimps look really bored.': 'Deine Scruffies sehen richtig gelangweilt aus.',
        "Better hurry up to the fighting Zones so you don't have to sit around here all day watching Trimps breed.":
            'Beeil dich lieber in die Kampfzonen, damit du nicht den ganzen Tag hier herumsitzt und den Scruffies beim Vermehren zusiehst.',
        "Apparently the Trimps breed if they're not working. Doesn't look pleasant.": 'Offenbar vermehren sich die Scruffies, wenn sie nicht arbeiten. Sieht nicht angenehm aus.',
        'A green shimmer erupts then disappears, and you hit the ground. You look pretty hungry...': 'Ein grüner Schimmer flammt auf und verschwindet, und du landest auf dem Boden. Du siehst ziemlich hungrig aus …',
        "A blue shimmer erupts then disappears as you gracefully take its place. You look like you don't belong here... Well, better start gathering some food.":
            'Ein blauer Schimmer flammt auf und verschwindet, während du elegant seinen Platz einnimmst. Du siehst aus, als gehörtest du nicht hierher … Na dann, sammle lieber etwas Nahrung.',
        'Use of the portal has created a chance for the Void to seep into your world. Be alert.': 'Durch das Portal kann nun die Leere in deine Welt sickern. Sei wachsam.',
        // Zone texts, Universe 1
        "Your Trimps killed a lot of Bad Guys back there. It seems like you're getting the hang of this. However, the world is large, and there are many more Zones to explore. Chop chop.":
            'Deine Scruffies haben dort hinten viele Gegner erledigt. Du scheinst den Dreh rauszuhaben. Aber die Welt ist groß, und es gibt noch viele Zonen zu erkunden. Hopp, hopp.',
        'By your orders, your scientists have begun to try and figure out how large this planet is.': 'Auf deinen Befehl versuchen deine Forscher nun herauszufinden, wie groß dieser Planet ist.',
        'This planet seems so cold and lonely without Science.': 'Ohne Wissenschaft wirkt dieser Planet so kalt und einsam.',
        'You order your Trimps to search the area for the keys to your ship, but nobody finds anything. Bummer.': 'Du lässt deine Scruffies die Gegend nach den Schlüsseln deines Schiffs absuchen, aber niemand findet etwas. Mist.',
        "Do you see that thing at the end of this Zone? It's huge! It's terrifying! You've never seen anything like it before, but you know that it is a Blimp. How did you know that? Stop knowing things and go kill it.":
            'Siehst du das Ding am Ende dieser Zone? Es ist riesig! Es ist furchterregend! So etwas hast du noch nie gesehen, aber du weißt, dass es ein Bloatby ist. Woher weißt du das? Hör auf, Dinge zu wissen, und erledige ihn.',
        'You step over the corpse of the Blimp as it rapidly deflates, and one of your Trimps chuckles at the sound produced. You all cross the sulfuric river to the next Zone, and can feel the presence of an ancient knowledge. Better explore.':
            'Du steigst über den Bloatby, der schnell in sich zusammensackt, und einer deiner Scruffies kichert über das Geräusch. Gemeinsam überquert ihr den Schwefelfluss zur nächsten Zone und spürt die Gegenwart uralten Wissens. Besser erkunden.',
        "Slow and steady wins the race. Unless you're racing someone who is actually trying.": 'Wer langsam und stetig läuft, gewinnt das Rennen. Außer gegen jemanden, der sich wirklich anstrengt.',
        "Your settlement is getting crowded, there's Trimps in the streets, and you're taking heat. You feel a sudden strong desire to create a map, though you're not quite sure how that would help.":
            'Deine Siedlung wird voll, Scruffies drängen sich auf den Straßen, und du stehst unter Druck. Plötzlich verspürst du den starken Wunsch, eine Map zu erstellen, auch wenn du nicht genau weißt, wie das helfen soll.',
        "You can't shake the feeling that you've been here before. Déjà-vu?": 'Du wirst das Gefühl nicht los, schon einmal hier gewesen zu sein. Déjà-vu?',
        'Looks like another Blimp up ahead. Hard to tell from far away, but it looks like it has more heads than the last one.': 'Da vorne scheint noch ein Bloatby zu sein. Aus der Ferne schwer zu sagen, aber er scheint mehr Köpfe zu haben als der letzte.',
        "You're unstoppable as long as nothing stops you. Unfortunately, it seems like something really wants to stop you.": 'Du bist unaufhaltsam, solange dich nichts aufhält. Leider scheint dich etwas wirklich aufhalten zu wollen.',
        'Did you see that green light flash by? Weird. Oh well.': 'Hast du das grüne Licht vorbeihuschen sehen? Seltsam. Na ja.',
        "Your scientists have finally concluded their report on the analysis of the size of the world. According to the report, they're pretty sure it's infinitely large, but you're pretty sure they just got bored of checking.":
            'Deine Forscher haben endlich ihren Bericht über die Größe der Welt abgeschlossen. Laut Bericht ist sie ziemlich sicher unendlich groß, aber du bist ziemlich sicher, dass ihnen das Nachmessen einfach zu langweilig wurde.',
        'You were trying to help bring back some of the Equipment your Trimps left on the ground in that last Zone, and you got a splinter. This planet is getting dangerous, stay alert.':
            'Du wolltest Ausrüstung einsammeln, die deine Scruffies in der letzten Zone liegen gelassen haben, und hast dir einen Splitter eingezogen. Dieser Planet wird gefährlich, bleib wachsam.',
        'Another day, another Blimp at the end of the Zone.': 'Ein neuer Tag, ein neuer Bloatby am Ende der Zone.',
        'Seriously? Another Blimp so soon?': 'Im Ernst? Schon wieder ein Bloatby?',
        'You climb a large cliff and look out over the new Zone. Red dirt, scorched ground, and devastation. Is that a Dragimp flying around out there?!':
            'Du erkletterst eine hohe Klippe und blickst über die neue Zone. Rote Erde, versengter Boden und Verwüstung. Fliegt da draußen etwa ein Draken herum?!',
        'There seems to be a strange force urging you to keep going. The atmosphere is becoming... angrier. Part of you wants to turn around and go back, but most of you wants to keep going.':
            'Eine seltsame Kraft scheint dich weiterzutreiben. Die Atmosphäre wird … zorniger. Ein Teil von dir möchte umkehren, aber der größte Teil will weiter.',
        "You look behind and see your kingdom. You have gems, a colony, and territory. You wonder if enough Trimps have already fallen in battle. After contemplation, one word falls out of your mouth as you begin to move forward. 'Nah'":
            'Du blickst zurück auf dein Reich. Du hast Edelsteine, eine Kolonie und Land. Du fragst dich, ob schon genug Scruffies im Kampf gefallen sind. Nach kurzem Nachdenken kommt dir ein einziges Wort über die Lippen, während du weitergehst: ‚Nö‘',
        "You can sense that you're close to your goal.": 'Du spürst, dass du deinem Ziel nahe bist.',
        "Strange, the sky seems to be getting darker. You ask one of your Trimps for the time, but he doesn't know what a clock is.": 'Seltsam, der Himmel scheint dunkler zu werden. Du fragst einen deiner Scruffies nach der Uhrzeit, aber er weiß nicht, was eine Uhr ist.',
        "You're a rebel. The universe pointed you into that portal, but you kept pushing forward. You feel... less like you've been here before.":
            'Du bist ein Rebell. Das Universum hat dich zu diesem Portal geführt, aber du bist weitergegangen. Du hast … weniger das Gefühl, schon einmal hier gewesen zu sein.',
        'It seems like the further you press on, the less you know. You still feel an urge to use the portal, though the urge has begun to dwindle.':
            'Je weiter du vordringst, desto weniger scheinst du zu wissen. Du verspürst immer noch den Drang, das Portal zu benutzen, aber er lässt nach.',
        "Your Trimps came up with a pretty catchy battle song that got stuck in your head. None of them survived the next fight though, and you can't remember most of it. Life's tough.":
            'Deine Scruffies haben sich ein ziemlich eingängiges Kampflied ausgedacht, das dir nicht mehr aus dem Kopf geht. Den nächsten Kampf hat allerdings keiner von ihnen überlebt, und du weißt das meiste nicht mehr. Das Leben ist hart.',
        'You climb over a large hill that was separating this Zone from the last. The sky is pitch black and lightning crackles in the distance. This is a site of heavy corruption.':
            'Du kletterst über einen großen Hügel, der diese Zone von der letzten trennt. Der Himmel ist pechschwarz, und in der Ferne zucken Blitze. Hier herrscht starke Corruption.',
        "You start to wonder how long you've been doing the same thing over and over. There must be something you can do to start to break the cycle. Perhaps you could alter the portal...":
            'Du fragst dich langsam, wie lange du schon immer wieder dasselbe tust. Es muss doch etwas geben, um diesen Kreislauf zu durchbrechen. Vielleicht könntest du das Portal verändern …',
        "You can't help but notice that the Trimps seem to be the only creatures on this planet not immediately hostile towards outsiders. You ask a nearby Trimp soldier what he thinks you are, and he drools a bit.":
            'Dir fällt auf, dass die Scruffies die einzigen Wesen auf diesem Planeten zu sein scheinen, die Fremden nicht sofort feindlich begegnen. Du fragst einen Scruffy-Soldaten in der Nähe, was er glaubt, was du bist, und er sabbert ein bisschen.',
        "The world seems so barren out this far. You feel like you're finally starting to get ahead of the curve, but you know by now not to get comfortable.":
            'So weit draußen wirkt die Welt so öde. Du hast das Gefühl, endlich die Nase vorn zu haben, aber inzwischen weißt du, dass man es sich nicht bequem machen sollte.',
        'Each day and night seems to grow longer than the one before. Is time slowing down? Argh! You fall to your knees with a splitting headache and a strong desire to use the portal. After a few minutes, it passes and you forget what happened. What are we talking about?':
            'Jeder Tag und jede Nacht scheint länger zu dauern als die davor. Wird die Zeit langsamer? Argh! Mit rasenden Kopfschmerzen und dem starken Wunsch, das Portal zu benutzen, gehst du in die Knie. Nach ein paar Minuten ist es vorbei, und du hast vergessen, was passiert ist. Wovon reden wir gerade?',
        'All traces of hills and mountains have long since been trudged past. The world is flat and hostile. You wish your Trimps were better conversationalists.':
            'Hügel und Berge liegen längst hinter euch. Die Welt ist flach und feindselig. Du wünschtest, deine Scruffies wären bessere Gesprächspartner.',
        "As your Trimps scavenge every last bit of helium from that Blimp, one of them begins freaking out. He runs around waving his little arms and making funny noises for a while, eats some dirt, then takes a little nap. You wonder if that's normal. Yeah... probably fine.":
            'Während deine Scruffies das letzte bisschen Helium aus dem Bloatby kratzen, dreht einer von ihnen durch. Er rennt eine Weile mit wedelnden Ärmchen und komischen Geräuschen herum, isst etwas Erde und macht dann ein Nickerchen. Ob das normal ist? Ja … wird schon passen.',
        "It's been a long time since you've found any blueprints in the maps. You start to wonder where those things even come from.":
            'Es ist lange her, dass du in den Maps Baupläne gefunden hast. Du fragst dich langsam, woher die Dinger überhaupt kommen.',
        "Your scientists have detected an anomaly at the end of Zone 59. They recommend that you stop doing whatever it is that you're doing.":
            'Deine Forscher haben am Ende von Zone 59 eine Anomalie entdeckt. Sie empfehlen dir, mit dem aufzuhören, was du gerade tust.',
        'As you get closer to the anomaly, you start to notice more and more strange behaviour from your Trimps. Holes in your memory are starting to become noticeable as multiple existences blend into one. Trippy.':
            'Je näher du der Anomalie kommst, desto seltsamer verhalten sich deine Scruffies. Lücken in deinem Gedächtnis werden spürbar, während mehrere Existenzen zu einer verschmelzen. Abgefahren.',
        'A loud boom echoes in the distance, and one of your Trimps runs up to you with outstretched arms, looking quite frightened. He probably just wants some armor and weapons! You hand him some gear, and he accepts it with excitement.':
            'In der Ferne hallt ein lauter Knall, und einer deiner Scruffies rennt mit ausgestreckten Armen und ziemlich verängstigt auf dich zu. Wahrscheinlich will er nur Rüstung und Waffen! Du gibst ihm etwas Ausrüstung, und er nimmt sie begeistert an.',
        "A huge storm has formed and daylight has become a luxury you have mostly forgotten about. Your Trimps seem to want to go back home, but you're pretty sure you're supposed to keep going this way, so you do. You're very close to the anomaly.":
            'Ein gewaltiger Sturm ist aufgezogen, und Tageslicht ist ein Luxus, den du fast vergessen hast. Deine Scruffies scheinen nach Hause zu wollen, aber du bist ziemlich sicher, dass du in diese Richtung weitermusst, also tust du es. Du bist der Anomalie sehr nahe.',
        "There it is. The anomaly is at the end of the Zone. You can see it but you don't know what you're seeing. Where did that... thing... come from?! This is highly Improbable.":
            'Da ist sie. Die Anomalie liegt am Ende der Zone. Du siehst sie, aber du weißt nicht, was du da siehst. Wo kommt dieses … Ding … her?! Höchst unwahrscheinlich.',
        "The ground instantly cracks and large plumes of green gas escape from the planet's core to the atmosphere. The planet feels different. Everything feels different. This Universe has grown unstable, the planet has broken. What have you done?":
            'Der Boden bricht sofort auf, und große Schwaden grünen Gases steigen aus dem Kern des Planeten in die Atmosphäre. Der Planet fühlt sich anders an. Alles fühlt sich anders an. Dieses Universum ist instabil geworden, der Planet ist zerbrochen. Was hast du getan?',
        "Other than all the dead Trimps, that wasn't so bad.": 'Abgesehen von den vielen toten Scruffies war das gar nicht so schlimm.',
        'You feel more powerful than ever. The universe seems to be constantly adjusting itself to get rid of you, yet you rise against and persist. Something as tiny as you taking on an entire universe!':
            'Du fühlst dich mächtiger als je zuvor. Das Universum scheint sich ständig neu auszurichten, um dich loszuwerden, doch du lehnst dich auf und hältst durch. Jemand so Winziges wie du gegen ein ganzes Universum!',
        'You figure some entertainment wouldn\'t be awful, and decide to teach your Trimps how to play soccer. A few hours and zero progress later, you really regret that decision.':
            'Ein bisschen Unterhaltung wäre nicht schlecht, denkst du, und beschließt, deinen Scruffies Fußball beizubringen. Ein paar Stunden ohne jeden Fortschritt später bereust du diese Entscheidung zutiefst.',
        "The Improbabilities haven't seemed to slow down. You know you need to figure out a plan, but you don't know what to plan for.":
            'Die Oddities werden einfach nicht langsamer. Du weißt, dass du einen Plan brauchst, aber nicht, wofür.',
        "You slash through another Improbability with relative ease, but something isn't right. A sour smell hits your nose and in disgust, you whip around in search of the source. Oh, wait, it's just the Trimps.":
            'Mühelos schlägst du dich durch eine weitere Oddity, aber etwas stimmt nicht. Ein säuerlicher Geruch steigt dir in die Nase, und angewidert drehst du dich nach der Quelle um. Ach so, das sind nur die Scruffies.',
        "When's the last time you made a map? You have a feeling you should probably do that.": 'Wann hast du zuletzt eine Map erstellt? Du hast das Gefühl, das solltest du mal wieder tun.',
        "Whew, that was an exhilarating kill. You decide to reward your Trimps with some Improbability stew. It's pretty tasty.": 'Puh, das war ein aufregender Sieg. Zur Belohnung kochst du deinen Scruffies einen Oddity-Eintopf. Schmeckt ziemlich gut.',
        'That stew was probably a bad idea. Anyone else feeling sick?': 'Der Eintopf war wohl keine gute Idee. Ist sonst noch jemandem schlecht?',
        "An ancient and fuzzy memory just crept back into your head. You're not quite sure where it came from, but you know the memory is yours. You remember being on a ship, and seeing this planet from orbit. There was someone with you!":
            'Gerade ist dir eine uralte, verschwommene Erinnerung wieder eingefallen. Du weißt nicht genau, woher sie kommt, aber sie gehört dir. Du erinnerst dich, auf einem Schiff gewesen zu sein und diesen Planeten aus dem Orbit gesehen zu haben. Jemand war bei dir!',
        'Bits and pieces of memories continue trickling back in as you continue to put distance between yourself and the source of Anger. You can almost see in your mind who you came here with. Where could they be...':
            'Während du dich weiter von der Quelle des Zorns entfernst, kehren Bruchstücke von Erinnerungen zurück. Fast kannst du vor dir sehen, mit wem du hergekommen bist. Wo könnten sie nur sein …',
        "You decide to ask your scientists to come up with an extravagant machine that can scan your brain for old memories to see if there's anything helpful up there. They seem excited about a new project and quickly get to work.":
            'Du bittest deine Forscher, eine extravagante Maschine zu bauen, die dein Gehirn nach alten Erinnerungen durchsucht, falls dort oben etwas Hilfreiches ist. Sie freuen sich über das neue Projekt und machen sich sofort an die Arbeit.',
        'You hear a huge explosion from the science lab and realize that the brain scan machine will probably never be finished.': 'Aus dem Forschungslabor dröhnt eine gewaltige Explosion, und dir wird klar, dass der Gehirnscanner wohl nie fertig wird.',
        'Need some motivation? You can do it! Maybe.': 'Brauchst du etwas Motivation? Du schaffst das! Vielleicht.',
        "This is an odd looking zone! The ground here is unnaturally flat, and there are large piles of rubble and debris all over the place as if some massive structure had collapsed. Your Trimps seem to enjoy tasting the new flavors of rock, but there's an ominous feeling here that pushes you to keep moving.":
            'Was für eine seltsame Zone! Der Boden ist unnatürlich flach, und überall liegen große Haufen aus Schutt und Trümmern, als wäre ein riesiges Bauwerk eingestürzt. Deinen Scruffies scheinen die neuen Gesteinsaromen zu schmecken, aber ein unheilvolles Gefühl treibt dich weiter.',
        // Maps and finds of the early game (worldUnlocks and mapUnlocks in config.js)
        'You found your first map! Travel to your map chamber to check it out.': 'Du hast deine erste Map gefunden! Geh in deine Map Chamber, um sie dir anzusehen.',
        'You found a map to a strange place. Better go kill stuff in it!': 'Du hast eine Map zu einem seltsamen Ort gefunden. Geh lieber hin und räum dort auf!',
        'This map is hot to the touch. Better go inside!': 'Diese Map ist heiß, wenn man sie anfasst. Besser hineingehen!',
        "There is something strange about this map. It doesn't seem to reflect any light at all, just pure darkness.": 'Mit dieser Map stimmt etwas nicht. Sie scheint überhaupt kein Licht zu reflektieren, nur reine Dunkelheit.',
        "You found an incredibly wet map. It seems to actually be generating water out of nothing, making storage very difficult without flooding the surrounding area. You're sure your Scientists can handle it though, they seem pretty smart.":
            'Du hast eine unglaublich nasse Map gefunden. Sie scheint aus dem Nichts Wasser zu erzeugen, deshalb lässt sie sich kaum lagern, ohne die Umgebung zu überschwemmen. Deine Forscher kriegen das aber sicher hin, sie wirken ziemlich schlau.',
        'You just made a map to The Block!': 'Du hast gerade eine Map zu The Block erstellt!',
        'You just made a map to The Wall!': 'Du hast gerade eine Map zu The Wall erstellt!',
        'You just made a map to Big Wall!': 'Du hast gerade eine Map zu Big Wall erstellt!',
        'You found The Prison! You have a bad feeling about going in...': 'Du hast The Prison gefunden! Bei dem Gedanken hineinzugehen hast du ein ungutes Gefühl …',
        'You found a map to the Bionic Wonderland. Sounds fun!': 'Du hast eine Map zum Bionic Wonderland gefunden. Klingt lustig!',
        'You found a map to an even more advanced version of the Bionic Wonderland! Looks scary... Your scientists remind you that you can only carry 3 of these incredibly heavy, metallic maps at a time.':
            'Du hast eine Map zu einer noch fortschrittlicheren Version des Bionic Wonderland gefunden! Sieht gruselig aus … Deine Forscher erinnern dich daran, dass du nur 3 dieser unglaublich schweren Metall-Maps gleichzeitig tragen kannst.',
        'You found a map to an Imploding Star inside of a supercooled dimension. The temperature there is perfect!': 'Du hast eine Map zu einem Imploding Star in einer extrem kalten Dimension gefunden. Die Temperatur dort ist perfekt!',
        'You look down and see a green gem that seems to stare back. You pick it up and feel adrenaline surge through your body. Probably best to bring this back to the lab for some research.':
            'Du blickst nach unten und siehst einen grünen Edelstein, der zurückzustarren scheint. Als du ihn aufhebst, schießt dir Adrenalin durch den Körper. Am besten bringst du ihn zur Untersuchung ins Labor.',
        'You look down and see a blue gem that seems to stare back. You pick it up and are immediately overwhelmed by feelings of intense power. You figure this could be used to focus your Portal Generator in this Universe.':
            'Du blickst nach unten und siehst einen blauen Edelstein, der zurückzustarren scheint. Als du ihn aufhebst, überwältigt dich ein Gefühl gewaltiger Macht. Damit ließe sich wohl dein Portal Generator in diesem Universum ausrichten.',
        'You have slain the Warden and taken his keys. How weird would it be if they fit in that key hole on the portal?': 'Du hast den Lockgruff erschlagen und ihm seine Schlüssel abgenommen. Wie seltsam wäre es, wenn sie in das Schlüsselloch am Portal passten?',
        "You've never been here before. Like, ever. This entire place felt cold and unfamiliar. Where are you? Why have so many Trimps had to fall to get here? You're suddenly angry, it's time to take a stand.":
            'Hier warst du noch nie. Wirklich noch nie. Dieser ganze Ort fühlt sich kalt und fremd an. Wo bist du? Warum mussten so viele Scruffies fallen, damit du hierherkommst? Plötzlich bist du wütend. Zeit, Stellung zu beziehen.',
        'After barely escaping a fierce boulder, you check out the relic you found in there. It glows extremely bright for a few seconds before disappearing, and you look at your storages to see that your Food, Wood, and Metal have been doubled!':
            'Knapp einem wilden Felsbrocken entkommen, siehst du dir das Relikt an, das du dort gefunden hast. Es leuchtet ein paar Sekunden lang hell auf und verschwindet. Ein Blick in deine Lager zeigt: Nahrung, Holz und Metall haben sich verdoppelt!',
        'You heroically slay the mighty Poseidimp, and do a little ransacking in celebration. You come across a strange, brightly glowing chest that seems to be calling you to it. You go over and carefully open it up to see it filled to the brim with the exact amount of resources you currently already had. Your Food, Wood, and Metal have been doubled!':
            'Heldenhaft erschlägst du den mächtigen Tidegruff und plünderst zur Feier ein wenig. Dabei stößt du auf eine seltsame, hell leuchtende Truhe, die dich zu rufen scheint. Vorsichtig öffnest du sie: Sie ist randvoll mit genau den Ressourcen, die du ohnehin schon hattest. Nahrung, Holz und Metall haben sich verdoppelt!'
    };
    // Unlocks: the finds of the combat cells (message of worldUnlocks and mapUnlocks in config.js).
    const unlocks = {
        'Oh goodness, another Prism to polish!': 'Du meine Güte, noch ein Prisma zum Polieren!',
        "That thing dropped a book. Doesn't look like an ordinary book. Looks... blockier...": 'Das Ding hat ein Buch fallen lassen. Sieht nicht wie ein gewöhnliches Buch aus. Eher … klotziger …',
        "It's all shiny and stuff. You're pretty sure you've never seen a book this shiny.": 'Es glänzt und so. Du bist ziemlich sicher, dass du noch nie ein so glänzendes Buch gesehen hast.',
        'Holy cowimp! A unique map!': 'Heiliger Bimbam! Eine einzigartige Map!',
        'Oh snap! Another unique map!': 'Ach du Schreck! Noch eine einzigartige Map!',
        'You found plans for a Mansion! Your Trimps will be pretty stoked': 'Du hast Baupläne für eine Villa gefunden! Deine Scruffies werden begeistert sein',
        'You found plans for a hotel! (A decent hotel, too)': 'Du hast Baupläne für ein Hotel gefunden! (Sogar ein ordentliches Hotel)',
        'This extremely technical book will teach anyone who can understand the big words how to make bigger huts.': 'Dieses äußerst technische Buch zeigt jedem, der die großen Wörter versteht, wie man größere Hütten baut.',
        'This book talks about adding a second floor to your homes! Mind... blown...': 'Dieses Buch erklärt, wie man Häusern ein zweites Stockwerk aufsetzt! Einfach … umwerfend …',
        'This book will teach you how to make your Trimps share their mansions!': 'Dieses Buch zeigt dir, wie du deine Scruffies dazu bringst, sich ihre Villen zu teilen!',
        'This book will teach you how to build smaller hotel rooms!': 'Dieses Buch zeigt dir, wie man kleinere Hotelzimmer baut!',
        "Wow! This book! It's so Resortsfull!": 'Wow! Dieses Buch! So voller Resorts!',
        'You found plans for a huge resort!': 'Du hast Baupläne für ein riesiges Resort gefunden!',
        'You found a key to Dimension ZZZ!': 'Du hast einen Schlüssel zur Dimension ZZZ gefunden!',
        'You found a crystal powerful enough to create wormholes!': 'Du hast einen Kristall gefunden, der stark genug ist, um Wurmlöcher zu erschaffen!',
        'You found plans for some sort of overly complicated solar panel.': 'Du hast Baupläne für eine Art übertrieben komplizierte Solarzelle gefunden.',
        'A book that teaches your Foremen a new skill. Riveting.': 'Ein Buch, das deinen Vorarbeitern eine neue Fähigkeit beibringt. Fesselnd.',
        'You found blueprints for some sort of nursery that can harness more power from gems.': 'Du hast Baupläne für eine Art Kinderstube gefunden, die mehr Kraft aus Edelsteinen schöpft.',
        'You found plans for a shield! It even tells you how to upgrade it, if you have enough wood. That was nice of that Bad Guy.': 'Du hast Baupläne für einen Schild gefunden! Sie zeigen sogar, wie du ihn verbesserst, wenn du genug Holz hast. Nett von diesem Gegner.',
        'You found plans for Boots! Swell!': 'Du hast Baupläne für Stiefel gefunden! Klasse!',
        'You found plans for a Dagger! Fancy!': 'Du hast Baupläne für einen Dolch gefunden! Schick!',
        'You found plans for a mace!': 'Du hast Baupläne für einen Streitkolben gefunden!',
        'You found plans for a helmet!': 'Du hast Baupläne für einen Helm gefunden!',
        'You found plans for a Polearm!': 'Du hast Baupläne für eine Stangenwaffe gefunden!',
        'You found plans for Pants!': 'Du hast Baupläne für eine Hose gefunden!',
        'You found plans for a Battleaxe!': 'Du hast Baupläne für eine Streitaxt gefunden!',
        'You found plans for Shoulderguards!': 'Du hast Baupläne für einen Schulterschutz gefunden!',
        'You found plans for a Greatsword!': 'Du hast Baupläne für einen Zweihänder gefunden!',
        'You found plans for a Breastplate!': 'Du hast Baupläne für einen Brustpanzer gefunden!',
        'You found an ancient book titled Bloodlust. You should look at it or something.': 'Du hast ein uraltes Buch mit dem Titel Blutrausch gefunden. Du solltest mal reinschauen oder so.',
        'Hey, this book might be for you!': 'Hey, dieses Buch könnte für dich sein!',
        'Hey look, plans for a new Gym!': 'Schau mal, Baupläne für eine neue Trainingshalle!',
        'You find a small handcut gem that seems to coat you in a bubble of light when you hold it! You should have your Scientists research some way to polish it.':
            'Du findest einen kleinen, handgeschliffenen Edelstein, der dich in eine Lichtblase hüllt, wenn du ihn hältst! Deine Forscher sollten erforschen, wie man ihn poliert.',
        'This book is for your Trainers!': 'Dieses Buch ist für deine Trainer!',
        "Your equipment isn't going to cut it in this Universe. Better get someone to upgrade it for you!": 'Mit deiner Ausrüstung kommst du in diesem Universum nicht weit. Lass sie lieber von jemandem verbessern!',
        'Time to colonize the galaxy.': 'Zeit, die Galaxie zu besiedeln.',
        'Trimp cave paintings predicted the existence of a book such as this one, you had no idea it actually existed. It smells dusty.':
            'Höhlenmalereien der Scruffies haben ein Buch wie dieses vorhergesagt, aber du hattest keine Ahnung, dass es wirklich existiert. Es riecht staubig.',
        "You've found an ancient relic that looks like some sort of mechanical dish. Perhaps you could train your Trimps to use this to your advantage!":
            'Du hast ein uraltes Relikt gefunden, das wie eine Art mechanische Schüssel aussieht. Vielleicht kannst du deinen Scruffies beibringen, es zu deinem Vorteil zu nutzen!',
        'This book will help your Trimps make more Trimps!': 'Dieses Buch hilft deinen Scruffies, mehr Scruffies zu machen!',
        'This book will help your RoboTrimp shriek louder!': 'Dieses Buch hilft deinem Rivetgruff, lauter zu kreischen!',
        'You found an ancient book about mining. With some research you should be able to teach the Trimps to mine!': 'Du hast ein uraltes Buch über Bergbau gefunden. Mit etwas Forschung solltest du den Scruffies das Abbauen beibringen können!',
        'You found a book about proper physical training!': 'Du hast ein Buch über richtiges Körpertraining gefunden!',
        'You found a book about Einstrimp!': 'Du hast ein Buch über Einstrimp gefunden!',
        'You found a book detailing the intricacies of solo exploration!': 'Du hast ein Buch über die Feinheiten des Erkundens auf eigene Faust gefunden!',
        'You found a book called Speedscience! What do you think it could possibly do?!': 'Du hast ein Buch namens Geistesblitz gefunden! Was das wohl bewirkt?!',
        'You found a book called Megascience! It seems to fade in and out of reality.': 'Du hast ein Buch namens Megaforschung gefunden! Es scheint immer wieder aus der Wirklichkeit zu verschwinden.',
        'You found blueprints detailing how to upgrade your Warpstation. Blimey!': 'Du hast Baupläne gefunden, die zeigen, wie du deine Warpstation verbesserst. Donnerwetter!',
        "You find a smouldering book that looks like it was pushed from the core of this planet. Inside are drawings of Trimps performing rituals with Gems and Magma. It's very hot to the touch, but you take it with you as you haven't had new reading material in a while.":
            'Du findest ein schwelendes Buch, das aus dem Kern dieses Planeten heraufgedrückt worden zu sein scheint. Darin sind Scruffies bei Ritualen mit Edelsteinen und Magma gezeichnet. Es ist sehr heiß, aber du nimmst es mit, weil du schon lange nichts Neues mehr zu lesen hattest.',
        'You found a book called Speedfarming! It looks delicious!': 'Du hast ein Buch namens Reiche Ernte gefunden! Sieht lecker aus!',
        'You found a book called Megafarming! It indicates that you should actually water your crops. Brilliant!': 'Du hast ein Buch namens Megaernte gefunden! Es rät dir, deine Felder tatsächlich zu gießen. Genial!',
        'You found a book called Speedlumber! It looks long.': 'Du hast ein Buch namens Scharfe Äxte gefunden! Sieht lang aus.',
        "You found a book called Megalumber! The quote on the back reads 'How much wood could a Wood Trimp chop if a Wood Trimp could chop wood?'":
            'Du hast ein Buch namens Megaholz gefunden! Auf der Rückseite steht: ‚Wie viel Holz hackt ein Holz-Scruffy, wenn ein Holz-Scruffy Holz hacken kann?‘',
        'You found a book called Speedminer!': 'Du hast ein Buch namens Erzgespür gefunden!',
        'You found a book called Megaminer! The front is really shiny and has a Trimp on it. Creepy, it seems to follow your eyes.': 'Du hast ein Buch namens Megabergbau gefunden! Der Einband glänzt richtig und zeigt einen Scruffy. Unheimlich, er scheint dir mit den Augen zu folgen.',
        'Your Trimps report a strange bronze object on the floor, and you decide to come look at it. It looks freaky, so you ask one of your Trimps to pick it up first. He instantly starts itching his face and babbling off a bunch of science stuff, so you let another Trimp touch it and he does the same. This seems to make your Trimps smarter than Scientists, but may cause side effects.':
            'Deine Scruffies melden einen seltsamen Gegenstand aus Bronze auf dem Boden, und du siehst ihn dir an. Er wirkt unheimlich, also lässt du ihn zuerst einen deiner Scruffies aufheben. Der kratzt sich sofort im Gesicht und brabbelt lauter Wissenschaftszeug, also lässt du einen anderen Scruffy ihn berühren, und der tut dasselbe. Das scheint deine Scruffies klüger als Forscher zu machen, könnte aber Nebenwirkungen haben.',
        'You found a crafting foreman! He will build buildings automatically for you!': 'Du hast einen Vorarbeiter gefunden! Er baut Gebäude automatisch für dich!',
        'You find an ancient book titled Coordination. Exciting.': 'Du findest ein uraltes Buch mit dem Titel Koordination. Spannend.',
        'You found a book discussing tactics for better blocking!': 'Du hast ein Buch über Taktiken für besseres Blocken gefunden!',
        'This egg looks crazy. Seriously, guys, come look at this crazy egg!': 'Dieses Ei sieht verrückt aus. Ernsthaft, Leute, schaut euch dieses verrückte Ei an!',
        'Having some Trimps Worship Scruffy might help him grow stronger quicker!': 'Wenn ein paar Scruffies Scruffy anbeten, wird er vielleicht schneller stärker!'
    };
    // Notices of the early game: maps, books nobody can read, the anomaly, saving.
    const notices = {
        'Your Scientists have already read that book! Better look elsewhere for some new reading material.': 'Deine Forscher haben dieses Buch schon gelesen! Such lieber anderswo nach neuem Lesestoff.',
        "Woah, that's a lot of maps. You're certain your Scientists will just lose them if you make any more. Better recycle a few of them, it's good for the environment anyways.":
            'Puh, das sind viele Maps. Weitere würden deine Forscher bestimmt verlieren. Recycle lieber ein paar, das ist sowieso gut für die Umwelt.',
        'Waiting to travel until your soldiers are finished.': 'Du wechselst erst, wenn deine Soldaten fertig sind.',
        'Your challenge has been abandoned.': 'Deine Challenge wurde abgebrochen.',
        'Your Scientists have detected an anomaly at the end of this Zone. Exercise caution.': 'Deine Forscher haben am Ende dieser Zone eine Anomalie entdeckt. Sei vorsichtig.',
        'There is a new anomaly at 59, but you are too far past to reach it. You will have to use your portal to see the changes it brings. It looks like you have access to a new challenge, however!':
            'In Zone 59 gibt es eine neue Anomalie, aber du bist schon zu weit, um sie zu erreichen. Erst nach dem Portal siehst du, was sie verändert. Immerhin hast du anscheinend Zugang zu einer neuen Challenge!',
        'Your scientists have detected an anomaly at the end of Zone 59. They warn you to be careful if you intend to approach it.': 'Deine Forscher haben am Ende von Zone 59 eine Anomalie entdeckt. Sie warnen dich, vorsichtig zu sein, falls du dich ihr nähern willst.',
        "Well these plans certainly don't look useful in this Universe. Better put that away for later.": 'Diese Baupläne sehen in diesem Universum wirklich nicht nützlich aus. Leg sie lieber für später weg.',
        "Your Scientists let you know that your Trimps won't understand the book, but they offer to hold on to it for you for later. How nice of them!":
            'Deine Forscher sagen dir, dass deine Scruffies das Buch nicht verstehen werden, bieten aber an, es für später aufzubewahren. Wie nett von ihnen!',
        "Your Trimps simply do not understand what this book is talking about. It's blowing their minds. What is a 'Miner'?!": 'Deine Scruffies verstehen einfach nicht, wovon dieses Buch redet. Es sprengt ihren Verstand. Was ist ein ‚Bergmann‘?!',
        "Your Trimps think they're too good at Science to read your dumb book. They're already working on Portal technology!": 'Deine Scruffies halten sich für zu gut in Wissenschaft, um dein dummes Buch zu lesen. Sie arbeiten schon an Portal-Technik!',
        "You found a book called Speedscience, but you haven't found anyone to read it. Such a shame.": 'Du hast ein Buch namens Geistesblitz gefunden, aber niemanden, der es liest. Wie schade.',
        "This book really doesn't help too much while you're dealing with the minerlessness of this dimension. Better let your scientists hold this one for you for a bit.":
            'Dieses Buch hilft nicht viel, solange es in dieser Dimension keine Bergleute gibt. Lass es lieber eine Weile von deinen Forschern aufbewahren.',
        "You don't have any Scientists to not know how to handle this book, so everything's chill.": 'Du hast keine Forscher, die mit diesem Buch nichts anfangen könnten, also alles entspannt.',
        "Your scientists don't think that it's a very smart idea to try any of the suggestions in this book.": 'Deine Forscher halten es für keine gute Idee, irgendeinen Vorschlag aus diesem Buch auszuprobieren.',
        'You have permanently unlocked a new Perk, Relentlessness, which will remain unlocked through portals.': 'Du hast dauerhaft einen neuen Perk freigeschaltet: Relentlessness. Er bleibt über Portale hinweg freigeschaltet.',
        'You just made a map to the Dimension of Anger! Should be fun!': 'Du hast gerade eine Map zur Dimension of Anger erstellt! Das wird lustig!',
        'You just made a map to the Dimension of Rage! Sounds like a great time!': 'Du hast gerade eine Map zur Dimension of Rage erstellt! Klingt nach einer tollen Zeit!',
        'Due to an error occuring, saving has been disabled to prevent corruption': 'Wegen eines Fehlers ist das Speichern abgeschaltet, damit der Spielstand nicht beschädigt wird',
        'For some reason, your game is not saving. Make sure you export and back up your save!': 'Aus irgendeinem Grund wird dein Spiel nicht gespeichert. Exportiere und sichere deinen Spielstand!'
    };
    // Loot sentences without numbers.
    const loot = {
        'That Gourdle gave you nothing! What a jerk!': 'Dieser Gourdle hat dir nichts gegeben! So ein Fiesling!',
        'Lame, this one just has stringy stuff in it.': 'Schade, hier ist nur faseriges Zeug drin.',
        'You crack open your newly captured Gourdle and find... Nothing!': 'Du öffnest deinen frisch gefangenen Gourdle und findest … nichts!',
        'Right before you finish the Gourdle off, it winks at you and rolls away. That was pretty weird.': 'Kurz bevor du den Gourdle erledigst, zwinkert er dir zu und rollt davon. Das war ziemlich seltsam.',
        "As the Gourdle takes his final breath, he manages to mutter the word 'Trick'. No loot here.": 'Mit seinem letzten Atemzug murmelt der Gourdle noch das Wort Streich. Hier gibt es keine Beute.',
        "You search the Gourdle for loot, but find nothing. Someone wasn't in the holiday spirit!": 'Du durchsuchst den Gourdle nach Beute, findest aber nichts. Da war wohl jemand nicht in Feierlaune!',
        'That Gourdle rolled away before you could finish him off, yelling stuff about tricks.': 'Der Gourdle rollte davon, bevor du ihn erledigen konntest, und rief irgendetwas von Streichen.',
        'Thanks, you hate getting tricks instead of treats.': 'Na danke, du hasst es, statt Süßigkeiten nur Streiche zu bekommen.',
        "You might have hit that Gourdle a bit too hard, there's nothing left to give you candy.": 'Vielleicht hast du den Gourdle etwas zu hart getroffen. Es ist nichts mehr übrig, das dir Süßigkeiten geben könnte.',
        'The Gourdle suddenly bursts, spewing huge amounts of candy into the air. Your Scruffies scramble about to pick up all they can and gain Sugar Rush!': 'Der Gourdle platzt plötzlich und schleudert Unmengen Süßigkeiten in die Luft. Deine Scruffies sammeln hastig alles ein, was sie können, und bekommen einen Zuckerrausch!',
        "This Gourdle was so large that your Scruffies could feast for weeks on all the candy inside. Oh, nope, looks like they'll be done in about 10 minutes. In the mean time, they should have a bit of extra energy!": 'Dieser Gourdle war so groß, dass deine Scruffies wochenlang von seinen Süßigkeiten naschen könnten. Ach nein, offenbar sind sie in etwa 10 Minuten fertig. Bis dahin sollten sie etwas zusätzliche Energie haben!',
        'This Gourdle was totally stuffed with various types of sugary things. You give them all to your Scruffies, which results in a huge boost of energy!': 'Dieser Gourdle war vollgestopft mit allerlei Süßigkeiten. Du gibst sie deinen Scruffies und verschaffst ihnen damit einen gewaltigen Energieschub!',
        'Your Scruffies have begun carrying pillowcases with them in hopes of a legendary Gourdle like the one you just found. Filled to the brim with sugary goodies, this Gourdle should sate your Scruffies for a few minutes!': 'Deine Scruffies tragen inzwischen Kissenbezüge mit sich, in der Hoffnung auf einen legendären Gourdle wie diesen. Randvoll mit Süßigkeiten sollte er deine Scruffies für ein paar Minuten zufriedenstellen!',
        'As expected, there was no Metal here.': 'Wie erwartet gab es hier kein Metall.',
        'You found an Heirloom!': 'Du hast ein Heirloom gefunden!',
        'A chill runs down your spine, and the Bad Guy quickly frosts over. A purple glow radiates from the ground in front of you, and a Void Map appears.':
            'Dir läuft ein Schauer über den Rücken, und der Gegner überzieht sich schnell mit Reif. Vor dir strahlt ein violettes Leuchten aus dem Boden, und eine Void Map erscheint.'
    };
    // Resource words of the loot sentences (save keys, capitalized names and the "bars of metal" kind).
    const res = {food:'Nahrung', wood:'Holz', metal:'Metall', science:'Wissenschaft', gems:'Edelsteine', fragments:'Fragmente', Food:'Nahrung', Wood:'Holz', Metal:'Metall',
        Science:'Wissenschaft', Gems:'Edelsteine', Helium:'Helium', Radon:'Radon', 'bars of metal':'Barren Metall', 'logs of wood':'Holzscheite', 'map fragments':'Map-Fragmente'};
    const word = key => res[key] || key;
    // Seasonal resource loot appends a prettified amount and a resource to one of these exact prefixes.
    const seasonalLoot = {
        'Oops, that Gourdle just wanted to give you some candy. You found ': 'Hoppla, der Gourdle wollte dir nur Süßigkeiten geben. Du hast gefunden: ',
        'When checking the Gourdle for loot, you find a pouch that says to take one. You take all ': 'Beim Durchsuchen des Gourdle findest du einen Beutel mit der Aufschrift: Nimm eins. Du nimmst alle ',
        'That Gourdle gave you ': 'Dieser Gourdle hat dir gegeben: ',
        'Right before you finish the Gourdle off, it throws a large bag at you and rolls away. Inside, you find ': 'Kurz bevor du den Gourdle erledigst, wirft er dir einen großen Beutel zu und rollt davon. Darin findest du ',
        'This Gourdle was still in pretty good shape, so you let your Scruffies carve it. Inside, they found ': 'Dieser Gourdle war noch gut in Form, also lässt du deine Scruffies ihn aushöhlen. Darin finden sie ',
        'That Gourdle was so smashed that he gave you ': 'Dieser Gourdle war völlig zermatscht und hat dir gegeben: ',
        "You dig through what's left of the Gourdle and find ": 'Du durchsuchst die Überreste des Gourdle und findest ',
        "Aww man, there's seeds and orange stuff everywhere. At least you found ": 'Ach Mensch, überall liegen Kerne und orangefarbenes Zeug. Immerhin findest du ',
        "You're not wearing a costume, but you'll still take this ": 'Du trägst zwar kein Kostüm, nimmst aber trotzdem ',
        'Heck yes, this Gourdle has your favorite treat! You picked up ': 'Super, dieser Gourdle hat deine Lieblingssüßigkeit! Du sammelst ',
        'What a haunting sight! The Gourdle was punted by a plump Scruffy after the fight. As it flies away, it drops ': 'Was für ein schauriger Anblick! Ein pummeliger Scruffy hat den Gourdle nach dem Kampf weggekickt. Im Flug verliert er '
    };
    const vial = kind => kind === 'Radon' ? 'Radonphiolen' : 'Heliumkanister';
    const amounts = list => list.replace(/(\S+) (food|wood|metal|science|gems)/g, (_, n, key) => n + ' ' + res[key]).replace(/, and |,? and /g, ' und ');
    // Combat: the original picks one of these fragments at random (trimpDeathTexts, badGuyDeathTexts in config.js).
    const deaths = {
        'ceased to be':['ist nicht mehr','sind nicht mehr'], 'bit the dust':['hat ins Gras gebissen','haben ins Gras gebissen'],
        'took a dirt nap':['macht jetzt ein Nickerchen unter der Erde','machen jetzt ein Nickerchen unter der Erde'], 'expired':['ist abgelaufen','sind abgelaufen'],
        'kicked the bucket':['hat den Löffel abgegeben','haben den Löffel abgegeben'], 'evaporated':['ist verdampft','sind verdampft'],
        'needed more armor':['hätte mehr Rüstung gebraucht','hätten mehr Rüstung gebraucht'], 'exploded':['ist explodiert','sind explodiert'],
        'melted':['ist geschmolzen','sind geschmolzen'], 'fell over':['ist umgefallen','sind umgefallen'], 'swam the river Styx':['ist über den Styx geschwommen','sind über den Styx geschwommen'],
        'turned into jerky':['ist zu Dörrfleisch geworden','sind zu Dörrfleisch geworden'], 'forgot to put armor on':['hat die Rüstung vergessen','haben die Rüstung vergessen'],
        'croaked':['ist abgekratzt','sind abgekratzt'], 'flatlined':['hat eine Nulllinie','haben eine Nulllinie'],
        "won't follow you to battle again":['folgt dir nie wieder in die Schlacht','folgen dir nie wieder in die Schlacht'], 'died. Lame':['ist gestorben. Öde','sind gestorben. Öde'],
        'lagged out':['ist im Lag verschwunden','sind im Lag verschwunden'], 'imp-loded':['ist imp-lodiert','sind imp-lodiert']
    };
    const kills = {slew:'erschlagen', killed:'getötet', destroyed:'zerstört', extinguished:'ausgelöscht', liquidated:'liquidiert', vaporized:'verdampft',
        demolished:'demoliert', ruined:'ruiniert', wrecked:'zerlegt', obliterated:'vernichtet'};
    const alt = object => Object.keys(object).map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    // Equipment names of the glossary with the possessive German needs ("dein Schild", "deine Hose").
    const feminine = new Set(['Boots', 'Polearm', 'Pants', 'Battleaxe', 'Arbalest']);
    const yours = key => (feminine.has(key) ? 'deine ' : 'dein ') + (names.equipment[key] || key);
    const patterns = [
        // Combat, most frequent first: "5 Scruffies just bit the dust." and "You slew a Skitter!"
        [new RegExp('^(\\S+) (Scruffy|Scruffies) just (' + alt(deaths) + ')\\.$'), (_, n, who, how) => n + ' ' + who + ' ' + deaths[how][who === 'Scruffy' ? 0 : 1] + '.'],
        [new RegExp('^You (' + alt(kills) + ') an? ([^!]+?)( group)?!$'), (_, verb, foe, group) => 'Du hast ' + (group ? 'eine Gruppe ' : '') + foe + ' ' + kills[verb] + '!'],
        [/^The (.+?) explodes, killing all of your soldiers!$/, (_, foe) => foe + ' explodiert und reißt alle deine Soldaten mit!'],
        // Loot of the world and of maps
        [new RegExp('^(' + alt(seasonalLoot) + ')(\\S+) (food|wood|metal|gems|fragments)!$'), (_, prefix, n, resource) => seasonalLoot[prefix] + n + ' ' + word(resource) + '!'],
        [/^That guy just left (\S+) food on the ground! Sweet!$/, (_, n) => 'Der Kerl hat gerade ' + n + ' Nahrung liegen lassen! Super!'],
        [/^You just found (\S+) wood! That's pretty neat!$/, (_, n) => 'Du hast gerade ' + n + ' Holz gefunden! Ziemlich praktisch!'],
        [/^You just found (\S+) bars of metal! Convenient!$/, (_, n) => 'Du hast gerade ' + n + ' Barren Metall gefunden! Praktisch!'],
        [/^You found (\S+) gems! Terrific!$/, (_, n) => 'Du hast ' + n + ' Edelsteine gefunden! Großartig!'],
        [/^You found (\S+) map fragments!$/, (_, n) => 'Du hast ' + n + ' Map-Fragmente gefunden!'],
        [/^You have cleared enough land to support (\S+) more Scruffies!$/, (_, n) => 'Du hast genug Land gerodet, um ' + n + ' weiteren Scruffies Platz zu bieten!'],
        [/^There sure is a lot of metal just tossed around in this Spire! You just found (\S+) more!$/, (_, n) => 'In dieser Spire liegt wirklich viel Metall herum! Du hast gerade noch ' + n + ' Metall gefunden!'],
        [/^You open the (.+?) at the end of the map to find (\S+) (food|wood|metal|science|gems)!$/, (_, cache, n, key) => 'Am Ende der Map öffnest du den ' + cache + ' und findest ' + n + ' ' + res[key] + '!'],
        [/^(\S+) found another (.+?) with another (\S+) (food|wood|metal|science|gems)!$/, (_, who, cache, n, key) => who + ' hat noch einen ' + cache + ' mit weiteren ' + n + ' ' + res[key] + ' gefunden!'],
        // Enemies that drop resources (loot of badGuys in config.js); the names arrive renamed by the branding.
        [/^That (\S+) dropped (\S+) Food, Wood and Metal! That should be useful\.$/, (_, foe, n) => foe + ' hat je ' + n + ' Nahrung, Holz und Metall fallen lassen! Das kommt gelegen.'],
        [/^That (\S+) dropped (\S+) metal! Neat-O\.$/, (_, foe, n) => foe + ' hat ' + n + ' Metall fallen lassen! Klasse.'],
        [/^That (\S+) dropped (\S+) gems, how sweet of it!$/, (_, foe, n) => foe + ' hat ' + n + ' Edelsteine fallen lassen, wie lieb!'],
        [/^That (\S+) dropped (\S+) gems! What a bro!$/, (_, foe, n) => foe + ' hat ' + n + ' Edelsteine fallen lassen! Was für ein Kumpel!'],
        [/^That (\S+) dropped ((?:\S+ (?:food|wood|metal|science|gems)(?:, and |, | and )?)+)!$/, (_, foe, list) => foe + ' hat ' + amounts(list) + ' fallen lassen!'],
        [/^(\S+) dropped (\S+) (wood|metal)!$/, (_, foe, n, key) => foe + ' hat ' + n + ' ' + res[key] + ' fallen lassen!'],
        [/^Noot noot! You splashed water on that imp! It quickly swims away, leaving behind (\S+) food\.$/, (_, n) => 'Noot noot! Du hast den Gegner nass gespritzt! Er schwimmt schnell davon und lässt ' + n + ' Nahrung zurück.'],
        [/^Your Scruffies almost look normal compared to that (\S+)! Did that thing have a bill!\? Somehow it dropped (\S+) (Wood|Metal|Food)\.$/,
            (_, foe, n, key) => 'Neben diesem ' + foe + ' sehen deine Scruffies fast normal aus! Hatte das Ding etwa einen Schnabel!? Irgendwie hat es ' + n + ' ' + res[key] + ' fallen lassen.'],
        [/^Talking through your problems with what's left of the (\S+) helps you realize it was made out of (\S+) food! Just what you needed!$/,
            (_, foe, n) => 'Als du mit den Resten von ' + foe + ' über deine Probleme sprichst, merkst du, dass er aus ' + n + ' Nahrung bestand! Genau das, was du gebraucht hast!'],
        [/^You hear nearby (\S+) running away in fear and decide to check out their former home\. There, you find a prey pile with (\S+) food!$/,
            (_, foes, n) => 'Du hörst, wie ' + foes + ' in der Nähe ängstlich davonlaufen, und siehst dir ihr früheres Zuhause an. Dort findest du einen Beutehaufen mit ' + n + ' Nahrung!'],
        [/^The (\S+) fell to pieces! You manage to grab (\S+) (fragments|bars of metal) before it begins pulling itself together\.$/,
            (_, foe, n, key) => foe + ' ist in Stücke zerfallen! Du schnappst dir ' + n + ' ' + word(key) + ', bevor er sich wieder zusammensetzt.'],
        [/^That (\S+) fell over, and (\S+) gems popped out! How about that\?!$/, (_, foe, n) => foe + ' ist umgefallen, und ' + n + ' Edelsteine sind herausgekullert! Wer hätte das gedacht?!'],
        [/^The (\S+) thanked you for the combat, and handed you (\S+) bars of metal! Then he died\.$/, (_, foe, n) => foe + ' hat sich für den Kampf bedankt und dir ' + n + ' Barren Metall überreicht! Dann ist er gestorben.'],
        [/^The (\S+) is no more\. You manage to salvage (\S+) logs of wood from his trunk!$/, (_, foe, n) => foe + ' ist nicht mehr. Aus seinem Stamm rettest du ' + n + ' Holzscheite!'],
        [/^Time for some stew! You scored (\S+) food from that (\S+)!$/, (_, n, foe) => 'Zeit für Eintopf! ' + foe + ' hat dir ' + n + ' Nahrung eingebracht!'],
        [/^You sift through the (\S+), and manage to find (\S+) bars of metal! Good on you!$/, (_, foe, n) => 'Du durchsiebst ' + foe + ' und findest ' + n + ' Barren Metall! Gut gemacht!'],
        [/^You feel bad about slaying an incredibly rare (\S+), but at least he dropped (\S+) gems! Totally worth\.$/,
            (_, foe, n) => 'Es tut dir leid, einen unglaublich seltenen ' + foe + ' erschlagen zu haben, aber immerhin hat er ' + n + ' Edelsteine fallen lassen! Hat sich total gelohnt.'],
        [/^The (\S+)'s light floats up and away, unbothered by the fact that you just killed its body\. Since it doesn't want the body anymore, you break it down in to (\S+) gems!$/,
            (_, foe, n) => 'Das Licht von ' + foe + ' schwebt davon, ganz unbeeindruckt davon, dass du gerade seinen Körper erledigt hast. Da es den Körper nicht mehr will, zerlegst du ihn in ' + n + ' Edelsteine!'],
        [/^What a surprise, the (\S+) is melting! You find a healthy stack of (\S+) metal where it used to be!$/, (_, foe, n) => 'Welche Überraschung, ' + foe + ' schmilzt! Wo er eben noch war, findest du einen ordentlichen Stapel aus ' + n + ' Metall!'],
        [/^That (\S+) chucked (\S+) bars of metal right at your head! You'll take it though, thanks guy!$/, (_, foe, n) => foe + ' hat dir ' + n + ' Barren Metall direkt an den Kopf geworfen! Du nimmst sie trotzdem, danke!'],
        [/^You were able to extract (\S+) (Helium|Radon) (?:Canister|Vial)s from that (\S+)!$/, (_, n, kind, foe) => 'Du konntest ' + n + ' ' + vial(kind) + ' aus ' + foe + ' gewinnen!'],
        [/^You managed to steal (\S+) (Helium|Radon) (?:Canister|Vial)s? from that (\S+)\. That'll teach it\.$/, (_, n, kind, foe) => 'Du hast ' + foe + ' ' + n + ' ' + vial(kind) + ' abgenommen. Das wird ihm eine Lehre sein.'],
        // Rare Kin (exotic imps)
        [/^That (\S+) gave you (\S+) gems! Thanks (\S+)!$/, (_, foe, n) => foe + ' hat dir ' + n + ' Edelsteine geschenkt! Danke, ' + foe + '!'],
        [/^That (\S+) gave you (\S+) (food|wood|metal|science|gems)!$/, (_, foe, n, key) => foe + ' hat dir ' + n + ' ' + res[key] + ' geschenkt!'],
        [/^You stole (\S+) fragments from that (\S+)! It really didn't look like she needed them though, don't feel bad\.$/,
            (_, n, foe) => 'Du hast ' + foe + ' ' + n + ' Fragmente stibitzt! Sie sah aber nicht so aus, als bräuchte sie die, also kein schlechtes Gewissen.'],
        [/^It's nice, warm, and roomy in that dead (\S+)\. You found (\S+) Scruffy inside, and it looks hella bored\.$/,
            (_, foe, n) => 'In ' + foe + ' ist es schön warm und geräumig. Du hast darin ' + n + ' Scruffy gefunden, und er sieht schwer gelangweilt aus.'],
        [/^It's nice, warm, and roomy in that dead (\S+)\. You found (\S+) Scruffies inside, and they all seem content to stay living there!$/,
            (_, foe, n) => 'In ' + foe + ' ist es schön warm und geräumig. Du hast darin ' + n + ' Scruffies gefunden, und alle wollen gern dort wohnen bleiben!'],
        [/^You found an Expanding (\S+)! The extra room is increasing your housing by (\S+)%\.$/, (_, foe, n) => 'Du hast einen wachsenden ' + foe + ' gefunden! Der zusätzliche Platz erhöht deinen Wohnraum um ' + n + '%.'],
        [/^Seeing the (\S+) fall is causing all of your Scruffies to work (\S+)% harder!$/, (_, foe, n) => 'Seit ' + foe + ' gefallen ist, arbeiten alle deine Scruffies ' + n + '% härter!'],
        [/^The ground up (\S+) now increases your Scruffies' breed speed by (\S+)%!$/, (_, foe, n) => 'Zermahlen erhöht ' + foe + ' jetzt das Zuwachstempo deiner Scruffies um ' + n + '%!'],
        [/^That (\S+) made your Scruffies super strong!(?: \((\S+) wishes to remind you that his name is pronounced "([^"]*)"\))?$/,
            (_, foe, who, say) => foe + ' hat deine Scruffies superstark gemacht!' + (who ? ' (' + who + ' möchte dich daran erinnern, dass man seinen Namen ‚' + say + '‘ ausspricht)' : '')],
        [/^You killed an? (\S+)! The strong magnetic forces now increase your loot by (\S+)%!$/, (_, foe, n) => 'Du hast ' + foe + ' erledigt! Die starken Magnetkräfte erhöhen deine Beute jetzt um ' + n + '%!'],
        [/^Your Scruffies managed to pull 1 perfectly preserved bone from that (\S+)!$/, (_, foe) => 'Deine Scruffies haben ' + foe + ' 1 perfekt erhaltenen Knochen entrissen!'],
        [/^That was a pretty big (\S+)\. Your Scruffies scavenged the remains and found 2 perfectly preserved bones!$/, (_, foe) => 'Das war ein ziemlich großer ' + foe + '. Deine Scruffies haben die Überreste durchsucht und 2 perfekt erhaltene Knochen gefunden!'],
        // Unlocks with a name or a count
        [/^You found (a book|two books) that will teach you how to upgrade your (\w+)!$/,
            (_, books, key) => books === 'a book' ? 'Du hast ein Buch gefunden, das dir zeigt, wie du ' + yours(key) + ' verbesserst!' : 'Du hast zwei Bücher gefunden, die dir zeigen, wie du ' + yours(key) + ' verbesserst!'],
        [/^The (copy|(\d+) copies) of 'Speedexplorer' under these bushes will certainly be useful!$/,
            (_, one, n) => (n ? 'Die ' + n + ' Exemplare' : 'Das Exemplar') + ' von ‚Schnellentdeckung‘ unter diesen Büschen ' + (n ? 'werden' : 'wird') + ' sicher nützlich sein!'],
        // Story with colors and resources: the first Portal and the first Helium
        [/^Don't ever let anyone tell you that you didn't just kill that Bloatus\. Because you did\. As he melts away into nothingness, you notice a (green|blue), shining box on the ground\. In tiny writing on the box, you can make out the words 'Time portal\. THIS SIDE UP'\.$/,
            (_, color) => 'Lass dir nie einreden, du hättest den Bloatus nicht gerade erledigt. Denn das hast du. Während er sich ins Nichts auflöst, bemerkst du eine ' + (color === 'green' ? 'grüne' : 'blaue') + ', leuchtende Kiste auf dem Boden. In winziger Schrift steht darauf: ‚Zeitportal. DIESE SEITE NACH OBEN‘.'],
        [/^The world feels a little bit less angry as you fire off your handy Portal Generator\. You can tell that somewhere in some dimension, a Bloatus is no more\. In front of you, (?:a (green|blue), shining box appears|45 (Helium|Radon) and a (green|blue), shining box appear) on the ground\. In tiny writing on the box, you can make out the words 'Time portal\. THIS SIDE UP'\.$/,
            (_, alone, kind, color) => 'Die Welt wirkt ein klein wenig weniger zornig, als du deinen praktischen Portal Generator abfeuerst. Irgendwo in irgendeiner Dimension gibt es einen Bloatus weniger, das spürst du. Vor dir ' +
                (alone ? 'erscheint eine ' + (alone === 'green' ? 'grüne' : 'blaue') + ', leuchtende Kiste' : 'erscheinen 45 ' + kind + ' und eine ' + (color === 'green' ? 'grüne' : 'blaue') + ', leuchtende Kiste') + ' auf dem Boden. In winziger Schrift steht darauf: ‚Zeitportal. DIESE SEITE NACH OBEN‘.'],
        [/^You were able to extract 45 (Helium|Radon) (?:Canister|Vial)s from that Bloatby! Now that you know how to do it, you'll be able to extract (Helium|Radon) from normal Bloatbies\.$/,
            (_, kind) => 'Du konntest 45 ' + vial(kind) + ' aus dem Bloatby gewinnen! Jetzt, da du weißt, wie es geht, kannst du auch aus normalen Bloatbies ' + kind + ' gewinnen.'],
        // Notices with numbers or names
        [/^You must create a map between level 6 and your highest Zone, (\d+)\.$/, (_, zone) => 'Du kannst nur Maps zwischen Stufe 6 und deiner höchsten Zone (' + zone + ') erstellen.'],
        [/^You can't afford this map! You need (\S+) fragments but only have (\S+)\.$/, (_, need, have) => 'Diese Map kannst du dir nicht leisten! Du brauchst ' + need + ' Fragmente, hast aber nur ' + have + '.'],
        [/^Recycled (\d+) maps for (\S+) fragments\.$/, (_, n, refund) => n + ' Maps für ' + refund + ' Fragmente recycelt.'],
        [/^Recycled (.+) for (\S+) fragments\.$/, (_, map, refund) => map + ' für ' + refund + ' Fragmente recycelt.'],
        [/^Recycled (.+)\.$/, (_, map) => map + ' recycelt.'],
        [/^You must finish or (abandon|recycle) your current map before moving on\.$/, (_, how) => 'Beende deine aktuelle Map oder ' + (how === 'abandon' ? 'gib sie auf' : 'recycle sie') + ', bevor es weitergeht.'],
        [/^Your Scientists? stares? blankly at you for a moment, then slowly and quietly places? the new book on the shelves\.$/,
            all => /^Your Scientist /.test(all) ? 'Dein Forscher starrt dich einen Moment lang ausdruckslos an und stellt das neue Buch dann langsam und leise ins Regal.' : 'Deine Forscher starren dich einen Moment lang ausdruckslos an und stellen das neue Buch dann langsam und leise ins Regal.'],
        [/^Your scientists? appreciates? the fact that you've managed to find another useless book, but they make sure to let you know it's still useless\.$/,
            all => /^Your scientist /.test(all) ? 'Dein Forscher freut sich, dass du noch ein nutzloses Buch gefunden hast, stellt aber klar, dass es immer noch nutzlos ist.' : 'Deine Forscher freuen sich, dass du noch ein nutzloses Buch gefunden hast, stellen aber klar, dass es immer noch nutzlos ist.'],
        // A newly made map keeps its generated (English) name; the unique maps above come first as exact sentences.
        [/^You just made (.+)!$/, (_, map) => 'Du hast ' + map + ' erstellt!']
    ];
    const catalog = {strings:{...story, ...unlocks, ...notices, ...loot}, patterns, story, unlocks, notices, loot};
    if (typeof MobileI18nGame !== 'undefined') MobileI18nGame.registerLog('de', catalog);
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeLog;
