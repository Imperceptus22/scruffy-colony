// V-212: images the player sees next are loaded and decoded while the game is idle, so a new enemy type or a page
// opened for the first time shows its picture at once instead of loading it then.
var MobilePreload = (() => {
    const kept = new Map(), LIMIT = 8, done = new Set();
    const idle = callback => (window.requestIdleCallback ? requestIdleCallback(callback, {timeout:2000}) : setTimeout(callback, 200));
    // Enemy images stay referenced (the last few), so their decoded pixels are kept until the fight reaches them.
    function keep(src) {
        if (!src) return;
        if (kept.has(src)) { const image = kept.get(src); kept.delete(src); kept.set(src, image); return; }
        const image = new Image(); image.decoding = 'async'; image.src = src; image.decode?.().catch(() => {});
        kept.set(src, image);
        while (kept.size > LIMIT) kept.delete(kept.keys().next().value);
    }
    // Page scenes are large; they are loaded and decoded once into the cache, not held.
    function warm(src) {
        if (!src || done.has(src)) return;
        done.add(src);
        const image = new Image(); image.decoding = 'async'; image.src = src; image.decode?.().catch(() => {});
    }
    function scenes() {
        if (document.documentElement.dataset.graphics !== 'diorama' || typeof DioramaAssets === 'undefined') return;
        const queue = Object.values(DioramaAssets.scenes || {});
        // One image per idle period, so loading never competes with the game loop.
        const next = () => { const src = queue.shift(); if (!src) return; warm(src); idle(next); };
        idle(next);
    }
    if (typeof document !== 'undefined') {
        addEventListener('load', () => idle(scenes));
        new MutationObserver(scenes).observe(document.documentElement, {attributes:true, attributeFilter:['data-graphics']});
    }
    return {keep, warm};
})();
