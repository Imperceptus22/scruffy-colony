// Presentation only: engine keys, saves and original source files keep their names.
var MobileBranding = (() => {
    const preserved = 'script,style,textarea,input,pre,code,[contenteditable],a[href^="http"],[data-original-text]';
    const attributes = ['title','aria-label','alt','placeholder'];
    const names = {'trimps mobile':'Scruffy Colony','welcome to trimps':'Welcome to Scruffy Colony','trimps':'Scruffies','trimp':'Scruffy'};
    const enemies = {
        Dragimp:'Draken',Elephimp:'Trunkle',Arachnimp:'Skitter',Beetlimp:'Beetleby',Mantimp:'Mantickle',Butterflimp:'Flutterby',Penguimp:'Waddleby',Turtlimp:'Shellby',Snimp:'Slitherkin',Voidsnimp:'Voidcoil',Slosnimp:'Broadcoil',Frosnimp:'Frostcoil',Squimp:'Squiddle',Shrimp:'Prawnkin',Chimp:'Chitterby',Gorillimp:'Knuckleby',Mitschimp:'Knucklor',Hippopotamimp:'Hipplod',Duckimp:'Quackby',Platypimp:'Plattle',Kittimp:'Whiskin',Kangarimp:'Pouchkin',Squirrimp:'Bushkin',Turkimp:'Gobbleby',Chickimp:'Cluckby',Flutimp:'Piperkin',
        Frimp:'Twiggle',Entimp:'Barkroot',Mountimp:'Craggle',Gravelimp:'Pebblekin',Brickimp:'Bricklet',Golimp:'Gravok',Gnomimp:'Beardle',Grimp:'Mossgruff',Nooimp:'Brineby',
        Slagimp:'Cindergruff',Moltimp:'Moltenkin',Lavimp:'Lavok',Flowimp:'Emberflow',Meltimp:'Meltle',Sweltimp:'Swellter',Freezo:'Rimekin',Prismimp:'Prismkin',Rainbimp:'Opalby',Lightimp:'Lumenkin',
        Robotrimp:'Rivetgruff',Mechimp:'Coggle',Destructimp:'Wreckle',Terminatimp:'Steelstalker',Autoimp:'Crankby',Artimp:'Augmott',Neutrimp:'Nuclekin',Fusimp:'Fusekin',Hydrogimp:'Hydrel',Carbimp:'Carbock',
        Magimp:'Oddle',Feyimp:'Feylark',Jestimp:'Jinglekin',Chronoimp:'Tickleby',Magnimp:'Magnettle',Goblimp:'Gemgrin',Seirimp:'Oreby',Onoudidimp:'Grumblebrow',Tauntimp:'Teasekin',Whipimp:'Lashkin',Venimp:'Sproutkin',Titimp:'Brawnkin',
        Blimp:'Bloatby',Megablimp:'Bloatus',Pumpkimp:'Gourdle',Presimpt:'Ribbonkin',Indianimp:'Trailkin',Warden:'Lockgruff',Liquimp:'Ripplekin',Poseidimp:'Tidegruff',Skeletimp:'Rattlekin',Megaskeletimp:'Rattlord',
        Horrimp:'Dreadle',Cthulimp:'Dreadtangle',Shadimp:'Shadekin',Darknimp:'Gloomgruff',Improbability:'Oddity',Omnipotrimp:'Crownmaw',Mutimp:'Warpkin',Hulking_Mutimp:'Warpbrute'
    };
    for (const [oldName, newName] of Object.entries({...enemies, Randimp:enemies.Magimp, 'Hulking Mutimp':enemies.Hulking_Mutimp})) {
        names[oldName.toLowerCase()] = newName;
        const plural = oldName === 'Improbability' ? 'Improbabilities' : oldName + 's';
        names[plural.toLowerCase()] = newName.endsWith('y') ? newName.slice(0, -1) + 'ies' : newName.endsWith('s') ? newName + 'es' : newName + 's';
    }
    const research = {Dagadder:'Knifecraft',Megamace:'Bonkcraft',Polierarm:'Longhaft',Axeidic:'Chopcraft',Greatersword:'Broadblade',Harmbalest:'Boltworks',Supershield:'Blocksmith',Bootboost:'Bootstitch',Hellishmet:'Hardcap',Pantastic:'Toughstitch',Smoldershoulder:'Broadbrace',Bestplate:'Chestforge',GambesOP:'Quiltwork'};
    for (const [oldName, newName] of Object.entries(research)) names[oldName.toLowerCase()] = newName;
    // V-226: the Imp-orts pun no longer fits the renamed enemies; Rare Kin is singular and plural. A bare "import" stays
    // (save import); only the Exotic Import phrases of the original are renamed.
    for (const phrase of ['exotic imp-orts','exotic imp-ort','exotic imports','exotic import','imp-orts','imp-ort']) names[phrase] = 'Rare Kin';
    names['more imports'] = 'More Rare Kin';
    names['rare imps'] = 'Rare Kin';
    names['the imps do not'] = 'the Rare Kin do not';
    const pattern = new RegExp('\\b(?:(a|an)\\s+)?(' + Object.keys(names).sort((a,b) => b.length-a.length).join('|') + ')\\b', 'gi');
    function text(value) {
        return value.replace(pattern, (_, article, name) => {
            const next = names[name.toLowerCase()];
            return (article ? article[0] + (/^[aeiou]/i.test(next) ? 'n ' : ' ') : '') + next;
        });
    }
    const rendered = new WeakMap();
    function sameHTML(node, value) {
        let cached = rendered.get(node);
        if (!cached || cached.source !== value) {
            // Compare browser-serialized markup so quote normalization cannot cause repeated writes.
            const template = document.createElement('template');
            template.innerHTML = value;
            cached = {source:value, expected:text(template.innerHTML)};
            rendered.set(node, cached);
        }
        return text(node.innerHTML) === cached.expected;
    }
    function renameText(node) {
        if (!node.parentElement || node.parentElement.closest(preserved)) return;
        const next = text(node.data);
        if (next !== node.data) node.data = next;
    }
    function renameAttributes(node) {
        if (node.closest(preserved)) return;
        for (const attribute of attributes) {
            const value = node.getAttribute(attribute);
            if (value !== null) {
                const next = text(value);
                if (next !== value) node.setAttribute(attribute, next);
            }
        }
    }
    function refresh(root) {
        if (root.nodeType === 3) return renameText(root);
        if (root.nodeType !== 1 || root.closest(preserved)) return;
        renameAttributes(root);
        for (const node of root.querySelectorAll('[title],[aria-label],[alt],[placeholder]')) renameAttributes(node);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) renameText(walker.currentNode);
    }
    if (typeof document !== 'undefined') {
        refresh(document.body);
        new MutationObserver(records => {
            for (const record of records) {
                if (record.type === 'childList') record.addedNodes.forEach(refresh);
                else if (record.type === 'attributes') renameAttributes(record.target);
                else renameText(record.target);
            }
        }).observe(document.body, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
    }
    return {text,sameHTML};
})();
