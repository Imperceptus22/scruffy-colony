// Presentation only: drop desktop keyboard instructions from rendered text. Key handlers, saves and original sources stay unchanged.
var MobileTouchTexts = (() => {
    const preserved = 'script,style,textarea,input,pre,code,[contenteditable],[data-original-text]';
    const attributes = ['title','aria-label','alt','placeholder'];
    // Exact original phrases; each is either a pure shortcut suffix (removed) or replaced by the existing touch control.
    const rules = [
        [/\s*\(Hot ?keys?:?\s[^()]*\)/g, ''],
        [/\s\((?:Z\/Enter|Esc)\)/g, ''],
        [/,? or press the spacebar/g, ''],
        [/\s*Press S to view the popup\./g, ''],
        [/\s*Press 5 or shift 5 then B to view this Heirloom and its mods\./g, ''],
        [/To interract with Heirlooms while using a Screen Reader, there are a few keyboard shortcuts\.[\s\S]*?Press B to find selectable Heirlooms\.\s*/g, ''],
        [/\s*Hold Ctrl while clicking to configure Logarithmic and Hybrid Notation\./g, ''],
        [/Configure with hotkey Z\./g, ''],
        [/Hold Ctrl while clicking to open the Generator State Configuration menu\./g, "Set Generator states per Zone with 'Zone rules' in the Dimensional Generator."],
        [/ You'll also gain the ability to Ctrl \+ Click the Generator Start setting in the Settings menu to open up the same interface\./g, ''],
        [/When enabled, all Gigastation purchases will act as if the Ctrl key was held, regardless of whether or not it actually was held\. When disabled, you will have to hold Ctrl to tell Gigastations to automatically purchase Warpstations \(See Gigastation tooltip for more info\)\./g,
            'When enabled, each Gigastation purchase also buys back as many Warpstations as you owned before, if you can afford them. When disabled, a Gigastation purchase builds only its one new Warpstation.'],
        [/\bDynamic Giga Ctrl\b/g, 'Gigastation only'],
        [/\bAlways Giga Ctrl\b/g, 'Rebuy Warpstations'],
        [/Holding Ctrl will cause as many Warpstations as you currently own to be purchased immediately after Gigastation, if you can afford them\./g,
            "With the Gigastation controls setting on 'Rebuy Warpstations', as many Warpstations as you currently own are purchased immediately after Gigastation, if you can afford them."],
        [/Ctrl click from Settings to limit speed, or use the slider during Time Warp\./g, 'Use the slider during Time Warp to limit speed.'],
        [/Hold Ctrl while clicking any relic upgrade to access the Relic Automator!/g, ''],
        [/ or Ctrl Click AutoGold for more info\./g, ' for more info.'],
        [/, hold Ctrl to see formula\)/g, ')'],
        [/\s*\(Hold Ctrl to see formula\)/g, ''],
        [/The Spire Assault window can be opened with hotkey "i"/g, ''],
        [/\s*or by holding Ctrl and clicking me/g, ''],
        [/Ctrl Click to customize your string/g, ''],
        [/You can afford to purchase this whole row! Hold Ctrl when clicking to buy this entire row and any uncompleted rows before it\./g, ''],
        [/Ctrl Click this button to customize your Equality settings\./g, ''],
        [/Hold Ctrl to convert as many tokens as you can afford!/g, '']
    ];
    const probe = /hot ?key|ctrl|shift|press|\((?:Z\/Enter|Esc)\)/i;
    function clean(value) {
        if (typeof value !== 'string' || !probe.test(value)) return value;
        return rules.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
    }
    const wrappers = new Set(['B','STRONG','I','EM','U','SMALL','SPAN','P','LI']);
    const blank = node => node && node.nodeType === 3 && !node.data.trim();
    const meaningful = (node, step) => { while (blank(node)) node = node[step]; return node; };
    // A removed hint must not leave an empty wrapper, the line breaks that introduced it, or a space before punctuation.
    function removeHint(node) {
        let target = node;
        while (target.parentElement && wrappers.has(target.parentElement.tagName) && !target.parentElement.id && !target.parentElement.textContent.trim() &&
            !target.parentElement.querySelector('img,svg,canvas,input,select,textarea,button')) target = target.parentElement;
        const next = meaningful(target.nextSibling, 'nextSibling');
        if (!next || next.nodeName === 'BR') {
            let previous = meaningful(target.previousSibling, 'previousSibling');
            while (previous && previous.nodeName === 'BR') { const before = meaningful(previous.previousSibling, 'previousSibling'); previous.remove(); previous = before; }
        }
        const before = target.previousSibling, after = target.nextSibling;
        target.remove();
        if (before && before.nodeType === 3 && after && after.nodeType === 3 && /^[.,;:!?)]/.test(after.data) && /\s$/.test(before.data)) before.data = before.data.trimEnd();
    }
    function cleanText(node) {
        if (!node.parentElement || node.parentElement.closest(preserved)) return;
        const next = clean(node.data);
        if (next === node.data) return;
        if (next.trim()) node.data = next; else { node.data = ''; removeHint(node); }
    }
    function cleanAttributes(node) {
        if (node.closest(preserved)) return;
        for (const attribute of attributes) {
            const value = node.getAttribute(attribute);
            if (value !== null) { const next = clean(value).trim(); if (next !== value.trim()) node.setAttribute(attribute, next); }
        }
    }
    function refresh(root) {
        if (root.nodeType === 3) return cleanText(root);
        if (root.nodeType !== 1 || root.closest(preserved)) return;
        cleanAttributes(root);
        for (const node of root.querySelectorAll('[title],[aria-label],[alt],[placeholder]')) cleanAttributes(node);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), texts = [];
        while (walker.nextNode()) texts.push(walker.currentNode);
        texts.forEach(cleanText);
    }
    if (typeof document !== 'undefined') {
        refresh(document.body);
        new MutationObserver(records => {
            for (const record of records) {
                if (record.type === 'childList') record.addedNodes.forEach(node => node.isConnected && refresh(node));
                else if (record.type === 'attributes') cleanAttributes(record.target);
                else if (record.target.isConnected) cleanText(record.target);
            }
        }).observe(document.body, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
    }
    return {clean};
})();
if (typeof module !== 'undefined') module.exports = MobileTouchTexts;
