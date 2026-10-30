// V-195: app rendition of the Draken job portrait from the unchanged image-tool source.
// The painted figure is only 90-99 % opaque almost everywhere; alpha >= 230 becomes 255 so the wood and parchment do
// not shine through, soft edges below stay as painted. Then 384 px (the job maximum of docs/design/diorama-assets.md).
// Usage (repo root): node docs/design/diorama-jobs/export-j12-draken.cjs
const path=require('node:path'),sharp=require('sharp');
const source=path.join(__dirname,'source/J12-Draken-quelle.png');
const target=path.resolve('app/src/main/assets/game/mobile-assets/diorama/J12-Draken.webp');
(async()=>{
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=3;i<data.length;i+=4)if(data[i]>=230)data[i]=255;
 await sharp(data,{raw:info}).resize(384,384,{kernel:'lanczos3'}).webp({quality:86,alphaQuality:100,effort:6}).toFile(target);
 console.log(target,await sharp(target).metadata().then(m=>[m.width,m.height,m.hasAlpha].join(' ')));
})();
