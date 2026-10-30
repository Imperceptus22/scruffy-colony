// Cuts plank and More plate out of header-strip.png with an alpha mask (forest and leaves removed).
// Usage: node cut-header-strip.cjs header-strip.png <out.png> [preview.png]; then WebP quality 92, alpha 100.
const sharp=require('sharp');
const [src,out,preview]=process.argv.slice(2);
(async()=>{
const {data,info}=await sharp(src).removeAlpha().raw().toBuffer({resolveWithObject:true});
const W=info.width,H=info.height,rgb=Buffer.from(data);
const at=(x,y)=>(y*W+x)*3;
const MIR=152, L=124; // clean plank starts at x152; rebuild x124..151 by mirroring
for(let y=0;y<H;y++)for(let x=L;x<MIR;x++){const s=at(2*MIR-x,y),d=at(x,y);for(let c=0;c<3;c++)rgb[d+c]=rgb[s+c];}
// burnt end: darken the outer 12px of the rebuilt end
for(let y=0;y<H;y++)for(let x=L;x<L+12;x++){const k=0.55+0.45*(x-L)/12,d=at(x,y);for(let c=0;c<3;c++)rgb[d+c]=Math.round(rgb[d+c]*k);}
const warm=(x,y)=>{const i=at(x,y),r=rgb[i],g=rgb[i+1],b=rgb[i+2];return r>60&&r>g+6&&r>b+22&&!(g>r)};
const A=new Float32Array(W*H);
// plank
const PR=1314, top=[],bot=[];
for(let x=L;x<PR;x++){let t=44;while(t>31&&warm(x,t-1))t--;let b=160;while(b<180&&warm(x,b+1))b++;top.push(t);bot.push(b);}
const med=(a,i,r)=>{const w=a.slice(Math.max(0,i-r),i+r+1).sort((p,q)=>p-q);return w[w.length>>1]};
for(let x=L;x<PR;x++){const k=x-L,t=med(top,k,9),b=med(bot,k,9);for(let y=t;y<=b;y++)A[y*W+x]=1;}
// plate: chamfered rectangle
const X0=1323,X1=1655,Y0=31,Y1=180,C=22;
for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const dx=Math.min(x-X0,X1-x),dy=Math.min(y-Y0,Y1-y);if(dx+dy>=C)A[y*W+x]=1;}
// soften the mask by one pixel
const B=new Float32Array(W*H);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const xx=x+i,yy=y+j;if(xx<0||yy<0||xx>=W||yy>=H)continue;s+=A[yy*W+xx];n++;}B[y*W+x]=A[y*W+x]?Math.min(1,s/n*1.6):0;}
const o=Buffer.alloc(W*H*4);
for(let p=0;p<W*H;p++){o[p*4]=rgb[p*3];o[p*4+1]=rgb[p*3+1];o[p*4+2]=rgb[p*3+2];o[p*4+3]=Math.round(B[p]*255);}
const img=sharp(o,{raw:{width:W,height:H,channels:4}});
await img.clone().png().toFile(out);
if(preview){await sharp({create:{width:W,height:H*2,channels:4,background:'#ff00ff'}}).composite([{input:{create:{width:W,height:H,channels:4,background:'#0b171c'}},top:H,left:0},{input:await img.clone().png().toBuffer(),top:0,left:0},{input:await img.clone().png().toBuffer(),top:H,left:0}]).png().toFile(preview);}
})();
