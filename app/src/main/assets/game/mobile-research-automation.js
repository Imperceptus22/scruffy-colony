// The engine owns unlocks, mode cycling, countdowns and configuration. The field guide presents its current controls.
var MobileResearchAutomation = (() => {
    const byId = id => document.getElementById(id);
    const de = MobileI18n.lang === 'de';
    const label = de ? 'Automatik' : 'Automation';
    const element = (tag, text) => {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        return node;
    };
    const head = element('section'), heading = element('strong', label), summary = element('button');
    head.id = 'mobile-research-automation';
    heading.className = 'research-automation-heading';
    const count = element('span');
    summary.id = 'research-automation-summary';
    summary.append(element('strong', label), count);
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.setAttribute('aria-controls', 'research-automation-sheet');
    head.append(heading, summary);
    byId('buyTabs').append(head);

    const dialog = element('dialog'), title = element('h2', label), close = element('button', '×');
    dialog.id = 'research-automation-sheet';
    title.id = 'research-automation-title';
    dialog.setAttribute('aria-labelledby', title.id);
    close.setAttribute('aria-label', de ? 'Schließen' : 'Close');
    const header = element('header');
    header.append(title, close);
    dialog.append(header);
    document.body.append(dialog);
    const list = element('div');
    list.className = 'research-automation-rows';

    const rows = [
        ['AutoGold', 'autoGoldenBtn', 'autoGoldenText'], ['AutoPrestige', 'autoPrestigeBtn'], ['AutoUpgrade', 'autoUpgradeBtn']
    ].map(([name, sourceId, actionId]) => {
        const source = byId(sourceId), action = actionId ? byId(actionId) : source;
        const button = element('button'), value = element('span');
        button.dataset.automation = name;
        button.append(element('strong', name), value);
        button.onclick = () => {
            if (source.style.display === 'block') action.click();
        };
        list.append(button);
        return {name, source, action, button, value};
    });
    const config = element('button', de ? 'AutoGold konfigurieren' : 'Configure AutoGold');
    config.id = 'research-autogold-config';
    config.onclick = () => {
        if (config.hidden) return;
        if (dialog.open) dialog.close();
        byId('goldConfig').click();
    };
    list.append(config);

    const translations = {Off: 'Aus', On: 'An', All: 'Alle', 'Weapons First': 'Waffen zuerst',
        'Weapons Only': 'Nur Waffen', 'No Coordination': 'Ohne Koordination', Custom: 'Eigene Priorität', 'PANTS ONLY': 'Nur Hosen'};
    function mode(name, text) {
        const value = text.replace(name, '').trim().replace(/^Auto No Coords$/, 'No Coordination');
        const suffix = value.match(/\s*\(\d+\)$/)?.[0] || '';
        const word = value.slice(0, value.length - suffix.length).trim();
        return (de && translations[word] || word) + suffix;
    }
    function back() {
        if (!dialog.open) return false;
        dialog.close();
        return true;
    }
    function refresh() {
        const onPage = document.documentElement.dataset.graphics === 'diorama' && document.body.dataset.dioramaPage === 'upgrades';
        if (!onPage) {
            head.hidden = true;
            back();
            return;
        }
        let total = 0, active = 0;
        for (const {name, source, action, button, value} of rows) {
            button.hidden = source.style.display !== 'block';
            if (button.hidden) continue;
            total++;
            if (!source.classList.contains('settingBtn0') && !source.classList.contains('colorDanger')) active++;
            const next = mode(name, action.textContent);
            if (value.textContent !== next) value.textContent = next;
        }
        config.hidden = rows[0].button.hidden || !game.global.canGuString || byId('goldConfig').style.display === 'none';
        head.hidden = total === 0;
        heading.hidden = total !== 1;
        summary.hidden = total < 2;
        const target = total < 2 ? head : dialog;
        if (list.parentElement !== target) target.append(list);
        if (total < 2) back();
        const next = de ? active + ' von ' + total + ' aktiv' : active + ' of ' + total + ' active';
        if (count.textContent !== next) count.textContent = next;
    }
    function show() {
        refresh();
        if (!summary.hidden && !head.hidden && !dialog.open) {
            dialog.showModal();
            close.focus();
        }
    }
    summary.onclick = show;
    close.onclick = back;
    dialog.addEventListener('click', event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom)) back();
    });
    const observer = new MutationObserver(refresh);
    observer.observe(byId('upgradesTitleDiv'), {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['style','class']});
    observer.observe(document.body, {attributes:true, attributeFilter:['data-diorama-page']});
    observer.observe(document.documentElement, {attributes:true, attributeFilter:['data-graphics']});
    refresh();
    return {back, focusUpgrade() {
        refresh();
        if (head.hidden || rows[2].button.hidden) return false;
        show();
        rows[2].button.focus();
        return true;
    }};
})();
