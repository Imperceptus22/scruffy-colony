import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const game = path.resolve('app/src/main/assets/game');
const manifest = JSON.parse(fs.readFileSync('docs/upstream-manifest.json', 'utf8'));
assert.equal(manifest.commit, 'b9edb1dfee270ebf81bef8d934dc71276bf8d963');
const modified = new Set(['index.html', 'main.js', 'updates.js', 'updates.html', 'lz-string.js']);
const excluded = new Set(['css/bg2.png', 'css/bg2_vert.png', 'favicon.ico', 'imgs/steam_logo.png', 'imgs/reddit_logo.png', 'imgs/discord_logo.png', 'imgs/kred_single.png', 'fonts/icomoon/style.css', ...['eot','ttf','woff','svg'].map(ext => `fonts/icomoon/fonts/icomoon.${ext}`)]);
assert.deepEqual(new Set(manifest.excludedFromApp), excluded);
for (const file of manifest.files) {
    if (excluded.has(file.path)) {
        assert(!fs.existsSync(path.join(game, file.path)), `Excluded legacy graphics must stay excluded: ${file.path}`);
        continue;
    }
    assert(fs.existsSync(path.join(game, file.path)), `Missing original asset: ${file.path}`);
    if (!modified.has(file.path)) assert.equal(createHash('sha256').update(fs.readFileSync(path.join(game,file.path))).digest('hex'),file.sha256,`Original asset changed: ${file.path}`);
}
const html = fs.readFileSync(path.join(game, 'index.html'), 'utf8');
assert(!html.includes('src="Playfab/'), 'PlayFab script must not be loaded');
const references = [];
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) references.push([game, match[1]]);
for (const dir of ['css']) {
    for (const file of fs.readdirSync(path.join(game, dir)).filter(x => x.endsWith('.css'))) {
        const folder = path.join(game, dir);
        for (const match of fs.readFileSync(path.join(folder, file), 'utf8').matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) references.push([folder, match[1]]);
    }
}
for (const [base, ref] of references) {
    if (/^(data:|https?:|#)/.test(ref)) continue;
    const resolved = path.resolve(base, decodeURIComponent(ref.split(/[?#]/)[0]));
    assert(resolved.startsWith(game + path.sep), `Outside assets: ${ref}`);
    assert(fs.existsSync(resolved), `Missing reference: ${ref}`);
}
console.log(`Assets checked: ${manifest.files.length - excluded.size} original files, ${excluded.size} excluded, ${references.length} references.`);
