// V-243 step 4h: the general buttons Close, Save, Cancel and Confirm (and Apply, the partner of Cancel in many windows)
// read German: Schließen, Speichern, Abbrechen, Bestätigen, Übernehmen. The words stay out of the shared stage 2 catalog,
// because own adapters compare English labels in watched areas (mobile-design.js rewrites Spire Assault's #abCloseBtn in
// #tipText whenever its text is not 'Close'). Instead each original button is relabelled once, right where it is drawn:
// - tooltip() (updates.js) writes the button row into #tipCost / #tipCost2 with innerHTML; after each call the exact labels
//   of that row are replaced. No code reads these labels (Enter and Z find #confirmTooltipBtn by id, own adapters find their
//   buttons by id or onclick), and the row is only written again when tooltip() runs again: nothing is rewritten while idle.
// - renameHeirloom() (main.js) draws Save/Cancel into #renameContainer, which the Heirloom observer never reads (item names).
// - #closeStatsBtn (index.html) is static.
// Spire Assault and the Player Spire stay English (V-278): rows with their own actions (autoBattle., playerSpire.) are left
// as they are, and the Spire Assault Close in #tipText is never touched. English devices skip everything.
var MobileI18nDeButtons = (() => {
    const labels = {
        Close: 'Schließen', Save: 'Speichern', Cancel: 'Abbrechen', Confirm: 'Bestätigen', Apply: 'Übernehmen',
        // Map at Zone (updates.js) and Alchemy (objects.js); mobile-touch-texts.js drops the key hints later or already did.
        'Cancel (Esc)': 'Abbrechen', 'Save and Close': 'Speichern und schließen', 'Save and Close (Z/Enter)': 'Speichern und schließen'
    };
    const buttons = '.btn,button,[role="button"],.renameHeirloomBtn';
    const englishRows = '[onclick*="autoBattle."],[onclick*="playerSpire."]';
    const label = text => typeof text === 'string' && Object.hasOwn(labels, text.trim()) ? labels[text.trim()] : null;
    // Replaces the exact labels of plain buttons (text only) inside root, or root itself; returns the number of writes.
    function relabel(root) {
        if (!root || typeof root.querySelectorAll !== 'function' || root.querySelector(englishRows)) return 0;
        let writes = 0;
        for (const node of [root, ...root.querySelectorAll(buttons)]) {
            if (!node.matches(buttons) || node.children.length) continue;
            const german = label(node.textContent);
            if (german === null) continue;
            node.textContent = german; node.lang = 'de'; writes++;
        }
        return writes;
    }
    function install(win) {
        const layer = win.MobileI18nGame;
        if (!layer || !layer.active || layer.lang !== 'de') return false;
        const doc = win.document, byId = id => doc && typeof doc.getElementById === 'function' ? doc.getElementById(id) : null;
        const after = (name, run) => {
            const original = win[name];
            if (typeof original !== 'function') return;
            win[name] = function (...args) { const result = original.apply(this, args); run(); return result; };
        };
        after('tooltip', () => { relabel(byId('tipCost')); relabel(byId('tipCost2')); });
        after('renameHeirloom', () => relabel(byId('renameContainer')));
        relabel(byId('closeStatsBtn'));
        return true;
    }
    const catalog = {labels, label, relabel, install};
    if (typeof window !== 'undefined' && window.document) install(window);
    return catalog;
})();
if (typeof module !== 'undefined') module.exports = MobileI18nDeButtons;
