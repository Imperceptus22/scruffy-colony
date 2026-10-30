// Decorative families, not gameplay classifications. Every original badGuys key is explicitly mapped.
var MobileEnemyArt = (() => {
    const groups = [
        ['spider','Arachnimp'],['beetle','Beetlimp'],['mantis','Mantimp'],['butterfly','Butterflimp'],['penguin','Penguimp'],['turtle','Turtlimp'],['snake','Snimp Voidsnimp Slosnimp Frosnimp'],['squid','Squimp'],['shrimp','Shrimp'],
        ['ape','Chimp Gorillimp Mitschimp'],['hippo','Hippopotamimp'],['duck','Duckimp'],['platypus','Platypimp'],['cat','Kittimp'],['kangaroo','Kangarimp'],['squirrel','Squirrimp'],['turkey','Turkimp Chickimp Flutimp'],['dragon','Dragimp'],
        ['tree','Frimp Entimp'],['stone','Mountimp Gravelimp Brickimp Golimp'],['lava','Slagimp Moltimp Lavimp Flowimp Meltimp Sweltimp'],['ice','Freezo'],['skeleton','Skeletimp Megaskeletimp'],['robot','Robotrimp Mechimp Destructimp Terminatimp Autoimp'],['crystal','Prismimp Rainbimp Lightimp'],['atom','Artimp Neutrimp Fusimp Hydrogimp Carbimp'],['blimp','Blimp Megablimp'],
        ['wizard','Magimp Feyimp Jestimp Chronoimp Magnimp'],['goblin','Gnomimp Goblimp Grimp Seirimp Onoudidimp Nooimp Tauntimp Whipimp Venimp Titimp'],['pumpkin','Pumpkimp'],['gift','Presimpt'],['ranger','Indianimp'],['warden','Warden'],['water','Liquimp Poseidimp'],['eldritch','Horrimp Cthulimp Shadimp Darknimp Improbability Omnipotrimp'],['mutant','Mutimp Hulking_Mutimp']
    ];
    // V-225: portraits drawn facing right; the combat scene mirrors them so every enemy faces the Scruffies on the left.
    const facingRight = new Set(['Tauntimp','Whipimp']);
    const entries = Object.create(null);
    groups.push(['elephant','Elephimp']);
    groups.forEach(([family, names]) => names.split(' ').forEach(name => {
        entries[name] = Object.freeze({family, src:'mobile-assets/imp-family/'+name+'.webp', cell:0, detail:0, standalone:true, mirror:facingRight.has(name)});
    }));
    return Object.freeze({entries:Object.freeze(entries), get:name=>Object.hasOwn(entries,name) ? entries[name] : null});
})();
if (typeof module !== 'undefined') module.exports = MobileEnemyArt;
