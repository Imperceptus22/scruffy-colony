const fs=require('node:fs'),assert=require('node:assert/strict');
const entries=[];
// A release N.00 shows as N.0; all other numbers keep two decimals.
for(const line of fs.readFileSync('CHANGELOG.md','utf8').split(/\r?\n/)){
 const heading=line.match(/^## (\d+\.\d{2})\s*[–—-]\s*(.+)$/);
 if(heading)entries.push({version:heading[1],label:heading[1].replace(/^(\d+)\.00$/,'$1.0'),title:heading[2],notes:[]});
 else if(line.trim()&&!line.startsWith('#')&&entries.length)entries.at(-1).notes.push(line.replace(/^- /,''));
}
assert(entries.length&&entries.every(e=>e.notes.length),'Every release needs notes');
const file='app/src/main/assets/game/mobile-changelog.js',output='// Generated from CHANGELOG.md. Run node tools/build-mobile-changelog.cjs.\nvar MobileChangelog = Object.freeze('+JSON.stringify(entries,null,2)+');\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),output,'App changelog is stale; run node tools/build-mobile-changelog.cjs');else fs.writeFileSync(file,output);
console.log('App changelog: '+entries.length+' versions');
