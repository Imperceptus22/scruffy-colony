// Variant B: relocate original controls; navigation never changes combat state.
var MobileCombatControls=(()=>{
 const byId=id=>document.getElementById(id),host=byId('battleBtnsColumn');
 const dialog=document.createElement('dialog');dialog.id='mobile-combat-tools';dialog.setAttribute('aria-labelledby','mobile-combat-tools-title');
 const head=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button'),list=document.createElement('div');
 title.id='mobile-combat-tools-title';title.textContent='Combat tools';close.textContent='×';close.setAttribute('aria-label','Close combat tools');
 head.append(title,close);dialog.append(head,list);document.body.append(dialog);
 const rows=[];
 // V-277: the own entries name their symbol like the original rows (--compact-icon); only Diorama draws it (mobile-diorama-combat-tools.css).
 const add=(label,action,source,icon)=>{const button=document.createElement('button');button.textContent=label;button.style.setProperty('--compact-icon','var(--mi-'+icon+')');button.onclick=()=>{if(!available(source))return;dialog.close();action();};list.append(button);rows.push({node:button,source});return button;};
 function available(node){if(!node)return false;for(let n=node;n&&n!==document.body;n=n.parentElement)if(n.style.display==='none'||n.style.visibility==='hidden')return false;return true;}
 const maps=byId('mapsBtn'),mapSettings=maps.querySelector('.mobile-map-settings'),mapStore=document.createElement('div');mapStore.hidden=true;
 maps.parentElement.append(mapStore);mapStore.append(maps);
 add('Map Chamber',()=>{TrimpsUI.select('maps');MobileMapMenu.contextAction();},maps,'maps');
 add('Configure Maps',()=>mapSettings.click(),maps,'settings');
 add('Combat info',()=>TrimpsUI.info('Fight',null),byId('fightBtn'),'info');
 const primary=new Set(['fightBtn','pauseFight','repeatBtn']);
 for(const row of [...host.children]){
  if([...primary].some(id=>row.contains(byId(id))))continue;
  if(row.contains(mapStore)){mapStore.before(document.createComment('Original map sources retained for engine updates.'));document.body.append(mapStore);row.remove();continue;}
  // The return action belongs beside the map title, not in the tools list.
  if(row.id==='mobile-return-world')continue;
  const source=row.querySelector('[onclick]');if(!source)continue;
  list.append(row);rows.push({node:row,source});
  source.addEventListener('click',()=>dialog.close());
 }
 const mapButton=document.createElement('button');mapButton.id='mobile-combat-maps';mapButton.textContent='Maps';mapButton.onclick=()=>byId('mapsBtnText').click();host.append(mapButton);
 const more=document.createElement('button');more.id='mobile-combat-more';more.textContent='…';more.setAttribute('aria-label','Combat tools');more.setAttribute('aria-haspopup','dialog');host.append(more);
 more.onclick=()=>{refresh();dialog.showModal();close.focus();};close.onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 const world=byId('mobile-return-world'),mapHead=document.createElement('div'),mapTitle=byId('battleSideTitle');
 mapHead.id='mobile-combat-map-head';mapTitle.before(mapHead);mapHead.append(mapTitle,world);
 host.classList.add('mobile-combat-primary');
 function refresh(){
  const active=Boolean(game.global.mapsActive);
  for(const id of primary){const n=byId(id);n.parentElement.hidden=!available(n)||(id==='repeatBtn'&&!active);}
  const labels={fightBtn:'Fight',pauseFight:'Auto '+(game.global.pauseFight?'Off':'On'),repeatBtn:'Repeat '+(game.global.repeatMap?'On':'Off')};
  for(const[id,label]of Object.entries(labels))byId(id).dataset.shortLabel=label;
  mapButton.hidden=active||!available(maps);
  for(const {node,source}of rows)node.hidden=!available(source);
  if(!world.hidden)world.textContent=world.disabled?'Return queued':'World';
  if(dialog.open&&document.body.dataset.mobilePage!=='battle')dialog.close();
 }
 const observer=new MutationObserver(refresh);
 observer.observe(host,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style']});
 refresh();
 return{refresh,back:()=>{if(!dialog.open)return false;dialog.close();return true;}};
})();
