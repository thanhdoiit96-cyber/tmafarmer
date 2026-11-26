import {gardenHelperName} from './garden-helper.mjs';
import {lakeElderFrame} from './lake-elder.mjs';
import {lakeElderAtlas,lakeShelterArt} from './pixel/frames.mjs';
import {cropGoal, growthGoal} from './game.mjs';
import frames from './sprite-frames.mjs';
import {landscapeFor} from './landscapes.mjs';
import {size} from './world-layout.mjs';
import {backgroundOwnsActor,sceneBackgroundAtlases,sceneBackgrounds,sceneBackgroundTone} from './pixel/scene-backgrounds.mjs';
import {additionalLivestockAtlas,aquaticAtlas,cropStagesAtlas,farmerActionAtlas,gardenDecorAtlas,gardenHelperAtlas,livestockAtlas,maleCharacter,pixelCharacter,pixelSlice,pixelViewport,progressionCropAtlas,progressionLivestockAtlas} from './pixel/frames.mjs';
import {cropPlacement} from './pixel/crop-layout.mjs';
import {homesteadWorkshop,parcelShelter} from './pixel/homestead-buildings.mjs';
import {yardPets,yardPetPose} from './yard-pets.mjs';
import {fitGateName} from './neighbors-layout.mjs';
import {ageCharacterAtlases} from './avatar-models.mjs';
import {actionPoseSeconds,animalMotion,animalPose,fishingBobber,playerStride,spriteFlip,walkFrame} from './world-motion.mjs';

const load = source => {
  const image = new Image();
  image.src = source;
  return image;
};
const lakeElderArt=load(lakeElderAtlas.source);
const lakeShelterImage=load(lakeShelterArt.source);
const atlas = load('/ve-lang-vat-nuoi.webp');
const surfaceArt=load('/pixel/terrain-materials-v3.png');
const homesteadSoilArt=load('/pixel/scene-background-homestead-v1.png');
const parcelShelterArt=load(parcelShelter.source);
const workshopBuildingArt=load(homesteadWorkshop.source);
const parcelPondArt=load('/pixel/parcel-pond-v7.png');
const parcelGroveArt=load('/pixel/parcel-grove-v7.png');
const pondDockArt=load('/pixel/pond-dock-v5.png');
const villageWellArt=load('/pixel/village-well-v1.png');
const marketShopperArt=load('/pixel/market-shoppers-v1.png');
const marketBoardArt=load('/pixel/market-order-board-v1.png');
const neighborHomesArt=load('/pixel/neighbor-homes-v1.png');
const neighborHallArt=load('/pixel/neighbor-hall-v1.png');
const gardenFenceArt=load('/pixel/garden-fences-v1.png');
const careIconArt=load('/pixel/crop-care-icons-v1.png?v=3');
const animalTaskArt=load('/pixel/animal-task-icons-v1.png');
const drySoilArt=load('/pixel/soil-dry-v1.png');
const tillTaskArt=load('/pixel/till-task-icon-v1.png');
const plotGrassArt=load('/pixel/plot-edge-grass-v2.png');
const yardPetArt=Object.fromEntries(yardPets.filter(p=>p.source).map(p=>[p.species,load(p.source)]));
const sceneBackgroundArt=Object.fromEntries(Object.entries(sceneBackgroundAtlases).map(([key,value])=>[key,load(value.source)]));
const pixelCharacters=load(pixelCharacter.source);
const farmerWalk=load(pixelCharacter.states.walk.source);
const malePoses=load(maleCharacter.poses);
const maleWalk=load(maleCharacter.walk);
const pixelObjects=load(pixelSlice.source);
const moreCropArt=load(cropStagesAtlas.source);
const livestockArt=load(livestockAtlas.source);
const progressionLivestockArt=load(progressionLivestockAtlas.source);
const additionalLivestockArt=load(additionalLivestockAtlas.source);
const progressionCropArt=load(progressionCropAtlas.source);
const aquaticArt=load(aquaticAtlas.source);
const gardenDecorArt=load(gardenDecorAtlas.source);
const gardenHelperArt=load(gardenHelperAtlas.source);
const farmerActionArt={female:load(farmerActionAtlas.female),male:load(farmerActionAtlas.male)};
const ageCharacterArt=Object.fromEntries(Object.entries(ageCharacterAtlases).map(([key,info])=>[key,{base:load(info.base),actions:load(info.actions)}]));
const surfaces={};
const floors=['meadow','forest','stone','lakebank','wood','slate','straw','gravel'];
const terrainColors={meadow:'#7b9759',forest:'#416646',stone:'#b8a07e',lakebank:'#557d66',wood:'#9a643e',slate:'#677769',straw:'#a98a5e',gravel:'#bba278'};

function mirrorTile(image,index,name){
  const cell=128;
  const tile=document.createElement('canvas');
  tile.width=cell*2;tile.height=cell*2;
  const context=tile.getContext('2d');
  const sx=index%4*cell,sy=Math.floor(index/4)*cell;
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){
    context.save();
    context.translate(col?cell*2:0,row?cell*2:0);
    context.scale(col?-1:1,row?-1:1);
    context.drawImage(image,sx,sy,cell,cell,0,0,cell,cell);
    context.restore();
  }
  context.globalAlpha=['meadow','forest','lakebank'].includes(name)?.49:.29;
  context.fillStyle=terrainColors[name];context.fillRect(0,0,cell*2,cell*2);
  return tile;
}
export const artReady=Promise.allSettled([lakeShelterImage.decode(),lakeElderArt.decode(),tillTaskArt.decode(),drySoilArt.decode(),animalTaskArt.decode(),careIconArt.decode(),...Object.values(ageCharacterArt).flatMap(a=>[a.base.decode(),a.actions.decode()]),plotGrassArt.decode(),gardenFenceArt.decode(),neighborHomesArt.decode(),neighborHallArt.decode(),marketShopperArt.decode(),marketBoardArt.decode(),villageWellArt.decode(),atlas.decode(),surfaceArt.decode(),homesteadSoilArt.decode(),parcelShelterArt.decode(),workshopBuildingArt.decode(),parcelPondArt.decode(),parcelGroveArt.decode(),pondDockArt.decode(),...Object.values(yardPetArt).map(image=>image.decode()),...Object.values(sceneBackgroundArt).map(image=>image.decode()),pixelCharacters.decode(),farmerWalk.decode(),pixelObjects.decode(),gardenDecorArt.decode(),gardenHelperArt.decode(),farmerActionArt.female.decode(),farmerActionArt.male.decode()]).then(()=>{
  if(surfaceArt.naturalWidth)floors.forEach((name,index)=>surfaces[name]=mirrorTile(surfaceArt,index,name));
});
const dim = image => image.complete && image.naturalWidth > 0;
const {width,height}=size;
const pixelStep=width/pixelViewport.width;
const snapPixel=value=>Math.round(value/pixelStep)*pixelStep;
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
function speechLayout(c,text){
  const max=112, lines=[];
  let line='';
  for(const word of text.trim().split(/\s+/u)){
    const next=line?line+' '+word:word;
    if(c.measureText(next).width<=max){line=next;continue;}
    if(line)lines.push(line);
    line='';
    for(const char of word){
      if(c.measureText(line+char).width>max){lines.push(line);line='';}
      line+=char;
    }
  }
  if(line)lines.push(line);
  if(lines.length>3){
    const last=Array.from(lines[2]);
    while(c.measureText(last.join('')+'…').width>max)last.pop();
    lines.splice(2,lines.length-2,last.join('')+'…');
  }
  return {lines,width:Math.max(29,Math.ceil(Math.max(...lines.map(value=>c.measureText(value).width)))+12)};
}
export function drawSpeech(c,bubble,x,y,left,top,viewWidth=size.width){
  c.font='700 8px system-ui';
  c.textAlign='left';c.textBaseline='top';
  bubble.layout??=speechLayout(c,bubble.text);
  const {lines,width}=bubble.layout, height=lines.length*10+9;
  const px=snapPixel(Math.min(left+viewWidth-width-4,Math.max(left+4,x-width/2)));
  const py=snapPixel(Math.max(top+4,y-height-5));
  const tail=Math.max(px+7,Math.min(px+width-7,x));
  c.fillStyle='#fff5da';c.strokeStyle='#426349';c.lineWidth=1;
  c.beginPath();c.roundRect(px,py,width,height,5);c.fill();c.stroke();
  c.beginPath();c.moveTo(tail-3,py+height-.5);c.lineTo(tail,py+height+4);c.lineTo(tail+3,py+height-.5);
  c.fill();c.stroke();
  c.fillStyle='#263c2d';
  lines.forEach((line,index)=>c.fillText(line,px+6,py+4+index*10));
}
function sprite(c,name,x,y,w,h,flip=false,angle=0){
  const aquaticFrame=aquaticAtlas.frames[name];
  const frame=aquaticFrame??frames[name],art=aquaticFrame?aquaticArt:atlas;
  if(!frame||!dim(art))return;
  const [sx,sy,sw,sh]=frame;
  c.save();c.translate(x,y);c.rotate(angle);
  if(flip)c.scale(-1,1);
  c.drawImage(art,sx,sy,sw,sh,-w/2,-h,w,h);
  c.restore();
}
const roads={
  earth:{width:21,bank:'#63824c',rim:'#a79868',core:'#c5ac7e',floor:'gravel'},
  stone:{width:20,bank:'#758454',rim:'#a6926d',core:'#d8bc8c',floor:'stone'},
  trail:{width:16,bank:'#5e8058',rim:'#989467',core:'#c1ac80',floor:'gravel'},
};
function texture(c,floor){
  if(!surfaces[floor])return terrainColors[floor];
  const pattern=c.createPattern(surfaces[floor],'repeat');
  pattern.setTransform(new DOMMatrix().scale(['stone','gravel'].includes(floor)?.53:.75));
  return pattern;
}
function region(c,layer){
  const {floor,points}=layer;
  const tissue=texture(c,floor);
  const [first,last]=[points[0],points.at(-1)];
  c.save();
  c.beginPath();c.moveTo((first[0]+last[0])/2,(first[1]+last[1])/2);
  for(let i=0;i<points.length;i++){
    const current=points[i],next=points[(i+1)%points.length];
    c.quadraticCurveTo(current[0],current[1],(current[0]+next[0])/2,(current[1]+next[1])/2);
  }
  c.closePath();
  c.strokeStyle='#35523830';c.lineWidth=3;c.stroke();
  c.fillStyle=tissue;c.fill();
  c.restore();
}
function pathSet(c,paths,style){
  const {width,bank,rim,core,floor}=roads[style];
  for(const path of paths)line(c,bank,width+9,path);
  for(const path of paths)line(c,rim,width+3,path);
  for(const path of paths)line(c,core,width,path);
  c.save();c.globalAlpha=.64;
  const fill=texture(c,floor);
  for(const path of paths)line(c,fill,width-1,path);
  c.restore();
  for(const path of paths)for(let i=1;i<path.length;i++){
    const [a,b]=[path[i-1],path[i]];
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let n=7;n<length;n+=11){
      const t=n/length,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
      const s=seed(Math.round(x),Math.round(y)),d=(s>.5?1:-1)*(width*.53+s*3);
      const xx=x-(b[1]-a[1])/length*d,yy=y+(b[0]-a[0])/length*d;
      if(s>.32)grassClump(c,xx,yy,s);
      else pebble(c,xx,yy,1.45);
    }
  }
}
function grassClump(c,x,y,s){
  const px=snapPixel(x),py=snapPixel(y),u=pixelStep;
  c.fillStyle='#506d43';
  c.fillRect(px-2*u,py-u,5*u,2*u);
  c.fillRect(px-u,py-3*u,3*u,2*u);
  c.fillRect(px+2*u,py-(s>.5?4:3)*u,u,3*u);
  c.fillStyle='#96ad62';
  c.fillRect(px-2*u,py-2*u,u,2*u);
  c.fillRect(px,py-(s>.6?5:4)*u,u,3*u);
  c.fillRect(px+2*u,py-3*u,u,u);
}
function pebble(c,x,y,r){
  ellipse(c,'#59644b',x,y+.5,r+.55,r*.62);
  ellipse(c,'#b2ac87',x-.2,y-.15,r,r*.55);
  ellipse(c,'#d2c394',x-.4,y-.52,r*.55,r*.27);
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
  if(kind==='basket'){
    c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(w/24,h/20);
    const p=(color,px,py,pw,ph)=>{c.fillStyle=color;c.fillRect(px,py,pw,ph);};
    p('#4d3b2c',2,6,20,12);p('#a16e3d',4,7,16,9);p('#d3a05b',5,8,14,2);p('#7c5234',3,12,18,2);p('#d6a45e',4,14,16,1);p('#855531',5,16,14,2);
    p('#674832',4,4,3,3);p('#674832',17,4,3,3);p('#bd8750',6,3,12,2);
    p('#67864d',6,3,5,4);p('#a1b967',8,2,3,4);p('#c87749',14,4,4,3);p('#e6a553',15,4,2,2);
    c.restore();return;
  }
  const palette={outline:'#3f4933',leafDark:'#44613d',leaf:'#64844a',leafLight:'#91a958',leafSun:'#c1c06d',wood:'#765139',woodMid:'#a77548',woodLight:'#d1a05c',stone:'#6f7052',stoneLight:'#b2a37a',soil:'#725338'};
  c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(w/48,h/48);
  const p=(color,px,py,pw,ph)=>{c.fillStyle=color;c.fillRect(Math.round(px),Math.round(py),Math.max(1,Math.round(pw)),Math.max(1,Math.round(ph)));};
  const clump=(cx,cy,r,shade=0)=>{
    p(palette.outline,cx-r,cy-r*.45,r*2,r*.9);p(palette.leafDark,cx-r+2,cy-r*.55,r*2-4,r*.82);
    p(shade?palette.leaf:palette.leafLight,cx-r+4,cy-r*.53,r*2-9,r*.43);p(palette.leafSun,cx-r+6,cy-r*.46,r*.52,2);
  };
  if(kind==='banyan'||kind==='fruitTree'){
    p('#475039',11,42,27,3);p(palette.outline,20,24,10,19);p(palette.wood,22,24,7,18);p(palette.woodLight,23,25,2,12);
    p(palette.wood,15,29,8,3);p(palette.woodMid,12,27,5,3);p(palette.wood,27,29,7,3);p(palette.woodMid,31,27,5,3);
    clump(13,19,10);clump(25,13,12);clump(36,19,9);clump(22,23,11,true);
    p(palette.leafSun,13,14,5,2);p('#b5b968',25,8,5,2);p('#829f53',34,16,4,2);
    if(kind==='fruitTree')for(const [fx,fy] of [[16,21],[29,18],[22,13],[34,23]]){p('#8d4934',fx,fy,4,4);p('#e59b45',fx+1,fy,2,3);p('#d8bd67',fx+1,fy,1,1);}
  }else if(kind==='flowers'){
    p('#53613e',5,39,38,3);p(palette.leafDark,7,29,34,11);p(palette.leaf,8,27,9,8);p('#77964c',20,25,8,11);p(palette.leafLight,30,28,9,8);
    for(const [fx,fy,color] of [[11,25,'#e9d29a'],[20,20,'#d87557'],[31,24,'#f0d8a1'],[38,29,'#d47b5c']]){p(color,fx-2,fy,5,3);p(color,fx-1,fy-2,3,6);p('#d8a64f',fx,fy,2,2);}
    p('#d6bd75',7,38,7,2);p('#c5ae69',30,39,9,2);
  }else if(kind==='rocks'||kind==='boundary'){
    const stones=kind==='boundary'?[[4,28,10,12],[17,25,13,15],[33,29,10,11]]:[[4,29,12,12],[16,23,15,17],[31,28,13,13],[12,36,23,5]];
    for(const [sx,sy,sw,sh] of stones){p(palette.outline,sx,sy,sw,sh);p(palette.stone,sx+1,sy+1,sw-2,sh-2);p(palette.stoneLight,sx+3,sy+2,Math.max(2,sw*.42),2);p('#687552',sx+2,sy+sh-4,sw-4,2);}
    for(const [gx,gy] of [[9,27],[27,23],[39,28]]){p(palette.leafDark,gx,gy,2,8);p(palette.leafLight,gx+2,gy+2,2,6);}
    if(kind==='rocks')p('#b8a77b',7,38,5,2);
  }else if(kind==='bamboo'||kind==='reed'){
    const stems=kind==='reed'?[[10,12,4],[19,5,5],[29,9,4],[37,15,4]]:[[7,5,4],[15,1,5],[23,8,4],[32,0,5],[39,10,4]];
    p('#52603b',4,43,41,2);
    for(const [sx,sy,sw] of stems){p(palette.outline,sx-1,sy,sw+2,43-sy);p('#527146',sx,sy+1,sw,42-sy);p('#a9b760',sx+1,sy+2,1,35-sy);for(let yy=sy+8;yy<42;yy+=9)p('#394f3a',sx-1,yy,sw+2,1);}
    for(const [lx,ly,d] of [[8,13,-1],[16,17,1],[24,21,-1],[30,13,1],[38,22,-1],[21,10,1]]){p(palette.leafDark,lx,ly,12,2);p(palette.leafLight,lx+(d<0?0:10),ly-3,3,3);}
    if(kind==='reed')for(const [rx,ry] of [[19,4],[37,13]]){p('#704b39',rx,ry,3,8);p('#b77c50',rx+1,ry+1,1,5);}
  }else if(kind==='lantern'){
    p('#6a4b32',22,20,5,27);p('#b88750',23,20,2,25);p('#493c2d',14,18,22,3);p('#704a31',16,8,18,11);p('#bb8650',17,9,16,9);p('#493b2d',15,7,20,2);p('#d5ab68',18,10,13,2);p('#edb958',19,12,11,6);p('#f5d887',21,13,7,4);p('#6a492f',21,29,7,3);p('#806047',19,45,13,2);
    if(dusk>.12){c.globalAlpha=.16+dusk*.25;c.fillStyle='#f4bf65';c.fillRect(18,11,13,8);c.globalAlpha=1;}
  }else if(kind==='lotus'){
    p('#536547',5,40,39,3);p('#45634c',10,34,30,5);
    for(const [lx,ly,lw] of [[6,30,12],[16,33,14],[25,29,14],[32,35,9]]){p('#3d644d',lx,ly,lw,5);p('#79a06a',lx+2,ly+1,lw-5,2);}
    p('#47704b',20,19,2,14);p('#62884d',14,25,2,8);p('#62884d',31,22,2,11);
    for(const [fx,fy] of [[20,17],[14,24],[31,20]]){p('#d97870',fx-3,fy,8,3);p('#f0aa89',fx-2,fy-2,6,5);p('#e9c36c',fx,fy,2,2);}
    p('#b88a58',9,42,30,2);
  }else if(kind==='sapling'){
    p('#705039',16,40,17,3);p('#765139',22,20,5,21);p('#b17b45',23,21,2,17);p('#795538',13,42,5,4);p('#795538',29,42,5,4);
    clump(16,17,7);clump(26,11,8);clump(34,19,6);p('#bfbe70',24,7,4,2);
  }else if(kind==='hay'){
    p('#493e2d',8,39,33,4);p('#a66f38',7,27,18,13);p('#e0ad52',9,28,14,9);p('#f0c970',10,28,8,3);p('#925a32',22,34,18,6);p('#cc8d3f',24,31,17,9);p('#e6b450',25,32,12,4);p('#9f6734',16,19,16,11);p('#e5b64f',18,20,12,8);p('#f2ce6c',18,20,8,3);
    for(const [sx,sy] of [[11,34],[15,31],[27,37],[34,35],[21,24]])p('#86552f',sx,sy,2,1);
  }else if(kind==='farmSign'){
    p('#493b2b',12,17,27,15);p('#815438',14,18,23,12);p('#bf8a4d',15,19,21,8);p('#e0b86e',16,19,18,2);p('#785036',18,30,4,15);p('#785036',31,30,4,15);p('#b27e46',19,32,2,11);p('#b27e46',32,32,2,11);p('#7e5b3d',8,44,32,2);
    p('#57764b',5,40,6,4);p('#779950',38,40,5,4);
  }
  c.restore();
}
const railPaint={wood:['#785236','#bd8d55','#dfb27b'],white:['#827c61','#dfdacc','#f7eccf'],bamboo:['#515b36','#819356','#bcba76']};
function authoredFenceEdge(c,style,ax,ay,bx,by){
  const row=Math.max(0,['wood','white','bamboo'].indexOf(style));
  const horizontal=ay===by,length=Math.hypot(bx-ax,by-ay);
  if(length<=0)return;
  const count=Math.max(1,Math.round(length/(horizontal?50:28))),span=length/count;
  for(let i=0;i<count;i++){
    // Repeat between post centers, overlapping end caps instead of doubling posts.
    const railWidth=span/.88;
    if(horizontal)c.drawImage(gardenFenceArt,0,row*96+60,96,36,snapPixel(ax+i*span-railWidth*.06),snapPixel(ay-10.5),railWidth,10.5);
    else c.drawImage(gardenFenceArt,126,row*96,36,96,snapPixel(ax-5.25),snapPixel(ay+i*span-5),10.5,span+5);
  }
}
function fence(c,{x,y,w,h,style},front=true){
  if(dim(gardenFenceArt)){
    authoredFenceEdge(c,style,x,y,x+w,y);
    authoredFenceEdge(c,style,x,y,x,y+h);
    authoredFenceEdge(c,style,x+w,y,x+w,y+h);
    if(front)fenceFront(c,{x,y,w,h,style});
    return;
  }
  const [dark,middle,light]=railPaint[style];
  const gap=11,middleX=x+w/2;
  const edges=[[[x,y],[x+w,y]],[[x,y],[x,y+h]],[[x+w,y],[x+w,y+h]],...(front?[[[x,y+h],[middleX-gap,y+h]],[[middleX+gap,y+h],[x+w,y+h]]]:[])];
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
function fenceFront(c,{x,y,w,h,style='wood',gate=11}){
  if(dim(gardenFenceArt)){
    const middle=x+w/2,bottom=y+h;
    authoredFenceEdge(c,style,x,bottom,middle-gate,bottom);
    authoredFenceEdge(c,style,middle+gate,bottom,x+w,bottom);
    return;
  }
  const [dark,middle,light]=railPaint[style]??railPaint.wood;
  const bottom=y+h,mid=x+w/2,gap=gate;
  for(const [left,right] of [[x,mid-gap],[mid+gap,x+w]]){
    for(const dy of [-4,-1]){
      line(c,dark,2.25,[[left,bottom+dy],[right,bottom+dy]]);
      line(c,middle,1.3,[[left,bottom+dy-.4],[right,bottom+dy-.4]]);
    }
    const count=Math.max(1,Math.floor((right-left)/13));
    for(let i=0;i<=count;i++){
      const px=left+(right-left)*i/count;
      box(c,dark,px-1.4,bottom-6.7,3.2,8.6,.7);
      box(c,light,px-1.1,bottom-6.5,1.6,7.8,.5);
    }
  }
}
export function coopForeground(c,scene){
  fenceFront(c,{x:13,y:141,w:454,h:114,gate:26,style:'wood'});
}
function drawLot(c,a){
  const {x,y,w,h,index,lot}=a;
  c.save();
  if(!lot){
    // Locked land reads as a quiet grove under preparation rather than an
    // empty outlined UI card. These marks stay inside the parcel footprint.
    for(const [dx,dy,shade] of [[17,17,.55],[w-25,20,.82],[w-19,h-17,.38],[24,h-15,.69]])grassClump(c,x+dx,y+dy,shade);
    for(const [dx,dy] of [[7,7],[w-11,7],[7,h-11],[w-11,h-11]]){
      box(c,'#6d7650',x+dx,y+dy,4,4,1);box(c,'#c5b381',x+dx+1,y+dy,2,1,0);
    }
    if(dim(parcelGroveArt)){
      c.drawImage(parcelGroveArt,x+25,y+24,60,30);
      c.save();c.translate(x+w-25,y+h-13);c.scale(-1,1);
      c.drawImage(parcelGroveArt,0,-21,42,21);c.restore();
    }
  }else if(lot.kind==='empty'){
    for(const [dx,dy] of [[22,22],[w-29,h-18],[w*.51,h*.66]])grassClump(c,x+dx,y+dy,seed(index,dx));
  }
  // Quiet corner stakes leave the authored meadow visible between parcels.
  for(const px of [x+3,x+w-5]){
    box(c,'#765537',px,y+2,3,7,1);box(c,'#dfbc79',px,y+2,1,5,0);
  }
  c.restore();
  box(c,lot?'#f2dca9':'#d5c798',x+4,y+4,13,8,1.5);
  c.fillStyle='#3d5035';c.font='bold 5px sans-serif';c.textAlign='center';
  c.fillText(String(index+1),x+10.5,y+9.8);
}
function pond(c,r){
  const {x,y,w,h}=r, mx=x+w/2,my=y+h/2;
  if(r.shape==='rect'&&y>=365&&dim(parcelPondArt)){
    c.drawImage(parcelPondArt,x-5,y-5,w+10,h+10);
    return;
  }
  const grad=c.createLinearGradient(x,y,x+w,y+h);
  grad.addColorStop(0,'#80b5a2');grad.addColorStop(.45,'#559994');grad.addColorStop(1,'#396977');
  if(r.shape==='rect'){
    box(c,'#63824e',x-6,y-5,w+12,h+11,7);
    box(c,'#42684e',x-3,y-3,w+6,h+6,4);
    box(c,'#a6a176',x-1.5,y-1.5,w+3,h+3,3.5);
    box(c,grad,x,y,w,h,2);
    for(let i=2;i<w-2;i+=5){
      ellipse(c,i%3?'#aea980':'#d4bf90',x+i,y-.7,1.75,.7);
      ellipse(c,'#9a9a71',x+i,y+h+.4,1.55,.58);
    }
    for(let i=3;i<h-3;i+=5){
      ellipse(c,'#c4b384',x-.5,y+i,.68,1.55);
      ellipse(c,'#a3a783',x+w+.5,y+i,.78,1.45);
    }
    for(let dx=9;dx<w-6;dx+=14){
      const s=seed(x+dx,y);
      grassClump(c,x+dx,y+(s>.45?h+5:-4),s);
    }
    for(const dy of [8,h*.5,h-6]){
      grassClump(c,x-4,y+dy,.7);
      pebble(c,x+w+4,y+dy,1.6);
    }
    return;
  }
  ellipse(c,'#668752',mx,my,w/2+7,h/2+7);
  ellipse(c,'#4e7455',mx,my,w/2+4,h/2+4);
  ellipse(c,'#a8a078',mx,my,w/2+2,h/2+2);
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
    const bx=mx+rx+5*Math.cos(angle),by=my+ry+5*Math.sin(angle);
    if(i%4===0)pebble(c,bx,by,1.45);
    else if(i%3!==0)grassClump(c,bx,by,seed(i,w));
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
function pad(c,{floor,x,y,w,h}){
  box(c,'#38533b50',x-2,y-1,w+4,h+5,9);
  box(c,'#68834e',x-1,y-1,w+2,h+3,8);
  box(c,texture(c,floor),x,y,w,h,8);
  if(floor==='meadow')return;
  for(let dx=7;dx<w-5;dx+=12){
    const s=seed(x+dx,y);
    if(s>.37)grassClump(c,x+dx+s*2,y+(s>.65?1:h+1),s);
  }
  for(let dy=6;dy<h-5;dy+=12){
    const s=seed(x,y+dy);
    if(s>.42)grassClump(c,x+(s>.68?-1:w+1),y+dy,s);
  }
}
function gardenBed(c,area){
  pad(c,{...area,floor:'meadow'});
  for(const x of [area.x+2,area.x+area.w-2]){
    for(let dy=4;dy<area.h;dy+=9){
      const s=seed(x,area.y+dy);
      if(s>.2)grassClump(c,x,area.y+dy,s);
    }
  }
  for(let dx=9;dx<area.w-5;dx+=14)pebble(c,area.x+dx,area.y+area.h-1,1);
}
function landscapeGround(c,decor){
  for(const item of decor){
    if(!['banyan','bamboo','flowers','rocks'].includes(item.kind))continue;
    const {x,y,w,kind}=item;
    const unit=pixelStep;
    const span=Math.max(5,Math.round(w*(kind==='banyan'||kind==='bamboo'?.42:.34)/unit))*unit;
    c.fillStyle='#374b3447';c.fillRect(snapPixel(x-span/2),snapPixel(y-2*unit),span,3*unit);
    c.fillStyle='#72875355';c.fillRect(snapPixel(x-span*.31),snapPixel(y-3*unit),span*.62,unit);
    grassClump(c,x+span*.56,y,seed(x,y));
    if(kind==='banyan'||kind==='bamboo')grassClump(c,x-span*.48,y+unit,seed(y,x));
  }
}
export {backgroundOwnsActor};
export const hasSceneBackground=kind=>Object.hasOwn(sceneBackgrounds,kind);
function sceneBackground(c,kind,width,height){
  const use=sceneBackgrounds[kind];
  if(!use)return false;
  const art=sceneBackgroundArt[use.atlas];
  if(!dim(art))return false;
  c.save();
  c.imageSmoothingEnabled=true;
  // Tone down only the painted garden plate; crops and actors retain their
  // original palette. This is baked into the cached terrain, not each frame.
  if(use.atlas==='homestead')c.filter='saturate(86%) brightness(98%)';
  if(use.frame){
    const [sx,sy,sw,sh]=sceneBackgroundAtlases[use.atlas].frames[use.frame];
    c.drawImage(art,sx,sy,sw,sh,0,0,width,height);
  }else if(use.atlas==='homestead'){
    // Keep every upper-world landmark at its existing coordinates. Extending
    // the world must not stretch the house, pond or their interaction points.
    c.drawImage(art,0,0,art.naturalWidth,art.naturalHeight*380/640,0,0,820,380);
    const extension=sceneBackgroundArt.expansion;
    if(dim(extension)){
      c.drawImage(extension,0,0,extension.naturalWidth,extension.naturalHeight,0,360,820,540);
      // A short grass-only crossfade joins the authored plates, not the grid.
      c.save();c.beginPath();c.rect(0,360,820,12);c.clip();
      for(let row=0;row<12;row++){
        c.globalAlpha=1-row/12;
        c.drawImage(art,0,(360+row)*art.naturalHeight/640,art.naturalWidth,art.naturalHeight/640,0,360+row,820,1);
      }
      c.restore();
    }
  }else c.drawImage(art,0,0,art.naturalWidth,art.naturalHeight,0,0,width,height);
  c.filter='none';
  c.globalAlpha=sceneBackgroundTone.opacity;
  c.fillStyle=sceneBackgroundTone.color;
  c.fillRect(0,0,width,height);
  c.restore();
  return true;
}
function homeFloor(c){
  // Replace the old painted backdrop with a play-grid interior matching the
  // approved warm wood, muted green and upper-left light of the pixel slice.
  box(c,'#68452f',0,0,width,height,0);
  box(c,'#8c5c3b',0,0,width,98,0);
  box(c,'#684833',0,77,width,22,0);
  for(let x=8;x<width;x+=44){
    box(c,'#704a32',x,4,3,74,0);
    box(c,'#a8794d',x+3,4,1,72,0);
  }
  for(let y=12;y<77;y+=22){
    line(c,'#986b45',1,[[0,y],[width,y]]);
    line(c,'#5d402e',1,[[0,y+2],[width,y+2]]);
  }
  // Window and shutters bring daylight from the upper-left without a soft,
  // photoreal glow that would blur the pixel silhouettes.
  box(c,'#4a3529',28,13,87,59,2);
  box(c,'#bb8950',32,16,79,52,1);
  box(c,'#719264',36,20,71,43,0);
  box(c,'#a9b978',38,22,67,38,0);
  box(c,'#d8c27c',40,25,31,32,0);
  box(c,'#86a76d',73,26,31,31,0);
  for(const x of [37,43,49,55,61,67,77,83,89,95,101])box(c,'#476344',x,20,2,43,0);
  box(c,'#6c4930',69,20,3,43,0);
  for(const x of [30,105]){
    box(c,'#a66c3f',x,17,7,50,1);
    for(let y=24;y<62;y+=9)line(c,'#d3a566',1,[[x+1,y],[x+6,y+3]]);
  }
  box(c,'#d39a54',30,68,84,4,1);

  // A shallow shelf, pottery, tea basket and framed family field sketch.
  box(c,'#50392c',139,26,91,39,1);
  box(c,'#9b6940',142,28,85,34,0);
  box(c,'#b98952',140,43,89,4,0);
  box(c,'#5c402e',143,59,86,4,0);
  for(const [x,color] of [[151,'#71909a'],[166,'#c39255'],[186,'#778c6c'],[207,'#bd8051']]){
    box(c,'#4d3a2d',x,31,10,11,2);box(c,color,x+1,33,8,8,2);
    box(c,'#e0ba79',x+3,30,4,2,0);
  }
  box(c,'#4d392c',250,15,43,43,1);box(c,'#d6b275',253,18,37,37,0);
  box(c,'#94a66c',256,21,31,24,0);line(c,'#5c774f',2,[[258,42],[269,29],[284,39]]);
  box(c,'#704a31',253,48,37,3,0);

  // Open floor: individually banded plank rows, a woven mat, and a low tea table.
  box(c,texture(c,'wood'),0,98,width,190,0);
  for(let y=103,row=0;y<286;y+=13,row++){
    line(c,row%2?'#69472f':'#d09a5d',.8,[[0,y],[width,y]]);
    const offset=row%2?24:0;
    for(let x=offset;x<width;x+=72)line(c,'#704a31',.7,[[x,y],[x,y+13]]);
    line(c,'#e0ae6d55',.7,[[0,y+2],[width,y+2]]);
  }
  box(c,'#68472f',170,177,105,49,2);box(c,'#bd8d55',173,180,99,43,1);
  for(let y=184;y<221;y+=5)line(c,'#d3a56c',.7,[[174,y],[271,y]]);
  for(let x=178;x<271;x+=7)box(c,'#987044',x,181,1,41,0);
  box(c,'#86603c',178,185,89,3,0);box(c,'#86603c',178,215,89,3,0);
  box(c,'#765137',215,228,50,47,2);box(c,'#bd8d55',218,231,44,41,1);
  for(let y=234;y<269;y+=6)line(c,y%2?'#d7ad6e':'#9c7046',.8,[[220,y],[260,y]]);
  for(let x=224;x<258;x+=8)line(c,'#e2c08470',.6,[[x,233],[x,269]]);
  // Tea table stays outside the spawn and walking corridor.
  box(c,'#59402d',42,111,68,35,2);box(c,'#b87d47',39,105,70,10,2);
  box(c,'#d29a58',42,107,64,5,1);box(c,'#8a5b39',45,115,3,28,0);box(c,'#8a5b39',100,115,3,28,0);
  box(c,'#e1c18a',64,99,19,9,2);box(c,'#6d8b72',67,101,13,5,1);
  box(c,'#bd8c53',71,97,5,3,1);box(c,'#f0d89b',88,103,6,5,2);

  // Bed placement preserves the existing interaction point at (395, 165).
  shade(c,397,173,53,8);
  box(c,'#49352a',335,89,118,91,3);
  box(c,'#98623a',338,89,112,25,2);box(c,'#c28a4d',341,92,106,17,1);
  for(let x=345;x<445;x+=12)box(c,'#815333',x,93,2,15,0);
  box(c,'#62442e',340,111,108,60,2);
  box(c,'#d8c18d',344,108,101,59,3);
  box(c,'#f0dfb5',346,111,97,16,3);
  box(c,'#fff0ca',350,113,35,11,3);box(c,'#fff0ca',392,113,35,11,3);
  box(c,'#667e59',344,128,101,34,2);box(c,'#7f9868',347,131,95,27,1);
  for(let y=134;y<157;y+=7)line(c,'#9fb081',1,[[350,y],[439,y]]);
  for(let x=355;x<439;x+=14)box(c,'#536d4e',x,132,2,24,0);
  box(c,'#c49355',338,164,7,12,1);box(c,'#c49355',441,164,7,12,1);

  // Crock plant and a small lantern make the far corners feel lived in.
  shade(c,462,253,13,3);box(c,'#754a34',454,239,17,13,3);box(c,'#a96943',456,241,13,8,2);
  for(const [x,y,w] of [[460,238,9],[455,235,7],[465,232,8],[461,228,6]]){
    line(c,'#42603b',1.2,[[461,241],[x,y]]);ellipse(c,'#6d944e',x,y,w*.45,2.4,-.5);
  }
  box(c,'#61432e',24,219,8,12,2);box(c,'#e0ac54',26,216,4,8,1);box(c,'#f4d18a',27,218,2,4,0);
  box(c,'#65462f',0,276,width,12,0);box(c,'#ba8951',0,276,width,3,0);
}
function workshopFloor(c){
  box(c,'#383e36',0,0,width,height,0);
  box(c,texture(c,'slate'),25,54,430,234,3);
  box(c,'#394e426a',25,54,430,234,0);
  box(c,'#36594d',0,0,width,61,0);
  for(let x=0;x<width;x+=16)line(c,'#29483f',1,[[x,1],[x,60]]);
  for(const x of [0,22,148,316,449,472]){
    box(c,'#294439',x,0,6,63,1);
    box(c,'#638270',x+1,0,1,59,0);
  }
  for(const x of [82,394]){
    box(c,'#263f35',x-37,12,74,41,3);
    box(c,'#c4d8a5',x-32,16,64,32,2);
    box(c,texture(c,'forest'),x-30,18,60,28,1);
    line(c,'#98744d',2,[[x,16],[x,48]]);
    line(c,'#b8945d',2,[[x-32,33],[x+32,33]]);
    box(c,'#af8852',x-39,47,78,5,1);
  }
  box(c,'#b2905f',25,58,430,5,0);
  for(const x of [42,324]){
    for(const y of [77,160]){
      shade(c,x+52,y+43,62,7);
      box(c,'#503c30',x,y,114,48,3);
      box(c,texture(c,'wood'),x+3,y+3,108,36,2);
      box(c,'#c4a16e',x+2,y+3,110,3,1);
      box(c,'#7f674c',x+6,y+40,102,4,1);
    }
    for(const [dx,dy] of [[24,92],[51,98],[86,174]]){
      ellipse(c,'#5d5242',x+dx,dy+1,9,7);
      ellipse(c,'#d0a068',x+dx,dy,8,6);ellipse(c,'#65513b',x+dx,dy,2.3,1.9);
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        box(c,'#caac77',x+dx+Math.cos(a)*8-1,dy+Math.sin(a)*6-1,2,2,0);
      }
    }
    box(c,'#6e9488',x+11,169,52,22,2);
    line(c,'#d2e3c2',1,[[x+15,185],[x+24,177],[x+40,177],[x+56,184]]);
  }
  box(c,'#4e5e48',184,76,112,26,2);box(c,'#d1c394',188,79,104,20,1);
  box(c,'#698366',192,82,96,14,1);
  for(let x=198;x<284;x+=12)box(c,'#47634c',x,85,4,8,0);
  shade(c,240,126,49,6);
  box(c,'#6f5237',190,96,100,24,2);box(c,'#c2985f',188,94,104,9,1);
  box(c,'#e0b978',192,94,96,2,0);box(c,'#765338',195,105,90,3,0);
  for(const [x,color] of [[201,'#78a18a'],[220,'#d3a65e'],[251,'#748d79'],[270,'#c7794f']]){
    box(c,'#55402f',x,83,8,9,1);box(c,color,x+1,84,6,7,1);box(c,'#e7c685',x+2,82,4,2,0);
  }
  box(c,'#6d5135',205,108,6,9,1);box(c,'#b6874e',206,109,4,7,1);
  box(c,'#6d5135',269,108,6,9,1);box(c,'#7a9682',270,109,4,7,1);
  for(const [x,y] of [[231,91],[247,90],[263,91]])ellipse(c,'#f1dba1',x,y,1.5,1.5);
  box(c,'#825b3b',211,265,58,23,2);
  box(c,'#bb9360',214,267,52,3,1);
}
export function grass(c,scene,kind,features){
  const {width,height}=scene.bounds??size;
  if(sceneBackground(c,kind,width,height)){
    for(const area of features.ground)if(area.type==='lot')drawLot(c,area);
    // The main pond is painted into the plate; expansion ponds are dynamic.
    for(const area of features.water)if(area.y>=365)pond(c,area);
    for(const area of features.ground)if(area.type==='fence')fence(c,area,kind!=='field'&&kind!=='visit');
    return;
  }
  const landscape=landscapeFor(kind);
  box(c,texture(c,landscape.floor),0,0,width,height,0);
  for(const layer of landscape.terrain)region(c,layer);
  box(c,landscape.tint,0,0,width,height,0);
  landscapeGround(c,landscape.decor);
  for(const item of landscape.pads??[])pad(c,item);
  pathSet(c,scene.paths,landscape.road);
  for(const area of features.ground)if(area.type==='garden-bed')gardenBed(c,area);
  for(const area of features.ground)if(area.type==='lot')drawLot(c,area);
  for(const point of features.water){
    pond(c,point);
    if(point.w<95)continue;
    const mx=point.x+point.w/2,my=point.y+point.h/2;
    const shore=point.shape==='rect'
      ?[[point.x+7,point.y+11],[mx+10,point.y+6],[point.x+point.w-10,point.y+14],
        [point.x+point.w-7,my+6],[point.x+point.w-19,point.y+point.h-5],[point.x+12,point.y+point.h-4]]
      :Array.from({length:10},(_,i)=>{
        const angle=i*2.399,r=.85+seed(i,point.x)*.13;
        return [mx+Math.cos(angle)*point.w/2*r,my+Math.sin(angle)*point.h/2*r];
      });
    shore.forEach(([x,y],i)=>sprite(c,'reeds',x,y,8+i%4*2,11+i%4*2,i%2===0));
  }
  for(let i=0;i<(width*height/3250);i++){
    const x=10+seed(i,39)*(width-20),y=8+seed(i,123)*(height-20);
    const nearEdge=x<41||x>width-41||y>height-35||y<39;
    if(nearEdge){
      flower(c,x,y,i%3);
      if(i%3===0)flower(c,x+3,y-1,1);
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
export function drawGardenHelper(c,pose,target,reduced){
  if(!dim(gardenHelperArt))return;
  const {x,y,facing,walkDistance,action,elapsed}=pose;
  const {cellWidth,cellHeight,feet,directions,walk,work}=gardenHelperAtlas;
  const reaching=action&&(reduced||Math.floor(elapsed*4)%4!==0);
  const frame=reaching?work:!reduced&&walkDistance!==undefined?walk[walkFrame(walkDistance,24,walk.length)]:0;
  const mip=.72, top=snapPixel(y-feet*mip);
  shade(c,x,y,9,2.6);
  c.drawImage(gardenHelperArt,frame*cellWidth,directions[facing]*cellHeight,cellWidth,cellHeight,
    snapPixel(x-cellWidth*mip/2),top,cellWidth*mip,cellHeight*mip);
  c.save();
  if(action==='water'){
    const dx=reaching?6:9, dy=reaching?-15:-11;
    box(c,'#496b67',x+dx-1,y+dy,9,7,1);
    box(c,'#9bbdb1',x+dx,y+dy+1,6,4,0);
    line(c,'#c4d6bd',1.4,[[x+dx+5,y+dy+1],[x+dx+1,y+dy-4],[x+dx-2,y+dy-4]]);
    line(c,'#789fa0',2,[[x+dx,y+dy+2],[x+dx-5,y+dy-1]]);
    if(!reduced&&target&&reaching){
      for(let i=0;i<6;i++){
        const progress=(elapsed*2.5+i/6)%1;
        const px=x+(target.x-x)*progress+((i%3)-1)*3*progress;
        const py=y-16+(target.y-(y-16))*progress-Math.sin(progress*Math.PI)*7;
        box(c,i%2?'#d3f5e7':'#83cdde',snapPixel(px),snapPixel(py),1.4,1.8,0);
      }
    }
  }else if(action==='harvest'){
    box(c,'#5d412b',x+6,y-7,11,6,1);
    box(c,'#b48347',x+7,y-7,9,4,1);
    line(c,'#f4c68a',1,[[x+6,y-7],[x+9,y-11],[x+14,y-11],[x+17,y-7]]);
    if(!reduced&&target&&reaching){
      for(let i=0;i<3;i++){
        const progress=(elapsed*1.8+i/3)%1;
        const px=target.x+(x+11-target.x)*progress+i-1;
        const py=target.y-3+(y-8-(target.y-3))*progress-Math.sin(progress*Math.PI)*8;
        box(c,i%2?'#e8ac53':'#e8cc74',snapPixel(px),snapPixel(py),2,2.6,0);
      }
    }
  }
  c.font='600 6px sans-serif';
  c.textAlign='center';
  box(c,'#583b50dc',x-14,top-7,28,9,2);
  c.fillStyle='#fff4df';c.fillText(gardenHelperName,x,top-.3);
  c.restore();
}
export function drawGardenDecor(c,item,daylight){
  if(!dim(gardenDecorArt))return;
  const {kind,x,y,w,name}=item;
  const [sx,sy,sw,sh]=gardenDecorAtlas.frames[kind];
  const scale=w/sw, h=sh*scale;
  const left=snapPixel(x-w/2), top=snapPixel(y-gardenDecorAtlas.ground*scale);
  shade(c,x,y,w*.34,2.7);
  if(kind==='bambooLamp'&&daylight>.72){
    const lx=left+gardenDecorAtlas.lampCenter.x*scale, ly=top+gardenDecorAtlas.lampCenter.y*scale;
    const light=c.createRadialGradient(lx,ly,0,lx,ly,19);
    light.addColorStop(0,'#ffbe5685');
    light.addColorStop(1,'#ffd38600');
    ellipse(c,light,lx,ly,19,19);
  }
  c.drawImage(gardenDecorArt,sx,sy,sw,sh,left,top,w,h);
  if(kind==='gardenSign'&&name){
    const label=gardenDecorAtlas.signLabel;
    c.save();
    c.font='bold 6px sans-serif';
    c.textAlign='center';
    c.textBaseline='middle';
    c.fillStyle='#48311e';
    const limit=label.maxWidth*scale;
    let text=name;
    if(c.measureText(text).width>limit){
      const letters=Array.from(name);
      do{letters.pop();text=letters.join('')+'…';}while(letters.length>1&&c.measureText(text).width>limit);
    }
    c.fillText(text,left+label.x*scale,top+label.y*scale,limit);
    c.restore();
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
function plotEdgeGrass(c,{x,y,index=0}){
  if(dim(plotGrassArt)){
    const corners=[[-19,-8,14],[19,11,15],[-12,16,14],[12,16,13]];
    for(const [i,[dx,dy,width]] of corners.entries()){
      const frame=(Math.floor(seed(index,181)*4)+i)%4;
      const px=snapPixel(x+dx+(seed(index,i+193)-.5)*1.5),py=snapPixel(y+dy);
      const height=width*2/3;
      c.save();c.translate(px,py);
      if(seed(index,i+211)>.5)c.scale(-1,1);
      c.drawImage(plotGrassArt,frame*48,0,48,32,-width/2,-height,width,height);
      c.restore();
    }
    return;
  }
  // Sparse, stable accents reuse the scene's grass palette. Keep the soil center
  // clear and draw before crops so leaves and produce always remain readable.
  if(seed(index,53)>.25)grassClump(c,x-21,y+5+seed(index,97)*5,seed(index,31));
  if(seed(index,71)>.62)grassClump(c,x-13+seed(index,89)*25,y+14,seed(index,47));
}
function plotWeeds(c,{x,y,data}){
  const pressure=data?.weeds??0;
  if(pressure<5||!dim(plotGrassArt))return;
  const count=pressure>=40?3:pressure>=15?2:1;
  for(let i=0;i<count;i++){
    const dx=[-10,11,0][i],dy=[5,8,1][i];
    c.drawImage(plotGrassArt,(i%4)*48,0,48,32,snapPixel(x+dx-8),snapPixel(y+dy-10),16,11);
  }
}
function plot(c,a,t,state,paintCrops=true){
  const {x,y,data,index,visit}=a;
  const wet=data&&!visit&&(data.wetUntil>state.now||state.weather.wet);
  const compact=!data&&a.compactAt<=state.now;
  const fraction=visit?(data?.stage??(data?.ripe?3:2))/3:data?data.progress/cropGoal(data):0;
  const ripe=fraction>=1;
  if(dim(homesteadSoilArt)){
    c.save();
    c.beginPath();c.roundRect(x-20,y-13,40,26,4);c.clip();
    c.imageSmoothingEnabled=false;
    if(compact&&dim(drySoilArt))c.drawImage(drySoilArt,0,0,64,42,x-20,y-13,40,26);
    else c.drawImage(homesteadSoilArt,416,139,66,48,x-20,y-13,40,26);
    if(wet){c.fillStyle='#30281d55';c.fillRect(x-20,y-13,40,26);}
    if(compact&&!dim(drySoilArt)){
      c.fillStyle='#c9b58a66';c.fillRect(x-20,y-13,40,26);
      line(c,'#6e543b',1,[[x-15,y-5],[x-6,y],[x+2,y-4],[x+12,y+3]]);
    }
    c.restore();
    plotEdgeGrass(c,a);
    plotWeeds(c,a);
    if(!paintCrops||!data)return;
  }
  shade(c,x,y+9,27,5);
  box(c,wet?'#674730':'#775433',x-23,y-13,46,25,4);
  const dirt=c.createLinearGradient(x,y-14,x,y+10);
  dirt.addColorStop(0,compact?'#b1926e':wet?'#846349':'#c0965d');
  dirt.addColorStop(1,compact?'#927858':wet?'#73533e':'#9e7046');
  box(c,dirt,x-22,y-13,44,23,4);
  plotEdgeGrass(c,a);
  plotWeeds(c,a);
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
  for(let i=0;paintCrops&&i<8;i++){
    const px=x-15+(i%4)*10,py=y-5+Math.floor(i/4)*9;
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
      } else if(data.kind==='corn'){
        ellipse(c,'#577335',px+sway,py-grow*.65,1.91,2.8,.25);
        ellipse(c,'#e6b758',px+sway-.15,py-grow*.79,1.49,2.85,.25);
        ellipse(c,'#f6d478',px+sway-.34,py-grow*.9,.73,1.55,.25);
      } else if(data.kind==='tomato'){
        ellipse(c,'#c94f3f',px+sway-1.4,py-grow*.58,1.8,1.8);
        ellipse(c,'#e06a4d',px+sway+1.4,py-grow*.72,1.7,1.7);
      } else if(data.kind==='sunflower'){
        ellipse(c,'#e8bd48',px+sway,py-grow,3.1,3.1);ellipse(c,'#765038',px+sway,py-grow,1.4,1.4);
      } else if(data.kind==='strawberry'){
        ellipse(c,'#d85355',px+sway-1,py-grow*.48,1.5,2);ellipse(c,'#ee7770',px+sway+1.5,py-grow*.62,1.4,1.8);
      } else if(data.kind==='grape'){
        for(let n=0;n<5;n++)ellipse(c,n%2?'#79548d':'#9670a5',px+sway+(n%2)*1.5,py-grow*.72+n*.75,1.25,1.25);
      } else if(data.kind==='coffee'){
        ellipse(c,fraction>.86?'#c54d3e':'#6d9b55',px+sway-1.3,py-grow*.55,1.35,1.7);
        ellipse(c,fraction>.86?'#e8754e':'#8bb868',px+sway+1.1,py-grow*.67,1.2,1.6);
      } else if(data.kind==='lotus'){
        ellipse(c,'#7f9f57',px+sway,py-grow*.58,3.1,1.1,-.15);
        if(fraction>.86){ellipse(c,'#e79a9d',px+sway,py-grow,2.1,1.7);ellipse(c,'#ffe0bd',px+sway,py-grow,1,1.2);}
      } else if(data.kind==='dragonfruit'){
        ellipse(c,'#537e4e',px+sway,py-grow*.64,2.7,1.1,-.1);
        if(fraction>.86){ellipse(c,'#d84f72',px+sway,py-grow*.85,1.8,2.1);line(c,'#8eaa61',.65,[[px+sway-1.1,py-grow*1.02],[px+sway-1.8,py-grow*1.28],[px+sway-.5,py-grow*1.14]]);}
      } else if(data.kind==='blackRice'){
        ellipse(c,'#675079',px+sway,py-grow,1.35,3.1,sway*.5);
        ellipse(c,'#b38bb2',px+sway-.5,py-grow-.65,.72,2.2,sway*.5);
      } else {
        ellipse(c,'#66834e',px+sway,py-grow*.65,3.2,1.3,.2);ellipse(c,'#91a766',px+sway,py-grow*.82,2.7,1.1,-.2);
      }
    }
  }
  if(ripe){
    const px=x+15+Math.sin(t*1.4+index)*2,py=y-14+Math.cos(t*1.5+index)*2;
    line(c,'#ffe4a4',.65,[[px-2,py],[px+2,py]]);
    line(c,'#ffe4a4',.65,[[px,py-2],[px,py+2]]);
  }
}
function animalScale(data){
  return data.age===undefined?1:.72+.28*Math.min(1,data.age/growthGoal(data));
}
const animalSizes={chicken:[16,15],duck:[21,17],quail:[23,21],pig:[35,24],cow:[42,29],buffalo:[47,33],goat:[36,31],sheep:[38,33],goose:[31,27],rabbit:[26,23]};
function critter(c,a,t){
  const {data,index=0}=a;
  const visual=data.kind;
  const additionalFrame=additionalLivestockAtlas.frames[visual];
  const progressionFrame=progressionLivestockAtlas.frames[visual];
  const livestockFrame=progressionFrame??livestockAtlas.frames[visual];
  const art=additionalFrame?additionalLivestockArt:progressionFrame?progressionLivestockArt:livestockFrame?livestockArt:atlas;
  if(!dim(art))return;
  const large=!['chicken','duck','quail'].includes(visual);
  const rabbit=visual==='rabbit';
  const motion=a.motion??(a.roam===0?{offset:0,facing:1,state:'idle',elapsed:0,distance:0}:animalMotion(t,index,a.roam??(large?11:15),rabbit?'idle':large?'graze':'peck'));
  const walking=motion.state==='walk';
  const phase=motion.distance/(large?9:7.5)*Math.PI*2;
  const step=Math.sin(phase);
  const foraging=motion.state==='graze'||motion.state==='peck';
  const bend=foraging ? .5-.5*Math.cos(motion.elapsed*(large?4.7:9.3)) : 0;
  const size=animalScale(data)*(a.visualScale??1),[width,height]=animalSizes[data.kind];
  const w=width*size,h=height*size;
  const x=snapPixel(a.x+(motion.offset??0)),y=snapPixel(a.y);
  const [sx,sy,sw,sh]=additionalFrame??livestockFrame??frames[visual];
  const poses=additionalLivestockAtlas.poses[visual]??progressionLivestockAtlas.poses[visual];
  if(poses){
    const [px,py,pw,ph]=poses[animalPose(motion,large?9:7.5)];
    const bob=walking?Math.abs(step)*.35*size:Math.sin((foraging?motion.elapsed:t)*2.2+index)*.22*size;
    shade(c,x,y,w*.48,walking?3.2:3.8);
    c.save();
    c.translate(x,y);
    if(spriteFlip(motion.facing,1))c.scale(-1,1);
    c.drawImage(art,px,py,pw,ph,-w/2,snapPixel(-h-bob),w,h);
    c.restore();
    return;
  }
  const cut=Math.round(sh*(livestockAtlas.legStart[visual]??(large?.72:.79))), body=h*cut/sh;
  const half=Math.floor(sw/2), split=w*half/sw;
  const bob=Math.abs(step)*(large?.48:.7)*size;
  shade(c,x,y,w*.48,walking?3.2:3.8);
  c.save();
  c.translate(x,y);
  if(spriteFlip(motion.facing,1))c.scale(-1,1);
  if(rabbit&&walking){
    const hop=Math.max(0,Math.sin(phase))*3.5*size;
    c.drawImage(art,sx,sy,sw,sh,-w/2,snapPixel(-h-hop),w,h);
  } else if(walking){
    // Keep one leg group on the ground while the other group lifts and swings.
    const backLift=Math.max(0,step)*1.3*size,frontLift=Math.max(0,-step)*1.3*size;
    const swing=step*1.4*size;
    c.drawImage(art,sx,sy+cut,half,sh-cut,-w/2+swing,-h+body-bob,split,h-body+bob-backLift);
    c.drawImage(art,sx+half,sy+cut,sw-half,sh-cut,-w/2+split-swing,-h+body-bob,w-split,h-body+bob-frontLift);
    c.drawImage(art,sx,sy,sw,cut,-w/2,-h-bob,w,body+.2);
  } else if(bend){
    c.drawImage(art,sx,sy+cut,sw,sh-cut,-w/2,-h+body,w,h-body);
    c.translate(0,-h+body);
    c.rotate(bend*(large?.12:.29));
    c.drawImage(art,sx,sy,sw,cut,-w/2,-body,w,body+.4);
  } else {
    c.drawImage(art,sx,sy,sw,sh,-w/2,-h,w,h);
  }
  c.restore();
}
function legacyPerson(c,x,y,direction,t,moving,style,walkDistance){
  const profile=direction==='left'||direction==='right';
  const kind=direction==='up'?'back':profile?'profile':'front';
  const scale=style==='player'?1:.83,h=31*scale,w=(profile?11:14)*scale;
  const bob=moving?Math.abs(Math.sin(walkDistance/playerStride*Math.PI*2))*.65:Math.sin(t*2.15)*.32;
  shade(c,x,y,11*scale,3.8);
  c.save();
  if(style==='vendor')c.filter='hue-rotate(-27deg) saturate(.86)';
  if(style==='trader')c.filter='hue-rotate(26deg) saturate(.82)';
  sprite(c,kind,x,y-bob,w,h,direction==='left');
  c.restore();
}
function personTool(c,x,y,direction,t,action){
  if(action==='plant'){
    const px=x+(direction==='left'?-7:7),py=y-13+Math.sin(t/actionPoseSeconds.plant*Math.PI)*3;
    box(c,'#745138',px-3,py-2,6,6,1);
    box(c,'#d9b07a',px-2,py-1,4,4,1);
    line(c,'#f5dfa5',.8,[[px-2,py],[px+2,py]]);
  } else if(action==='water'){
    const px=x+(direction==='left'?-8:8),py=y-11+Math.sin(t*12);
    box(c,'#bed9d0',px-2,py,5,4,1);line(c,'#9dc8c6',.85,[[px+2,py+1],[px+5,py-.8],[px+6,py-.1]]);
  } else if(action==='till'){
    const side=direction==='left'?-1:1, toolX=x+8*side, toolY=y-7+Math.sin(t*15)*3;
    line(c,'#8d6540',1.4,[[toolX-4*side,toolY-7],[toolX+3*side,toolY+1]]);
    line(c,'#c0bcb1',1.7,[[toolX+3*side,toolY+1],[toolX+6*side,toolY-2]]);
  } else if(action==='harvest'||action==='collect'||action==='steal')sprite(c,'basket',x+(direction==='left'?-8:8),y-7,8,6);
}
export function drawFishing(c,x,y,dock,{action,elapsed,ambient,bite,caught,reduced}){
  const phase=action==='hold'?1:Math.min(1,elapsed/actionPoseSeconds[action]);
  const reach=action==='cast'?.25+.75*phase:action==='reel'?1-.72*phase:1;
  const dir=dock.side==='left'?-1:1;
  const lift=action==='cast'?-Math.sin(phase*Math.PI)*12:action==='reel'?-Math.sin(phase*Math.PI*.8)*15:0;
  const hand=[x+dir*8,y-15], tip=[x+dir*(dock.side==='up'?17:20),y-27+lift];
  const origin=fishingBobber(dock);
  const bob=action==='hold'&&!reduced?(bite?Math.abs(Math.sin(ambient*7))*2.5:Math.sin(ambient*3)) : 0;
  const px=snapPixel(tip[0]+(origin.x-tip[0])*reach);
  const py=snapPixel(tip[1]+(origin.y-tip[1])*reach+bob-
    (action==='cast'?Math.sin(phase*Math.PI)*10:action==='reel'?Math.sin(phase*Math.PI)*12:0));
  line(c,'#573e29',2.4,[hand,tip]);
  line(c,'#e8bb77',1.1,[hand,tip]);
  line(c,'#f7e7bc',.75,[tip,[snapPixel((tip[0]+px)/2),snapPixel((tip[1]+py)/2+2)],[px,py]]);
  c.fillStyle='#663f2f';c.fillRect(px-2,py-1.5,4,3.75);
  c.fillStyle='#ff8d60';c.fillRect(px-1.5,py-1.5,3,2.25);
  c.fillStyle='#fff1c7';c.fillRect(px-.75,py-2.25,1.5,1.5);
  if(action==='hold'||action==='cast'&&phase>.72||action==='reel'&&phase<.47){
    const ripple=reduced?5:action==='hold'?4+(ambient*10)%5:5+phase*5;
    c.strokeStyle=bite?'#fff0b5':'#bce6dd';c.lineWidth=.75;
    c.beginPath();c.ellipse(origin.x,origin.y+1,ripple,ripple*.36,0,0,Math.PI*2);c.stroke();
  }
  if(action==='reel'&&caught&&phase>.15&&phase<.92){
    line(c,'#9bdfd2',2.3,[[px-3,py-3],[px+2,py-3]]);
    line(c,'#d1edd4',1.4,[[px+2,py-3],[px+5,py-5],[px+5,py-1],[px+2,py-3]]);
  }
}
export function drawPerson(c,x,y,direction,t,{avatar='female',walking=false,walkDistance=0,style='player',action='',elapsed=0,stride=playerStride}={}){
  const variant=ageCharacterArt[avatar];
  if(variant&&dim(variant.base)&&dim(variant.actions)){
    const row=pixelCharacter.directions[direction]??0;
    const actionType=['water','fertilize','spray','plant'].includes(action)?action:
      action==='harvest'||action==='collect'?'harvest':action==='feed'?'feed':'';
    const work=action==='till'||action==='weed',info=ageCharacterAtlases[avatar];
    const phase=Math.min(3,Math.floor(Math.min(1,elapsed/(actionPoseSeconds[action]??.85))*4));
    const frame=actionType?farmerActionAtlas[actionType].first+phase:work?info.work+phase:
      walking?info.walk+walkFrame(walkDistance,stride,4):info.idle+Math.floor(t*3)%4;
    const scale=style==='player'||style==='peer'?1:.875,unit=pixelStep*scale;
    const px=snapPixel(x),py=snapPixel(y);
    shade(c,px,py,10.5*scale,3.5);
    c.drawImage(actionType?variant.actions:variant.base,frame*48,row*64,48,64,
      snapPixel(px-24*unit),snapPixel(py-59*unit),48*unit,64*unit);
    // Fishing/eating retain the existing small props; authored care poses already
    // contain both hands and their tool, so never add extra arms over them.
    if(!actionType&&!work)personTool(c,px,py,direction,elapsed,action);
    return;
  }
  if(!dim(pixelCharacters)){
    legacyPerson(c,x,y,direction,t,walking,style,walkDistance*playerStride/stride);
    personTool(c,x,y,direction,elapsed,action);
    return;
  }
  const work=action==='till';
  const male=avatar==='male'&&dim(malePoses);
  const walkAtlas=male?maleWalk:farmerWalk;
  const actionType=['water','fertilize','spray','plant'].includes(action)?action:
    action==='harvest'||action==='collect'?'harvest':action==='feed'?'feed':'';
  const actionAtlas=actionType&&dim(farmerActionArt[avatar==='male'?'male':'female'])?
    farmerActionArt[avatar==='male'?'male':'female']:null;
  const moving=walking&&!work&&dim(walkAtlas);
  const {cellWidth,cellHeight,directions,states}=pixelCharacter;
  const anim=states[work?'work':moving?'walk':'idle'];
  const actionSequence=actionAtlas?Math.min(farmerActionAtlas[actionType].frames-1,
    Math.floor(Math.min(1,elapsed/actionPoseSeconds[action])*farmerActionAtlas[actionType].frames)):0;
  const step=moving?walkFrame(walkDistance,stride,anim.frames):Math.floor((work?elapsed:t)*anim.fps);
  const sequence=work?Math.min(anim.frames-1,step):step%anim.frames;
  const frame=actionAtlas?farmerActionAtlas[actionType].first+actionSequence:
    male?(moving?sequence:work?maleCharacter.workFrames[sequence]:0):anim.first+sequence;
  const atlas=actionAtlas??(moving?walkAtlas:male?malePoses:pixelCharacters);
  const row=directions[direction]??0;
  const px=snapPixel(x),py=snapPixel(y);
  const standing=style==='player'||style==='peer';
  const scale=standing?1:.875;
  shade(c,px,py,10.5*scale,walking?3.2:3.8);
  c.save();c.imageSmoothingEnabled=false;
  if(style==='vendor')c.filter='hue-rotate(-27deg) saturate(.86)';
  if(style==='trader')c.filter='hue-rotate(26deg) saturate(.82)';
  const unit=pixelStep*scale;
  const left=px-cellWidth/2*unit,top=py-59*unit;
  if(action==='plant'){
    const lean=Math.sin(Math.min(1,elapsed/actionPoseSeconds.plant)*Math.PI)*.075;
    c.translate(px,py);c.rotate(direction==='left'?-lean:lean);c.translate(-px,-py);
  }
  c.drawImage(atlas,frame*cellWidth,row*cellHeight,cellWidth,cellHeight,
    snapPixel(left),snapPixel(top),cellWidth*unit,cellHeight*unit);
  c.restore();
  if(!work&&!actionAtlas)personTool(c,px,py,direction,elapsed,action);
}
function pixelHouse(c,x,y,w,h=w*pixelSlice.house.h/pixelSlice.house.w){
  const frame=pixelSlice.house;
  c.drawImage(pixelObjects,frame.x,frame.y,frame.w,frame.h,snapPixel(x-w/2),snapPixel(y-h),w,h);
}
function drawAtlasActor(c,a,t,state){
  if(!dim(pixelObjects))return false;
  const px=snapPixel(a.x),py=snapPixel(a.y);
  if(a.type==='house'){
    shade(c,px,py,a.w*.5,5);
    c.save();
    if(a.style==='visit')c.filter='hue-rotate(12deg) saturate(.9)';
    pixelHouse(c,px,py,a.w,a.h);
    c.restore();
    return true;
  }
  if(a.type==='plot'){
    const crop=cropPlacement(a);
    const source=crop?.source===progressionCropAtlas.source?progressionCropArt:crop?.source===cropStagesAtlas.source?moreCropArt:pixelObjects;
    if(crop&&!crop.procedural&&dim(source)){
      plot(c,a,t,state,false);
      c.drawImage(source,crop.sx,crop.sy,crop.w,crop.h,crop.x,crop.y,crop.width,crop.height);
      return true;
    }
  }
  return false;
}
function pixelSceneBuilding(c,a){
  const {x,y,type,style=''}=a;
  const width=type==='market'?a.w:type==='coop'?a.w*.78:type==='well'?a.w*1.05:type==='pavilion'?a.w:a.w;
  const height=type==='market'?width*.72:type==='coop'?width*.70:type==='well'?width*1.35:type==='pavilion'?width*.78:width*.78;
  c.save();c.translate(snapPixel(x),snapPixel(y));c.scale(width/64,height/52);
  const p=(color,px,py,pw,ph)=>{c.fillStyle=color;c.fillRect(px,py,pw,ph);};
  const linePx=(color,px,py,pw,ph)=>p(color,px,py,pw,ph);
  const roof=style==='red'?'#b9563e':style==='green'?'#62805b':style==='gold'?'#c7954f':type==='coop'?'#bc8b4e':'#994d3b';
  const roofLight=style==='green'?'#b9c37b':style==='gold'?'#e5c16c':'#e0a15a';
  const wood='#674531',woodMid='#a87548',woodLight='#d0a05e',wall='#d4b878';
  c.fillStyle='#302e2850';c.fillRect(5,48,55,4);
  if(type==='well'){
    p(wood,8,4,4,35);p(woodLight,10,5,1,31);p(wood,52,4,4,35);p(woodLight,53,5,1,31);
    p(wood,5,3,58,4);p(roof,10,1,44,4);p(roofLight,14,2,35,1);
    p('#78644c',13,34,38,13);p('#b0a07a',14,35,36,10);p('#7b765d',16,37,32,6);
    for(let bx=17;bx<48;bx+=8){p('#d0bd8a',bx,36,4,3);p('#837858',bx+1,40,4,3);}
    p('#477d79',20,40,24,3);p('#8bb8a1',22,40,13,1);
    p(wood,27,14,2,23);p('#c49a5d',28,15,1,19);p('#a97847',26,29,12,4);p('#e3bf77',27,30,10,2);
  }else if(type==='market'){
    const awning=style==='red'?'#c8654d':style==='green'?'#658765':'#d1a254';
    p(wood,5,36,54,4);p(woodLight,7,37,50,2);p(wood,10,22,3,17);p(wood,51,22,3,17);
    p('#543e30',6,17,53,20);p(wall,8,19,49,15);
    p(wood,4,12,56,7);p(roof,8,7,48,6);p(awning,8,13,48,8);
    for(let bx=8;bx<56;bx+=12){p('#f2dfa8',bx,13,6,7);p(wood, bx+6,13,2,7);}
    p('#6b4a32',9,30,46,5);p('#be884e',10,29,44,3);
    for(const [bx,color] of [[13,'#9c643b'],[25,'#6e8b53'],[38,'#bd6b4c'],[48,'#d4b267']]){
      p('#51402f',bx,25,8,7);p(color,bx+1,24,6,6);p('#f0d79b',bx+2,24,3,2);
    }
  }else if(type==='pavilion'){
    p(wood,7,13,50,8);p(roof,3,9,58,5);p(wood,9,14,46,3);p(roofLight,8,8,48,2);
    for(let bx=7;bx<58;bx+=10){p(roofLight,bx,9,3,2);p('#693e31',bx+3,9,2,3);}
    p('#795338',11,19,4,26);p(woodLight,12,19,1,24);p('#795338',49,19,4,26);p(woodLight,50,19,1,24);
    p('#80603e',7,44,50,3);p('#c49b5e',8,45,48,2);p('#b2a17a',16,33,32,2);
    p('#426650',16,37,32,7);p('#bb8950',21,36,3,8);p('#bb8950',40,36,3,8);
  }else{
    const isCoop=type==='coop';
    p(wood,8,19,48,28);p(isCoop?'#bd9a62':'#bb8b59',10,21,44,24);
    for(let wy=24;wy<44;wy+=6){p('#896242',11,wy,42,1);p('#dec184',12,wy+1,39,1);}
    p(wood,25,30,15,17);p('#503a2b',27,33,11,14);p('#bb824b',28,34,9,11);
    p(wood,6,15,52,6);p(roof,9,8,46,8);p('#613b30',6,14,52,3);p(roofLight,12,8,38,2);
    for(let tx=13;tx<53;tx+=9){p('#75443a',tx,10,2,5);p(roofLight,tx+2,10,4,2);}
    p('#49362a',10,46,44,3);p('#d2ab6c',12,46,40,1);
    if(isCoop){p('#d8c28b',19,35,4,5);p('#60412e',19,40,5,5);p('#d8c28b',43,35,4,5);p('#60412e',42,40,5,5);}
    if(type==='barn'){p('#e0b96e',40,23,10,5);p('#c38c49',41,24,8,3);}
  }
  c.restore();
}
function neighborHouse(c,a,t){
  if(dim(neighborHomesArt)){
    const {x,y,w,h,tier=0,name='',selected=false,mine=false}=a;
    c.drawImage(neighborHomesArt,tier*420,0,420,216,snapPixel(x-w/2),snapPixel(y-h),w,h);
    // Owner labels belong to the gate, never float over neighboring roofs.
    const signWidth=94,signY=y-28;
    box(c,'#67452e',x-signWidth/2-1,signY-1,signWidth+2,14,2);
    box(c,selected?'#ffe4a1':'#efd29b',x-signWidth/2,signY,signWidth,12,2);
    c.save();c.font='700 8px system-ui';c.textAlign='center';c.fillStyle='#493323';
    const label=fitGateName(name,value=>c.measureText(value).width,signWidth-10);
    c.fillText(label,x,signY+8.5);c.restore();
    if(mine){
      box(c,'#375f43',x-signWidth/2-20,signY,18,12,3);
      c.save();c.fillStyle='#fff0c2';c.font='700 6px system-ui';c.textAlign='center';c.fillText('Bạn',x-signWidth/2-11,signY+8);c.restore();
    }
    if(selected){
      c.save();c.strokeStyle='#fff0b0';c.lineWidth=1.5;
      c.beginPath();c.roundRect(x-17,y+3,34,10,4);c.stroke();c.restore();
    }
    return;
  }
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
  if(dim(pixelObjects))pixelHouse(c,x,y,snapPixel(width));
  else sprite(c,'house',x,y,width,height);
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
  if(a.type==='lake-shelter'){
    if(dim(lakeShelterImage))c.drawImage(lakeShelterImage,snapPixel(a.x-a.w/2),snapPixel(a.baseY-a.h),a.w,a.h);
    return;
  }
  if(a.type==='lake-elder'){
    if(!dim(lakeElderArt))return;
    const frame=lakeElderFrame(t,t===0),unit=.75;
    shade(c,a.x,a.y,8,2.5);
    c.drawImage(lakeElderArt,frame*lakeElderAtlas.cellWidth,0,48,64,snapPixel(a.x-24*unit),snapPixel(a.y-59*unit),48*unit,64*unit);
    return;
  }
  if(a.type==='market-shopper'){
    if(!dim(marketShopperArt))return;
    shade(c,a.x,a.y,6,2);
    c.save();c.translate(snapPixel(a.x),snapPixel(a.y));
    if(a.facing<0)c.scale(-1,1);
    c.drawImage(marketShopperArt,a.frame*48,a.row*64,48,64,-15,-40,30,40);
    c.restore();return;
  }
  if(a.type==='well'&&a.style==='village'&&dim(villageWellArt)){
    shade(c,a.x,a.y,a.w*.36,3);
    c.drawImage(villageWellArt,snapPixel(a.x-a.w/2),snapPixel(a.y-a.h),a.w,a.h);
    return;
  }
  if(a.type==='garden-reserve'){
    // Unpurchased row: quiet corner markers, never a clickable planted bed.
    c.save();c.globalAlpha=.25;plot(c,{...a,data:null},t,state,false);c.globalAlpha=.8;
    for(const dx of [-18,18])for(const dy of [-10,10]){
      line(c,'#c6b685',1,[[a.x+dx-Math.sign(dx)*5,a.y+dy],[a.x+dx,a.y+dy],[a.x+dx,a.y+dy-Math.sign(dy)*4]]);
    }
    c.restore();return;
  }
  if(a.type==='yard-pet'){
    const pose=a.motion?a:yardPetPose(a.species,t,t===0);
    if(a.species==='chicken')return critter(c,{...a,...pose,data:{kind:'chicken'}},t);
    const pet=yardPets.find(p=>p.species===a.species),art=yardPetArt[a.species];
    if(!dim(art))return;
    const {motion,x,y}=pose;
    const frame=motion.state==='walk'?1+Math.floor(motion.distance/5)%2:motion.state==='sniff'?3:0;
    const px=snapPixel(x),py=snapPixel(y);
    shade(c,px,py,pet.w*.36,2);
    c.save();c.translate(px,py);if(motion.facing<0)c.scale(-1,1);
    c.drawImage(art,(frame%2)*64,Math.floor(frame/2)*56,64,56,-pet.w/2,-52/56*pet.h,pet.w,pet.h);
    c.restore();return;
  }
  if(a.type==='fence-front')return fenceFront(c,a.area);
  if(drawAtlasActor(c,a,t,state))return;
  const {x,y,type,w,style}=a;
  if(type==='coop'&&a.parcel&&dim(parcelShelterArt)){
    c.drawImage(parcelShelterArt,snapPixel(x-w/2),snapPixel(y-a.h),w,a.h);
    return;
  }
  if(type==='dock'){
    const angle=a.side==='left'?-Math.PI/2:a.side==='right'?Math.PI/2:0;
    const authored=Number.isInteger(a.index)&&dim(pondDockArt);
    c.save();
    c.translate(x,y-(authored?0:a.waterTarget?12:a.side==='up'?25:0));
    c.rotate(angle);
    if(authored){
      const width=a.waterTarget?18:26,height=a.waterTarget?22:40;
      c.drawImage(pondDockArt,-width/2,-height,width,height);
    }else{
    const dockWidth=a.waterTarget?14:a.upgraded?26:18,dockLength=a.waterTarget?12:a.upgraded?38:29;
    c.fillStyle='#4e4937';c.fillRect(-dockWidth/2+2,2,dockWidth-4,dockLength-4);
    c.fillStyle='#805a3a';c.fillRect(-dockWidth/2,0,dockWidth,dockLength-4);
    c.fillStyle='#bf9255';c.fillRect(-dockWidth/2+2,1,dockWidth-4,2);
    for(let plank=6;plank<dockLength-2;plank+=6){
      c.fillStyle=plank%2?'#9c7147':'#aa7c4b';c.fillRect(-dockWidth/2+2,plank,dockWidth-4,4);
      c.fillStyle='#6c4a32';c.fillRect(-dockWidth/2+2,plank+3,dockWidth-4,1);
    }
    for(const postX of [-dockWidth/2+1,dockWidth/2-3]){
      c.fillStyle='#654632';c.fillRect(postX,dockLength-8,3,8);
      c.fillStyle='#d0a368';c.fillRect(postX,dockLength-8,1,5);
    }
    }
    c.restore();
    if(a.batches.length){
      const target=fishingBobber(a),ax=target.x,ay=target.y;
      c.save();c.globalAlpha=.68;
      a.batches.forEach(({kind},i)=>{
        const phase=t+i*2;
        sprite(c,kind,ax+i*7+Math.sin(phase*1.4)*4,ay-i*8+Math.cos(phase)*2,14,9,false,Math.sin(phase)*.16);
      });
      c.restore();
    }
    return;
  }
  if(type==='basket-trader'){
    shade(c,x-10,y+3,7,2);
    decorativeSprite(c,{kind:'basket',x:x-13,y:y+1,w:10,h:9});
    decorativeSprite(c,{kind:'basket',x:x+12,y:y+3,w:9,h:8,flip:true});
    return drawTownsperson(c,x,y,t,'trader');
  }
  if(type==='order-board'){
    if(dim(marketBoardArt)){
      shade(c,x,y,a.w*.4,3);
      c.drawImage(marketBoardArt,snapPixel(x-a.w/2),snapPixel(y-a.h),a.w,a.h);
      if(a.upgraded){
        ellipse(c,'#d9b354',x+a.w*.31,y-a.h*.52,3,3);
        ellipse(c,'#fff0b7',x+a.w*.31-1,y-a.h*.52-1,1,1);
      }
      if(a.orders!==undefined){
        box(c,'#304e3cec',x-9,y-a.h-13,18,10,3);
        c.fillStyle='#fff1c9';c.font='bold 7px system-ui';c.textAlign='center';
        c.fillText(String(a.orders),x,y-a.h-5.5);
      }
      return;
    }
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
    if(dim(neighborHallArt)){
      c.drawImage(neighborHallArt,snapPixel(x-w/2),snapPixel(y-a.h),w,a.h);
      return;
    }
    shade(c,x+3,y,w*.55,6);
    pixelSceneBuilding(c,{...a,type:'pavilion'});
    box(c,'#765032',x-17,y-13,34,7,2);
    c.fillStyle='#ffebbb';c.font='600 4px system-ui';c.textAlign='center';
    c.fillText('NHÀ SINH HOẠT',x,y-8);
    return;
  }
  if(type==='workshop'){
    const level=a.level??1;
    shade(c,x+2,y,w*.45,5);
    if(dim(workshopBuildingArt))c.drawImage(workshopBuildingArt,snapPixel(x-w/2),snapPixel(y-a.h),w,a.h);
    else pixelSceneBuilding(c,{...a,type:'barn'});
    box(c,'#344c3fe8',x-24,y+3,48,9,2);
    c.fillStyle='#f2dfaa';c.font='700 5px system-ui';c.textAlign='center';c.fillText('XƯỞNG MÁY '+level,x,y+9);
    return;
  }
  if(type==='plot')return plot(c,a,t,state);
  if(type==='animal'||type==='wildlife')return critter(c,a,t);
  if(type==='npc')return drawTownsperson(c,x,y,t,style);
  if(type==='tree'){
    const spread=27+seed(x,y)*12, tall=spread*.98;
    return decorativeSprite(c,{kind:'banyan',x:x+5,y,w:spread,h:tall,flip:seed(y,x)>.5},t,0);
  }
  if(type==='neighbor')return neighborHouse(c,a,t);
  if(['barn','market','coop','well','pavilion'].includes(type))return pixelSceneBuilding(c,a);
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
  const spriteWidth=type==='coop'?w*.78:type==='well'?w*1.05:w;
  const ratio=type==='well'?1.45:type==='house'||type==='neighbor'?1.02:type==='coop'?1.03:type==='barn'?.94:.84;
  const spriteHeight=type==='house'?a.h:spriteWidth*ratio;
  shade(c,x+3,y,spriteWidth*.61,6);
  if(type==='market'&&style!=='green'||style==='visit'){
    c.save();c.filter=style==='red'?'hue-rotate(-40deg) saturate(.88)':style==='gold'?'sepia(.42) saturate(1.2)':'hue-rotate(18deg) saturate(.85)';
    sprite(c,name,x,y,spriteWidth,spriteHeight);c.restore();
  } else sprite(c,name,x,y,spriteWidth,spriteHeight);
}
function drawTownsperson(c,x,y,t,style){
  const motion=animalMotion(t,style==='vendor'?0:1,5);
  drawPerson(c,x+motion.offset,y,motion.facing===1?'right':'left',t,{
    style,walking:motion.state==='walk',walkDistance:motion.distance,stride:10,
  });
}
function pixelRain(c,x,y,slant,length,color){
  const cell=pixelStep;
  c.fillStyle=color;
  for(let i=0;i<length;i++){
    const drift=Math.round(i*slant/Math.max(1,length-1));
    c.fillRect(snapPixel(x-drift*cell),snapPixel(y+i*cell),cell,cell);
  }
}
function pixelMist(c,x,y,widthPx,phase,alpha){
  const cell=pixelStep,step=cell*5;
  const offsets=[0,1,0,-1,0,1,0,-1,0];
  c.fillStyle=`rgba(222,235,224,${alpha})`;
  for(let i=0;i<offsets.length;i++){
    const at=(i*step+phase)%(widthPx+step*2)-step;
    const px=snapPixel(x+at),py=snapPixel(y+offsets[i]*cell);
    c.fillRect(px,py,step*1.4,cell*2);
    if(i%2===0)c.fillRect(px+step*.4,py-cell,step*.8,cell);
  }
}
export function atmosphere(c,t,w,reduce,daylight=0,{width,height}=size){
  if(w==='rain'||w==='storm'){
    const storm=w==='storm';
    const veil=c.createLinearGradient(0,0,0,height);
    veil.addColorStop(0,storm?'#29365466':'#47698142');
    veil.addColorStop(.62,storm?'#3446654d':'#53788a2d');
    veil.addColorStop(1,storm?'#263b4b38':'#436b7130');
    box(c,veil,0,0,width,height,0);

    // Several rain planes keep the shower from looking like one flat moving grid.
    const planes=storm
      ? [[48,178,3,8,.28],[58,228,5,10,.42],[48,292,7,12,.58]]
      : [[30,125,1,5,.22],[36,166,2,7,.36],[30,215,4,9,.52]];
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
        const tint=layer===2?'224,242,244':'183,215,224';
        pixelRain(c,x,y,lean,Math.max(2,Math.round(length+(i%3))),`rgba(${tint},${alpha})`);
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
    const cool=c.createLinearGradient(0,0,0,height);
    cool.addColorStop(0,'#bcd7cf16');cool.addColorStop(.52,'#dbe8d806');cool.addColorStop(1,'#9fbfb510');
    box(c,cool,0,0,width,height,0);
    for(let i=0;i<6;i++){
      const drift=reduce?0:Math.sin(t*(.12+i%3*.025)+i*1.7)*16;
      const x=(i*89+34+drift)%(width+100)-50;
      const y=72+(i*43)%195+(reduce?0:Math.sin(t*.22+i)*3);
      pixelMist(c,x,y,66+i%3*16,reduce?0:Math.sin(t*.1+i)*pixelStep*2,.045+i%3*.012);
    }
    if(!reduce)for(let i=0;i<9;i++){
      const glow=.28+.18*Math.sin(t*1.25+i*2.3);
      const px=snapPixel(26+(i*61)%width),py=snapPixel(42+(i*37)%210);
      c.fillStyle=`rgba(238,244,205,${glow})`;c.fillRect(px,py,pixelStep,pixelStep);
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
  const animalFrame={animalHarvest:0,feed:1}[style.icon];
  const art=style.icon==='till'?tillTaskArt:animalFrame!==undefined?animalTaskArt:careIconArt;
  const frame=style.icon==='till'?0:animalFrame??{harvest:0,pests:1,weeds:2,water:3}[style.icon];
  if(frame!==undefined&&dim(art)){
    c.save();c.imageSmoothingEnabled=false;
    // Approved option C: a restrained, translucent circular badge. The thin
    // warm rim separates it from foliage without an opaque white plate.
    const cx=snapPixel(x),cy=snapPixel(y);
    c.beginPath();c.arc(cx,cy,9,0,Math.PI*2);
    c.fillStyle='#3c38254d';c.fill();
    c.strokeStyle='#f4dfabcc';c.lineWidth=.75;c.stroke();
    c.drawImage(art,frame*32,0,32,32,cx-7,cy-7,14,14);
    c.restore();return;
  }
  // No backing plate, including the loading/soil/animal fallback marks.
  c.save();
  c.shadowColor='#293d2b';c.shadowBlur=0;c.shadowOffsetY=.75;
  c.fillStyle='#fffaf1';
  c.font='bold 6.5px system-ui';
  c.textAlign='center';
  c.fillText(style.mark,x,y+2.1);
  c.restore();
}

export function createMapCursor(){
  const image=document.createElement('canvas');
  image.width=28;image.height=28;
  const c=image.getContext('2d');
  c.beginPath();c.moveTo(4,3);c.lineTo(5,21);c.lineTo(10,16);c.lineTo(14,23);
  c.lineTo(17,21);c.lineTo(13,14);c.lineTo(20,13);c.closePath();
  c.fillStyle='#fff0c2';c.fill();
  c.strokeStyle='#294b38';c.lineWidth=2;c.lineJoin='round';c.stroke();
  line(c,'#92ab70',1.5,[[7,7],[8,15]]);
  box(c,'#c28740',19,4,3,3,1);box(c,'#efc472',23,8,2,2,1);
  return `url(${image.toDataURL()}) 4 3, crosshair`;
}
export function drawMapPointer(c,x,y,t,{blocked=false,opacity=1}={}){
  c.save();c.globalAlpha=opacity;
  ellipse(c,'#2c433b62',x,y+1.4,9.5,4.7);
  c.strokeStyle=blocked?'#f3a785':'#fff0bb';c.lineWidth=1.4;
  c.beginPath();c.ellipse(x,y,8.1,3.7,0,0,Math.PI*2);c.stroke();
  const lift=t?Math.sin(t*5)*1.2:0;
  line(c,blocked?'#a84736':'#315843',3,[[x-3,y-7+lift],[x,y-4+lift],[x+3,y-7+lift]]);
  line(c,blocked?'#ffd9bd':'#fff5d1',1.4,[[x-3,y-7+lift],[x,y-4+lift],[x+3,y-7+lift]]);
  c.restore();
}
