// V-253: Golden Upgrades are chosen on purpose. The original buys on the first click of an option and explains it only in
// a hover tooltip, which a phone never shows. Here a tap (or Enter) on an option opens that original tooltip (effect,
// current bonus, "only one of these", Free with the remaining count, the Void warning at 72 %) together with why the choice
// appears and a Choose button; only that button calls the original buyGoldenUpgrade. Frequency, effects, the choice and the
// original purchase checks (Void cap, Helium in a Challenge²) stay the original's; the button repeats them only to show
// a blocked option as disabled.
var MobileGoldenUpgrades = (() => {
    const t = value => typeof MobileI18n === 'undefined' ? value : MobileI18n.t(value);
    const key = card => card && /Golden$/.test(card.id || '') ? card.id.slice(0, -6) : null;
    // The original's own conditions from displayGoldenUpgrades and buyGoldenUpgrade (main.js).
    function blocked(game, what) {
        if (what === 'Helium' && game.global.runningChallengeSquared) return true;
        if (what === 'Void') { const v = game.goldenUpgrades.Void; return parseFloat((v.currentBonus + v.nextAmt()).toFixed(2)) > 0.72; }
        return false;
    }
    // Original rule (getAvailableGoldenUpgrades, getGoldenFrequency): from 15 % Achievement bonus every 50 Zones, five Zones
    // fewer per bonus tier down to every 25.
    function reason(bonus, every) {
        return 'Golden Upgrades appear every ' + every + ' Zones at your Achievement bonus of ' + bonus + '%. From 15% they come every 50 Zones, with a higher bonus more often, down to every 25 Zones.';
    }
    // One open window chooses at most once, even when Enter and the click of the same button both arrive.
    let pending = null;
    function open(what) {
        const game = window.game;
        if (!game || !game.goldenUpgrades || !game.goldenUpgrades[what]) return false;
        pending = null;
        TrimpsUI.infoAction(() => tooltip(what, 'goldenUpgrades', 'update'));
        const tip = document.getElementById('tooltipDiv'), cost = document.getElementById('tipCost');
        if (!tip || !cost || tip.style.display === 'none') return false;
        const why = document.createElement('p');
        why.className = 'mobile-golden-why';
        why.textContent = t(reason(prettify(game.global.achievementBonus), getGoldenFrequency(Math.max(1, getAchievementStrengthLevel()))));
        const actions = document.createElement('div');
        actions.className = 'maxCenter mobile-golden-actions';
        const choose = document.createElement('button');
        choose.type = 'button'; choose.id = 'mobile-golden-choose'; choose.className = 'btn btn-success mobile-golden-choose'; choose.textContent = t('Choose');
        choose.disabled = blocked(game, what);
        choose.addEventListener('click', () => pick(what));
        actions.append(choose); cost.append(why, actions);
        pending = what;
        return true;
    }
    function pick(what) {
        const game = window.game;
        if (pending !== what || !game || blocked(game, what)) return false;
        pending = null;
        cancelTooltip();
        return buyGoldenUpgrade(what) === true;
    }
    // Capture phase on the research list, which holds the options: their own onclick (buyGoldenUpgrade) is never reached.
    // A tap that only closes another open window is stopped earlier on the document (mobile-ui.js closeBeside).
    function intercept(event) {
        const card = event.target && event.target.closest ? event.target.closest('.goldenUpgradeThing') : null, what = key(card);
        if (!what) return;
        event.stopPropagation();
        if (event.defaultPrevented) return;
        event.preventDefault();
        open(what);
    }
    let attached = null;
    function attach(list) {
        if (!list || attached === list) return false;
        attached = list;
        list.addEventListener('click', intercept, true);
        return true;
    }
    if (typeof document !== 'undefined' && document.getElementById) {
        if (!attach(document.getElementById('upgradesHere'))) document.addEventListener('DOMContentLoaded', () => attach(document.getElementById('upgradesHere')));
    }
    return {key, blocked, reason, open, pick, intercept, attach};
})();
if (typeof module !== 'undefined') module.exports = MobileGoldenUpgrades;
