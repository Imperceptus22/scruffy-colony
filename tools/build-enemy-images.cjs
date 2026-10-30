// Creates the app WebP files of the 85 enemy pictures from the unchanged PNG originals (V-212, user decision 27.10.2026):
// Lanczos (premultiplied alpha) to at most 400 px on the longest edge, lossy WebP quality 85 with lossless alpha. The
// pictures are shown at about 88 CSS px high (about 231 device px at DPR 2.625), so 400 px leaves room for sharper screens.
// Usage: node tools/build-enemy-images.cjs   (needs sharp; writes the WebP files and the manifest)
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..'),rel=p=>path.relative(root,p).split(path.sep).join('/');
const originals=path.join(root,'docs/design/enemy-originals'),target=path.join(root,'app/src/main/assets/game/mobile-assets/imp-family');
const MAX_EDGE=400,QUALITY=85;
const sha=data=>createHash('sha256').update(data).digest('hex');
const reference=path.join(root,'docs/design/enemy-art-2026-10-24');
const read=file=>JSON.parse(fs.readFileSync(path.join(reference,file),'utf8'));
const expected=new Map([...read('preserved-assets.json').assets.map(r=>[r.name,r.sha256]),...read('production-prompts.json').records.map(r=>[r.name,r.sourceSha256])]);

async function main(){
 const names=fs.readdirSync(originals).filter(f=>f.endsWith('.png')).map(f=>f.slice(0,-4)).sort();
 if(expected.size!==85||names.length!==85||names.some(n=>!expected.has(n)))throw new Error('expected the 85 recorded originals');
 const rows=[];
 for(const name of names){
  const source=path.join(originals,name+'.png'),raw=fs.readFileSync(source);
  if(sha(raw)!==expected.get(name))throw new Error('original changed: '+name);
  const {width,height}=await sharp(raw).metadata(),scale=Math.min(1,MAX_EDGE/Math.max(width,height));
  const size=[Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(height*scale))];
  const encoded=await sharp(raw).resize(size[0],size[1],{kernel:'lanczos3',fit:'fill'}).webp({quality:QUALITY,alphaQuality:100,effort:6,smartSubsample:true}).toBuffer();
  const decoded=await sharp(encoded).metadata();
  if(decoded.width!==size[0]||decoded.height!==size[1]||decoded.format!=='webp')throw new Error('encoded size '+name);
  const dest=path.join(target,name+'.webp');fs.writeFileSync(dest,encoded);
  rows.push({name,original:rel(source),originalSha256:sha(raw),originalBytes:raw.length,originalSize:[width,height],app:rel(dest),appSha256:sha(encoded),appBytes:encoded.length,appSize:size});
 }
 const manifest={resize:`Lanczos (premultiplied alpha), longest edge at most ${MAX_EDGE} px, aspect ratio preserved`,maxEdge:MAX_EDGE,
  encoding:`lossy WebP, quality ${QUALITY}, lossless alpha, effort 6, smart subsampling`,quality:QUALITY,sharp:sharp.versions.sharp,libvips:sharp.versions.vips,libwebp:sharp.versions.webp,
  originalBytes:rows.reduce((n,r)=>n+r.originalBytes,0),appBytes:rows.reduce((n,r)=>n+r.appBytes,0),assets:rows};
 fs.writeFileSync(path.join(root,'docs/design/enemy-image-optimization/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const {assets,...summary}=manifest;console.log(JSON.stringify(summary));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
