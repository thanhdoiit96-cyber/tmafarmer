import {cropGoal, growthGoal} from './game.mjs';
import frames from './sprite-frames.mjs';
import landscapeFrames from './landscape-frames.mjs';
import {landscapeFor} from './landscapes.mjs';
import {size} from './world-layout.mjs';

const load = source => {
  const image = new Image();
  image.src = source;
  return image;
};
const atlas = load('/ve-lang-vat-nuoi.webp');
const landscapeArt=load('/canh-quan.webp');
const surfaceArt=load('/dia-hinh.webp');
const homeArt=load('/nha-vuon.webp');
const surfaces={};
const floors=['meadow','forest','stone','lakebank'];

function mirrorTile(image,index){
  const width=420,height=250;
  const tile=document.createElement('canvas');
  tile.width=width*2;tile.height=height*2;
  const context=tile.getContext('2d');
  const sx=(index%2)*image.naturalWidth/2,sy=Math.floor(index/2)*image.naturalHeight/2;
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){
    context.save();
    context.translate(col?width*2:0,row?height*2:0);
    context.scale(col?-1:1,row?-1:1);
    context.drawImage(image,sx,sy,image.naturalWidth/2,image.naturalHeight/2,0,0,width,height);
    context.restore();
  }
  return tile;
}
export const artReady=Promise.allSettled([atlas.decode(),landscapeArt.decode(),surfaceArt.decode(),homeArt.decode()]).then(()=>{
  if(surfaceArt.naturalWidth)floors.forEach((name,index)=>surfaces[name]=mirrorTile(surfaceArt,index));
});
const dim = image => image.complete && image.naturalWidth > 0;
const {width,height}=size;
const seed=(x,y)=>((Math.imul(x+153,3577289)^Math.imul(y+5,137591))>>>0)%997/997;
function box(c,color,x,y,w,h,r=2) {
  c.fillStyle=color;
  c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
}
function ellipse(c,color,x,y,w,h,angle=0){
  c.fillStyle=color;c.beginPath();c.ellipse(x,y,w,h,angle,0,Math.PI*2);c.fill();
}
function line(c,color,w,points) {
  c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';
  c.beginPath();c.moveTo(...points[0]);
  for(const point of points.slice(1))c.lineTo(...point);
  c.stroke();
}
function shade(c,x,y,w=8,h=3) {
  c.save();
  c.translate(x+2,y+1);c.scale(1,h/w);
  const rad=c.createRadialGradient(0,0,w*.12,0,0,w);
  rad.addColorStop(0,'#332e2055');rad.addColorStop(1,'#332e2000');
  ellipse(c,rad,0,0,w,w);c.restore();
}
function sprite(c,name,x,y,w,h,flip=false,angle=0){
  if(!dim(atlas))return;
  const [sx,sy,sw,sh]=frames[name];
  c.save();c.translate(x,y);c.rotate(angle);
  if(flip)c.scale(-1,1);
  c.drawImage(atlas,sx,sy,sw,sh,-w/2,-h,w,h);
  c.restore();
}
const terrainColors={meadow:'#779453',forest:'#446b46',stone:'#bc9c73',lakebank:'#6a9570'};
const roads={
  earth:{width:21,colors:['#687649','#b49b66','#dcc49a','#ead3aa'],pebble:'#755e3b38'},
  stone:{width:19,colors:['#8a7b61','#b5a18a','#d5bc96','#e4cca3'],pebble:'#8c734943'},
  trail:{width:16,colors:['#506c44','#85905a','#beac79','#d2be8d'],pebble:'#69573d39'},
};
function texture(c,floor){
  if(!surfaces[floor])return terrainColors[floor];
  const pattern=c.createPattern(surfaces[floor],'repeat');
  pattern.setTransform(new DOMMatrix().scale(floor==='stone'?.55:.78));
  return pattern;
}
function region(c,layer){
  const {floor,points}=layer;
  const tissue=texture(c,floor);
  c.save();
  c.beginPath();c.moveTo(...points[0]);
  for(let i=1;i<=points.length;i++){
    const current=points[i%points.length],next=points[(i+1)%points.length];
    c.quadraticCurveTo(current[0],current[1],(current[0]+next[0])/2,(current[1]+next[1])/2);
  }
  c.closePath();
  c.save();
  c.filter='blur(3.5px)';
  c.fillStyle=tissue;c.globalAlpha=.90;c.fill();
  c.restore();
  c.restore();
}
function pathSet(c,paths,style){
  const {width,colors,pebble}=roads[style];
  for(let i=0;i<colors.length;i++){
    const offset=i===colors.length-1?-.65:0;
    for(const path of paths)line(c,colors[i],width+9-i*6,path.map(([x,y])=>[x,y+offset]));
  }
  for(const path of paths)for(let i=1;i<path.length;i++){
    const [a,b]=[path[i-1],path[i]];
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let n=4;n<length;n+=3.4){
      const t=n/length,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
      const d=(seed(Math.round(x),Math.round(y))-.5)*(width-1);
      const xx=x-(b[1]-a[1])/length*d,yy=y+(b[0]-a[0])/length*d;
      ellipse(c,n%3<1?'#fff0c47e':pebble,xx,yy,.40+Math.abs(d)/13,.24+Math.abs(d)/27);
      if(style==='stone'&&n%5<2)line(c,'#90775a36',.48,[[xx-2,yy+.4],[xx+.5,yy-1.1],[xx+2,yy-.8]]);
    }
  }
}
function decorativeSprite(c,item,t=0,dusk=0){
  const {kind,x,y,w,h,flip}=item;
  if(kind==='bunting'){
    const yTop=y-h;
    line(c,'#694c3a',.55,[[x-w/2,yTop],[x,yTop+7],[x+w/2,yTop]]);
    for(let i=0;i<9;i++){
      const fraction=i/8,px=x+(fraction-.5)*w,py=yTop+Math.sin(Math.PI*fraction)*7;
      c.fillStyle=['#c9694f','#edd19b','#6b9775'][i%3];
      c.beginPath();c.moveTo(px-2,py);c.lineTo(px+3,py+.4);c.lineTo(px+.5,py+5+Math.sin(t*3+i));c.closePath();c.fill();
    }
    return;
  }
  if(kind==='basket')return sprite(c,kind,x,y,w,h,flip);
  if(!dim(landscapeArt))return;
  const [sx,sy,sw,sh]=landscapeFrames[kind];
  if(kind==='lantern'&&dusk>.12){
    const light=c.createRadialGradient(x,y-h*.58,0,x,y-h*.58,14);
    light.addColorStop(0,'rgba(255,194,86,'+dusk*.63+')');light.addColorStop(1,'#ffd38600');
    ellipse(c,light,x,y-h*.58,14,14);
  }
  if(kind!=='lotus'&&kind!=='lantern') shade(c,x,y,w*.48,kind==='banyan'?w*.13:2.7);
  const sway=kind==='bamboo'?Math.sin(t*2+x)*.022:kind==='lotus'?Math.sin(t*1.2+x)*.020:0;
  c.save();c.translate(x,y);c.rotate(sway);if(flip)c.scale(-1,1);
  c.drawImage(landscapeArt,sx,sy,sw,sh,-w/2,-h,w,h);
  c.restore();
}
const railPaint={wood:['#785236','#bd8d55','#dfb27b'],white:['#827c61','#dfdacc','#f7eccf'],bamboo:['#515b36','#819356','#bcba76']};
function fence(c,{x,y,w,h,style}){
  const [dark,middle,light]=railPaint[style];
  const gap=11,middleX=x+w/2;
  const edges=[[[x,y],[x+w,y]],[[x,y],[x,y+h]],[[x+w,y],[x+w,y+h]],[[x,y+h],[middleX-gap,y+h]],[[middleX+gap,y+h],[x+w,y+h]]];
  for(const [a,b] of edges){
    for(const dy of [-4,-1]){
      line(c,dark,2.25,[[a[0],a[1]+dy],[b[0],b[1]+dy]]);
      line(c,middle,1.3,[[a[0],a[1]+dy-.4],[b[0],b[1]+dy-.4]]);
    }
    const n=Math.max(1,Math.floor(Math.hypot(a[0]-b[0],a[1]-b[1])/13));
    for(let i=0;i<=n;i++){
      const f=i/n,px=a[0]+(b[0]-a[0])*f,py=a[1]+(b[1]-a[1])*f;
      box(c,dark,px-1.4,py-6.7,3.2,8.6,.7);
      box(c,light,px-1.1,py-6.5,1.6,7.8,.5);
    }
  }
}
function drawLot(c,a){
  const {x,y,w,h,index,lot}=a;
  c.save();
  const lineColor=lot?'#f0d8a4a3':'#f6e9bd70';
  box(c,lot?'#435c382f':'#394d2b42',x,y,w,h,3);
  c.lineWidth=.9;c.strokeStyle=lineColor;
  if(!lot)c.setLineDash([3,3]);
  c.beginPath();c.roundRect(x,y,w,h,3);c.stroke();
  c.restore();
  box(c,lot?'#f2dca9':'#d5c798',x+4,y+4,13,8,1.5);
  c.fillStyle='#3d5035';c.font='bold 5px sans-serif';c.textAlign='center';
  c.fillText(String(index+1),x+10.5,y+9.8);
}
function pond(c,r){
  const {x,y,w,h}=r, mx=x+w/2,my=y+h/2;
  const grad=c.createLinearGradient(x,y,x+w,y+h);
  grad.addColorStop(0,'#76b9a0');grad.addColorStop(.45,'#489e9a');grad.addColorStop(1,'#356c79');
  if(r.shape==='rect'){
    box(c,'#5c6948',x-3,y-3,w+6,h+6,4);
    box(c,'#b8a675',x-1.5,y-1.5,w+3,h+3,3.5);
    box(c,grad,x,y,w,h,2);
    for(let i=2;i<w-2;i+=5){
      ellipse(c,i%3?'#aea980':'#d4bf90',x+i,y-.7,1.75,.7);
      ellipse(c,'#9a9a71',x+i,y+h+.4,1.55,.58);
    }
    for(let i=3;i<h-3;i+=5){
      ellipse(c,'#c4b384',x-.5,y+i,.68,1.55);
      ellipse(c,'#a3a783',x+w+.5,y+i,.78,1.45);
    }
    return;
  }
  ellipse(c,'#687654',mx,my,w/2+4,h/2+4);
  ellipse(c,'#b3a972',mx,my,w/2+2,h/2+2);
  ellipse(c,'#91a679',mx,my,w/2+.4,h/2+.3);
  ellipse(c,grad,mx,my,w/2-1,Math.max(1,h/2-1));
  if(w>90){
    c.save();c.translate(mx,my);c.scale(w/2,h/2);
    const bank=c.createRadialGradient(0,0,.48,0,0,1);
    bank.addColorStop(0,'#244e6400');bank.addColorStop(.69,'#30685b00');
    bank.addColorStop(.86,'#b4d3a331');bank.addColorStop(.95,'#d2e1af5d');bank.addColorStop(1,'#96a66d68');
    ellipse(c,bank,0,0,.994,.99);c.restore();
    for(let j=0;j<72;j++){
      const angle=seed(j,15)*Math.PI*2,radius=.19+.75*seed(j,91);
      const px=mx+Math.cos(angle)*radius*w/2,py=my+Math.sin(angle)*radius*h/2;
      const length=1.2+seed(j,w)*3.4;
      line(c,j%4?'#c0e2c12d':'#deedb966',.43,[[px-length,py],[px,py-.45],[px+length,py-.3]]);
    }
  }
  for(let i=0;i<5;i++){
    const px=x+w*(.45+Math.sin(i*2.1)*.16),py=y+h*(.50+Math.cos(i*2.1)*.22);
    ellipse(c,i%2?'#a2c1a524':'#2e625c16',px,py,w*.22,h*.11,-.05);
  }
  for(let i=0;i<Math.max(12, Math.floor(w/7));i++){
    const angle=i*2.399, rx=w/2*Math.cos(angle),ry=h/2*Math.sin(angle);
    const px=mx+rx*.95,py=my+ry*.95;
    ellipse(c,i%4?'#c2bd91':'#dfcb9d',px,py,1.25+(i%3)*.4,.7,angle);
  }
  for(let i=0;i<8;i++){
    const px=x+w*(.32+seed(i,42)*.34),py=y+h*(.26+seed(i,111)*.49);
    ellipse(c,'#648b63',px,py,2.7,1.25,i/2);
    ellipse(c,'#adbf81',px+.7,py-.25,1.7,.55,i/2);
    if(i%2===1)ellipse(c,'#e9c5a7',px,py-1,1.2,.75);
  }
}
function flower(c,x,y,type){
  line(c,'#516948',.58,[[x,y+2],[x+.3,y-2],[x+1.65,y-4]]);
  ellipse(c,'#8fa568',x+1,y+.8,1.7,.55,-.4);
  ellipse(c,'#738c57',x-.6,y-.4,1.5,.6,.55);
  ellipse(c,type?'#edc67d':'#f1e0b3',x+1.65,y-4,1.25,.98);
  ellipse(c,'#d69250',x+1.7,y-4,.43,.38);
}
export function grass(c,scene,kind,features){
  const {width,height}=scene.bounds??size;
  if(kind==='home'){
    if(dim(homeArt))c.drawImage(homeArt,0,0,width,height);
    else {
      box(c,'#b17843',0,0,width,height,0);
      box(c,'#774630',0,0,width,82,0);
      box(c,'#d6ae76',336,73,115,81,5);
      box(c,'#6f8151',340,96,107,54,3);
      box(c,'#80512c',40,84,88,50,3);
    }
    return;
  }
  const landscape=landscapeFor(kind);
  box(c,texture(c,landscape.floor),0,0,width,height,0);
  for(const layer of landscape.terrain)region(c,layer);
  box(c,landscape.tint,0,0,width,height,0);
  pathSet(c,scene.paths,landscape.road);
  for(const area of features.ground)if(area.type==='lot')drawLot(c,area);
  for(const point of features.water){
    pond(c,point);
    if(point.w<95)continue;
    const mx=point.x+point.w/2,my=point.y+point.h/2;
    for(const i of [0,1,2,3,4,5,6,7,8,9]){
      const angle=i*2.399, r=.85+seed(i,point.x)*.13;
      sprite(c,'reeds',mx+Math.cos(angle)*point.w/2*r,my+Math.sin(angle)*point.h/2*r,8+i%4*2,11+i%4*2,i%2===0);
    }
  }
  for(let i=0;i<(width*height/3250);i++){
    const x=10+seed(i,39)*(width-20),y=8+seed(i,123)*(height-20);
    const nearEdge=x<41||x>width-41||y>height-35||y<39;
    if(nearEdge){
      flower(c,x,y,i%3);
      if(i%3===0)flower(c,x+3,y-1,1);
    }
  }
  if(kind==='coop'&&!features.ground.some(a=>a.type==='fence')){
    for(let x=77;x<338;x+=15){
      box(c,'#987247',x,104,17,2.3,1);box(c,'#caa777',x,104,17,.8,.4);
      box(c,'#755337',x,101,3,10,1);box(c,'#b28d62',x+.3,101,1.5,9,.6);
    }
    for(const x of [77,337])for(let y=111;y<184;y+=9){
      box(c,'#a78452',x,y,2.2,11,1);
      if(y%2)box(c,'#725738',x-1,y,3.5,6,1);
    }
  }
  for(const area of features.ground)if(area.type==='fence')fence(c,area);
  const sun=c.createRadialGradient(width*.25,height*.12,4,width*.31,height*.18,width*.73);
  sun.addColorStop(0,'#ffe2a529');sun.addColorStop(.75,'#ffe2a500');
  box(c,sun,0,0,width,height,0);
  const vignette=c.createRadialGradient(width*.45,height*.41,width*.22,width*.49,height*.49,width*.61);
  vignette.addColorStop(0,'#283a1c00');vignette.addColorStop(1,'#293d2b3c');
  box(c,vignette,0,0,width,height,0);
}
export function water(c,scene,t,wind=1){
  for(const {x,y,w,h} of scene.water){
    const count=w>200?34:10;
    for(let i=0;i<count;i++){
      const phase=(Math.sin(t*1.65*wind+i*2.2)+1)/2;
      const px=x+w*(.21+seed(i,x)*.55),py=y+h*(.20+seed(i,y+4)*.57);
      line(c,i%2?'#e5ddad58':'#c2edda8c',.52,[[px,py],[px+2+phase*7,py],[px+4+phase*7,py-.65]]);
    }
    if(w>95){
      const fx=x+w*(.48+Math.cos(t*.41)*.19),fy=y+h*(.52+Math.sin(t*.57)*.13);
      c.save();c.globalAlpha=.36;
      sprite(c,'tilapia',fx,fy,13,8,Math.sin(t*.41)>0,Math.sin(t*.54)*.15);
      c.restore();
      const pulse=(t*.36+seed(x,y))%1;
      c.strokeStyle='rgba(214,242,209,'+(.32*(1-pulse))+')';c.lineWidth=.65;
      c.beginPath();c.ellipse(fx,fy,4+pulse*16,1.5+pulse*5,0,0,Math.PI*2);c.stroke();
    }
  }
}
export function landscapeEntity(c,item,t,daylight){
  decorativeSprite(c,item,t,Math.max(0,(daylight-.72)/.28));
}
export function landscapeLife(c,id,t){
  for(const [i,fly] of landscapeFor(id).life.entries()){
    const px=fly.x+Math.sin(t*.82+i)*11,py=fly.y+Math.cos(t*1.04+i*.8)*7;
    shade(c,px,py+5,3,.65);
    const wing=.55+Math.abs(Math.sin(t*14+i))*1.2;
    const dragon=fly.kind==='dragonfly';
    ellipse(c,dragon?'#c1f4d4a8':'#ffda86',px-1,py,wing,dragon?.52:.92,-.55);
    ellipse(c,dragon?'#adeada9b':'#f7a76b',px+1,py,wing,dragon?.52:.92,.55);
    line(c,dragon?'#34524f':'#5e4b34',.50,[[px,py-1.3],[px+.35,py+(dragon?2.2:1.0)]]);
  }
}
function plot(c,a,t,state){
  const {x,y,data,index,visit}=a;
  const wet=data&&!visit&&(data.wetUntil>state.now||state.weather.wet);
  const compact=!data&&a.compactAt<=state.now;
  const fraction=visit?(data?.ripe?1:.50):data?data.progress/cropGoal(data):0;
  const ripe=fraction>=1;
  shade(c,x,y+9,27,5);
  box(c,wet?'#674730':'#775433',x-23,y-13,46,25,4);
  const dirt=c.createLinearGradient(x,y-14,x,y+10);
  dirt.addColorStop(0,compact?'#b1926e':wet?'#846349':'#c0965d');
  dirt.addColorStop(1,compact?'#927858':wet?'#73533e':'#9e7046');
  box(c,dirt,x-22,y-13,44,23,4);
  if(compact){
    line(c,'#6e543b',1,[[x-21,y-2],[x-11,y-6],[x-5,y-1],[x+1,y-4],[x+9,y+1],[x+20,y-6]]);
    line(c,'#7a5f44',.8,[[x-11,y-6],[x-12,y-11]]);
    line(c,'#7a5f44',.8,[[x-5,y-1],[x-8,y+4],[x-4,y+9]]);
    line(c,'#7a5f44',.8,[[x+9,y+1],[x+7,y+8]]);
    return;
  }
  for(let row=0;row<3;row++){
    const py=y-9+row*7;
    line(c,wet?'#5c433584':'#75513182',1.1,[[x-19,py],[x-9,py+.4],[x+4,py],[x+17,py+.2]]);
    line(c,wet?'#b68a565a':'#e1b4779c',.65,[[x-19,py+1.4],[x-7,py+1.6],[x+4,py+1.2],[x+17,py+1.2]]);
  }
  for(let i=0;i<30;i++)ellipse(c,i%2?'#6d513854':'#eed09855',x-18+seed(i,index)*36,y-10+seed(i+91,index)*17,.26+seed(i,76)*.44,.28);
  if(!data)return;
  for(let i=0;i<8;i++){
    const px=x-16+(i%4)*10+(seed(i,index)-.5)*1.4,py=y-3+Math.floor(i/4)*8;
    const sway=Math.sin(t*3+i+y)*.7, grow=3+Math.min(fraction,1)*7+seed(i,16);
    ellipse(c,'#604a2f66',px,py+.45,2.8,.75);
    line(c,'#426139',.7,[[px,py],[px+sway*.45,py-grow*.52],[px+sway,py-grow]]);
    ellipse(c,'#608744',px+sway-1,py-grow*.51,2,.70,.43);
    ellipse(c,'#9aa858',px+sway+1.4,py-grow*.67,1.7,.68,-.45);
    if(fraction>.68){
      if(data.kind==='wheat'){
        ellipse(c,'#c78e46',px+sway,py-grow,1.37,3.2,sway*.5);
        ellipse(c,'#f2cd71',px+sway-.43,py-grow-.65,.77,2.36,sway*.5);
      } else if(data.kind==='carrot'){
        ellipse(c,'#c17038',px,py-1.3,1.85,2.2,-.32);
        ellipse(c,'#efa956',px-.3,py-1.55,1,1.5,-.32);
      } else {
        ellipse(c,'#577335',px+sway,py-grow*.65,1.91,2.8,.25);
        ellipse(c,'#e6b758',px+sway-.15,py-grow*.79,1.49,2.85,.25);
        ellipse(c,'#f6d478',px+sway-.34,py-grow*.9,.73,1.55,.25);
      }
    }
  }
  if(ripe){
    const px=x+15+Math.sin(t*1.4+index)*2,py=y-14+Math.cos(t*1.5+index)*2;
    line(c,'#ffe4a4',.65,[[px-2,py],[px+2,py]]);
    line(c,'#ffe4a4',.65,[[px,py-2],[px,py+2]]);
  }
}
function critter(c,a,t){
  const {data,index}=a;
  const large=data.kind!=='chicken',phase=t*.97+index*1.75;
  const x=a.x+Math.sin(phase)*(large?11:14),y=a.y+Math.sin(phase*.86)*4;
  const walking=Math.abs(Math.cos(phase));
  const gait=Math.abs(Math.sin(t*(large?9:15)+index))*1.7*walking;
  shade(c,x,y,large?13:8,3.8);
  const size=(data.age===undefined||data.age>=growthGoal(data))?1:.72+.28*data.age/growthGoal(data);
  sprite(c,data.kind,x,y-gait,(large?29:14)*size,(data.kind==='cow'?22:data.kind==='pig'?19:16)*size,Math.cos(phase)<0,Math.sin(t*10)*.055*walking);
}
export function person(c,x,y,direction,t,moving,style='player',action=''){
  const profile=direction==='left'||direction==='right';
  const kind=direction==='up'?'back':profile?'profile':'front';
  const scale=style==='player'?1:.83,h=31*scale,w=(profile?11:14)*scale, stride=moving?Math.sin(t*16):0;
  shade(c,x,y,11*scale,4);
  if(style==='player') {
    c.strokeStyle='#f5df9dcc';c.lineWidth=.65;c.beginPath();c.ellipse(x,y-.1,7.5,2.5,0,0,Math.PI*2);c.stroke();
  }
  if(dim(atlas)) {
    const [sx,sy,sw,sh]=frames[kind];
    const cut=Math.ceil(sh*.75),top=h*.75,bob=Math.abs(stride)*1.35;
    c.save();c.translate(x,y-bob);if(direction==='left')c.scale(-1,1);
    if(style==='vendor')c.filter='hue-rotate(-27deg) saturate(.86)';
    if(style==='trader')c.filter='hue-rotate(26deg) saturate(.82)';
    c.drawImage(atlas,sx,sy,sw,cut,-w/2,-h,w,top+.16);
    const half=Math.floor(sw/2),right=sw-half;
    const swing=profile?stride*1.65:stride*.48;
    c.drawImage(atlas,sx,sy+cut,half,sh-cut,-w/2+swing,-h+top+stride*.63,w/2,h-top);
    c.drawImage(atlas,sx+half,sy+cut,right,sh-cut,0-swing,-h+top-stride*.63,w/2,h-top);
    c.restore();
  }
  if(action==='cast'||action==='reel'){
    const sign=direction==='left'?-1:1;
    line(c,'#ddbd83',1,[[x+sign*2,y-11],[x+sign*11,y-21],[x+sign*17,y-24]]);
    line(c,'#e9dfbf99',.45,[[x+sign*17,y-24],[x+sign*19,y-10]]);
    ellipse(c,'#f4a66d',x+sign*19,y-10,1.6,1.5);
  } else if(action==='water'){
    const px=x+(direction==='left'?-8:8),py=y-11+Math.sin(t*12);
    box(c,'#bed9d0',px-2,py,5,4,1);line(c,'#9dc8c6',.85,[[px+2,py+1],[px+5,py-.8],[px+6,py-.1]]);
  } else if(action==='till'){
    const side=direction==='left'?-1:1, toolX=x+8*side, toolY=y-7+Math.sin(t*15)*3;
    line(c,'#8d6540',1.4,[[toolX-4*side,toolY-7],[toolX+3*side,toolY+1]]);
    line(c,'#c0bcb1',1.7,[[toolX+3*side,toolY+1],[toolX+6*side,toolY-2]]);
  } else if(action==='harvest'||action==='collect'||action==='steal')sprite(c,'basket',x+(direction==='left'?-8:8),y-7,8,6);
}
function neighborHouse(c,a,t){
  const {x,y,name='',tier=0,selected=false}=a;
  const width=52+tier*3.2,height=width*1.02;
  shade(c,x+3,y,width*.58,5.5+tier*.35);

  // Keep the painted house from the main farm and enrich it with matching details.
  if(tier>=1){
    box(c,'#71523d',x-width*.29,y-height*.82,5,14,1);
    box(c,'#9b744e',x-width*.31,y-height*.84,9,4,1);
  }
  c.save();
  c.filter=['saturate(.86) brightness(.96)','sepia(.08) saturate(.94)','saturate(1.02) brightness(1.02)','hue-rotate(8deg) saturate(.92) brightness(1.04)','hue-rotate(13deg) saturate(1.02) brightness(1.07)'][tier];
  sprite(c,'house',x,y,width,height);
  c.restore();

  if(tier>=1){
    box(c,'#a97748',x-width*.31,y-8,12,3,1);
    for(let i=0;i<3;i++)ellipse(c,i===1?'#f2cf70':'#d98b67',x-width*.27+i*3.5,y-10,1.4,1.8);
  }
  if(tier>=2){
    ellipse(c,'#526f47',x-width*.48,y-3,5.5,5);ellipse(c,'#719253',x-width*.50,y-6,4,4);
    ellipse(c,'#526f47',x+width*.48,y-3,5.5,5);ellipse(c,'#83a35c',x+width*.50,y-6,4,4);
    line(c,'#f1d59b',1.1,[[x-width*.40,y-height*.49],[x,y-height*.78],[x+width*.40,y-height*.49]]);
  }
  if(tier>=3){
    box(c,'#55705b',x-width*.43,y-5,4,8,1);box(c,'#55705b',x+width*.43-4,y-5,4,8,1);
    ellipse(c,'#ffd98a',x-width*.43+2,y-8,2.5,3.2);ellipse(c,'#ffd98a',x+width*.43-2,y-8,2.5,3.2);
    for(let i=-1;i<=1;i++)ellipse(c,'#f2d38b',x+i*7,y-height*.73-Math.abs(i)*2,1.1,1.1);
  }
  if(tier>=4){
    const glow=.28+Math.sin(t*2+x)*.06;
    ellipse(c,`rgba(255,226,145,${glow})`,x,y-height*.80,6,5);
    ellipse(c,'#e6bd5f',x,y-height*.80,2.6,2.6);
    line(c,'#fff0b0',.75,[[x,y-height*.84],[x,y-height*.76]]);
    line(c,'#fff0b0',.75,[[x-4,y-height*.80],[x+4,y-height*.80]]);
  }

  if(selected){
    const fullName=String(name),label=fullName.length>15?fullName.slice(0,14)+'…':fullName;
    c.save();c.font='700 6px system-ui';c.textAlign='center';
    const labelWidth=Math.min(65,c.measureText(label).width+12),labelY=y-height-8;
    box(c,'#2f493ce8',x-labelWidth*.5,labelY,labelWidth,11,4);
    c.fillStyle='#f9edc8';c.fillText(label,x,labelY+7.5);
    c.strokeStyle='#e9cf8c';c.lineWidth=.65;c.beginPath();c.roundRect(x-labelWidth*.5,labelY,labelWidth,11,4);c.stroke();c.restore();
  }
}
export function actor(c,a,t,state){
  const {x,y,type,w,style}=a;
  if(type==='dock'){
    const angle=a.side==='left'?-Math.PI/2:a.side==='right'?Math.PI/2:0;
    c.save();
    c.translate(x,y);
    c.rotate(angle);
    sprite(c,'pier',0,6,a.upgraded?26:18,a.upgraded?38:29);
    c.restore();
    if(a.data){
      const ax=a.side==='right'?x+23:a.side==='left'?x-23:x+12,ay=a.side==='up'?y-25:y-7;
      c.save();c.globalAlpha=.68;
      sprite(c,a.data.kind,ax+Math.sin(t*1.4)*5,ay+Math.cos(t)*2,14,9,false,Math.sin(t)*.16);
      c.restore();
    }
    return;
  }
  if(type==='basket-trader'){
    shade(c,x-10,y+3,7,2);
    sprite(c,'basket',x-13,y+1,10,9);
    sprite(c,'basket',x+12,y+3,9,8,true);
    const turn=Math.sin(t*.9);
    return person(c,x+turn*3,y,turn<0?'left':'right',t,t>0&&Math.abs(turn)<.45,'trader');
  }
  if(type==='order-board'){
    const width=a.upgraded?30:24;
    shade(c,x,y,width*.6,4);
    box(c,'#634632',x-width*.38,y-22,3,24,1);
    box(c,'#634632',x+width*.38-3,y-22,3,24,1);
    box(c,'#775137',x-width*.5,y-23,width,17,2);
    box(c,'#f1ddb2',x-width*.44,y-21,width*.88,12,1);
    for(let i=0;i<3;i++)line(c,'#997d56',.7,[[x-6,y-18+i*3],[x+6,y-18+i*3]]);
    if(a.upgraded)box(c,'#526c4a',x-width*.55,y-26,width*1.1,4,2);
    if(a.orders!==undefined){
      const bob=Math.sin(t*2.7)*1.4;
      ellipse(c,a.orders?'#eee1ad':'#d7ddcb',x,y-31+bob,6,5);
      c.fillStyle='#344c39';c.font='bold 7px system-ui';c.textAlign='center';
      c.fillText(String(a.orders),x,y-28.5+bob);
    }
    return;
  }
  if(type==='village-hall'){
    shade(c,x+3,y,w*.55,6);
    sprite(c,'pavilion',x,y,w,w*.82);
    box(c,'#765032',x-17,y-13,34,7,2);
    c.fillStyle='#ffebbb';c.font='600 4px system-ui';c.textAlign='center';
    c.fillText('NHÀ SINH HOẠT',x,y-8);
    return;
  }
  if(type==='plot')return plot(c,a,t,state);
  if(type==='animal'||type==='wildlife')return critter(c,a,t);
  if(type==='npc'){
    const phase=t*.65+(style==='vendor'?0:2.1);
    return person(c,x+Math.sin(phase)*6,y,Math.cos(phase)<0?'left':'right',t,t>0&&Math.abs(Math.cos(phase))>.30,style);
  }
  if(type==='tree'){
    const spread=27+seed(x,y)*12, tall=spread*.98;
    shade(c,x+5,y-1,spread*.57,6);
    return sprite(c,'tree',x,y,spread,tall,seed(y,x)>.5,Math.sin(t*1.5+y)*(state.weather.id==='wind'||state.weather.id==='storm'?.055:.022));
  }
  if(type==='neighbor')return neighborHouse(c,a,t);
  if(type==='foundation'){
    shade(c,x,y+6,41,7);box(c,'#9a855a',x-38,y-12,76,24,4);box(c,'#c2a978',x-36,y-11,72,20,3);
    for(let i=0;i<4;i++)line(c,'#9c7957a5',.65,[[x-34,y-8+i*5],[x+33,y-8+i*5]]);
    box(c,'#78583b',x-10,y-24,2,18,1);box(c,'#9b744a',x-15,y-25,27,8,2);
    box(c,'#e4bf83',x-14,y-23,25,4,1);
    return;
  }
  if(type==='silo'){
    shade(c,x,y,15,3);box(c,'#6f5737',x-13,y-10,26,11,2);box(c,'#a58052',x-12,y-9.5,24,8,2);
    line(c,'#d4b47c',1.1,[[x-11,y-7],[x+11,y-7]]);
    for(let i=0;i<11;i++)ellipse(c,'#e6bc73',x-9+i*1.65,y-9+(i%2)*1.15,1,.8);
    return;
  }
  const name=type;
  const spriteWidth=type==='house'?w*.96:type==='coop'?w*.78:type==='well'?w*1.05:w;
  const ratio=type==='well'?1.45:type==='house'||type==='neighbor'?1.02:type==='coop'?1.03:type==='barn'?.94:.84;
  shade(c,x+3,y,spriteWidth*.61,6);
  if(type==='market'&&style!=='green'||style==='visit'){
    c.save();c.filter=style==='red'?'hue-rotate(-40deg) saturate(.88)':style==='gold'?'sepia(.42) saturate(1.2)':'hue-rotate(18deg) saturate(.85)';
    sprite(c,name,x,y,spriteWidth,spriteWidth*ratio);c.restore();
  } else sprite(c,name,x,y,spriteWidth,spriteWidth*ratio);
}
export function gate(c,a,t){
  const {x,y,side}=a;
  const angle={up:0,right:Math.PI/2,down:Math.PI,left:-Math.PI/2}[side];
  c.save();c.translate(x,y);c.rotate(angle);
  const d=Math.sin(t*4)*.6;
  ellipse(c,'#fdf2caee',0,0,7,6.8);
  line(c,'#4e6544',1.3,[[0,3+d],[0,-3+d]]);
  line(c,'#4e6544',1.3,[[-2.8,-.3+d],[0,-3+d],[2.8,-.3+d]]);
  c.restore();
}
export function atmosphere(c,t,w,reduce,daylight=0){
  if(w==='rain'||w==='storm'){
    const storm=w==='storm';
    const veil=c.createLinearGradient(0,0,0,height);
    veil.addColorStop(0,storm?'#29365466':'#47698142');
    veil.addColorStop(.62,storm?'#3446654d':'#53788a2d');
    veil.addColorStop(1,storm?'#263b4b38':'#436b7130');
    box(c,veil,0,0,width,height,0);

    // Several rain planes keep the shower from looking like one flat moving grid.
    const planes=storm
      ? [[54,178,5.5,11,.34],[58,228,7.5,16,.52],[45,292,10,22,.72]]
      : [[34,125,2.5,7,.25],[37,166,3.7,10,.42],[26,215,5.5,14,.62]];
    const gust=reduce?0:Math.sin(t*.43)*1.4+Math.sin(t*.17+1.8)*.8;
    c.save();c.lineCap='round';
    planes.forEach(([count,speed,slant,length,alpha],layer)=>{
      const travel=height+length+24;
      for(let i=0;i<count;i++){
        const phase=(i*83+layer*47)%travel;
        const y=reduce?(phase%height):(phase+t*(speed+i%5*3))%travel-12;
        const lane=(i*137+layer*61)% (width+70)-35;
        const drift=reduce?0:t*(storm?34:20)+Math.sin(i*2.7+t*.55)*3;
        const x=(lane+drift)%(width+70)-20;
        const lean=slant+gust+(i%4-1.5)*.35;
        c.strokeStyle=`rgba(${layer===2?'224,242,244':'183,215,224'},${alpha})`;
        c.lineWidth=layer===2?.82:.42+layer*.12;
        c.beginPath();c.moveTo(x,y);c.lineTo(x-lean,y+length+(i%3));c.stroke();
      }
    });
    c.restore();

    if(!reduce){
      const flashPhase=t%18.2;
      if(storm&&flashPhase<.30){
        const flash=Math.sin(flashPhase/.30*Math.PI);
        box(c,`rgba(222,235,255,${flash*.24})`,0,0,width,height,0);
      }
      for(let i=0;i<(storm?19:13);i++){
        const life=(t*(storm?2.2:1.65)+i*.571)%1;
        const x=(i*97+31)%width,y=height*.39+(i*47%Math.round(height*.58));
        c.strokeStyle=`rgba(211,238,232,${.46*(1-life)})`;c.lineWidth=.46;
        c.beginPath();c.ellipse(x,y,1.2+life*5.5,.45+life*1.65,0,0,Math.PI*2);c.stroke();
      }
    }
  } else if(w==='fog'){
    box(c,'#d5e4c435',0,0,width,height,0);
    for(let i=0;i<5;i++){
      const y=24+i*61+Math.sin(t*.7+i)*17;
      const mist=c.createLinearGradient(0,y-31,0,y+31);
      mist.addColorStop(0,'#dfefd300');mist.addColorStop(.52,'#d7edda69');mist.addColorStop(1,'#dfefd300');
      box(c,mist,0,y-31,width,62,0);
    }
  } else if(w==='heat'||w==='cloud'){
    box(c,w==='heat'?'#f4b35f20':'#63818a26',0,0,width,height,0);
    if(w==='heat')for(let i=0;i<4;i++){
      const x=(i*101+57+t*4)%width;
      const ray=c.createLinearGradient(x-40,0,x+40,0);
      ray.addColorStop(0,'#fff3a300');ray.addColorStop(.5,'#fff3a320');ray.addColorStop(1,'#fff3a300');
      box(c,ray,x-40,0,80,height,0);
    }
  } else if(w==='wind'&&!reduce){
    for(let i=0;i<25;i++){
      const x=(i*57+t*(30+i%6*4))%width,y=(i*37+t*10+Math.sin(t*2+i)*13)%height;
      ellipse(c,i%2?'#e7cc82b0':'#bac982ba',x,y,2.2,.67,t*3+i);
    }
  }
  if(w==='sun'&&!reduce)for(let i=0;i<9;i++){
    const x=23+i*53+Math.sin(t*1.52+i)*12,y=31+(i*43)%218+Math.sin(t*2+i*.5)*9;
    ellipse(c,i%2?'#ffe2a3b8':'#fff1c5b8',x,y,1,.55,Math.sin(t*4+i)*.35);
  }
  const morning=Math.max(0,1-daylight/.21);
  const evening=Math.max(0,(daylight-.69)/.31);
  if(morning>.01)box(c,'rgba(247,196,114,'+morning*.13+')',0,0,width,height,0);
  if(evening>.01){
    const dusk=c.createLinearGradient(0,height,0,0);
    dusk.addColorStop(0,'rgba(218,119,79,'+evening*.20+')');dusk.addColorStop(1,'rgba(64,63,98,'+evening*.32+')');
    box(c,dusk,0,0,width,height,0);
  }
}

export function drawTask(c,x,y,style){
  shade(c,x,y,6,2.4);
  ellipse(c,'#fff5d9',x,y,6.8,6.8);
  ellipse(c,style.color,x,y,5.5,5.5);
  c.fillStyle='#fffaf1';
  c.font='bold 6.5px system-ui';
  c.textAlign='center';
  c.fillText(style.mark,x,y+2.1);
}
