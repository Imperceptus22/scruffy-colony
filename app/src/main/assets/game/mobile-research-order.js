// V-178: Research rows the player can afford first (original thingColorCanAfford), otherwise the original order.
// Display order only: the original rows, handlers and game.upgrades stay untouched. Rows move only when the tab opens
// and after a purchase, never on a plain affordability change, so nothing jumps under the finger. After an original
// redraw (drawAllUpgrades rebuilds the list in original order, every button unaffordable until the next price pass)
// the last sorted grouping is restored instead of being recomputed.
var MobileResearchOrder = (() => {
    // Stable: affordable before unaffordable, each group in the original index order.
    function order(items) {
        return items.map((item, position) => ({item, position})).sort((a, b) =>
            (b.item.affordable - a.item.affordable) || (a.item.index - b.item.index) || (a.position - b.position)).map(entry => entry.item.id);
    }
    let host = null, grouping = new Map();
    const button = row => row.querySelector(':scope>.upgradeThing');
    // Upgrade rows only: golden upgrades and the Equipment Optimization card keep their place at the front.
    const rows = () => [...host.children].filter(row => row.classList.contains('mobile-purchase') && row.id !== 'mobile-equipment-research' && button(row)?.id in game.upgrades);
    function arrange(affordable) {
        if (!host) return false;
        const list = rows();if (list.length < 2) return false;
        const names = Object.keys(game.upgrades), byName = new Map(list.map(row => [button(row).id, row]));
        const sorted = order(list.map(row => ({id:button(row).id, affordable:affordable(row), index:names.indexOf(button(row).id)})));
        if (sorted.every((id, i) => byName.get(id) === list[i])) return false;
        const focus = document.activeElement, anchor = list[0].previousSibling;
        if (anchor) anchor.after(...sorted.map(id => byName.get(id))); else host.prepend(...sorted.map(id => byName.get(id)));
        if (focus && focus !== document.activeElement && focus.isConnected) focus.focus({preventScroll:true});
        return true;
    }
    // Tab opened or purchase made: refresh the original prices (an original redraw leaves every button unaffordable
    // until the next pass), then group by the original affordability classes. With the original screen reader mode the
    // list keeps its order, because its srTooltip nodes sit beside the rows in the same list.
    function sort() {
        if (!host || (typeof usingScreenReader !== 'undefined' && usingScreenReader)) return false;
        if (typeof checkButtons === 'function') checkButtons('upgrades');
        grouping = new Map(rows().map(row => [button(row).id, button(row).classList.contains('thingColorCanAfford')]));
        return arrange(row => grouping.get(button(row).id) ? 1 : 0);
    }
    function attach(node) {
        host = node;if (!host) return;
        // Own moves also report added rows; the list is then already in order and arrange() leaves it alone.
        new MutationObserver(records => {
            if (!grouping.size || !records.some(record => [...record.addedNodes].some(row => row.classList?.contains('mobile-purchase')))) return;
            arrange(row => grouping.get(button(row).id) ? 1 : 0);
        }).observe(host, {childList:true});
        // A purchase is a click on a research button that changed the original level; prices are refreshed first.
        let before = null;
        host.addEventListener('click', event => {const b = event.target.closest?.('.upgradeThing');before = b && game.upgrades[b.id] ? [b.id, game.upgrades[b.id].done] : null;}, true);
        host.addEventListener('click', () => {
            if (!before) return;const [name, done] = before;before = null;
            if (game.upgrades[name].done === done) return;
            sort();
        });
    }
    return {order, sort, attach, arrange};
})();
if (typeof module !== 'undefined') module.exports = MobileResearchOrder;
