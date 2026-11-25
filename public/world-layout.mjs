import {fenceAt,gardenDecorAt,gardenDecorItems,gardenDecorSpots,gardenForPlot,gardenPlotSlot,gardenPlotId,getLand,homesteadSize,landTypes,lotCount,lotRect,coopRect,gardenParcelRect,lotPondInset,mainPlotId,mainPlotSlot,mainPond,plotAt,plotOffset,plotPosition,pondOffset} from './land.mjs';
import {fishing,visiblePondBatches} from './aqua.mjs';
import {houseDoor,homeBed,homeSpawn} from './home-rules.mjs';
import {homesteadWorkshop,parcelShelter,parcelAnimalSeats,parcelAnimalBaseline,parcelAnimalRoam} from './pixel/homestead-buildings.mjs';
import {yardPets} from './yard-pets.mjs';
import {coopSize,coopGate,coopBarn,coopFeed,coopPosition,coopAnimalRoam,coopAnimalScale} from './coop-layout.mjs';
import {neighborBounds,neighborEntry,neighborCoopEntry,neighborReturn,neighborHall,neighborLot,neighborPosition,neighborPage,neighborHouseTier} from './neighbors-layout.mjs';
export {neighborHouseTier} from './neighbors-layout.mjs';

export const size = { width: 480, height: 288 };
export const interactionRange=31;
const plotHotspotOffset=8;
const objectHotspotOffset=15;
// Stone foot sits on the grassy shore; the drinking point faces the south path.
const publicWell={x:217,y:327,type:'well',style:'village',w:52,h:62};
const publicWellHotspot={...publicWell,y:publicWell.y+12,type:'village-well',label:'Uống nước ở giếng công cộng'};
const wide={width:720,height:432};

export {lotRect,plotPosition} from './land.mjs';
// Three tidy planting columns sit east of the north-south path. The open seam
// keeps the village approach and expansion routes clear.
const gardenBeds=(rows,y,step=34)=>[{x:232,y,w:130,h:step*(rows-1)+40}];
const baseGarden=rows=>[...gardenBeds(Math.min(rows,4),76),...(rows>4?[{x:232,y:288,w:256,h:Math.max(0,Math.ceil((rows-4)/2)-1)*26+30}]:[])];
const docks = {
  field:[{x:480,y:234,type:'pond',index:0,label:'Ao nuôi thủy sản',side:'right'}, {x:650,y:315,type:'pond',index:0,label:'Ao nuôi thủy sản',side:'up'}],
  visit:[{x:480,y:234,type:'neighbor-fishing',index:0,label:'Câu trộm ở ao nuôi',side:'right'}],
  lake:[{x:178,y:245,waterTarget:{x:235,y:220},type:'public-fishing',label:'Câu miễn phí',side:'up'},{x:590,y:245,waterTarget:{x:510,y:240},type:'public-fishing',label:'Câu miễn phí',side:'left'}],
};
const rect = (x, y, w, h) => ({ x, y, w, h });
// Painted upper-world buildings use the plate's world scale (820 x 640).
// The roof is baked into terrain: allowing feet onto it draws players on top.
export const homesteadBuildingBlocks=[rect(80,44,100,14),rect(48,58,164,109),rect(384,88,120,99)];
const homesteadBuildingHits={house:rect(45,44,170,140),barn:rect(380,86,126,115)};
const exit = (x, y, label, next, arrival, side) => ({ x, y, label, next, arrival, side, type:'exit' });
export const maps = {
  field: {
    name:'Vườn nhà', subtitle:'LÀNG MÙA VUI', spawn:[188,221], bounds:homesteadSize,
    blocks:homesteadBuildingBlocks,
    paths:[[[133,177],[140,191],[181,215],[205,238],[205,880]],[[205,258],[280,258],[350,258],[407,249],[430,205],[442,198]],[[205,292],[242,292],[242,347]],[[478,360],[478,860]],...Array.from({length:5},(_,row)=>[[230,387+row*116],[716,387+row*116]]),[[94,285],[151,285],[205,285]],[[homesteadWorkshop.x,homesteadWorkshop.y+18],[205,homesteadWorkshop.y+18]]],
    trees:[[34,45],[38,268],[29,560],[60,780],[786,44],[790,151],[790,305],[786,495],[778,700],[540,880],[684,880]],
    water:[mainPond],
    objects:[{x:houseDoor.x,y:houseDoor.y-15,type:'house',style:'home',label:'Vào nhà vườn',w:72,h:60}, {x:442,y:183,type:'barn',label:'Kho nông sản',w:63,h:36}, {x:94,y:270,type:'well',label:'Uống nước ở giếng',w:23,h:19}],
    exits:[exit(188,13,'Đường sang chợ','market',[188,260],'up'),exit(448,198,'Qua chuồng trại','coop',coopGate,'right'),exit(188,273,'Sang xóm bên','neighbors',neighborEntry,'down'), exit(699,402,'Ra hồ làng','lake',[36,309],'right')],
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
    name:'Chuồng trại', subtitle:'KHU CHĂN NUÔI', spawn:coopGate,facing:'up',bounds:coopSize,
    paths:[[[240,288],[240,126]],[[45,196],[435,196]]],
    trees:[],water:[],
    blocks:[rect(58,0,364,120),rect(0,0,12,288),rect(468,0,12,288),
      rect(35,120,180,20),rect(265,120,180,20),rect(13,225,201,30),rect(266,225,201,30)],
    objects:[{...coopBarn,type:'coop',label:'Cửa chuồng'},{...coopFeed,type:'silo',label:'Thức ăn bên chuồng'}],
    exits:[exit(240,278,'Về vườn nhà','field',[433,198],'down'),exit(252,278,'Sang xóm bên','neighbors',neighborCoopEntry,'down')],
  },
  market: {
    // The plate already contains the stalls and well. Block their painted bodies,
    // not just the old small procedural actor footprints.
    blocks:[rect(18,10,132,140),rect(160,8,158,132),rect(327,12,145,147),rect(206,145,67,87)],
    name:'Chợ làng', subtitle:'PHIÊN CHỢ MÙA VUI', spawn:[238,260],
    paths:[[[238,288],[238,206],[238,130]],[[96,138],[238,138],[392,138]],[[105,206],[395,206]]],
    trees:[[27,47],[58,80],[27,144],[440,69],[452,119],[416,46],[30,254],[69,269],[427,258],[458,241]],
    water:[],
    objects:[{x:88,y:150,type:'market',style:'red',label:'Quầy vật tư',w:65,h:37,interaction:{x:88,y:170}}, {x:240,y:136,type:'market',style:'green',label:'Sạp nông sản',w:72,h:37,interaction:{x:296,y:160}}, {x:392,y:159,type:'market',style:'gold',label:'Quầy bán nhanh',w:65,h:37,interaction:{x:392,y:179}}, {x:239,y:230,type:'well',label:'Giếng làng',w:27,h:18}],
    exits:[exit(238,273,'Về vườn nhà','field',[188,34],'down')],
  },
  neighbors: {
    name:'Đường làng', subtitle:'XÓM MÙA VUI', spawn:neighborEntry,bounds:neighborBounds,
    paths:[[[360,0],[360,65],[302,95],[302,176],[360,207],[360,432]],[[360,65],[418,95],[418,176],[360,207]],...Array.from({length:3},(_,row)=>[[180,164+row*110],[360,160+row*110],[540,164+row*110]]),[[360,395],[640,395],[690,345],[720,345]]],
    trees:[],water:[],
    objects:[],
    exits:[exit(360,14,'Về vườn nhà','field',[188,251],'up'),exit(704,345,'Sang chuồng trại','coop',coopGate,'right')],
  },
  lake: {
    // Trace the painted shoreline, allowing only the two wooden decks over water.
    navigation:{
      water:[[132,63],[220,48],[340,48],[460,63],[565,82],[642,109],[690,143],[692,214],[648,260],[580,286],[474,307],[365,313],[273,305],[204,286],[139,261],[102,221],[91,166],[104,108]],
      decks:[[[117,205],[190,211],[213,232],[201,254],[140,276],[120,293],[86,273],[102,253]],[[548,196],[584,197],[590,225],[650,243],[647,264],[587,279],[542,253]]],
    },
    name:'Hồ làng', subtitle:'HỒ LÀNG', spawn:[36,309],bounds:wide,
    paths:[[[0,308],[66,311],[104,319],[150,308],[150,295],[130,275],[178,245]],[[150,308],[169,344],[205,365],[269,369],[326,350],[411,352],[484,324],[541,292],[559,257],[580,213]],[[150,308],[136,267],[124,231],[114,195],[117,160],[102,128]],[[484,324],[564,351],[623,370],[665,371],[719,377]]],
    trees:[[20,56],[55,93],[21,173],[73,227],[121,267],[197,377],[333,407],[432,413],[561,405],[690,336],[688,264],[685,157],[645,86],[605,51],[525,45],[441,35],[302,37],[194,52]],
    water:[rect(178,66,448,172)],
    objects:[{x:101,y:122,type:'pavilion',label:'Chòi nghỉ ven hồ',w:85,h:45}],
    exits:[exit(16,309,'Về vườn nhà','field',[679,402],'left')],
  },
  visit: {
    name:'Vườn hàng xóm', subtitle:'ĐANG GHÉ THĂM', spawn:[234,249], bounds:homesteadSize,
    exits:[exit(238,273,'Về đường làng','neighbors',neighborReturn,'down')],
  },
};
Object.assign(maps.visit,{
  blocks:homesteadBuildingBlocks,
  paths:maps.field.paths,trees:maps.field.trees,water:maps.field.water,
  objects:maps.field.objects.map(o=>o.type==='house'?{...o,style:'visit'}:o),
});
export const plotWorkActions=new Set(['till','plant','water','fertilize','spray','weed','harvest']);
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
      const hitBox=['field','visit'].includes(id)?homesteadBuildingHits[obj.type]:undefined;
      hotspots.push({...obj,y:obj.y+objectHotspotOffset,...obj.interaction,drawY,...(hitBox?{hitBox}:{})});
    }
  }
  for(const [x,y] of map.trees) {
    actors.push({x,y,type:'tree'});
    blocks.push(rect(x-5,y-8,10,11));
  }
  if((id==='field'||id==='visit')&&owner) {
    for(const [index,pet] of yardPets.entries())actors.push({type:'yard-pet',species:pet.species,index,x:pet.path[0][0],y:pet.path[0][1]});
    for(const [spot,{x,y}] of Object.entries(gardenDecorSpots)){
      const kind=gardenDecorAt(owner,spot);
      if(kind)actors.push({x,y,type:'garden-decor',kind,w:gardenDecorItems[kind].width,name:owner.name});
    }
    if((owner.workshop??0)>0){
      const workshop={...homesteadWorkshop,type:'workshop',level:owner.workshop,label:'Xưởng máy cấp '+owner.workshop};
      actors.push(workshop);blocks.push(rect(workshop.x-workshop.w/2+4,workshop.y-workshop.h+5,workshop.w-8,workshop.h-3));
      if(id==='field')hotspots.push({...workshop,y:workshop.y+12,hitBox:rect(workshop.x-workshop.w/2,workshop.y-workshop.h,workshop.w,workshop.h+18)});
    }
    for(const i of owner.plotIndexes??owner.plots.map((_,slot)=>mainPlotId(slot))) {
      const data=plotAt(owner,i);
      const pos=plotPosition(i);
      actors.push({...pos,type:'plot',index:i,data,compactAt:id==='field'?owner.soilCompactsAt?.[i]:undefined,visit:id==='visit'});
      const slot=mainPlotSlot(i);
      hotspots.push({...pos,y:pos.y+plotHotspotOffset,drawY:pos.y,type:'plot',index:i,data,label:slot>=0?'Ô đất '+(slot+1):'Vườn ô '+(gardenForPlot(i)+1)+' · luống '+(gardenPlotSlot(i)+1)});
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
      if(lot?.fence&&lot.kind==='garden')ground.push({...gardenParcelRect(i),type:'fence',style:lot.fence});
      if(lot?.kind==='garden'&&!lot.expanded)for(let slot=3;slot<6;slot++){
        const pos=plotPosition(gardenPlotId(i,slot));
        actors.push({...pos,type:'garden-reserve'});
        if(id==='field')hotspots.push({...pos,drawY:pos.y,y:pos.y+plotHotspotOffset,type:'land',index:i,label:'Mở thêm luống · Vườn ô '+(i+1)});
      }
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
        blocks.push(rect(pen.x+parcelShelter.x-parcelShelter.w/2+6,pen.y+29,parcelShelter.w-12,18));
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
    let seat=0;
    for(const [i,data] of farm.pens.entries()) {
      if(data.lot!==undefined)continue;
      const pos={...coopPosition(seat++),roam:coopAnimalRoam(data.kind),visualScale:coopAnimalScale(data.kind)};
      actors.push({...pos,type:'animal',index:i,data});
      hotspots.push({...pos,type:'animal',index:i,data,label:'Chăm vật nuôi'});
    }
  }
  const built=project=>snapshot.village?.built.some(entry=>entry.id===project);
  if(id==='lake'&&built('well')){
    actors.push(publicWell);
    hotspots.push(publicWellHotspot);
    blocks.push(rect(publicWell.x-16,publicWell.y-13,32,14));
  }
  for(const dock of docks[id]??[]){
    const batches=visiblePondBatches(owner,dock.index);
    actors.push({...dock,type:'dock',batches,upgraded:id==='lake'&&(snapshot.fishingLimit??fishing.limit)>fishing.limit});
    hotspots.push(dock);
  }

  if(id==='market') {
    const orders=snapshot.orders?.length;
    const board={x:170,y:252,w:48,h:58,type:'order-board',label:orders===undefined?'Bảng đơn hàng của làng':'Bảng đơn · '+orders+' đơn còn lại',
      upgraded:built('notice'),orders};
    actors.push(board);
    hotspots.push({...board,y:board.y+13,drawY:board.y-board.h/2});
    blocks.push(rect(board.x-20,board.y-8,40,9));
  }
  if(id==='neighbors') {
    if(built('hall')){
      const hall={...neighborHall,type:'village-hall',label:'Nhà sinh hoạt'};
      actors.push(hall);
      hotspots.push({...hall,y:hall.y+14});
      blocks.push(rect(hall.x-34,hall.y-72,68,73));
    }
    for(const [i,data] of neighborPage(snapshot,page).homes.entries()) {
      const pos=neighborPosition(i);
      const tier=neighborHouseTier(data.wealth??0);
      actors.push({...pos,...neighborLot,type:'neighbor',id:data.id,name:data.name,mine:data.mine,tier});
      blocks.push(rect(pos.x-70,pos.y-90,140,66),rect(pos.x-72,pos.y-15,53,16),rect(pos.x+19,pos.y-15,53,16));
      hotspots.push({...pos,...neighborLot,y:pos.y+16,drawY:pos.y-neighborLot.h/2,type:data.mine?'own-house':'neighbor',id:data.id,label:data.name+(data.mine?' · Nhà của bạn':'')});
    }
  }
  if(id==='field'||id==='visit')for(const area of ground.filter(a=>a.type==='fence'))actors.push({type:'fence-front',x:area.x+area.w/2,y:area.y+area.h,area});
  return {actors,hotspots,blocks,water,ground,bounds:map.bounds??size,navigation:map.navigation};
}
function insidePolygon(x,y,points){
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const [ax,ay]=points[i],[bx,by]=points[j];
    if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  }
  return inside;
}
export function walkable(scene,x,y){
  const bounds=scene.bounds??size;
  if(x<8||x>bounds.width-8||y<10||y>bounds.height-9||intrudes(x,y,scene.blocks,3))return false;
  if(scene.navigation){
    const {water,decks}=scene.navigation;
    return !insidePolygon(x,y,water)||decks.some(deck=>insidePolygon(x,y,deck));
  }
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
      // A narrow water gap can fall between adjacent grid nodes at a deck edge.
      if(scene.navigation&&!clearSegment(scene,node(c,r),node(nc,nr)))continue;
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
  if(scene.navigation){
    const cuts=[0,1],dx=bx-ax,dy=by-ay;
    for(const polygon of [scene.navigation.water,...scene.navigation.decks]){
      for(let i=0;i<polygon.length;i++){
        const [px,py]=polygon[i],[qx,qy]=polygon[(i+1)%polygon.length];
        const ex=qx-px,ey=qy-py,den=dx*ey-dy*ex;
        if(Math.abs(den)<1e-9)continue;
        const t=((px-ax)*ey-(py-ay)*ex)/den;
        const u=((px-ax)*dy-(py-ay)*dx)/den;
        if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);
      }
    }
    cuts.sort((a,b)=>a-b);
    for(let i=1;i<cuts.length;i++){
      const t=(cuts[i-1]+cuts[i])/2;
      if(!walkable(scene,ax+dx*t,ay+dy*t))return false;
    }
  }
  const distance=Math.hypot(bx-ax,by-ay);
  const pieces=Math.max(1,Math.ceil(distance/2));
  for(let i=0;i<=pieces;i++){
    const fraction=i/pieces;
    if(!walkable(scene,ax+(bx-ax)*fraction,ay+(by-ay)*fraction))return false;
  }
  return true;
}
