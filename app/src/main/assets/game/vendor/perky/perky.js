// Perky by Grimy, WTFPL. Generated from the pinned sources; see SOURCE.json.
var PerkyCore = (() => {
const {abs,ceil,floor,log,max,min,pow,round,sqrt}=Math;
let game=null,jobless=false,fields={},warnings=[];
const localStorage={notation:'1',zone:'1',preset:'1'},document={addEventListener(){}};
const $=s=>fields[s.slice(1)],$$=()=>[];
function input(id){return parse_suffixes($('#'+id).value);}
function mastery(name){return game.talents[name]?.purchased||false;}
function show_alert(_,text){warnings.push(String(text));}
const notations = [
    [],
    ('KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTgUtgDtgTtgQatg' + 'QitgSxtgSptgOtgNtgQaaUqaDqaTqaQaqaQiqaSxqaSpqaOqaNqaQiaUqiDqiTqiQaqiQiqiSxqiSpqi' + 'OqiNqiSxaUsxDsxTsxQasxQisxSxsxSpsxOsxNsxSpaUspDspTspQaspQispSxspSpspOspNspOgUog' + 'DogTogQaogQiogSxogSpogOogNogNaUnDnTnQanQinSxnSpnOnNnCtUc').split(/(?=[A-Z])/),
    [],
    ('a b c d e f g h i j k l m n o p q r s t u v w x y z' + ' aa ab ac ad ae af ag ah ai aj ak al am an ao ap aq ar as at au av aw ax ay az' + ' ba bb bc bd be bf bg bh bi bj bk bl bm bn bo bp bq br bs bt bu bv bw bx by bz' + ' ca cb cc cd ce cf cg ch ci cj ck cl cm cn co cp cq cr cs ct cu cv cw cx').split(' '),
    'KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTg'.split(/(?=[A-Z])/),
    []
];
function prettify(number) {
    if (number < 0) return '-' + prettify(-number);
    if (number < 10000) return +number.toPrecision(4) + '';
    if (localStorage.notation === '0') return number.toExponential(2).replace('+', '');
    let unit = 0;
    while(number >= 999.5){
        number /= 1000;
        ++unit;
    }
    let suffixes = notations[localStorage.notation || 1];
    let suffix = unit > suffixes.length ? `e${3 * unit}` : suffixes[unit - 1];
    return +number.toPrecision(3) + suffix;
}
function parse_suffixes(str) {
    str = str.replace(/\*.*|[^--9+a-z]/gi, '');
    let suffixes = notations[localStorage.notation === '3' ? 3 : 1];
    for(let i = suffixes.length; i > 0; --i)str = str.replace(new RegExp(suffixes[i - 1] + '$', 'i'), `E${3 * i}`);
    return +str;
}

class Perk {
    base_cost;
    cost_increment;
    scaling;
    max_level;
    cost_exponent;
    locked = true;
    level = 0;
    min_level = 0;
    cost = 0;
    gain = 0;
    bonus = 1;
    constructor(base_cost, cost_increment, scaling, max_level = Infinity, cost_exponent = 1.3){
        this.base_cost = base_cost;
        this.cost_increment = cost_increment;
        this.scaling = scaling;
        this.max_level = max_level;
        this.cost_exponent = cost_exponent;
        this.cost = this.base_cost;
    }
    levellable(he_left) {
        return !this.locked && this.level < this.max_level && this.cost * max(1, floor(this.level / 1e12)) <= he_left;
    }
    level_up(amount) {
        this.level += amount;
        this.bonus = this.scaling(this.level);
        if (this.cost_increment) {
            let spent = amount * (this.cost + this.cost_increment * (amount - 1) / 2);
            this.cost += amount * this.cost_increment;
            return spent;
        } else {
            let spent = this.cost;
            this.cost = ceil(this.level / 2 + this.base_cost * pow(this.cost_exponent, this.level));
            return spent;
        }
    }
    spent(log1 = false) {
        if (this.cost_increment) return this.level * (this.base_cost + this.cost - this.cost_increment) / 2;
        let total = 0;
        for(let x = 0; x < this.level; ++x)total += ceil(x / 2 + this.base_cost * pow(this.cost_exponent, x));
        return total;
    }
    log_ratio() {
        return this.cost_increment ? (this.scaling(1) - this.scaling(0)) / this.bonus : log(this.scaling(this.level + 1) / this.bonus);
    }
}
function validate_fixed() {
    try {
        parse_perks($('#fixed').value, 'l');
        $('#fixed').setCustomValidity('');
    } catch (err) {
        $('#fixed').setCustomValidity(err);
    }
}
let presets = {
    early: [
        '5',
        '4',
        '3'
    ],
    broken: [
        '7',
        '3',
        '1'
    ],
    mid: [
        '16',
        '5',
        '1'
    ],
    corruption: [
        '25',
        '7',
        '1'
    ],
    magma: [
        '35',
        '4',
        '3'
    ],
    z280: [
        '42',
        '6',
        '1'
    ],
    z400: [
        '88',
        '10',
        '1'
    ],
    z450: [
        '500',
        '50',
        '1'
    ],
    spire: [
        '0',
        '1',
        '1'
    ],
    nerfed: [
        '0',
        '4',
        '3'
    ],
    tent: [
        '5',
        '4',
        '3'
    ],
    scientist: [
        '0',
        '1',
        '3'
    ],
    carp: [
        '0',
        '0',
        '0'
    ],
    trapper: [
        '0',
        '7',
        '1'
    ],
    coord: [
        '0',
        '40',
        '1'
    ],
    trimp: [
        '0',
        '99',
        '1'
    ],
    metal: [
        '0',
        '7',
        '1'
    ],
    c2: [
        '0',
        '7',
        '1'
    ],
    income: [
        '0',
        '0',
        '0'
    ],
    unesscented: [
        '0',
        '1',
        '0'
    ],
    nerfeder: [
        '0',
        '1',
        '0'
    ]
};
function select_preset(name, manually = true) {
    delete localStorage['weight-he'];
    delete localStorage['weight-atk'];
    delete localStorage['weight-hp'];
    delete localStorage['weight-xp'];
    [$('#weight-he').value, $('#weight-atk').value, $('#weight-hp').value] = presets[name];
    $('#weight-xp').value = floor((+presets[name][0] + +presets[name][1] + +presets[name][2]) / 5).toString();
}
function auto_preset() {
    let [he, atk, hp] = presets[$('#preset').value];
    let xp = floor((+he + +atk + +hp) / 5).toString();
    $('#weight-he').value = localStorage['weight-he'] || he;
    $('#weight-atk').value = localStorage['weight-atk'] || atk;
    $('#weight-hp').value = localStorage['weight-hp'] || hp;
    $('#weight-xp').value = localStorage['weight-xp'] || xp;
}
function handle_respec(respec) {
    let owned = game ? game.resources.helium.owned : 0;
    $('#helium').value = (input('helium') + owned * (respec ? -1 : 1)).toString();
}
function update_dg() {
    let max_zone = input('zone') / 2 + 115;
    let eff = 500e6 + 50e6 * game.generatorUpgrades.Efficiency.upgrades;
    let capa = 3 + 0.4 * game.generatorUpgrades.Capacity.upgrades;
    let max_fuel = game.permanentGeneratorUpgrades.Storage.owned ? capa * 1.5 : capa;
    let supply = 230 + 2 * game.generatorUpgrades.Supply.upgrades;
    let overclock = game.generatorUpgrades.Overclocker.upgrades;
    overclock = overclock && 1 - 0.5 * pow(0.99, overclock - 1);
    let burn = game.permanentGeneratorUpgrades.Slowburn.owned ? 0.4 : 0.5;
    let cells = mastery('magmaFlow') ? 18 : 16;
    let accel = mastery('quickGen') ? 1.03 : 1.02;
    let hs2 = mastery('hyperspeed2') ? (game.global.highestLevelCleared + 1) / 2 : 0;
    let bs = 0.5 * mastery('blacksmith') + 0.25 * mastery('blacksmith2') + 0.15 * mastery('blacksmith3');
    bs *= game.global.highestLevelCleared + 1;
    let housing = 0;
    let fuel = 0;
    let time = 0;
    function tick(mult) {
        housing += mult * eff * sqrt(min(capa, fuel));
        fuel = max(0, fuel - burn);
    }
    for(let zone = 230; zone <= max_zone; ++zone){
        fuel += cells * (0.01 * min(zone, supply) - 2.1);
        let tick_time = ceil(60 / pow(accel, floor((zone - 230) / 3)));
        time += zone > bs ? 28 : zone > hs2 ? 20 : 15;
        while(time >= tick_time){
            time -= tick_time;
            tick(1);
        }
        while(fuel > max_fuel)tick(overclock);
        housing *= 1.009;
    }
    while(fuel >= burn)tick(1);
    $("#dg").value = prettify(housing);
}
function read_save() {
    if (!localStorage.zone) $('#zone').value = game.stats.highestVoidMap.valueTotal || game.global.highestLevelCleared;
    let zone = input('zone');
    if (!localStorage.preset) {
        $$('#preset > *').forEach(function(option) {
            option.selected = parseInt(option.innerHTML.replace('z', '')) < game.global.highestLevelCleared;
        });
        auto_preset();
    }
    let helium = game.global.heliumLeftover;
    for(let perk in game.portal)helium += game.portal[perk].heliumSpent || 0;
    let unlocks = Object.keys(game.portal).filter((perk)=>!game.portal[perk].locked && game.portal[perk].level !== undefined);
    if (!game.global.canRespecPerks) unlocks = unlocks.map((perk)=>perk + '>' + (game.portal[perk].level || 0));
    let tt = mastery('turkimp2') ? 1 : mastery('turkimp') ? 0.4 : 0.25;
    let prod = 1 + tt;
    let loot = 1 + 0.333 * tt;
    let spires = min(floor((zone - 101) / 100), game.global.spiresCompleted);
    loot *= zone < 100 ? 0.7 : 1 + (mastery('stillRowing') ? 0.3 : 0.2) * spires;
    let chronojest = 27 * game.unlocks.imps.Jestimp + 15 * game.unlocks.imps.Chronoimp;
    let cache = zone < 60 ? 0 : zone < 85 ? 7 : zone < 160 ? 10 : zone < 185 ? 14 : 20;
    for (let mod of game.global.StaffEquipped.mods || []){
        if (mod[0] === 'MinerSpeed') prod *= 1 + 0.01 * mod[1];
        else if (mod[0] === 'metalDrop') loot *= 1 + 0.01 * mod[1];
    }
    if (jobless) prod = 0;
    else chronojest += (mastery('mapLoot2') ? 5 : 4) * cache;
    update_dg();
    $('#helium').value = helium + ($('#respec').checked ? 0 : game.resources.helium.owned);
    $('#unlocks').value = unlocks.join(',');
    $('#whipimp').checked = game.unlocks.imps.Whipimp;
    $('#magnimp').checked = game.unlocks.imps.Magnimp;
    $('#tauntimp').checked = game.unlocks.imps.Tauntimp;
    $('#venimp').checked = game.unlocks.imps.Venimp;
    $('#chronojest').value = prettify(chronojest);
    $('#prod').value = prettify(prod);
    $('#loot').value = prettify(loot);
    $('#breed-timer').value = prettify(mastery('patience') ? 45 : 30);
}
function parse_inputs() {
    let preset = $('#preset').value;
    if (preset == 'trapper' && (!game || game.global.challengeActive != 'Trapper')) throw 'This preset requires a save currently running Trapper². Start a new run using “Trapper² (initial)”, export, and try again.';
    let result = {
        total_he: input('helium'),
        zone: parseInt($('#zone').value),
        perks: parse_perks($('#fixed').value, $('#unlocks').value),
        weight: {
            helium: input('weight-he'),
            attack: input('weight-atk'),
            health: input('weight-hp'),
            xp: input('weight-xp'),
            trimps: input('weight-trimps'),
            income: 0
        },
        fluffy: {
            xp: game ? game.global.fluffyExp : 0,
            prestige: game ? game.global.fluffyPrestige : 0
        },
        mod: {
            storage: 0.125,
            soldiers: 0,
            dg: preset == 'nerfed' ? 0 : input('dg'),
            tent_city: preset == 'tent',
            whip: $('#whipimp').checked,
            magn: $('#magnimp').checked,
            taunt: $('#tauntimp').checked,
            ven: $('#venimp').checked,
            chronojest: input('chronojest'),
            prod: input('prod'),
            loot: input('loot'),
            breed_timer: input('breed-timer')
        }
    };
    if (preset == 'nerfed') {
        result.total_he = 99990000;
        result.zone = 200;
        result.mod.dg = 0;
    }
    if (preset == 'trapper') {
        result.mod.soldiers = game.resources.trimps.owned;
        result.mod.prod = 0;
        result.perks.Pheromones.max_level = 0;
        result.perks.Anticipation.max_level = 0;
    }
    if (preset == 'spire') {
        result.mod.prod = result.mod.loot = 0;
        result.perks.Overkill.max_level = 0;
        if (game) result.zone = game.global.world;
    }
    if (preset == 'carp') {
        result.mod.prod = result.mod.loot = 0;
        result.weight.trimps = 1e6;
    }
    if (preset == 'metal') result.mod.prod = 0;
    if (preset == 'trimp') result.mod.soldiers = 1;
    if (preset == 'nerfed') result.perks.Overkill.max_level = 1;
    if (preset == 'scientist') result.perks.Coordinated.max_level = 0;
    if (preset == 'income') result.weight = {
        income: 3,
        trimps: 3,
        attack: 1,
        helium: 0,
        health: 0,
        xp: 0
    };
    if (preset == 'unesscented') {
        result.total_he = 0;
        result.zone = 181;
    }
    if (preset == 'nerfeder') {
        result.total_he = 999900000;
        result.zone = 300;
    }
    let max_zone = game ? game.global.highestLevelCleared : 999;
    if (preset.match(/trimp|coord/) && result.zone >= max_zone * 2 / 3) show_alert('warning', 'Your target zone seems too high for this c², try lowering it.');
    if (preset == 'spire' && game && game.global.world != 100 * (2 + game.global.lastSpireCleared)) show_alert('warning', 'This preset is meant to be used mid-run, when you’re done farming for the Spire.');
    return result;
}
function display(results) {
    let [he_left, perks] = results;
    let perk_size = game ? game.options.menu.smallPerks.enabled : 0;
    let size = $('#perks').clientWidth / (5 + perk_size);
    $('#test-text').innerText = `Level: ${prettify(12345678)} (+${prettify(1234567)})`;
    let level_text = size > $('#test-text').clientWidth ? 'Level: ' : '';
    $('#results').style.opacity = '1';
    $('#info').innerText = localStorage.more ? 'Less info' : 'More info';
    $('#he-left').innerHTML = prettify(he_left) + ' Helium Left Over';
    $('#perks').innerHTML = Object.keys(perks).filter((name)=>!perks[name].locked).map((name)=>{
        let { level, max_level } = perks[name];
        let diff = game ? level - game.portal[name].level : 0;
        let diff_text = diff ? ` (${diff > 0 ? '+' : '-'}${prettify(abs(diff))})` : '';
        let style = diff > 0 ? 'adding' : diff < 0 ? 'remove' : level >= max_level ? 'capped' : '';
        style += [
            ' large',
            ' small',
            ' tiny'
        ][perk_size];
        return `<div class='perk ${style} ${localStorage.more}'>` + `<b>${name.replace('_', ' ')}</b><br>` + `${level_text}<b>${prettify(level)}${diff_text}</b><br><span class=more>` + `Price: ${level >= max_level ? '∞' : prettify(perks[name].cost)}<br>` + `Spent: ${prettify(perks[name].spent())}</span></div>`;
    }).join('');
    for(let name in perks)perks[name] = perks[name].level;
    $('#perkstring').value = LZString.compressToBase64(JSON.stringify(perks));
}
document.addEventListener("DOMContentLoaded", validate_fixed, false);
document.addEventListener("DOMContentLoaded", auto_preset, false);
function main() {
    display(optimize(parse_inputs()));
}
function toggle_info() {
    localStorage.more = localStorage.more ? '' : 'more';
    $$('.perk').forEach((elem)=>elem.classList.toggle('more'));
    $('#info').innerText = localStorage.more ? 'Less info' : 'More info';
}
function parse_perks(fixed, unlocks) {
    const add = (x)=>(level)=>1 + x * 0.01 * level;
    const mult = (x)=>(level)=>pow(1 + x * 0.01, level);
    let perks = {
        Looting_II: new Perk(100e3, 10e3, add(0.25)),
        Carpentry_II: new Perk(100e3, 10e3, add(0.25)),
        Motivation_II: new Perk(50e3, 1e3, add(1)),
        Power_II: new Perk(20e3, 500, add(1)),
        Toughness_II: new Perk(20e3, 500, add(1)),
        Capable: new Perk(1e8, 0, (l)=>1, 10, 10),
        Cunning: new Perk(1e11, 0, add(25)),
        Curious: new Perk(1e14, 0, add(160)),
        Classy: new Perk(1e17, 0, mult(4.5678375), 75),
        Overkill: new Perk(1e6, 0, add(500), 30),
        Resourceful: new Perk(50e3, 0, mult(-5)),
        Coordinated: new Perk(150e3, 0, mult(-2)),
        Siphonology: new Perk(100e3, 0, (l)=>pow(1 + l, 0.1), 3),
        Anticipation: new Perk(1000, 0, add(6), 10),
        Resilience: new Perk(100, 0, mult(10)),
        Meditation: new Perk(75, 0, add(1), 7),
        Relentlessness: new Perk(75, 0, (l)=>1 + 0.05 * l * (1 + 0.3 * l), 10),
        Carpentry: new Perk(25, 0, mult(10)),
        Artisanistry: new Perk(15, 0, mult(-5)),
        Range: new Perk(1, 0, add(1), 10),
        Agility: new Perk(4, 0, mult(-5), 20),
        Bait: new Perk(4, 0, add(100)),
        Trumps: new Perk(3, 0, add(20)),
        Pheromones: new Perk(3, 0, add(10)),
        Packrat: new Perk(3, 0, add(20)),
        Motivation: new Perk(2, 0, add(5)),
        Power: new Perk(1, 0, add(5)),
        Toughness: new Perk(1, 0, add(5)),
        Looting: new Perk(1, 0, add(5))
    };
    if (unlocks == '*') unlocks = Object.keys(perks).join(',');
    if (!unlocks.match(/>/)) unlocks = unlocks.replace(/(?=,|$)/g, '>0');
    for (let item of (unlocks + ',' + fixed).split(/,/).filter((x)=>x)){
        let m = item.match(/(\S+) *([<=>])=?(.*)/);
        if (!m) throw 'Enter a list of perk levels, such as “power=42, toughness=51”.';
        let tier2 = m[1].match(/2$|II$/i);
        let name = m[1].replace(/[ _]?(2|II)/i, '').replace(/^OK/i, 'O').replace(/^Looty/i, 'L');
        let regex = new RegExp(`^${name}[a-z]*${tier2 ? '_II' : ''}$`, 'i');
        let matches = Object.keys(perks).filter((p)=>p.match(regex));
        if (matches.length > 1) throw `Ambiguous perk abbreviation: ${m[1]}.`;
        if (matches.length < 1) throw `Unknown perk: ${m[1]}.`;
        let level = parse_suffixes(m[3]);
        if (!isFinite(level)) throw `Invalid number: ${m[3]}.`;
        perks[matches[0]].locked = false;
        if (m[2] != '>') perks[matches[0]].max_level = level;
        if (m[2] != '<') perks[matches[0]].min_level = level;
    }
    return perks;
}
function optimize(params) {
    let { total_he, zone, fluffy, perks, weight, mod } = params;
    let he_left = total_he;
    let { Looting_II, Carpentry_II, Motivation_II, Power_II, Toughness_II, Capable, Cunning, Curious, Classy, Overkill, Resourceful, Coordinated, Siphonology, Anticipation, Resilience, Meditation, Relentlessness, Carpentry, Artisanistry, Range, Agility, Bait, Trumps, Pheromones, Packrat, Motivation, Power, Toughness, Looting } = perks;
    for (let name of [
        'whip',
        'magn',
        'taunt',
        'ven'
    ])mod[name] = pow(1.003, zone * 99 * 0.03 * mod[name]);
    const books = pow(1.25, zone) * pow(zone > 100 ? 1.28 : 1.2, max(zone - 59, 0));
    const gigas = max(0, min(zone - 60, zone / 2 - 25, zone / 3 - 12, zone / 5, zone / 10 + 17, 39));
    const base_housing = pow(1.25, 5 + min(zone / 2, 30) + gigas);
    const mystic = zone >= 25 ? floor(min(zone / 5, 9 + zone / 25, 15)) : 0;
    const tacular = (20 + zone - zone % 5) / 100;
    const base_income = 600 * mod.whip * books;
    const base_helium = pow(zone - 19, 2);
    const max_tiers = zone / 5 + +((zone - 1) % 10 < 5);
    const exponents = {
        cost: pow(1.069, 0.85 * (zone < 60 ? 57 : 53)),
        attack: pow(1.19, 13),
        health: pow(1.19, 14),
        block: pow(1.19, 10)
    };
    const equip_cost = {
        attack: 211 * (weight.attack + weight.health) / weight.attack,
        health: 248 * (weight.attack + weight.health) / weight.health,
        block: 5 * (weight.attack + weight.health) / weight.health
    };
    function ticks() {
        return 1 + +(Agility.bonus > 0.9) + ceil(10 * Agility.bonus);
    }
    function moti() {
        return Motivation.bonus * Motivation_II.bonus * Meditation.bonus;
    }
    const looting = ()=>Looting.bonus * Looting_II.bonus;
    function gem_income() {
        let drag = moti() * mod.whip;
        let loot = looting() * mod.magn * 0.75 * 0.8;
        let chronojest = mod.chronojest * drag * loot / 30;
        return drag + loot + chronojest;
    }
    const trimps = mod.tent_city ? ()=>{
        let carp = Carpentry.bonus * Carpentry_II.bonus;
        let territory = Trumps.bonus;
        return 10 * (mod.taunt + territory * (mod.taunt - 1) * 111) * carp;
    } : ()=>{
        let carp = Carpentry.bonus * Carpentry_II.bonus;
        let bonus = 3 + log(base_housing * gem_income() / Resourceful.bonus) / log(1.4);
        let territory = Trumps.bonus * zone;
        return 10 * (base_housing * bonus + territory) * carp * mod.taunt + mod.dg * carp;
    };
    function income(ignore_prod) {
        let storage = mod.storage * Resourceful.bonus / Packrat.bonus;
        let loot = looting() * mod.magn / ticks();
        let prod = ignore_prod ? 0 : moti() * mod.prod;
        let chronojest = mod.chronojest * 0.1 * prod * loot;
        return base_income * (prod + loot * mod.loot + chronojest) * (1 - storage) * trimps();
    }
    function equip(stat) {
        let cost = equip_cost[stat] * Artisanistry.bonus;
        let levels = 1.136;
        let tiers = log(1 + income() / cost) / log(exponents.cost);
        if (tiers > max_tiers + 0.45) {
            levels = log(1 + pow(exponents.cost, tiers - max_tiers) * 0.2) / log(1.2);
            tiers = max_tiers;
        }
        return levels * pow(exponents[stat], tiers);
    }
    function building(cost, exp) {
        cost *= 4 * Resourceful.bonus;
        return log(1 + income(true) * (exp - 1) / cost) / log(exp);
    }
    function magma() {
        return max(zone - 229, 0);
    }
    function breed() {
        let nurseries = building(2e6, 1.06) / (1 + 0.1 * min(magma(), 20));
        let potency = 0.0085 * (zone >= 60 ? 0.1 : 1) * pow(1.1, floor(zone / 5));
        return potency * pow(1.01, nurseries) * Pheromones.bonus * mod.ven;
    }
    let group_size = [];
    for(let coord = 0; coord <= log(1 + he_left / 500e3) / log(1.3); ++coord){
        let ratio = 1 + 0.25 * pow(0.98, coord);
        let available_coords = zone - 1 + (magma() ? 100 : 0);
        let result = 1;
        for(let i = 0; i < available_coords; ++i)result = ceil(result * ratio);
        group_size[coord] = result;
    }
    function soldiers() {
        let ratio = 1 + 0.25 * Coordinated.bonus;
        let pop = (mod.soldiers || trimps()) / 3;
        if (mod.soldiers > 1) pop += 36000 * Bait.bonus;
        let unbought_coords = max(0, log(group_size[Coordinated.level] / pop) / log(ratio));
        return group_size[0] * pow(1.25, -unbought_coords);
    }
    function gators() {
        if (zone < 230 || mod.soldiers > 1 || jobless) return 0;
        let ooms = log(trimps() / group_size[Coordinated.level]) / log(10);
        return max(0, (ooms - 7 + floor((zone - 215) / 100)) / 3);
    }
    function attack() {
        let attack = (0.15 + equip('attack')) * pow(0.8, magma());
        attack *= Power.bonus * Power_II.bonus * Relentlessness.bonus;
        attack *= Siphonology.bonus * Range.bonus * Anticipation.bonus;
        attack *= fluffy.attack[Capable.level];
        attack *= game && mastery('amalg') ? 1.5 ** gators() : 1 + 0.5 * gators();
        return soldiers() * attack;
    }
    function health() {
        let health = (0.6 + equip('health')) * pow(0.8, magma());
        health *= Toughness.bonus * Toughness_II.bonus * Resilience.bonus;
        let gyms = building(400, 1.185);
        let trainers = jobless ? 0 : (gyms * log(1.185) - log(1 + gyms)) / log(1.1) + 25 - mystic;
        let block = 0.04 * gyms * pow(1 + mystic / 100, gyms) * (1 + tacular * trainers);
        let attacks = 60;
        if (zone < 70 || jobless) {
            let timer = log(1 + soldiers() * breed() / Bait.bonus) / log(1 + breed());
            attacks = timer / ticks();
        } else {
            let fighting = min(group_size[Coordinated.level] / trimps(), 1 / 3);
            let target_speed = fighting > 1e-9 ? (pow(0.5 / (0.5 - fighting), 0.1 / mod.breed_timer) - 1) * 10 : fighting / mod.breed_timer;
            let geneticists = log(breed() / target_speed) / -log(0.98);
            health *= pow(1.01, geneticists);
            health *= pow(1.332, gators());
        }
        health /= attacks;
        if (zone < 60) block += equip('block');
        else block = min(block, 4 * health);
        return soldiers() * (block + health);
    }
    const xp = ()=>Cunning.bonus * Curious.bonus * Classy.bonus;
    const agility = ()=>1 / Agility.bonus;
    const helium = ()=>base_helium * looting() + 45;
    const overkill = ()=>Overkill.bonus;
    const stats = {
        agility,
        helium,
        xp,
        attack,
        health,
        overkill,
        trimps,
        income
    };
    function score() {
        let result = 0;
        for(let i in weight){
            if (!weight[i]) continue;
            let stat = stats[i]();
            if (!isFinite(stat)) throw Error(i + ' is ' + stat);
            result += weight[i] * log(stat);
        }
        return result;
    }
    function recompute_marginal_efficiencies() {
        let baseline = score();
        for(let name in perks){
            let perk = perks[name];
            if (perk.cost_increment || !perk.levellable(he_left)) continue;
            perk.level_up(1);
            perk.gain = score() - baseline;
            perk.level_up(-1);
        }
        for (let name of [
            'Looting',
            'Carpentry',
            'Motivation',
            'Power',
            'Toughness'
        ])perks[name + '_II'].gain = perks[name].gain * perks[name + '_II'].log_ratio() / perks[name].log_ratio();
    }
    function solve_quadratic_equation(a, b, c) {
        let delta = b * b - 4 * a * c;
        return (-b + sqrt(delta)) / (2 * a);
    }
    function spend_he(perk, budget) {
        perk.gain /= perk.log_ratio();
        if (perk.cost_increment) {
            let ratio = (1 + perk.level) / (1000 + Looting_II.level + Carpentry_II.level + Motivation_II.level + Power_II.level + Toughness_II.level);
            budget *= 0.5 * ratio ** 2;
            let x = solve_quadratic_equation(perk.cost_increment / 2, perk.cost - perk.cost_increment / 2, -budget);
            he_left -= perk.level_up(floor(max(min(x, perk.max_level - perk.level), 1, perk.level / 1e12)));
        } else {
            budget **= 0.5;
            do he_left -= perk.level_up(1);
            while (perk.cost < budget && perk.level < perk.max_level)
        }
        perk.gain *= perk.log_ratio();
    }
    mod.loot *= 20.8;
    weight.agility = (weight.helium + weight.attack) / 2;
    weight.overkill = 0.25 * weight.attack * (2 - pow(0.9, weight.helium / weight.attack));
    if (zone > 90 && mod.soldiers <= 1 && Bait.min_level == 0) Bait.max_level = 0;
    fluffy.attack = [];
    let potential = log(0.003 * fluffy.xp / pow(5, fluffy.prestige) + 1) / log(4);
    for(let cap = 0; cap <= 10; ++cap){
        let level = min(floor(potential), cap);
        let progress = level == cap ? 0 : (pow(4, potential - level) - 1) / 3;
        fluffy.attack[cap] = 1 + pow(5, fluffy.prestige) * 0.1 * (level / 2 + progress) * (level + 1);
    }
    console.time();
    for(let name in perks){
        let perk = perks[name];
        if (perk.cost_increment) he_left -= perk.level_up(perk.min_level);
        else while(perk.level < perk.min_level)he_left -= perk.level_up(1);
    }
    let ratio = 0.25;
    while(Capable.levellable(he_left * ratio)){
        he_left -= Capable.level_up(1);
        ratio = Capable.level <= floor(potential) && zone > 300 && weight.xp > 0 ? 0.25 : 0.01;
    }
    if (zone <= 300 || potential >= Capable.level) weight.xp = 0;
    if (he_left < 0) throw game && game.global.canRespecPerks ? "You don’t have enough Helium to afford your Fixed Perks." : "You don’t have a respec available.";
    let sorted_perks = Object.keys(perks).map((name)=>perks[name]).filter((perk)=>perk.levellable(he_left));
    let reference_he = he_left;
    for(let x = 0.999; x > 1e-12; x *= x){
        let he_target = reference_he * x;
        recompute_marginal_efficiencies();
        sorted_perks.sort((a, b)=>b.gain / b.cost - a.gain / a.cost);
        while(he_left > he_target && sorted_perks.length){
            let best = sorted_perks.shift();
            if (!best.levellable(he_left)) continue;
            spend_he(best, he_left - he_target);
            let i = 0;
            while(sorted_perks[i] && sorted_perks[i].gain / sorted_perks[i].cost > best.gain / best.cost)i++;
            sorted_perks.splice(i, 0, best);
        }
    }
    if (he_left + 1 < total_he / 1e12 && Toughness_II.level > 0) {
        --Toughness_II.level;
        he_left += Toughness_II.cost;
    }
    console.timeEnd();
    return [
        he_left,
        perks
    ];
}

function calculate(ctx,options={}){
    game=ctx.game;jobless=game.global.ShieldEquipped.name==='Job';warnings=[];
    const preset=options.preset||'early',zone=Number(options.zone);
    if(!Object.hasOwn(presets,preset))throw Error('Unknown preset.');
    if(!Number.isInteger(zone)||zone<1||zone>999)throw Error('Target zone must be between 1 and 999.');
    fields={};for(const id of ['preset','zone','helium','fixed','unlocks','respec','weight-he','weight-atk','weight-hp','weight-xp','weight-trimps','dg','prod','loot','chronojest','breed-timer','whipimp','magnimp','tauntimp','venimp'])fields[id]={value:'0',checked:false};
    fields.respec.checked=ctx.midRun;
    fields.preset.value=preset;fields.zone.value=String(zone);select_preset(preset);read_save();
    fields.helium.value=String(ctx.budget);
    fields.unlocks.value=ctx.perks.filter(p=>!p.locked).map(p=>p.name+'>'+(!ctx.canRespec?p.level:0)).join(',');
    const fixed=String(options.fixed||'');if(fixed.length>2048||fixed.split(',').some(x=>x.trim()&&!/^\s*[a-z_][a-z_ 0-9]*\s*[<=>]=?[^,]*$/i.test(x)))throw Error('Use comma-separated limits, for example Power=20, Looting>10, Bait<5.');
    fields.fixed.value=fixed;
    const inputNames={helium:'weight-he',attack:'weight-atk',health:'weight-hp',xp:'weight-xp',trimps:'weight-trimps',prod:'prod',loot:'loot',chronojest:'chronojest',dg:'dg',breedTimer:'breed-timer'};
    for(const [name,id] of Object.entries(inputNames))if(options[name]!==undefined&&options[name]!==''){
        const n=Number(options[name]);if(!Number.isFinite(n)||n<0||n>1e100||(name==='breedTimer'&&n<1))throw Error('Invalid '+name+' value.');fields[id].value=String(n);
    }
    const params=parse_inputs();
    // Feat presets have their own caps; they cannot grant more than the actual budget.
    params.total_he=Math.min(params.total_he,ctx.budget);
    if(!Number.isFinite(params.total_he)||params.total_he<0||!Object.values(params.weight).some(n=>n>0))throw Error('Use at least one positive weight.');
    for(const p of ctx.perks){
        const perk=params.perks[p.name];if(!perk){if(!p.locked)throw Error('Unsupported perk: '+p.name);continue;}
        if(perk.base_cost!==p.base||perk.cost_increment!==p.increment||perk.cost_exponent!==p.growth)throw Error('Perky data differs from the current game: '+p.name);
        if(p.locked){if(!perk.locked)throw Error(p.name+' is locked.');continue;}
        perk.max_level=Math.min(perk.max_level,p.max);
        if(!p.additive){perk.min_level=Math.max(perk.min_level,p.current-1000);perk.max_level=Math.min(perk.max_level,p.current+1000);}
        if(!ctx.canRespec)perk.min_level=Math.max(perk.min_level,p.level);
        if(!Number.isSafeInteger(perk.min_level)||perk.min_level<0||!Number.isSafeInteger(perk.max_level)||perk.max_level<perk.min_level)throw Error('Invalid limits for '+p.name+'.');
    }
    const [remaining,result]=optimize(params),levels=Object.fromEntries(Object.entries(result).map(([name,p])=>[name,p.level]));
    for(const [name,p] of Object.entries(result))if(!Number.isSafeInteger(p.level)||p.level<p.min_level||p.level>p.max_level||(p.locked&&p.level!==0))throw Error('The calculator could not satisfy the limits for '+name+'.');
    if(!Number.isFinite(remaining))throw Error('The calculator could not produce a finite result.');
    return{levels,remaining,zone:params.zone,preset,warnings,weights:params.weight,inputs:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.value]))};
}
return{calculate,presets};

})();
if(typeof module!=="undefined")module.exports=PerkyCore;
