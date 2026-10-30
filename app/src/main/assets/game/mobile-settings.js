// Filter the original settings without its desktop twelve-result limit.
var MobileSettings = (() => {
    function matches(option, category, query, label) {
        if (option.locked || (typeof option.lockUnless === 'function' && !option.lockUnless())) return false;
        if (category === 'New' && !option.isNew) return false;
        if (!['All','New'].includes(category) && !(option.extraTags || '').toLowerCase().split(/\s+/).includes(category.toLowerCase())) return false;
        // V-243: the German row name (stage 2) is searchable as well as the English one.
        const shown = typeof MobileI18nGame === 'undefined' ? label : MobileI18nGame.t(label);
        const text = [label, shown, ...option.titles, option.description, option.extraTags || ''].join(' ').toLocaleLowerCase('en');
        return text.includes(query.trim().toLocaleLowerCase('en'));
    }
    function setup(labels, removed, decorate) {
        const byId = id => document.getElementById(id), search = byId('searchSettings'), title = byId('settingTitleBar');
        const categories = {All:'All categories',New:'New',General:'General',Performance:'Performance',QOL:'Quality of life',Alerts:'Alerts',Layout:'Layout',Other:'Other'};
        const select = document.createElement('select'); select.id = 'mobile-setting-category'; select.setAttribute('aria-label','Settings category');
        for (const [value,text] of Object.entries(categories)) { const choice = document.createElement('option'); choice.value=value; choice.textContent=text; select.append(choice); }
        const empty = document.createElement('p'); empty.id='mobile-setting-empty'; empty.textContent='No matching settings.'; empty.hidden=true;
        byId('settingSearchResults').after(empty);
        // Keep the remaining original tab IDs for engine callbacks, with no legacy overview access.
        byId('HotkeyTab').remove(); byId('settingsTabs').hidden=true; byId('searchSettingsTitle').hidden=true;
        title.querySelector('.settingTypeBtn').hidden=true;
        title.replaceChildren(search,select,byId('settingsTabs'),byId('searchSettingsTitle'),title.querySelector('.settingTypeBtn'));
        search.setAttribute('aria-label','Search settings'); search.placeholder='Search settings …';
        function render() {
            select.querySelector('[value="New"]').hidden = !hasNewSetting;
            const results = byId('settingSearchResults');
            results.innerHTML = Object.entries(game.options.menu)
                .filter(([key,option]) => !removed.has(key) && matches(option,select.value,search.value,labels[key] || ''))
                .map(([key,option]) => getSettingHtml(option,key)).join('');
            byId('allSettingsHere').replaceChildren();
            empty.hidden=results.children.length>0;
            decorate();
        }
        select.onchange=render; search.onkeyup=render; search.oninput=render;
        // Opening settings and original option callbacks still use these existing entry points.
        searchSettings=render;
        settingTab=key=>{ select.value=Object.hasOwn(categories,key) ? key : 'All'; search.value=''; render(); };
        select.value='General';
    }
    return {matches,setup};
})();
if (typeof module !== 'undefined') module.exports = MobileSettings;
