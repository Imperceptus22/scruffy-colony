// Keep the first unstyled game frame covered until the app, language catalogues and graphics adapters are ready.
(function (win, doc) {
    const root = doc.documentElement, started = performance.now(), limit = 15000;
    root.dataset.mobileStarting = '';
    function finish(reason) {
        if (!root.hasAttribute('data-mobile-starting')) return;
        root.removeAttribute('data-mobile-starting');
        win.dispatchEvent(new CustomEvent('scruffy:startup-ready', {detail:{reason, elapsed:Math.round(performance.now() - started)}}));
    }
    function check() {
        const version = win.TrimpsMobile?.version?.(), label = doc.getElementById('mobile-startup-version');
        if (label && version) label.textContent = 'Version ' + version.replace(/^(\d+)\.00(?=$|-)/, '$1.0');
        const recovery = doc.getElementById('mobile-recovery'), status = doc.getElementById('mobile-status');
        const failed = (recovery && !recovery.hidden) || (status && /failed|could not|unavailable/i.test(status.textContent));
        const ready = win.mobileStartupScriptsReady && win.MobileGraphicStyle && win.MobileI18n &&
            (!win.TrimpsMobile || !win.TrimpsMobile.ready || win.TrimpsMobile.ready()) &&
            (!win.MobileI18n.lang || win.MobileI18n.lang === 'en' || win.MobileTexts);
        if (failed) finish('error');
        else if (ready) requestAnimationFrame(() => requestAnimationFrame(() => finish('ready')));
        else if (performance.now() - started >= limit) finish('timeout');
        else setTimeout(check, 50);
    }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', check, {once:true}); else check();
})(window, document);
