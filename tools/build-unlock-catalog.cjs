// Read definitions in a disposable VM. Never execute unlock/reward handlers.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root='app/src/main/assets/game/',read=f=>fs.readFileSync(root+f,'utf8');
function plain(v){return String(v||'').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|apos|quot|amp);/g,m=>({'&nbsp;':' ','&apos;':"'",'&quot;':'"','&amp;':'&'}[m])).replace(/\{s\}|\[s\]/g,'s').replace(/\s+/g,' ').trim();}
function own(o,k){const d=Object.getOwnPropertyDescriptor(o,k);return d?.value;}
function prose(o,...fields){
 for(const k of fields){const d=Object.getOwnPropertyDescriptor(o,k);if(!d)continue;const v=d.value;
  if(typeof v==='string')return plain(v).replace(/\$[^$]+\$/g,'the listed amount');
  try{const value=(d.get||v).call(o);if(typeof value==='string'&&plain(value).length>20)return plain(value).replace(/\$[^$]+\$/g,'the listed amount');}catch{}
  const source=String(d.get||v||'');const parts=[...source.matchAll(/(?:return\s+|(?:var|let|const)\s+(?:text|description)\s*=\s*)(["'])(.*?)(?<!\\)\1/g)].map(m=>plain(m[2]));
  const text=parts.find(s=>s.length>25)||[...source.matchAll(/(["'])(.*?)(?<!\\)\1/g)].map(m=>plain(m[2])).find(s=>s.length>25&&/\w+ \w+/.test(s));if(text)return text;
 }return '';
}
function build(){
 const c=vm.createContext({Date,Math,prettify:x=>String(x),window:{addEventListener(){}},document:{getElementById:()=>({style:{}})}});
 for(const f of ['config.js','objects.js'])vm.runInContext(read(f),c,{filename:f});
 const main=read('main.js'),fluffyStart=main.indexOf('var Fluffy = {'),fluffyEnd=main.slice(fluffyStart).match(/^\};?\r?$/m);
 assert(fluffyStart>=0&&fluffyEnd);vm.runInContext(main.slice(fluffyStart,fluffyStart+fluffyEnd.index+fluffyEnd[0].length),c);
 const g=c.game,entries=[],routes=new Map(),covered={},notes=[];
 c.getPerkLevel=k=>g.portal[k]?.level||0;c.getHighestLevelCleared=()=>g.global.highestLevelCleared;c.getSLevel=()=>g.global.sLevel;c.portalUniverse=1;c.heliumOrRadon=()=> 'Helium';
 const add=e=>{assert(e.id&&!entries.some(x=>x.id===e.id),e.id);assert(e.name&&e.description&&e.requirement,JSON.stringify(e));entries.push(e);};
 const route=(group,key,r)=>{const id=group+':'+key;if(!routes.has(id))routes.set(id,[]);if(!routes.get(id).some(x=>x.text===r.text))routes.get(id).push(r);};
 const uni=o=>o.blockU1?2:o.blockU2?1:0;
 const words={Hell:'Dimension of Anger / Dimension of Rage',Prismatic:'Prismatic Palace',Block:'The Block',Wall:'The Wall',Melting:'Melting Point',Doom:'Trimple of Doom',Atlantis:'Atlantrimp',Prison:'The Prison',Bionic:'Bionic Wonderland',Void:'Void Map'};
 function costText(trigger,key){
  const x=trigger.cost||{},parts=[];for(const [type,values]of Object.entries(x))if(type!=='special')for(const[k,v]of Object.entries(values))parts.push(v+' '+(type==='resources'?k:k+' hired'));
  if(key==='Battle')parts.push('discover Research, collect Science and catch at least one Trimp');
  if(key==='breeding')parts.push('at least 2 unemployed Trimps');
  return parts.join(' and ');
 }
 function sourceRoute(group,key,o){
  if(group==='triggers')return{group,key,text:'Hold '+costText(o,key)+'.',universe:0};
  const u=uni(o)||(o.brokenPlanet===1?1:0),scope=u?'Universe '+u:'Universes 1 and 2',world=o.startAt>0?o.startAt:o.world>0?o.world:o.world===-3?1:Math.abs(o.world||1);
  let text;
  if(group==='worldUnlocks')text='World, Zone '+world+(o.level!==undefined?' · '+(Array.isArray(o.level)?'a generated cell from '+(o.level[0]+1)+' to '+o.level[1]:'cell '+(Number(o.level)+1)):'')+' ('+scope+').';
  else{
   const locations=Object.entries(g.mapConfig.locations).filter(([,v])=>[].concat(v.upgrade||[]).includes(key)).map(([k])=>words[k]||k);
   const level=key==='Speedexplorer'?o.next+10:o.prestige?o.last+5:world;
   text=(locations.length?'Complete '+locations.join(' or ')+' at level '+level+' or higher':'Find the '+(o.prestige?'prestige book':'blueprint/book')+' in a map of level '+level+' or higher')+' ('+scope+').';
   if(o.startAt>0)text+=' First available at map level '+o.startAt+'.';
   if(o.level!=='last'&&o.level!==undefined)text+=' The drop is in a generated cell; creating a map does not collect it.';
  }
  if(o.world< -1)text+=' Repeats '+(o.world===-3?'on odd zones':o.world===-33?'every 3 zones':'every '+Math.abs(o.world)+' zones')+'.';
  if(o.lastAt)text+=' This route ends at Zone '+o.lastAt+'.';
  if(o.brokenPlanet===1)text+=' Break the planet first.';
  if(o.brokenPlanet===-1)text+=' Before breaking the planet.';
  if(group==='mapUnlocks'&&['Harmbalest','GambesOP'].includes(key))text+=' Requires '+(key==='Harmbalest'?'Arbalest':'Gambeson')+' unlocked: complete Slow, then research Battle in this run.';
  if(group==='mapUnlocks'&&key==='Speedexplorer')text+=' Further books appear every 10 map levels above the last credited threshold.';
  const exceptions={Smithy:'Not available during Smithless.',Meteorologists:'In Challenge³, Storm must already have been completed.',Potency:'Trapper and Trappapalooza hold this unlock.',Miner:'Metal and Transmute hold this book until their challenge rules allow it.',Scientist:'The Scientist challenge holds this book.',Speedscience:'The Scientist challenge holds this book.',Magmamancer:'Metal and Transmute hold this book.',Speedminer:'Metal and Transmute hold this book.',Megaminer:'The Metal challenge holds this book.',Coordination:'The Trimp challenge blocks this book.'};
  if(group==='worldUnlocks'&&exceptions[key])text+=' '+exceptions[key];
  return {group,key,text,universe:u,zone:world};
 }
 const calls=(fn,visit)=>{const s=String(fn||'').replace(/\/\/[^\n]*/g,'');for(const m of s.matchAll(/unlock(Building|Job|Equipment|Upgrade|Perk)\(\s*['"]([^'"]+)['"]/g))visit({Building:'buildings',Job:'jobs',Equipment:'equipment',Upgrade:'upgrades',Perk:'portal'}[m[1]],m[2]);};
 for(const group of ['triggers','worldUnlocks','mapUnlocks'])for(const[key,o]of Object.entries(g[group])){
  const r=sourceRoute(group,key,o);calls(o.fire,(kind,target)=>route(kind,target,r));
  if(!o.fire&&g.equipment[key])route('equipment',key,r);
 }
 // Research chains are described without executing their handlers.
 const researchParents=new Map();for(const[key,o]of Object.entries(g.upgrades))calls(o.fire,(kind,target)=>{if(key!==target){const id=kind+':'+target;if(!researchParents.has(id))researchParents.set(id,[]);researchParents.get(id).push(key);}});
 for(const[key,ch]of Object.entries(g.challenges))for(const method of ['onComplete','start'])calls(ch[method],(kind,target)=>route(kind,target,{group:'challenges',key,text:(method==='start'?'Start':'Complete')+' the '+key+' challenge ('+(ch.blockU1?'Universe 2':ch.allowU2?'the applicable universe':'Universe 1')+'). '+(prose(ch,'unlockString')?'Challenge available when you '+prose(ch,'unlockString')+'.':''),universe:ch.blockU1?2:ch.allowU2?0:1}));
 const overrides={
  'buildings:Microchip':'Enter Universe 2. Buy up to 5 Microchips with Science; the five upgrades persist through Portals.',
  'buildings:Hub':'Universe 2: complete Exterminate to unlock the Hub immediately. In later runs, it returns on reaching Zone 60. Hub level follows your ordinary housing; it cannot be purchased directly.',
  'jobs:Dragimp':'Find the Dragimp egg in the world, then research Egg with 10,000 Gems.',
  'jobs:Amalgamator':'Universe 1: maximum population / army size must reach the current Amalgamator threshold (initially 10 billion). Not during a Spire or Trapper. Clearing Spires II–V in the current run reduces that threshold by a factor of 10 each.',
  'equipment:Arbalest':'Universe 1: complete the Slow challenge. Battle research then unlocks Arbalest in subsequent runs.',
  'equipment:Gambeson':'Universe 1: complete the Slow challenge. Battle research then unlocks Gambeson in subsequent runs.',
  'portal:Looting_II':'Universe 1: clear all 100 cells of Spire I at Zone 200.',
  'portal:Carpentry_II':'Universe 1: complete row 8 of Spire I at Zone 200.',
  'portal:Motivation_II':'Universe 1: complete row 5 of Spire I at Zone 200.',
  'portal:Power_II':'Universe 1: complete row 3 of Spire I at Zone 200.',
  'portal:Toughness_II':'Universe 1: complete row 1 of Spire I at Zone 200.',
  'portal:Capable':'Universe 1: clear Spire II at Zone 300. Purchase Capable levels to let Fluffy gain experience.',
  'portal:Cunning':'Universe 1: clear Spire III at Zone 400.',
  'portal:Curious':'Universe 1: clear Spire IV at Zone 500.',
  'portal:Classy':'Universe 1: clear Spire V at Zone 600.',
  'portal:Relentlessness':'Universe 1: complete Trimple of Doom, a level 33 unique map found in Zone 33.',
  'portal:Masterfulness':'Universe 2: complete the Hypothermia challenge, including Frozen Castle before finishing Zone 200.',
  'portal:Championism':'Universe 2: purchase Championism in Spire Assault after collecting 15 items.',
  'portal:Expansion':'Universe 2: purchase More Expansion in Spire Assault after collecting 53 items, using Shards.',
  'portal:Observation':'Universe 2: complete Nurture with Cruffys at level 10 or higher. Nurture becomes available at Zone 130 and completes after clearing Zone 135.',
  'upgrades:Formations':'Universe 1: break the planet by clearing Zone 59, then research Formations.',
  ...Object.fromEntries(['attackRelic','enemyAttackRelic','radonRelic','scienceRelic','breedRelic'].map(k=>['upgrades:'+k,'Universe 2: start the Archaeology challenge (available on reaching Zone 90). Collect the corresponding relic with its research cost during that challenge.']))
 };
 function requirements(group,key,stack=[]){
  const id=group+':'+key;if(overrides[id])return overrides[id];if(stack.includes(id))return '';
  const direct=(routes.get(id)||[]).map(r=>r.text);
  for(const parent of researchParents.get(id)||[])direct.push('Research '+parent+'. '+requirements('upgrades',parent,[...stack,id]));
  const targetUniverse=uni(g[group]?.[key]||{});
  return [...new Set(direct)].join(' OR ').replace(/Universes 1 and 2/g,targetUniverse?'Universe '+targetUniverse:'Universes 1 and 2');
 }
 const categories={buildings:'Buildings & housing',equipment:'Equipment & items',jobs:'Jobs',upgrades:'Research & upgrades',portal:'Perks'};
 const buildingDescriptions={Trap:'Capture Trimps for your population.',Microchip:'Permanent Scientist levels for Universe 2.',Hub:'Additional housing from the total levels of ordinary housing.',Antenna:'Improves Meteorologist bonuses and unlocks further weather benefits.',Laboratory:'More Cruffys experience during Nurture, at the cost of stronger enemies.',Dragimp:'An egg-hatched worker that gathers Gems.'};
 const exclusions={'upgrades:SuperShriek':'Unused: its world unlock is commented out in original 5.10.1; it cannot be obtained.'};
 const missing=[];
 for(const group of Object.keys(categories)){
  covered[group]=Object.keys(g[group]);
  for(const[key,o]of Object.entries(g[group])){
   if(exclusions[group+':'+key])continue;
   let req=requirements(group,key);
   if(!req&&group==='portal'&&(o.locked===false||o.radLocked===false))req='Available through the Portal in '+(o.locked===false&&o.radLocked===false?'both universes':o.radLocked===false?'Universe 2':'Universe 1')+'. Unlock that universe and use its Portal currency.';
   if(!req)missing.push(group+':'+key);
   const desc=buildingDescriptions[key]||(o.isRelic?'Archaeology relic affecting '+o.relic+'. Collect and configure it during that challenge.':prose(o,'tooltip','description'))||(group==='equipment'?(o.attack?'Increases the attack of each soldier.':'Increases soldier health or block.'):'');
   if(!desc)notes.push('description:'+group+':'+key);
   add({id:group+':'+key,name:o.name||key.replace(/_/g,' '),category:categories[group],description:desc||key+' original upgrade.',requirement:req||'UNRESOLVED',kind:group,key,universe:uni(o),sources:[group+'.'+key,...(routes.get(group+':'+key)||[]).map(r=>r.group+'.'+r.key)]});
  }
 }
 for(const[key,o]of Object.entries(g.challenges)){
  let req=prose(o,'unlockString');if(key==='Daily')req='Universe 1: reach Zone 100. Universe 2: reach Zone 30.';
  if(key==='Scientist')req='Universe 1: reach Zone 40 / 50 / 90 / 110 / 130 for Scientist I / II / III / IV / V respectively.';
  if(!req){const match=String(o.filter).match(/getHighestLevelCleared\(true\)\s*>=\s*(\d+)/);req=match?'Reach Zone '+(Number(match[1])+1)+'.':'Available only through the combined Challenge² system after its constituent challenges are unlocked.';}
  add({id:'challenges:'+key,name:key,category:'Challenges',description:prose(o,'description','squaredDescription')||'Daily modifiers change the run and its reward.',requirement:(o.blockU1?'Universe 2: ':!o.allowU2?'Universe 1: ':'')+req,kind:'challenges',key,universe:o.blockU1?2:!o.allowU2?1:0,sources:['challenges.'+key]});
 }covered.challenges=Object.keys(g.challenges);
 for(const[key,o]of Object.entries(g.talents))add({id:'talents:'+key,name:o.name,category:'Masteries',description:prose(o,'description'),requirement:'Universe 1: unlock Masteries at Zone 181 and collect Dark Essence from corrupted enemies. Tier '+o.tier+'. After purchase, the previous tier must still have at least one more mastery than this tier, unless the previous tier is complete.'+(o.requires?' Also requires '+[].concat(o.requires).map(k=>g.talents[k].name).join(' and ')+'.':''),kind:'talents',key,universe:1,sources:['talents.'+key]});
 covered.talents=Object.keys(g.talents);
 // The complete exotic-import and permanent-bone inventories.
 for(const key of Object.keys(g.unlocks.imps))add({id:'imports:'+key,name:key,category:'Equipment & items',description:plain(g.badGuys[key].dropDesc),requirement:'Buy once for 50 Bones from the Bone Trader. Starts appearing in newly generated '+(g.badGuys[key].location==='World'?'World zones':'Maps')+'; the effect is awarded when defeated.',kind:'imports',key,universe:0,sources:['unlocks.imps.'+key,'badGuys.'+key]});covered.imports=Object.keys(g.unlocks.imps);
 for(const[key,o]of Object.entries(g.permaBoneBonuses))add({id:'permaBoneBonuses:'+key,name:o.name,category:'Automation',description:prose(o,'text'),requirement:'Unlock all 10 Exotic Imports first, then purchase this permanent bonus with Bones in the Bone Trader. Cost increases by level.',kind:'permaBoneBonuses',key,universe:0,sources:['permaBoneBonuses.'+key,'main.countUnpurchasedImports']});covered.permaBoneBonuses=Object.keys(g.permaBoneBonuses);
 for(const[key,o]of Object.entries(g.bwRewards))add({id:'bwRewards:'+key,name:key==='Foremany'?'Robotic Foremen':key,category:'Automation',description:prose(o,'description'),requirement:'Universe 1: clear Bionic Wonderland level '+o.requires+'. The reward persists through Portals and applies in both universes.',kind:'bwRewards',key,universe:0,sources:['bwRewards.'+key]});covered.bwRewards=Object.keys(g.bwRewards);
 for(const group of ['generatorUpgrades','permanentGeneratorUpgrades']){
  for(const[key,o]of Object.entries(g[group]))add({id:group+':'+key,name:key,category:'Generator',description:prose(o,'description'),requirement:'Universe 1: reach Zone 230 to unlock the Dimensional Generator. Purchase with Magmite'+(o.cost&&typeof o.cost==='number'?' ('+o.cost+' Mi)':'')+'.'+(key==='Overclocker'?' Requires Hybridization and Storage first.':''),kind:group,key,universe:1,sources:[group+'.'+key]});covered[group]=Object.keys(g[group]);
 }
 for(const[key,o]of Object.entries(c.u2Mutations.tree))add({id:'mutators:'+key,name:o.dn||key,category:'Mutators',description:prose(o,'description'),requirement:'Universe 2: reach Zone 201 and earn Mutated Seeds. '+(o.require?'Requires '+o.require.map(k=>c.u2Mutations.tree[k].dn||k).join(o.singleRequire?' or ':' and ')+'. ':'')+(o.ring?'Requires '+c.u2Mutations.rings[o.ring]+' purchased Mutators to reach this ring. ':'')+'Pay the current Mutator seed cost.',kind:'mutators',key,universe:2,sources:['objects.u2Mutations.tree.'+key]});covered.mutators=Object.keys(c.u2Mutations.tree);
 for(const group of ['items','oneTimers','bonuses','ringStats']){
  for(const[key,o]of Object.entries(c.autoBattle[group])){
   const initial=group==='items'&&o.owned;
   const req=group==='items'?(initial?'Available when Spire Assault unlocks.':'Obtain a contract after clearing Spire Assault level '+o.zone+', then complete the contract kills for that item.'):
    group==='oneTimers'?'Collect '+o.requiredItems+' Spire Assault items, then purchase with '+(o.useShards?'Shards':'Dust')+'.':
    group==='ringStats'?'Purchase The Ring in Spire Assault, then allocate its available mod levels.':'Purchase with '+(o.useShards?'Shards':'Dust')+' in Spire Assault.';
   add({id:'assault-'+group+':'+key,name:key.replace(/_/g,' '),category:'Spire Assault',description:prose(o,'description','upgrade')||({Menacing_Mask:'Changes Huffy and enemy attack speed.',Sword:'Adds attack damage.',Armor:'Adds Huffy health.'}[key])||'Ring modifier: '+(o.name||key)+'.',requirement:'Universe 2: reach Zone 75 to unlock Spire Assault. '+req,kind:'assault-'+group,key,universe:2,sources:['objects.autoBattle.'+group+'.'+key]});
  }covered['assault-'+group]=Object.keys(c.autoBattle[group]);
 }
 // Every Fluffy/Scruffy level and evolution reward; repeated rewards are separate milestones.
 for(const[field,universe,evolution]of [['rewards',1,false],['prestigeRewards',1,true],['rewardsU2',2,false]]){
  const rewards=c.Fluffy[field];for(let i=0;i<rewards.length;i++){
   const key=rewards[i],o=c.Fluffy.rewardConfig[key];
   add({id:field+':'+i,name:(universe===1?'Fluffy':'Scruffy')+' '+(evolution?'evolution ability ':'ability ')+(i+1)+' · '+key.replace(/([A-Z])/g,' $1'),category:'Companions',description:prose(o,'description'),requirement:universe===1?'Universe 1: Fluffy level + evolution count + Fluffinity mastery credit must reach '+(evolution?11+i:1+i)+'. Normally unlock Capable by clearing Spire II at Zone 300 and purchase levels to earn experience. Each evolution resets experience; abilities can temporarily become inactive. Fluffinity adds one effective evolution for abilities.': 'Universe 2: Scruffy level plus Fluffinity mastery credit must reach '+(i+1)+'. Scruffy levels are independent of Fluffy evolutions.',kind:field,key:String(i),reward:key,universe,sources:['main.Fluffy.'+field+'['+i+']','main.Fluffy.rewardConfig.'+key,'main.Fluffy.isRewardActive']});
  }covered[field]=rewards.map((_,i)=>String(i));
 }
 // Unique maps are discovered through their original blueprint/research routes.
 const mapNames=new Set();
 for(const group of ['worldUnlocks','mapUnlocks','upgrades'])for(const[key,o]of Object.entries(g[group]))for(const m of String(o.fire||'').matchAll(/createMap\(\s*([^,]+),\s*['"]([^'"]+)['"]/g)){
  const name=m[2];if(mapNames.has(name))continue;mapNames.add(name);
  add({id:'uniqueMaps:'+name,name,category:'Maps & discoveries',description:'Unique map with its original encounters and completion reward.',requirement:group==='upgrades'?'Research '+key+'. '+requirements(group,key):sourceRoute(group,key,o).text,kind:'uniqueMaps',key:name,universe:uni(o),sources:[group+'.'+key+'.fire']});
 }covered.uniqueMaps=[...mapNames];
 const systems=[
  ['maps','Maps','Create and explore Maps independently of world progress.','Find the first map in World Zone 6 (a generated cell between 2 and 5).'],
  ['portal','Time Portal','Start a new run and spend Helium or Radon on permanent Perks.','Universe 1: finish Zone 20, research Anger and complete Dimension of Anger. Later returns can use Portal Generator.'],
  ['heirlooms','Heirlooms','Equip Shields and Staffs; recycle extras for Nullifium.','Find and complete a Void Map at level 20 or higher for the first guaranteed Heirloom and AutoStorage. Later Void Maps at level 6+ can drop Heirlooms.'],
  ['autoUpgrades','AutoUpgrade','Buy available research automatically.','Universe 1: break the planet after clearing Zone 59.'],
  ['autoStorage','AutoStorage','Queue storage buildings before resources overflow.','Universe 1: complete a Void Map at level 20 or higher.'],
  ['improvedAutoStorage','Improved AutoStorage','Build automatically queued storage instantly.','Universe 1: complete a Void Map at level 100 or higher.'],
  ['mapAtZone','Map At Zone','Schedule Maps at selected zones with the original presets.','Universe 1: complete a Void Map at level 150 or higher, or purchase the Map at Zonier mastery.'],
  ['autoEquip','AutoEquip','Configure automatic equipment purchases.','Universe 1: complete a Void Map at level 350 or higher.'],
  ['boneTrader','Bone Trader','Spend earned Bones on permanent Imports and bonuses.','Defeat a Skeletimp or Megaskeletimp and earn your first Bones.'],
  ['breeding','Breeding','Unemployed Trimps refill your population.','Have at least two unemployed Trimps; Trapper variants disable normal breeding.'],
  ['challenge2','Challenge²','Replay challenges for a permanent squared reward.','Universe 1: reach Zone 65.'],
  ['challenge3','Challenge³','Universe 2 challenge runs with a permanent cubed reward.','Universe 2: reach Zone 50.'],
  ['masteries','Masteries','Spend Dark Essence on a permanent talent tree.','Universe 1: reach Zone 181.'],
  ['scrying','Scrying formation','Change your army formation to collect Dark Essence.','Universe 1: reach Zone 181; research Formations.'],
  ['spire','Spire I and Player Spire','Defeat Druopitee; build a defensive Spire with traps.','Universe 1: reach Zone 200. Clear all 100 cells of Spire I to unlock the Player Spire.'],
  ['generator','Dimensional Generator','Use Magma fuel to produce population and gather Magmite for upgrades.','Universe 1: reach Zone 230.'],
  ['nature','Nature empowerments','Collect and spend Poison, Wind and Ice tokens.','Universe 1: reach Zone 236; empowerments rotate every five zones.'],
  ['universe2','Universe 2','A new universe with Radon, Scruffy and different progression.','Fluffy must reach level 10 at evolution 8 (or a later evolution); select Universe 2 in the Portal.'],
  ['assault','Spire Assault','Equip Huffy and defeat enemies to earn permanent bonuses.','Universe 2: reach Zone 75.'],
  ['mutators','Mutators','Spend Mutated Seeds on the Universe 2 mutation tree.','Universe 2: reach Zone 201.'],
  ['u2spire','Universe 2 Spire','A later Spire with its own permanent reward progression.','Universe 2: reach Zone 300.']
 ];
 for(const[key,name,description,requirement]of systems)add({id:'systems:'+key,name,category:['autoUpgrades','autoStorage','improvedAutoStorage','mapAtZone','autoEquip'].includes(key)?'Automation':'Game systems & progression',description,requirement,kind:'systems',key,universe:0,sources:['main.js','updates.js','config.js']});covered.systems=systems.map(s=>s[0]);
 // Defensive Spire traps and their separately unlocked upgrade effects.
 const spireSource=read('playerSpire.js'),start=spireSource.indexOf('var playerSpireTraps = {'),end=spireSource.slice(start).match(/^\};?\r?$/m);
 vm.runInContext(spireSource.slice(start,start+end.index+end[0].length),c);
 const trapInfo={Fire:['Damages enemies on the path.','Available after completing Spire I.'],Frost:['Slows enemies on the path.','Available after completing Spire I.'],Strength:['Boosts Fire damage on its row.','Complete the Player Spire tutorial step that places at least five Fire/Frost traps.'],Poison:['Adds stacking Toxicity to enemies.','Advance the Player Spire tutorial and complete Spire II.'],Condenser:['Multiplies existing Toxicity.','Advance the Player Spire tutorial and complete Spire II.'],Lightning:['Shocks enemies and boosts nearby trap effects.','Advance the Player Spire tutorial and complete Spire III.'],Knowledge:['Freezes chilled enemies.','Advance the Player Spire tutorial and complete Spire III.']};
 for(const[key,o]of Object.entries(c.playerSpireTraps)){
  add({id:'spireTraps:'+key,name:key+' Trap',category:'Player Spire',description:trapInfo[key][0],requirement:'Universe 1: clear Spire I at Zone 200. '+trapInfo[key][1]+' Pay '+o.baseCost+' Runestones for the first trap.',kind:'spireTraps',key,universe:1,sources:['playerSpire.playerSpireTraps.'+key,'playerSpire.updateTutorial']});
  for(let i=0;i<o.upgrades.length;i++){const upgrade=o.upgrades[i];add({id:'spireTrapUpgrades:'+key+':'+(i+2),name:key+' Trap level '+(i+2),category:'Player Spire',description:plain(upgrade.description),requirement:'Unlock the '+key+' Trap and its previous level. '+(upgrade.unlockAt>=0?'Reach Zone '+upgrade.unlockAt+' in Universe 1 and pay ':'Pay ')+upgrade.cost+' Runestones.',kind:'spireTrapUpgrades',key,level:i+2,universe:1,sources:['playerSpire.playerSpireTraps.'+key+'.upgrades['+i+']']});}
 }covered.spireTraps=Object.keys(c.playerSpireTraps);covered.spireTrapUpgrades=Object.entries(c.playerSpireTraps).flatMap(([k,o])=>o.upgrades.map((_,i)=>k+':'+(i+2)));
 for(const[key,o]of Object.entries(g.goldenUpgrades))add({id:'goldenUpgrades:'+key,name:'Golden '+(key==='Helium'?'Helium / Radon':key),category:'Research & upgrades',description:prose(o,'description','tooltip')||({Helium:'Increases Helium or Radon rewards.',Battle:'Increases army attack and health.',Void:'Improves Void Map drop frequency.'}[key]),requirement:'Reach 15% Achievement damage bonus. First Golden upgrades: Zone 50 at 15% Achievement bonus, 45 at 100%, 40 at 300%, 35 at 600%, 30 at 1000%, and 25 at 2000%. At 2500% and above, extra starting upgrades are awarded. Spend an available Golden upgrade; resource rewards are unavailable in Challenge²/³.',kind:'goldenUpgrades',key,universe:0,sources:['goldenUpgrades.'+key,'main.getAvailableGoldenUpgrades','updates.getAchievementStrengthLevel']});covered.goldenUpgrades=Object.keys(g.goldenUpgrades);
 const extraSystems=[
  ['roboTrimp','RoboTrimp & MagnetoShriek','Each rescued RoboTrimp adds 20% army damage and improves MagnetoShriek against Improbabilities.','Universe 1: complete Bionic Wonderland I at level 125. Rescue further RoboTrimps in sequence at levels 140, 155 and subsequent 15-level steps.'],
  ['noCoords','AutoUpgrade without Coordinations','Adds an AutoUpgrade mode that skips Coordination research.','Universe 1: complete a Void Map at level 250 or higher; the highest Void Map record permanently unlocks this mode in both universes.'],
  ['autoPrestige','AutoPrestige','Automatically purchase equipment prestige research using the original toggle.','Complete Scientist IV (available on reaching Zone 110 in Universe 1).'],
  ['foremen','Foremen','Foremen construct queued buildings automatically; each world reward increases their construction contribution.','Find the first Foreman in World Zone 1, cell 90; further Foremen appear in subsequent zones.'],
  ['autoGolden','AutoGolden','Select automatically purchased Golden upgrade types.','Purchase 77 Golden upgrades in total across runs.'],
  ['autoTraps','AutoTraps','Automatically queue Traps while enabled.','Research Trapstorm, discovered in maps starting at level 10.'],
  ['formations','Formations','Switch between army formations with different stat tradeoffs.','Universe 1: break the planet after Zone 59 and research Formations. Dominance and Barrier require their later research books.'],
  ['voidMaps','Void Maps','Rare maps with stronger enemies, Heirlooms and permanent unlocks.','Find a randomly dropped Void Map from enemies. Drops have original timing and progress rules, rather than one guaranteed unlock zone.'],
  ['fluffy','Fluffy','A companion with levels, evolutions and permanent reward milestones.','Universe 1: complete Spire II at Zone 300 to unlock Capable, then purchase at least one Capable level.'],
  ['scruffy','Scruffy','The Universe 2 companion has its own experience curve and reward levels.','Enter Universe 2 through the Portal.'],
  ['frozenCastle','Frozen Castle','A unique map used to finish Hypothermia.','Universe 2: reach Zone 175. It scales up through Zone 200 and must be cleared before completing Hypothermia.'],
  ['blackBog','The Black Bog','Spend Motivation stacks in Quagmire through a unique repeatable map.','Universe 2: start Quagmire; the map is created at challenge start.'],
  ['farmlands','Farmlands','A later map biome with a resource type that rotates by zone.','Universe 2: complete the Alchemy challenge.'],
  ['alchemy','Alchemy','Collect herbs and brew potions during Alchemy runs.','Universe 2: reach Zone 155 and start the Alchemy challenge.'],
  ['obsidian','Obsidian progression','Universe 2 progress extends the Universe 1 Obsidian boundary.','Reach the current Obsidian boundary in Universe 1. Unlock Universe 2 using Fluffy level 10 at evolution 8, then advance in Universe 2.']
 ];
 for(const[key,name,description,requirement]of extraSystems)add({id:'systems:'+key,name,category:'Game systems & progression',description,requirement,kind:'systems',key,universe:0,sources:['main.js','objects.js','config.js']});covered.systems.push(...extraSystems.map(x=>x[0]));
 // Advanced map specials, Alchemy recipes, and Heirloom types/modifiers/rarity milestones.
 const specialStart=main.indexOf('var mapSpecialModifierConfig = {'),specialEnd=main.slice(specialStart).match(/^\};?\r?$/m);
 vm.runInContext(main.slice(specialStart,specialStart+specialEnd.index+specialEnd[0].length),c);
 for(const[key,o]of Object.entries(c.mapSpecialModifierConfig))add({id:'mapSpecials:'+key,name:o.name,category:'Maps & discoveries',description:prose(o,'description'),requirement:typeof o.unlocksAt2==='function'?'Universe 2: complete Archaeology, then select this special and pay the original Fragment cost when creating a map.':'Map creation special: reach Zone '+o.unlocksAt+' in Universe 1'+(o.unlocksAt2?' or Zone '+o.unlocksAt2+' in Universe 2':'')+'. Select the special and pay its original Fragment cost when creating the map.',kind:'mapSpecials',key,zone1:o.unlocksAt>0?o.unlocksAt:0,zone2:typeof o.unlocksAt2==='number'?o.unlocksAt2:0,requiresArchaeology:typeof o.unlocksAt2==='function',universe:0,sources:['main.mapSpecialModifierConfig.'+key]});covered.mapSpecials=Object.keys(c.mapSpecialModifierConfig);
 for(let i=0;i<c.alchObj.potions.length;i++){const o=c.alchObj.potions[i];add({id:'potions:'+i,name:c.alchObj.potionNames[i],category:'Equipment & items',description:prose(o,'description','effectText'),requirement:'Universe 2: start the Alchemy challenge after reaching Zone 155. Collect the required herbs from Maps and pay this recipe’s displayed herb cost.'+(o.challenge?' This recipe applies only while the challenge is active.':''),kind:'potions',key:String(i),universe:2,sources:['objects.alchObj.potions['+i+']']});}covered.potions=c.alchObj.potions.map((_,i)=>String(i));
 for(const type of ['Shield','Staff','Core']){
  add({id:'heirloomTypes:'+type,name:type+' Heirloom',category:'Heirlooms',description:{Shield:'Equip army, population and combat bonuses.',Staff:'Equip gathering and worker bonuses.',Core:'Improve the traps and rewards of your Player Spire.'}[type],requirement:type==='Core'?'Universe 1: clear all 100 cells of Spire II at Zone 300, then later Spires for higher Core rarities.':'Find a Heirloom from a Void Map; its type and modifiers are randomly rolled.',kind:'heirloomTypes',key:type,universe:0,sources:['heirlooms.'+type,'main.createHeirloom']});
  for(const[key,o]of Object.entries(g.heirlooms[type])){
   const tiers=g.heirlooms.rarityNames.filter((_,i)=>i>0&&i>=(o.minTier||0)&&(o.maxTier===undefined||i<=o.maxTier)&&(!o.steps||o.steps[i]!==-1&&o.steps[i]!==undefined));
   add({id:'heirloomMods:'+type+':'+key,name:o.name+' · '+type,category:'Heirlooms',description:'A '+type+' modifier that improves '+o.name.toLowerCase()+'. Rolls vary by rarity and can be upgraded with the original Heirloom currency.',requirement:'Obtain a '+type+' with an eligible random modifier roll. Eligible rarities: '+tiers.join(', ')+'.'+(o.filter?' Requires unlocking Relentlessness in Universe 1.':''),kind:'heirloomMods',key,type,universe:0,sources:['heirlooms.'+type+'.'+key]});
  }covered['heirloomMods:'+type]=Object.keys(g.heirlooms[type]);
 }covered.heirloomTypes=['Shield','Staff','Core'];
 for(let rarity=0;rarity<g.heirlooms.rarityNames.length;rarity++){
  if(rarity===0){exclusions['heirloomRarities:0']='Basic is a legacy rarity, not a new obtainable drop in 5.10.1; first new Spire Core is Common at Zone 300.';continue;}
  const paths=[];
  for(const universe of [1,2]){let first=0;for(let zone=1;zone<=1000;zone++){
   let index=g.heirlooms.rarityBreakpoints.findIndex((z,i)=>(zone<z&&universe<=g.heirlooms.universeBreakpoints[i])||universe<g.heirlooms.universeBreakpoints[i]);if(index<0)index=g.heirlooms.rarities.length-1;
   if(g.heirlooms.rarities[index]?.[rarity]>0){first=zone;break;}
  }if(first)paths.push('base Void Map drop table: Universe '+universe+', Zone '+first+'+');}
  if(rarity<=6)paths.push('Core reward from clearing the Spire at Zone '+(200+rarity*100)+' in Universe 1');
  add({id:'heirloomRarities:'+rarity,name:g.heirlooms.rarityNames[rarity]+' Heirlooms',category:'Heirlooms',description:'A Heirloom rarity tier with its own modifier ranges and upgrade costs.',requirement:paths.join('; ')+'. Random drops are not guaranteed. Fluffy and Mutator rarity bonuses can alter the base table; consult the live Heirloom chances for the current drop range.',kind:'heirloomRarities',key:String(rarity),universe:0,sources:['heirlooms.rarities','heirlooms.rarityBreakpoints','main.getHeirloomRarityRanges']});
 }covered.heirloomRarities=g.heirlooms.rarityNames.map((_,i)=>String(i));
 const descriptions={
  'jobs:Trainer':'Increases the base block supplied to your soldiers.',
  'jobs:Magmamancer':'Increases Metal gathering based on Magmamancer count and time spent in the current Zone.',
  'jobs:Meteorologist':'Increases Radon rewards after the Meteorologist has been active for a full Zone; Antennas improve the bonus.',
  'portal:Classy':'Reduces the Zone at which Fluffy can start gaining experience, per perk level.',
  'portal:Observation':'Find permanent Runetrinkets above Zone 100 to increase army attack, health and gathered primary resources. Perk levels improve their chance and storage cap.',
  'challenges:Corrupted':'Enemies gain 3x attack and Corruption begins at Zone 60, with reduced Corruption Helium rewards until its normal starting zone.',
  'generatorUpgrades:Supply':'Increases the maximum fuel the Generator can harvest per cell by 0.02 per upgrade, making fuel from two more Zones harvestable.'
 };
 for(const e of entries)if(descriptions[e.id])e.description=descriptions[e.id];
 const resources={food:['Food','Feed workers and buy buildings.','Available from the start.'],wood:['Wood','Build structures, Traps and wooden equipment.','Hold 5 Food to discover Wood.'],metal:['Metal','Buy and improve military equipment.','Find the Miner book at World Zone 1, cell 30, then research Miners. Metal/Transmute restrictions apply.'],science:['Science','Research upgrades and new technologies.','Hold 2 Trimps and 15 Food to discover Research and Science.'],gems:['Gems','Buy advanced housing and other expensive upgrades.','Find Gem loot in Maps; Dragimp and Tributes provide a later renewable source.'],fragments:['Fragments','Create Maps and pay for advanced map options.','Find Maps and Fragment rewards; research Explorers to gather Fragments.']};
 for(const[key,[name,description,requirement]]of Object.entries(resources))add({id:'resources:'+key,name:name+' resource',category:'Game systems & progression',description,requirement,kind:'resources',key,universe:0,sources:['resources.'+key,'triggers','worldUnlocks','mapUnlocks']});covered.resources=Object.keys(resources);
 const mapTools=[['advancedMaps','Advanced map specials','Choose a special map completion reward or behavior.','Reach Zone 60 in Universe 1 or Zone 15 in Universe 2.'],['perfectMaps','Perfect maps','Create a map with perfect selected sliders at the original increased Fragment cost.','Reach Zone 110 in Universe 1 or Zone 30 in Universe 2.'],['extraMapLevels','Extra map levels','Create Maps above your current Zone.','Reach Zone 210 in Universe 1 or Zone 50 in Universe 2.'],['gardens','Gardens','A Plentiful map biome with improved loot.','Complete the Decay challenge in Universe 1.']];
 for(const[key,name,description,requirement]of mapTools)add({id:'systems:'+key,name,category:'Maps & discoveries',description,requirement,kind:'systems',key,universe:0,sources:['main.getUnlockZone','main.refreshMapBiomes']});covered.systems.push(...mapTools.map(x=>x[0]));
 const natureDescriptions={Poison:'Build damage stacks that damage later enemies.',Wind:'Build stacks that increase loot from enemies.',Ice:'Build stacks that weaken enemy attack and increase Trimp damage.'};
 for(const key of Object.keys(g.empowerments))for(const mode of ['level','transfer','enlighten']){
  const req='Universe 1: the '+key+' tab requires reaching Zone '+({Poison:236,Wind:241,Ice:246}[key])+' in a Universe 1 run. Empowerment effects begin at Zone 1 during Eradicated, but the tabs still follow the original highest-zone thresholds. Collect the corresponding Nature tokens. '+(mode==='enlighten'?'Reach level 50 in this empowerment, have no other Enlightenment active, and pay the displayed token price. Only one Enlightenment per run.':mode==='transfer'?'Pay the displayed token cost to retain more stacks between enemies; retention level is capped at 80.':'Pay the displayed token cost for the next level.');
  add({id:'nature:'+key+':'+mode,name:key+' '+({level:'empowerment',transfer:'stack retention',enlighten:'Enlightenment'}[mode]),category:'Nature',description:mode==='level'?natureDescriptions[key]:mode==='transfer'?'Carry a larger share of existing stacks to the next enemy.':'Activate the stronger '+key+' effect for this run.'+(key==='Wind'?' Also unlocks the Wind formation.':''),requirement:req,kind:'nature',key,mode,universe:1,sources:['empowerments.'+key,'main.naturePurchase']});
 }covered.nature=Object.keys(g.empowerments).flatMap(k=>['level','transfer','enlighten'].map(m=>k+':'+m));
 const spireRewards=[[200,'Mutated Seed drop ×2'],[300,'Scruffy experience +50%'],[400,'Critical chance +10%'],[500,'Double the basic U2 Spire bonus'],[600,'Nullifium reward ×1.2'],[700,'A further +50% Scruffy experience'],[800,'A further +15% critical chance'],[900,'A further ×2 Mutated Seed drop']];
 for(const[cell,description]of spireRewards)add({id:'u2SpireRewards:'+cell,name:'Universe 2 Spire · cell '+cell,category:'Game systems & progression',description,requirement:'Universe 2: reach the Spire at Zone 300 and clear '+cell+' Spire cells in one run. These milestones use your best credited clear.',kind:'u2SpireRewards',key:String(cell),universe:2,sources:['main.u2SpireBonuses']});covered.u2SpireRewards=spireRewards.map(x=>String(x[0]));
 const natureEntry=entries.find(e=>e.id==='systems:nature');natureEntry.requirement+=' During Eradicated, Nature starts at Zone 1.';
 const explicitSources={'worldUnlocks.Foreman':['systems:foremen'],'worldUnlocks.Map':['resources:fragments','systems:maps'],'mapUnlocks.roboTrimp':['systems:roboTrimp'],'mapUnlocks.AutoStorage':['systems:autoStorage','systems:heirlooms'],'mapUnlocks.ImprovedAutoStorage':['systems:improvedAutoStorage'],'mapUnlocks.MapAtZone':['systems:mapAtZone'],'mapUnlocks.NoCoords':['systems:noCoords'],'mapUnlocks.AutoEquip':['systems:autoEquip'],'mapUnlocks.Heirloom':['systems:heirlooms'],'mapUnlocks.Keys':['challenges:Electricity'],'mapUnlocks.Relentlessness':['portal:Relentlessness'],'mapUnlocks.Portal':['systems:portal'],'triggers.wood':['resources:wood'],'triggers.upgrades':['resources:science'],'triggers.breeding':['systems:breeding']};
 const excludedSources={'worldUnlocks.easterEgg':'Empty seasonal handler; no obtainable feature.','worldUnlocks.fiveTrimpMax':'Repeat housing reward; grants population rather than unlocking a new feature.','worldUnlocks.fruit':'Repeat Food loot.','worldUnlocks.groundLumber':'Repeat Wood loot.','worldUnlocks.freeMetals':'Repeat Metal loot.','worldUnlocks.spireMetals':'Repeat Spire Metal loot.','mapUnlocks.Geneticistassist':'Deprecated handler always filtered out; current unlock is catalogued under bwRewards.','mapUnlocks.AncientTreasure':'Repeat unique-map resource-doubling reward, no new feature.','mapUnlocks.SmithFree':'Repeat free Smithy reward, no new building unlock.',...Object.fromEntries(['gems','Gems','Any','Metal','Food','Wood'].map(k=>['mapUnlocks.'+k,'Repeat resource loot, no new feature.']))};
 const sourceCoverage={};
 for(const group of ['worldUnlocks','mapUnlocks','triggers'])for(const key of Object.keys(g[group])){const source=group+'.'+key,ids=[...new Set([...(explicitSources[source]||[]),...entries.filter(e=>e.sources.some(s=>s===source||s.startsWith(source+'.'))).map(e=>e.id)])];for(const id of ids){const e=entries.find(e=>e.id===id);assert(e,id);if(!e.sources.includes(source))e.sources.push(source);}assert(ids.length||excludedSources[source],'Unclassified source '+source);sourceCoverage[source]=ids.length?{entries:ids}:{excluded:excludedSources[source]};}
 // Dynamic UI unlocks are audited separately from the three definition tables.
 const dynamicSources={'main.sLevel>=4':['systems:autoPrestige'],'main.getAvailableGoldenUpgrades':['goldenUpgrades:Helium','goldenUpgrades:Battle','goldenUpgrades:Void']};
 const inventory={...covered,worldUnlocks:Object.keys(g.worldUnlocks),mapUnlocks:Object.keys(g.mapUnlocks),triggers:Object.keys(g.triggers),mapLocations:Object.keys(g.mapConfig.locations)};
 return{version:g.global.stringVersion,entries,covered,inventory,sourceCoverage,dynamicSources,exclusions,missing,notes,context:c};
}
function generated(result){return '// Generated by tools/build-unlock-catalog.cjs from original 5.10.1 definitions.\nvar MobileUnlockData = '+JSON.stringify({version:result.version,entries:result.entries},null,2)+';\nif(typeof module!=="undefined")module.exports=MobileUnlockData;\n';}
function inventory(result){const {createHash}=require('node:crypto');return JSON.stringify({originalVersion:result.version,entryCount:result.entries.length,categories:Object.fromEntries([...new Set(result.entries.map(e=>e.category))].map(k=>[k,result.entries.filter(e=>e.category===k).length])),sourceSha256:Object.fromEntries(['config.js','objects.js','main.js','playerSpire.js'].map(f=>[f,createHash('sha256').update(fs.readFileSync(root+f)).digest('hex')])),inventories:result.inventory,sourceCoverage:result.sourceCoverage,dynamicSources:result.dynamicSources,excluded:result.exclusions},null,2)+'\n';}
if(require.main===module){const result=build();assert.deepEqual(result.missing,[]);assert.deepEqual(result.notes,[]);const outputs=[[root+'mobile-unlock-data.js',generated(result)],['docs/evidence/qol-combat-breeding/catalog-inventory.json',inventory(result)]];for(const[target,data]of outputs)if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),data,'Regenerate unlock data/inventory');else{fs.mkdirSync(require('node:path').dirname(target),{recursive:true});fs.writeFileSync(target,data);}console.log(JSON.stringify({count:result.entries.length,categories:[...new Set(result.entries.map(e=>e.category))],missing:result.missing,notes:result.notes}));}
module.exports={build,plain,prose,generated,inventory};
