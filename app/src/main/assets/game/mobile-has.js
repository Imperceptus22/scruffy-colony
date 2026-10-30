// V-212: conditions the stylesheets used to express with :has(). Many of those rules made the browser restyle large
// parts of the page (up to the whole body) on every game tick. Instead, each condition is kept here as a token in
// data-mobile-has on its element and re-checked only when the watched nodes change; the rules select
// [data-mobile-has~="token"] and keep their old specificity with :is(*,#mobile-has) (id), :is(*,.mobile-has) (class)
// and :is(*,mobile-has) (type) fillers; on #tooltipDiv itself :is(#tooltipDiv) and :is([id]) do the same. Each
// condition is the old :has() argument unchanged, checked inside the same element.
var MobileHas = (() => {
    // Content of the open window (#tooltipDiv) and of rows inside it: [elements, condition inside them, token].
    const TIP = [
        ['#tooltipDiv', '.autoCheckbox', 'autoCheckbox'], ['#tooltipDiv', '.checkboxArmor', 'checkboxArmor'],
        ['#tooltipDiv', '.mobile-message-config', 'mobile-message-config'], ['#tooltipDiv', '#alchemyCraftTable', 'alchemyCraftTable'],
        ['#tooltipDiv', '#autoItemsDiv', 'autoItemsDiv'], ['#tooltipDiv', '#autoJobsError', 'autoJobsError'],
        ['#tooltipDiv', '#equalityScalingState2', 'equalityScalingState2'], ['#tooltipDiv', '#mobile-imprint-title', 'mobile-imprint-title'],
        ['#tooltipDiv', '#mobile-privacy-title', 'mobile-privacy-title'], ['#tooltipDiv', '#mobile-portal-review', 'mobile-portal-review'],
        ['#tooltipDiv', '#structConfigHut', 'structConfigHut'], ['#tooltipDiv', '#mobile-welcome', 'mobile-welcome'],
        ['#autoPurchaseConfigTable .row, #autoStructureConfigTable .row', 'select', 'select'],
        ['#autoStructureConfigTable td', '#autoJobQuantScientist', 'autoJobQuantScientist'],
        ['#autoStructureConfigTable td', '#autoJobQuantScientist2', 'autoJobQuantScientist2'],
        ['#autoStructureConfigTable td', '#autoJobSelfGather', 'autoJobSelfGather'],
        ['#autoPurchaseConfigTable label', '#structQuantGigastation', 'structQuantGigastation'],
        ['#autoPurchaseConfigTable label', '#structZoneNursery', 'structZoneNursery'],
        ['#tipText', '#mobile-imprint-title', 'mobile-imprint-title'], ['#tipText', '#mobile-privacy-title', 'mobile-privacy-title']
    ];
    // Page conditions: [elements, condition inside them, token, watched node id, watched attributes, also its subtree].
    // The watched node is the one whose attributes decide the condition, so the busy game areas around it (population,
    // progress bars) never wake the observer.
    const PAGE = [
        ['body', '#tutorialDiv[style*="display: block"]', 'tutorial-open', 'tutorialDiv', ['style'], false],
        ['body', '#mobile-recovery:not([hidden])', 'recovery', 'mobile-recovery', ['hidden'], false],
        ['body', '#mobile-maps[data-map-active="true"]', 'map-active', 'mobile-maps', ['data-map-active'], false],
        ['body', '#upgradesTitleDiv .autoUpgradeBtn[style*="block"]', 'auto-upgrade', 'upgradesTitleDiv', ['style'], true],
        ['#upgradesTitleDiv', '.autoUpgradeBtn[style*="block"]', 'auto-upgrade', 'upgradesTitleDiv', ['style'], true],
        ['#jobsTitleDiv>.row', '#autoJobsBtn[style*="block"]', 'auto-jobs', 'autoJobsBtn', ['style'], false],
        ['#trimps>.row', '#fluffyBox:not([style*="none"])', 'fluffy-shown', 'fluffyBox', ['style'], false],
        ['#mobile-more', '.mm-detail:not([hidden]), #mm-saves:not([hidden])', 'page-open', 'mobile-more', ['hidden'], true]
    ];
    function mark(node, token, on) {
        const tokens = (node.dataset.mobileHas || '').split(' ').filter(Boolean), has = tokens.includes(token);
        if (on === has) return;
        node.dataset.mobileHas = (on ? [...tokens, token] : tokens.filter(t => t !== token)).join(' ');
    }
    function check([anchors, condition, token]) {
        for (const node of document.querySelectorAll(anchors)) mark(node, token, !!node.querySelector(condition));
    }
    // Called before the window is measured for its position, so it never shows unstyled (updates.js tooltip()).
    function tip() { for (const entry of TIP) check(entry); }
    function start() {
        tip();
        const box = document.getElementById('tooltipDiv');
        if (box) new MutationObserver(tip).observe(box, {childList:true, subtree:true, attributes:true, attributeFilter:['class','id']});
        for (const entry of PAGE) {
            const root = document.getElementById(entry[3]);
            check(entry);
            if (root) new MutationObserver(() => check(entry)).observe(root, {childList:entry[5], subtree:entry[5], attributes:true, attributeFilter:entry[4]});
        }
    }
    return {start, tip, check:() => PAGE.forEach(check)};
})();
