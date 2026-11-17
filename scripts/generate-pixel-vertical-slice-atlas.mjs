import {deflateSync} from 'node:zlib';
import {writeFile} from 'node:fs/promises';

const width=384,height=128,pixels=new Uint8Array(width*height*4);
const colors={outline:'#3b302b',woodDark:'#5b3828',wood:'#8d5435',woodLight:'#bc7546',roofDark:'#873b2d',roof:'#bd5137',roofLight:'#e27549',cream:'#f0d59a',glass:'#68a4a0',soilDark:'#65442f',soil:'#946039',soilLight:'#c18a4f',leafDark:'#3f683c',leaf:'#659148',leafLight:'#91b65b',gold:'#dfad45',orange:'#db713d',white:'#eee2bd',red:'#b94839',beak:'#dda346'};
const rgba=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255];
function rect(x,y,w,h,color){const v=rgba(color);for(let yy=Math.max(0,y);yy<Math.min(height,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(width,x+w);xx++)pixels.set(v,(yy*width+xx)*4);}
function line(x,y,length,color,vertical=false){rect(x,y,vertical?1:length,vertical?length:1,color);}
function house(){
  const x=0,y=0;rect(x+10,y+28,76,45,colors.outline);rect(x+13,y+31,70,39,colors.wood);rect(x+16,y+34,64,33,colors.woodLight);
  for(let n=0;n<6;n++)line(x+16,y+39+n*5,64,colors.wood);
  rect(x+3,y+23,90,8,colors.outline);rect(x+7,y+20,82,8,colors.roofDark);
  for(let row=0;row<4;row++){const inset=row*7;rect(x+13+inset,y+5+row*5,70-inset*2,6,colors.roof);line(x+15+inset,y+6+row*5,66-inset*2,colors.roofLight);}
  rect(x+40,y+39,18,34,colors.outline);rect(x+43,y+42,12,31,colors.woodDark);rect(x+52,y+55,2,2,colors.cream);
  for(const wx of [20,66]){rect(x+wx,y+42,12,14,colors.outline);rect(x+wx+2,y+44,8,10,colors.glass);line(x+wx+6,y+44,10,colors.cream,true);line(x+wx+2,y+49,8,colors.cream);}
  rect(x+37,y+73,24,4,colors.woodDark);rect(x+34,y+77,30,3,colors.wood);rect(x+18,y+67,8,7,colors.leafDark);rect(x+20,y+64,5,5,colors.leaf);
}
function soilCell(x,y){rect(x+1,y+17,22,6,colors.soilDark);rect(x+3,y+15,18,6,colors.soil);line(x+5,y+17,14,colors.soilLight);}
function crop(kind,stage,x,y){
  soilCell(x,y);if(stage===0)return;const grow=[0,5,9,14][stage],stems=stage<2?1:3;
  for(let i=0;i<stems;i++){const sx=x+12+(i-1)*5;line(sx,y+17-grow,grow,colors.leafDark,true);
    if(grow>5){rect(sx-3,y+12-grow/2,3,2,colors.leaf);rect(sx+1,y+9-grow/2,3,2,colors.leafLight);}
    if(stage===3&&kind==='wheat'){rect(sx-1,y+1,3,6,colors.gold);rect(sx,y,1,8,colors.cream);}
    if(stage===3&&kind==='carrot'){rect(sx-2,y+14,4,5,colors.orange);rect(sx-1,y+18,2,2,colors.gold);}
    if(stage===3&&kind==='corn'){rect(sx-2,y+5,4,8,colors.gold);line(sx-1,y+6,6,colors.cream,true);}}
}
function chicken(frame,x,y){
  const state=frame<4?'idle':frame<8?'walk':'peck',local=frame%4,bob=state==='walk'&&local%2?-1:0,peck=state==='peck'?[0,2,4,2][local]:0;
  rect(x+5,y+9+bob+peck,14,10,colors.outline);rect(x+7,y+8+bob+peck,10,10,colors.white);rect(x+14,y+5+bob+peck,7,8,colors.outline);rect(x+15,y+6+bob+peck,5,6,colors.white);
  rect(x+18,y+4+bob+peck,2,3,colors.red);rect(x+20,y+9+bob+peck,3,2,colors.beak);rect(x+18,y+8+bob+peck,1,1,colors.outline);
  rect(x+3,y+10+bob,4,5,colors.outline);rect(x+8,y+12+bob+peck,6,4,colors.cream);
  const left=state==='walk'&&local%2?1:0,right=state==='walk'&&local%2?0:1;rect(x+9,y+19+bob,2,3+left,colors.beak);rect(x+15,y+19+bob,2,3+right,colors.beak);line(x+7,y+22+left,5,colors.beak);line(x+14,y+22+right,5,colors.beak);
}
house();for(const [row,kind] of ['wheat','carrot','corn'].entries())for(let stage=0;stage<4;stage++)crop(kind,stage,96+stage*24,row*24);
for(let frame=0;frame<12;frame++)chicken(frame,192+(frame%8)*24,Math.floor(frame/8)*24);
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc32=data=>{let c=0xffffffff;for(const byte of data)c=crcTable[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
const chunk=(type,data)=>{const name=Buffer.from(type),body=Buffer.from(data),out=Buffer.alloc(12+body.length);out.writeUInt32BE(body.length,0);name.copy(out,4);body.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([name,body])),8+body.length);return out;};
const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
const scan=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++){const at=y*(width*4+1);scan[at]=0;Buffer.from(pixels.buffer,y*width*4,width*4).copy(scan,at+1);}
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]);
await writeFile('public/pixel/vertical-slice-v1.png',png);console.log(`Generated public/pixel/vertical-slice-v1.png (${width}x${height}, RGBA)`);
