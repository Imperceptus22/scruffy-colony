// Map tiles for the special map locations (V-165, variant B "assign existing art"): each tile is composed only from
// packaged Diorama renditions (an object on a terrain slab, a framed scene, or a tinted biome) in headless Chromium,
// exported as WebP beside the other Diorama assets. Writes mobile-diorama-map-specials.js (biome map additions,
// including the aliases Plentiful -> Gardens and Atlantis -> Sea) and artwork/diorama/map-specials.json (recipe and
// SHA-256 of every input and output). The composition is deterministic; WebP bytes may differ between Chrome versions.
// Usage: node tools/build-map-specials.cjs   (PLAYWRIGHT_MODULE / PLAYWRIGHT_CHROMIUM_EXECUTABLE as for the proofs)
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),app=path.join(root,'app/src/main/assets/game'),dir=path.join(app,'mobile-assets/diorama');
const size=444,quality=.92; // Same square format as the M01-M08 biome tiles.
const slabs={stone:'T03-terrain-stone.webp',cleared:'T02-terrain-cleared.webp'};
// Approved assignment (feedback round 4.43, variant B). object: sprite at 50 % / 40 % over a slab ("contain");
// scene: a painting cropped to the tile with a rounded wood frame; tint: an existing biome tile under a filter.
const recipes=[
 {key:'Hell',file:'MX01-Hell.webp',object:'B04-Forge.webp',slab:'cleared',filter:'saturate(1.25) hue-rotate(-12deg)'},
 {key:'Wall',file:'MX02-Wall.webp',scene:'S10-spire-assault.webp'},
 {key:'Block',file:'MX03-Block.webp',object:'E12-Shield.webp',slab:'stone',width:.52},
 {key:'Doom',file:'MX04-Doom.webp',object:'B19-Tribute.webp',slab:'stone'},
 {key:'Prison',file:'MX05-Prison.webp',object:'B18-Trap.webp',slab:'stone'},
 {key:'Bionic',file:'MX06-Bionic.webp',object:'B13-Microchip.webp',slab:'cleared'},
 {key:'Star',file:'MX07-Star.webp',object:'B21-Wormhole.webp',slab:'stone'},
 {key:'Darkness',file:'MX08-Darkness.webp',tint:'M05-Depths.webp',filter:'brightness(.55) saturate(.7)'},
 {key:'Melting',file:'MX09-Melting.webp',object:'B17-Smithy.webp',slab:'cleared'},
 {key:'Frozen',file:'MX10-Frozen.webp',scene:'S09-player-spire.webp',filter:'saturate(.55) hue-rotate(160deg) brightness(1.05)'},
 {key:'Prismatic',file:'MX11-Prismatic.webp',object:'R05-Fragments.webp',slab:'stone',width:.56},
];
// Locations that reuse an existing biome tile unchanged.
const aliases={Plentiful:'M06-Gardens.webp',Atlantis:'M04-Sea.webp'};
const sha256=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const source=name=>{const file=path.join(dir,name);if(!fs.existsSync(file))throw new Error('Missing source rendition '+name);return file;};

async function compose(page,recipe){
 const inputs=[recipe.object,recipe.object&&slabs[recipe.slab],recipe.scene,recipe.tint].filter(Boolean);
 const data=Object.fromEntries(inputs.map(name=>[name,'data:image/webp;base64,'+fs.readFileSync(source(name)).toString('base64')]));
 const url=await page.evaluate(async({recipe,data,size,quality,slab})=>{
  const load=async src=>{const image=new Image();image.src=src;await image.decode();return image;};
  const layer=document.createElement('canvas');layer.width=layer.height=size;const c=layer.getContext('2d');c.imageSmoothingQuality='high';
  const contain=(image,box)=>{const s=Math.min(box/image.naturalWidth,box/image.naturalHeight);return [image.naturalWidth*s,image.naturalHeight*s];};
  if(recipe.object){
   const ground=await load(data[slab]),[gw,gh]=contain(ground,size);c.drawImage(ground,(size-gw)/2,(size-gh)/2,gw,gh);
   const object=await load(data[recipe.object]),ow=size*(recipe.width||.64),oh=ow*object.naturalHeight/object.naturalWidth;
   c.drawImage(object,(size-ow)*.5,(size-oh)*.4,ow,oh);
  }else if(recipe.tint){const image=await load(data[recipe.tint]),[w,h]=contain(image,size);c.drawImage(image,(size-w)/2,(size-h)/2,w,h);}
  else{
   // Rounded wood frame as in the approved comp (2 px at the ~74 px list thumbnail, 6 px corner radius).
   const image=await load(data[recipe.scene]),inset=6,frame=12,radius=34,s=Math.max((size-2*inset)/image.naturalWidth,(size-2*inset)/image.naturalHeight);
   c.save();c.shadowColor='#3a271655';c.shadowOffsetY=6;c.shadowBlur=10;c.beginPath();c.roundRect(inset,inset,size-2*inset,size-2*inset-6,radius);c.fillStyle='#6b4a24';c.fill();c.restore();
   c.save();c.beginPath();c.roundRect(inset+frame,inset+frame,size-2*(inset+frame),size-2*(inset+frame)-6,radius-frame/2);c.clip();
   const w=image.naturalWidth*s,h=image.naturalHeight*s;c.drawImage(image,(size-w)/2,(size-h)/2,w,h);c.restore();
  }
  const out=document.createElement('canvas');out.width=out.height=size;const o=out.getContext('2d');
  if(recipe.filter)o.filter=recipe.filter;o.drawImage(layer,0,0);
  return out.toDataURL('image/webp',quality);
 },{recipe,data,size,quality,slab:recipe.object&&slabs[recipe.slab]});
 if(!url.startsWith('data:image/webp'))throw new Error('Chromium did not encode WebP for '+recipe.key);
 const file=path.join(dir,recipe.file);fs.writeFileSync(file,Buffer.from(url.split(',')[1],'base64'));
 return {...recipe,inputs:inputs.map(name=>({file:'mobile-assets/diorama/'+name,sha256:sha256(source(name))})),output:{file:'mobile-assets/diorama/'+recipe.file,width:size,height:size,bytes:fs.statSync(file).size,sha256:sha256(file)}};
}

async function build(){
 if(process.env.PLAYWRIGHT_MODULE){const Module=require('node:module');process.env.NODE_PATH=[path.dirname(process.env.PLAYWRIGHT_MODULE),process.env.NODE_PATH].filter(Boolean).join(path.delimiter);Module._initPaths();}
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});
 try{
  const page=await browser.newPage(),items=[];
  for(const recipe of recipes)items.push(await compose(page,recipe));
  const biomes={...Object.fromEntries(Object.entries(aliases).map(([key,name])=>[key,'mobile-assets/diorama/'+name])),...Object.fromEntries(recipes.map(r=>[r.key,'mobile-assets/diorama/'+r.file]))};
  fs.writeFileSync(path.join(app,'mobile-diorama-map-specials.js'),`// Generated by tools/build-map-specials.cjs. Do not edit by hand.\n// Map tiles for the special map locations and the location aliases, added to DioramaAssets.biomes.\n(function (root, specials) {\n  if (typeof module === 'object' && module.exports) module.exports = specials;\n  if (root.DioramaAssets) Object.assign(root.DioramaAssets.biomes, specials.biomes);\n})(globalThis, ${JSON.stringify({biomes},null,2)});\n`);
  fs.writeFileSync(path.join(root,'artwork/diorama/map-specials.json'),JSON.stringify({tool:'tools/build-map-specials.cjs',encoding:{format:'WebP',quality,size},slabs,aliases:Object.fromEntries(Object.entries(aliases).map(([key,name])=>[key,{file:'mobile-assets/diorama/'+name,sha256:sha256(source(name))}])),items},null,2)+'\n');
  console.log(`Built ${items.length} map tiles (${items.reduce((n,i)=>n+i.output.bytes,0)} bytes) and ${Object.keys(aliases).length} aliases.`);
 }finally{await browser.close();}
}
module.exports={recipes,aliases};
if(require.main===module)build().catch(error=>{console.error(error);process.exitCode=1;});
