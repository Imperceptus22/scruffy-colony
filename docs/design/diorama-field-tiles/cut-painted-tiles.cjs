// Cuts the repainted field tiles out of the unchanged image-tool boards (source/tafel-a.png, tafel-b.png, the void board
// tafel-c-void.png and the world mutation board tafel-d-sonderfelder.png).
// Each tile is traced by its own contour inside its 4x4 board area: the plain board ground has luminance 28-30 and
// the cast shadow under each tile 20-26, while the earth edge starts at about 40. Pixels brighter than the threshold
// form the tile; the largest connected area is kept, enclosed dark detail (trunks, cracks, contact shadows) is
// filled back in, and the outline gets a one-pixel soft edge. Boards A, B and D are not scaled: each tile ships at its
// painted size, cropped to its contour with a 2 px margin. The void board (V-183) came back as a 1254 px render scaled
// to 2048 px with tile heights 17 px apart, so its tiles are brought to one common size (NORMALIZE, about 1254 px scale,
// at most about 4 % vertical change). The script stops if a contour touches its board area (no clean gap).
// Usage (repository root): node docs/design/diorama-field-tiles/cut-painted-tiles.cjs [--board c-void|d-sonderfelder] > docs/design/diorama-field-tiles/painted-crops.json.new
// With --board only the named boards are cut; the other boards' entries are kept from painted-crops.json.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const here=__dirname,app=path.resolve(here,'../../../app/src/main/assets/game/mobile-assets/diorama-field');
const THRESHOLD=36,PAD=2;
// The void tile of board B is superseded by the void board (V-183) and kept as a working copy only.
const NOT_SHIPPED=new Set(['F27-void']);
// Common contour size per board (without the margin); boards without an entry keep their painted size.
const NORMALIZE={'c-void':{width:283,height:252}};
// Seam bridging for the tile search, in px.
const BRIDGE={'c-void':12};
// Board position (row-major, 1-16) → tile name; order as in NEU-MALEN-AUFTRAG.md.
const boards={
 a:['F01-grass-a','F02-grass-b','F03-grass-c','F11-grass-d','F04-tree','F05-food','F06-ore','F07-gems','F08-book','F09-gift','F10-cleared','F12-overkill','F13-fragments','F14-worker','F15-plans','F16-unique-map'],
 b:['F17-mixed-loot','F18-blueprint','F19-sand-a','F20-sand-b','F21-mountain-a','F22-forest-a','F23-sea','F24-depths','F25-garden-a','F26-farmland-a','F27-void','F28-clover','F29-mountain-b','F30-forest-b','F31-garden-b','F32-farmland-b'],
 // Order as in MALAUFTRAG-V183-VOID.md.
 'c-void':['F33-void-a','F34-void-b','F35-void-c','F36-void-d','F37-void-gems','F38-void-mixed-loot','F39-void-cleared','F40-void-overkill','F41-void-tree','F42-void-food','F43-void-ore','F44-void-book','F45-void-e','F46-void-f','F47-void-g','F48-void-h'],
 // World mutations (V-193), order as in MALAUFTRAG-V193-SONDERFELDER.md.
 'd-sonderfelder':['F49-magma-a','F50-magma-b','F51-magma-c','F52-magma-d','F53-corruption-a','F54-corruption-b','F55-corruption-c','F56-corruption-d','F57-healthy-a','F58-healthy-b','F59-magma-cleared-a','F60-magma-cleared-b','F61-corruption-cleared','F62-healthy-cleared','F63-magma-overkill','F64-corruption-overkill'],
};
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function cut(board,names){
 const file=path.join(here,'source','tafel-'+board+'.png');
 const {data,info}=await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const W=info.width,H=info.height,out=[];
 const lum=i=>.299*data[i*3]+.587*data[i*3+1]+.114*data[i*3+2];
 // Find the 16 tiles as the largest bright areas of the whole board (no fixed quarters), then order them row-major.
 // Dark seams inside a tile are bridged by a dilation (only the void board, whose slab has black stone joints: 12 px);
 // the gaps between tiles are wider than twice that. The work area below subtracts it again.
 const R=BRIDGE[board]??0;
 const raw=new Uint8Array(W*H);for(let i=0;i<W*H;i++)raw[i]=lum(i)>THRESHOLD?1:0;
 const lit=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!raw[y*W+x])continue;for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<H)lit[Y*W+X]=1;}}
 const seen=new Uint8Array(W*H),blobs=[];
 for(let s=0;s<W*H;s++){if(!lit[s]||seen[s])continue;seen[s]=1;const stack=[s];let size=0,x0=W,y0=H,x1=0,y1=0;
  while(stack.length){const p=stack.pop();size++;const x=p%W,y=(p-x)/W;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
   for(const q of [p+1,p-1,p+W,p-W])if(q>=0&&q<W*H&&Math.abs((q%W)-x)<=1&&lit[q]&&!seen[q]){seen[q]=1;stack.push(q);}}
  blobs.push({size,x0,y0,x1,y1});}
 const tiles=blobs.sort((a,b)=>b.size-a.size).slice(0,16);
 if(tiles.length<16||tiles[15].size<tiles[0].size/3)throw new Error(`tafel-${board}: expected 16 tiles of similar size`);
 const rows=[...tiles].sort((a,b)=>a.y0-b.y0),ordered=[];for(let r=0;r<4;r++)ordered.push(...rows.slice(r*4,r*4+4).sort((a,b)=>a.x0-b.x0));
 for(let n=0;n<16;n++){
  // Work area: the tile's bounds plus 12 px of board ground on every side (measured from the dilated bounds).
  const t=ordered[n],rx=Math.max(0,t.x0+R-12),ry=Math.max(0,t.y0+R-12),rw=Math.min(W,t.x1-R+13)-rx,rh=Math.min(H,t.y1-R+13)-ry;
  const inside=(x,y)=>x>=0&&y>=0&&x<rw&&y<rh,at=(x,y)=>(ry+y)*W+rx+x;
  // Bright mask and its largest 4-connected component. On a board with BRIDGE the component is searched on the dilated
  // mask (black stone joints), but only its undilated bright pixels trace the outline.
  const bright=new Uint8Array(rw*rh);for(let y=0;y<rh;y++)for(let x=0;x<rw;x++)bright[y*rw+x]=lum(at(x,y))>THRESHOLD?1:0;
  const J=BRIDGE[board]??0,joined=J?new Uint8Array(rw*rh):bright;
  if(J)for(let y=0;y<rh;y++)for(let x=0;x<rw;x++){if(!bright[y*rw+x])continue;for(let dy=-J;dy<=J;dy++)for(let dx=-J;dx<=J;dx++)if(inside(x+dx,y+dy))joined[(y+dy)*rw+x+dx]=1;}
  const label=new Int32Array(rw*rh);let best=0,bestSize=0,next=0;
  for(let s=0;s<rw*rh;s++){if(!joined[s]||label[s])continue;next++;let size=0;const stack=[s];label[s]=next;
   while(stack.length){const p=stack.pop();size++;const x=p%rw,y=(p-x)/rw;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const q=(y+dy)*rw+x+dx;if(inside(x+dx,y+dy)&&joined[q]&&!label[q]){label[q]=next;stack.push(q);}}}
   if(size>bestSize){bestSize=size;best=next;}}
  if(J)for(let s=0;s<rw*rh;s++)if(!bright[s])label[s]=0;
  // The painted tiles are convex rounded squares: a pixel belongs to the tile when it lies between the outermost tile
  // pixels of both its row and its column. This keeps dark surfaces (void, depths) whole even where they open to the
  // outline, and keeps the traced outline itself.
  const rowMin=new Int32Array(rh).fill(rw),rowMax=new Int32Array(rh).fill(-1),colMin=new Int32Array(rw).fill(rh),colMax=new Int32Array(rw).fill(-1);
  for(let y=0;y<rh;y++)for(let x=0;x<rw;x++)if(label[y*rw+x]===best){rowMin[y]=Math.min(rowMin[y],x);rowMax[y]=Math.max(rowMax[y],x);colMin[x]=Math.min(colMin[x],y);colMax[x]=Math.max(colMax[x],y);}
  const outside=new Uint8Array(rw*rh);
  for(let y=0;y<rh;y++)for(let x=0;x<rw;x++)outside[y*rw+x]=x>=rowMin[y]&&x<=rowMax[y]&&y>=colMin[x]&&y<=colMax[x]?0:1;
  let x0=rw,y0=rh,x1=-1,y1=-1;for(let y=0;y<rh;y++)for(let x=0;x<rw;x++)if(!outside[y*rw+x]){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  if(x0<=1||y0<=1||x1>=rw-2||y1>=rh-2)throw new Error(`${names[n]}: contour touches its board area (${x0},${y0})-(${x1},${y1}) of ${rw}x${rh}`);
  // Crop with margin; alpha 255 inside, 128 on the outermost contour pixels (one-pixel soft edge), 0 outside.
  const cx=x0-PAD,cy=y0-PAD,w=x1-x0+1+2*PAD,h=y1-y0+1+2*PAD,rgba=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=cx+x,sy=cy+y,o=(y*w+x)*4,i=at(sx,sy);rgba[o]=data[i*3];rgba[o+1]=data[i*3+1];rgba[o+2]=data[i*3+2];
   const tile=inside(sx,sy)&&!outside[sy*rw+sx];if(!tile)continue;
   const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!inside(sx+dx,sy+dy)||outside[(sy+dy)*rw+sx+dx]);rgba[o+3]=edge?128:255;}
  const png=path.join(here,'painted',names[n]+'.png'),webp=path.join(app,names[n]+'.webp');
  // Common size: the contour box is resampled to the board's size, the margin scales with it.
  const norm=NORMALIZE[board],size=norm?{width:norm.width+2*PAD,height:norm.height+2*PAD}:{width:w,height:h};
  const image=()=>{const s=sharp(rgba,{raw:{width:w,height:h,channels:4}});return norm?s.resize({...size,fit:'fill',kernel:'lanczos3'}):s;};
  await image().png({compressionLevel:9}).toFile(png);
  const shipped=!NOT_SHIPPED.has(names[n]);
  if(shipped)await image().webp({quality:90,alphaQuality:100,effort:6}).toFile(webp);
  else fs.rmSync(webp,{force:true});
  out.push({name:names[n],board,position:n+1,area:{x:rx,y:ry,width:rw,height:rh},crop:{x:rx+cx,y:ry+cy,width:w,height:h},...(norm?{size}:{}),ratio:+(size.width/size.height).toFixed(3),png:sha(png),webp:shipped?sha(webp):null});
 }
 return out;
}
(async()=>{
 fs.mkdirSync(path.join(here,'painted'),{recursive:true});fs.mkdirSync(app,{recursive:true});
 const sources=Object.fromEntries(Object.keys(boards).map(b=>['tafel-'+b+'.png',sha(path.join(here,'source','tafel-'+b+'.png'))]));
 const i=process.argv.indexOf('--board'),only=i>0?String(process.argv[i+1]??'').split(','):Object.keys(boards);
 if(only.some(b=>!boards[b]))throw new Error('--board expects one or more of: '+Object.keys(boards).join(', '));
 const kept=i>0?JSON.parse(fs.readFileSync(path.join(here,'painted-crops.json'),'utf8')).tiles.filter(t=>!only.includes(t.board)):[];
 const tiles=[...kept];for(const board of only)tiles.push(...await cut(board,boards[board]));
 tiles.sort((a,b)=>Object.keys(boards).indexOf(a.board)-Object.keys(boards).indexOf(b.board)||a.position-b.position);
 console.log(JSON.stringify({threshold:THRESHOLD,padding:PAD,sources,tiles},null,1));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
