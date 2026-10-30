// Trimps Mobile: validate data before the original engine or any renderer sees it.
var SaveValidation = (() => {
    const node = typeof module !== 'undefined' && module.exports;
    const lz = node ? require('./lz-string.js') : LZString;
    const schema = node ? require('./save-schema.js') : SaveSchema;
    const MAX_ENCODED = 2 * 1024 * 1024;
    const MAX_DECODED = 16 * 1024 * 1024;
    const fail = (code, path) => { const error = new Error(code); error.code = code; error.path = path; throw error; };

    // Original derived loot icons, not a general HTML sanitizer. Preserve only empty icon spans.
    function safeGridIcon(text) {
        if (text.length > 1024) return false;
        const outer = text.match(/^<span\s+([^<>]*)><\/span>$/);
        if (!outer) return false;
        const attributes = outer[1], seen = new Set();
        const pattern = /(class|title|aria-label)=(?:"([^"<>\x00]*)"|'([^'<>\x00]*)')/g;
        let end = 0;
        for (const attr of attributes.matchAll(pattern)) {
            if (attributes.slice(end, attr.index).trim() || seen.has(attr[1])) return false;
            seen.add(attr[1]); end = attr.index + attr[0].length;
            const value = attr[2] ?? attr[3];
            if (attr[1] === 'class' && !/^(?:glyphicon glyphicon-[a-z0-9-]+|icomoon icon-[a-z0-9-]+)(?: [A-Za-z0-9_-]+)*\s*$/.test(value)) return false;
            if (attr[1] !== 'class' && value.length > 150) return false;
        }
        return seen.has('class') && !attributes.slice(end).trim();
    }
    function check(value, expected, key = '', depth = 0, path = '') {
        if (depth > 128) fail('INVALID', path);
        if(path==='global.mobileEarlyColony'){
            const fields=['enabled','reward','breeding','loss','hut','barn'];
            if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).length!==fields.length||fields.some(name=>typeof value[name]!=='boolean'))fail('INVALID',path);
        }
        if(['global.mobileEquipmentOptimization','global.mobilePerkOptimization'].includes(path))expected='boolean';
        if(path==='global.mobileCompletedPortals'&&(!Number.isSafeInteger(value)||value < -1))fail('INVALID',path);
        // Original starts with an empty string and writes a numeric timestamp after offline progress.
        if (depth === 2 && key === 'lastOfflineProgress' && typeof value === 'number') expected = 'number';
        if (depth === 2 && key === 'buyAmt' && value === 'Max') expected = 'string';
        if (depth === 2 && ['firstCustomExact', 'lastCustomExact'].includes(key) && typeof value === 'string') expected = 'string';
        // Original presets start with 'd'; saveAdvMaps stores an integer level offset.
        if (/^global\.mapPresets2?\.p[1-5]\.offset$/.test(path) && Number.isSafeInteger(value)) expected = 'number';
        if (typeof expected === 'string' && typeof value !== expected) fail('INVALID', path);
        if (typeof value === 'number' && !Number.isFinite(value)) fail('INVALID', path);
        if (typeof value === 'string') {
            if (/^global\.(gridArray|mapGridArray)\.\d+\.text$/.test(path) && value.startsWith('<')) {
                if (!safeGridIcon(value)) fail('INVALID', path);
                return;
            }
            if (/^(playerSpire\.main\.layout[1-3]Note|global\.autoBattleData\.presets\.names\.\d+|global\.(?:perkPresetU[12]\.)?perkPreset[1-3]\.Name|mapUnlocks\.[A-Za-z0-9_]+\.title)$/.test(path)) {
                if (/[<>\x00"']/.test(value) || value.replace(/&(?:amp|apos|quot|lt|gt);/g, '').includes('&')) fail('INVALID', path);
                return;
            }
            if (/[<>\x00]/.test(value)) fail('INVALID', path);
            // Free-text names are escaped at output sinks; structural strings are not code.
            const visibleName = /^global\.(?:mapsOwnedArray\.\d+|(?:Shield|Staff|Core)Equipped|heirlooms(?:Carried|Extra)\.\d+)\.name$/.test(path);
            if (!visibleName && /["'`=&]/.test(value)) fail('INVALID', path);
        }
        if (expected && typeof expected === 'object' && !Array.isArray(expected) && (value === null || typeof value !== 'object' || Array.isArray(value))) fail('INVALID', path);
        if (Array.isArray(expected) && !Array.isArray(value)) fail('INVALID', path);
        if (value && typeof value === 'object') {
            for (const [name, item] of Object.entries(value)) {
                if (['__proto__', 'prototype', 'constructor'].includes(name) || /[<>"'`=]/.test(name)) fail('INVALID', path);
                check(item, expected && typeof expected === 'object' ? expected[name] : undefined, Array.isArray(value) ? key : name, depth + 1, path ? path + '.' + name : name);
            }
        }
    }

    function validateSave(text) {
        if (typeof text !== 'string') fail('INVALID');
        if (new TextEncoder().encode(text).length > MAX_ENCODED) fail('TOO_LARGE');
        const compressed = text.replace(/\s/g, '');
        if (!compressed || !/^[A-Za-z0-9+/]+={0,3}$/.test(compressed)) fail('INVALID');
        let data;
        try { data = JSON.parse(lz.decompressFromBase64Limited(compressed, MAX_DECODED)); }
        catch (error) { fail(error instanceof RangeError ? 'TOO_LARGE' : 'INVALID'); }
        if (!data || !data.global || Array.isArray(data.global) || typeof data.global !== 'object') fail('INVALID');
        check(data, schema);
        const g = data.global;
        if (typeof g.version !== 'number' || g.version < 0.13 || g.isBeta) fail('UNSUPPORTED_VERSION');
        const version = g.stringVersion || null;
        if (version !== null) {
            if (!/^\d+\.\d+\.\d+$/.test(version)) fail('INVALID');
            const current = [5, 10, 1], incoming = version.split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                if (incoming[i] > current[i]) fail('UNSUPPORTED_VERSION');
                if (incoming[i] < current[i]) break;
            }
        }
        // Older formats may lack later systems; current exports must retain their persistent state.
        const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
        const sections = version === '5.10.1' ? Object.keys(schema) : ['global','resources','buildings','jobs','equipment','upgrades','portal'];
        for (const section of sections) if (!has(data, section) || !data[section] || typeof data[section] !== 'object') fail('INVALID');
        for (const resource of ['food','wood','metal','trimps','science','gems','fragments','helium']) {
            const item = data.resources[resource];
            if (!item || !has(item, 'owned') || !has(item, 'max')) fail('INVALID');
        }
        for (const field of ['world','lastOnline']) if (!has(g, field)) fail('INVALID');
        if (version === '5.10.1') {
            for (const section of ['global','resources','buildings','jobs','equipment','upgrades','portal']) {
                for (const [name, fields] of Object.entries(schema[section])) {
                    const item = data[section][name];
                    if (!has(data[section], name)) fail('INVALID');
                    if (section !== 'global') {
                        for (const field of Object.keys(fields)) if (!has(item, field)) fail('INVALID');
                    }
                }
            }
        }
        if (g.mapsOwnedArray !== undefined) {
            if (!Array.isArray(g.mapsOwnedArray)) fail('INVALID');
            const ids = new Set();
            for (const map of g.mapsOwnedArray) {
                if (!map || typeof map !== 'object' || !/^map\d+$/.test(map.id) || ids.has(map.id) || typeof map.name !== 'string') fail('INVALID');
                ids.add(map.id);
                // Normal maps use 50 ±25 cells (talents may reduce them); unique Bog/Big Wall maps reach 150.
                if (!Number.isInteger(map.size) || map.size < 1 || map.size > 150) fail('INVALID', 'global.mapsOwnedArray.size');
                for (const name of ['level', 'loot', 'size', 'difficulty', 'stacked']) {
                    const value = map[name];
                    // buyMap stores difficulty via toFixed(3); unique maps use numbers.
                    if (name === 'difficulty' && typeof value === 'string' && /^\d+(?:\.\d{1,6})?$/.test(value) && Number.isFinite(Number(value))) continue;
                    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))) fail('INVALID');
                }
            }
        }
        return { compressed, version, summary:{world:g.world, universe:g.universe} };
    }

    function validateInWorker(text) {
        return new Promise((resolve, reject) => {
            const worker = new Worker('save-worker.js');
            const finish = (error, result) => { clearTimeout(timer); worker.terminate(); error ? reject(error) : resolve(result); };
            // Includes cold Worker startup and importScripts on slower devices; validation stays off the UI thread.
            const timer = setTimeout(() => { const error = new Error('VALIDATION_TIMEOUT'); error.code = 'VALIDATION_TIMEOUT'; finish(error); }, 10000);
            worker.onmessage = event => {
                if (event.data.ok) finish(null, event.data.result);
                else { const error = new Error(event.data.code); error.code = event.data.code; error.path = event.data.path; finish(error); }
            };
            worker.onerror = () => { const error = new Error('WORKER_ERROR'); error.code = 'WORKER_ERROR'; finish(error); };
            worker.postMessage(text);
        });
    }
    return { validateSave, validateInWorker };
})();
if (typeof module !== 'undefined') module.exports = SaveValidation;
