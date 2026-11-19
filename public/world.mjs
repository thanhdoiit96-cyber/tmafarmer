import {gardenHelperPosition,gardenHelperStart} from './garden-helper.mjs';
import {features, interactionRange as range, maps, plotPosition, route, size, walkable} from './world-layout.mjs';
import {landscapeFor} from './landscapes.mjs';
import {pixelViewport} from './pixel/frames.mjs';
import {speechRange} from './game.mjs';
import {cropTaskPosition} from './pixel/crop-layout.mjs';
import {taskStyles} from './tasks.mjs';
import {actionPoseSeconds, facingFromDelta, fishingBobber, gardenHelperPose, playerSpeed} from './world-motion.mjs';
import {actor, artReady, atmosphere, createMapCursor, drawFishing, drawGardenDecor, drawGardenHelper, drawMapPointer, drawSpeech, drawTask, gate, grass, landscapeEntity, landscapeLife, drawPerson, water} from './world-art.mjs';

const directions={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
const deltas={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
const distance=(p,x,y)=>Math.hypot(p.x-x,p.y-y);
const effectStyle={
  till:['#b68756','#e2b983'],water:['#65b9d1','#abe1e7'],plant:['#5eac61','#d1e4a0'],fertilize:['#dcaf56','#f6d795'],
  spray:['#8fbb7f','#cde2ae'],harvest:['#df9b43','#ffe387'],feed:['#bf9a58','#f4d986'],
  collect:['#e7c674','#fff0c8'],steal:['#df9e5a','#ffeab1'],upgrade:['#d6a354','#f9dd89'],
  aquaStock:['#81b792','#bce6c2'],aquaFeed:['#c49054','#ead38d'],aquaHarvest:['#79c5cb','#d0f1dd'],
  cast:['#87d1d7','#b9f0dd'],reel:['#84ced2','#e2f4c2'],
  animal:['#e0b982','#f5dbaa'],deal:['#dcaf57','#f7e797'],sell:['#dcaf57','#f7e797'],rest:['#e9c77d','#fff0b5'],
  buy:['#dcaf57','#f7e797'],list:['#dcaf57','#f7e797'],order:['#dcaf57','#f7e797'],craft:['#c69357','#f9dea2'],
};

export function createWorld(root, onInteract, landscape) {
  const canvas=root.querySelector('canvas'), context=canvas.getContext('2d');
  const scale=pixelViewport.width/size.width;
  canvas.width=pixelViewport.width;
  canvas.height=pixelViewport.height;
  context.setTransform(scale,0,0,scale,0,0);
  context.imageSmoothingEnabled=false;
  canvas.style.cursor=createMapCursor();
  const terrain=document.createElement('canvas');
  const ctx=terrain.getContext('2d');
  void artReady.then(()=>{if(sceneId)paintTerrain();});
  const keys=new Set();
  const touchKeys=new Map();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const interacted=root.querySelector('[data-world-act]');
  const hint=root.querySelector('[data-world-hint]');
  const radar=root.querySelector('[data-radar]'), mini=radar.getContext('2d');
  let sceneId, scene, snapshot, currentVisit, selectedPlot, camera={x:0,y:0}, bounds=size, view=size, activePage, marks=[];
  let observedAt=performance.now(), terrainKey='', peers=new Map(), speech=new Map(), scenery=[];
  let pointer=null, routeMarker=null;

  function paintTerrain(){
    terrain.width=Math.ceil(bounds.width*scale);
    terrain.height=Math.ceil(bounds.height*scale);
    ctx.scale(scale,scale);
    ctx.imageSmoothingEnabled=false;
    grass(ctx,maps[sceneId],sceneId,scene);
  }
  function sizeCanvas(){
    let width=pixelViewport.width, height=pixelViewport.height;
    if(landscape.matches){
      const rect=canvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const aspect=rect.width/rect.height;
      width=Math.max(1,Math.round(Math.min(bounds.width,size.height*aspect)*scale));
      height=Math.max(1,Math.min(pixelViewport.height,Math.round(width/aspect)));
    }
    if(canvas.width===width&&canvas.height===height)return;
    canvas.width=width;
    canvas.height=height;
    context.setTransform(scale,0,0,scale,0,0);
    context.imageSmoothingEnabled=false;
    view={width:width/scale,height:height/scale};
    pointer=null;
    shiftCamera(true);
  }
  new ResizeObserver(sizeCanvas).observe(canvas);
  landscape.addEventListener('change',sizeCanvas);

  function shiftCamera(immediate=false){
    const anchor=(sceneId==='field'||sceneId==='visit') ? .87 : .71;
    const horizontalInset=view.width*.22;
    const upperInset=view.height*(anchor-.12),lowerInset=view.height*(anchor+.12);
    let left=camera.x,top=camera.y;
    if(immediate) {
      left=x-view.width*.5;
      top=y-view.height*anchor;
    } else {
      const screenX=x-camera.x,screenY=y-camera.y;
      if(screenX<horizontalInset)left=x-horizontalInset;
      else if(screenX>view.width-horizontalInset)left=x-(view.width-horizontalInset);
      if(screenY<upperInset)top=y-upperInset;
      else if(screenY>lowerInset)top=y-lowerInset;
    }
    left=Math.max(0,Math.min(bounds.width-view.width,left));
    top=Math.max(0,Math.min(bounds.height-view.height,top));
    camera.x=Math.round(left*scale)/scale;
    camera.y=Math.round(top*scale)/scale;
  }
  function drawRadar(){
    if(root.dataset.wide==='false')return;
    const sx=radar.width/bounds.width,sy=radar.height/bounds.height;
    mini.drawImage(terrain,0,0,radar.width,radar.height);
    mini.strokeStyle='#f8e8aa';mini.lineWidth=1;
    mini.strokeRect(camera.x*sx,camera.y*sy,view.width*sx,view.height*sy);
    for(const actor of scene.actors){
      if(actor.type!=='dock')continue;
      mini.fillStyle='#b3eef1';mini.fillRect(actor.x*sx-1,actor.y*sy-1,3,3);
    }
    mini.fillStyle='#fff5c5';mini.beginPath();mini.arc(x*sx,y*sy,2.1,0,2*Math.PI);mini.fill();
  }
  let x=236,y=221,facing='down',walking=false,walkDistance=0,waypoints=[],pending,onArrival,active,previousTime=0,poseStarted=0,pose='',effects=[];
  let fishingDock=null,caughtFish=false,posePlot;
  let frameStarted=false;

  function setPosition([px,py],dir='down'){
    x=px;y=py;facing=dir;stop();walkDistance=0;pose='';effects=[];pointer=null;routeMarker=null;fishingDock=null;
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
    if(interacted.disabled===Boolean(active)){
      interacted.disabled=!active;
      root.toggleAttribute('data-interactable',Boolean(active));
    }
  }
  let helperJob, helperKey='', helperPaths=[], helperTime=0;
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
      sizeCanvas();
      shiftCamera(true);
      peers.clear();
      speech.clear();
      terrainKey='';
    }
    if(activePage!==page)stop();
    activePage=page;
    currentVisit=neighbor?.id;
    scene=features(id,data,neighbor,page);
    helperJob=(id==='field'?data.me:id==='visit'?neighbor:null)?.gardenHelperJob;
    const nextHelperKey=helperJob?[id,neighbor?.id??data.me.id,helperJob.startedAt].join(':'):'';
    if(nextHelperKey!==helperKey){
      helperKey=nextHelperKey;
      helperTime=0;
      let from=gardenHelperStart;
      helperPaths=helperJob?.steps.map(({index})=>{
        const to=gardenHelperPosition(index);
        const path=[from,...(route(scene,from,to)??[to])];
        from=path.at(-1);
        return path;
      })??[];
    }
    const positionByTask=new Map(scene.hotspots.map(p=>[p.type+':'+p.index,p]));
    marks=id==='field'||id==='coop'?tasks.flatMap(task=>{
      const point=positionByTask.get(task.kind+':'+task.index);
      if(!point)return [];
      return [{point,style:taskStyles[task.type]}];
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
  function pointerLocation(event){
    const bounds=canvas.getBoundingClientRect();
    return {x:(event.clientX-bounds.left)*view.width/bounds.width,y:(event.clientY-bounds.top)*view.height/bounds.height};
  }
  function targetAt(px,py){
    return scene.hotspots.reduce((best,p)=>{
      const dx=px-p.x,dy=py-(p.drawY??(p.type==='exit'?p.y:p.y-10));
      const distance=Math.hypot(dx,dy);
      const radius=p.type==='plot'?23:p.type==='exit'?16:p.w?Math.min(p.w*.5,32):20;
      const hit=p.type==='house'?Math.abs(dx)<=p.w/2&&Math.abs(dy)<=p.h/2+8:distance<=radius;
      return hit&&(!best||distance<best.distance)?{p,distance}:best;
    },null)?.p;
  }
  function approach(type,index,callback){
    const points=scene?.hotspots.filter(p=>p.type===type&&(index===undefined||index===p.index))??[];
    const dock=points.sort((a,b)=>distance(a,x,y)-distance(b,x,y))[0];
    if(!dock)return false;
    if(distance(dock,x,y)<16){stop();callback?.();return true;}
    return walkTo(dock.x,dock.y,dock,callback);
  }
  function move(dx,dy,dt) {
    const len=Math.hypot(dx,dy);
    if(len<.001)return;
    const dist=Math.min(len,playerSpeed*dt), mx=dx/len*dist,my=dy/len*dist;
    const px=x,py=y;
    if(walkable(scene,x+mx,y)) x+=mx;
    if(walkable(scene,x,y+my)) y+=my;
    const traveled=Math.hypot(x-px,y-py);
    walking=traveled>.001;
    if(walking){
      walkDistance+=traveled;
      facing=facingFromDelta(x-px,y-py);
      pose='';
      canvas.dataset.position=Math.round(x)+','+Math.round(y);
    }
  }
  function nearestFishingDock(index){
    const type=sceneId==='visit'?'neighbor-fishing':'public-fishing';
    return scene.hotspots.filter(a=>a.type===type&&(index===undefined||a.index===index))
      .sort((a,b)=>distance(a,x,y)-distance(b,x,y))[0];
  }
  function particle(input,{cast,caught}={}) {
    const palette=effectStyle[input.action];
    if(!palette||!scene)return;
    let target=null;
    if(['till','water','plant','fertilize','spray','harvest'].includes(input.action)&&sceneId==='field') target=plotPosition(input.index);
    if(['feed','collect'].includes(input.action)&&sceneId==='coop') target=scene.hotspots.find(a=>a.type==='animal'&&a.index===input.index);
    if(input.action.startsWith('aqua')&&sceneId==='field') target=scene.hotspots.find(a=>a.type==='pond'&&a.index===input.index);
    if(input.action==='cast'||input.action==='reel'){
      const dock=nearestFishingDock(cast?.index);
      if(!dock||distance(dock,x,y)>=range)return;
      fishingDock=dock;
      caughtFish=!!caught;
      facing=dock.side;
      target=fishingBobber(dock);
    }
    if(input.action==='steal'&&sceneId==='visit') target=input.source==='garden'?plotPosition(input.index):scene.hotspots.find(a=>a.type==='barn');
    const spot=target??{x,y};
    pose=input.action;
    posePlot=input.index;
    poseStarted=performance.now();
    if(input.action!=='cast'&&input.action!=='reel'&&target&&distance(target,x,y)<64) {
      facing=facingFromDelta(target.x-x,target.y-y);
    }
    const delay={till:350,plant:320,cast:420}[input.action]??0;
    effects.push({x:spot.x,y:spot.y,time:poseStarted+delay,palette});
    if(input.action==='plant'&&target&&!reduce.matches){
      effects.push({x:spot.x,y:spot.y,fromX:x,fromY:y-14,time:poseStarted+90,palette,seeds:true});
    }
  }
  function drawEffects(now) {
    effects=effects.filter(e=>now-e.time<780);
    for(const e of effects){
      if(now<e.time)continue;
      if(e.seeds){
        for(let i=0;i<5;i++){
          const travel=(now-e.time-i*26)/260;
          if(travel<0||travel>1)continue;
          context.fillStyle=i%2?'#e1bd79':'#c3914c';
          context.fillRect(Math.round(e.fromX+(e.x-e.fromX+i*2-4)*travel),Math.round(e.fromY+(e.y-e.fromY)*travel-13*Math.sin(Math.PI*travel)),2,2);
        }
        continue;
      }
      for(let n=0;n<(reduce.matches?4:12);n++) {
        const life=reduce.matches?.27:(now-e.time)/780, angle=n*2.399;
        context.globalAlpha=Math.max(0,1-life);
        context.fillStyle=e.palette[n%2];
        const px=e.x+Math.cos(angle)*life*(10+n*2), py=e.y-4+Math.sin(angle)*life*(10+n)-life*22;
        context.fillRect(Math.round(px),Math.round(py),n%3===0?4:2,n%3===0?3:2);
      }
      context.globalAlpha=1;
    }
  }
  function frame(now){
    const dt=Math.min(Math.max(0,(now-previousTime)/1000),.035);
    previousTime=now;
    if(!scene||document.hidden){requestAnimationFrame(frame);return;}
    walking=false;
    if(!document.querySelector('dialog[open]')){
      if(keys.size||touchKeys.size) {
        const held=new Set([...keys,...touchKeys.values()]);
        const [dx,dy]=[...held].reduce(([a,b],key)=>[a+deltas[key][0],b+deltas[key][1]],[0,0]);
        move(dx*100,dy*100,dt);
      } else if(waypoints.length) {
        while(waypoints.length&&Math.hypot(waypoints[0][0]-x,waypoints[0][1]-y)<1.1){
          waypoints.shift();
        }
        if(waypoints.length){
          const [px,py]=waypoints[0];
          move(px-x,py-y,dt);
          if(!walking&&dt>0)stop();
        } else if(pending){
          const next=pending, callback=onArrival;
          stop();
          if(distance(next,x,y)<range){
            if(callback)callback();
            else use(next);
          }
        }
      }
    }
    if(!walking)walkDistance=0;
    refreshHint();
    const t=now/1000, ambient=reduce.matches?0:t;
    shiftCamera();
    const {x:cameraX,y:cameraY}=camera;
    const frameX=Math.round(cameraX*scale),frameY=Math.round(cameraY*scale);
    context.drawImage(terrain,frameX,frameY,canvas.width,canvas.height,0,0,view.width,view.height);
    context.save();context.translate(-cameraX,-cameraY);
    const wind=snapshot.weather.id==='storm'?2.5:snapshot.weather.id==='wind'?1.8:1;
    water(context,scene,ambient,wind);
    const hovered=pointer?targetAt(cameraX+pointer.x,cameraY+pointer.y):null;
    const highlight=hovered??active;
    if(highlight&&highlight.type!=='plot'&&highlight.type!=='exit'){
      drawMapPointer(context,highlight.x,highlight.y-2,ambient,{opacity:hovered?1:.68});
    }
    if(routeMarker){
      if(!waypoints.length&&routeMarker.until===Infinity)routeMarker.until=now+500;
      if(now>=routeMarker.until)routeMarker=null;
      else drawMapPointer(context,routeMarker.x,routeMarker.y,ambient,{blocked:routeMarker.blocked,opacity:Math.min(1,(routeMarker.until-now)/280)});
    }
    const highlightedPlot=highlight?.type==='plot'?highlight.index:null;
    for(const index of new Set([sceneId==='field'?selectedPlot:null,highlightedPlot])){
      if(!Number.isInteger(index))continue;
      const {x:px,y:py}=plotPosition(index);
      context.strokeStyle=index===highlightedPlot?'#fff1bd':'#dfb873';
      context.lineWidth=1.6;
      context.beginPath();context.roundRect(px-24.5,py-14.5,49,28,4);context.stroke();
    }
    for(const peer of peers.values()){
      const dx=peer.goalX-peer.x,dy=peer.goalY-peer.y;
      const remaining=Math.hypot(dx,dy);
      peer.walking=!reduce.matches&&remaining>.55&&dt>0;
      if(peer.walking){
        const traveled=Math.min(remaining,dt*playerSpeed);
        const blend=traveled/remaining;
        peer.x+=dx*blend;peer.y+=dy*blend;
        peer.walkDistance+=traveled;
        peer.facing=facingFromDelta(dx,dy);
      }else{
        if(reduce.matches||remaining<=.55){
          peer.x=peer.goalX;peer.y=peer.goalY;
        }
        peer.walkDistance=0;
        peer.facing=peer.goalFacing;
      }
    }
    const player={type:'player',player:snapshot.me.id,avatar:snapshot.me.avatar,x,y};
    const observed=snapshot.now+(now-observedAt)/1000;
    helperTime=Math.max(helperTime,observed);
    const helper=gardenHelperPose(helperJob,helperPaths,helperTime);
    const sprites=[...scene.actors,...scenery,...peers.values(),player,...(helper?[helper]:[])].sort((a,b)=>a.y-b.y);
    const gameNow=snapshot.now+Math.floor((now-observedAt)/1000);
    const daylight=Math.max(0,Math.min(1,1-(snapshot.dayEnds-gameNow)/snapshot.dayLength));
    const cast=snapshot.me.fishing?.cast;
    const fishingHere=cast&&cast.expires>=gameNow&&(sceneId==='lake'&&cast.source==='public'||sceneId==='visit'&&cast.source==='pond'&&cast.target===currentVisit);
    const dock=fishingDock??(fishingHere&&nearestFishingDock(cast.index));
    for(const a of sprites) {
      if(a.x<cameraX-75||a.y<cameraY-28||a.x>cameraX+view.width+75||a.y>cameraY+view.height+95)continue;
      if(a.type==='player'){
        const elapsed=(now-poseStarted)/1000;
        const action=!walking&&elapsed<(actionPoseSeconds[pose]??.75)?pose:'';
        const fishing=!walking&&dock&&distance(dock,x,y)<range&&(action==='cast'||action==='reel'||fishingHere);
        const poseTime=reduce.matches?(actionPoseSeconds[action]??0)*.55:elapsed;
        drawPerson(context,x,y,fishing?dock.side:facing,ambient,{avatar:a.avatar,walking:walking&&!reduce.matches,walkDistance,action,elapsed:poseTime});
        if(fishing)drawFishing(context,x,y,dock,{action:action==='cast'||action==='reel'?action:'hold',
          elapsed:poseTime,ambient,bite:!!cast&&cast.ready<=gameNow,caught:caughtFish,reduced:reduce.matches});
      }
      else if(a.type==='peer'){
        drawPerson(context,a.x,a.y,a.facing,ambient,{avatar:a.avatar,walking:a.walking,walkDistance:a.walkDistance,style:'peer'});
        context.font='500 6px sans-serif';context.textAlign='center';
        const name=a.name.slice(0,24), width=context.measureText(name).width+7;
        const labelY=a.y-52;
        context.fillStyle='#254438d9';context.beginPath();context.roundRect(a.x-width*.5,labelY,width,9,2);context.fill();
        context.fillStyle='#fff3d3';context.fillText(name,a.x,labelY+6.4);
      } else if(a.type==='scenery')landscapeEntity(context,a,ambient,daylight);
      else if(a.type==='garden-decor')drawGardenDecor(context,a,daylight);
      else if(a.type==='garden-helper')drawGardenHelper(context,a,a.plot===undefined?null:plotPosition(a.plot),reduce.matches);
      else if(a.type==='plot'&&a.index===posePlot&&pose==='plant'&&!reduce.matches&&now-poseStarted<380)
        actor(context,{...a,data:null},ambient,snapshot);
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
      context.fillText('Giường nghỉ',bed.x-50,bed.y-16);
      if(resting){
        const drift=reduce.matches?0:Math.sin(ambient*3)*1.8;
        context.fillText('Z',x+12,y-32+drift);
        context.fillText('z',x+19,y-39+drift);
      }
      context.restore();
    } else if(!reduce.matches)landscapeLife(context,sceneId,ambient);
    for(const item of scene.hotspots)if(item.type==='exit')gate(context,item,ambient);
    for(const {point,style} of marks){
      const pos=point.type==='plot'?cropTaskPosition({...point,y:point.drawY}):{x:point.x,y:point.y-(point.type==='animal'?32:22)};
      if(pos.x>=cameraX&&pos.x<=cameraX+view.width&&pos.y>=cameraY&&pos.y<=cameraY+view.height){
        drawTask(context,pos.x,pos.y+(point.type==='plot'?0:Math.sin(ambient*2+pos.x)*.65),style);
      }
    }
    drawEffects(now);
    context.restore();
    if(sceneId!=='home'&&sceneId!=='workshop')atmosphere(context,ambient,snapshot.weather.id,reduce.matches,daylight,view);
    if(speech.size){
      context.save();context.translate(-cameraX,-cameraY);
      for(const person of [...peers.values(),player]){
        const bubble=speech.get(person.player);
        if(!bubble||bubble.deadline<=now||distance(person,x,y)>speechRange)continue;
        if(person.x<cameraX||person.x>cameraX+view.width||person.y<cameraY||person.y>cameraY+view.height)continue;
        drawSpeech(context,bubble,person.x,person.y-(person.type==='peer'?56:49),cameraX,cameraY,view.width);
      }
      context.restore();
    }
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
    event.preventDefault(); stop(); routeMarker=null; keys.add(direction);
  };
  window.addEventListener('keydown',down);
  window.addEventListener('keyup',e=>keys.delete(directions[e.key.length===1?e.key.toLowerCase():e.key]));
  function releaseControls(){
    keys.clear();
    touchKeys.clear();
    root.querySelectorAll('[data-held]').forEach(button=>delete button.dataset.held);
  }
  window.addEventListener('blur',releaseControls);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseControls();});
  canvas.addEventListener('pointermove',event=>{
    if(event.pointerType!=='touch')pointer=pointerLocation(event);
  });
  canvas.addEventListener('pointerleave',()=>{pointer=null;});
  canvas.addEventListener('pointerup',event=>{
    if(!scene||event.button!==0) return;
    const point=pointerLocation(event);
    const px=camera.x+point.x,py=camera.y+point.y,target=targetAt(px,py);
    if(target&&distance(target,x,y)<range){routeMarker=null;use(target);}
    else if(walkTo(target?.x??px,target?.y??py,target)){
      const [x,y]=waypoints.at(-1);
      routeMarker={x,y,until:Infinity};
    }else routeMarker={x:px,y:py,blocked:true,until:performance.now()+600};
  });
  root.querySelectorAll('[data-direction]').forEach(button=>{
    const direction=button.dataset.direction;
    button.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      button.setPointerCapture(event.pointerId);button.dataset.held='true';stop();routeMarker=null;touchKeys.set(event.pointerId,direction);
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,event=>{
      touchKeys.delete(event.pointerId);
      if(!Array.from(touchKeys.values()).includes(direction))delete button.dataset.held;
    });
  });
  interacted.addEventListener('click',()=>use());
  function setPeers(players){
    const next=new Map();
    for(const player of players){
      const previous=peers.get(player.player);
      next.set(player.player,{type:'peer',player:player.player,avatar:player.avatar,name:player.name,x:previous?.x??player.x,y:previous?.y??player.y,goalX:player.x,goalY:player.y,
        facing:previous?.facing??player.facing,goalFacing:player.facing,walkDistance:previous?.walkDistance??0});
    }
    peers=next;
  }
  function setSpeech(messages){
    speech=new Map(messages.map(message=>{
      const previous=speech.get(message.player);
      return [message.player,{...message,layout:previous?.key===message.key?previous.layout:undefined}];
    }));
  }
  const position=()=>({x:Math.round(x),y:Math.round(y),facing,walking});
  return {sync,particle,approach,position,setPeers,setSpeech};
}
