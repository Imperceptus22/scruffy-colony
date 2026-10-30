// Cuts the Diorama field tiles from the approved combat concept (docs/design/diorama/reference-combat.png).
// Usage (node with sharp): node docs/design/diorama-field-tiles/cut-field-tiles.cjs > docs/design/diorama-field-tiles/crops.json
// Deterministic: per tile the painted edges are traced inside its grid box, the dark gap between tiles becomes
// alpha behind a rounded rectangle, and the result is written as a lossless working copy (PNG, here) and as the
// shipped WebP (app/src/main/assets/game/mobile-assets/diorama-field/F*.webp).
const sharp=require('sharp'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'../../..'),src=path.join(root,'docs/design/diorama/reference-combat.png');
// Superseded by cut-painted-tiles.cjs (4.28): the concept cuts are kept as style references only, so the WebP now go
// to concept-cut/ beside this script and never overwrite the shipped painted tiles.
const outPng=__dirname,outWebp=path.join(__dirname,"concept-cut");fs.mkdirSync(outWebp,{recursive:true});
// The painted 10x10 grid is a slight trapezoid: row tops are measured, column gaps interpolate between the
// measured top row (G0) and bottom row (G9).
const T=[1318,1452,1586,1724,1862,2002,2142,2282,2423,2570,2716];
const G0=[95,247,399,551,703,855,1002,1155,1306,1460,1612],G9=[53,217,381,541,699,856,1013,1171,1331,1491,1651];
const box=(r,c)=>{const g=i=>Math.round(G0[i]+(G9[i]-G0[i])*r/9);return {x0:g(c),x1:g(c+1),y0:T[r],y1:T[r+1]};};
// Concept cell (row, column) per shipped tile: the cleanest exemplar of each type, no neighbour reaching in.
const tiles=[
  ['F01-grass-a',0,7],['F02-grass-b',1,5],['F03-grass-c',1,6],
  ['F04-tree',0,6],['F05-food',0,4],['F06-ore',0,2],['F07-gems',0,5],['F08-book',0,9],['F09-gift',8,5],
  ['F10-cleared',9,0,{left:55,top:2577,right:207,bottom:2731,radius:20}],
];
// GAP: luminance of the dark wood joint between tiles (25-38) below the thin earth edge (45-75). The beaten stone
// block sits on the grid frame next to the glowing current cell, so its edges are measured by hand (fixed box).
const GAP=42,RADIUS=14,SEARCH=14,BORDER=6;
(async()=>{
  fs.mkdirSync(outWebp,{recursive:true});
  const {data,info}=await sharp(src).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const W=info.width,L=(x,y)=>{const i=(y*W+x)*3;return .3*data[i]+.59*data[i+1]+.11*data[i+2];};
  const med=a=>a.sort((p,q)=>p-q)[a.length>>1];
  const report=[];
  for(const [name,r,c,fixed] of tiles){
    const b=box(r,c),w=b.x1-b.x0,h=b.y1-b.y0;
    // Walk inward from each side of the grid box until the median of the middle half leaves the dark gap.
    const line=(fixed,from,to,horizontal)=>{const a=[];for(let t=from;t<to;t++)a.push(horizontal?L(t,fixed):L(fixed,t));return med(a);};
    const edge=(start,step,horizontal,lo,hi)=>{for(let k=0;k<SEARCH;k++){const p=start+step*k;if(line(p,lo,hi,horizontal)>GAP)return p;}throw new Error(`${name}: no tile edge within ${SEARCH}px of ${start}`);};
    const qx0=b.x0+(w>>2),qx1=b.x1-(w>>2),qy0=b.y0+(h>>2),qy1=b.y1-(h>>2);
    const {top,bottom,left,right}=fixed||{top:edge(b.y0,1,true,qx0,qx1),bottom:edge(b.y1-1,-1,true,qx0,qx1),left:edge(b.x0,1,false,qy0,qy1),right:edge(b.x1-1,-1,false,qy0,qy1)};
    const cw=right-left+1,ch=bottom-top+1,radius=fixed?.radius||RADIUS;
    // Alpha: rounded tile outline, minus joint-dark pixels in the corners (irregular painted corners).
    // Rounded rectangle with a 1px antialiased rim: distance of each pixel centre from the rounded outline.
    const inside=(x,y)=>{const dx=Math.max(radius-(x+.5),0,(x+.5)-(cw-radius)),dy=Math.max(radius-(y+.5),0,(y+.5)-(ch-radius));return Math.max(0,Math.min(1,radius+.5-Math.hypot(dx,dy)));};
    const alpha=Buffer.alloc(cw*ch);
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const near=(x<radius+BORDER||x>cw-1-radius-BORDER)&&(y<radius+BORDER||y>ch-1-radius-BORDER);alpha[y*cw+x]=near&&L(left+x,top+y)<GAP?0:Math.round(255*inside(x,y));}
    const rgb=await sharp(src).removeAlpha().extract({left,top,width:cw,height:ch}).raw().toBuffer();
    const cut=sharp(rgb,{raw:{width:cw,height:ch,channels:3}}).joinChannel(alpha,{raw:{width:cw,height:ch,channels:1}});
    const png=await cut.png({compressionLevel:9}).toBuffer();
    fs.writeFileSync(path.join(outPng,name+'.png'),png);
    await sharp(png).webp({quality:90,alphaQuality:100,effort:6}).toFile(path.join(outWebp,name+'.webp'));
    report.push({name,concept:`row ${r} column ${c}`,crop:{left,top,width:cw,height:ch}});
  }
  console.log(JSON.stringify(report,null,1));
})().catch(e=>{console.error(e);process.exitCode=1;});
