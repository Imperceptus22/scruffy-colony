import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['tools/build-mobile-changelog.cjs','--check'],{stdio:'inherit'});
const source = fs.readFileSync('app/build.gradle.kts','utf8');
const version = source.match(/versionName\s*=\s*"(\d+)\.(\d{2})"/);
assert(version, 'versionName must have two decimal places');
const hundredths = Number(version[1])*100+Number(version[2]);
const code = Number(source.match(/versionCode\s*=\s*(\d+)/)?.[1]);
assert.equal(fs.readFileSync('CHANGELOG.md','utf8').match(/^## (\d+\.\d{2})/m)?.[1],version[1]+'.'+version[2],'Latest changelog entry must match the app version');
assert(hundredths>=10 && Number.isInteger(code) && code>=1);
// V-205: the last test version was 4.98 / build 55; the build number keeps rising across the switch to 1.00.
assert(code>55, 'versionCode must stay above the last test build 55');
assert(!fs.readFileSync('app/src/main/assets/game/mobile-save.js','utf8').includes('Trimps Mobile 0.10'), 'UI version must come from Android BuildConfig');
console.log(`Version ${version[1]}.${version[2]} (${hundredths} hundredths), build ${code}.`);
