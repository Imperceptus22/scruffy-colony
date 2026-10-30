// Synthetic, bundled original-format saves for UI work; never derived from personal progress.
var MobileDevelopment = (() => {
    const scenarios = [
        {id:'portal',label:'Portal & perks',description:'Portal atlas, perk information and actions'},
        {id:'void',label:'Void maps & heirlooms',description:'Rarity chances, maps and heirloom management'},
        {id:'masteries',label:'Masteries & Spire',description:'Later systems and their original controls'},
        {id:'universe2',label:'Universe 2',description:'Radon, later unlocks and mutation tree'}
    ];
    async function prepare(id) {
        if (!scenarios.some(scenario=>scenario.id===id)) throw Error('SCENARIO');
        const response=await fetch('mobile-development/'+id+'.txt');
        if(!response.ok)throw Error('SCENARIO');
        const data=JSON.parse(LZString.decompressFromBase64((await response.text()).trim()));
        data.global.lastOnline=Date.now();data.global.start=Date.now();data.global.time=0;
        return LZString.compressToBase64(JSON.stringify(data));
    }
    return {scenarios,prepare};
})();
