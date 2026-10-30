// Shared presentation of original Voidmap/collection rates; no parallel probability calculation.
var MobileHeirloomChances = (() => {
    const original = setHeirRareText;
    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        node.className = cls;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    function render(forMain = false) {
        const host = document.getElementById(forMain ? 'heirloomRarityMain' : 'heirRare');
        const entries = [...host.querySelectorAll('.rarityBdBox')].map(node => ({
            name: node.firstChild.textContent,
            percent: node.lastChild.textContent,
            color: getComputedStyle(node).color
        }));
        const next = [...host.childNodes].filter(node => node.nodeType === 3)
            .map(node => node.textContent).join('').replace(/^\s*-\s*/, '').trim();
        const head = el('div', 'mobile-chance-head');
        head.append(el('strong', '', 'Heirloom chances'), el('span', '', forMain ? next : 'Zone ' + game.global.world));
        const bar = el('div', 'mobile-chance-bar');
        bar.setAttribute('aria-hidden', 'true');
        const legend = el('div', 'mobile-chance-legend');
        for (const entry of entries) {
            const segment = el('span', 'mobile-chance-segment');
            segment.style.width = entry.percent;
            segment.style.backgroundColor = entry.color;
            bar.append(segment);
            const row = el('div', 'mobile-chance-entry');
            const dot = el('span', 'mobile-chance-dot');
            dot.style.backgroundColor = entry.color;
            dot.setAttribute('aria-hidden', 'true');
            row.append(dot, el('span', 'mobile-chance-name', entry.name), el('strong', '', entry.percent));
            legend.append(row);
        }
        const footer = el('div', 'mobile-chance-footer');
        const match = /^Next Rarity Increase at Z(\d+)(.*)$/.exec(next);
        if (match) footer.append(el('span', '', 'Next rarity increase'), el('strong', '', 'Zone ' + match[1] + match[2]));
        else footer.textContent = forMain ? '' : next;
        host.replaceChildren(head, bar, legend, footer);
    }
    setHeirRareText = function(forBones, forMain) {
        const result = original.apply(this, arguments);
        if (!forBones) render(!!forMain);
        return result;
    };
    return {original};
})();
