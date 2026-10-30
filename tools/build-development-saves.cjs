// Reproducible synthetic UI scenarios: original fixture, engine builders and original serialization.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve('app/src/main/assets/game'),out=path.join(root,'mobile-development');
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
 try{
  const p=await browser.newPage();await p.goto('http://127.0.0.1:'+server.address().port+'/index.html');await p.waitForFunction(()=>typeof MobileDesign!=='undefined');
  for(const id of ['portal','void','masteries','universe2']){
   await require('./map-workshop-proof.cjs').fixture(p);
   const text=await p.evaluate(id=>{
    const zone={portal:60,void:145,masteries:300,universe2:201}[id];
    game.global.world=zone;game.global.highestLevelCleared=id==='universe2'?700:zone;
    game.global.totalPortals=20;game.global.portalActive=true;game.global.totalHeliumEarned=1e8;game.global.heliumLeftover=1e7;
    game.resources.helium.owned=1e7;game.global.universe=id==='universe2'?2:1;
    if(id==='universe2'){game.global.totalRadPortals=5;game.global.highestRadonLevelCleared=250;game.global.totalRadonEarned=1e8;game.global.radonLeftover=1e7;game.resources.radon.owned=1e7;game.global.mutatedSeeds=1e6;game.global.tabForMastery=false;}
    else game.global.tabForMastery=true;
    for(const key of ['food','wood','metal','science','gems','fragments'])game.resources[key].owned=1e9;
    game.global.mapsActive=false;game.global.preMapsActive=false;game.global.fighting=false;game.global.pauseFight=true;game.global.switchToMaps=false;game.global.switchToWorld=false;
    game.global.currentMapId='';game.global.lookingAtMap='';game.global.mapGridArray=[];game.global.mapsOwnedArray=[];game.global.totalVoidMaps=0;game.global.mapsOwned=0;game.global.voidMapsToggled=false;
    game.global.lastClearedCell=-1;game.global.lastClearedMapCell=-1;game.global.gridArray=[];buildGrid();
    game.global.heirloomsExtra=[];game.global.heirloomsCarried=[];game.global.nullifium=1e6;
    if(id!=='portal'){
     for(let n=0;n<4;n++)createHeirloom(zone,false,false,true);
     createVoidMap(undefined,undefined,true,true);
    }
    if(id==='masteries'||id==='universe2'){
     game.global.spiresCompleted=1;game.global.essence=1e8;playerSpire.init();playerSpire.runestones=1e5;playerSpire.spirestones=1000;
     createHeirloom(200,false,true);
    }
    game.global.tutorialActive=false;game.global.lastOnline=Date.now();game.global.start=Date.now();game.global.time=0;
    game.options.menu.pauseGame.enabled=0;game.options.menu.offlineProgress.enabled=1;
    cancelTooltip();closeHeirPopup();
    return saveOriginal(true);
   },id);
   assert(await p.evaluate(async text=>!!(await SaveValidation.validateInWorker(text)).compressed,text));
   const restored=await p.evaluate(text=>{const ok=loadOriginal(text);TrimpsMobile.freeze();cancelTooltip();return ok;},text);assert.equal(restored,true,id+' original reload');
   fs.writeFileSync(path.join(out,id+'.txt'),text+'\n');console.log(id+': '+text.length+' bytes, strict validation and original reload passed');
  }
 }finally{await browser.close();server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
