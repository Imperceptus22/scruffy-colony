// Read-only view of original unlock flags. Optional discovery history is scoped to the save identity.
var MobileUnlockCatalog=(()=>{
 const data=typeof MobileUnlockData!=='undefined'?MobileUnlockData:require('./mobile-unlock-data.js');
 const level=(g,u)=>Math.max(1+(u===2?g.global.highestRadonLevelCleared:g.global.highestLevelCleared),g.global.universe===u?g.global.world:0);
 const stat=(g,key)=>(g.stats[key]?.value||0)+(g.stats[key]?.valueTotal||0);
 function system(key,g,env){const s=g.global,u=s.universe;
  const flags={maps:s.mapsUnlocked,portal:s.portalActive,heirlooms:s.heirloomsCarried?.length||s.heirloomsExtra?.length||Object.keys(s.ShieldEquipped||{}).length||Object.keys(s.StaffEquipped||{}).length,autoUpgrades:s.autoUpgradesAvailable,autoStorage:s.autoStorageAvailable,improvedAutoStorage:s.improvedAutoStorage,mapAtZone:s.canMapAtZone,autoEquip:s.autoEquipUnlocked,boneTrader:s.b>0||Object.values(g.unlocks.imps).some(Boolean)||stat(g,'bones')>0,breeding:g.triggers.breeding.done>0&&!['Trapper','Trappapalooza'].includes(s.challengeActive),challenge2:level(g,1)>=65,challenge3:u===2&&level(g,2)>=50,masteries:u===1&&level(g,1)>=181,scrying:u===1&&level(g,1)>=181&&g.upgrades.Formations.done>0,spire:env.playerSpire?.initialized,generator:u===1&&s.world>=230,nature:u===1&&s.world>=236,universe2:u===2||(env.Fluffy?.checkU2Allowed?.()||false),assault:u===2&&level(g,2)>=75,mutators:u===2&&level(g,2)>=201,u2spire:u===2&&s.world>=300,autoGolden:stat(g,'goldenUpgrades')>=77,autoTraps:g.upgrades.Trapstorm.done>0,formations:g.upgrades.Formations.done>0,voidMaps:s.mapsOwnedArray.some(m=>m.location==='Void')||s.totalVoidMaps>0,fluffy:u===1&&g.portal.Capable.locked===false,scruffy:u===2,frozenCastle:u===2&&s.mapsOwnedArray.some(m=>m.location==='Frozen'),blackBog:u===2&&s.challengeActive==='Quagmire',farmlands:u===2&&s.farmlandsUnlocked,alchemy:u===2&&s.challengeActive==='Alchemy',obsidian:u===1&&s.world>=(env.getObsidianStart?.()||701)};
  return Boolean(flags[key]);
 }
 function available(e,g,env={}){
  if(e.universe&&e.universe!==g.global.universe)return false;
  const o=g[e.kind]?.[e.key],u=g.global.universe;
  if(['buildings','equipment','jobs'].includes(e.kind))return Boolean(o&&(!o.locked||o.owned>0||o.level>0));
  if(e.kind==='upgrades')return Boolean(o&&(!o.locked||o.done>0||o.allowed>0));
  if(e.kind==='portal')return Boolean((g.global.portalActive||g.global.totalPortals>0||g.global.totalRadPortals>0)&&g.portal[e.key]?.[u===2?'radLocked':'locked']===false);
  if(e.kind==='imports')return g.unlocks.imps[e.key]===true;
  if(e.kind==='permaBoneBonuses')return g.permaBoneBonuses[e.key].owned>0||Object.values(g.unlocks.imps).every(Boolean);
  if(e.kind==='bwRewards')return Boolean(env.bwRewardUnlocked?.(e.key));
  if(e.kind==='challenges'){
   const c=g.challenges[e.key],source=String(c.filter),highest=level(g,u)-1;
   if(e.key==='Daily')return level(g,u)>=(u===2?30:100);
   if(e.key==='Scientist')return u===1&&highest>=[39,49,89,109,129][Math.min(g.global.sLevel,4)];
   if(e.key==='Discipline')return u===1&&g.global.totalHeliumEarned>=30;
   if(e.key==='Electricity')return u===1&&g.global.prisonClear>0;
   if(e.key==='Eradicated')return u===1&&g.global.totalSquaredReward>=4500;
   if(c.onlySquared&&level(g,1)<65)return false;
   const threshold=/getHighestLevelCleared\(true\)\s*>=\s*(\d+)/.exec(source);
   return threshold?highest>=Number(threshold[1]):e.key==='Enlightened'&&level(g,1)>=65;
  }
  if(e.kind==='talents'){const t=g.talents[e.key];return t.purchased||(level(g,1)>=181&&(env.getAllowedTalentTiers?.()[t.tier-1]||0)>0&&[].concat(t.requires||[]).every(k=>g.talents[k].purchased));}
  if(e.kind==='generatorUpgrades'||e.kind==='permanentGeneratorUpgrades')return Boolean(o?.owned||o?.upgrades>0||system('generator',g,env)&&(e.key!=='Overclocker'||g.permanentGeneratorUpgrades.Hybridization.owned&&g.permanentGeneratorUpgrades.Storage.owned));
  if(e.kind==='mutators')return Boolean(env.u2Mutations?.tree[e.key]?.purchased||system('mutators',g,env)&&env.u2Mutations?.checkRequirements(e.key));
  if(e.kind.startsWith('assault-')){
   if(!system('assault',g,env))return false;const kind=e.kind.slice(8),item=env.autoBattle?.[kind]?.[e.key];if(!item)return false;
   if(kind==='items')return Boolean(item.owned);
   if(kind==='oneTimers')return Boolean(item.owned||Object.values(env.autoBattle.items).filter(i=>i.owned).length>=item.requiredItems);
   if(kind==='ringStats')return Boolean(env.autoBattle.oneTimers.The_Ring.owned);
   return e.key!=='Scaffolding'||env.autoBattle.shards>0;
  }
  if(e.kind==='rewards'||e.kind==='rewardsU2'||e.kind==='prestigeRewards'){
   const credit=(env.Fluffy?.currentLevel||0)+(env.Fluffy?.getCurrentPrestige?.()||0)+(g.talents.fluffyAbility.purchased?1:0);
   return credit>Number(e.key)+(e.kind==='prestigeRewards'?10:0);
  }
  if(e.kind==='uniqueMaps')return g.global.mapsOwnedArray.some(m=>m.name.toLowerCase()===e.key.toLowerCase());
  if(e.kind==='spireTraps')return Boolean(env.playerSpire?.initialized&&env.playerSpireTraps?.[e.key]?.locked===false);
  if(e.kind==='spireTrapUpgrades')return Boolean(env.playerSpire?.initialized&&env.playerSpireTraps?.[e.key]?.level>=e.level);
  if(e.kind==='goldenUpgrades'){
   if(e.key==='Helium'&&g.global.runningChallengeSquared)return false;
   const bonus=g.global.achievementBonus,tier=bonus<15?0:bonus<100?1:bonus<300?2:bonus<600?3:bonus<1000?4:bonus<2000?5:6;
   return tier>0&&(g.global.world>=50-(tier-1)*5||bonus>=2500||g.goldenUpgrades[e.key].purchasedAt.length>0);
  }
  if(e.kind==='mapSpecials')return e.requiresArchaeology?u===2&&Boolean(g.global.ArchaeologyDone):Boolean((u===1?e.zone1:e.zone2)&&(level(g,u)>=(u===1?e.zone1:e.zone2)));
  if(e.kind==='potions')return u===2&&(g.global.challengeActive==='Alchemy'||g.global.alchemyUnlocked);
  if(e.kind==='heirloomTypes'||e.kind==='heirloomMods'||e.kind==='heirloomRarities'){
   const all=[...g.global.heirloomsCarried,...g.global.heirloomsExtra,g.global.ShieldEquipped,g.global.StaffEquipped,g.global.CoreEquipped].filter(h=>h&&h.type);
   return all.some(h=>e.kind==='heirloomTypes'?h.type===e.key:e.kind==='heirloomRarities'?h.rarity===Number(e.key):h.type===e.type&&h.mods.some(m=>m[0]===e.key));
  }
  if(e.kind==='resources')return Boolean(({food:true,wood:g.triggers.wood.done>0,metal:g.upgrades.Miners.done>0,science:g.triggers.upgrades.done>0,gems:g.resources.gems.owned>0||g.jobs.Dragimp.owned>0,fragments:g.global.mapsUnlocked||g.jobs.Explorer.owned>0})[e.key]);
  if(e.kind==='nature')return Boolean(u===1&&g.global.highestLevelCleared>=({Poison:235,Wind:240,Ice:245}[e.key])&&(e.mode!=='enlighten'||g.empowerments[e.key].getLevel()>=50&&!g.global.uberNature));
  if(e.kind==='u2SpireRewards')return g.global.u2SpireCellsBest>=Number(e.key);
  if(e.kind==='systems'){
   const extras={advancedMaps:level(g,u)>=(u===1?60:15),perfectMaps:level(g,u)>=(u===1?110:30),extraMapLevels:level(g,u)>=(u===1?210:50),gardens:g.global.decayDone,roboTrimp:g.global.roboTrimpLevel>0,noCoords:g.stats.highestVoidMap.valueTotal>=250,autoPrestige:g.global.sLevel>=4,foremen:g.global.autoCraftModifier>0};
   if(e.key==='nature'&&u===1&&g.global.challengeActive==='Eradicated')return true;
   return Object.hasOwn(extras,e.key)?Boolean(extras[e.key]):system(e.key,g,env);
  }
  return false;
 }
 function rows(g,seen={},env={}){return data.entries.map(e=>{const active=available(e,g,env),known=active||seen[e.id]===true;return{...e,active,known,status:active?'Unlocked':known?'Discovered · unavailable in this run':'Undiscovered'};});}
 function visible(rows,spoilers,query=''){const q=query.trim().toLowerCase();return rows.filter(e=>{if(!e.known&&!spoilers)return false;if(!q)return true;const original=e.name+' '+e.description+' '+e.requirement;const text=typeof MobileBranding!=='undefined'?original+' '+MobileBranding.text(original):original;return text.toLowerCase().includes(q);});}
 return{data,available,rows,visible};
})();
if(typeof module!=='undefined')module.exports=MobileUnlockCatalog;
