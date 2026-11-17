import {deflateSync} from 'node:zlib';
import {writeFile} from 'node:fs/promises';

const cell={w:24,h:32},columns=16,rows=4,width=cell.w*columns,height=cell.h*rows;
const pixels=new Uint8Array(width*height*4);
const palette={
  outline:'#3b302b',skin:'#d99262',skinLight:'#f0b47f',hair:'#332b2a',
  hatDark:'#9d6c35',hat:'#d5a85f',hatLight:'#f1d58c',shirt:'#8a4f35',
  shirtLight:'#a8623f',scarf:'#4d8580',pants:'#3e4540',shoe:'#563b2b',tool:'#bc9258',metal:'#aab4aa',
};
const rgba=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255];
function rect(x,y,w,h,color){
  const value=rgba(color);
  for(let yy=Math.max(0,y);yy<Math.min(height,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(width,x+w);xx++){
    const at=(yy*width+xx)*4;pixels.set(value,at);
  }
}
function px(ox,oy,x,y,w,h,color){rect(ox+x,oy+y,w,h,color);}
function farmer(frame,direction){
  const ox=(frame%columns)*cell.w,oy=direction*cell.h,state=frame<4?'idle':frame<10?'walk':'work';
  const local=state==='idle'?frame:state==='walk'?frame-4:frame-10;
  const step=state==='walk'?[0,1,0,-1,0,1][local]:0,bob=state==='walk'&&local%3===1?-1:0;
  const work=state==='work',swing=work?[0,1,3,4,2,0][local]:0;
  const side=direction===2||direction===3,back=direction===1,flip=direction===2;
  const X=x=>flip?cell.w-x-1:x;
  const block=(x,y,w,h,color)=>side&&flip?px(ox,oy,cell.w-x-w,y,w,h,color):px(ox,oy,x,y,w,h,color);
  // shadow-free transparent sprite; all geometry stays inside the 24x32 cell.
  block(side?5:3,4+bob,side?15:18,3,palette.outline);
  block(side?6:4,2+bob,side?13:16,4,palette.hatDark);
  block(side?7:5,1+bob,side?11:14,3,palette.hat);
  block(side?9:7,0+bob,side?7:10,2,palette.hatLight);
  block(side?7:6,7+bob,side?9:12,7,palette.outline);
  if(back){block(7,7+bob,10,6,palette.hair);}
  else {
    block(side?8:7,7+bob,side?8:10,6,palette.skin);
    block(side?9:8,8+bob,side?6:8,3,palette.skinLight);
    if(!side){block(9,9+bob,1,1,palette.outline);block(14,9+bob,1,1,palette.outline);}
    else block(flip?9:14,9+bob,1,1,palette.outline);
  }
  block(side?7:6,14+bob,side?10:12,9,palette.outline);
  block(side?8:7,14+bob,side?8:10,8,palette.shirt);
  block(side?8:7,14+bob,2,7,palette.scarf);
  if(!back)block(side?9:9,14+bob,side?2:6,2,palette.scarf);
  const armY=15+bob+(work?swing:state==='walk'&&local%2?1:0);
  if(side){block(flip?4:17,armY,3,7,palette.outline);block(flip?5:17,armY+1,2,5,palette.skin);}
  else {block(3,armY,3,7,palette.outline);block(18,armY,3,7,palette.outline);block(4,armY+1,2,5,palette.skin);block(18,armY+1,2,5,palette.skin);}
  const left=state==='walk'?step:0,right=state==='walk'?-step:0;
  block(side?8:7,22+bob+left,side?4:5,7,palette.pants);block(side?12:13,22+bob+right,side?4:5,7,palette.pants);
  block(side?7:6,28+bob+left,side?5:6,3,palette.shoe);block(side?12:13,28+bob+right,side?5:6,3,palette.shoe);
  if(work){
    const toolX=flip?3:19,top=10+swing;
    block(toolX,top,2,18-top,palette.tool);
    block(flip?2:19,top,4,2,palette.metal);
  }
}
for(let direction=0;direction<rows;direction++)for(let frame=0;frame<columns;frame++)farmer(frame,direction);

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc32=data=>{let c=0xffffffff;for(const byte of data)c=crcTable[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
const chunk=(type,data)=>{
  const name=Buffer.from(type),body=Buffer.from(data),out=Buffer.alloc(12+body.length);
  out.writeUInt32BE(body.length,0);name.copy(out,4);body.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([name,body])),8+body.length);return out;
};
const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
const scan=Buffer.alloc((width*4+1)*height);
for(let y=0;y<height;y++){const at=y*(width*4+1);scan[at]=0;Buffer.from(pixels.buffer,y*width*4,width*4).copy(scan,at+1);}
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]);
await writeFile('public/pixel/characters-v1.png',png);
console.log(`Generated public/pixel/characters-v1.png (${width}x${height}, RGBA)`);
