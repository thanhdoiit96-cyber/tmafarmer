import {features, maps, plotPosition, route, size, walkable} from './world-layout.mjs';
import {landscapeFor} from './landscapes.mjs';
import {taskStyles} from './tasks.mjs';
import {actor, artReady, atmosphere, drawTask, gate, grass, landscapeEntity, landscapeLife, person, water} from './world-art.mjs';

const directions={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
const deltas={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
const range=31;
const distance=(p,x,y)=>Math.hypot(p.x-x,p.y-y);
const effectStyle={
  till:['#b68756','#e2b983'],water:['#65b9d1','#abe1e7'],plant:['#5eac61','#d1e4a0'],fertilize:['#dcaf56','#f6d795'],
  spray:['#8fbb7f','#cde2ae'],harvest:['#df9b43','#ffe387'],feed:['#bf9a58','#f4d986'],
  collect:['#e7c674','#fff0c8'],steal:['#df9e5a','#ffeab1'],upgrade:['#d6a354','#f9dd89'],
  aquaStock:['#81b792','#bce6c2'],aquaFeed:['#c49054','#ead38d'],aquaHarvest:['#79c5cb','#d0f1dd'],
  cast:['#87d1d7','#b9f0dd'],reel:['#84ced2','#e2f4c2'],
  animal:['#e0b982','#f5dbaa'],deal:['#dcaf57','#f7e797'],sell:['#dcaf57','#f7e797'],rest:['#e9c77d','#fff0b5'],
  buy:['#dcaf57','#f7e797'],list:['#dcaf57','#f7e797'],order:['#dcaf57','#f7e797'],
};

export function createWorld(root, onInteract) {
  const canvas=root.querySelector('canvas'), context=canvas.getContext('2d');
  const terrain=document.createElement('canvas');
  const resolution=2;
  canvas.width=size.width*resolution;
  canvas.height=size.height*resolution;
  const ctx=terrain.getContext('2d');
  context.scale(resolution,resolution);
  void artReady.then(()=>{if(sceneId)paintTerrain();});
  const keys=new Set();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const interacted=root.querySelector('[data-world-act]');
  const hint=root.querySelector('[data-world-hint]');
  const radar=root.querySelector('[data-radar]'), mini=radar.getContext('2d');
  let sceneId, scene, snapshot, currentVisit, selectedPlot, camera={x:0,y:0}, bounds=size, activePage, marks=[];
  let observedAt=performance.now(), terrainKey='', peers=new Map(), scenery=[];

  function paintTerrain(){
    terrain.width=bounds.width*resolution;
    terrain.height=bounds.height*resolution;
    ctx.scale(resolution,resolution);
    grass(ctx,maps[sceneId],sceneId,scene);
  }
  function shiftCamera(){
    camera.x=Math.min(bounds.width-size.width,Math.max(0,x-size.width*.5));
    camera.y=Math.min(bounds.height-size.height,Math.max(0,y-size.height*(sceneId==='field'||sceneId==='visit'?.78:.71)));
  }
  function drawRadar(){
    if(bounds.width===size.width)return;
    const sx=radar.width/bounds.width,sy=radar.height/bounds.height;
    mini.drawImage(terrain,0,0,radar.width,radar.height);
    mini.strokeStyle='#f8e8aa';mini.lineWidth=1;
    mini.strokeRect(camera.x*sx,camera.y*sy,size.width*sx,size.height*sy);
    for(const actor of scene.actors){
      if(actor.type!=='dock')continue;
      mini.fillStyle='#b3eef1';mini.fillRect(actor.x*sx-1,actor.y*sy-1,3,3);
    }
    mini.fillStyle='#fff5c5';mini.beginPath();mini.arc(x*sx,y*sy,2.1,0,2*Math.PI);mini.fill();
  }
  let x=236,y=221,facing='down',walking=false,waypoints=[],pending,onArrival,active,previousTime=0,poseUntil=0,pose='',effects=[];
  let frameStarted=false;

  function setPosition([px,py],dir='down'){
    x=px;y=py;facing=dir;stop();poseUntil=0;effects=[];
    canvas.dataset.position=Math.round(x)+','+Math.round(y);
  }
  function stop() {waypoints=[];pending=null;onArrival=null;walking=false;}
  function closest() {
    return scene?.hotspots.reduce((best,p)=>distance(p,x,y)<=range&&(!best||distance(p,x,y)<distance(best,x,y))?p:best,null);
  }
  function refreshHint(){
    active=closest();
    const text=active?active.label:'Chọn một điểm trên bản đồ';
    if(hint.textContent!==text) hint.textContent=text;
    interacted.disabled=!active;
  }
  function sync(id,data,{neighbor,selection,page=0,arrival,tasks=[]}={}){
    const visitChanged=neighbor?.id!==currentVisit;
    if(data!==snapshot)observedAt=performance.now();
    snapshot=data;selectedPlot=selection;
    if(sceneId!==id||id==='visit'&&visitChanged||arrival){
      sceneId=id;
      scenery=landscapeFor(id).decor.map(item=>({...item,type:'scenery'}));
      root.dataset.scene=id;
      bounds=maps[id].bounds??size;
      root.dataset.wide=String(bounds.width>size.width);
      setPosition(arrival??maps[id].spawn);
      shiftCamera();
      peers.clear();
      terrainKey='';
    }
    if(activePage!==page)stop();
    activePage=page;
    currentVisit=neighbor?.id;
    scene=features(id,data,neighbor,page);
    const positionByTask=new Map(scene.hotspots.map(p=>[p.type+':'+p.index,p]));
    marks=id==='field'||id==='coop'?tasks.flatMap(task=>{
      const point=positionByTask.get(task.kind+':'+task.index);
      if(!point)return [];
      return [{x:point.x,y:(point.drawY??point.y)-(task.kind==='plot'?19:task.kind==='animal'?32:22),style:taskStyles[task.type]}];
    }):[];
    const visual=JSON.stringify(scene.ground);
    if(terrainKey!==visual){
      terrainKey=visual;
      paintTerrain();
    }
    canvas.dataset.map=id;
    canvas.setAttribute('aria-label','Bản đồ '+(id==='visit'&&neighbor?neighbor.name:maps[id].name));
    refreshHint();
    if(!frameStarted){frameStarted=true;requestAnimationFrame(frame);}
  }
  function use(target=closest()){
    if(!target)return;
    stop();
    onInteract(target);
    refreshHint();
  }
  function walkTo(px,py,target,callback) {
    const path=route(scene,[x,y],[px,py]);
    if(!path)return false;
    waypoints=path;
    pending=target??null;
    onArrival=callback;
    return true;
  }
  function approach(type,index,callback){
    const points=scene?.hotspots.filter(p=>p.type===type&&(index===undefined||index===p.index))??[];
    const dock=points.sort((a,b)=>distance(a,x,y)-distance(b,x,y))[0];
    if(!dock)return false;
    if(distance(dock,x,y)<16){callback?.();return true;}
    return walkTo(dock.x,dock.y,dock,callback);
  }
  function move(dx,dy,dt) {
    const len=Math.hypot(dx,dy);
    if(len<.001)return;
    const dist=Math.min(len,96*dt), mx=dx/len*dist,my=dy/len*dist;
    if(Math.abs(dx)>Math.abs(dy)) facing=dx<0?'left':'right';
    else if(dy) facing=dy<0?'up':'down';
    const px=x,py=y;
    if(walkable(scene,x+mx,y)) x+=mx;
    if(walkable(scene,x,y+my)) y+=my;
    walking=Math.hypot(x-px,y-py)>.01;
    if(walking)canvas.dataset.position=Math.round(x)+','+Math.round(y);
  }
  function particle(input) {
    const palette=effectStyle[input.action];
    if(!palette||!scene)return;
    let target=null;
    if(['till','water','plant','fertilize','spray','harvest'].includes(input.action)&&sceneId==='field') target=plotPosition(input.index);
    if(['feed','collect'].includes(input.action)&&sceneId==='coop') target=scene.hotspots.find(a=>a.type==='animal'&&a.index===input.index);
    if(input.action.startsWith('aqua')&&sceneId==='field') target=scene.hotspots.find(a=>a.type==='pond'&&a.index===input.index);
    if(input.action==='cast'||input.action==='reel') target=scene.hotspots.filter(a=>a.type.endsWith('fishing')).sort((a,b)=>distance(a,x,y)-distance(b,x,y))[0];
    if(input.action==='steal'&&sceneId==='visit') target=input.source==='garden'?plotPosition(input.index):scene.hotspots.find(a=>a.type==='barn');
    const spot=target??{x,y};
    pose=input.action;
    poseUntil=performance.now()+680;
    if((input.action==='cast'||input.action==='reel')&&target&&distance(target,x,y)<64){
      facing=target.side;
    } else if(target&&distance(target,x,y)<64) {
      const dx=target.x-x,dy=target.y-y;
      facing=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
    }
    effects.push({x:spot.x,y:spot.y,time:performance.now(),palette});
  }
  function drawEffects(now) {
    effects=effects.filter(e=>now-e.time<780);
    for(const e of effects)for(let n=0;n<(reduce.matches?4:12);n++) {
      const life=reduce.matches?.27:(now-e.time)/780, angle=n*2.399;
      context.globalAlpha=Math.max(0,1-life);
      context.fillStyle=e.palette[n%2];
      const px=e.x+Math.cos(angle)*life*(10+n*2), py=e.y-4+Math.sin(angle)*life*(10+n)-life*22;
      context.fillRect(Math.round(px),Math.round(py),n%3===0?4:2,n%3===0?3:2);
    }
    context.globalAlpha=1;
  }
  function frame(now){
    const dt=Math.min(Math.max(0,(now-previousTime)/1000),.035);
    previousTime=now;
    if(!scene||document.hidden){requestAnimationFrame(frame);return;}
    walking=false;
    if(!document.querySelector('dialog[open]')){
      if(keys.size) {
        const [dx,dy]=[...keys].reduce(([a,b],key)=>[a+deltas[key][0],b+deltas[key][1]],[0,0]);
        move(dx*100,dy*100,dt);
      } else if(waypoints.length) {
        const [px,py]=waypoints[0];
        if(Math.hypot(px-x,py-y)<1.1) {
          waypoints.shift();
          if(!waypoints.length&&pending){
            const next=pending, callback=onArrival;
            stop();
            if(distance(next,x,y)<range){
              if(callback)callback();
              else use(next);
            }
          }
        } else {
          move(px-x,py-y,dt);
          if(!walking)stop();
        }
      }
    }
    refreshHint();
    const t=now/1000, ambient=reduce.matches?0:t;
    shiftCamera();
    context.drawImage(terrain,camera.x*resolution,camera.y*resolution,size.width*resolution,size.height*resolution,0,0,size.width,size.height);
    context.save();context.translate(-camera.x,-camera.y);
    const wind=snapshot.weather.id==='storm'?2.5:snapshot.weather.id==='wind'?1.8:1;
    water(context,scene,ambient,wind);
    const highlight=active?.type==='plot'?active:null;
    if(active&&active.type!=='plot'&&active.type!=='exit'){
      context.strokeStyle='#fff0b5';
      context.lineWidth=1.4;
      context.beginPath();
      context.ellipse(active.x,active.y-3,7,3.5,0,0,Math.PI*2);
      context.stroke();
    }
    if(sceneId==='field'&&Number.isInteger(selectedPlot)){
      const {x:px,y:py}=plotPosition(selectedPlot);
      context.strokeStyle='#f7e4a3';
      context.lineWidth=1.2;
      context.beginPath();context.roundRect(px-24,py-14,48,27,4);context.stroke();
    }
    if(highlight&&sceneId==='visit'){
      context.fillStyle='#efe1a49c';
      context.fillRect(highlight.x-25,highlight.drawY-15,50,29);
    }
    for(const peer of peers.values()){
      const blend=reduce.matches?1:Math.min(1,dt*8);
      peer.x+=(peer.goalX-peer.x)*blend;peer.y+=(peer.goalY-peer.y)*blend;
    }
    const sprites=[...scene.actors,...scenery,...peers.values(),{type:'player',x,y}].sort((a,b)=>a.y-b.y);
    const gameNow=snapshot.now+Math.floor((now-observedAt)/1000);
    const daylight=Math.max(0,Math.min(1,1-(snapshot.dayEnds-gameNow)/snapshot.dayLength));
    const cast=snapshot.me.fishing?.cast;
    const fishingHere=cast&&cast.expires>=gameNow&&(sceneId==='lake'&&cast.source==='public'||sceneId==='visit'&&cast.source==='pond'&&cast.target===currentVisit);
    if(fishingHere&&active?.type.endsWith('fishing')&&cast.ready<=gameNow){
      const bob=Math.sin(ambient*9)*1.7;
      const shift={left:[-13,0],right:[13,0],up:[0,-18]}[active.side];
      context.fillStyle='#fff0b5';context.beginPath();context.arc(active.x+shift[0],active.y+shift[1]+bob,2.1,0,Math.PI*2);context.fill();
    }
    for(const a of sprites) {
      if(a.x<camera.x-75||a.y<camera.y-28||a.x>camera.x+size.width+75||a.y>camera.y+size.height+95)continue;
      if(a.type==='player')person(context,x,y,facing,reduce.matches?0:t,walking,undefined,now<poseUntil?pose:fishingHere&&!walking?'cast':'');
      else if(a.type==='peer'){
        person(context,a.x,a.y,a.facing,ambient,a.walking,'trader');
        context.font='500 6px sans-serif';context.textAlign='center';
        const name=a.name.slice(0,24), width=context.measureText(name).width+7;
        context.fillStyle='#254438d9';context.beginPath();context.roundRect(a.x-width*.5,a.y-38,width,9,2);context.fill();
        context.fillStyle='#fff3d3';context.fillText(name,a.x,a.y-31.6);
      } else if(a.type==='scenery')landscapeEntity(context,a,ambient,daylight);
      else actor(context,a.type==='neighbor'?{...a,selected:(pending?.id===a.id||active?.id===a.id)}:a,ambient,snapshot);
    }
    if(sceneId==='home'){
      const bed=scene.hotspots.find(item=>item.type==='bed');
      const resting=snapshot.me.wellness.restUntil>gameNow;
      context.save();
      context.font='700 8px system-ui';context.textAlign='center';
      context.fillStyle='#41563a';context.beginPath();
      context.roundRect(bed.x-83,bed.y-25,66,13,6);context.fill();
      context.fillStyle='#fff5d5';
      context.fillText(resting?'Đang nghỉ':'Giường nghỉ',bed.x-50,bed.y-16);
      if(resting&&distance(bed,x,y)<32){
        const drift=reduce.matches?0:Math.sin(ambient*3)*1.8;
        context.fillText('Z',x+12,y-32+drift);
        context.fillText('z',x+19,y-39+drift);
      }
      context.restore();
    } else if(!reduce.matches)landscapeLife(context,sceneId,ambient);
    for(const item of scene.hotspots)if(item.type==='exit')gate(context,item,ambient);
    for(const mark of marks)if(mark.x>=camera.x&&mark.x<=camera.x+size.width&&mark.y>=camera.y&&mark.y<=camera.y+size.height)drawTask(context,mark.x,mark.y+Math.sin(ambient*2+mark.x)*.65,mark.style);
    drawEffects(now);
    context.restore();
    if(sceneId!=='home')atmosphere(context,ambient,snapshot.weather.id,reduce.matches,daylight);
    drawRadar();
    requestAnimationFrame(frame);
  }
  const down=event=>{
    if(!scene||event.ctrlKey||event.altKey||event.metaKey||document.querySelector('dialog[open]')||event.target.matches('input,select,textarea,[contenteditable="true"]'))return;
    const letter=event.key.length===1?event.key.toLowerCase():event.key;
    if(letter==='e'||(letter===' '&&event.target===canvas)){
      event.preventDefault();
      if(!event.repeat)use();
      return;
    }
    const direction=directions[letter];
    if(!direction)return;
    event.preventDefault(); stop(); keys.add(direction);
  };
  window.addEventListener('keydown',down);
  window.addEventListener('keyup',e=>keys.delete(directions[e.key.length===1?e.key.toLowerCase():e.key]));
  window.addEventListener('blur',()=>keys.clear());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
  canvas.addEventListener('pointerup',event=>{
    if(!scene||event.button!==0) return;
    const bound=canvas.getBoundingClientRect();
    const px=camera.x+(event.clientX-bound.left)*size.width/bound.width, py=camera.y+(event.clientY-bound.top)*size.height/bound.height;
    const target=scene.hotspots.reduce((best,p)=>{
      const distance=Math.hypot(px-p.x,py-(p.drawY??(p.type==='exit'?p.y:p.y-10)));
      const radius=p.type==='plot'?23:p.type==='exit'?16:p.w?Math.min(p.w*.5,32):20;
      return distance<=radius&&(!best||distance<best.distance)?{p,distance}:best;
    },null)?.p;
    if(target&&distance(target,x,y)<range)use(target);
    else walkTo(target?.x??px,target?.y??py,target);
  });
  root.querySelectorAll('[data-direction]').forEach(button=>{
    const direction=button.dataset.direction;
    button.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      button.setPointerCapture(event.pointerId);stop();keys.add(direction);
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>keys.delete(direction));
  });
  interacted.addEventListener('click',()=>use());
  function setPeers(players){
    const next=new Map();
    for(const player of players){
      const previous=peers.get(player.player);
      next.set(player.player,{type:'peer',name:player.name,x:previous?.x??player.x,y:previous?.y??player.y,goalX:player.x,goalY:player.y,facing:player.facing,walking:!!player.walking});
    }
    peers=next;
  }
  const position=()=>({x:Math.round(x),y:Math.round(y),facing,walking});
  return {sync,particle,approach,position,setPeers};
}
