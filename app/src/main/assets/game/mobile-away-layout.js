// Keep the original Time Warp calculations and translated rich text. Only their display order changes.
(() => {
    const details = document.getElementById('offlineRunDetails');
    const summary = offlineProgress.extraInfoElem;
    const wrapper = offlineProgress.wrapperElem;
    const sheet = document.getElementById('offlineInnerWrapper');
    const translate = MobileI18nGame.t;
    const eta = document.createElement('span');
    const startup = translate('Starting...');
    summary.dataset.sizingText = translate('Estimated completion in 00:00:00');
    offlineProgress.timeOfflineElem.dataset.sizingText = translate('Limited to 1000x speed');
    document.getElementById('offlineProgressWrapper').dataset.sizingText = translate('999.99K / 999.99K ticks (100.0%)');

    // A shorter message can otherwise clamp scrollTop when the player is at the end.
    // Reserve only their current viewport. Scrolling up immediately releases that space.
    let heldTop = 0;
    function preserveViewport() {
        const top = Math.ceil(wrapper.scrollTop);
        if (top === heldTop) return;
        heldTop = top;
        sheet.style.minHeight = top > 0 ? 'calc(100% + ' + top + 'px)' : '';
    }
    wrapper.addEventListener('scroll', preserveViewport, {passive:true});
    const updateBar = offlineProgress.updateBar;
    offlineProgress.updateBar = function (...args) {
        if (args[0] === 0) wrapper.scrollTop = 0;
        preserveViewport();
        const result = updateBar.apply(this, args);
        // The original writes statistics, ETA and the rotating message separated by two direct <br>s.
        // Move its nodes intact: alternate game number formats can contain inline markup.
        const breaks = summary.querySelectorAll(':scope > br');
        if (breaks.length >= 2) {
            const range = document.createRange();
            range.setStartAfter(breaks[0]);
            range.setEndBefore(breaks[1]);
            eta.replaceChildren(range.extractContents());
            breaks[1].remove();
            details.replaceChildren(...summary.childNodes);
        } else {
            details.replaceChildren(...summary.childNodes);
            eta.textContent = startup;
        }
        summary.append(eta);
        return result;
    };
})();
