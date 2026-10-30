// Compile the pinned, unchanged TypeScript with Node 24's built-in transformer.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
const root='app/src/main/assets/game/vendor/perky/',read=n=>fs.readFileSync(root+n,'utf8'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const common=read('trimps.ts'),source=read('perks.ts');
const notation=common.slice(common.indexOf('const notations ='),common.indexOf('function input('));
const core=stripTypeScriptTypes(source,{mode:'transform'}),helpers=stripTypeScriptTypes(notation,{mode:'transform'});
const before=`// Perky by Grimy, WTFPL. Generated from the pinned sources; see SOURCE.json.\nvar PerkyCore = (() => {\nconst {abs,ceil,floor,log,max,min,pow,round,sqrt}=Math;\nlet game=null,jobless=false,fields={},warnings=[];\nconst localStorage={notation:'1',zone:'1',preset:'1'},document={addEventListener(){}};\nconst $=s=>fields[s.slice(1)],$$=()=>[];\nfunction input(id){return parse_suffixes($('#'+id).value);}\nfunction mastery(name){return game.talents[name]?.purchased||false;}\nfunction show_alert(_,text){warnings.push(String(text));}\n`;
const output=before+helpers+'\n'+core+'\n'+fs.readFileSync('tools/perky-facade.inc.js','utf8').replace(/\r\n/g,'\n')+'\n})();\nif(typeof module!=="undefined")module.exports=PerkyCore;\n';
if(process.argv.includes('--check'))assert.equal(read('perky.js'),output,'Regenerate vendor/perky/perky.js');
else fs.writeFileSync(root+'perky.js',output);
const files=['perks.ts','trimps.ts','LICENSE.txt','perky.js'];
if(!process.argv.includes('--check'))fs.writeFileSync(root+'SOURCE.json',JSON.stringify({repository:'https://github.com/Grimy/Grimy.github.io',commit:'f678ddc718ba4cede2b7a86fbb8bcb96951a329f',license:'WTFPL',sources:{'perks.ts':'src/perks.ts','trimps.ts':'src/trimps.ts','LICENSE.txt':'LICENSE.txt'},build:'node tools/build-perky.cjs (Node 24 built-in TypeScript transform)',files:Object.fromEntries(files.map(n=>[n,sha(fs.readFileSync(root+n))]))},null,2)+'\n');
console.log('Pinned Perky bundle '+(process.argv.includes('--check')?'verified':'generated'));
