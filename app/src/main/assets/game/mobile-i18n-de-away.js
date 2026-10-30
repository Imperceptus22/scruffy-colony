// V-297: translate display nodes after the original draws them; no observer in the fast offline loop.
var MobileI18nDeAway = (() => {
    const strings = {
        'Making up lost time...':'Offline-Zeit nachholen …', 'Starting...':'Wird gestartet …', Cell:'Feld',
        'Lost Time':'Offline-Zeit', 'What is This?!':'Wie funktioniert das?', 'Stop Here':'Hier beenden',
        'Show Equality':'Equality anzeigen', 'Hide Equality':'Equality ausblenden', 'Scale Equality':'Equality skalieren',
        'Start Fighting':'Kampf starten', 'Enable AutoFight':'Automatischen Kampf aktivieren', 'Back to World':'Zurück zur Welt',
        'Wanna run a map?':'Möchtest du eine Map spielen?', 'World Level Map':'Map auf Weltstufe',
        'No maps available':'Keine Maps verfügbar', 'Gain 1 map for each 8 hours away':'Je 8 Stunden Abwesenheit erhältst du 1 Map.',
        "Oof, you don't have enough fragments to run a map.":'Du hast nicht genug Fragmente für eine Map.',
        'You can run':'Du kannst', 'while you wait!':'spielen, während du wartest!',
        'Use it wisely...':'Wähle sie mit Bedacht …', 'Use them wisely...':'Wähle sie mit Bedacht …',
        'Sitting in the Map Chamber (lame)':'Du wartest in der Map-Kammer.',
        "Looks like you still haven't cleared this map. If you want to leave and make an easier one, I won't count it against you!":'Diese Map ist noch nicht abgeschlossen. Du kannst sie verlassen und eine leichtere erstellen, ohne eine verfügbare Map zu verbrauchen.',
        'Starting Offline Progress... (Updates every 2000 processed loops)':'Offline-Fortschritt wird gestartet … (Anzeige nach jeweils 2000 berechneten Spielschritten)',
        'Progress has slowed to a crawl!':'Der Fortschritt ist sehr langsam geworden!',
        'Unlimited Speed!':'Unbegrenzte Geschwindigkeit', 'Speed Limiter':'Geschwindigkeitsbegrenzung',
        'Time Warp Limiter':'Zeitraffer begrenzen',
        'Time Warp too fast? Limit its speed here! Drag the slider all the way to the right for unlimited speed.':'Ist der Zeitraffer zu schnell? Begrenze hier seine Geschwindigkeit. Ganz rechts läuft er ohne Begrenzung.',
        "While you were out, your Trimps didn't get much done - unless you count destruction of property. Luckily you have a Time Portal! While you can't go forward in time, you can go back to keep the Trimps in line and I'll wait here for you.":'Während du weg warst, haben deine Scruffies wenig geschafft – abgesehen von ein paar Sachschäden. Zum Glück hast du ein Zeitportal! Du kannst zwar nicht in die Zukunft reisen, aber zurückgehen und deine Scruffies beaufsichtigen. Ich warte hier auf dich.',
        "While you're in the past, everything will progress like normal, just much faster. The temporal displacement effects give you blurry vision and a headache (making fine control impossible), but you can force your Trimps to stop and run 1 map whenever you want for each 8 hours spent offline! Maps created this way will use your first preset settings at your selected level with Repeat for Items and Exit to World.":'In der Vergangenheit läuft alles wie gewohnt, nur viel schneller. Die Zeitreise macht dich etwas benommen, deshalb ist keine genaue Steuerung möglich. Je 8 Stunden Offline-Zeit kannst du deine Scruffies jedoch anhalten und eine Map spielen lassen. Diese Maps verwenden deine erste Vorlage auf der gewählten Stufe, mit Wiederholung für Gegenstände und anschließender Rückkehr zur Welt.',
        'If your Trimps look stuck, you can always':'Wenn deine Scruffies nicht weiterkommen, kannst du jederzeit',
        "to regain full control of your Trimps, and you'll still receieve resources from Trustworthy Trimps for any unused Time Warp time!":'wählen, um wieder die volle Kontrolle zu übernehmen. Für die übrige Zeitraffer-Zeit erhältst du weiterhin Ressourcen von deinen zuverlässigen Scruffies!',
        'You can Time Warp for 100% of the time you spent offline, up to a maximum of 24 hours.':'Der Zeitraffer kann deine gesamte Offline-Zeit nachholen, höchstens jedoch 24 Stunden.',
        'You can change your Offline Progress setting to suit your needs!':'Du kannst den Offline-Fortschritt in den Einstellungen an deine Wünsche anpassen!',
        'Trustworthy Trimps':'Zuverlässige Scruffies', 'after buying':'nach dem Kauf von',
        'Your Spire Traps and Towers have also produced':'Deine Spire-Fallen und -Türme haben außerdem',
        'Runestones while you were away!':'Runensteine während deiner Abwesenheit erzeugt!',
        'Your Trimps really missed you':'Deine Scruffies haben dich sehr vermisst',
        "Your Trimps didn't do dishes while you were gone":'Deine Scruffies haben den Abwasch stehen lassen',
        'A Scientist has been locked outside all night':'Ein Forscher war die ganze Nacht ausgesperrt',
        "There's a Snimp in the pantry":'Ein Snimp sitzt in der Speisekammer',
        'Your Trimps threw a party while you were out':'Deine Scruffies haben in deiner Abwesenheit gefeiert',
        'Your Trimps raided your fridge while you were gone':'Deine Scruffies haben deinen Kühlschrank geplündert',
        'Some Trimps toilet papered your ship':'Einige Scruffies haben dein Schiff mit Toilettenpapier eingewickelt',
        'Your Trimps were a few minutes away from burning the place down':'Deine Scruffies hätten beinahe alles abgefackelt',
        'The Turkimps escaped again':'Die Turkimps sind schon wieder entkommen',
        'Your Trimps ran the AC all night':'Deine Scruffies haben die Klimaanlage die ganze Nacht laufen lassen',
        'Wow, such speed':'Wow, was für ein Tempo',
        'Your Trimps dinged your ship while out on a joyride':'Deine Scruffies haben bei einer Spritztour dein Schiff verbeult',
        'One of your Trimps got a tattoo while you were gone':'Einer deiner Scruffies hat sich ein Tattoo stechen lassen',
        'Your current setting is':'Deine aktuelle Einstellung ist', 'Allow Reversing':'Verringerung erlauben',
        'Your current reversing setting is':'Deine aktuelle Einstellung für die Verringerung ist',
        'Your Equality stacks when Scaling is disabled will be':'Deine Equality-Stapel bei ausgeschalteter Skalierung:',
        'Equality Scaling':'Equality-Skalierung', 'Equality Reversing':'Equality-Verringerung',
        'Stacks when Equality Scaling Disabled':'Stapel bei ausgeschalteter Equality-Skalierung',
        On:'An', Off:'Aus', Neat:'Verstanden', 'Sweet, thanks.':'Danke!',
    };
    const units = {second:'Sekunde',seconds:'Sekunden',minute:'Minute',minutes:'Minuten',hour:'Stunde',hours:'Stunden',day:'Tag',days:'Tage'};
    const duration = text => text.replace(/\b(seconds?|minutes?|hours?|days?)\b/g, word => units[word]).replace(/ and /g, ' und ');
    const goods = {food:'Nahrung',wood:'Holz',metal:'Metall',gems:'Edelsteine',fragments:'Fragmente',Barn:'Scheune',Barns:'Scheunen',Shed:'Holzlager',Sheds:'Holzlager',Forge:'Schmiede',Forges:'Schmieden'};
    const list = text => text.replace(/\b(food|wood|metal|gems|fragments|Barns?|Sheds?|Forges?)\b/g, word => goods[word]).replace(/\band\b/g, 'und');
    const patterns = [
        [/^Welcome back! You were offline for (.+)\.$/, (_, time) => 'Willkommen zurück! Du warst ' + duration(time) + ' offline.'],
        [/^Limited to (.+)x speed$/, (_, speed) => 'Auf ' + speed + '-fache Geschwindigkeit begrenzt'],
        [/^Cell (\d+)$/, (_, n) => 'Feld ' + n],
        [/^(.+) \/ (.+) ticks \((.+)\)$/, (_, n, total, percent) => n + ' / ' + total + ' Spielschritte (' + percent + ')'],
        [/^(.+) seconds processed in (.+) seconds \((.+)L\/F, (.+)x speed\)$/, (_, n, seconds, loops, speed) => n + ' Sekunden in ' + seconds + ' Sekunden nachgeholt (' + loops + ' Schritte/Bild, ' + speed + '-faches Tempo)'],
        [/^Estimated completion in (.+)$/, (_, time) => 'Voraussichtlich fertig in ' + time],
        [/^Mapping in (.+) \((\d+)\)$/, (_, name, level) => 'Map: ' + name + ' (Stufe ' + level + ')'],
        [/^(\d+) items remain$/, (_, n) => 'Noch ' + n + ' Gegenstände'],
        [/^Z (\d+) map$/, (_, n) => 'Map Stufe ' + n],
        [/^(.+) Frags$/, (_, n) => n + ' Fragmente'],
        [/^(\d+) items$/, (_, n) => n + ' Gegenstände'],
        [/^(\d+) maps?$/, (_, n) => n + (n === '1' ? ' Map' : ' Maps')],
        [/^You have (.+) Fragments\.$/, (_, n) => 'Du hast ' + n + ' Fragmente.'],
        [/^-(\d) Level map$/, (_, n) => 'Map ' + n + ' Stufe(n) niedriger'],
        [/^(No Formation|Heap|Dominance|Barrier|Scryer|Wind)\s*(, Active)?$/, (_, name, active) => (name === 'No Formation' ? 'Keine Formation' : name) + (active ? ', aktiv' : '')],
        [/^(.+) reminds you that he's not a babysitter$/, (_, name) => name + ' erinnert dich daran, dass er kein Babysitter ist'],
        [/^(.+) wrote a novel while you were gone$/, (_, name) => name + ' hat in deiner Abwesenheit einen Roman geschrieben'],
        [/^(.+) really missed you$/, (_, name) => name + ' hat dich sehr vermisst'],
        [/^(.+) greets you excitedly$/, (_, name) => name + ' begrüßt dich aufgeregt'],
        [/^(.+) forgives you for leaving$/, (_, name) => name + ' verzeiht dir deine Abwesenheit'],
        [/^While you were away, your (?:Trimps|Scruffies) were able to produce (.+)$/, (_, items) => 'Während deiner Abwesenheit haben deine Scruffies Folgendes erzeugt: ' + list(items)],
        [/^\d+ (?:Barns?|Sheds?|Forges?)(?:,? (?:and )?\d+ (?:Barns?|Sheds?|Forges?))*\.?$/, text => list(text)],
    ];
    function install(win) {
        const doc = win.document, layer = win.MobileI18nGame, away = win.offlineProgress;
        const german = layer && layer.active && layer.lang === 'de';
        if (german) {
            const brand = text => win.MobileBranding ? win.MobileBranding.text(text) : text;
            layer.extend('de', {strings:Object.fromEntries(Object.entries(strings).map(([a,b]) => [brand(a),b])), patterns});
        }
        function render(root) {
            if (!german || !root) return;
            const walker = doc.createTreeWalker(root, 4);
            let node;
            while ((node = walker.nextNode())) { const next = layer.t(node.data); if (node.data !== next) node.data = next; }
            for (const elem of [root, ...root.querySelectorAll('[aria-label]')]) {
                const label = elem.getAttribute('aria-label');
                if (label) { const next = layer.t(label); if (next !== label) elem.setAttribute('aria-label', next); }
            }
        }
        const tip = win.tooltip;
        if (german && typeof tip === 'function') win.tooltip = function (what, ...args) {
            const result = tip.call(this, what, ...args);
            if (['Lost Time','Trustworthy Trimps','Time Warp Limiter'].includes(what)) render(doc.getElementById(what === 'Lost Time' ? 'tooltipDiv2' : 'tooltipDiv'));
            return result;
        };
        if (german && away) {
            // Only UI drawing calls are wrapped; ticks, rewards, map limits and save/resume remain original.
            for (const name of ['start','updateBar','showEquality','updateFormations']) {
                const original = away[name];
                away[name] = function (...args) { const result = original.apply(this, args); render(doc.getElementById('offlineWrapper')); return result; };
            }
            const limit = away.getLimitText;
            away.getLimitText = function () { return layer.t(limit.apply(this, arguments)); };
            const equality = win.updateEqualityScaling;
            win.updateEqualityScaling = function (...args) { const result = equality.apply(this, args); render(doc.getElementById('equalityScaling3')); return result; };
            render(doc.getElementById('offlineWrapper'));
        }
        return {render};
    }
    if (typeof window !== 'undefined' && window.document) install(window);
    return {strings, patterns, duration, install};
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeAway;
