import {fenceAt,gardenDecorAt,gardenDecorItems,gardenDecorSpots,getLand,homesteadSize,landTypes,lotCount,lotRect,coopRect,lotPondInset,mainPlotId,mainPlotSlot,mainPond,plotAt,plotOffset,plotPosition,pondOffset} from './land.mjs';
import {fishing,visiblePondBatches} from './aqua.mjs';
import {houseDoor,homeBed,homeSpawn} from './home-rules.mjs';
import {homesteadWorkshop,parcelShelter,parcelAnimalSeats,parcelAnimalBaseline,parcelAnimalRoam} from './pixel/homestead-buildings.mjs';

export const size = { width: 480, height: 288 };
export const interactionRange=31;
const plotHotspotOffset=8;
const objectHotspotOffset=15;
const publicWell={x:217,y:299,type:'well',w:31};
const publicWellHotspot={...publicWell,y:publicWell.y+12,type:'village-well',label:'Uống nước ở giếng công cộng'};
const wide={width:720,height:432};

export {lotRect,plotPosition} from './land.mjs';
// Three tidy planting columns sit east of the north-south path. The open seam
// keeps the village approach and expansion routes clear.
const gardenBeds=(rows,y,step=40)=>[{x:232,y,w:137,h:step*(rows-1)+28}];
const baseGarden=rows=>[...gardenBeds(Math.min(rows,4),82),...(rows>4?[{x:232,y:288,w:272,h:Math.ceil((rows-4)/2)*26}]:[])];
const basePen={x:82,y:106,w:258,h:95};
const docks = {
  field:[{x:480,y:234,type:'pond',index:0,label:'Ao nuôi thủy sản',side:'right'}, {x:650,y:315,type:'pond',index:0,label:'Ao nuôi thủy sản',side:'up'}],
  visit:[{x:480,y:234,type:'neighbor-fishing',index:0,label:'Câu trộm ở ao nuôi',side:'right'}],
  lake:[{x:290,y:250,type:'public-fishing',label:'Câu miễn phí',side:'up'},{x:580,y:213,type:'public-fishing',label:'Câu miễn phí',side:'left'}],
};
const rect = (x, y, w, h) => ({ x, y, w, h });
const exit = (x, y, label, next, arrival, side) => ({ x, y, label, next, arrival, side, type:'exit' });
export const maps = {
  field: {
    name:'Vườn nhà', subtitle:'LÀNG MÙA VUI', spawn:[188,221], bounds:homesteadSize,
    paths:[[[133,177],[140,191],[181,215],[205,238],[205,620]],[[205,258],[280,258],[350,258],[407,249],[430,205],[442,198]],[[205,292],[242,292],[242,347]],[[478,360],[478,610]],[[242,355],[716,355]],[[242,413],[716,413]],[[242,471],[716,471]],[[242,529],[716,529]],[[242,587],[716,587]],[[94,285],[151,285],[205,285]],[[homesteadWorkshop.x,homesteadWorkshop.y+18],[205,homesteadWorkshop.y+18]]],
    trees:[[34,45],[38,268],[29,560],[100,622],[786,44],[790,151],[790,305],[786,495],[755,613],[540,630],[684,630]],
    water:[mainPond],
    objects:[{x:houseDoor.x,y:houseDoor.y-15,type:'house',style:'home',label:'Vào nhà vườn',w:72,h:60}, {x:442,y:183,type:'barn',label:'Kho nông sản',w:63,h:36}, {x:94,y:270,type:'well',label:'Uống nước ở giếng',w:23,h:19}],
    exits:[exit(188,13,'Đường sang chợ','market',[188,260],'up'),exit(448,198,'Qua chuồng trại','coop',[29,220],'right'),exit(188,273,'Sang xóm bên','neighbors',[188,30],'down'), exit(699,402,'Ra hồ làng','lake',[36,309],'right')],
  },
  home: {
    name:'Nhà vườn', spawn:homeSpawn, water:[], objects:[], trees:[],
    blocks:[rect(0,0,480,82),rect(0,82,30,18),rect(29,84,106,56),rect(301,74,26,27),
      rect(336,76,115,74),rect(447,118,33,58),rect(0,190,30,75),rect(447,211,33,43)],
    hotspots:[{...homeBed,type:'bed',label:'Giường · Nghỉ lấy sức'}],
    exits:[exit(238,272,'Ra vườn','field',[houseDoor.x,houseDoor.y+18],'down')],
  },
  workshop:{
    name:'Xưởng máy',subtitle:'KHU CHẾ TẠO',spawn:[238,244],water:[],trees:[],objects:[],
    blocks:[rect(0,0,480,62),rect(0,62,25,226),rect(455,62,25,226),rect(45,75,108,50),rect(327,75,108,50),rect(56,159,88,43),rect(336,159,88,43)],
    hotspots:[{x:238,y:107,type:'craft-bench',label:'Bàn chế biến'}],
    exits:[exit(238,274,'Ra vườn','field',[homesteadWorkshop.x,homesteadWorkshop.y+18],'down')],
  },
  coop: {
    name:'Chuồng trại', subtitle:'KHU CHĂN NUÔI', spawn:[29,220],
    paths:[[[0,220],[147,220],[238,220],[238,288]],[[238,220],[397,220],[397,118]]],
    trees:[[29,52],[66,81],[108,60],[23,144],[419,36],[456,73],[443,149],[426,267],[454,246],[55,265],[101,256]],
    water:[rect(421,102,50,36)],
    objects:[{x:239,y:69,type:'coop',label:'Cửa chuồng',w:102,h:47},{x:382,y:161,type:'silo',label:'Máng thức ăn',w:36,h:28}],
    exits:[exit(16,220,'Về vườn nhà','field',[433,198],'left'),exit(238,273,'Sang xóm bên','neighbors',[442,217],'down')],
  },
  market: {
    name:'Chợ làng', subtitle:'PHIÊN CHỢ MÙA VUI', spawn:[238,260],
    paths:[[[238,288],[238,206],[238,130]],[[96,138],[238,138],[392,138]],[[105,206],[395,206]]],
    trees:[[27,47],[58,80],[27,144],[440,69],[452,119],[416,46],[30,254],[69,269],[427,258],[458,241]],
    water:[rect(410,153,46,59)],
    objects:[{x:105,y:98,type:'market',style:'red',label:'Quầy vật tư',w:65,h:37}, {x:237,y:89,type:'market',style:'green',label:'Sạp nông sản',w:72,h:37}, {x:380,y:98,type:'market',style:'gold',label:'Quầy bán nhanh',w:65,h:37}, {x:237,y:195,type:'well',label:'Giếng làng',w:27,h:18}],
    exits:[exit(238,273,'Về vườn nhà','field',[188,34],'down')],
  },
  neighbors: {
    name:'Đường làng', subtitle:'XÓM MÙA VUI', spawn:[238,30],
    paths:[[[238,0],[238,40],[221,84],[238,125],[242,181],[230,220],[239,252]],[[59,123],[96,128],[145,121],[200,116],[238,125],[300,134],[358,116],[422,123]],[[59,217],[102,205],[165,221],[230,220],[288,215],[376,231],[429,216],[480,217]]],
    trees:[[27,44],[64,31],[422,47],[453,73],[29,168],[441,165],[25,258],[93,268],[402,261],[450,260]],
    water:[rect(7,79,32,55),rect(438,78,28,64)],
    objects:[],
    exits:[exit(238,14,'Về vườn nhà','field',[188,251],'up'),exit(463,217,'Sang chuồng trại','coop',[238,248],'right')],
  },
  lake: {
    name:'Hồ làng', subtitle:'HỒ LÀNG', spawn:[36,309],bounds:wide,
    paths:[[[0,308],[66,311],[104,319],[150,308],[208,320],[255,297],[289,290],[289,247]],[[150,308],[169,344],[205,365],[269,369],[326,350],[411,352],[484,324],[541,292],[559,257],[580,213]],[[150,308],[136,267],[124,231],[114,195],[117,160],[102,128]],[[484,324],[564,351],[623,370],[665,371],[719,377]]],
    trees:[[20,56],[55,93],[21,173],[73,227],[121,267],[197,377],[333,407],[432,413],[561,405],[690,336],[688,264],[685,157],[645,86],[605,51],[525,45],[441,35],[302,37],[194,52]],
    water:[rect(178,66,448,172)],
    objects:[{x:101,y:122,type:'pavilion',label:'Chòi nghỉ ven hồ',w:85,h:45}],
    exits:[exit(16,309,'Về vườn nhà','field',[679,402],'left')],
  },
  visit: {
    name:'Vườn hàng xóm', subtitle:'ĐANG GHÉ THĂM', spawn:[234,249], bounds:homesteadSize,
    exits:[exit(238,273,'Về đường làng','neighbors',[238,246],'down')],
  },
};
Object.assign(maps.visit,{
  paths:maps.field.paths,trees:maps.field.trees,water:maps.field.water,
  objects:maps.field.objects.map(o=>o.type==='house'?{...o,style:'visit'}:o),
});
export const plotWorkActions=new Set(['till','plant','water','fertilize','spray','harvest']);
export const needsPlayerLocation=action=>plotWorkActions.has(action)||['drink','eat','rest'].includes(action);
export function taskMarkers(sceneId,hotspots,tasks){
  if(sceneId!=='field'&&sceneId!=='coop')return [];
  const positions=new Map(hotspots.map(point=>[point.type+':'+point.index,point]));
  return tasks.flatMap(task=>{
    if(!['plot','animal','pond'].includes(task.kind)||task.kind==='pond'&&sceneId!=='field')return [];
    const point=positions.get(task.kind+':'+task.index);
    return point?[{point,task}]:[];
  });
}
export function drinkingWell(area,hasPublicWell){
  if(area==='lake')return hasPublicWell?publicWellHotspot:null;
  if(area!=='field'&&area!=='market')return null;
  const well=maps[area].objects.find(object=>object.type==='well');
  return {...well,y:well.y+objectHotspotOffset};
}
function withinReach(point,pose){
  return !!(point&&pose&&Math.hypot(point.x-pose.x,point.y-pose.y)<=interactionRange);
}
export function playerLocationBlock({action,index},area,pose,hasPublicWell=false){
  if(plotWorkActions.has(action)){
    if(area!=='field'||!Number.isSafeInteger(index)||index<0)return 'Hãy đến đúng ô đất trong vườn của bạn.';
    const plot=plotPosition(index);
    return withinReach({x:plot.x,y:plot.y+plotHotspotOffset},pose)?'':'Hãy đến gần ô đất để thực hiện.';
  }
  if(action==='drink')return area==='home'||withinReach(drinkingWell(area,hasPublicWell),pose)?'':'Hãy đến gần giếng hoặc vào Nhà vườn để uống nước.';
  if(action==='eat')return area==='home'?'':'Hãy vào Nhà vườn để ăn cơm.';
  if(action==='rest')return area==='home'?'':'Hãy vào Nhà vườn để bắt đầu nghỉ.';
  return '';
}

const visitorPosition = i => ({x:[92,166,309,383][i%4],y:79+Math.floor(i/4)*72});
export const neighborHouseTier=wealth=>wealth>20000?4:wealth>5000?3:wealth>1000?2:wealth>500?1:0;
const coopPosition=(i,level)=>{
  const capacity=Math.max(2,level*2);
  if(capacity<=6){
    const rows=Math.ceil(capacity/3),ys=rows===1?[150]:[127,174];
    return {x:115+i%3*72,y:ys[Math.floor(i/3)]};
  }
  const rows=Math.ceil(capacity/4),ys=rows===2?[131,174]:rows===3?[127,158,189]:[127,148,169,190];
  return {x:113+i%4*61,y:ys[Math.floor(i/4)]};
};
const intrudes = (x,y,items,margin=0) => items.some(r=>x>=r.x-margin&&x<=r.x+r.w+margin&&y>=r.y-margin&&y<=r.y+r.h+margin);
export function features(id, snapshot, neighbor, page=0) {
  const map=maps[id];
  const blocks=map.blocks?.slice()??[];
  const water=map.water.slice();
  const ground=[];
  const actors=[];
  const hotspots=[...map.exits,...(map.hotspots??[])];
  const farm=snapshot.me;
  const owner=id==='visit'?neighbor:farm;
  for(const obj of map.objects) {
    if(obj.type==='coop'&&!farm.coop) {
      actors.push({...obj,type:'foundation',label:'Xây chuồng'});
      hotspots.push({...obj,type:'coop',y:obj.y+15,label:'Xây chuồng'});
      continue;
    }
    actors.push(obj);
    const depth=obj.type==='well'?10:14;
    blocks.push(rect(obj.x-obj.w*.43,obj.y-depth,obj.w*.86,depth+2));
    if(id!=='visit'||!['house','well'].includes(obj.type)){
      const drawY=obj.type==='house'?obj.y-obj.h/2:undefined;
      hotspots.push({...obj,y:obj.y+objectHotspotOffset,drawY});
    }
  }
  for(const [x,y] of map.trees) {
    actors.push({x,y,type:'tree'});
    blocks.push(rect(x-5,y-8,10,11));
  }
  if((id==='field'||id==='visit')&&owner) {
    for(const [spot,{x,y}] of Object.entries(gardenDecorSpots)){
      const kind=gardenDecorAt(owner,spot);
      if(kind)actors.push({x,y,type:'garden-decor',kind,w:gardenDecorItems[kind].width,name:owner.name});
    }
    if((owner.workshop??0)>0){
      const workshop={...homesteadWorkshop,type:'workshop',level:owner.workshop,label:'Xưởng máy cấp '+owner.workshop};
      actors.push(workshop);blocks.push(rect(workshop.x-42,workshop.y-48,84,50));
      if(id==='field')hotspots.push({...workshop,y:workshop.y+12});
    }
    for(const i of owner.plotIndexes??owner.plots.map((_,slot)=>mainPlotId(slot))) {
      const data=plotAt(owner,i);
      const pos=plotPosition(i);
      actors.push({...pos,type:'plot',index:i,data,compactAt:id==='field'?owner.soilCompactsAt?.[i]:undefined,visit:id==='visit'});
      const slot=mainPlotSlot(i);
      hotspots.push({...pos,y:pos.y+plotHotspotOffset,drawY:pos.y,type:'plot',index:i,data,label:slot>=0?'Ô đất '+(slot+1):'Vườn ô '+(Math.floor((i-plotOffset)/3)+1)+' · luống '+((i-plotOffset)%3+1)});
    }
    const decor=(index,rect)=>{const style=fenceAt(owner,index);if(style)ground.push({...rect,type:'fence',style});};
    for(const garden of baseGarden(Math.ceil(owner.plots.length/3))){
      ground.push({...garden,type:'garden-bed'});
      decor(-1,garden);
    }
    const land=getLand(owner);
    for(let i=0;i<lotCount;i++){
      const lot=land[i], area=lotRect(i), x=area.x+area.w*.5, y=area.y+area.h+7;
      ground.push({...area,type:'lot',lot,index:i});
      if(id==='field')hotspots.push({x,y,type:'land',index:i,label:(lot?.kind&&lot.kind!=='empty'?landTypes[lot.kind].name:lot?'Đất trống':'Mua đất')+' · Ô '+(i+1)});
      if(lot?.fence&&lot.kind!=='pond'&&lot.kind!=='coop')ground.push({...area,type:'fence',style:lot.fence});
      if(lot?.kind==='pond'){
        const section={x:area.x+lotPondInset.x,y:area.y+lotPondInset.y,w:area.w-lotPondInset.w,h:area.h-lotPondInset.h,shape:'rect'};
        water.push(section);
        const batches=visiblePondBatches(owner,pondOffset+i);
        const dock={x,y:y-12,index:i+pondOffset,side:'up',waterTarget:{x:section.x+section.w/2,y:section.y+section.h/2},label:landTypes[lot.kind].name+' · Ô '+(i+1)};
        actors.push({...dock,type:'dock',batches});
        if(id==='field')hotspots.push({...dock,type:'pond'});
        else hotspots.push({...dock,type:'neighbor-fishing'});
      }
      if(lot?.kind==='coop'){
        const pen=coopRect(i);
        ground.push({...pen,type:'fence',style:lot.fence??'wood'});
        actors.push({x:pen.x+parcelShelter.x,y:pen.y+parcelShelter.y,type:'coop',w:parcelShelter.w,h:parcelShelter.h,parcel:true});
        blocks.push(rect(pen.x+10,pen.y+22,68,23));
        const pens=id==='field'?farm.pens:owner.visiblePens??[];
        pens.map((data,index)=>({data,index})).filter(p=>p.data.lot===i).forEach(({data,index},seat)=>{
          const point={x:pen.x+parcelAnimalSeats[seat],y:pen.y+parcelAnimalBaseline,index,data,roam:parcelAnimalRoam[seat]};
          actors.push({...point,type:'animal'});
          if(id==='field')hotspots.push({...point,type:'animal',label:'Chăm vật nuôi'});
        });
      }
    }
  }
  if(id==='coop') {
    if(fenceAt(farm,-4))ground.push({...basePen,type:'fence',style:fenceAt(farm,-4)});
    let seat=0;
    for(const [i,data] of farm.pens.entries()) {
      if(data.lot!==undefined)continue;
      const pos=coopPosition(seat++,farm.coop);
      actors.push({...pos,type:'animal',index:i,data});
      hotspots.push({...pos,type:'animal',index:i,data,label:'Chăm vật nuôi'});
    }
  }
  const built=project=>snapshot.village?.built.some(entry=>entry.id===project);
  if(id==='lake'&&built('well')){
    actors.push(publicWell);
    hotspots.push(publicWellHotspot);
    blocks.push(rect(publicWell.x-11,publicWell.y-7,22,8));
  }
  for(const dock of docks[id]??[]){
    const batches=visiblePondBatches(owner,dock.index);
    actors.push({...dock,type:'dock',batches,upgraded:id==='lake'&&(snapshot.fishingLimit??fishing.limit)>fishing.limit});
    hotspots.push(dock);
  }

  if(id==='market') {
    const orders=snapshot.orders?.length;
    const board={x:179,y:170,type:'order-board',label:orders===undefined?'Bảng đơn hàng của làng':'Bảng đơn · '+orders+' đơn còn lại',
      upgraded:built('notice'),orders};
    if(snapshot.orders?.some(order=>order.title))actors.push({x:262,y:175,type:'basket-trader'});
    actors.push(board);
    hotspots.push({...board,y:board.y+9});
    blocks.push(rect(board.x-12,board.y-5,24,6));
    actors.push({x:258,y:111,type:'npc',style:'vendor'}, {x:364,y:115,type:'npc',style:'trader'});
  }
  if(id==='neighbors') {
    if(built('hall')){
      const hall={x:237,y:174,type:'village-hall',label:'Nhà sinh hoạt',w:81};
      actors.push(hall);
      hotspots.push({...hall,y:hall.y+14});
      blocks.push(rect(201,166,72,10));
    }
    const ownWealth=snapshot.wealth?.find(entry=>entry.id===farm.id)?.total??farm.coins;
    const homes=[{id:farm.id,name:farm.name,wealth:ownWealth,mine:true},...snapshot.neighbors];
    for(const [i,data] of homes.slice(page*6,page*6+6).entries()) {
      const pos=visitorPosition(i);
      const tier=neighborHouseTier(data.wealth??0);
      actors.push({...pos,type:'neighbor',id:data.id,name:data.name,tier,w:53+tier*3,h:31+tier*2});
      blocks.push(rect(pos.x-22-tier,pos.y-15-tier,44+tier*2,15+tier));
      hotspots.push({...pos,y:pos.y+13,type:data.mine?'own-house':'neighbor',id:data.id,label:data.name+(data.mine?' · Nhà của bạn':'')});
    }
  }
  return {actors,hotspots,blocks,water,ground,bounds:map.bounds??size};
}
export function walkable(scene,x,y){
  const bounds=scene.bounds??size;
  if(x<8||x>bounds.width-8||y<10||y>bounds.height-9||intrudes(x,y,scene.blocks,3))return false;
  return !(scene.water??[]).some(r=>{
    const rx=r.w/2, ry=r.h/2;
    if(r.shape==='rect')return x>r.x-3&&x<r.x+r.w+3&&y>r.y-3&&y<r.y+r.h+3;
    return ((x-r.x-rx)/(rx+4))**2+((y-r.y-ry)/(ry+4))**2<1;
  });
}
const step=8;
const columns=scene=>Math.floor(((scene.bounds??size).width-16)/step)+1;
const lines=scene=>Math.floor(((scene.bounds??size).height-21)/step)+1;
const node = (c,r) => [8+c*step,12+r*step];
function nearest(scene,x,y) {
  const cols=columns(scene),rows=lines(scene);
  let best=-1, distance=Infinity;
  for(let r=Math.max(0,Math.floor((y-12)/step)-6);r<Math.min(rows,Math.floor((y-12)/step)+7);r++) {
    for(let c=Math.max(0,Math.floor((x-8)/step)-6);c<Math.min(cols,Math.floor((x-8)/step)+7);c++) {
      const [cx,cy]=node(c,r), d=Math.hypot(x-cx,y-cy);
      if(d<distance&&walkable(scene,cx,cy)){best=r*cols+c;distance=d;}
    }
  }
  return best;
}
export function route(scene,from,to) {
  const cols=columns(scene),rows=lines(scene);
  const start=nearest(scene,...from), end=nearest(scene,...to);
  if(start<0||end<0) return null;
  const queue=[start], visited=new Int16Array(cols*rows).fill(-1);
  visited[start]=start;
  for(let i=0;i<queue.length&&visited[end]===-1;i++) {
    const current=queue[i], c=current%cols, r=Math.floor(current/cols);
    for(const [dc,dr] of [[1,0],[0,1],[-1,0],[0,-1]]) {
      const nc=c+dc,nr=r+dr,next=nr*cols+nc;
      if(nc<0||nc>=cols||nr<0||nr>=rows||visited[next]!==-1||!walkable(scene,...node(nc,nr))) continue;
      visited[next]=current;
      queue.push(next);
    }
  }
  if(visited[end]===-1) return null;
  const path=[];
  for(let cur=end;cur!==start;cur=visited[cur]) path.push(node(cur%cols,Math.floor(cur/cols)));
  path.push(node(start%cols,Math.floor(start/cols)));
  path.reverse();
  const points=[];
  let i=0;
  while(i<path.length) {
    let far=i;
    const fromPoint=i===0?from:path[i-1];
    for(let candidate=i+1;candidate<path.length;candidate++){
      if(!clearSegment(scene,fromPoint,path[candidate])) break;
      far=candidate;
    }
    points.push(path[far]);
    i=far+1;
  }
  return points;
}
function clearSegment(scene,[ax,ay],[bx,by]){
  const distance=Math.hypot(bx-ax,by-ay);
  const pieces=Math.max(1,Math.ceil(distance/2));
  for(let i=0;i<=pieces;i++){
    const fraction=i/pieces;
    if(!walkable(scene,ax+(bx-ax)*fraction,ay+(by-ay)*fraction))return false;
  }
  return true;
}
