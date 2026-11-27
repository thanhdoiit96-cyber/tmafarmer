import {createActionFeedback,requestTiming} from './action-feedback.mjs';
import {createNotices} from './notices.mjs';
import {recipeView} from './recipe-view.mjs';
import {catalogPage} from './ui-catalog.mjs';
import {installScrollIndicators} from './scroll-indicators.mjs';
import {driveItem} from './village-drive-view.mjs';
import {driveResult} from './village-drive-history.mjs';
import {coopPage} from './coop-view.mjs';
import {cropImpacts} from './crop-impact.mjs';
import {animalImpacts,animalOutlook,pondOutlook} from './husbandry-outlook.mjs';
import {lakeSpecies,fishBookComplete} from './lake-social.mjs';
import {lakeElder,lakeElderGreeting,lakeElderVoice} from './lake-elder.mjs';
import {prankActive,prankUnlocked} from './prank.mjs';
import {gardenHelperActions,gardenHelperLimit,gardenHelperName} from './garden-helper.mjs';
import {optionalIndex} from './action-input.mjs';
import {unlockGuide,itemUnlockTarget} from './unlock-guide.mjs';
import {previousVisit,returnSummary,visitMark,visitStorageKey} from './return-summary.mjs';
import {seedCatalog,seedPickerPage} from './seed-picker.mjs';
import {neighborHomes,neighborPage,neighborPageSize,neighborHouseTier} from './neighbors-layout.mjs';
import {visitPage,visitPlotPane} from './neighbor-visit.mjs';
import {avatarDetails,avatarKey,ageCharacterAtlases} from './avatar-models.mjs';
import {villageLevels} from './village.mjs';
import {restSeconds,vitals,wellnessAt,workBlock,workCost} from './wellness.mjs';
import {farmTasks,taskStyles,taskIcon,taskGroups,taskKey} from './tasks.mjs';
import {goalAfterAction,goalStorageKey,goalView,loadGoal,noGoal,pinBuilding,pinIntro,pinVillageGoods,reconcileGoal} from './next-goal.mjs';
import {parcelCoopUpgrade,coopCapacity,fenceAt,fences,gardenDecorAt,gardenDecorItems,gardenDecorRecommendedSpots,gardenDecorSpots,gardenForPlot,gardenPlotSlot,gardenPlotCount,gardenUpgradeCost,getLand,landTypes,lotPrice,mainPlotSlot,plotAt,plotOffset,pondCapacity,pondOffset} from './land.mjs';
import {aquatic,aquaRequirement,aquaSupplyRequirement,pondFood,pondReady,pondYield,visiblePondBatches} from './aqua.mjs';
import {createSceneChat} from './scene-chat.mjs';
import {createFarmMusic} from './farm-music.mjs';
import {cropFrame,cropGrowthLabels} from './pixel/crop-layout.mjs';
import {cropItemFrame} from './pixel/item-art.mjs';
import {additionalLivestockAtlas,aquaticAtlas,gardenDecorAtlas,livestockAtlas,progressionLivestockAtlas} from './pixel/frames.mjs';
import {createWorld} from './world.mjs';
import {drinkingWell,maps,needsPlayerLocation,playerLocationBlock,plotWorkActions} from './world-layout.mjs';
import {advanceGardenHelpers, advanceVillage, advanceVillageDrive, animalCondition, livestockCycleAges, animalRelocation, animalRequirement, animals, apply, aquaOrders, avatarOf, avatars, buildingUpgrade, buildings, capacity, catchOdds, craftRequirement, cropGoal, cropOutlook, cropRequirement, cropWeatherProfiles, crops, cropStage, dayAt, dayGoals, dayReward, farmProgress, gateMinutes, growthGoal, mealCooldown, mealRequirement, productGoal, gardenHelperPreview, gardenHelperTargets, recipeCategory, recipes, upgradeCalendar, upgradeRequirement, GameError, goods, newFarm, newRoom, snapshot, startLivestockClock, startSoilClock, startVillageSecurity, stock, supplyLimit, unixNow, varietyOrders, visitLimit, workshopFoodOrders, xpRewards, xpUnlocks} from './game.mjs';

installScrollIndicators();
const $=selector=>document.querySelector(selector);
const actionFeedback=createActionFeedback($('[data-action-feedback]'));
const notices=createNotices($('#toast'));
window.farmActionDiagnostics=Object.freeze({recent:actionFeedback.recent,clear:actionFeedback.clear});
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={
  read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  write(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} },
};
const sessionKey='mua-vui-session:1', previousKey='mua-vui-previous:1', demoKey='mua-vui-demo:2', accountKey='mua-vui-account:1';
const musicKey='mua-vui-music:1';
const music=createFarmMusic($('#farm-music'),store.read(musicKey),value=>store.write(musicKey,value));
const tabs={
  field:['🌱','Vườn nhà','Gieo hạt, chăm vườn và thu hoạch theo thời tiết.'],
  home:['🏠','Nhà vườn','Vào nhà để nghỉ sức và xem Sổ việc hôm nay.'],
  workshop:['⚙️','Xưởng máy','Chế biến nông sản thành đồ ăn và thức uống để hồi thể lực.'],
  coop:['🐔','Chuồng trại','Chăm vật nuôi để thu trứng, sữa hoặc xuất chuồng lợn.'],
  lake:['🐟','Hồ làng','Thả câu ở cầu gỗ. Cá nhỏ thường gặp, cá chép vàng rất hiếm.'],
  market:['🧺','Chợ làng','Mua vật tư, giao đơn và trao đổi nông sản với hàng xóm.'],
  neighbors:['🏘️','Hàng xóm','Ghé vườn, kho và ao cá của hàng xóm.'],
};
let session=store.read(sessionKey);
let accountSession=store.read(accountKey);
let demo;
let state, tab='field', selected=0, neighborId, busy=false, inviteCode='';
let lakeTab='fishing',helpPage=0,prankPage=0,lastShorePulse=0;
let visitPane='take',visitSource='garden',visitTakePage=0;
let revision=-1, receivedAt=Date.now(), villagePage=0, panel='area', orderPane='village', marketPane='orders', pondTab=0, selectedLot=0, plotGroup=-1, visitPond=0, baseDecorOpen=false, showTomorrow=false;
const areaIcons={field:'leaf',home:'home',workshop:'build',coop:'coop',market:'market',neighbors:'users',lake:'fish'};
const panels={area:['leaf','Khu vực'],land:['build','Đất'],ponds:['fish','Ao nuôi'],orders:['orders','Đơn hàng'],stock:['bag','Kho'],buildings:['build','Xây dựng'],log:['log','Nhật ký']};
const tabGroups={main:['area','tasks','progress','rank'],farm:['land','ponds','stock'],village:['orders','villageLevel','buildings','log']};
const extraPanels={tasks:['orders','Việc cần làm'],progress:['trophy','Tiến độ'],rank:['trophy','Tài sản'],villageLevel:['build','Cấp làng'],members:['users','Thành viên']};
const icon=name=>'<svg aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const dialog=$('#dialog');
const landscape=matchMedia('(orientation: landscape) and (min-width: 500px) and (max-width: 1100px) and (max-height: 600px)');
const layout=$('.layout'), farmPanel=$('#farm-panel'), panelBody=$('.panel-body'), panelToggle=$('[data-panel-toggle]');
const worldFrame=$('#world'), chatPanel=$('#scene-chat');
new ResizeObserver(()=>{
  const frameHeight=worldFrame.getBoundingClientRect().height;
  const chatHeight=landscape.matches?0:chatPanel.getBoundingClientRect().height;
  layout.style.setProperty('--game-height',Math.floor(frameHeight-chatHeight)+'px');
}).observe(worldFrame);
const worldHud=$('.world-hud'), statusHud=$('.status-hud'), statusSlot=$('#status-slot');
function placeStatus(){
  if(landscape.matches)worldHud.insertBefore(statusHud,$('#world-weather'));
  else statusSlot.append(statusHud);
  const dock=$('.world-notices');
  if(landscape.matches)worldHud.append(dock);
  else $('.world-footer').prepend(dock);
}
placeStatus();
landscape.addEventListener('change',placeStatus);
let lastPanelTime=0, composingMarketSearch=false;
const marketQueries={supplies:'',sales:'',stall:''};
const supplyGroups={
  seeds:{label:'Hạt giống',items:Object.values(crops).map(crop=>crop.seed)},
  aquatic:{label:'Con giống',items:Object.values(aquatic).map(species=>species.seed)},
  care:{label:'Thuốc & phân bón',items:['spray','fertilizer']},
  feed:{label:'Thức ăn',items:['feed','aquaFeed']},
};
const stockTabs={food:'Thực phẩm',materials:'Vật tư',produce:'Nông sản',seeds:'Giống'};
const stockItems={
  food:Object.keys(recipes).filter(key=>recipes[key].gain),
  materials:[...supplyGroups.care.items,...supplyGroups.feed.items,...Object.keys(recipes).filter(key=>recipeCategory(recipes[key])==='materials')],
  produce:Object.keys(goods).filter(key=>goods[key].sell&&!recipes[key]),
  seeds:[...supplyGroups.seeds.items,...supplyGroups.aquatic.items],
};
let stockTab='produce', stockPage=0, stockPageSize=8, renderedStock='';
const stockTooltip=$('#stock-tooltip');
let stockTooltipCard;
let supplyGroup='all', workshopTab='food';
const workshopTabs={food:'Thực phẩm',tools:'Công cụ',materials:'Vật tư'};
const world=createWorld(worldFrame,interactWithWorld,landscape);
const sceneChat=createSceneChat({api,world,showToast,context:()=>state&&{session,player:state.me.id,area:tab==='neighbors'&&neighborId?'visit':tab,host:neighborId}});
let tasks=[];
let taskBookTab='tasks',taskBookPage=0,taskBookGroup=null,taskDetailPage=0,taskBookSize=6;
let recoveryKey=null,recoveryPage=0,recoveryItem=null,recoveryStamp='',recoveryPageSize=4;
let pinnedGoal, pinnedGoalView;
const lotLabel=lot=>lot?.kind==='empty'?'Đất trống':landTypes[lot?.kind]?.name??'Chưa mua';
const gardenFor=gardenForPlot;
const plotNumber=index=>gardenFor(index)<0?mainPlotSlot(index)+1:gardenPlotSlot(index)+1;
const btn=(label,attrs='',kind='',disabled=false)=>'<button type="button" class="btn '+kind+'" '+attrs+(disabled?' disabled':'')+'>'+label+'</button>';
const careIcon=key=>'<span class="care-icon care-icon-'+key+'" aria-hidden="true"></span>';
const act=(label,action,item='',index='',kind='',disabled=false,qty=1)=>btn(({till:'till',harvest:'harvest',water:'water',weed:'weeds',spray:'pests'}[action]?careIcon({till:'till',harvest:'harvest',water:'water',weed:'weeds',spray:'pests'}[action]):'')+label.replace(/^(💧|🧴) /u,''),`data-action="${action}" data-item="${item}" data-index="${index}" data-qty="${qty}"`,kind,disabled);
const nice=(key)=>goods[key].icon+' '+goods[key].name;
function aquaIllustration(item){
  const kind=goods[item].illustration;
  const frame=aquaticAtlas.frames[kind];
  if(!frame)return '';
  return '<span class="aqua-icon" style="background-position:-'+frame[0]/2+'px 0" aria-hidden="true"></span>';
}
function cropIllustration(item){
  const frame=cropItemFrame(item);
  if(!frame||frame.procedural)return '';
  const sizes={'/pixel/vertical-slice-v2-hd.png':[384,128],'/pixel/crop-stages-v2.png':[96,216],'/pixel/progression-crops-v4.png':[96,96]};
  const [width,height]=sizes[frame.source]??[];
  if(!width)return '';
  return '<span class="crop-item-icon" style="background-image:url('+frame.source+');background-size:'+width+'px '+height+'px;background-position:-'+frame.x/2+'px -'+frame.y/2+'px" aria-hidden="true"></span>';
}
function itemIllustration(item){return aquaIllustration(item)||cropIllustration(item);}
function itemLink(key,label=nice(key)){
  const art=itemIllustration(key);
  if(art&&label.startsWith(goods[key].icon+' '))label=label.slice(goods[key].icon.length+1);
  return '<button type="button" class="item-link" data-item-info="'+key+'" aria-label="Xem chi tiết '+escape(goods[key].name)+'">'+art+escape(label)+'</button>';
}
const duration=seconds=>{
  const sec=Math.max(0,Math.ceil(seconds));
  if(sec>=3600)return Math.floor(sec/3600)+' giờ '+String(Math.floor(sec/60)%60).padStart(2,'0')+' phút';
  return sec>=60?Math.floor(sec/60)+'p '+String(sec%60).padStart(2,'0')+'s':sec+'s';
};
const progress=(value,max)=>Math.min(100,Math.floor(100*value/max));
const valueBar=(value,max)=>'<div class="progress"><i style="width:'+progress(value,max)+'%"></i></div>';
const currentTime=()=>state.now+Math.floor((Date.now()-receivedAt)/1000);
function setupDemo() {
  if(demo) return;
  demo=store.read(demoKey);
  const time=unixNow();
  if(demo?.farms?.demo){
    if(upgradeCalendar(demo,time))store.write(demoKey,demo);
    seedDemoPonds(time);
    return;
  }
  demo=newRoom(time);
  demo.farms.demo=newFarm('demo','Vườn nhà',time);
  demo.farms.sen=newFarm('sen','Vườn cô Sen',time);
  demo.farms.lua=newFarm('lua','Vườn chú Lúa',time);
  demo.farms.demo.plots[1]={kind:'wheat',progress:60,pests:0,at:time,wetUntil:0,protectedUntil:0,fertilized:false,picked:0};
  const plot=kind=>({kind,progress:crops[kind].time,pests:0,at:time,wetUntil:0,protectedUntil:0,fertilized:false,picked:0});
  demo.farms.sen.plots[2]=plot('carrot');
  demo.farms.sen.inventory.carrot=6;
  demo.farms.lua.plots[3]=plot('corn');
  demo.farms.lua.inventory.corn=6;
  demo.listings[1]={id:1,seller:'sen',item:'carrot',qty:3,price:8};
  demo.nextListing=2;
  seedDemoPonds(time);
}
function seedDemoPonds(time){
  if(demo.fishingTour)return;
  const examples={sen:'tilapia',lua:'carp'};
  for(const [id,kind] of Object.entries(examples)){
    const farm=demo.farms[id];
    if(farm&&!visiblePondBatches(farm,0).length)farm.ponds={...farm.ponds,0:[{kind,count:1,at:time,progress:aquatic[kind].time,fedUntil:0,picked:0}]};
  }
  demo.fishingTour=true;
  store.write(demoKey,demo);
}
let visitKey='',returnBaseline=null,visitInMemory=null,initialScreenReady=false;
function setState(next) {
  state=next;
  receivedAt=Date.now();
  const key=visitStorageKey(next,session);
  if(key!==visitKey){if(dialog.open&&dialog.classList.contains('return-popup'))dialog.close();visitKey=key;returnBaseline=null;visitInMemory=null;}
  if(!document.hidden){
    const previous=previousVisit(visitInMemory??store.read(key),next);
    if(previous)returnBaseline=previous;
    visitInMemory=visitMark(next);
    store.write(key,visitInMemory);
  }
}
function updateDemo() {
  setupDemo();
  const time=unixNow();
  const day=dayAt(demo,time);
  const started=startVillageSecurity(demo,day);
  const soilStarted=startSoilClock(demo,time);
  const livestockStarted=startLivestockClock(demo,time);
  const driveUpdated=advanceVillageDrive(demo,time);
  const helpersUpdated=advanceGardenHelpers(demo,time);
  if(advanceVillage(demo,day)||started||soilStarted||livestockStarted||driveUpdated||helpersUpdated)store.write(demoKey,demo);
  setState(snapshot(demo,demo.farms.demo,time));
}
async function api(path, payload, credentials=session, timing) {
  const headers={};
  if(credentials){headers.authorization='Bearer '+credentials.token;if(credentials.code)headers['x-room-code']=credentials.code;}
  const started=performance.now();let response;
  try{
    try{
      if(payload)headers['content-type']='application/json';
      response=await fetch('/api/'+path,{method:payload?'POST':'GET',headers,body:payload?JSON.stringify(payload):undefined,cache:'no-store',signal:AbortSignal.timeout(8500)});
    }catch{throw new Error('Không thể kết nối với làng. Kiểm tra mạng rồi thử lại.');}
    const result=await response.json().catch(()=>null);
    if(!result||!response.ok){const error=new Error(result?.error||'Máy chủ làng chưa sẵn sàng.');error.status=response.status;throw error;}
    return result;
  }finally{timing?.request(path,requestTiming(started,performance.now(),response));}
}
async function apiAccount(path,payload,credentials) {
  const headers={};
  if(credentials?.token) headers.authorization='Bearer '+credentials.token;
  let response;
  try {
    if(payload) headers['content-type']='application/json';
    response=await fetch('/api/account/'+path,{method:payload?'POST':'GET',headers,body:payload?JSON.stringify(payload):undefined,cache:'no-store',signal:AbortSignal.timeout(8500)});
  } catch {
    throw new Error('Không thể kết nối tài khoản. Kiểm tra mạng rồi thử lại.');
  }
  const result=await response.json().catch(()=>null);
  if(!result||!response.ok) {
    const error=new Error(result?.error||'Tài khoản chưa sẵn sàng.');
    error.status=response.status;
    throw error;
  }
  return result;
}
function showToast(message,error=false) {
  notices.show(message,error);
}
function boardBar(name,right='') {
  return '<div class="board-bar"><span class="label board-title">'+name+'</span><span class="label">'+right+'</span></div>';
}
function renderField(farm) {
  const gardens=farm.land.flatMap((lot,i)=>lot?.kind==='garden'?[i]:[]);
  const indices=farm.plotIndexes.filter(i=>gardenFor(i)===plotGroup);
  const group=gardens.length?'<label class="compact-label">Vườn <select data-crop-group><option value="-1"'+(plotGroup<0?' selected':'')+'>Ruộng chính</option>'+gardens.map(i=>'<option value="'+i+'"'+(plotGroup===i?' selected':'')+'>Ô đất '+(i+1)+'</option>').join('')+'</select></label>':'';
  const damp=state.afterRainUntil>currentTime()?'<p class="farm-warning">Sau mưa: sâu dễ xuất hiện trong <strong data-until="'+state.afterRainUntil+'">'+duration(state.afterRainUntil-currentTime())+'</strong> tới.</p>':'';
  return '<div class="row area-heading"><h2>Ô canh tác</h2><span class="badge">'+indices.filter(i=>plotAt(farm,i)).length+'/'+indices.length+' ô đã gieo</span></div>'+
    (farm.gardenHelperJob?gardenHelperStatus(farm,currentTime()):'')+damp+group+
    (plotGroup>=0&&!farm.land[plotGroup]?.expanded?'<div class="actions">'+act('Mở thêm 3 ô · '+gardenUpgradeCost+' xu','upgradeGarden','',plotGroup,'subtle',farm.coins<gardenUpgradeCost)+'</div>':'')+
    '<div class="plot-select">'+indices.map(i=>{
      const crop=plotAt(farm,i), amount=crop?progress(crop.progress,cropGoal(crop)):0;
      const label=plotNumber(i);
      const task=tasks.find(task=>task.kind==='plot'&&task.index===i);
      const hard=!crop&&farm.soilCompactsAt[i]<=currentTime();
      return `<button class="btn${selected===i?' primary':''}" ${task?'data-flag="'+task.type+'" ':''}data-plot="${i}" aria-pressed="${selected===i}">${crop?goods[crop.kind].icon:hard?'⚒':'＋'} Ô ${label}${crop?' · '+amount+'%':hard?' · Chai':''}</button>`;
    }).join('')+'</div>';
}
function renderWorkshop(farm){
  const tabs='<div class="workshop-tabs game-book-tabs" role="group" aria-label="Nhóm chế biến">'+Object.entries(workshopTabs).map(([key,label])=>
    btn(label,'data-workshop-tab="'+key+'" aria-pressed="'+(workshopTab===key)+'"',workshopTab===key?'primary':'subtle')).join('')+'</div>';
  const available=Object.entries(recipes).filter(([,recipe])=>recipeCategory(recipe)===workshopTab);
  const orders=state.orders.some(order=>order.category==='workshop')?
    '<div class="actions">'+btn('Đơn Xưởng','data-panel="orders"','subtle')+'</div>':'';
  const heading='<header class="game-book-head"><h2>Xưởng máy</h2><span>Cấp '+farm.workshop+'</span></header>'+tabs;
  if(!available.length)return '<section class="game-book workshop-book">'+heading+'<p class="stable-empty">Công cụ sẽ được triển khai sau.</p></section>'+orders;
  const size=animalPickerSize()===4?3:6;
  if(size!==workshopPageSize){workshopPage=Math.floor(workshopPage*workshopPageSize/size);workshopPageSize=size;}
  const page=catalogPage(available,workshopPage,size);workshopPage=page.index;
  return '<section class="game-book workshop-book">'+heading+'<div class="recipe-catalog">'+page.entries.map(([item])=>{
    const view=recipeView(farm,item),art=itemIllustration(item)||'<span class="recipe-symbol">'+escape(goods[item].icon)+'</span>';
    const action=view.locked?btn('Điều kiện','data-recipe-info="'+item+'"','recipe-locked-action'):act('Chế biến','craft',item,'','primary',!!view.reason);
    return '<article class="recipe-slot" data-locked="'+view.locked+'" data-ready="'+(!view.reason)+'"><button class="recipe-info" data-recipe-info="'+item+'" aria-label="Xem công thức '+escape(goods[item].name)+'"><span class="recipe-status">'+view.label+(view.count?'<b class="coop-count ready" aria-label="Có thể chế biến '+view.count+' lần">'+view.count+'</b>':'')+'</span><span class="recipe-art" aria-hidden="true">'+art+'</span><strong>'+escape(goods[item].name)+'</strong><span class="recipe-owned"><span>Kho</span><b>'+view.owned+'</b></span></button>'+action+'</article>';
  }).join('')+'</div><footer class="game-book-pager workshop-pages">'+btn('‹','data-workshop-page="'+(page.index-1)+'" aria-label="Trang công thức trước"','subtle',!page.index)+'<span>'+(page.index+1)+' / '+page.count+'</span>'+btn('›','data-workshop-page="'+(page.index+1)+'" aria-label="Trang công thức sau"','subtle',page.index===page.count-1)+'</footer></section>'+orders;
}
function showRecipeInfo(item){const recipe=recipes[item];if(!recipe)return;const reason=craftRequirement(state.me,item);modal('Công thức · '+escape(goods[item].name),'<p>'+escape(recipe.gain?recoveryText(recipe.gain):'Vật liệu dùng giao đơn hoặc nâng cấp.')+'</p><ul class="recipe-ingredients">'+Object.entries(recipe.ingredients).map(([key,count])=>'<li>'+itemLink(key)+'<strong>'+Math.min(count,state.me.inventory[key]??0)+' / '+count+'</strong></li>').join('')+'</ul>'+(reason?'<p>'+escape(reason)+'</p>':'')+unlockButton('recipe',item,'Điều kiện mở')+'<p class="care-note">Đóng để trở lại đúng trang công thức.</p>');}
const recoveryText=gain=>Object.entries(gain).map(([key,value])=>'+'+value+' '+({stamina:'thể lực',water:'điểm nước',food:'điểm no'})[key]).join(' · ');
const ingredientsText=ingredients=>Object.entries(ingredients).map(([key,count])=>count+' '+goods[key].name.toLowerCase()).join(' + ');
const supplyUses={
  spray:'Trị sâu trên ô đang trồng để hạn chế mất sản lượng.',
  weed:'Nhổ cỏ dại bằng cuốc, không tốn vật tư. Cỏ ngừng mọc lại trong 20 phút. Chăm sớm để tránh chậm lớn và mất sản lượng.',
  fertilizer:'Tăng tốc độ lớn và tăng sản lượng cơ sở thêm 1 món.',
  feed:'Cho vật nuôi trong chuồng ăn để lớn và tạo sản phẩm.',
  aquaFeed:'Cho cá, tôm ăn để lứa nuôi tiếp tục lớn.',
};
function describeItem(item){
  const recipe=recipes[item];
  if(recipe){
    const upgrades=Object.values(buildings).flatMap(building=>Object.entries(building.materials??{}).
      filter(([,items])=>items[item]).map(([level,items])=>building.name+' cấp '+level+' ('+items[item]+')'));
    const kitchenOrder=workshopFoodOrders.some(order=>order.item===item);
    const use=recipe.gain?recoveryText(recipe.gain)+'. Dùng từ Kho & túi hoặc thanh hồi phục.'+
      (kitchenOrder?' Có thể giao đơn Xưởng.':''):
      'Giao đơn xưởng hoặc bán tại chợ.'+(upgrades.length?' Nâng cấp '+upgrades.join(', ')+'.':'');
    return [use,'Chế biến ở Xưởng máy cấp '+recipe.level+' bằng '+ingredientsText(recipe.ingredients)+'.'];
  }
  if(supplyUses[item])return [supplyUses[item],'Mua tại Chợ làng, mục Vật tư.'];
  const crop=Object.keys(crops).find(key=>crops[key].seed===item);
  if(crop)return ['Gieo trên ô đất trống để trồng '+goods[crop].name.toLowerCase()+'. '+cropWeatherProfiles[crops[crop].weather].note,'Mua ở Chợ làng hoặc đổi '+goods[crop].name.toLowerCase()+' thành giống trong Kho & túi.'];
  const species=Object.values(aquatic).find(value=>value.seed===item);
  if(species){
    const needs=[species.xp?species.xp+' XP':'',species.barn?'Kho cấp '+species.barn:''].filter(Boolean);
    return ['Nuôi trong ao. Mỗi con giống cần '+species.food+' phần thức ăn, lớn trong '+duration(species.time)+' cơ sở và cho '+species.yield+' sản phẩm.',
      'Mua tại Chợ làng, nhóm Con giống.'+(needs.length?' Mở khóa khi có '+needs.join(' và ')+'.':'')];
  }
  const animal=Object.values(animals).find(value=>value.product===item);
  const mentionRecipes=Object.keys(recipes).filter(key=>recipes[key].ingredients[item]);
  const uses=['Bán lấy xu'];
  if(['wheat','carrot','corn','egg','milk','minnow','pork'].includes(item)||[...varietyOrders,...aquaOrders].some(order=>order.items.some(entry=>entry.item===item)))uses.push('giao đơn làng');
  if(crops[item])uses.push('giữ làm giống');
  if(mentionRecipes.length)uses.push('chế biến '+mentionRecipes.map(key=>goods[key].name.toLowerCase()).join(', '));
  let source;
  if(crops[item])source='Thu hoạch từ luống '+goods[item].name.toLowerCase()+' đã chín.';
  else if(animal)source=animal.oneTime?'Xuất chuồng '+animal.name.toLowerCase()+' sau khi nuôi đủ lớn.':'Thu từ '+animal.name.toLowerCase()+' đã trưởng thành và được cho ăn.';
  else if(aquatic[item])source=item==='tilapia'?'Thu hoạch ở ao nuôi hoặc câu tại Hồ làng.':'Thu hoạch ở ao nuôi khi lứa đã trưởng thành.';
  else source=item==='goldenCarp'?'Câu tại Hồ làng, tỷ lệ cắn câu hiếm.':'Câu tại Hồ làng.';
  return [uses.join(', ')+'.',source];
}
function itemDescription(item){
  const [use,source]=describeItem(item);
  return '<dl class="item-description"><dt>Tác dụng</dt><dd>'+escape(use)+'</dd><dt>Cách có</dt><dd>'+escape(source)+'</dd></dl>';
}
function cropGrowthStrip(kind,currentStage){
  return '<ol class="crop-growth-strip" aria-label="Bốn giai đoạn phát triển">'+cropGrowthLabels[kind].map((label,stage)=>{
    const snap=cropFrame(kind,stage);
    const sprite=snap&&!snap.procedural?'<span class="crop-growth-sprite" style="background-image:url('+snap.source+');background-position:'+(-snap.x)+'px '+(-snap.y)+'px" aria-hidden="true"></span>':'<span class="crop-growth-fallback" aria-hidden="true">'+goods[kind].icon+'</span>';
    return '<li'+(stage===currentStage?' aria-current="step"':'')+'>'+sprite+'<strong>'+label+'</strong></li>';
  }).join('')+'</ol><p>Thu hoạch khi tiến độ đạt 100%.</p>';
}
function stockLock(farm,item){
  const crop=Object.keys(crops).find(key=>crops[key].seed===item);
  if(crop)return cropRequirement(farm,crop);
  const recipe=recipes[item];
  return recipe&&(farm.workshop??0)<recipe.level?'Cần Xưởng máy cấp '+recipe.level+'.':aquaSupplyRequirement(farm,item);
}
function unlockButton(type,key,label='Xem điều kiện',lot){
  return btn(label,'data-unlock="'+type+'" data-key="'+key+'"'+(lot===undefined?'':' data-lot="'+lot+'"'),'subtle');
}
function unlockChecklist(view){
  const rows=view.rows.map(row=>'<li><div><strong>'+escape(row.label)+'</strong><p>'+row.have+' / '+row.need+(row.ready?' · Đã đạt':' · Còn thiếu '+(row.need-row.have))+'</p></div>'+
    (!row.ready?(row.route.kind==='building'?unlockButton('building',row.route.key,'Xem công trình'):row.route.kind==='item'?btn('Xem vật liệu','data-item-info="'+row.route.key+'"','subtle'):btn(row.route.kind==='progress'?'Xem tiến độ':'Tới chợ','data-unlock-route="'+row.route.kind+'"','subtle')):'<span class="badge">Đã đạt</span>')+'</li>').join('');
  return '<ul class="unlock-checklist">'+rows+'</ul>';
}
function showUnlock(type,key,lot){
  const view=unlockGuide(state.me,type,key,lot);
  if(!view)return;
  modal('Điều kiện · '+escape(view.name),'<p>'+(view.max?'Công trình đã đạt cấp tối đa.':view.unlocked?'Đã đạt điều kiện mở khóa. Khi mua, trồng hoặc chế biến vẫn cần đủ giống, xu, nguyên liệu và chỗ chứa.':'Hoàn thành các điều kiện còn thiếu bên dưới. XP là tổng kinh nghiệm, không phải cấp công trình.')+'</p>'+unlockChecklist(view)+
    (type==='building'&&!view.max?'<div class="actions">'+btn('Ghim cấp kế tiếp','data-goal="building" data-item="'+key+'"','primary')+btn('Xem bảng công trình','data-unlock-route="buildings" data-key="'+key+'"','subtle')+'</div>':'')+'<p>Chỉ dẫn không tự mua, xây hoặc tiêu vật liệu.</p>');
}
function showItem(item,fromStock=false){
  if(!Object.hasOwn(goods,item))return;
  const now=currentTime(), farm=state.me, health=wellnessAt(farm,now);
  const reason=recipes[item]?.gain&&mealRequirement(farm,item,health,now);
  const crop=Object.hasOwn(crops,item)?item:Object.keys(crops).find(key=>crops[key].seed===item);
  const count=farm.inventory[item]??0;
  const locked=fromStock&&stockLock(farm,item);
  const saveSeed=fromStock&&Object.hasOwn(crops,item)&&count?
    '<div class="actions">'+btn('Giữ giống','data-seed-crop="'+item+'"','subtle',(farm.inventory[crops[item].seed]??0)>=supplyLimit)+'</div>':'';
  const art=pondIllustration(item);
  modal(art?art+escape(goods[item].name):nice(item),itemDescription(item)+'<p>Đang có '+count+'</p>'+
    (locked?'<p><strong>Đang khóa.</strong> '+escape(locked)+'</p>':'')+
    (itemUnlockTarget(item)?unlockButton(itemUnlockTarget(item).type,itemUnlockTarget(item).key):'')+
    (crop?cropGrowthStrip(crop):'')+
    (recipes[item]?.gain&&(!fromStock||count)?'<div class="actions">'+btn('Dùng ngay','data-meal="'+item+'"','primary',!!reason)+'</div>'+
      (reason?'<p>'+escape(reason)+'</p>':''):'')+saveSeed+'<p id="dialog-error" role="status"></p>');
}
function hideStockTooltip(){
  clearTimeout(catalogHoverTimer);catalogHoverCard=null;
  if(!stockTooltipCard)return;
  stockTooltipCard.removeAttribute('aria-describedby');
  stockTooltipCard=null;
  stockTooltip.hidden=true;
}
let catalogHoverTimer,catalogHoverCard=null;
function queueCatalogTooltip(card,show){
  if(stockTooltipCard===card||catalogHoverCard===card)return;
  hideStockTooltip();catalogHoverCard=card;
  catalogHoverTimer=setTimeout(()=>{
    catalogHoverCard=null;
    if(card.isConnected&&card.matches(':hover')&&!document.hidden&&!dialog.open)show(card);
  },550);
}
function showStockTooltip(card){
  if(dialog.open||stockTooltipCard===card)return;
  hideStockTooltip();
  const item=card.dataset.itemInfo, locked=stockLock(state.me,item);
  stockTooltip.innerHTML='<strong>'+escape(nice(item))+'</strong>'+itemDescription(item)+
    (locked?'<p class="stock-tooltip-lock">'+escape(locked)+'</p>':'');
  placeItemTooltip(card);
}
function placeItemTooltip(card){
  stockTooltipCard=card;
  card.setAttribute('aria-describedby','stock-tooltip');
  stockTooltip.hidden=false;
  const anchor=card.getBoundingClientRect();
  const width=stockTooltip.offsetWidth, height=stockTooltip.offsetHeight;
  const edge=8;
  const side=anchor.left>=width+edge||anchor.right+width<=innerWidth-edge;
  const left=anchor.left>=width+edge?anchor.left-width:side?anchor.right:anchor.left;
  const top=side?anchor.top:anchor.bottom+height<=innerHeight-edge?anchor.bottom:anchor.top-height;
  stockTooltip.style.left=Math.max(edge,Math.min(left,innerWidth-width-edge))+'px';
  stockTooltip.style.top=Math.max(edge,Math.min(top,innerHeight-height-edge))+'px';
}
function seedFacts(seed){
  return '<dl class="seed-facts"><div><dt>Trong túi</dt><dd>'+seed.count+' hạt</dd></div><div><dt>Thời gian cơ sở</dt><dd>'+duration(seed.time)+'</dd></div><div><dt>Sản lượng cơ sở</dt><dd>'+seed.yield+' món</dd></div><div><dt>Đặc tính</dt><dd>'+escape(seed.weather.label)+(seed.quality?' · Chất lượng cao':'')+'</dd></div></dl><p>'+escape(seed.weather.note)+'</p><p class="small">Thời gian và sản lượng thực tế thay đổi theo thời tiết, độ ẩm và chăm sóc.</p>';
}
function showSeedInfo(key){
  const seed=seedCatalog(state.me).find(s=>s.key===key);
  if(!seed)return;
  modal(cropIllustration(key)+escape(seed.name),'<p class="seed-detail-status" data-locked="'+!seed.unlock.unlocked+'">'+(seed.unlock.unlocked?'Đã mở khóa'+(seed.count?' · Có thể gieo':' · Hết giống'):'Chưa mở khóa')+'</p>'+seedFacts(seed)+'<h3>Điều kiện mở khóa</h3>'+(seed.unlock.rows.length?unlockChecklist(seed.unlock):'<p>Giống cơ bản, không cần điều kiện mở khóa.</p>')+'<p class="small">'+escape(describeItem(seed.seed)[1])+'</p>'+cropGrowthStrip(key)+
    (seed.unlock.unlocked&&!seed.count?'<div class="actions">'+btn('Tìm giống ở chợ','data-seed-buy="'+key+'"','primary')+'</div>':''));
}
function showSeedTooltip(card){
  if(dialog.open||stockTooltipCard===card)return;
  const seed=seedCatalog(state.me).find(s=>s.key===card.dataset.seedInfo);
  if(!seed)return;
  hideStockTooltip();
  stockTooltip.innerHTML='<strong>'+escape(seed.name.replace(' ch?t l??ng cao','').replace('Qu? c? ph?','C? ph?').replace('G??ng sen','Sen'))+'</strong><p class="stock-tooltip-lock">'+(seed.unlock.unlocked?'Đã mở khóa':'Chưa mở khóa')+'</p>'+seedFacts(seed)+(seed.unlock.rows.length?'<p>'+seed.unlock.rows.map(r=>escape(r.label)+': '+r.have+'/'+r.need+(r.ready?' (đã đạt)':' (còn thiếu)')).join('<br>')+'</p>':'')+'<p>Click để xem mô tả và điều kiện chi tiết.</p>';
  placeItemTooltip(card);
}
let seedGroup='open',seedPage=0;
landscape.addEventListener('change',()=>{if(state){seedPage=0;render();}});
matchMedia('(max-width:760px)').addEventListener('change',()=>{if(state){seedPage=0;render();}});
function renderSeedPicker(farm){
  const view=seedPickerPage(farm,seedGroup,seedPage,8);seedPage=view.page;
  const tabs='<div class="seed-tabs" role="group" aria-label="Trạng thái mở khóa hạt giống">'+[['open','Đã mở',view.open],['locked','Còn khóa',view.locked]].map(([key,label,count])=>btn(label+' <span>'+count+'</span>','data-seed-group="'+key+'" aria-pressed="'+(seedGroup===key)+'"',seedGroup===key?'primary':'subtle')).join('')+'</div>';
  const cards=view.entries.map(seed=>'<article class="seed-card" data-locked="'+!seed.unlock.unlocked+'" data-empty="'+!seed.count+'">'+btn('<span class="seed-art">'+cropIllustration(seed.key)+'</span><span class="seed-card-text"><strong>'+escape(seed.name)+'</strong><span class="seed-card-meta"><b><span class="catalog-number">'+seed.count+'</span><small class="catalog-unit">hạt</small></b><span>'+escape(seed.weather.label)+'</span></span><small>'+(seed.unlock.unlocked?(seed.count?'Đã mở · Xem chi tiết':'Đã mở · Hết giống'): 'Khóa · '+seed.unlock.rows.map(r=>escape(r.label.replace(' · cấp',''))+' '+r.need).join(' · '))+'</small></span>','data-seed-info="'+seed.key+'" aria-label="Xem '+escape(seed.name)+', '+(seed.unlock.unlocked?'đã mở':'còn khóa')+', '+seed.count+' hạt"','seed-info')+
    (seed.unlock.unlocked?(seed.count?act('Gieo','plant',seed.key,selected,'primary'):btn('Tìm giống','data-seed-buy="'+seed.key+'"','subtle')):'<span class="seed-lock-label" aria-hidden="true">Khóa</span>')+'</article>').join('');
  const pager='<nav class="seed-pagination" aria-label="Trang hạt giống">'+btn('‹','data-seed-page="'+(view.page-1)+'" aria-label="Trang hạt giống trước"','subtle',view.page===0)+'<span>Trang '+(view.page+1)+' / '+view.pages+'</span>'+btn('›','data-seed-page="'+(view.page+1)+'" aria-label="Trang hạt giống sau"','subtle',view.page===view.pages-1)+'</nav>';
  return '<section class="seed-picker" aria-label="Chọn hạt giống"><div class="row"><h2>Chọn hạt giống</h2><span class="badge">Ô '+plotNumber(selected)+'</span></div><p class="seed-picker-hint">Chạm ảnh hoặc tên để xem chi tiết. Dùng nút Gieo để trồng.</p>'+tabs+'<div class="seed-cards">'+(cards||'<p>Chưa có giống trong nhóm này.</p>')+'</div>'+pager+'</section>';
}
function showCropGrowth(index){
  const plot=plotAt(state.me,index);
  if(plot)modal('Giai đoạn · '+goods[plot.kind].name,cropGrowthStrip(plot.kind,cropStage(plot)));
}
function renderCropTools(farm,now) {
  const plot=plotAt(farm,selected);
  if(!plot&&farm.soilCompactsAt[selected]<=now)return '<h2>Đất đã chai</h2><p>Ô này bỏ trống ít nhất 8 giờ. Cuốc đất để làm tơi rồi gieo hạt.</p><div class="actions">'+act('Cuốc đất','till','',selected,'primary')+'</div>';
  if(!plot)return renderSeedPicker(farm);
  const goal=cropGoal(plot), ripe=plot.progress>=goal;
  const wet=plot.wetUntil>now||state.weather.wet;
  const outlook=cropOutlook(plot,state.weather,state.now);
  const {remaining}=outlook;
  const hazardName=plot.hazard==='weeds'?'Cỏ dại':'Sâu';
  const signed=value=>(value>0?'+':'')+value+'%';
  const impacts=cropImpacts(plot,state.weather,outlook);
  const detailsOpen=document.querySelector('details[data-crop-outlook="'+selected+'"]')?.open;
  return '<div class="row"><h2>'+goods[plot.kind].name+'</h2><span class="badge">'+(ripe?'Đã chín':progress(plot.progress,goal)+'% lớn')+'</span></div>'+
    '<div class="crop-outlook-stats"><span><small>'+(ripe?'Sẵn sàng':'Ước tính còn')+'</small><strong>'+(ripe?'Thu hoạch':'~'+duration(Math.ceil(outlook.seconds/60)*60))+'</strong></span><span><small>'+(ripe?'Có thể thu':'Tạm tính thu')+'</small><strong>'+remaining+' món</strong></span></div>'+
    '<p class="crop-outlook-status">'+(outlook.wet?'Đất ẩm':'Đất khô')+' · '+hazardName+' '+Math.floor(outlook.pressure)+'%'+(plot.fertilized?' · Đã bón phân':'')+'</p>'+
    '<details class="crop-outlook-details" data-crop-outlook="'+selected+'"'+(detailsOpen?' open':'')+'><summary data-crop-explain="'+selected+'">Vì sao? · Thời gian & sản lượng</summary>'+
    '<table class="crop-impact-table"><thead><tr><th>Yếu tố</th><th>Tốc độ</th><th>Năng suất</th></tr></thead><tbody>'+impacts.map(row=>'<tr><th scope="row">'+escape(row.label)+'</th><td>'+signed(row.growth)+'</td><td>'+signed(row.yield)+'</td></tr>').join('')+'</tbody></table><p class="care-note">Thời tiết: tác động hiện tại, năng suất cộng dồn suốt vụ. Thiệt hại đã tích lũy không hồi lại.</p></details>'+valueBar(plot.progress,goal)+
    (prankActive(plot,now)?'<p class="care-note">Sâu nghịch: tốc độ −10% · tự hết sau <span data-until="'+plot.prank.until+'">'+duration(plot.prank.until-now)+'</span>. Không phải sâu tự nhiên.</p>'+act('Bắt sâu nghịch · Miễn phí','catchPrank','',selected,'primary'):'')+
    '<div class="actions">'+btn('4 giai đoạn','data-crop-growth="'+selected+'"','subtle')+(ripe?act('Thu hoạch','harvest','',selected,'primary')+
      '<button type="button" class="btn subtle" data-action="harvest" data-index="'+selected+'" data-source="seed"'+(!remaining||(farm.inventory[crops[plot.kind].seed]??0)>=100?' disabled':'')+'>Thu và giữ 1 giống</button>':
      act('💧 Tưới nước','water','',selected,'primary',wet)+
      act('🧺 Bón phân · '+(farm.inventory.fertilizer||0),'fertilize','',selected,'',plot.fertilized||!farm.inventory.fertilizer)+
      (plot.hazard==='weeds'?act('Nhổ cỏ','weed','',selected,'',(plot.weeds??0)<=0):act('🧴 Xịt thuốc · '+(farm.inventory.spray||0),'spray','',selected,'',plot.protectedUntil>now||!farm.inventory.spray)))+'</div>';
}
function upgrade(farm,key) {
  const {icon:emoji,name}=buildings[key];
  const {level,max,cost,xp,benefit,nextBenefit,materials}=buildingUpgrade(farm,key);
  const heading=emoji+' '+name+(level?' · Cấp '+level+'/'+max:'');
  const requirements=[cost&&formatCoins(cost)+' xu',xp&&formatCoins(xp)+' XP'].filter(Boolean).join(' · ');
  const missing=[farm.coins<cost&&formatCoins(cost-farm.coins)+' xu', (farm.xp??0)<xp&&formatCoins(xp-(farm.xp??0))+' XP'].filter(Boolean).join(' và ');
  const next=cost?'<p><b>Cấp '+(level+1)+'</b> · '+escape(nextBenefit)+'</p><p>'+requirements+
    (missing?' · Thiếu '+missing:'')+'</p>':'';
  const required=Object.entries(materials).map(([item,count])=>{
    const have=farm.inventory[item]??0;
    return '<li data-ready="'+(have>=count)+'"><span>'+itemLink(item)+'</span><strong>'+Math.min(have,count)+' / '+count+'</strong></li>';
  }).join('');
  return '<article class="upgrade-card"><div class="row"><h3>'+heading+'</h3>'+
    (cost?act(level?'Nâng cấp':'Xây','upgrade',key,'','',farm.coins<cost||!!upgradeRequirement(farm,key)):'<span class="badge">Tối đa</span>')+
    '</div><p>'+escape(benefit)+'</p>'+next+(required?'<ul class="recipe-ingredients upgrade-materials" aria-label="Vật tư nâng cấp">'+required+'</ul>':'')+(cost?unlockButton('building',key):'')+'</article>';
}
function husbandryEstimate(outlook,key){
  if(outlook.ready)return '';
  const percent=value=>{const n=Math.round(value*100);return (n>0?'+':'')+n+'%';};
  const eta='~'+duration(Math.ceil(outlook.seconds/60)*60);
  return '<div class="care-progress-label husbandry-estimate"><span>'+(outlook.feeding?'Ước tính còn':'Sau khi cho ăn')+'</span><b>'+eta+'</b></div>'+
    (outlook.needsMoreFood?'<p class="care-note">'+(outlook.feeding?'Thức ăn hiện tại chưa đủ đến lúc thu.':'Đang dừng lớn.')+' Cần cho ăn tiếp để đạt ước tính.</p>':'')+
    '<details class="panel-fold" data-panel-fold="husbandry-outlook-'+key+'"><summary>Yếu tố ảnh hưởng</summary><div class="care-progress-label"><span>Tốc độ</span><b>'+percent(outlook.rate-1)+'</b></div><p class="care-note">Theo thời tiết'+(key.startsWith('animal')?' &amp; chuồng':'')+'.</p><div class="care-progress-label"><span>Sản lượng</span><b>'+percent(outlook.yieldChange)+'</b></div><p class="care-note">'+(outlook.yieldChange?'Giảm theo số lứa đã thu.':'Thời tiết không đổi sản lượng.')+'</p><p class="care-note">Ước tính khi đủ ăn, thời tiết giữ nguyên.</p></details>';
}
function animalIllustration(kind){
  const atlas=additionalLivestockAtlas.frames[kind]?additionalLivestockAtlas:progressionLivestockAtlas.frames[kind]?progressionLivestockAtlas:livestockAtlas;
  const frame=atlas.frames[kind];
  if(!frame)return '<span class="animal-icon" aria-hidden="true">'+animals[kind].icon+'</span>';
  const [x,y]=frame;
  return '<span class="animal-icon pixel-animal" aria-hidden="true" style="background-image:url('+atlas.source+
    ');background-size:'+atlas.columns*42+'px '+(atlas.rows??1)*36+'px;background-position:-'+x*.75+'px -'+y*.75+'px"></span>';
}
let animalGroup='open',animalPage=0,animalPageSize=8;
const animalPickerSize=()=>matchMedia('(orientation:landscape) and (max-height:480px)').matches?4:8;
window.addEventListener('resize',()=>{
  if(panel==='tasks'&&state)render();
  if(dialog.open&&dialog.querySelector('.quick-garden-form'))updateQuickGarden(dialog.querySelector('.quick-garden-form'));
  if(dialog.open&&recoveryKey)showRecovery(recoveryKey,{preserve:true});
  if(animalPickerSize()!==animalPageSize)refreshAdoptionPicker();
  if(panel==='stock'&&animalPickerSize()!==stockPageSize)render();
  if(panel==='ponds')render();
  if(tab==='workshop'&&(animalPickerSize()===4?3:6)!==workshopPageSize)render();
});
let workshopPage=0,workshopPageSize=6;const marketPages={stall:0,supplies:0,sales:0};
function catalogPager(view,attribute){return '<nav class="seed-pagination catalog-pagination" aria-label="Trang danh sách">'+btn('‹',attribute+'="'+(view.index-1)+'" aria-label="Trang trước"','subtle',!view.index)+'<span>'+(view.index+1)+' / '+view.count+'</span>'+btn('›',attribute+'="'+(view.index+1)+'" aria-label="Trang sau"','subtle',view.index===view.count-1)+'</nav>';}

const coopViews=new Map();
let driveSelection=null,marketOrderPage=0,marketOrderId=null;
const coopKey=lot=>lot===undefined?'main':String(lot);
function selectCoopAnimal(index){const pen=state.me.pens[index];if(!pen)return;const page=coopPage(state.me.pens,pen.lot,currentTime(),{target:index});coopViews.set(coopKey(pen.lot),{filter:'all',page:page.index});}
function animalFacts(key,lot){
  const d=animals[key],owned=state.me.pens.filter(p=>p.kind===key&&p.lot===lot).length;
  return '<dl class="seed-facts"><div><dt>Giá đón</dt><dd>'+d.cost+' xu</dd></div><div><dt>Trong chuồng này</dt><dd>'+owned+' con</dd></div><div><dt>Lớn lên · cơ sở</dt><dd>'+duration(d.grow)+'</dd></div><div><dt>'+(d.oneTime?'Vỗ béo':'Mỗi lứa')+' · cơ sở</dt><dd>'+duration(d.time)+'</dd></div></dl><p>'+d.food+' phần thức ăn/lượt · '+d.yield+' '+escape(goods[d.product].name.toLowerCase())+(d.oneTime?' khi xuất chuồng.':' mỗi lứa cơ sở.')+'</p>';
}
function showAnimalInfo(key,lot){
  if(!Object.hasOwn(animals,key))return;
  const view=unlockGuide(state.me,'animal',key,lot);
  modal(animalIllustration(key)+escape(animals[key].name),'<p class="seed-detail-status" data-locked="'+!view.unlocked+'">'+(view.unlocked?'Đã mở khóa':'Chưa mở khóa')+'</p>'+animalFacts(key,lot)+'<h3>Điều kiện mở khóa</h3>'+unlockChecklist(view)+'<p>Đón vật nuôi bằng nút Đón ở chuồng. Sản lượng còn phụ thuộc tuổi và chăm sóc; xem chi tiết không mua con vật.</p>');
}
function showAnimalTooltip(card){
  if(dialog.open||stockTooltipCard===card)return;
  const key=card.dataset.animalInfo,lot=optionalIndex(card.dataset.lot);
  if(!Object.hasOwn(animals,key))return;
  const view=unlockGuide(state.me,'animal',key,lot);hideStockTooltip();
  stockTooltip.innerHTML='<strong>'+escape(animals[key].name)+'</strong>'+animalFacts(key,lot)+'<p>'+view.rows.map(r=>escape(r.label)+': '+r.have+'/'+r.need+(r.ready?' · Đã đạt':' · Còn thiếu')).join('<br>')+'</p><p>Chọn ảnh để xem chi tiết.</p>';placeItemTooltip(card);
}
function renderAnimalPicker(farm,lot,pens,limit){
  const all=Object.entries(animals).map(([key,def])=>({key,def,locked:!!animalRequirement(farm,key,lot)})),open=all.filter(v=>!v.locked),locked=all.filter(v=>v.locked);
  const entries=animalGroup==='locked'?locked:open,size=animalPickerSize(),pages=Math.max(1,Math.ceil(entries.length/size));
  if(size!==animalPageSize){animalPage=Math.floor(animalPage*animalPageSize/size);animalPageSize=size;}
  animalPage=Math.max(0,Math.min(pages-1,animalPage));
  const tabs='<div class="seed-tabs">'+[['open','Đã mở',open.length],['locked','Còn khóa',locked.length]].map(([id,label,n])=>btn(label+' '+n,'data-animal-group="'+id+'" aria-pressed="'+(animalGroup===id)+'"',animalGroup===id?'primary':'subtle')).join('')+'</div>';
  const cards=entries.slice(animalPage*size,(animalPage+1)*size).map(({key,def,locked})=>'<article class="seed-card animal-slot" data-locked="'+locked+'"><button type="button" class="btn seed-info" data-animal-info="'+key+'"'+(lot===undefined?'':' data-lot="'+lot+'"')+' aria-label="Xem '+escape(def.name)+' · '+(locked?'còn khóa':'đã mở')+'"><span class="seed-art">'+animalIllustration(key)+'</span><span class="seed-card-text"><strong>'+escape(def.name)+'</strong><span class="seed-card-meta"><b><span class="catalog-number">'+def.cost+'</span><small class="catalog-unit">xu</small></b></span></span></button>'+(locked?'<span class="seed-lock-label">Khóa</span>':act(pens.length>=limit?'Đầy':farm.coins<def.cost?'Thiếu xu':'Đón','animal',key,lot??'','gold',farm.coins<def.cost||pens.length>=limit))+'</article>').join('');
  return '<div class="animal-picker">'+tabs+'<div class="seed-cards">'+(cards||'<p>Đã mở toàn bộ vật nuôi.</p>')+'</div><nav class="seed-pagination" aria-label="Trang vật nuôi">'+btn('‹','data-animal-page="'+(animalPage-1)+'"','subtle',!animalPage)+'<span>'+(animalPage+1)+' / '+pages+'</span>'+btn('›','data-animal-page="'+(animalPage+1)+'"','subtle',animalPage===pages-1)+'</nav></div>';
}
function renderCoop(farm,now,lot){
  const key=coopKey(lot),view=coopPage(farm.pens,lot,now,coopViews.get(key));
  coopViews.set(key,{filter:view.filter,page:view.index});
  const limit=coopCapacity(farm,lot),food=farm.inventory.feed??0,extension=lot===undefined?null:parcelCoopUpgrade(farm,lot);
  const expand=extension?'<details class="panel-fold"><summary>Chuồng phụ · cấp '+extension.level+'</summary>'+(extension.next?'<p class="care-note">'+escape(extension.reason||'Mở thêm '+(extension.next.capacity-extension.capacity)+' chỗ')+'</p>'+act('Nâng lên '+extension.next.capacity+' chỗ · '+extension.next.cost+' xu','upgradeParcelCoop','',lot,'subtle',!!extension.reason||farm.coins<extension.next.cost):'<p class="care-note">Đã mở tối đa.</p>')+'</details>':'';
  const cards=view.entries.map(({pen,index:i,status})=>{
    const info=animals[pen.kind],outlook=animalOutlook(farm,pen,state.weather,now),ready=status==='ready',hungry=status==='hungry';
    const name=info.name+' '+(i+1),label=ready?'Sẵn sàng':hungry?'Cần ăn':pen.age<growthGoal(pen)?'Đang lớn':info.oneTime?'Vỗ béo':'Tạo sản phẩm';
    const ref=' data-target="'+escape(pen.id??i)+'" data-index="'+i+'"';
    const action=ready?btn(careIcon('animalHarvest')+(info.oneTime?'Xuất ':'Thu ')+outlook.yield,'data-action="collect"'+ref+' aria-label="'+escape((info.oneTime?'Xuất chuồng ':'Thu sản phẩm ')+name)+'"','stable-action',false):hungry?btn(careIcon('feed')+info.food+' phần','data-action="feed"'+ref+' aria-label="Cho ăn '+escape(name)+' · '+info.food+' phần'+(food<info.food?' · thiếu '+(info.food-food)+' phần':'')+'" title="'+(food<info.food?'Thiếu '+(info.food-food)+' phần trong túi':'Cho ăn')+'"','stable-action feed',food<info.food):'<span class="stable-timer" title="Ước tính nếu đủ thức ăn và giữ nguyên thời tiết">~'+duration(Math.ceil(outlook.seconds/60)*60)+'</span>';
    return '<article class="stable-tile" data-pen="'+i+'" data-care-state="'+status+'"><span class="stable-status">'+label+'</span>'+btn(animalIllustration(pen.kind), 'data-manage-animal="'+escape(pen.id??i)+'" aria-label="Quản lý '+escape(name)+'"','stable-face')+'<h3 title="'+escape(name)+'">'+name+'</h3>'+action+'</article>';
  }).join('');
  return '<section class="game-book stable-book"><header class="game-book-head"><h2>'+(lot===undefined?'Sổ chuồng':'Chuồng ô '+(lot+1))+'</h2><span>'+view.total+'/'+limit+' chỗ</span><span class="stable-food" aria-label="Trong túi còn '+food+' phần thức ăn">'+careIcon('feed')+'<strong>'+food+'</strong><span>trong túi</span></span></header><nav class="game-book-tabs" aria-label="Lọc vật nuôi">'+[['all','Tất cả'],['ready','Thu <span class="coop-count ready">'+view.ready+'</span>'],['hungry','Cần ăn <span class="coop-count hungry">'+view.hungry+'</span>']].map(([id,label])=>btn(label,'data-coop-filter="'+id+'" data-lot="'+(lot??'')+'" aria-pressed="'+(view.filter===id)+'"',view.filter===id?'primary':'subtle')).join('')+'</nav><div class="stable-grid">'+(cards||'<p class="stable-empty">'+(!limit?'Xây chuồng để đón vật nuôi.':view.total?'Không có vật nuôi trong nhóm này.':'Chuồng đang trống.')+'</p>')+'</div><footer class="game-book-pager">'+btn('‹','data-coop-page="'+(view.index-1)+'" data-lot="'+(lot??'')+'" aria-label="Trang vật nuôi trước"','subtle',!view.index)+'<span>'+(view.index+1)+' / '+view.count+'</span>'+(limit?btn('＋ Đón thêm','data-coop-adopt data-lot="'+(lot??'')+'"','subtle',view.total>=limit):act('Xây · 45 xu','upgrade','coop','','primary',farm.coins<45))+btn('›','data-coop-page="'+(view.index+1)+'" data-lot="'+(lot??'')+'" aria-label="Trang vật nuôi sau"','subtle',view.index===view.count-1)+'</footer><p class="game-book-foot">Chạm hình để quản lý</p></section>'+expand+(lot===undefined?'':btn('Tới chuồng','data-land-go="'+lot+'"','subtle'));
}
function showCoopAdoption(lot){
  animalPage=0;
  const farm=state.me,pens=farm.pens.filter(p=>p.lot===lot),limit=coopCapacity(farm,lot);
  modal('Đón thêm vật nuôi',renderAnimalPicker(farm,lot,pens,limit)+'<p id="dialog-error" role="status"></p>');
  dialog.dataset.adoptionLot=lot??'';
}
function animalImpactTable(farm,pen,w,now){
  const impacts=animalImpacts(farm,pen,w,now),pct=value=>{const n=Math.round(value*1000)/10;return (n>0?'+':'')+n.toLocaleString('vi-VN')+'%';};
  return '<table class="animal-impact-table"><caption class="sr-only">Tác động hiện tại tới vật nuôi</caption><tbody><tr><th scope="row">Thời tiết · '+escape(w.name)+'</th><td>'+pct(impacts.weather)+'</td></tr><tr><th scope="row">Chuồng · che chắn/mưa</th><td>'+pct(impacts.housing)+'</td></tr><tr class="impact-total"><th scope="row">Tốc độ đạt / cơ sở</th><td>'+((1+impacts.total)*100).toLocaleString('vi-VN',{maximumFractionDigits:1})+'%'+'</td></tr><tr><th scope="row">Sản lượng · số lứa</th><td>'+pct(impacts.yield)+'</td></tr></tbody></table><p class="care-note">Hệ số tốc độ nhân với nhau; không cộng các tỷ lệ. Thời tiết không đổi sản lượng.</p>';
}
function refreshAdoptionPicker(){
  const picker=dialog.querySelector('.animal-picker');
  if(!dialog.open||dialog.dataset.adoptionLot===undefined||!picker)return false;
  const lot=optionalIndex(dialog.dataset.adoptionLot),farm=state.me;
  hideStockTooltip();picker.outerHTML=renderAnimalPicker(farm,lot,farm.pens.filter(p=>p.lot===lot),coopCapacity(farm,lot));
  dialog.querySelector('.seed-pagination button:not(:disabled)')?.focus({preventScroll:true});
  return true;
}
function showAnimalManagement(id,confirmSale=false){
  const farm=state.me;
  const slot=farm.pens.findIndex(pen=>String(pen.id)===id);
  if(slot<0)return;
  const pen=farm.pens[slot],info=animals[pen.kind],condition=animalCondition(pen,currentTime());
  const title=info.name+' '+(slot+1), where=pen.lot===undefined?'Chuồng chính':'Chuồng ở ô '+(pen.lot+1);
  const sale='<form data-form="sellAnimal" data-target="'+id+'"><div class="actions">'+
    btn('Quay lại','data-manage-animal="'+id+'"','subtle')+'<button type="submit" class="btn danger">Bán · '+condition.sale+' xu</button></div></form>';
  const destinations=[undefined,...getLand(farm).flatMap((lot,index)=>lot?.kind==='coop'?[index]:[])].filter(lot=>lot!==pen.lot&&coopCapacity(farm,lot));
  const choices=destinations.map(lot=>{
    const reason=animalRelocation(farm,pen,lot);
    const label=lot===undefined?'Chuồng chính':'Chuồng ở ô '+(lot+1);
    return '<option value="'+(lot??-1)+'"'+(reason?' disabled':'')+'>'+label+(reason?' · '+escape(reason):'')+'</option>';
  }).join('');
  const canMove=destinations.some(lot=>!animalRelocation(farm,pen,lot));
  const move=destinations.length?'<form data-form="moveAnimal" data-target="'+id+'"><label>Chuyển đến<select name="destination" required>'+
    '<option value="" selected disabled>Chọn chuồng đích</option>'+choices+'</select></label><button type="submit" class="btn primary"'+(canMove?'':' disabled')+'>Chuyển chuồng</button></form>':
    '<p>Xây thêm chuồng để chuyển vật nuôi.</p>';
  const now=currentTime(),outlook=animalOutlook(farm,pen,state.weather,now);
  const ready=outlook.ready,eta=ready?'Có thể thu':(outlook.feeding?'~':'Sau cho ăn ~')+duration(Math.ceil(outlook.seconds/60)*60);
  const details=confirmSale?'<div class="animal-manage-hero">'+animalIllustration(pen.kind)+'<div><strong>'+title+'</strong><p>'+where+'</p></div></div><p>Bán sống nhận <strong>'+condition.sale+' xu</strong>, giải phóng một chỗ. Vật nuôi rời chuồng và sản phẩm chưa thu sẽ mất.</p>'+sale:
    '<div class="animal-manage-hero">'+animalIllustration(pen.kind)+'<div><strong>'+where+'</strong><p>'+(ready?(info.oneTime?'Đến lúc xuất chuồng':'Sẵn sàng thu'):!outlook.feeding?'Cần cho ăn':pen.age<growthGoal(pen)?'Đang lớn':info.oneTime?'Đang vỗ béo':'Đang tạo sản phẩm')+'</p></div></div>'+
    '<dl class="animal-manage-facts"><div><dt>Lứa này</dt><dd>'+condition.yield+' '+escape(goods[info.product].name.toLowerCase())+'</dd></div><div><dt>Thời gian</dt><dd>'+eta+'</dd></div></dl>'+
    '<details class="panel-fold" open><summary>Tốc độ &amp; sản lượng</summary>'+animalImpactTable(farm,pen,state.weather,now)+'<p class="care-note">'+(ready?'Đã tới kỳ thu.':outlook.feeding?'Ước tính nếu thời tiết giữ nguyên và luôn đủ ăn.':'Đang dừng lớn. Thời gian tính từ lúc cho ăn lại.')+'</p></details>'+
    '<details class="panel-fold"><summary>Thức ăn · '+(outlook.feeding?'còn '+duration(outlook.feedSeconds):ready?'không cần thêm để thu':'đang đói')+'</summary><p>'+info.food+' phần mỗi lần cho ăn.</p>'+(!ready&&outlook.needsMoreFood?'<p class="care-note">Thức ăn hiện tại chưa đủ đến lần thu; cần cho ăn tiếp để đạt ước tính.</p>':'')+'</details>'+
    '<details class="panel-fold"><summary>Quá trình &amp; số lứa</summary><div class="care-progress-label"><span>Lớn lên</span><b>'+progress(pen.age,growthGoal(pen))+'%</b></div>'+valueBar(pen.age,growthGoal(pen))+'<div class="care-progress-label"><span>'+(info.oneTime?'Vỗ béo':'Tạo sản phẩm')+'</span><b>'+progress(pen.progress,productGoal(pen))+'%</b></div>'+valueBar(pen.progress,productGoal(pen))+(info.oneTime?'<p class="care-note">Xuất chuồng một lần; không giảm sản lượng theo số lứa.</p>':'<p>'+condition.label+' · '+condition.cycles+' chu kỳ.</p><p class="care-note">Thu thành công mới tăng tuổi: '+livestockCycleAges[1].since+' chu kỳ → Lớn tuổi; '+livestockCycleAges[2].since+' → Già. Nghỉ chơi không tăng tuổi.'+(condition.legacyOffset?' Giữ mức cũ bằng '+condition.legacyOffset+' chu kỳ quy đổi.':'')+'</p>')+'</details>'+
    '<details class="panel-fold"><summary>Chuyển chuồng</summary>'+move+'</details><div class="animal-manage-sale"><span class="care-note">Bán sống · '+condition.sale+' xu</span>'+btn('Xem trước khi bán','data-sell-animal="'+id+'"','subtle')+'</div>';
  modal((confirmSale?'Bán ':'Quản lý ')+title.toLowerCase(),details+'<p id="dialog-error" role="status"></p>');
  dialog.classList.add('game-management');
}
function renderMarket(farm) {
  const options={orders:'Đơn làng',stall:'Sạp',supplies:'Vật tư',sales:'Bán nhanh'};
  const subnav='<div class="market-tabs" role="group" aria-label="Khu vực chợ">'+Object.entries(options).map(([key,label])=>btn(label,'data-market-pane="'+key+'" aria-pressed="'+(marketPane===key)+'"',marketPane===key?'primary':'subtle')).join('')+'</div>';
  if(marketPane==='orders')return subnav+'<section id="market-orders">'+renderOrderBoard(farm,currentTime())+'</section>';
  const titles={stall:'Sạp nông sản',supplies:'Vật tư',sales:'Bán nhanh cho chợ'};
  const label=marketPane==='sales'?'Tìm nông sản cần bán':marketPane==='supplies'?'Tìm vật tư cần mua':'Tìm nông sản trên sạp';
  const list=marketPane==='stall'?btn('Đăng bán','data-list','primary',!stock(farm)):'';
  const categories={all:'Tất cả',...Object.fromEntries(Object.entries(supplyGroups).map(([id,group])=>[id,group.label]))};
  const filters=marketPane==='supplies'?'<div class="market-filters" role="group" aria-label="Nhóm vật tư">'+Object.entries(categories).map(([id,name])=>
    btn(escape(name),'data-supply-group="'+id+'" aria-controls="market-results" aria-pressed="'+(id===supplyGroup)+'"',id===supplyGroup?'primary':'subtle')).join('')+'</div>':'';
  const grid=marketPane==='supplies'?'':' card-grid market-cards';
  return subnav+'<section id="market-'+marketPane+'"><div class="row"><h2>'+titles[marketPane]+'</h2>'+list+'</div>'+
    '<div class="market-search"><input type="search" data-market-search="'+marketPane+'" autocomplete="off" aria-label="'+label+'" placeholder="'+label+'" value="'+escape(marketQueries[marketPane])+'"></div>'+
    filters+'<div class="itemlist'+grid+'" id="market-results" data-market-results>'+renderMarketResults(farm,marketPane)+'</div></section>';
}
const searchText=value=>value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/g,'d').trim();
function renderMarketResults(farm,pane){
  const query=searchText(marketQueries[pane]);
  const words=query.split(/\s+/);
  const matches=key=>words.every(word=>searchText(goods[key].name).includes(word));
  const empty='<p role="status">Không tìm thấy vật phẩm phù hợp.</p>';
  if(pane==='stall'){
    const page=catalogPage(state.listings.filter(entry=>matches(entry.item)),marketPages.stall);marketPages.stall=page.index;
    return (page.entries.map(entry=>
      '<div class="row itemrow"><div>'+itemLink(entry.item)+'<span class="catalog-stock">Số lượng <b>'+entry.qty+'</b></span>'+'<p>'+escape(entry.sellerName)+' · '+entry.price+' xu/món</p></div>'+
      (entry.seller===farm.id?act('Gỡ','delist','',entry.id,'subtle'):act('Mua · '+entry.price*entry.qty+' xu','deal','',entry.id,'gold',farm.coins<entry.price*entry.qty))+'</div>'
    ).join('')||(query?empty:'<p>Sạp đang trống.</p>'))+catalogPager(page,'data-market-catalog-page');
  }
  if(pane==='supplies'){
    const groups=supplyGroup==='all'?Object.values(supplyGroups):[supplyGroups[supplyGroup]];
    const page=catalogPage([...new Set(groups.flatMap(g=>g.items))].filter(matches),marketPages.supplies);marketPages.supplies=page.index;
    return '<div class="market-catalog">'+(page.entries.map(key=>{
      const count=farm.inventory[key]??0,crop=Object.keys(crops).find(crop=>crops[crop].seed===key),locked=crop?cropRequirement(farm,crop):aquaSupplyRequirement(farm,key);
      return '<article class="market-catalog-slot"><div>'+itemLink(key)+'</div><span class="catalog-stock">Túi <b>'+count+'</b></span>'+(locked?(itemUnlockTarget(key)?unlockButton(itemUnlockTarget(key).type,itemUnlockTarget(key).key,'Điều kiện'):'<span>Khóa</span>'):btn('Mua · '+goods[key].buy+' xu','data-shop="'+key+'"','subtle',farm.coins<goods[key].buy||count>=supplyLimit))+'</article>';
    }).join('')||empty)+'</div>'+catalogPager(page,'data-market-catalog-page');
  }
  const page=catalogPage(Object.keys(goods).filter(key=>matches(key)&&goods[key].sell&&farm.inventory[key]),marketPages.sales);marketPages.sales=page.index;
  return '<div class="market-catalog">'+(page.entries.map(key=>{
    const count=farm.inventory[key]??0;
    const price=goods[key].sell;
    return '<div class="itemrow market-sale">'+itemLink(key)+'<span class="catalog-stock">Kho <b>'+count+'</b></span>'+'<div class="actions">'+
      btn('Bán · '+price+' xu','data-sell="'+key+'"')+btn('Bán hết','data-sell-all="'+key+'" aria-label="Bán hết '+goods[key].name+'"','gold')+'</div></div>';
  }).join('')||(query?empty:'<p>Thu hoạch nông sản để bán lấy xu.</p>'))+'</div>'+catalogPager(page,'data-market-catalog-page');
}
function visitPlotLabel(index){
  return (gardenFor(index)<0?'Ruộng chính':'Vườn '+(gardenFor(index)+1))+' · Ô '+plotNumber(index);
}
function visitPager(page,attribute){
  return page.count<2?'':'<div class="visit-pages">'+btn('‹','data-'+attribute+'="'+(page.index-1)+'" aria-label="Trang trước"','subtle',page.index===0)+'<span>'+(page.index+1)+' / '+page.count+'</span>'+btn('›','data-'+attribute+'="'+(page.index+1)+'" aria-label="Trang sau"','subtle',page.index+1>=page.count)+'</div>';
}
function visitItem(kind,copy,action,attrs,disabled=false){
  return '<article class="visit-item"><div class="visit-item-info">'+itemLink(kind)+'<small>'+escape(copy)+'</small></div>'+btn(action,attrs,'primary',disabled)+'</article>';
}
function renderNeighbors(farm,now) {
  const villageLeft=state.village.theftsLeft;
  const left=Math.max(0,Math.min(villageLeft,visitLimit(farm)-farm.daily.taken));
  const help=farm.neighborHelp??{given:0,targets:{}};
  const current=state.neighbors.find(n=>n.id===neighborId);
  const protection=(farm.prankActive?.until>now?'<p class="care-note">Vườn bạn có sâu nghịch. '+btn('Tới ô cây','data-prank-go="'+farm.prankActive.index+'"','subtle')+'</p>':'')+
    (farm.prankImmuneUntil>now?'<p class="care-note">Vườn bạn được miễn nhận thêm trong <span data-until="'+farm.prankImmuneUntil+'">'+duration(farm.prankImmuneUntil-now)+'</span>.</p>':'');
  if(!current) {
    const homes=neighborHomes(state),page=neighborPage(state,villagePage),count=page.count;
    const pages=count>1?'<div class="visit-pages">'+btn('‹','data-village-page="'+(villagePage-1)+'" aria-label="Khu trước"','subtle',villagePage===0)+'<span>Khu '+(villagePage+1)+' / '+count+'</span>'+btn('›','data-village-page="'+(villagePage+1)+'" aria-label="Khu sau"','subtle',villagePage+1>=count)+'</div>':'';
    const cards=page.homes.map(n=>'<article class="neighbor-card"><span class="neighbor-home-art" aria-hidden="true" style="--house-tier:'+neighborHouseTier(n.wealth)+'"></span><h3>'+escape(n.name)+(n.mine?' · Bạn':'')+'</h3><p class="care-note">Cấp '+(n.mine?farmProgress(farm).rank.level:n.level??1)+' · '+formatCoins(n.wealth)+' xu tài sản</p><span class="care-state">'+(n.mine?'Vườn của bạn':n.shieldUntil>now?'Đang đóng cổng':n.garden.length+' ô có thể lấy')+'</span>'+btn(n.mine?'Về nhà':'Ghé thăm',n.mine?'data-tab="field"':'data-visit="'+n.id+'"','primary')+'</article>').join('');
    const waiting=state.neighbors.length?'':'<article class="wide-card"><h3>Làng đang chờ hàng xóm</h3><p class="care-note">Chia sẻ mã làng để bạn bè vào chơi cùng.</p>'+btn('Chia sẻ mã','data-room','primary')+'</article>';
    return '<section class="neighbors-panel">'+boardBar('Hàng xóm',homes.length+'/12 nhà')+pages+'<div class="farm-list neighbor-list">'+cards+waiting+'</div>'+protection+
      '<details class="panel-fold" data-panel-fold="neighbor-rules"><summary>Lượt chơi & chăm vườn của bạn</summary><p class="care-note">Lấy đồ: còn '+left+'/'+visitLimit(farm)+' lượt. Tưới giúp: còn '+Math.max(0,3-help.given)+'/3 lượt. Nghịch vui: còn '+Math.max(0,2-(farm.prankDaily?.given??0))+'/2 lượt, '+(farm.prankJars??0)+'/2 lọ.</p><p class="care-note">Nghịch vui tự mở từ cấp 3. Một ô chậm 10%, tối đa 3 phút; bắt miễn phí. Mỗi vườn nhận tối đa 2 lượt/ngày, có thời gian miễn nhận.</p>'+act(farm.helpEnabled===false?'Bật nhận tưới giúp':'Tắt nhận tưới giúp','helpPreference',farm.helpEnabled===false?'on':'off','','subtle')+'</details></section>';
  }
  const unavailable=left<1||current.available<1||farm.daily.targets.includes(current.id)||current.shieldUntil>now;
  const message=villageLeft<1?'Cả làng đã hết lượt lấy hôm nay.':current.shieldUntil>now?'Cổng đang đóng.':farm.daily.targets.includes(current.id)?'Bạn đã lấy một món ở vườn này hôm nay.':current.available<1?'Vườn đã đạt giới hạn bị lấy hôm nay.':left<1?'Bạn đã hết lượt lấy hôm nay.':'Mỗi vườn lấy một món/ngày; dùng chung lượt với câu ao.';
  const tabs='<div class="stock-tabs visit-tabs" aria-label="Việc khi ghé vườn">'+[['take','Vườn & kho'],['help','Tưới giúp'],['prank','Nghịch vui'],['pond','Ao nuôi']].map(([key,label])=>btn(label,'data-visit-pane="'+key+'" aria-pressed="'+(visitPane===key)+'"',visitPane===key?'primary':'subtle')).join('')+'</div>';
  const head='<header class="visit-heading"><span class="visit-home-art" aria-hidden="true" style="--house-tier:'+neighborHouseTier(current.wealth)+'"></span><div><h2>'+escape(current.name)+'</h2><p class="care-note">Cấp '+current.level+' · Ruộng '+current.field+' · '+current.animalCount+' vật nuôi</p></div>'+btn('‹','data-return aria-label="Về danh sách hàng xóm"','subtle')+'</header>';
  const quota='<div class="visit-quotas"><span>Lấy <b>'+left+'/'+visitLimit(farm)+'</b></span><span>Giúp <b>'+Math.max(0,3-help.given)+'/3</b></span><span>Nghịch <b>'+Math.max(0,2-(farm.prankDaily?.given??0))+'/2</b></span></div>';
  let body='';
  if(visitPane==='take'){
    const rows=visitSource==='garden'?current.garden:current.items.map(kind=>({kind}));
    const page=visitPage(rows,visitTakePage);visitTakePage=page.index;
    body='<div class="visit-sources">'+btn('Ngoài vườn · '+current.garden.length,'data-visit-source="garden" aria-pressed="'+(visitSource==='garden')+'"',visitSource==='garden'?'gold':'subtle')+btn('Trong kho · '+current.items.length,'data-visit-source="barn" aria-pressed="'+(visitSource==='barn')+'"',visitSource==='barn'?'gold':'subtle')+'</div><section id="visit-'+(visitSource==='garden'?'garden':'barn')+'"><p class="care-note">'+message+'</p><div class="visit-items">'+page.rows.map(p=>visitItem(p.kind,visitSource==='garden'?visitPlotLabel(p.index):'Nông sản trong kho','Lấy 1','data-action="steal" data-target="'+current.id+'" data-source="'+visitSource+'"'+(p.index!==undefined?' data-index="'+p.index+'"':'')+' data-item="'+p.kind+'"',unavailable)).join('')+'</div>'+(!rows.length?'<p class="visit-empty">'+(visitSource==='garden'?'Chưa có cây đủ nông sản để lấy.':'Chưa có nông sản có thể lấy trong kho.')+'</p>':'')+visitPager(page,'visit-take-page')+'</section>';
  }else if(visitPane==='help'){
    const blocked=help.given>=3||(help.targets[current.id]??0)>=2||current.helpReceived>=6;
    const reason=current.helpEnabled===false?'Chủ vườn đã tắt nhận tưới giúp.':help.given>=3?'Bạn đã giúp đủ 3 lượt hôm nay.':(help.targets[current.id]??0)>=2?'Bạn đã giúp vườn này 2 lượt hôm nay.':current.helpReceived>=6?'Vườn đã nhận đủ 6 lượt giúp hôm nay.':'Tưới cây đang khô · Dùng sức của bạn, không dùng lượt lấy đồ.';
    const page=visitPage(current.helpEnabled===false?[]:current.helpPlots??[],helpPage);helpPage=page.index;
    body='<section id="visit-help"><h3>Tưới giúp hàng xóm</h3><p class="care-note">'+reason+'</p><div class="visit-items">'+page.rows.map(p=>visitItem(p.kind,visitPlotLabel(p.index),'Tưới giúp','data-action="helpWater" data-target="'+current.id+'" data-index="'+p.index+'"',blocked)).join('')+'</div>'+(!page.rows.length&&current.helpEnabled!==false?'<p class="visit-empty">Chưa có cây cần tưới. Trời mưa hoặc đất đủ ẩm thì không cần giúp.</p>':'')+visitPager(page,'help-page')+'</section>';
  }else if(visitPane==='prank'){
    const page=visitPage(current.prankPlots??[],prankPage);prankPage=page.index;
    body='<section id="visit-prank"><div class="row"><h3>Nghịch vui</h3><span class="badge">'+(farm.prankJars??0)+'/2 lọ</span></div><p class="care-note">1 lọ · Chậm 10% · Tự hết sau 3 phút · Bắt miễn phí</p>'+(current.prankBlock?'<p class="visit-empty">'+escape(current.prankBlock)+'</p>':'<div class="visit-items">'+page.rows.map(p=>visitItem(p.kind,visitPlotLabel(p.index),'Thả sâu','data-action="releasePrank" data-target="'+current.id+'" data-index="'+p.index+'"')).join('')+'</div>'+(!page.rows.length?'<p class="visit-empty">Chưa có cây phù hợp: giai đoạn 2 trở lên, dưới 90%, sâu/cỏ dưới 20%.</p>':'')+visitPager(page,'prank-page'))+'<details class="panel-fold" data-panel-fold="visit-prank-rules"><summary>Giới hạn & bảo vệ</summary><p class="care-note">Cả hai vườn từ cấp 3. Bạn nghịch tối đa 2 lần/ngày, mỗi chủ một lần; chủ nhận tối đa 2 lần/ngày. Không chồng hiệu ứng, miễn nhận 30 phút sau hạn hết tự nhiên. Cổng đóng vẫn bảo vệ. Không trừ sản phẩm trực tiếp.</p></details></section>';
  }else body='<section id="visit-pond"><h3>Ao nuôi hàng xóm</h3><p class="care-note">'+message+'</p>'+visitFishing(current,unavailable,now)+'</section>';
  return '<section class="visit-panel">'+head+quota+tabs+'<div class="visit-content">'+body+'</div></section>';
}
function visitFishing(current,unavailable,now){
  const ponds=current.pondIndexes;
  if(!ponds.includes(visitPond))visitPond=ponds[0];
  const cast=state.me.fishing.cast;
  if(cast?.target===current.id&&ponds.includes(cast.index))visitPond=cast.index;
  const batch=visiblePondBatches(current,visitPond).find(row=>row.available);
  const buttons=ponds.length===1?'':'<div class="actions">'+ponds.map(i=>btn(i===0?'Ao chính':'Ao ô '+(i-pondOffset+1),'data-visit-pond="'+i+'"',i===visitPond?'primary':'subtle')).join('')+'</div>';
  return buttons+'<p>'+(batch?.available?'Có '+goods[batch.kind].name.toLowerCase()+' đủ lớn.':'Ao chưa có đủ cá trưởng thành.')+'</p>'+fishingControls('pond',now,{target:current.id,index:visitPond,allowed:!unavailable&&!!batch?.available});
}
const pondViews=new Map();
function pondStatus(batch,now){return pondReady(batch)?'ready':batch.fedUntil<=now?'hungry':'growing';}
function pondIllustration(kind){return itemIllustration(kind)||'<span class="pond-symbol" aria-hidden="true">'+goods[kind].icon+'</span>';}
function renderPonds(farm,now){
  if(!farm.pondIndexes.includes(pondTab))pondTab=farm.pondIndexes[0]??0;
  const batches=visiblePondBatches(farm,pondTab),used=batches.reduce((sum,b)=>sum+(b.count??1),0),limit=pondCapacity(farm,pondTab),food=farm.inventory.aquaFeed??0;
  const view=pondViews.get(pondTab)??{filter:'all',page:0};
  const ready=batches.filter(b=>pondStatus(b,now)==='ready').length,hungry=batches.filter(b=>pondStatus(b,now)==='hungry').length;
  const size=animalPickerSize()===4?3:6;
  if(view.size&&view.size!==size)view.page=Math.floor(view.page*view.size/size);
  const page=catalogPage(batches.filter(b=>view.filter==='all'||pondStatus(b,now)===view.filter),view.page,size);view.page=page.index;view.size=size;pondViews.set(pondTab,view);
  const tabs=farm.pondIndexes.map(i=>btn(i===0?'Ao chính':'Ao ô '+(i-pondOffset+1),'data-pond-tab="'+i+'" aria-pressed="'+(pondTab===i)+'"',pondTab===i?'primary':'subtle')).join('');
  const cards=page.entries.map(batch=>{
    const def=aquatic[batch.kind],status=pondStatus(batch,now),outlook=pondOutlook(batch,state.weather,now),cost=pondFood(batch);
    const action=status==='ready'?act(careIcon('animalHarvest')+'Thu '+pondYield(batch),'aquaHarvest',batch.kind,pondTab,'stable-action'):status==='hungry'?act(careIcon('feed')+cost+' phần','aquaFeed',batch.kind,pondTab,'stable-action feed',food<cost):'<span class="stable-timer" title="Ước tính nếu luôn đủ ăn và thời tiết giữ nguyên">~'+duration(Math.ceil(outlook.seconds/60)*60)+'</span>';
    return '<article class="stable-tile" data-care-state="'+status+'"><span class="stable-status">'+(status==='ready'?'Sẵn sàng':status==='hungry'?'Cần ăn':'Đang lớn')+'</span>'+btn(pondIllustration(batch.kind),'data-manage-pond="'+batch.kind+'" data-pond="'+pondTab+'" aria-label="Quản lý '+escape(def.name)+'"','stable-face')+'<h3>'+escape(def.name)+'</h3>'+action+'</article>';
  }).join('');
  return '<div class="market-tabs pond-tabs">'+tabs+'</div><section class="game-book stable-book pond-book"><header class="game-book-head"><h2>Sổ ao</h2><span>'+used+'/'+limit+' chỗ</span><span class="stable-food" aria-label="Trong túi còn '+food+' phần thức ăn ao">'+careIcon('feed')+'<strong>'+food+'</strong><span>thức ăn ao</span></span></header><nav class="game-book-tabs" aria-label="Lọc lứa thủy sản">'+[['all','Tất cả'],['ready','Thu <span class="coop-count ready">'+ready+'</span>'],['hungry','Cần ăn <span class="coop-count hungry">'+hungry+'</span>']].map(([id,label])=>btn(label,'data-pond-filter="'+id+'" aria-pressed="'+(view.filter===id)+'"',view.filter===id?'primary':'subtle')).join('')+'</nav><div class="stable-grid">'+(cards||'<p class="stable-empty">'+(batches.length?'Không có lứa trong nhóm này.':'Ao còn trống. Thả con giống để bắt đầu.')+'</p>')+'</div><footer class="game-book-pager">'+btn('‹','data-pond-page="'+(page.index-1)+'" aria-label="Trang thủy sản trước"','subtle',!page.index)+'<span>'+(page.index+1)+' / '+page.count+'</span>'+btn('＋ Thả giống','data-pond-adopt','subtle',used>=limit)+btn('›','data-pond-page="'+(page.index+1)+'" aria-label="Trang thủy sản sau"','subtle',page.index===page.count-1)+'</footer><p class="game-book-foot">Chạm hình để quản lý · Số Thu/Cần ăn tính theo lứa</p></section>'+btn('Tới cầu gỗ','data-pond-go','subtle');
}
function showPondManagement(kind,index){
  const batch=visiblePondBatches(state.me,index).find(b=>b.kind===kind);if(!batch)return;
  const def=aquatic[kind],now=currentTime(),outlook=pondOutlook(batch,state.weather,now),ready=pondReady(batch),cost=pondFood(batch);
  const where=index===0?'Ao chính':'Ao ô '+(index-pondOffset+1),eta=ready?'Có thể thu':(outlook.feeding?'~':'Sau cho ăn ~')+duration(Math.ceil(outlook.seconds/60)*60);
  const percent=Math.round((outlook.rate-1)*100);
  modal('Quản lý '+def.name.toLowerCase(),'<div class="animal-manage-hero">'+pondIllustration(kind)+'<div><strong>'+where+'</strong><p>'+(ready?'Sẵn sàng thu':outlook.feeding?'Đang lớn':'Cần cho ăn')+' · '+(batch.count??1)+' con giống</p></div></div><dl class="animal-manage-facts"><div><dt>Lứa này còn</dt><dd>'+pondYield(batch)+' '+escape(def.name.toLowerCase())+'</dd></div><div><dt>Thời gian</dt><dd>'+eta+'</dd></div></dl><details class="panel-fold" open><summary>Tốc độ &amp; sản lượng</summary><table class="animal-impact-table"><tbody><tr><th>Thời tiết · tốc độ</th><td>'+(percent>0?'+':'')+percent+'%</td></tr><tr><th>Thời tiết · sản lượng</th><td>0%</td></tr><tr class="impact-total"><th>Tốc độ hiện tại</th><td>'+Math.round(outlook.rate*100)+'%</td></tr></tbody></table><p class="care-note">'+(ready?'Đã tới kỳ thu.':outlook.feeding?'Ước tính nếu thời tiết giữ nguyên và luôn đủ ăn.':'Đang dừng lớn. Thời gian tính từ lúc cho ăn lại.')+'</p></details><details class="panel-fold"><summary>Thức ăn · '+(ready?'không cần thêm để thu':outlook.feeding?'còn '+duration(outlook.feedSeconds):'đang đói')+'</summary><p>'+cost+' phần mỗi lần cho ăn cả lứa.</p>'+(outlook.needsMoreFood&&!ready?'<p class="care-note">Cần cho ăn tiếp để đạt thời gian ước tính.</p>':'')+'</details><details class="panel-fold"><summary>Quá trình &amp; sản lượng</summary><div class="care-progress-label"><span>Lớn lên</span><b>'+progress(batch.progress,def.time)+'%</b></div>'+valueBar(batch.progress,def.time)+'<p>Mỗi giống cho '+def.yield+' sản phẩm. Đã lấy '+(batch.picked??0)+'; còn '+pondYield(batch)+'.</p><p class="care-note">Thời gian cơ sở '+duration(def.time)+'.</p></details>');
  dialog.classList.add('game-management');
}
function showPondAdoption(){
  const farm=state.me,batches=visiblePondBatches(farm,pondTab),used=batches.reduce((sum,b)=>sum+(b.count??1),0),limit=pondCapacity(farm,pondTab);
  const cards=Object.entries(aquatic).map(([item,def])=>{
    const available=farm.inventory[def.seed]??0,locked=aquaRequirement(farm,item),present=batches.some(b=>b.kind===item),art=aquaIllustration(item);
    if(locked)return unlockButton('aqua',item,art+'<span>'+def.name+'<small>Khóa · Xem điều kiện</small></span>');
    return btn(art+'<span>'+def.name+'<small>'+(present?'Đang nuôi':used>=limit?'Ao đã đầy':!available?'Chưa có giống':available+' giống trong túi')+'</small></span>','data-aqua-stock="'+item+'"','subtle aqua-stock',present||used>=limit||!available);
  }).join('');
  modal('Thả con giống','<p>Còn '+Math.max(0,limit-used)+' chỗ · Mỗi loài một lứa trong mỗi ao.</p><div class="pond-stock-grid">'+cards+'</div>'+btn('Đến chợ','data-tab="market"','subtle'));
}
function showPondStock(item){
  const farm=state.me, def=aquatic[item];
  const batches=visiblePondBatches(farm,pondTab);
  const used=batches.reduce((sum,batch)=>sum+(batch.count??1),0);
  const max=Math.min(farm.inventory[def.seed]??0,pondCapacity(farm,pondTab)-used);
  if(aquaRequirement(farm,item)||max<1||batches.some(batch=>batch.kind===item))return;
  modal('Thả '+def.name.toLowerCase(),'<p>Có thể thả tối đa '+max+' con giống vào ao này.</p>'+
    itemDescription(def.seed)+'<form data-form="aquaStock" data-item="'+item+'" data-pond="'+pondTab+'"><label>Số con giống<input name="qty" type="number" min="1" max="'+max+'" value="1" required></label>'+
    '<button class="btn primary" type="submit">Thả giống</button></form><p id="dialog-error" role="status"></p>');
}
function fishingControls(source,now,{target,index,allowed=true}={}){
  const info=state.me.fishing, cast=info.cast;
  if(cast){
    const same=cast.source===source&&(source==='public'||cast.target===target&&cast.index===index);
    if(!same)return '<p>Bạn đang có cần câu ở một điểm khác.</p>';
    const ready=cast.ready<=now;
    const time=ready?cast.expires-now:cast.ready-now;
    return '<p>'+(ready?'Phao chìm rồi! Còn ':'Chờ cá cắn ')+'<strong data-until="'+(ready?cast.expires:cast.ready)+'">'+duration(time)+'</strong>.</p><div class="actions">'+act('Kéo cần','reel','','','primary',!ready)+'</div>';
  }
  if(state.weather.id==='storm')return '<p>Trời đang dông. Bạn có thể thả câu sau khi dông qua.</p>';
  if(source==='public'){
    if(info.used>=state.fishingLimit)return '<p>Bạn đã dùng hết lượt câu hôm nay.</p>';
    if(info.nextAt>now)return '<p>Có thể thả lại sau <strong data-until="'+info.nextAt+'">'+duration(info.nextAt-now)+'</strong>.</p>';
  }
  return '<div class="actions">'+btn(source==='public'?'Thả câu miễn phí':'Thả câu trộm',
    'data-action="cast" data-source="'+source+'"'+(target?' data-target="'+target+'" data-index="'+index+'"':''),'primary',!allowed)+'</div>';
}
function renderLake(farm,now){
  const head='<div class="lake-heading"><div><h2>Ao làng</h2><span class="care-note">Bến nước chung của làng</span></div>'+btn('Gặp Ông Sáu','data-lake-elder','subtle')+'</div>';
  const tabs='<div class="stock-tabs lake-tabs" aria-label="Hoạt động Ao làng">'+[['fishing','Bến câu'],['shore','Ven ao'],['book','Sổ cá']].map(([key,label])=>btn(label,'data-lake-tab="'+key+'" aria-pressed="'+(lakeTab===key)+'"',lakeTab===key?'primary':'subtle')).join('')+'</div>';
  const wrap=body=>'<section class="lake-panel">'+head+tabs+body+'</section>';
  if(lakeTab==='shore'){
    const job=farm.shoreJob,daily=farm.lakeDaily??{},marks=farm.lakeMarks??0;
    const reason=daily.worked?'Đã hoàn thành hôm nay':farm.xp<25?'Mở ở nông trại cấp 2':marks>4?'Đổi bớt dấu trước khi nhận thêm':'10 giây · Nhận 2 dấu · 1 lần/ngày';
    const feedReason=daily.exchanged?'Đã đổi hôm nay':marks<2?'Cần 2 dấu':(farm.inventory.aquaFeed??0)>=supplyLimit?'Túi đã đầy':'2 dấu → 1 phần';
    const jarReason=daily.exchanged?'Đã đổi hôm nay':!prankUnlocked(farm)?'Mở ở cấp 3':(farm.prankJars??0)>=2?'Đã đủ 2 lọ':marks<2?'Cần 2 dấu':'2 dấu → 1 lọ';
    return wrap('<div class="care-overview"><span>Dấu ao <b>'+marks+'/6</b></span><span>Thức ăn <b>'+(farm.inventory.aquaFeed??0)+'</b></span><span>Lọ sâu <b>'+(farm.prankJars??0)+'/2</b></span></div><article class="lake-card"><div class="row"><h3>Việc ven ao</h3><span class="care-state">'+(job?'Đang làm':daily.worked?'Đã xong':'Dọn cỏ')+'</span></div><p class="care-note">'+reason+'</p>'+
      (job?valueBar(Math.min(10,job.elapsed),10)+'<p class="care-note" role="status">Đang dọn · '+Math.min(10,job.elapsed)+'/10 giây. Di chuyển sẽ dừng việc.</p>'+act('Dừng','shoreCancel','','','subtle'):
        act(daily.worked?'Hôm nay đã dọn':farm.xp<25?'Mở ở cấp 2':'Tới bờ ao · Dọn cỏ','shoreStart','','','primary',daily.worked||farm.xp<25||marks>4))+
      '</article><div class="lake-exchange-heading"><h3>Đổi dấu ao</h3><span class="care-note">Chọn 1 gói/ngày</span></div><div class="lake-exchange">'+
      act('<strong>Thức ăn ao</strong><small>'+feedReason+'</small>','lakeExchange','aquaFeed','','subtle',daily.exchanged||marks<2||(farm.inventory.aquaFeed??0)>=supplyLimit)+
      act('<strong>Lọ sâu nghịch</strong><small>'+jarReason+'</small>','lakeExchange','prankJar','','subtle',daily.exchanged||marks<2||!prankUnlocked(farm)||(farm.prankJars??0)>=2)+'</div><p class="care-note">Nghịch vui tự mở từ cấp 3, có giới hạn và miễn nhận.</p>');
  }
  if(lakeTab==='book')return wrap('<div class="row lake-section-heading"><h3>Sổ cá Hồ làng</h3><span class="badge">'+lakeSpecies.filter(key=>farm.fishBook?.[key]?.count>0).length+'/3 loài</span></div><div class="lake-book-list">'+lakeSpecies.map(key=>{
    const entry=farm.fishBook?.[key];
    return '<article class="lake-fish-card" data-found="'+!!entry?.count+'">'+itemLink(key)+'<span class="care-state">'+(entry?.count?'Đã câu · '+entry.count:'Chưa gặp')+'</span></article>';
  }).join('')+'</div><p class="care-note">Chỉ ghi cá tự câu ở Hồ làng.</p><article class="lake-card"><h3>Kỷ niệm bến nước</h3><p class="care-note">Đủ 3 loài · 1 phiếu trang trí · Nhận một lần</p>'+act(farm.fishBookClaimed?'Đã nhận phiếu':'Nhận phiếu trang trí','claimFishBook','','','primary',farm.fishBookClaimed||!fishBookComplete(farm))+'</article>');
  const odds=state.weather.id==='storm'?'Dông lớn làm tạm dừng thả câu.':'Cá nhỏ thường gặp. Tỷ lệ cá chép vàng '+catchOdds(state.weather)+'%.';
  return wrap('<article class="lake-card"><div class="row"><h3>Câu ở hồ làng</h3><span class="badge">'+(state.fishingLimit-farm.fishing.used)+'/'+state.fishingLimit+' lượt</span></div><p class="care-note">'+odds+'</p>'+fishingControls('public',now)+'</article><p class="care-note">Chọn thả câu để tự đi tới một trong hai bến.</p>');
}
function fencePreview(style){
  const row=['wood','white','bamboo'].indexOf(style);
  return row<0?'':'<span class="fence-preview" aria-hidden="true" style="background-position:0 -'+(row*72+45)+'px"></span>';
}
function decorOptions(farm,index){
  const style=fenceAt(farm,index);
  const name=index===-1?'Ruộng chính':index===-4?'Chuồng chính':'Ô '+(index+1);
  return '<section class="fence-picker"><p class="care-note">'+name+' · '+(fences[style]?.name??'Chưa đặt rào')+'</p><p class="care-note">Chỉ trang trí, không tăng sức chứa. Chọn mẫu để xem giá và xác nhận.</p><div class="fence-options">'+Object.entries(fences).map(([key,option])=>btn(fencePreview(key)+'<strong>'+option.name+'</strong><small>'+(key===style?'✓ Đang dùng':option.cost+' xu · '+(farm.coins<option.cost?'Chưa đủ xu':'Xem mẫu'))+'</small>','data-fence-info="'+key+'" data-fence-index="'+index+'" aria-label="'+option.name+', '+(key===style?'đang dùng':option.cost+' xu')+'"',key===style?'primary':'subtle',key===style)).join('')+'</div>'+(style?btn('Gỡ hàng rào','data-fence-info="none" data-fence-index="'+index+'"','subtle'):'')+'</section>';
}
function showFenceChoice(style,index){
  const option=fences[style],current=fenceAt(state.me,index);
  if(!option&&style!=='none')return;
  const where=index===-1?'Ruộng chính':index===-4?'Chuồng chính':'Ô '+(index+1);
  modal(style==='none'?'Gỡ hàng rào':option.name,(option?fencePreview(style):'')+'<p><b>'+where+'</b> · Hiện tại: '+(fences[current]?.name??'Chưa đặt rào')+'</p><p>'+(option?'Đặt mẫu này tốn '+option.cost+' xu. '+(current?'Mẫu cũ sẽ được thay thế. ':''):'Gỡ miễn phí. ')+'Không hoàn lại xu đã dùng cho mẫu cũ; không thay đổi sức chứa hay sản lượng.</p><div class="actions">'+btn('Để sau','data-close','subtle')+act(option?'Đặt rào · '+option.cost+' xu':'Xác nhận gỡ','decorate',style,index,'primary',option?state.me.coins<option.cost:!current)+'</div><p id="dialog-error" role="status"></p>');
}
let gardenDecorScroll=0;
function gardenDecorIcon(item){
  const {source,width,cellHeight,frames}=gardenDecorAtlas, scale=.75;
  return '<span class="garden-decor-icon" aria-hidden="true" style="background-image:url('+source+');background-size:'+
    width*scale+'px '+cellHeight*scale+'px;background-position:-'+frames[item][0]*scale+'px 0"></span>';
}
function showGardenDecor(keepScroll=false){
  const farm=state.me, owned=farm.gardenDecor??{}, vouchers=farm.decorVouchers??0;
  const cards=Object.entries(gardenDecorItems).map(([item,definition])=>{
    const spot=owned[item];
    const status=spot?gardenDecorSpots[spot].name:Object.hasOwn(owned,item)?'Đang cất':definition.cost+' xu hoặc 1 phiếu';
    const afford=Object.hasOwn(owned,item)||farm.coins>=definition.cost||vouchers>0;
    return '<article class="garden-decor-card">'+gardenDecorIcon(item)+'<div><h3>'+definition.name+'</h3><p>'+status+'</p></div><div class="actions">'+
      btn(spot?'Chuyển':'Đặt','data-garden-decor-item="'+item+'" aria-label="'+(spot?'Chuyển ':'Đặt ')+definition.name.toLowerCase()+'"','primary',!afford)+
      (spot?btn('Cất','data-stow-garden-decor="'+item+'" aria-label="Cất '+definition.name.toLowerCase()+'"','subtle'):'')+'</div></article>';
  }).join('');
  modal('Trang trí vườn','<p><strong>'+formatCoins(farm.coins)+' xu · '+vouchers+' phiếu trang trí</strong></p>'+
    '<div class="actions">'+btn('Sắp xếp theo bối cảnh','data-arrange-garden-decor','subtle',!Object.values(owned).some(Boolean))+'</div>'+
    '<div class="garden-decor-list" role="region" aria-label="Danh sách đồ trang trí" tabindex="0">'+cards+'</div><p id="dialog-error" role="status"></p>');
  dialog.querySelector('.garden-decor-list').scrollTop=keepScroll?gardenDecorScroll:0;
}
function showGardenDecorPlacement(item){
  if(!Object.hasOwn(gardenDecorItems,item))return;
  gardenDecorScroll=dialog.querySelector('.garden-decor-list')?.scrollTop??0;
  const farm=state.me, definition=gardenDecorItems[item];
  const owned=Object.hasOwn(farm.gardenDecor??{},item);
  const spots=Object.entries(gardenDecorSpots).map(([key,spot])=>{
    const usedBy=gardenDecorAt(farm,key);
    const recommended=key===gardenDecorRecommendedSpots[item];
    return {key,label:(recommended?'Gợi ý · ':'')+spot.name+(usedBy?' · '+gardenDecorItems[usedBy].name:''),disabled:!!usedBy,recommended};
  }).sort((a,b)=>Number(b.recommended)-Number(a.recommended));
  const canPay=owned||(farm.decorVouchers??0)>0||farm.coins>=definition.cost;
  const positions=spots.map(({key,label,disabled})=>'<option value="'+key+'"'+(disabled?' disabled':'')+'>'+label+'</option>').join('');
  const payment=owned?'<p>Bạn có thể đặt lại miễn phí.</p>':
    '<label>Thanh toán<select name="source" required><option value="" disabled selected>Chọn cách thanh toán</option>'+
    '<option value="coins"'+(farm.coins<definition.cost?' disabled':'')+'>'+definition.cost+' xu</option>'+
    '<option value="voucher"'+((farm.decorVouchers??0)<1?' disabled':'')+'>1 phiếu trang trí</option></select></label>';
  const back=btn('Quay lại','data-garden-decor','subtle');
  const form=spots.every(spot=>spot.disabled)?'<p>Cất một món để tạo chỗ trống.</p>'+back:
    '<form data-form="placeGardenDecor" data-item="'+item+'"><label>Vị trí<select name="target" required>'+
    '<option value="" disabled selected>Chọn vị trí trống</option>'+positions+'</select></label>'+payment+
    '<div class="actions">'+back+'<button type="submit" class="btn primary"'+(canPay?'':' disabled')+'>Xác nhận đặt</button></div></form>';
  modal('Đặt '+definition.name.toLowerCase(),form+'<p id="dialog-error" role="status"></p>');
}
function renderLand(farm,now){
  const lot=farm.land[selectedLot], price=lotPrice(farm.land.filter(Boolean).length);
  const grid=farm.land.map((entry,i)=>btn((i+1)+' · '+lotLabel(entry),'data-land-tab="'+i+'" aria-pressed="'+(selectedLot===i)+'"',selectedLot===i?'primary':'subtle')).join('');
  const header='<div class="row"><h2>Quỹ đất</h2><span class="badge">'+farm.land.filter(Boolean).length+'/'+farm.land.length+' ô</span></div>'+
    '<details class="panel-fold land-picker-fold" data-panel-fold="land-picker"'+(!lot?' open':'')+'><summary>Đổi ô đất · Ô '+(selectedLot+1)+' · '+lotLabel(lot)+'</summary><div class="land-grid">'+grid+'</div>'+btn('Trang trí vườn','data-garden-decor aria-haspopup="dialog"','subtle')+'</details>';
  if(!lot)return header+'<p>Ô '+(selectedLot+1)+' chưa có chủ.</p><div class="actions">'+act('Mua ô đất · '+price+' xu','buyLand','',selectedLot,'primary',farm.coins<price)+'</div>';
  const go=btn('Tới ô '+(selectedLot+1),'data-land-go="'+selectedLot+'"','subtle');
  if(lot.kind==='empty')return header+'<p>Chọn công trình cho ô đất trống.</p><div class="actions">'+Object.entries(landTypes).map(([key,type])=>act(type.name+' · '+type.cost+' xu','buildLand',key,selectedLot,'subtle',farm.coins<type.cost)).join('')+go+'</div>';
  const launch=lot.kind==='garden'?btn('Chăm vườn','data-open-garden="'+selectedLot+'"','primary'):
    lot.kind==='pond'?btn('Chăm ao','data-open-pond="'+(selectedLot+pondOffset)+'"','primary'):'';
  return header+(lot.kind==='coop'?'':'<h3>'+lotLabel(lot)+' · Ô '+(selectedLot+1)+'</h3><div class="actions">'+launch+go+'</div>')+
    (lot.kind==='garden'?'<p>'+gardenPlotCount(lot)+' ô trồng · Bố trí tối đa 3 cột × 2 hàng.</p>'+(lot.expanded?'':
      '<div class="actions">'+act('Mở thêm 3 ô · '+gardenUpgradeCost+' xu','upgradeGarden','',selectedLot,'primary',farm.coins<gardenUpgradeCost)+'</div>'):'')+
    (lot.kind==='coop'?'<div class="lot-coop">'+renderCoop(farm,now,selectedLot)+'</div>':'')+(lot.kind==='pond'?'':'<details class="panel-fold lot-fences" data-panel-fold="lot-fences"><summary>Trang trí hàng rào · '+(fences[fenceAt(farm,selectedLot)]?.name??'Chưa đặt')+'</summary>'+decorOptions(farm,selectedLot)+'</details>');
}
function renderJournal(farm){
  const {done,claimed}=farm.journal, completed=dayGoals.filter(g=>done.includes(g.id)).length;
  return '<section class="journal journal-v2"><div class="task-book-subhead"><strong>Ba việc mỗi ngày</strong><span class="coop-count ready">'+completed+' / '+dayGoals.length+'</span></div>'+valueBar(completed,dayGoals.length)+
    '<ul>'+dayGoals.map(goal=>{const complete=done.includes(goal.id);return '<li data-done="'+complete+'"><span class="journal-check">'+(complete?'✓':'○')+'</span><span><strong>'+escape(goal.label)+'</strong><small>'+(complete?'Đã hoàn thành':'Làm một việc là được')+'</small></span>'+(complete?'':btn('Đi tới',goal.area?'data-tab="'+goal.area+'"':'data-panel="'+goal.panel+'"','primary'))+'</li>';}).join('')+'</ul>'+
    '<div class="row journal-reward"><span><small>Thưởng đủ ba việc</small><strong>'+dayReward.coins+' xu · '+dayReward.xp+' XP</strong></span>'+act(claimed?'Đã nhận':completed===dayGoals.length?'Nhận thưởng':'Còn '+(dayGoals.length-completed)+' việc','claimDay','','','gold',claimed||completed!==dayGoals.length)+'</div></section>';
}
function renderHome(farm,now){
  const health=wellnessAt(farm,now);
  const resting=health.restUntil>now;
  const status=resting?'Đang nghỉ · <span data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</span>':
    'Thể lực '+Math.floor(health.stamina)+'/100';
  return '<section class="home-guide"><div><h2>Chỗ nghỉ</h2><p>'+status+'</p></div>'+
    '<div class="actions">'+btn('Nghỉ ngay','data-recover="rest"','primary',resting||health.stamina>=100)+btn('Ra vườn','data-home-exit','subtle')+'</div></section>'+renderJournal(farm);
}
function gardenHelperStatus(farm,now,withWatch=true){
  const job=farm.gardenHelperJob, report=farm.gardenHelperReport;
  if(job){
    const completed=job.processed-job.skipped;
    const work=job.action==='water'?'tưới cây':'thu hoạch';
    return '<div class="helper-status" data-helper-active><strong>'+gardenHelperName+' đang '+work+(job.keepSeeds?' · Giữ giống':'')+'</strong>'+
      '<p>Đã làm '+completed+'/'+job.steps.length+' ô'+(job.skipped?' · Bỏ qua '+job.skipped:'')+
      ' · Còn <span data-until="'+job.endsAt+'">'+duration(job.endsAt-now)+'</span></p>'+(withWatch?btn('Xem '+gardenHelperName+' ›','data-watch-helper','primary'):'')+'</div>';
  }
  if(!report)return '';
  const work=report.action==='water'?'tưới':'thu hoạch';
  return '<div class="helper-status" data-helper-report><p>'+gardenHelperName+' đã '+work+' '+report.completed+'/'+report.total+' ô'+
    (report.produce?' · '+report.produce+' nông sản':'')+(report.seeds?' · Giữ '+report.seeds+' giống':'')+
    (report.refund?' · Hoàn '+report.refund+' xu':'')+'</p></div>';
}
function taskBookPager(index,count,attribute){
  return '<footer class="game-book-pager task-book-pager">'+btn('‹','data-'+attribute+'="'+(index-1)+'" aria-label="Trang trước"','subtle',!index)+'<span>'+(index+1)+' / '+count+'</span>'+btn('›','data-'+attribute+'="'+(index+1)+'" aria-label="Trang sau"','subtle',index>=count-1)+'</footer>';
}
function renderTasks(farm,now){
  const groups=taskGroups(tasks), current=groups.find(g=>g.key===taskBookGroup);
  const header='<header class="task-book-head"><h2>Sổ nhà nông</h2></header><nav class="task-book-tabs">'+
    btn('Việc cần làm','data-task-tab="tasks" aria-pressed="'+(taskBookTab==='tasks')+'"')+btn('Sổ hôm nay · '+farm.journal.done.length+'/'+dayGoals.length,'data-task-tab="journal" aria-pressed="'+(taskBookTab==='journal')+'"')+'</nav>';
  if(taskBookTab==='journal')return '<section class="task-book">'+header+'<div class="task-book-page">'+renderJournal(farm)+'</div></section>';
  let list;
  if(taskBookGroup){
    const page=catalogPage(current?.tasks??[],taskDetailPage,3);taskDetailPage=page.index;
    list='<div class="task-book-subhead">'+btn('‹ Các nhóm','data-task-back','subtle')+'<strong>'+escape(current?.title??'Đã xong nhóm này')+' <span class="coop-count '+(current?.type==='ready'?'ready':'hungry')+'">'+page.total+'</span></strong></div>'+
      (page.entries.length?'<div class="task-book-details">'+page.entries.map(task=>'<div class="task-book-entry"><span class="task-book-symbol">'+(taskIcon(task)?careIcon(taskIcon(task)):icon('fish'))+'</span><div><strong>'+escape(task.title)+'</strong><small>'+escape(task.label)+'</small></div>'+btn('Đi tới ›','data-task-ref="'+escape(taskKey(task))+'"','primary')+'</div>').join('')+'</div>'+taskBookPager(page.index,page.count,'task-detail-page'):'<p class="care-note">Không còn việc cần làm trong nhóm này.</p>')+
      (current?.title==='Tưới cây'||current?.title==='Thu cây'?btn('Nhờ '+gardenHelperName+' '+(current.title==='Tưới cây'?'tưới cây':'thu hoạch'),'data-quick-garden="'+(current.title==='Tưới cây'?'water':'harvest')+'"','primary',!!farm.gardenHelperJob):'');
  }else{
    const size=landscape.matches?(innerHeight<=340?2:4):6;
    if(size!==taskBookSize)taskBookPage=Math.floor(taskBookPage*taskBookSize/size);
    taskBookSize=size;
    const page=catalogPage(groups,taskBookPage,size);taskBookPage=page.index;
    list='<div class="task-book-subhead"><strong>Vườn đang cần bạn</strong><small>'+groups.length+' nhóm việc</small></div>'+
      (groups.length?'<div class="task-book-grid">'+page.entries.map(group=>'<button type="button" class="task-book-task" data-task-group="'+escape(group.key)+'"><span class="task-book-symbol">'+(group.icon?careIcon(group.icon):icon('fish'))+'</span><span><strong>'+escape(group.title)+'</strong><small>'+(group.title==='Cuốc đất'?'ô đất':group.unit)+'</small></span><span class="coop-count '+(group.type==='ready'?'ready':'hungry')+'">'+group.tasks.length+'</span></button>').join('')+'</div>'+taskBookPager(page.index,page.count,'task-book-page'):'<p class="care-note">Vườn đang ổn. Dạo hồ hoặc sang chợ nhé!</p>');
  }
  const counts=Object.entries(gardenHelperActions).map(([action,info])=>{const n=gardenHelperTargets(farm,action,state.weather,now).length;return '<small>'+(action==='water'?'Tưới':'Thu hoạch')+' <b class="coop-count '+(action==='water'?'hungry':'ready')+'">'+n+'</b> ô · '+info.fee+' xu/ô</small>';}).join('');
  const quick='<section class="task-book-hire"><div><strong>Nhờ '+gardenHelperName+' chăm vườn</strong>'+(farm.gardenHelperJob?'<small>Đang '+(farm.gardenHelperJob.action==='water'?'tưới cây':'thu hoạch')+'</small>':counts)+'</div>'+btn(farm.gardenHelperJob?'Xem '+gardenHelperName+' ›':'Thuê chăm vườn ›',farm.gardenHelperJob?'data-watch-helper':'data-hire-menu','primary')+'</section>'+gardenHelperStatus(farm,now,false);
  return '<section class="task-book">'+header+'<div class="task-book-page">'+list+quick+'</div></section>';
}
function showHireMenu(){
  const farm=state.me,now=currentTime();
  modal('Nhờ '+gardenHelperName+' chăm vườn','<div class="hire-menu">'+Object.entries(gardenHelperActions).map(([action,info])=>{const n=gardenHelperTargets(farm,action,state.weather,now).length;return '<div class="task-book-entry">'+careIcon(action==='water'?'water':'harvest')+'<div><strong>'+(action==='water'?'Tưới cây':'Thu hoạch')+'</strong><small>'+n+' ô · '+info.fee+' xu/ô</small></div>'+btn('Chọn ô ›','data-quick-garden="'+action+'"','primary',!n||!!farm.gardenHelperJob)+'</div>';}).join('')+'</div>');
  dialog.classList.add('game-management','farm-book-dialog');
}
function showQuickGarden(action){
  const farm=state.me, targets=gardenHelperTargets(farm,action,state.weather,currentTime());
  if(!targets.length||farm.gardenHelperJob)return;
  const rows=targets.map(({index,kind},order)=>{
    const lot=gardenFor(index), number=plotNumber(index);
    const name=lot<0?'Ô '+number:'Vườn ô '+(lot+1)+' · Luống '+number;
    return '<label class="quick-plot" data-quick-slot="'+order+'"><input type="checkbox" value="'+index+'" data-garden-plot="'+kind+'">'+cropIllustration(kind)+'<span><strong>'+escape(goods[kind].name)+'</strong><small>'+name+'</small></span><span data-garden-yield></span></label>';
  }).join('');
  const harvestOptions=action==='harvest'?'<fieldset class="quick-harvest-options"><legend>Cách thu hoạch</legend>'+
    '<label><input type="radio" name="source" value="all" data-harvest-mode checked>Thu hết</label>'+
    '<label><input type="radio" name="source" value="seed" data-harvest-mode>Giữ lại 1 giống/ô</label></fieldset>':'';
  modal(gardenHelperActions[action].label,'<form class="quick-garden-form" data-form="hireGardenHelper" data-operation="'+action+'">'+
    '<nav class="hire-action-tabs">'+Object.entries(gardenHelperActions).map(([key,info])=>btn((key==='water'?'Tưới':'Thu hoạch')+' · '+info.fee+' xu/ô','data-quick-garden="'+key+'" aria-pressed="'+(action===key)+'"','subtle',!!farm.gardenHelperJob)).join('')+'</nav>'+harvestOptions+'<div class="row"><strong>Chọn ô trong vườn</strong>'+btn('Chọn hết','data-quick-all','subtle')+'</div>'+
    '<div class="quick-garden-plots" role="group" aria-label="Các ô có thể chọn">'+rows+'</div><div data-quick-pagination></div>'+
    '<dl class="quick-garden-estimate" aria-live="polite" aria-atomic="true">'+
      '<div><dt>Số ô</dt><dd data-quick-count></dd></div><div><dt>Phí thuê</dt><dd data-quick-cost></dd></div>'+
      '<div><dt>Thời gian</dt><dd data-quick-duration></dd></div>'+
      '<div><dt>Kho cần / trống</dt><dd data-quick-space></dd><small data-quick-seeds></small></div></dl>'+
    '<p class="hire-wallet">Trong túi <strong data-hire-coins>'+farm.coins+'</strong> xu · '+gardenHelperActions[action].fee+' xu/ô</p><p data-quick-warning role="status" hidden></p><p id="dialog-error" role="status"></p>'+
    '<button type="submit" class="btn primary" disabled>Xác nhận thuê '+gardenHelperName+'</button></form>');
  dialog.classList.add('game-management','farm-book-dialog','hire-dialog');
  dialog.querySelector('form').dataset.page='0';
  updateQuickGarden(dialog.querySelector('.quick-garden-form'));
}
function updateQuickGarden(form){
  const {me:farm,weather}=state, action=form.dataset.operation, now=currentTime();
  form.querySelector('[data-hire-coins]').textContent=farm.coins;
  const size=matchMedia('(orientation:landscape) and (max-height:340px)').matches||action==='harvest'&&matchMedia('(orientation:landscape) and (max-height:480px)').matches?3:6;
  let at=Number(form.dataset.page??0);if(form.dataset.pageSize&&Number(form.dataset.pageSize)!==size)at=Math.floor(at*Number(form.dataset.pageSize)/size);
  const slots=[...form.querySelectorAll('[data-quick-slot]')], page=catalogPage(slots,at,size);
  form.dataset.pageSize=String(size);form.dataset.page=String(page.index);slots.forEach((row,index)=>row.hidden=index<page.index*size||index>=(page.index+1)*size);
  const pagination=form.querySelector('[data-quick-pagination]');
  const controls=taskBookPager(page.index,page.count,'quick-page');if(pagination.innerHTML!==controls)pagination.innerHTML=controls;
  const keepSeeds=form.elements.source?.value==='seed';
  const available=new Map(gardenHelperTargets(farm,action,weather,now).map(target=>[target.index,target]));
  const selected=[];
  let stale=false, validCount=0, selectedCount=0;
  for(const input of form.querySelectorAll('[data-garden-plot]')){
    const target=available.get(Number(input.value)), valid=target?.kind===input.dataset.gardenPlot;
    if(valid)validCount++;
    if(input.checked){
      selectedCount++;
      if(valid)selected.push(target);
      else stale=true;
    }
    input.disabled=!valid&&!input.checked;
    const row=input.closest('label');
    row.toggleAttribute('data-unavailable',!valid);
    const reserve=valid&&keepSeeds&&target.space>0?1:0;
    row.querySelector('[data-garden-yield]').textContent=!valid?'Đã thay đổi':action==='harvest'?
      (target.space-reserve)+' món'+(reserve?' + 1 giống':''):'';
  }
  const estimate=gardenHelperPreview(farm,action,selected,keepSeeds);
  const {cost,space,seeds,free,blocked}=estimate;
  const warning=stale?'Có ô đã thay đổi. Bỏ chọn ô đó để tiếp tục.':blocked;
  const estimates={count:selectedCount,cost:stale?'—':cost+' xu',duration:stale?'—':duration(estimate.duration),
    space:stale?'—':space+' / '+free,seeds:keepSeeds&&!stale?'Giữ '+seeds+' giống':''};
  for(const [key,value] of Object.entries(estimates)){
    const output=form.querySelector('[data-quick-'+key+']');
    if(output.textContent!==String(value))output.textContent=value;
  }
  const message=form.querySelector('[data-quick-warning]');
  if(message.textContent!==warning)message.textContent=warning;
  message.hidden=!warning;
  const all=form.querySelector('[data-quick-all]');
  const clear=selected.length===Math.min(gardenHelperLimit,validCount)&&selectedCount>0;
  all.toggleAttribute('data-clear-selection',clear);
  all.textContent=clear?'Bỏ chọn hết':validCount>gardenHelperLimit?'Chọn '+gardenHelperLimit+' ô':'Chọn hết';
  all.disabled=!validCount&&!selectedCount;
  form.querySelector('button[type=submit]').disabled=busy||!selected.length||!!warning;
  return {ready:!!selected.length&&!warning,plots:selected.map(target=>target.index),space,cost};
}
function renderRank(me){
  const ranking=state.wealth;
  const index=ranking.findIndex(row=>row.id===me.id);
  if(index<0)return '<h2>Xếp hạng tài sản</h2><p>Chưa có dữ liệu xếp hạng.</p>';
  const own=ranking[index], above=ranking[index-1], next=ranking[1];
  const goal=above?above.total+1:0;
  const lead=next?own.total-next.total:0;
  const race=above?'Thêm <strong>'+formatCoins(goal-own.total)+' xu</strong> tài sản để chắc chắn vượt hạng '+index+'.':
    !next?'Bạn đang chờ thêm vườn tham gia.':lead>0?'Hơn hạng 2 <strong>'+formatCoins(lead)+' xu</strong> tài sản.':
      'Đồng tổng tài sản với hạng 2.';
  const open=new Set(Array.from(document.querySelectorAll('#side .wealth-entry[open] summary'),summary=>summary.dataset.rankFarm));
  const rows=ranking.map((row,i)=>{
    const mine=row.id===own.id, rank=i+1;
    const id=escape(row.id);
    const title=rank===1?'Dẫn đầu':'Hạng '+rank;
    return '<li data-rank="'+rank+'"'+(mine?' class="is-me"':'')+'><details class="wealth-entry"'+(open.has(row.id)?' open':'')+'>'+
      '<summary data-rank-farm="'+id+'"><span class="rank-no" aria-label="'+title+'">'+rank+'</span>'+
      '<span class="wealth-farm"><strong>'+escape(row.name)+'</strong>'+
      (mine||rank===1?'<small>'+(mine?'Bạn':'Dẫn đầu')+'</small>':'')+'</span>'+
      '<span class="wealth-amount"><strong>'+formatCoins(row.total)+'</strong><small>xu</small></span>'+
      '<span class="wealth-arrow" aria-hidden="true">⌄</span></summary>'+
      '<dl class="wealth-breakdown">'+[['Tiền mặt',row.coins],['Kho & sạp',row.inventory],['Đất, nhà & vật nuôi',row.property]].map(([label,amount])=>
        '<div><dt>'+label+'</dt><dd>'+formatCoins(amount)+' xu</dd></div>').join('')+'</dl></details></li>';
  }).join('');
  const demoNote=session?'':'<div class="wealth-demo"><p>Bảng của làng chơi thử</p>'+btn('Vào làng','data-room','subtle')+'</div>';
  return '<section class="wealth-board" aria-label="Xếp hạng tài sản">'+
    '<header class="wealth-hero"><div class="wealth-hero-icon">'+icon('trophy')+'</div><div><h2>Xếp hạng tài sản</h2><p>'+ranking.length+' vườn · Tổng tài sản tính theo xu</p></div></header>'+
    '<section class="wealth-personal" aria-label="Thứ hạng của bạn"><div class="row"><strong>Hạng '+(index+1)+' / '+ranking.length+'</strong><b>'+formatCoins(own.total)+' xu</b></div><p>'+race+'</p>'+
      (above?valueBar(own.total,goal):'')+'</section>'+demoNote+
    '<ol class="wealth-list">'+rows+'</ol><p class="wealth-rules">Nếu bằng tổng tài sản, vườn có nhiều tiền mặt hơn xếp trước.</p></section>';
}
function renderProgress(farm){
  const {xp,rank,nextRank,next}=farmProgress(farm);
  const target=next?.destination;
  const targetAttrs=target?.tab&&target?.panel?
    'data-guide-area="'+target.tab+'" data-guide-panel="'+target.panel+'"':
    target?.panel?'data-panel="'+target.panel+'"':'data-tab="'+(target?.tab??'field')+'"';
  const targetButton=target?.panel&& !target.tab?
    btn('Xem '+escape(target.label),'data-panel="'+target.panel+'"','subtle'):
    btn('Tới '+escape(target?.label??'Khu vực'),targetAttrs,'subtle');
  const earn={
    harvest:'Thu hoạch cây',collect:'Thu sản phẩm vật nuôi',aquaHarvest:'Thu hoạch thủy sản',
    upgrade:'Xây hoặc nâng cấp công trình',order:'Giao đơn lẻ',basket:'Giao đơn giỏ hoặc đơn mùa vụ',workshopOrder:'Giao đơn xưởng',journal:'Hoàn thành Sổ việc hôm nay',
  };
  return boardBar('Tiến độ',formatCoins(xp)+' XP')+'<div class="farm-list progress-panel">'+
    '<article class="xp-summary"><h3>Cấp '+rank.level+' · '+rank.name+'</h3><p>XP tích lũy theo vườn để mở giống, vật nuôi và các cấp công trình. XP được giữ sau khi mở khóa. Xu và yêu cầu công trình được tính riêng.</p>'+
    (nextRank?'<div class="row"><strong>Cấp tiếp theo</strong><span>Cấp '+nextRank.level+' · '+nextRank.xp+' XP</span></div><p>'+escape(nextRank.name)+' · Còn '+formatCoins(nextRank.xp-xp)+' XP</p>'+valueBar(xp,nextRank.xp):
      '<p><strong>Đã đạt cấp cao nhất.</strong></p>')+
    (next?'<div class="row"><strong>Mở khóa tiếp theo</strong><span>'+next.xp+' XP</span></div><p>'+escape(next.label)+' · Còn '+formatCoins(next.xp-xp)+' XP</p>'+valueBar(xp,next.xp)+
      (next.requires?'<small class="xp-requirement">Điều kiện kèm theo: '+escape(next.requires)+'</small>':'')+
      (next.uses?.length?'<small class="xp-chain">Dùng tiếp cho: '+next.uses.map(escape).join(' · ')+'</small>':'')+
      '<div class="actions xp-next-action">'+targetButton+'</div>':
      '<p><strong>Đã đạt mọi mốc mở khóa.</strong></p>')+'</article>'+
    '<details class="panel-fold" data-panel-fold="xp-milestones"><summary>Mốc mở khóa</summary><ul class="xp-list">'+xpUnlocks.map(entry=>
      '<li><div><strong>'+escape(entry.label)+'</strong>'+(entry.requires?'<small>'+escape(entry.requires)+'</small>':'')+
      (entry.reward?'<small>'+escape(entry.reward)+'</small>':'')+'</div><span data-ready="'+(xp>=entry.xp)+'">'+entry.xp+' XP'+(xp>=entry.xp?' ✓':'')+'</span></li>').join('')+'</ul></details>'+
    '<details class="panel-fold" data-panel-fold="xp-rewards"><summary>Cách nhận XP</summary><ul class="xp-list">'+Object.entries(xpRewards).map(([action,amount])=>'<li><span>'+earn[action]+'</span><strong>+'+amount+' XP</strong></li>').join('')+'</ul></details></div>';
}
function renderHud(farm,now){
  const health=wellnessAt(farm,now);
  $('#vital-hud').innerHTML=Object.entries(vitals).map(([key,info])=>{
    const points=Math.floor(health[key]), seconds=key==='stamina'?0:Math.max(0,(health.until[key]??0)-now);
    const resting=key==='stamina'&&health.restUntil>now;
    const hint=resting?'Đang nghỉ · '+duration(health.restUntil-now):seconds?'Dùng lại sau '+duration(seconds):{water:'Uống nước',food:'Ăn cơm nắm',stamina:'Nghỉ lấy sức'}[key];
    const value=resting?'<strong data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</strong>':'<strong>'+points+'</strong>';
    return '<button type="button" class="vital" data-vital="'+key+'" data-low="'+(points<25&&!resting)+'" aria-label="'+info.label+' '+points+'/100. '+hint+'" title="'+hint+'"><span class="vital-icon">'+icon(info.icon)+'</span><span class="vital-text"><span>'+info.label+'</span>'+value+'<i><em style="width:'+Math.max(0,points)+'%"></em></i></span></button>';
  }).join('');
  const priority=tasks[0];
  $('#task-hud').innerHTML='<button type="button" class="task-summary" data-panel="tasks" aria-label="Việc cần làm · '+(priority?tasks.length+' việc':'Mọi việc đang ổn')+'" aria-pressed="'+(panel==='tasks')+'"><span class="task-mark" data-pending="'+Boolean(priority)+'">'+(priority?tasks.length:'✓')+'</span><span><strong>Việc cần làm</strong><small>'+(priority?priority.title+' · '+priority.label:'Mọi việc đang ổn')+'</small></span><span class="task-arrow" aria-hidden="true">›</span></button>';
}
const lakeWellBuilt=()=>state.village.built.some(project=>project.id==='well');
const currentWell=()=>drinkingWell(neighborId?'visit':tab,lakeWellBuilt());
const locationBlock=(input,pose=world.position())=>playerLocationBlock(input,neighborId?'visit':tab,pose,lakeWellBuilt());
function showRecovery(key,{preserve=false}={}){
  if(!Object.hasOwn(vitals,key))return;
  if(!preserve){recoveryPage=0;recoveryItem=null;}
  const info=vitals[key],now=currentTime(),health=wellnessAt(state.me,now),farm=state.me;
  const meals=Object.keys(recipes).filter(item=>recipes[item].gain?.[key]&&(farm.inventory[item]??0)>0);
  if(!meals.includes(recoveryItem))recoveryItem=null;
  const size=matchMedia('(orientation:landscape) and (max-height:340px)').matches?2:4;
  if(size!==recoveryPageSize)recoveryPage=Math.floor(recoveryPage*recoveryPageSize/size);
  recoveryPageSize=size;
  const page=catalogPage(meals,recoveryPage,size);recoveryPage=page.index;
  const resting=health.restUntil>now,remaining=Math.max(0,(health.until[key]??0)-now),mealRemaining=Math.max(0,(health.until.meal??0)-now);
  const blockedLocation=key==='stamina'?tab!=='home':!!locationBlock({action:info.action});
  const stamp=JSON.stringify([key,recoveryItem,recoveryPage,size,Math.floor(health.water),Math.floor(health.food),Math.floor(health.stamina),resting,health.restUntil,remaining>0,mealRemaining>0,health.until,blockedLocation,!!currentWell(),busy,meals.map(item=>[item,farm.inventory[item]])]);
  if(preserve&&recoveryStamp===stamp)return;
  const points=Math.floor(health[key]),gain=Math.min(100-points,info.gain);
  let body,title=key==='water'?'Uống nước':key==='food'?'Ăn cơm nắm':'Nghỉ lấy sức';
  if(recoveryItem){
    const item=recoveryItem,reason=mealRequirement(farm,item,health,now),recipe=recipes[item];title=goods[item].name;
    body='<section class="recovery-detail">'+btn('‹ Hồi phục','data-recovery-back','subtle')+'<div class="recovery-picture">'+goods[item].icon+'</div><h3>'+escape(goods[item].name)+'</h3><p class="care-note">Trong túi <strong>'+farm.inventory[item]+'</strong> phần · Dùng 1 phần</p><div class="recovery-effects">'+Object.entries(recipe.gain).map(([stat,amount])=>'<span>'+vitals[stat].label+'<strong>+'+Math.min(100-Math.floor(health[stat]),amount)+'</strong></span>').join('')+'</div>'+
      '<p class="care-note">Dùng bữa chung lượt chờ '+duration(mealCooldown)+'.</p>'+(reason?'<p class="care-note">'+escape(reason)+'</p>':'')+
      (mealRemaining?'<p class="care-note">Lượt tiếp sau <strong data-until="'+health.until.meal+'">'+duration(mealRemaining)+'</strong></p>':'')+
      btn('Dùng 1 phần','data-meal="'+item+'"','primary recovery-main',busy||!!reason)+'</section>';
  }else{
    const full=key==='stamina'?health[key]>=100:health[key]>=99,disabled=busy||full||resting||remaining>0;
    const action=key==='stamina'?(tab==='home'?'data-recover="rest"':'data-rest-home'):
      blockedLocation?'data-recovery-place="'+key+'"':'data-recover="'+info.action+'"';
    const label=resting?'Đang nghỉ · <span data-rest-countdown data-until="'+health.restUntil+'">'+duration(health.restUntil-now)+'</span>':full?'Đã đầy':remaining?'Dùng lại sau · <span data-until="'+health.until[key]+'">'+duration(remaining)+'</span>':
      key==='stamina'?(blockedLocation?'Về Nhà vườn':'Nghỉ '+duration(restSeconds)):blockedLocation?(key==='water'&&currentWell()?'Đến giếng uống nước':key==='water'?'Về nhà uống nước':'Về nhà ăn cơm'):title;
    body='<div class="recovery-hero"><span class="recovery-symbol">'+(key==='water'?careIcon('water'):icon(info.icon))+'</span><div><strong>'+info.label+'</strong><small>'+(resting?'Đang nghỉ tại Nhà vườn':'Giữ sức để chăm vườn')+'</small></div><span class="recovery-points">'+points+'<small>/100</small></span></div>'+valueBar(points,100)+
      '<div class="recovery-gain"><span>'+(key==='stamina'?'Sau '+duration(restSeconds)+' nghỉ':'Một lần hồi')+'</span><strong>+'+gain+' '+info.label.toLowerCase()+'</strong></div>'+btn(label,action,'primary recovery-main',disabled)+
      '<p class="care-note">'+(key==='water'?'Uống ở giếng hoặc Nhà vườn. Mỗi lượt cách '+duration(info.cooldown)+'.':key==='food'?'Ăn tại Nhà vườn. Mỗi lượt cách '+duration(info.cooldown)+'.':'Nghỉ tại Nhà vườn, hồi sức khi nghỉ xong.')+'</p>'+
      '<div class="recovery-stock-head"><strong>Đồ trong túi</strong><small>'+meals.length+' loại dùng được</small></div>'+
      (meals.length?'<div class="recovery-grid">'+page.entries.map(item=>'<button type="button" class="recovery-item" data-recovery-item="'+item+'"><span class="recovery-item-picture">'+goods[item].icon+'</span><span><strong>'+escape(goods[item].name)+'</strong><small>+'+recipes[item].gain[key]+' '+info.label.toLowerCase()+' tối đa · Xem</small></span><span class="recovery-count" aria-label="Còn '+farm.inventory[item]+' phần">'+farm.inventory[item]+'</span></button>').join('')+'</div>'+taskBookPager(page.index,page.count,'recovery-page'):'<p class="care-note">Chưa có món hồi '+info.label.toLowerCase()+' trong túi.</p>');
  }
  const previousPage=recoveryPage,previousItem=recoveryItem,scroll=dialog.scrollTop;
  const focused=dialog.contains(document.activeElement)?Object.entries(document.activeElement.dataset).map(([k,v])=>[k,v]):null;
  const inline=preserve?dialog.querySelector('#dialog-error')?.textContent:'';
  modal(title,body+'<p id="dialog-error" role="status">'+escape(inline??'')+'</p>');
  recoveryKey=key;recoveryPage=previousPage;recoveryItem=previousItem;recoveryStamp=stamp;
  dialog.dataset.recovery=key;dialog.classList.add('game-management','farm-book-dialog','recovery-dialog');
  if(preserve){dialog.scrollTop=scroll;if(focused?.length)[...dialog.querySelectorAll('button')].find(el=>focused.every(([k,v])=>el.dataset[k]===v))?.focus({preventScroll:true});}
}
function openTask(index){
  const task=tasks[index];
  if(!task)return;
  const arrival=selector=>landscape.matches?()=>reveal(selector):()=>{};
  if(landscape.matches)setPanelOpen(false);
  if(task.kind==='plot'){
    tab='field';neighborId=null;selected=task.index;plotGroup=gardenFor(selected);panel='area';render();
    if(!world.approach('plot',selected,arrival('#tools'))&&landscape.matches)reveal('#tools');
  } else if(task.kind==='pond'){
    tab='field';neighborId=null;pondTab=task.index;panel='ponds';
    const size=animalPickerSize()===4?3:6, at=visiblePondBatches(state.me,pondTab).findIndex(b=>b.kind===task.batch);
    pondViews.set(pondTab,{filter:'all',page:Math.floor(Math.max(0,at)/size)});render();
    if(!world.approach('pond',pondTab,arrival('#farm-panel'))&&landscape.matches)reveal('#farm-panel');
  } else {
    tab=task.lot===undefined?'coop':'field';neighborId=null;
    if(task.lot!==undefined)selectedLot=task.lot;
    selectCoopAnimal(task.index);panel=task.lot===undefined?'area':'land';render();
    const details=`[data-pen="${task.index}"]`;
    if(!world.approach('animal',task.index,arrival(details))||!landscape.matches)reveal(details);
  }
}
function marketBanner(title,description){
  return '<header class="market-banner"><h2>'+title+'</h2><p>'+description+'</p></header>';
}
function renderOrders(farm,now){
  const line=(item,qty)=>nice(item)+' × '+qty;
  const selectedIndex=state.orders.findIndex(order=>order.id===marketOrderId);
  if(selectedIndex>=0)marketOrderPage=selectedIndex;
  marketOrderPage=Math.min(Math.max(0,marketOrderPage),Math.max(0,state.orders.length-1));
  marketOrderId=state.orders[marketOrderPage]?.id??null;
  const orders=state.orders.slice(marketOrderPage,marketOrderPage+1).map(order=>{
    const requirements=order.items.map(({item,qty})=>{
      const count=farm.inventory[item]??0;
      return '<li data-ready="'+(count>=qty)+'"><span>'+itemLink(item,line(item,qty))+'</span><small>Kho '+count+'/'+qty+'</small></li>';
    }).join('');
    const ready=order.items.every(({item,qty})=>(farm.inventory[item]??0)>=qty);
    return '<div class="order-ticket" data-category="'+(order.category??'regular')+'" data-ready="'+ready+'"><div class="row"><h3>'+
      (order.title??goods[order.items[0].item].name)+'</h3><span class="badge">'+(ready?'Đủ hàng':order.category==='workshop'?'Đơn xưởng':order.category==='variety'?'Đơn mùa vụ':order.category==='aquatic'?'Đơn thủy sản':order.title?'Đơn giỏ':'Thiếu hàng')+'</span></div>'+
      '<ul aria-label="Hàng cần giao">'+requirements+'</ul><div class="row order-footer"><small>'+order.reward+' xu · +'+order.xp+' XP</small>'+
      act('Giao hàng','order','',order.id,'primary',!ready)+'</div></div>';
  }).join('');
  const forecasts=state.nextOrders.map(order=>'<li>'+(order.title?'<strong>'+order.title+'</strong><br>':'')+
    order.items.map(({item,qty})=>line(item,qty)).join(' · ')+'</li>').join('');
  return marketBanner('Đơn hàng của làng','Người giao đủ hàng đầu tiên nhận thưởng.')+
    '<div class="row market-cycle"><strong>Còn '+state.orders.length+'/'+(state.orderCount??3)+' đơn</strong><span class="badge" data-clock="day">'+duration(state.dayEnds-now)+'</span></div>'+
    (orders?'<div class="order-list game-market-orders">'+orders+'</div><nav class="game-book-pager" aria-label="Phiếu đơn chợ">'+btn('‹','data-market-order-page="'+(marketOrderPage-1)+'"','subtle',!marketOrderPage)+'<span>'+(marketOrderPage+1)+' / '+state.orders.length+'</span>'+btn('›','data-market-order-page="'+(marketOrderPage+1)+'"','subtle',marketOrderPage===state.orders.length-1)+'</nav>':'<p class="village-empty">Hôm nay đã giao hết đơn.</p>')+
    '<div class="order-preview">'+btn(showTomorrow?'Ẩn đơn ngày mai':'Xem trước đơn ngày mai','data-order-preview aria-expanded="'+showTomorrow+'"','subtle')+
    (showTomorrow?'<ul>'+forecasts+'</ul>':'')+'</div>';
}
const formatCoins=value=>value.toLocaleString('vi-VN');
function renderOrderBoard(farm,now){
  return '<section class="game-book order-book"><header class="game-book-head"><h2>Bảng đơn</h2><span>Cả làng cùng góp</span></header><nav class="game-book-tabs" aria-label="Loại đơn">'+[['market','Đơn chợ'],['village','Góp hàng làng']].map(([id,label])=>btn(label,'data-order-pane="'+id+'" aria-pressed="'+(orderPane===id)+'"',orderPane===id?'primary':'subtle')).join('')+'</nav>'+(orderPane==='village'?renderVillageDrive(farm,now):renderOrders(farm,now))+'</section>';
}
function renderVillageDrive(farm,now){
  const drive=state.villageDrive;
  if(!drive)return '<p class="care-empty">Chưa có đợt góp hàng.</p>';
  if(driveSelection?.id!==drive.id||!drive.items.some(r=>r.item===driveSelection.item))driveSelection={id:drive.id,item:drive.items[0]?.item};
  const chosen=driveItem(drive,farm,driveSelection.item,now),ended=drive.completed||now>=drive.endsAt;
  const total=drive.items.reduce((n,r)=>n+r.required,0),delivered=drive.items.reduce((n,r)=>n+r.delivered,0);
  const rows=drive.items.map(r=>{const v=driveItem(drive,farm,r.item,now),pinned=pinnedGoal.kind==='villageGoods'&&pinnedGoal.driveId===drive.id&&pinnedGoal.item===r.item;
    return btn('<span class="drive-art" aria-hidden="true">'+(itemIllustration(r.item)||animalProductIllustration(r.item)||icon('stock'))+'</span><strong>'+escape(goods[r.item].name)+'</strong><b>'+(v.remaining?'Thiếu '+v.remaining:'Đã đủ')+'</b><small>Kho '+v.owned+'</small>'+(pinned?'<span class="drive-pin-mark" aria-label="Đang ghim">◆</span>':''),'data-drive-select="'+r.item+'" aria-pressed="'+(chosen?.item===r.item)+'"','drive-ingredient');}).join('');
  const pinned=chosen&&pinnedGoal.kind==='villageGoods'&&pinnedGoal.driveId===drive.id&&pinnedGoal.item===chosen.item;
  const controls=!ended&&chosen?.remaining?'<div class="drive-chosen"><div class="row"><strong>'+escape(goods[chosen.item].name)+'</strong><small>'+(chosen.maximum?'Góp tối đa '+chosen.maximum:'Chưa có hàng')+'</small></div><div class="actions">'+btn('Góp','data-village-goods="'+chosen.item+'"','primary',!chosen.maximum)+btn(pinned?'Bỏ ghim':'Ghim','data-drive-pin="'+chosen.item+'"','subtle')+btn('Cách có','data-drive-source="'+chosen.item+'"','subtle')+'</div></div>':chosen&&!ended?'<p class="care-note">Món này đã đủ. Chọn món khác để chuẩn bị.</p>':'';
  const personal=drive.mine.paid?'Đã nhận thưởng':drive.completed&&drive.mine.quantity>0&&drive.mine.quantity<drive.minimum?'Chưa đủ '+drive.minimum+' món để nhận thưởng':ended?'Đợt đã kết thúc':drive.mine.quantity<drive.minimum?'Còn '+(drive.minimum-drive.mine.quantity)+' để đủ mốc':'Đủ mốc cá nhân';
  return '<section class="drive-paper" aria-label="Phiếu góp hàng"><header class="drive-paper-head"><h3>'+escape(drive.title)+'</h3><span class="drive-seal">'+delivered+'/'+total+'</span></header><span class="drive-scale">'+driveScaleLabel(drive)+'</span><p class="drive-deadline">'+(drive.completed?'Đã hoàn thành':ended?'Đã hết hạn':'Còn <span data-until="'+drive.endsAt+'">'+duration(drive.endsAt-now)+'</span> thực')+'</p><div class="drive-ingredients">'+rows+'</div>'+controls+'<footer class="drive-reward"><span>Bạn góp '+drive.mine.quantity+' · '+personal+'</span>'+btn('Quy mô & quà ›','data-drive-rules','subtle')+'</footer>'+(drive.mine.decorVoucher?btn('Trang trí vườn','data-garden-decor','subtle'):'')+'</section><div class="drive-people">'+btn('Người cùng góp','data-drive-people','subtle')+btn('Sổ góp hàng','data-drive-history','subtle')+'</div>';
}
function showDriveHistory(id){
  const entries=state?.villageDrive?.history??[];
  if(!entries.length){modal('Sổ góp hàng','<p>Chưa có đợt đã chốt trong sổ.</p><p class="care-note">Sau khi chuyển sang đợt mới, kết quả đợt vừa kết thúc được ghi lại. Sổ giữ sáu đợt gần nhất; không thay đổi phần thưởng.</p>');return;}
  const index=Math.max(0,entries.findIndex(e=>String(e.id)===String(id))),entry=entries[index],result=driveResult(entry);
  const date=new Date((entry.completedAt??entry.endsAt)*1000).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  const people=entry.contributors.map(p=>'<li><span>'+escape(p.name)+'</span><strong>'+p.quantity+' món</strong></li>').join('');
  modal('Sổ góp hàng','<section class="drive-history"><div class="animal-manage-hero"><div><strong>'+escape(entry.title)+'</strong><p>'+(entry.completedAt!==null?'Làng hoàn thành':'Hết hạn chưa đủ hàng')+' · '+date+'</p></div></div><dl class="animal-manage-facts"><div><dt>Bạn đã góp</dt><dd>'+entry.mine.quantity+' món</dd></div><div><dt>Kết quả cá nhân</dt><dd>'+result.label+'</dd></div></dl><p class="care-note">'+result.reason+'</p>'+(entry.mine.paid?'<p class="drive-history-reward">'+entry.mine.coins+' xu · '+entry.mine.xp+' XP'+(entry.mine.decorVoucher?' · 1 phiếu trang trí':'')+'</p>':'')+'<details class="panel-fold"><summary>Hàng làng đã góp</summary><ul class="recipe-ingredients">'+entry.items.map(row=>'<li><span>'+escape(goods[row.item].name)+'</span><strong>'+row.delivered+' / '+row.required+'</strong></li>').join('')+'</ul></details><details class="panel-fold"><summary>Người góp nhiều nhất · tối đa 12</summary>'+(people?'<ul class="recipe-ingredients">'+people+'</ul>':'<p>Chưa có đóng góp được ghi nhận.</p>')+'</details><footer class="game-book-pager history-pages">'+btn('‹','data-drive-history="'+(entries[index-1]?.id??'')+'" aria-label="Đợt mới hơn"','subtle',index===0)+'<span>'+(index+1)+' / '+entries.length+'</span>'+btn('›','data-drive-history="'+(entries[index+1]?.id??'')+'" aria-label="Đợt cũ hơn"','subtle',index===entries.length-1)+'</footer><p class="care-note">Sáu đợt gần nhất · Chỉ xem kết quả, không cần nhận thưởng lại.</p></section>');
  dialog.classList.add('game-management');
}
function animalProductIllustration(item){const kind=Object.keys(animals).find(k=>animals[k].product===item);return kind?animalIllustration(kind):'';}
function driveScaleLabel(d){return d.version>=2?'Quy mô · '+(d.memberCount<3?d.memberCount:'3–12')+' người':'Định mức đợt cũ';}
function showDriveRules(){const d=state.villageDrive;if(!d)return;modal('Quy mô & phần thưởng','<p><strong>'+driveScaleLabel(d)+'</strong></p><p>'+(d.version>=2?'Chốt theo '+d.memberCount+' vườn đã tham gia lúc mở đợt; có người vào/rời làng cũng không đổi giữa đợt.':'Đợt đang mở giữ định mức cũ đến hết hạn.')+'</p><p>Góp từ <strong>'+d.minimum+' món</strong> và làng hoàn thành mới có thưởng.</p><p>Xu theo giá trị đã góp · '+d.rewardXp+' XP · 1 phiếu trang trí.</p><p><strong>Hàng đã góp không hoàn lại khi hết hạn.</strong></p><p>Đợt kéo dài 48 giờ thực.</p>'+(d.mine.paid?'<p>Đã nhận '+d.mine.coins+' xu'+(d.mine.decorVoucher?' và phiếu trang trí':'')+'.</p>':''));}
function showDrivePeople(){const d=state.villageDrive;if(!d)return;modal('Người cùng góp',d.contributors.length?'<ol>'+d.contributors.map(r=>'<li>'+escape(r.name)+' · '+r.quantity+' món</li>').join('')+'</ol>':'<p>Chưa có người góp trong đợt này.</p>');}
function showDriveSource(item){
  if(!Object.hasOwn(goods,item))return;
  const crop=Object.hasOwn(crops,item)?item:null,animal=Object.keys(animals).find(k=>animals[k].product===item),recipe=recipes[item];
  const target=crop?{type:'crop',key:crop}:animal?{type:'animal',key:animal}:itemUnlockTarget(item);
  const guide=target&&unlockGuide(state.me,target.type,target.key);
  const copy=crop?'Trồng từ '+goods[crops[crop].seed].name.toLowerCase()+' ở Vườn nhà.':animal?'Nuôi '+animals[animal].name.toLowerCase()+' rồi thu sản phẩm.':recipe?'Chế tạo trong Xưởng máy từ nguyên liệu đang có.':'Xem nguồn và điều kiện trong chi tiết vật phẩm.';
  modal('Chuẩn bị '+escape(goods[item].name.toLowerCase()),'<p>'+copy+'</p><p>Kho bạn có '+(state.me.inventory[item]??0)+' món.</p>'+(guide?.reason?'<p class="care-note">'+escape(guide.reason)+'</p>':'')+'<div class="actions">'+(target?unlockButton(target.type,target.key,'Điều kiện mở'):'')+(crop?btn('Tìm hạt giống','data-drive-buy="'+crops[crop].seed+'"','subtle'):'')+btn(crop?'Tới vườn':animal?'Tới chuồng':recipe?'Tới xưởng':'Xem vật phẩm','data-drive-prepare="'+item+'"','primary')+'</div><p class="care-note">Chỉ dẫn đường, không tự mua hoặc sử dụng vật tư.</p>');
}
function requestDrivePin(item){
  const next=pinVillageGoods({...state,now:currentTime()},item);
  if(next.kind==='none'){showToast('Món này đã đủ hoặc đợt đã kết thúc.');return;}
  if(pinnedGoal.kind==='villageGoods'&&pinnedGoal.driveId===next.driveId&&pinnedGoal.item===item){savePinnedGoal(noGoal());render();return;}
  if(pinnedGoal.kind!=='none'){
    modal('Thay mục tiêu đang ghim?','<p>Ghim '+escape(goods[item].name.toLowerCase())+' cho đơn làng thay mục tiêu hiện tại. Tiến trình nông trại được giữ nguyên.</p><div class="actions">'+btn('Để sau','data-close','subtle')+btn('Thay mục tiêu','data-goal="villageGoods" data-item="'+item+'"','primary')+'</div>');return;
  }
  savePinnedGoal(next);render();showToast('Đã ghim trong Việc cần làm.');
}
function showVillageGoods(item){
  const drive=state.villageDrive;
  if(!drive||drive.completed||drive.endsAt<=currentTime())return;
  const line=drive.items.find(entry=>entry.item===item);
  if(!line)return;
  const maximum=Math.min(line.required-line.delivered,state.me.inventory[item]??0);
  if(maximum<1)return;
  modal('Góp '+goods[item].name.toLowerCase(),'<p>Bạn có thể góp tối đa '+maximum+' món. Hàng đã góp sẽ được trừ khỏi kho và không hoàn lại khi hết hạn.</p>'+
    '<p class="care-note">Bạn đã góp '+drive.mine.quantity+' món; cần tổng từ '+drive.minimum+' món và cả làng hoàn thành mới có thưởng.</p><form data-form="villageGoods" data-item="'+item+'" data-index="'+drive.id+'"><label>Số lượng góp<input name="qty" type="number" min="1" max="'+maximum+'" value="1" required></label>'+
    '<button class="btn primary">Xác nhận góp</button></form><p id="dialog-error" role="status"></p>');
}
function renderVillageMembers(farm){
  const members=[farm,...state.neighbors];
  const rows=members.map(member=>{
    const owner=member.id===state.villageOwnerId, mine=member.id===farm.id;
    const role=owner?(mine?'Chủ làng · Bạn':'Chủ làng'):mine?'Bạn':'';
    const remove=owner||mine?'':btn('Mời ra','data-remove-member="'+member.id+'" aria-label="Mời '+escape(member.name)+' ra khỏi làng"','subtle');
    return '<article class="row"><div class="village-member-name"><h3>'+escape(member.name)+'</h3>'+
      (role?'<p>'+role+'</p>':'')+'</div>'+remove+'</article>';
  }).join('');
  return '<div class="row board-bar"><h2>Thành viên</h2><span class="badge">'+members.length+' vườn</span></div>'+
    '<div class="farm-list">'+rows+'</div>';
}
function renderVillage(farm){
  const {name,level,income,orders,theftsToday,theftCap,next,fund,built}=state.village;
  const ladder='<ol class="village-ladder" aria-label="Các cấp của làng">'+villageLevels.map((label,i)=>
    '<li data-attained="'+(i<=level)+'"'+(i===level?' aria-current="step"':'')+'>'+label+'</li>').join('')+'</ol>';
  const projectUse={notice:'Nâng cấp bảng đơn ở chợ.',well:'Thêm điểm uống nước ở hồ làng.',dock:'Tăng thêm 2 lượt câu ở hồ mỗi ngày.',hall:'Thêm điểm xem tiến độ ở Đường làng.'};
  const structures=built.length?'<p class="village-built">Đã xây · '+built.map(entry=>entry.name).join(' · ')+'</p>':'';
  const header=marketBanner(name,next?'Mục tiêu tiếp theo · '+next.levelName:'Đã đạt cấp cao nhất.')+ladder+
    '<p class="village-security">An ninh hôm nay <strong>'+theftsToday+'/'+theftCap+' vụ</strong></p>';
  if(!next)return header+structures;
  const goal=(label,value,target,suffix='')=>'<div class="village-metric"><div class="row"><span>'+label+'</span><strong>'+formatCoins(value)+' / '+
    formatCoins(target)+suffix+'</strong></div>'+valueBar(value,target)+'</div>';
  const over=theftsToday>next.theft;
  return header+goal('Thu nhập từ chợ',income,next.income,' xu')+
    goal('Đơn đã giao',orders,next.orders)+goal('Chuỗi ngày đạt an ninh',next.peaceStreak,next.peaceDays,' ngày')+
    '<p class="village-note" data-over="'+over+'">Tối đa '+next.theft+' vụ/ngày trong '+next.peaceDays+
    ' ngày game đã kết thúc liên tiếp. Hôm nay '+(over?'đã vượt mức.':'đang trong mức.')+'</p>'+
    '<section class="village-project"><div class="row"><h3>'+next.name+'</h3><span class="badge">'+
    (next.built?'Đã xây':formatCoins(fund)+' / '+formatCoins(next.cost)+' xu')+'</span></div><p>'+projectUse[next.id]+'</p>'+
    (next.built?'':valueBar(fund,next.cost)+'<div class="actions">'+btn('Góp quỹ','data-village-fund','gold',farm.coins<1)+'</div>')+
    '</section>'+structures;
}
function showVillageFund(){
  const {next,fund}=state.village;
  if(!next||next.built)return;
  const maximum=Math.min(next.cost-fund,state.me.coins);
  if(maximum<1)return;
  modal('Góp quỹ · '+next.name,'<p>Dự án còn thiếu '+formatCoins(next.cost-fund)+' xu. Xu đã góp được dành cho công trình này.</p>'+
    '<form data-form="villageFund" data-item="'+next.id+'"><label>Số xu góp<input name="amount" type="number" min="1" max="'+maximum+'" value="'+Math.min(10,maximum)+'" required></label>'+
    '<button class="btn primary">Xác nhận góp</button></form><p id="dialog-error" role="status"></p>');
}
function showSeedCrop(item){
  const farm=state.me, crop=crops[item];
  if(!crop)return;
  const maximum=Math.min(20,farm.inventory[item]??0,100-(farm.inventory[crop.seed]??0));
  if(maximum<1)return;
  modal('Giữ giống · '+goods[item].name,'<p>Mỗi nông sản giữ lại cho một giống cùng loại. Giống nằm trong túi vật tư để gieo khi cần.</p>'+
    '<form data-form="seedFromCrop" data-item="'+item+'"><label>Số nông sản đổi thành giống<input name="qty" type="number" min="1" max="'+maximum+'" value="1" required></label>'+
    '<button class="btn primary">Giữ giống</button></form><p id="dialog-error" role="status"></p>');
}
function renderStock(farm){
  const tabs='<div class="stock-tabs" role="group" aria-label="Nhóm vật phẩm trong kho">'+Object.entries(stockTabs).map(([key,label])=>
    btn(label,'data-stock-tab="'+key+'" aria-pressed="'+(stockTab===key)+'" aria-controls="stock-items"',stockTab===key?'primary':'subtle')
  ).join('')+'</div>';
  const keys=stockItems[stockTab].filter(key=>stockTab!=='produce'||(farm.inventory[key]??0)>0);
  const pageSize=animalPickerSize(), pageCount=Math.max(1,Math.ceil(keys.length/pageSize));
  if(pageSize!==stockPageSize){stockPage=Math.floor(stockPage*stockPageSize/pageSize);stockPageSize=pageSize;}
  stockPage=Math.max(0,Math.min(stockPage,pageCount-1));
  const pageControls=pageCount>1?'<footer class="game-book-pager stock-pages" aria-label="Trang vật phẩm">'+
    btn('‹','data-stock-page="'+(stockPage-1)+'" aria-label="Trang trước"','subtle',stockPage===0)+
    '<span>'+(stockPage+1)+' / '+pageCount+'</span>'+
    btn('›','data-stock-page="'+(stockPage+1)+'" aria-label="Trang sau"','subtle',stockPage+1>=pageCount)+'</footer>':'';
  const cards=keys.slice(stockPage*pageSize,(stockPage+1)*pageSize).map(item=>{
    const {name,icon:picture}=goods[item];
    const locked=Boolean(stockLock(farm,item));
    return '<button type="button" class="stock-card" data-stock-item data-item-info="'+item+'" aria-haspopup="dialog">'+
      '<span class="stock-icon" aria-hidden="true">'+(itemIllustration(item)||picture)+'</span><span class="stock-name">'+escape(name)+'</span>'+
      '<span class="stock-quantity">× '+(farm.inventory[item]??0)+'</span>'+
      '<span class="stock-status" data-locked="'+locked+'">'+(locked?'Đang khóa':'Đã mở')+'</span></button>';
  }).join('');
  return '<div class="row stock-heading"><div><h2>Kho &amp; túi</h2><p>'+stock(farm)+' / '+capacity(farm)+' chỗ kho</p></div>'+
    btn('Nâng cấp kho','data-panel="buildings"','subtle')+'</div>'+tabs+
    '<div id="stock-items" class="stock-grid card-grid">'+(cards||'<p>Chưa có nông sản.</p>')+'</div>'+pageControls;
}
function renderPanel(farm,now) {
  if(panel==='tasks')return renderTasks(farm,now);
  if(panel==='progress')return renderProgress(farm);
  if(panel==='rank')return renderRank(farm);
  if(panel==='land')return renderLand(farm,now);
  if(panel==='ponds')return renderPonds(farm,now);
  if(panel==='orders')return renderOrderBoard(farm,now);
  if(panel==='villageLevel')return renderVillage(farm);
  if(panel==='members')return renderVillageMembers(farm);
  if(panel==='stock')return renderStock(farm);
  if(panel==='buildings') return '<div class="row"><h2>Công trình</h2>'+btn(farm.xp+' XP','data-panel="progress" aria-label="Xem tiến độ XP"','subtle')+'</div>'+'<div class="upgrade-list card-grid">'+Object.keys(buildings).map(key=>upgrade(farm,key)).join('')+'</div>'+
    ((farm.workshop??0)>0?'<div class="actions">'+btn('Vào Xưởng máy','data-workshop-go','primary')+'</div>':'')+
    '<details class="base-decor"'+(baseDecorOpen?' open':'')+'><summary>Hàng rào công trình chính</summary>'+[[-1,'Ruộng chính'],...(farm.coop?[[-4,'Chuồng chính']]:[])].map(([id,label])=>'<h3>'+label+'</h3>'+decorOptions(farm,id)).join('')+'</details>'+
    '<div class="actions">'+act(farm.shieldUntil>now?'Đóng cổng · '+duration(farm.shieldUntil-now):'Đóng cổng '+gateMinutes(farm)+' phút · 12 xu','shield','','','subtle',farm.coins<12||farm.shieldUntil>now)+'</div>';
  return '<h2>Nhật ký</h2>'+farm.log.slice(0,5).map(entry=>'<div class="row itemrow"><p>'+escape(entry.message)+'</p></div>').join('');
}
function showWeather(){
  const {weather,forecast,next}=state;
  modal('Thời tiết','<div class="row"><strong>'+weather.name+'</strong><span class="weather-icon">'+weather.icon+'</span></div><p>'+weather.note+'</p>'+
    '<div class="weather-next row"><p>Dự báo sau <strong data-clock="weather">'+duration(next-currentTime())+'</strong></p><strong>'+forecast.icon+' '+forecast.name+'</strong></div><p>'+forecast.note+'</p>');
}
function savePinnedGoal(goal){
  pinnedGoal=goal;
  store.write(goalStorageKey(state,session),goal);
}
function renderReturnSummary(){
  if(!initialScreenReady||!state||!returnBaseline||document.hidden||busy||dialog.open)return;
  const view=returnSummary(returnBaseline,state,pinnedGoalView);if(!view)return;
  const elapsed=view.minutes<60?view.minutes+' phút':view.minutes<1440?Math.floor(view.minutes/60)+' giờ':Math.floor(view.minutes/1440)+' ngày thực';
  const [work,storage]=view.rows;
  modal('Chào mừng trở lại','<p class="return-intro">Vườn sau khoảng '+elapsed+' bạn vắng mặt</p><div class="return-popup-grid">'+
    btn('<span class="return-popup-heading">Sẵn sàng thu <b class="coop-count ready'+(!view.ready?' quiet':'')+'">'+view.ready+'</b></span><span class="return-popup-copy">'+escape(work.title)+'</span><span class="return-popup-copy">'+escape(work.copy)+'</span><span class="return-popup-care">Cần chăm sóc <b class="coop-count hungry'+(!view.urgent?' quiet':'')+'">'+view.urgent+'</b></span><span class="return-popup-cta">Xem việc cần làm ›</span>','data-return-summary="tasks"','return-popup-item')+
    btn('<span class="return-popup-heading">Chỗ trống trong kho</span><span class="return-stock-value"><b>'+view.free+'</b><small> / '+view.capacity+' chỗ</small></span><span class="return-popup-copy">'+escape(storage.copy)+'</span><span class="return-popup-cta">Mở kho ›</span>','data-return-summary="stock"','return-popup-item')+
    '</div><div class="return-popup-footer">'+btn('Vào vườn','data-return-summary="dismiss"','primary')+'</div>');
  dialog.classList.add('game-management','return-popup');dialog.setAttribute('aria-label','Chào mừng trở lại');
  returnBaseline=null;
  dialog.querySelector('[data-return-summary="dismiss"]').focus({preventScroll:true});
}
function renderNextGoal(now){
  const snapshot={...state,now};
  const key=goalStorageKey(snapshot,session),raw=store.read(key);
  pinnedGoal=reconcileGoal(loadGoal(raw,snapshot),snapshot);
  if(JSON.stringify(raw)!==JSON.stringify(pinnedGoal))store.write(key,pinnedGoal);
  pinnedGoalView=goalView(pinnedGoal,snapshot);
  const view=pinnedGoalView,zone=$('#next-goal');
  zone.hidden=panel!=='tasks'||taskBookTab!=='tasks'||!!neighborId;
  if(zone.hidden){zone.innerHTML='';return;}
  const labels=['Gieo','Tưới','Thu','Bán'];
  const ticks=view?.stage===undefined?'':'<span class="goal-pin-ticks" aria-label="'+(view.stage===4?'Hoàn thành':labels[view.stage])+'">'+labels.map((s,i)=>'<i data-done="'+(i<=view.stage)+'" title="'+s+'"></i>').join('')+'</span>';
  const html=view?'<article class="goal-pin"><span class="goal-pin-art" aria-hidden="true">'+(pinnedGoal.kind==='intro'?cropIllustration('wheat'):pinnedGoal.kind==='villageGoods'?(itemIllustration(pinnedGoal.item)||icon('orders')):icon('build'))+'</span>'+btn('<small>Đang ghim</small><strong>'+escape(view.title)+'</strong><span>'+escape(view.meta)+'</span>'+ticks,'data-goal="detail"','goal-pin-info')+btn('›','data-goal="go" aria-label="'+escape(view.cta)+'"','primary')+btn('⋯','data-goal="choose" aria-label="Đổi hoặc bỏ ghim"','subtle')+'</article>':btn('＋ Ghim mục tiêu','data-goal="choose"','goal-pin-empty');
  if(zone.innerHTML!==html)zone.innerHTML=html;
}
function showGoalChoices(){
  const choices=['workshop','coop','barn','field'].map(key=>{
    const step=buildingUpgrade(state.me,key);
    return btn(escape(buildings[key].name)+(step.level>=step.max?' · Đã tối đa':' cấp '+(step.level+1)),
      'data-goal="building" data-item="'+key+'"','subtle',step.level>=step.max);
  }).join('');
  modal('Mục tiêu của bạn','<p>Chỉ ghim một mục tiêu. Đổi hoặc bỏ ghim không xóa tiến trình nông trại.</p><p>Lựa chọn được lưu theo vườn trên thiết bị này, tách riêng vườn thử và làng online.</p><div class="goal-choices">'+btn('Vòng lúa mì · Gieo → Chăm → Thu → Bán','data-goal="intro"','primary')+choices+btn('Bỏ ghim · Chơi tự do','data-goal="unpin"','subtle')+'</div>');
}
function goToPinnedGoal(){
  // Refresh the destination from current state, never execute the farm action.
  renderNextGoal(currentTime());
  const route=pinnedGoalView?.route;
  if(!route)return;
  if(route.kind==='villageGoods'){orderPane='village';panel='orders';render();reveal('#side');return;}
  if(route.kind==='goodsSource'){showDriveSource(route.item);return;}
  if(route.kind==='choose'){showGoalChoices();return;}
  if(route.kind==='weather'){showWeather();return;}
  if(route.kind==='stock'){
    stockTab='produce';stockPage=0;panel='stock';render();reveal('#side');return;
  }
  if(route.kind==='building'){
    panel='buildings';render();
    const button=panelBody.querySelector('[data-action="upgrade"][data-item="'+route.key+'"]');
    if(button)reveal('[data-action="upgrade"][data-item="'+route.key+'"]');else reveal('#side');
    return;
  }
  if(route.kind==='plot'){
    selected=route.index;plotGroup=gardenFor(selected);goTo('field');
    if(!world.approach('plot',selected,()=>reveal('#tools')))reveal('#tools');
    return;
  }
  if(route.kind==='field'){goTo('field');reveal('#board');return;}
  if(route.kind==='seed'||route.kind==='sell'){
    const seed=route.kind==='seed';marketPane=seed?'supplies':'sales';
    marketQueries[marketPane]='lúa mì';if(seed)supplyGroup='seeds';
    goTo('market');
    if(!world.approach('market',undefined,()=>reveal('#board'),{style:seed?'red':'gold'}))reveal('#board');
  }
}
const focusSelector='[data-task-tab],[data-task-group],[data-task-back],[data-task-book-page],[data-task-detail-page],[data-task-ref],[data-hire-menu],[data-drive-history],[data-manage-pond],[data-pond-filter],[data-pond-page],[data-pond-adopt],[data-workshop-page],[data-market-catalog-page],[data-recipe-info],[data-coop-filter],[data-coop-page],[data-coop-adopt],[data-market-order-page],[data-drive-select],[data-drive-rules],[data-drive-people],[data-order-pane],[data-drive-pin],[data-drive-source],[data-drive-prepare],[data-drive-buy],[data-fence-info],[data-animal-info],[data-animal-group],[data-animal-page],[data-seed-info],[data-seed-group],[data-seed-page],[data-seed-buy],[data-return-summary],[data-unlock],[data-unlock-route],[data-goal],[data-plot],[data-action],[data-shop],[data-sell],[data-list],[data-room],[data-visit],[data-return],[data-tab],[data-village-page],[data-stock-tab],[data-stock-page],[data-panel],[data-weather],[data-market-pane],[data-pond-tab],[data-pond-go],[data-aqua-stock],[data-land-tab],[data-land-go],[data-crop-group],[data-open-garden],[data-open-pond],[data-visit-pond],[data-vital],[data-task],[data-recover],[data-remove-member],[data-home-exit],[data-village-fund],[data-village-goods],[data-seed-crop],[data-order-preview],[data-market-search],[data-supply-group],[data-sell-all],[data-item-info],[data-workshop-go],[data-workshop-tab],[data-crop-growth],[data-crop-explain],[data-rank-farm],[data-manage-animal],[data-sell-animal],[data-quick-garden],[data-garden-decor],[data-arrange-garden-decor]';
function focusKey(element) {
  if(element?.matches('[data-panel-fold]>summary'))return 'fold='+element.parentElement.dataset.panelFold;
  if(!element?.matches(focusSelector+', [data-lake-elder], [data-lake-tab], [data-help-page], [data-prank-page], [data-visit-pane], [data-visit-source], [data-visit-take-page]')) return '';
  return Object.entries(element.dataset).map(([key,value])=>key+'='+value).join('|')+
    ('itemInfo' in element.dataset?(element.getAttribute('aria-label')??''):'');
}
function areaButtons(farm) {
  return Object.entries(tabs).filter(([key])=>key!=='workshop'||(farm.workshop??0)>0).map(([key,[,name]])=>
    '<button type="button" data-tab="'+key+'" class="'+(tab===key?'active':'')+'"'+(tab===key?' aria-current="page"':'')+'>'+icon(areaIcons[key])+name+'</button>').join('');
}
function render(arrival) {
  if(!state||composingMarketSearch) return;
  const canHoverSeeds=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hoveredAnimal=canHoverSeeds&&stockTooltipCard?.dataset.animalInfo&&(stockTooltip.matches(':hover')||stockTooltipCard.matches(':hover'))?stockTooltipCard.dataset.animalInfo:null;
  const hoveredSeed=canHoverSeeds&&stockTooltipCard?.dataset.seedInfo&&(stockTooltip.matches(':hover')||stockTooltipCard.matches(':hover'))?stockTooltipCard.dataset.seedInfo:null;
  const focused=document.activeElement;
  const focus=focusKey(focused);
  const searchSelection=focused.matches('[data-market-search]')?[focused.selectionStart,focused.selectionEnd,focused.selectionDirection]:null;
  const priorDecor=$('.base-decor');
  if(priorDecor)baseDecorOpen=priorDecor.open;
  const panelScroll=panelBody.scrollTop;
  const folded=new Map(Array.from(panelBody.querySelectorAll('details[data-panel-fold]'),el=>[el.dataset.panelFold,el.open]));
  const farm=state.me, now=currentTime();
  const workshopUnlocked=(farm.workshop??0)>0;
  const canManage=!!session&&state.canManageMembers;
  if(panel==='members'&&!canManage)panel='villageLevel';
  if(tab==='workshop'&&!workshopUnlocked){tab='field';panel='area';}
  if(!farm.plotIndexes.includes(selected)){selected=0;plotGroup=-1;}
  lastPanelTime=now;
  tasks=farmTasks(state,now);
  renderNextGoal(now);
  renderReturnSummary();
  renderHud(farm,now);
  const [,title,description]=tabs[tab];
  const selectedNeighbor=tab==='neighbors'?state.neighbors.find(n=>n.id===neighborId):undefined;
  if(!selectedNeighbor)neighborId=null;
  $('#nav').innerHTML=areaButtons(farm);
  $('#coin').textContent=formatCoins(farm.coins)+' xu';
  $('#room span').textContent=session?'Làng '+session.code:'Vào làng';
  $('#sub-title').textContent=session?farm.name+' · '+state.village.name:'Vườn chơi thử';
  $('#title').textContent=selectedNeighbor?selectedNeighbor.name:title;
  $('#world-day').title='Ngày mới sau '+duration(state.dayEnds-now);
  $('#subtitle').textContent=description;
  $('#date').textContent='Ngày '+(state.day+1);
  villagePage=neighborPage(state,villagePage).index;
  world.sync(selectedNeighbor?'visit':tab,state,{neighbor:selectedNeighbor,selection:selected,page:villagePage,arrival,tasks});
  $('#world-weather').innerHTML=tab==='home'||tab==='workshop'?'':'<button class="world-weather" type="button" data-weather aria-label="Xem dự báo: '+state.weather.name+'">'+icon('weather')+'<span class="weather-name">'+state.weather.name+'</span><span class="landscape-only weather-symbol" aria-hidden="true">'+state.weather.icon+'</span></button>';
  $('#board').innerHTML={
    home:()=>renderHome(farm,now), workshop:()=>renderWorkshop(farm), field:()=>renderField(farm), lake:()=>renderLake(farm,now), coop:()=>renderCoop(farm,now), market:()=>renderMarket(farm), neighbors:()=>renderNeighbors(farm,now)
  }[tab]();
  $('#tools').innerHTML=tab==='field'?renderCropTools(farm,now):'';
  const panelNav=$('#panel-nav');
  panelNav.className='panel-tabs';
  const groups=canManage?{...tabGroups,village:[...tabGroups.village,'members']}:tabGroups;
  const group=Object.values(groups).find(keys=>keys.includes(panel))??groups.main;
  panelNav.innerHTML='<div class="panel-shortcuts">'+Object.keys(groups).map(key=>{
    const active=groups[key]===group;
    return '<button data-group="'+key+'" data-panel="'+groups[key][0]+'"'+(active?' class="active"':'')+'>'+({main:'Tổng quan',farm:'Nông trại',village:'Làng'})[key]+'</button>';
  }).join('')+'</div><div class="panel-subtabs" data-count="'+group.length+'">'+group.map(key=>{
    const [glyph,label]={...panels,...extraPanels}[key];
    return '<button data-panel="'+key+'" class="'+(key===panel?'active':'')+'" aria-pressed="'+(key===panel)+'">'+icon(key==='area'?areaIcons[tab]:glyph)+label+'</button>';
  }).join('')+'</div>';
  $('#board').hidden=panel!=='area';
  $('#tools').hidden=panel!=='area'||tab!=='field';
  const side=$('#side');
  side.hidden=panel==='area';
  const sideContent=panel==='area'?'':renderPanel(farm,now);
  if(panel!=='stock'||renderedStock!==sideContent){
    hideStockTooltip();
    side.innerHTML=sideContent;
  }
  renderedStock=panel==='stock'?sideContent:'';
  const section=panel==='area'?{market:marketPane,workshop:workshopTab,field:plotGroup,neighbors:villagePage}[tab]:
    {land:selectedLot,ponds:pondTab,stock:[stockTab,stockPage]}[panel];
  const panelContext=JSON.stringify([tab,neighborId,panel,section]);
  const samePanel=panelBody.dataset.context===panelContext;
  if(samePanel)panelBody.querySelectorAll('details[data-panel-fold]').forEach(el=>{
    if(folded.has(el.dataset.panelFold))el.open=folded.get(el.dataset.panelFold);
  });
  panelBody.scrollTop=samePanel?panelScroll:0;
  panelBody.dataset.context=panelContext;
  $('#world').dataset.area=tab;
  sceneChat.sessionChanged();
  const quickGardenForm=dialog.open&&dialog.querySelector('.quick-garden-form');
  if(quickGardenForm&&!busy)updateQuickGarden(quickGardenForm);
  if(dialog.open&&recoveryKey&&!busy)showRecovery(recoveryKey,{preserve:true});
  if(focus&&!dialog.open){
    const control=Array.from(document.querySelectorAll(focusSelector+', [data-lake-elder], [data-lake-tab], [data-help-page], [data-prank-page], [data-visit-pane], [data-visit-source], [data-visit-take-page], [data-panel-fold]>summary')).find(el=>focusKey(el)===focus);
    control?.focus({preventScroll:true});
    if(control&&searchSelection)control.setSelectionRange(...searchSelection);
  }
  const seedHover=canHoverSeeds?(hoveredSeed?$('#tools [data-seed-info="'+hoveredSeed+'"]'):$('#tools [data-seed-info]:hover')):null;
  if(seedHover&&!dialog.open){if(hoveredSeed)showSeedTooltip(seedHover);else queueCatalogTooltip(seedHover,showSeedTooltip);}
  const animalHover=canHoverSeeds?(hoveredAnimal?panelBody.querySelector('[data-animal-info="'+hoveredAnimal+'"]'):panelBody.querySelector('[data-animal-info]:hover')):null;
  if(animalHover&&!dialog.open){if(hoveredAnimal)showAnimalTooltip(animalHover);else queueCatalogTooltip(animalHover,showAnimalTooltip);}
}
function goTo(area,arrival,targetPanel='area') {
  if(landscape.matches)setPanelOpen(false);
  tab=area; neighborId=null; panel=targetPanel; render(arrival);
}
function recoveryArrival(key,operation){
  if(key==='water'||key==='food')void perform({action:vitals[key].action},operation);
  else showRecovery(key??'stamina');
}
function guideHome(recovery){
  if(dialog.open)dialog.close();
  if(tab==='home'){recoveryArrival(recovery);return;}
  const from={coop:[433,198],market:[234,34],lake:[679,402],neighbors:[234,251]}[tab];
  if(tab!=='field')goTo('field',from);
  const operation=['water','food'].includes(recovery)?actionFeedback.start(vitals[recovery].action,session?'online':'demo'):null;
  const started=world.approach('house',undefined,()=>{
    goTo('home');
    if(recovery)recoveryArrival(recovery,operation);
  },{onCancel:()=>operation?.finish('cancelled')});
  if(started)reveal('#world');
  else {operation?.finish('unreachable');showToast('Hãy đi theo lối về phía ngôi nhà ở góc trên bên trái.',true);}
}
function guideRecovery(key){
  const well=key==='water'&&currentWell();
  if(!well){guideHome(key);return;}
  dialog.close();
  const operation=actionFeedback.start(vitals[key].action,session?'online':'demo');
  if(world.approach(well.type,undefined,()=>recoveryArrival(key,operation),{onCancel:()=>operation?.finish('cancelled')}))reveal('#world');
  else {operation?.finish('unreachable');showToast('Chưa tìm được đường tới giếng.',true);}
}
function visit(id) {
  if(landscape.matches)setPanelOpen(false);
  neighborId=id;visitPond=0;visitPane='take';visitTakePage=0;helpPage=0;prankPage=0;
  const owner=state.neighbors.find(n=>n.id===id);
  visitSource=owner?.garden.length?'garden':'barn';panel='area';render();
}
function setPanelOpen(open){
  const wasOpen=layout.hasAttribute('data-panel-open');
  if(open===wasOpen)return;
  const restoreFocus=!open&&farmPanel.contains(document.activeElement);
  if(open)sceneChat.close(false);
  layout.toggleAttribute('data-panel-open',open);
  panelToggle.setAttribute('aria-expanded',String(open));
  if(restoreFocus)panelToggle.focus({preventScroll:true});
}
function reveal(selector) {
  const destination=$(selector);
  if(!destination)return;
  if(landscape.matches){
    if(selector==='#world'){setPanelOpen(false);return;}
    if(farmPanel.contains(destination)){
      setPanelOpen(true);
      if(destination===farmPanel)return;
    }
  }
  if(panelBody.contains(destination)){
    if(!landscape.matches&&matchMedia('(max-width: 760px)').matches){
      farmPanel.scrollIntoView({block:'nearest',behavior:'instant'});
    }
    const target=destination.getBoundingClientRect(), viewport=panelBody.getBoundingClientRect();
    if(target.top<viewport.top||target.height>viewport.height)panelBody.scrollTop+=target.top-viewport.top;
    else if(target.bottom>viewport.bottom)panelBody.scrollTop+=target.bottom-viewport.bottom;
    return;
  }
  destination.scrollIntoView({block:'nearest',behavior:'instant'});
}
function interactWithWorld(target) {
  if(!state||dialog.open)return;
  if(target.type===lakeElder.type){
    showLakeElder();
  } else if(target.type==='bed'){
    showRecovery('stamina');
  } else if(target.type==='land'){
    selectedLot=target.index;panel='land';render();reveal('.control-panel');
  } else if(target.type==='pond'){
    pondTab=target.index;panel='ponds';render();reveal('.control-panel');
  } else if(target.type==='public-fishing'){
    lakeTab='fishing';panel='area';render();reveal('.control-panel');
  } else if(target.type==='shore-work'){
    lakeTab='shore';panel='area';render();reveal('.control-panel');
  } else if(target.type==='neighbor-fishing'){
    visitPond=target.index;visitPane='pond';panel='area';render();reveal('#visit-pond');
  } else if(target.type==='order-board'){
    marketPane='orders';panel='area';render();reveal('.control-panel');
  } else if(target.type==='village-hall'){
    panel='villageLevel';render();reveal('.control-panel');
  } else if(target.type==='workshop'){
    goTo('workshop');
  } else if(target.type==='craft-bench'){
    panel='area';render();reveal('.control-panel');
  } else if(target.type==='well'||target.type==='village-well'){
    showRecovery('water');
  } else if(target.type==='pavilion'){
    showWeather();
  } else if(target.type==='exit') {
    goTo(target.next,target.arrival);
  } else if(target.type==='neighbor') {
    visit(target.id);
  } else if(target.type==='own-house') {
    goTo('field');
  } else if(target.type==='plot'&&tab==='field') {
    selected=target.index;plotGroup=gardenFor(selected);panel='area';render();
    reveal('#tools');
  } else if(target.type==='plot'&&neighborId) {
    const route=visitPlotPane(state.neighbors.find(n=>n.id===neighborId),target.index);
    visitPane=route.pane;visitSource=route.source;
    if(route.pane==='help')helpPage=route.page;
    else if(route.pane==='prank')prankPage=route.page;
    else visitTakePage=route.page;
    panel='area';render();
    const section=route.pane==='take'?'garden':route.pane;
    reveal('#visit-'+section);
    $('#visit-'+section)?.querySelector(`[data-index="${target.index}"]:enabled`)?.focus({preventScroll:true});
  } else if(target.type==='barn') {
    if(neighborId){visitPane='take';visitSource='barn';visitTakePage=0;}
    panel=neighborId?'area':'stock';render();
    reveal(neighborId?'#visit-barn':'.control-panel');
  } else if(target.type==='market') {
    const section=target.style==='green'?'stall':target.style==='gold'?'sales':'supplies';
    panel='area';marketPane=section;render();reveal('.control-panel');
  } else if(target.type==='animal') {
    const pen=state.me.pens[target.index];
    if(pen&&pen.progress>=productGoal(pen)&&!animals[pen.kind].oneTime)void perform({action:'collect',index:target.index,target:String(pen.id??target.index)});
    else {selectCoopAnimal(target.index);panel=pen?.lot===undefined?'area':'land';if(pen?.lot!==undefined)selectedLot=pen.lot;render();reveal(`[data-pen="${target.index}"]`);}
  } else if(target.type==='coop'||target.type==='silo') {
    panel='area';render();reveal('#board');
  } else if(target.type==='house'&&!neighborId) {
    goTo('home');
  }
}
function modal(title,html) {
  delete dialog.dataset.adoptionLot;
  recoveryKey=null;recoveryStamp='';
  delete dialog.dataset.recovery;
  dialog.classList.remove('game-management','return-popup','farm-book-dialog','hire-dialog','recovery-dialog');
  dialog.removeAttribute('aria-label');
  hideStockTooltip();
  dialog.innerHTML='<div class="row"><h2>'+title+'</h2>'+btn('✕','data-close aria-label="Đóng"','subtle')+'</div>'+html;
  if(!dialog.open) dialog.showModal();
}
function showLakeElder(){
  if(tab!=='lake'||neighborId)return;
  const pose=world.position();
  if(Math.hypot(pose.x-lakeElder.approach.x,pose.y-lakeElder.approach.y)>31)return;
  modal(lakeElder.name,'<p class="elder-greeting">“'+escape(lakeElderGreeting(state.weather.id,state.me.avatar))+'”</p><div class="actions">'+
    btn('Việc ven ao','data-elder-open="shore"','primary')+btn('Sổ cá','data-elder-open="book"','subtle')+btn(escape(lakeElderVoice(state.me.avatar).farewell),'data-close','subtle')+'</div>');
}
function showMobileMenu(){
  if(!state)return;
  const roomLabel=$('#room span').textContent;
  const fullscreen=document.fullscreenEnabled&&(document.fullscreenElement?document.exitFullscreen:document.documentElement.requestFullscreen);
  modal('Khu vực','<nav class="mobile-area-list" aria-label="Di chuyển tới khu vực">'+areaButtons(state.me)+'</nav>'+
    '<div class="mobile-options">'+btn(icon('users')+escape(roomLabel),'data-room')+btn(icon('users')+'Nhân vật','data-avatar-menu')+
    btn(icon('music')+'Nhạc nền','data-music-menu')+btn(icon('help')+'Hướng dẫn','data-info')+
    (fullscreen?btn(document.fullscreenElement?'Thoát toàn màn hình':'Toàn màn hình','data-fullscreen'): '')+'</div>');
}
function showMusic(){
  modal('Nhạc nền','<p>Vườn sớm</p><label class="music-volume">Âm lượng <output for="farm-volume">'+music.volume+'%</output>'+
    '<input id="farm-volume" type="range" min="0" max="100" step="1" value="'+music.volume+'" data-music-volume></label>'+
    '<div class="actions">'+btn('Tắt tiếng','data-music-mute aria-pressed="'+music.muted+'"',music.muted?'primary':'subtle')+'</div>');
}
function avatarOptions(current){
  const selected=avatarOf(current),details=avatarDetails[selected];
  return '<fieldset class="avatar-picker"><legend>Chọn nhân vật</legend><div class="avatar-filters"><label>Giới tính<select data-avatar-gender>'+[['female','Nữ'],['male','Nam']].map(([key,label])=>'<option value="'+key+'"'+(details.gender===key?' selected':'')+'>'+label+'</option>').join('')+'</select></label><label>Độ tuổi<select data-avatar-age>'+[['young','Thanh niên'],['middle','Trung niên'],['elder','Cao tuổi']].map(([key,label])=>'<option value="'+key+'"'+(details.age===key?' selected':'')+'>'+label+'</option>').join('')+'</select></label></div><div class="avatar-options">'+Object.entries(avatarDetails).map(([key,info])=>
    '<label><input type="radio" name="avatar" value="'+key+'"'+(selected===key?' checked':'')+'><span class="avatar-portrait" data-avatar="'+key+'"'+(ageCharacterAtlases[key]?' style="background-image:url('+ageCharacterAtlases[key].base+');background-size:576px 256px"':'')+' aria-hidden="true"></span><strong>'+info.name+'</strong><small>'+info.label+'</small></label>').join('')+'</div><p class="small">Ngoại hình không thay đổi tốc độ, thể lực hay khả năng chăm vườn. Bạn có thể đổi miễn phí trong lúc chơi.</p></fieldset>';
}
function showAvatar(){
  if(!state)return;
  modal('Chọn nhân vật','<form data-form="avatar">'+avatarOptions(state.me.avatar)+
    '<button class="btn primary">Lưu nhân vật</button></form><p id="dialog-error" role="status"></p>');
}
function guestSession(){
  return session&&!session.account&&session.token!==accountSession?.token?session:null;
}
function showAccountModal(mode='login') {
  const room=mode==='register'?guestSession()?.code:null;
  const formMode=mode==='register'?'register':'login';
  const title=formMode==='register'?'Tạo tài khoản':'Đăng nhập';
  modal(title,'<div class="actions">'+btn('Đăng nhập','data-account-mode="login"',''+(formMode==='login'?'primary':'subtle'))+btn('Tạo tài khoản','data-account-mode="register"',''+(formMode==='register'?'primary':'subtle'))+'</div><form data-form="account" data-account-mode="'+formMode+'"><label>Tên tài khoản<input name="username" required minlength="3" maxlength="20" pattern="[A-Za-z0-9_-]+" placeholder="Ví dụ: demo_user"></label><label>Mật khẩu<input type="password" name="password" required minlength="6" maxlength="128" placeholder="Ít nhất 6 ký tự"></label>'+(formMode==='register'?avatarOptions(state?.me.avatar):'')+(room?'<p class="small">Làng hiện tại sẽ được gắn vào tài khoản '+room+'</p>':'')+'<button class="btn primary">'+(formMode==='register'?'Tạo tài khoản':'Đăng nhập')+'</button></form><p id="dialog-error" role="status"></p>');
}
function showRoom() {
  if(session) {
    const accountSummary = accountSession ? '<p>Tài khoản: <strong>'+escape(accountSession.username)+'</strong></p>' : '';
    const accountActions = accountSession ?
      '<div class="actions">'+btn('Đăng nhập khác','data-account','primary')+btn('Tạo tài khoản mới','data-account-mode="register"','subtle')+btn('Đăng xuất','data-account-logout','subtle')+'</div>' :
      '<div class="actions">'+btn('Đăng nhập tài khoản','data-account','primary')+btn('Tạo tài khoản','data-account-mode="register"','subtle')+'</div>';
    modal('Làng của bạn','<p>Chia sẻ mã '+session.code+' hoặc gửi đường dẫn cho hàng xóm. Làng có tối đa 12 vườn.</p>'+accountSummary+accountActions+'<div class="actions">'+
      btn('Sao chép liên kết','data-copy','primary')+
      btn('Về vườn chơi thử','data-back-demo','subtle')+'</div>');
    return;
  }
  const previous=store.read(previousKey);
  const rejoin=previous&&!inviteCode?'<div class="actions">'+btn('Tiếp tục làng '+previous.code,'data-resume','gold')+'</div>':'';
  const accountControls=accountSession?'<p>Tài khoản: <strong>'+escape(accountSession.username)+'</strong></p><div class="actions">'+
    btn('Đăng nhập khác','data-account','primary')+btn('Đăng xuất','data-account-logout','subtle')+'</div>':
    '<div class="actions">'+btn('Đăng nhập tài khoản','data-account','primary')+'</div>';
  modal('Vào làng','<p>Nhập tên vườn và mã của bạn bè. Nếu để trống mã, bạn sẽ tạo làng mới.</p>'+accountControls+'<form data-form="join"><label>Tên vườn<input name="name" required minlength="2" maxlength="24" placeholder="Ví dụ: Vườn của Đổi"></label><label>Mã làng<input name="code" value="'+inviteCode+'" maxlength="8" placeholder="Để trống nếu tạo làng"></label>'+avatarOptions(state?.me.avatar)+'<div class="actions"><button class="btn primary">Bắt đầu chơi online</button>'+btn('Chơi nhanh','data-quick-avatar','subtle')+'</div></form>'+rejoin+'<p id="dialog-error" role="status"></p>');
}
function backToDemo(){
  session=null;
  revision=-1;
  selected=0;plotGroup=-1;pondTab=0;selectedLot=0;
  tab='field';neighborId=null;villagePage=0;panel='area';
  store.write(sessionKey,null);
  setPanelOpen(false);
  updateDemo();
  render();
}
function showShop(key,sell) {
  const farm=state.me, info=goods[key], price=sell?info.sell:info.buy;
  const count=sell?farm.inventory[key]??0:Math.min(Math.floor(farm.coins/price),supplyLimit-(farm.inventory[key]??0));
  if(count<1) return showToast('Hiện chưa thể mua hoặc bán mặt hàng này.',true);
  const quickBuy=sell?'':'<div class="buy-steps" role="group" aria-label="Tăng nhanh số lượng">'+[5,10,20,30].map(step=>
    btn('+'+step,'data-buy-step="'+step+'"','subtle',count===1)).join('')+'</div><p class="buy-total"><span>Tổng tiền</span><output for="buy-quantity">'+formatCoins(price)+' xu</output></p>';
  modal((sell?'Bán ':'Mua ')+info.name.toLowerCase(),itemDescription(key)+'<p>'+price+' xu/món · '+(sell?'Trong kho ':'Mua tối đa ')+count+'</p><form data-form="'+(sell?'sell':'buy')+'" data-item="'+key+'"><label>Số lượng<input'+(sell?'':' id="buy-quantity"')+' type="number" name="qty" min="1" max="'+count+'" required value="1"></label>'+quickBuy+'<button type="submit" class="btn primary">'+(sell?'Bán cho chợ':'Mua vật tư')+'</button></form><p id="dialog-error" role="status"></p>');
}
function updateBuyTotal(input){
  const form=input.form;
  const qty=input.valueAsNumber;
  form.querySelector('output').value=input.validity.valid?formatCoins(qty*goods[form.dataset.item].buy)+' xu':'—';
}
function confirmSellAll(key){
  const count=state.me.inventory[key]??0;
  if(!count)return;
  modal('Bán hết '+goods[key].name.toLowerCase(),'<p>Trong kho: '+count+' món · Dự kiến nhận '+formatCoins(count*goods[key].sell)+' xu.</p>'+
    '<div class="actions">'+btn('Xác nhận bán hết','data-confirm-sell-all="'+key+'"','primary')+btn('Quay lại','data-close','subtle')+'</div><p id="dialog-error" role="status"></p>');
}
function listingDialog() {
  const items=Object.keys(goods).filter(key=>goods[key].sell&&state.me.inventory[key]);
  modal('Đăng bán','<p>Nông sản được giữ ở sạp đến khi có người mua hoặc bạn tự gỡ hàng.</p><form data-form="list"><label>Nông sản<select name="item">'+items.map(key=>'<option value="'+key+'">'+nice(key)+' · '+state.me.inventory[key]+' trong kho</option>').join('')+
    '</select></label><label>Số lượng<input type="number" name="qty" min="1" max="20" value="1" required></label><label>Giá mỗi món · xu<input type="number" name="price" min="1" value="'+goods[items[0]].sell+'" required></label><button class="btn primary">Đăng lên sạp</button></form><p id="dialog-error" role="status"></p>');
}
function help() {
  modal('Cách chơi','<ol><li>Dùng phím WASD/mũi tên, kéo cần di chuyển trên mobile hoặc chạm bản đồ để đi. Đến gần một địa điểm rồi nhấn E hoặc chọn Tương tác. Khi xoay ngang, bấm Khu vực để chuyển cảnh hoặc Công cụ để mở bảng quản lý.</li><li>Chọn thao tác trên ô cây để nhân vật tự đi tới rồi làm. Uống nước ở giếng hoặc trong Nhà vườn, ăn cơm nắm trong Nhà vườn. Đồ chế biến trong túi dùng được ở mọi khu vực.</li><li>Chạm Thể lực → Về Nhà vườn. Khi vào nhà, chọn Nghỉ ngay. Sau 60 giây, bạn hồi tối đa 75 điểm thể lực.</li><li>Ô bỏ trống 8 giờ cần cuốc trước khi gieo. Khi cây chín, chọn Thu và giữ 1 giống hoặc đổi nông sản trong Kho thành giống. Bảng đơn ở Chợ làng trao thưởng cho vườn giao đủ hàng đầu tiên. Mục Cấp làng có tiến độ và quỹ xây công trình.</li><li>Tưới nước để cây lớn nhanh hơn. Mưa tưới tự nhiên, nhưng sau khi tạnh sâu vẫn dễ xuất hiện trong 20 phút. Trị sâu sớm để giữ sản lượng. Nắng nóng làm cây và vật nuôi lớn chậm hơn.</li><li>Xây chuồng, đón vật nuôi rồi cho ăn. Vật nuôi lớn lên trước khi cho sản phẩm. Chọn Quản lý để chuyển chuồng hoặc bán sống. Vật nuôi lấy sản phẩm cho ít hơn sau 3 và 7 ngày thực. Khi lợn hoặc thỏ sẵn sàng, chọn Xuất chuồng để thu thịt.</li><li>Ở Hàng xóm, mỗi vườn cho lấy một món mỗi ngày. Nâng túi để tăng số món từ nhiều vườn.</li><li>Mỗi ngày trong game kéo dài 8 giờ. Mở Ao nuôi để thả cá, tôm và cua chung ao. Sức chứa tùy diện tích. Đến Hồ làng để câu miễn phí. Câu ao hàng xóm dùng chung lượt lấy đồ với vườn và kho.</li></ol>');
}
async function perform(input,operation) {
  if(busy){operation?.finish('cancelled');return false;}
  const feedback=operation??actionFeedback.start(input.action,session?'online':'demo');
  feedback?.stage('arrived');
  const block=workBlock(wellnessAt(state.me,currentTime()),workCost(input.action,state.weather.id),currentTime());
  if(block){feedback?.finish('blocked');showToast(block,true);return false;}
  busy=true;
  const credentials=session;
  const previousFarm=state.me, actionTab=tab, actionNeighbor=neighborId;
  const previousGoalKey=goalStorageKey(state,credentials),previousGoalRaw=store.read(previousGoalKey);
  const previousGoal=loadGoal(previousGoalRaw,state);
  let updateAfter=false,outcome='cancelled',endPreview;
  try {
    let message;
    const located=needsPlayerLocation(input.action);
    const checkLocation=pose=>{
      const blocked=locationBlock(input,pose);
      if(blocked)throw new GameError(blocked);
    };
    if(located)checkLocation();
    if(feedback)endPreview=world.startWork(input);
    if(credentials) {
      const sameLocation=()=>credentials===session&&actionTab===tab&&actionNeighbor===neighborId;
      const submit=async()=>{
        if(located){
          if(!sameLocation())return null;
          const pose=world.position();
          checkLocation(pose);
          feedback?.stage('position');
          await api('scene',{area:actionNeighbor?'visit':actionTab,host:actionNeighbor,pose},credentials,feedback);
          feedback?.stage('positionReady');
          if(!sameLocation())return null;
          checkLocation();
        }
        input.requestId=crypto.randomUUID();feedback?.stage('action');
        try {
          return await api('action',input,credentials,feedback);
        } catch(error) {
          if(error.status)throw error;
          feedback?.stage('retry');
          return api('action',input,credentials,feedback);
        }
      };
      const result=located?await sceneChat.withPosition(submit,{onReady:()=>feedback?.stage('positionQueueReady')}):await submit();
      if(!result||credentials!==session)return false;
      feedback?.stage('actionDone');
      revision=result.revision;
      setState(result.state);
      message=result.message;
    } else {
      const updated=structuredClone(demo);
      message=apply(updated,'demo',input,unixNow(),Math.random(),{area:actionTab});
      demo=updated;
      store.write(demoKey,demo);
      updateDemo();
    }
    if(JSON.stringify(store.read(previousGoalKey))===JSON.stringify(previousGoalRaw)){
      store.write(previousGoalKey,goalAfterAction(previousGoal,input,previousFarm,state.me));
    }
    feedback?.stage('render');
    render();
    feedback?.stage('rendered');
    if(!['removeMember','villageGoods','hireGardenHelper'].includes(input.action)&&tab===actionTab&&neighborId===actionNeighbor){
      const reel=input.action==='reel';
      const caught=reel&&[previousFarm.fishing.cast?.item,'minnow','tilapia','goldenCarp'].some(key=>key&&(state.me.inventory[key]??0)>(previousFarm.inventory[key]??0));
      world.particle(input,{cast:reel?previousFarm.fishing.cast:state.me.fishing.cast,caught,effectsOnly:!!endPreview});
    }
    if(input.action!=='shoreTick'||!state.me.shoreJob)showToast(message);
    outcome='success';return true;
  } catch(error) {
    outcome='failed';
    updateAfter=error.status===401||['order','villageGoods','villageFund','sell','till','plant','hireGardenHelper','upgradeGarden','upgradeParcelCoop','moveAnimal','sellAnimal','placeGardenDecor','stowGardenDecor','arrangeGardenDecor','removeMember'].includes(input.action);
    const message=error instanceof GameError||error instanceof Error?error.message:'Không thể thực hiện thao tác.';
    showToast(message,true);
    const inline=$('#dialog-error');
    if(inline) inline.textContent=message;
    return false;
  } finally {
    endPreview?.(outcome==='success');feedback?.finish(outcome);
    busy=false;
    if(updateAfter)void refresh();
  }
}
async function refresh(initial=false) {
  if(busy) return;
  const credentials=session;
  if(!credentials) {
    updateDemo();
    render();
    return;
  }
  try {
    const result=await api('state',undefined,credentials);
    if(credentials!==session||result.revision<revision) return;
    revision=result.revision;
    setState(result.state);
    render();
  } catch(error) {
    if(credentials!==session) return;
    if(error.status===401||error.status===404) {
      if(store.read(previousKey)?.token===credentials.token) store.write(previousKey,null);
      session=null;
      store.write(sessionKey,null);
      selected=0; plotGroup=-1; pondTab=0; selectedLot=0;
      tab='field'; neighborId=null; villagePage=0; panel='area';
      setPanelOpen(false);
      if(dialog.open)dialog.close();
      updateDemo();
      render();
      if(!initial)showToast(error.message,true);
    }
    if(initial) {
      if(!state) {
        $('#board').innerHTML='<p class="loading">Mất kết nối. Đang thử lại…</p>';
      } else render();
      showToast(error.message,true);
    }
  }
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&stockTooltipCard){
    event.preventDefault();
    hideStockTooltip();
    return;
  }
  if(event.key==='Escape'&&landscape.matches&&!dialog.open&&layout.hasAttribute('data-panel-open')){
    event.preventDefault();
    setPanelOpen(false);
  }
});
panelBody.addEventListener('pointerover',event=>{
  const animal=event.target.closest('[data-animal-info]');
  if(event.pointerType==='mouse'&&animal){queueCatalogTooltip(animal,showAnimalTooltip);return;}
  const seed=event.target.closest('[data-seed-info]');
  if(event.pointerType==='mouse'&&seed){queueCatalogTooltip(seed,showSeedTooltip);return;}
  const card=event.target.closest('[data-stock-item]');
  if(event.pointerType==='mouse'&&card)showStockTooltip(card);
});
panelBody.addEventListener('pointerout',event=>{
  if(event.pointerType==='mouse'&&catalogHoverCard?.contains(event.target)&&!catalogHoverCard.contains(event.relatedTarget))hideStockTooltip();
  if(event.pointerType==='mouse'&&stockTooltipCard?.contains(event.target)&&
    !stockTooltipCard.contains(event.relatedTarget)&&!stockTooltip.contains(event.relatedTarget))hideStockTooltip();
});
stockTooltip.addEventListener('pointerleave',event=>{
  if(!stockTooltipCard?.contains(event.relatedTarget))hideStockTooltip();
});
panelBody.addEventListener('focusin',event=>{
  if(event.target.matches('[data-animal-info]:focus-visible'))showAnimalTooltip(event.target);
  if(event.target.matches('[data-seed-info]:focus-visible'))showSeedTooltip(event.target);
  if(event.target.matches('[data-stock-item]:focus-visible'))showStockTooltip(event.target);
});
panelBody.addEventListener('focusout',event=>{
  if(event.target===stockTooltipCard&&!stockTooltip.matches(':hover')&&!stockTooltipCard.matches(':hover'))hideStockTooltip();
});
window.addEventListener('scroll',hideStockTooltip,{capture:true,passive:true});
window.addEventListener('resize',hideStockTooltip);
document.addEventListener('change',event=>{
  const picker=event.target.closest('.avatar-picker');
  if(!picker)return;
  const gender=picker.querySelector('[data-avatar-gender]'),age=picker.querySelector('[data-avatar-age]');
  if(event.target.matches('[data-avatar-gender],[data-avatar-age]')){
    const key=avatarKey(gender.value,age.value);
    const option=[...picker.querySelectorAll('input[name=avatar]')].find(input=>input.value===key);
    if(option)option.checked=true;
  }else if(event.target.matches('input[name=avatar]')){
    const info=avatarDetails[event.target.value];
    if(info){gender.value=info.gender;age.value=info.age;}
  }
});
document.addEventListener('click',async e=>{
  const el=e.target.closest('button');
  if(!el) return;
  const d=el.dataset;
  if(busy&&el.closest('.farm-book-dialog')&&!('close' in d))return;
  if('animalGroup' in d){
    if(!state||busy||!['open','locked'].includes(d.animalGroup))return;
    animalGroup=d.animalGroup;animalPage=0;if(!refreshAdoptionPicker()){render();reveal('.animal-picker');}
  }else if('animalPage' in d){
    if(!state||busy)return;
    animalPage=Number(d.animalPage)||0;if(!refreshAdoptionPicker()){render();reveal('.animal-picker');}
  }else if('animalInfo' in d){if(state)showAnimalInfo(d.animalInfo,optionalIndex(d.lot));}
  else if('seedGroup' in d){
    if(!state||busy||!['open','locked'].includes(d.seedGroup))return;
    seedGroup=d.seedGroup;seedPage=0;hideStockTooltip();render();reveal('#tools');
  }else if('seedPage' in d){
    if(!state||busy)return;
    seedPage=Number(d.seedPage);hideStockTooltip();render();reveal('#tools');
  }else if('seedInfo' in d){if(state)showSeedInfo(d.seedInfo);}
  else if('seedBuy' in d){
    if(!state||busy||!Object.hasOwn(crops,d.seedBuy)||cropRequirement(state.me,d.seedBuy))return;
    dialog.close();marketPane='supplies';supplyGroup='seeds';marketQueries.supplies=goods[crops[d.seedBuy].seed].name;
    goTo('market');if(!world.approach('market',undefined,()=>reveal('#board'),{style:'red'}))reveal('#board');
  }else if('returnSummary' in d){
    if(!state||busy)return;
    returnBaseline=null;dialog.close();
    if(d.returnSummary==='tasks'){panel='tasks';render();reveal('#side');}
    else if(d.returnSummary==='stock'){stockTab='produce';stockPage=0;panel='stock';render();reveal('#side');}
    else if(d.returnSummary==='goal'){if(pinnedGoalView)goToPinnedGoal();else showGoalChoices();}
  }else if('unlock' in d){if(state)showUnlock(d.unlock,d.key,optionalIndex(d.lot));}
  else if('unlockRoute' in d){
    if(!state||busy)return;
    dialog.close();
    if(d.unlockRoute==='market'){marketPane='sales';goTo('market');reveal('#board');}
    else if(d.unlockRoute==='progress'){panel='progress';render();reveal('#side');}
    else if(d.unlockRoute==='buildings'){panel='buildings';render();reveal('[data-action="upgrade"][data-item="'+d.key+'"]');}
  }else if('workshopPage' in d){workshopPage=Number(d.workshopPage);render();}
  else if('marketCatalogPage' in d){marketPages[marketPane]=Number(d.marketCatalogPage);render();}
  else if('recipeInfo' in d){showRecipeInfo(d.recipeInfo);}
  else if('coopFilter' in d||'coopPage' in d){
    if(!state)return;const lot=optionalIndex(d.lot),key=coopKey(lot),current=coopViews.get(key)??{filter:'all',page:0};
    coopViews.set(key,'coopFilter' in d?{filter:d.coopFilter,page:0}:{...current,page:Number(d.coopPage)});render();
  }else if('coopAdopt' in d){if(state)showCoopAdoption(optionalIndex(d.lot));}
  else if('marketOrderPage' in d){marketOrderId=null;marketOrderPage=Number(d.marketOrderPage);render();}
  else if('driveSelect' in d){if(state?.villageDrive?.items.some(r=>r.item===d.driveSelect)){driveSelection={id:state.villageDrive.id,item:d.driveSelect};render();}}
  else if('driveRules' in d){if(state)showDriveRules();}
  else if('driveHistory' in d)showDriveHistory(d.driveHistory);
  else if('drivePeople' in d){if(state)showDrivePeople();}
  else if('orderPane' in d){if(['market','village'].includes(d.orderPane)){orderPane=d.orderPane;render();}}
  else if('drivePin' in d){if(state&&!busy)requestDrivePin(d.drivePin);}
  else if('driveSource' in d){if(state)showDriveSource(d.driveSource);}
  else if('driveBuy' in d){if(state&&Object.hasOwn(goods,d.driveBuy)){dialog.close();marketPane='supplies';supplyGroup='seeds';marketQueries.supplies=goods[d.driveBuy].name;goTo('market');if(!world.approach('market',undefined,()=>reveal('#board'),{style:'red'}))reveal('#board');}}
  else if('drivePrepare' in d){
    if(!state)return;const item=d.drivePrepare;dialog.close();
    if(Object.hasOwn(crops,item)){goTo('field');reveal('#board');}
    else if(Object.values(animals).some(a=>a.product===item)){goTo('coop');reveal('#board');}
    else if(Object.hasOwn(recipes,item)){goTo('workshop');reveal('#board');}
    else showItem(item);
  }else if('goal' in d){
    if(!state)return;
    if(busy){showToast('Hãy chờ thao tác hiện tại hoàn tất.');return;}
    if(d.goal==='choose')showGoalChoices();
    else if(d.goal==='unpin'){savePinnedGoal(noGoal());dialog.close();render();}
    else if(d.goal==='intro'){savePinnedGoal(pinIntro(state));dialog.close();render();}
    else if(d.goal==='building'&&Object.hasOwn(buildings,d.item)){savePinnedGoal(pinBuilding(state.me,d.item));dialog.close();render();}
    else if(d.goal==='villageGoods'){const next=pinVillageGoods({...state,now:currentTime()},d.item);if(next.kind!=='none'){savePinnedGoal(next);dialog.close();render();}else{dialog.close();showToast('Đợt đã kết thúc hoặc món đã đủ.');}}
    else if(d.goal==='go')goToPinnedGoal();
    else if(d.goal==='detail')modal('Mục tiêu của bạn','<h3>'+escape(pinnedGoalView?.title??'Chọn mục tiêu')+'</h3><p>'+escape(pinnedGoalView?.copy??'Chọn một mục tiêu để theo dõi.')+'</p><p>'+escape(pinnedGoalView?.meta??'')+'</p><p>Tiến độ dựa trên thao tác thành công và tình trạng vườn. Mục tiêu được lưu riêng theo vườn trên thiết bị này. Bạn có thể đổi hoặc bỏ ghim mà không mất tiến trình nông trại.</p><p>Không có phần thưởng mới; xu và XP vẫn theo các thao tác và Sổ việc hiện có.</p>');
  }else if('guideArea' in d&&Object.hasOwn(tabs,d.guideArea)){
    const targetPanel=d.guidePanel==='ponds'?'ponds':'area';
    goTo(d.guideArea,undefined,targetPanel);
    reveal('.control-panel');
  } else if('tab' in d) {
    if(!state) return;
    if(el.closest('.mobile-area-list'))dialog.close();
    if(d.tab==='home')guideHome();
    else {if(d.tab==='market'&&el.closest('.journal'))marketPane='sales';goTo(d.tab);}
  } else if('mobileMenu' in d)showMobileMenu();
  else if('fullscreen' in d){
    try {
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      dialog.close();
    } catch {
      dialog.close();
      showToast('Trình duyệt chưa thể chuyển chế độ toàn màn hình.',true);
    }
  } else if('panelToggle' in d)setPanelOpen(!layout.hasAttribute('data-panel-open'));
  else if('panelClose' in d)setPanelOpen(false);
  else if('chatToggle' in d&&landscape.matches)setPanelOpen(false);
  else if('workshopTab' in d&&Object.hasOwn(workshopTabs,d.workshopTab)){workshopPage=0;workshopTab=d.workshopTab;render();}
  else if('workshopGo' in d){goTo('workshop');reveal('#world');}
  else if('homeExit' in d){
    world.approach('exit',undefined,()=>interactWithWorld({type:'exit',...maps.home.exits[0]}));
    reveal('#world');
  } else if('recoveryItem' in d){recoveryItem=d.recoveryItem;showRecovery(recoveryKey,{preserve:true});}
  else if('recoveryPage' in d){recoveryPage=Number(d.recoveryPage);showRecovery(recoveryKey,{preserve:true});}
  else if('recoveryBack' in d){recoveryItem=null;showRecovery(recoveryKey,{preserve:true});}
  else if('vital' in d) showRecovery(d.vital);
  else if('restHome' in d)guideHome('stamina');
  else if('recoveryPlace' in d)guideRecovery(d.recoveryPlace);
  else if('recover' in d){
    const key=Object.keys(vitals).find(key=>vitals[key].action===d.recover);
    const previousLabel=el.innerHTML,previousDisabled=el.disabled;
    el.disabled=true;el.textContent=d.recover==='drink'?'Đang uống nước…':d.recover==='eat'?'Đang ăn cơm…':'Đang bắt đầu nghỉ…';
    const success=await perform({action:d.recover});
    if(!success&&el.isConnected){el.innerHTML=previousLabel;el.disabled=previousDisabled;}
    if(dialog.open&&dialog.dataset.recovery===key){
      if(success)dialog.close();
      else {recoveryStamp='';showRecovery(key,{preserve:true});}
    }
  }
  else if('watchHelper' in d){
    if(!state.me.gardenHelperJob){render();return;}
    if(dialog.open)dialog.close();
    if(tab!=='field'||neighborId)goTo('field');else if(landscape.matches)setPanelOpen(false);
    if(world.watchHelper())reveal('#world');else showToast(gardenHelperName+' đã xong việc.');
  }
  else if('playerCamera' in d)world.followPlayer();
  else if('taskTab' in d){taskBookTab=d.taskTab==='journal'?'journal':'tasks';render();}
  else if('taskGroup' in d){taskBookGroup=d.taskGroup;taskDetailPage=0;render();}
  else if('taskBack' in d){taskBookGroup=null;render();}
  else if('taskBookPage' in d){taskBookPage=Number(d.taskBookPage);render();}
  else if('taskDetailPage' in d){taskDetailPage=Number(d.taskDetailPage);render();}
  else if('taskRef' in d){tasks=farmTasks(state,currentTime());const index=tasks.findIndex(t=>taskKey(t)===d.taskRef);if(index>=0)openTask(index);else {render();showToast('Việc này đã thay đổi.');}}
  else if('hireMenu' in d)showHireMenu();
  else if('quickEdit' in d){const form=dialog.querySelector('.quick-garden-form');form.classList.remove('is-confirming');delete form.dataset.confirmed;form.querySelector('.hire-confirm')?.remove();form.querySelector('button[type=submit]').textContent='Xác nhận thuê '+gardenHelperName;}
  else if('quickPage' in d){const form=dialog.querySelector('.quick-garden-form');if(form){form.dataset.page=d.quickPage;updateQuickGarden(form);}}
  else if('quickGarden' in d){if(Object.hasOwn(gardenHelperActions,d.quickGarden)&&!(dialog.open&&dialog.querySelector('.quick-garden-form')?.dataset.operation===d.quickGarden))showQuickGarden(d.quickGarden);}
  else if('quickAll' in d){
    if(busy)return;
    const form=el.form, clear=el.hasAttribute('data-clear-selection');
    let chosen=0;
    for(const input of form.querySelectorAll('[data-garden-plot]')){
      input.checked=!clear&&!input.closest('label').hasAttribute('data-unavailable')&&chosen<gardenHelperLimit;
      if(input.checked)chosen++;
    }
    form.querySelector('#dialog-error').textContent='';
    updateQuickGarden(form);
  }
  else if('task' in d)openTask(Number(d.task));
  else if('panel' in d) {
    const outsidePanel=!farmPanel.contains(el);
    panel=d.panel;render();
    if(outsidePanel)reveal('.control-panel');
    else if(landscape.matches)setPanelOpen(true);
  }
  else if('gardenDecor' in d)showGardenDecor(dialog.contains(el));
  else if('gardenDecorItem' in d)showGardenDecorPlacement(d.gardenDecorItem);
  else if('arrangeGardenDecor' in d){
    if(await perform({action:'arrangeGardenDecor'})&&dialog.open)showGardenDecor(true);
  }
  else if('stowGardenDecor' in d){
    gardenDecorScroll=dialog.querySelector('.garden-decor-list')?.scrollTop??0;
    if(await perform({action:'stowGardenDecor',item:d.stowGardenDecor})&&dialog.open)showGardenDecor(true);
  }
  else if('landTab' in d) {selectedLot=Number(d.landTab);render();}
  else if('landGo' in d) {
    if(tab!=='field'){tab='field';neighborId=null;render();}
    world.approach('land',Number(d.landGo),()=>{});
    reveal('#world');
  }
  else if('openGarden' in d){
    plotGroup=Number(d.openGarden);selected=plotOffset+plotGroup*3;
    goTo('field');
    if(landscape.matches)reveal('#tools');
  }
  else if('openPond' in d){pondTab=Number(d.openPond);panel='ponds';render();}
  else if('visitPond' in d){visitPond=Number(d.visitPond);render();}
  else if('pondGo' in d) {
    if(tab!=='field') {tab='field';neighborId=null;render();}
    world.approach('pond',pondTab,()=>{});
    reveal('#world');
  }
  else if('managePond' in d)showPondManagement(d.managePond,Number(d.pond));
  else if('pondAdopt' in d)showPondAdoption();
  else if('pondFilter' in d){if(['all','ready','hungry'].includes(d.pondFilter)){pondViews.set(pondTab,{filter:d.pondFilter,page:0});render();}}
  else if('pondPage' in d){const view=pondViews.get(pondTab)??{filter:'all',page:0};view.page=Math.max(0,Number(d.pondPage)||0);pondViews.set(pondTab,view);render();}
  else if('pondTab' in d) { pondTab=Number(d.pondTab); render(); }
  else if('fenceInfo' in d)showFenceChoice(d.fenceInfo,Number(d.fenceIndex));
  else if('aquaStock' in d)showPondStock(d.aquaStock);
  else if('manageAnimal' in d)showAnimalManagement(d.manageAnimal);
  else if('sellAnimal' in d)showAnimalManagement(d.sellAnimal,true);
  else if('orderPreview' in d){showTomorrow=!showTomorrow;render();}
  else if('marketPane' in d) { marketPane=d.marketPane; render(); }
  else if('supplyGroup' in d) { marketPages.supplies=0;supplyGroup=d.supplyGroup; render(); }
  else if('seedCrop' in d) showSeedCrop(d.seedCrop);
  else if('villageFund' in d) showVillageFund();
  else if('villageGoods' in d) showVillageGoods(d.villageGoods);
  else if('weather' in d) showWeather();
  else if('room' in d) showRoom();
  else if('avatarMenu' in d) showAvatar();
  else if('musicMenu' in d)showMusic();
  else if('musicMute' in d){
    music.toggleMute();
    el.setAttribute('aria-pressed',String(music.muted));
    el.classList.toggle('primary',music.muted);
    el.classList.toggle('subtle',!music.muted);
  }
  else if('quickAvatar' in d){
    const avatar=el.form.elements.avatar.value;
    if(avatar===state.me.avatar||await perform({action:'avatar',item:avatar}))dialog.close();
  }
  else if('account' in d) showAccountModal('login');
  else if('accountMode' in d) showAccountModal(d.accountMode==='register'?'register':'login');
  else if('accountLogout' in d) {
    const credentials=accountSession;
    accountSession=null;
    store.write(accountKey,null);
    const previous=store.read(previousKey);
    if(previous&&(previous.account||previous.token===credentials?.token))store.write(previousKey,null);
    dialog.close();
    if(session&&(session.account||session.token===credentials?.token))backToDemo();
    try {
      if(credentials)await apiAccount('logout',{},credentials);
      showToast('Đã đăng xuất tài khoản.');
    } catch {
      showToast('Đã thoát trên thiết bị này. Chưa thể kết thúc phiên trên máy chủ.',true);
    }
  }
  else if('info' in d) help();
  else if('plot' in d) {
    selected=Number(d.plot); render();
    reveal('#tools');
  } else if('close' in d) dialog.close();
  else if('visit' in d) visit(d.visit);
  else if('removeMember' in d){
    const neighbor=state.neighbors.find(entry=>entry.id===d.removeMember);
    if(panel!=='members'||!session||!state.canManageMembers||!neighbor||neighbor.id===state.villageOwnerId)return;
    modal('Mời thành viên ra khỏi làng','<p>Vườn, tài sản và các sạp của <strong>'+escape(neighbor.name)+'</strong> sẽ bị xóa khỏi làng sau khi xác nhận.</p>'+
      '<div class="actions">'+btn('Hủy','data-close','subtle')+
      btn('Mời ra','data-confirm-remove-member="'+neighbor.id+'"','danger')+'</div><p id="dialog-error" role="status"></p>');
  } else if('confirmRemoveMember' in d){
    if(panel==='members'&&session&&state.canManageMembers&&await perform({action:'removeMember',target:d.confirmRemoveMember}))dialog.close();
  }
  else if('return' in d) goTo('neighbors');
  else if('villagePage' in d) { villagePage=Number(d.villagePage); render(); }
  else if('stockTab' in d&&Object.hasOwn(stockTabs,d.stockTab)){stockTab=d.stockTab;stockPage=0;render();}
  else if('stockPage' in d){stockPage=Math.max(0,Number(d.stockPage)||0);render();}
  else if('shop' in d) showShop(d.shop,false);
  else if('itemInfo' in d)showItem(d.itemInfo,'stockItem' in d);
  else if('cropGrowth' in d)showCropGrowth(Number(d.cropGrowth));
  else if('meal' in d){
    const previousLabel=el.innerHTML,previousDisabled=el.disabled,originalContent=dialog.firstElementChild;
    el.disabled=true;el.textContent='Đang dùng…';
    const success=await perform({action:'consume',item:d.meal});
    if(success&&dialog.firstElementChild===originalContent)dialog.close();
    else if(!success&&el.isConnected){el.innerHTML=previousLabel;el.disabled=previousDisabled;}
  }
  else if('buyStep' in d){
    const input=el.form.elements.qty;
    const qty=Math.max(0,Math.trunc(input.valueAsNumber||0));
    input.value=Math.min(Number(input.max),qty+Number(d.buyStep));
    updateBuyTotal(input);
  }
  else if('sell' in d) showShop(d.sell,true);
  else if('sellAll' in d) confirmSellAll(d.sellAll);
  else if('confirmSellAll' in d){
    if(await perform({action:'sell',item:d.confirmSellAll,source:'all'}))dialog.close();
  }
  else if('list' in d) listingDialog();
  else if('copy' in d) {
    const link=new URL(location.pathname,location.origin);
    link.searchParams.set('lang',session.code);
    try {
      await navigator.clipboard.writeText(link.href);
      showToast('Đã sao chép liên kết.');
    } catch {
      modal('Mời bạn vào làng','<label>Liên kết mời<input readonly value="'+escape(link.href)+'"></label>');
      dialog.querySelector('input').select();
    }
  } else if('resume' in d) {
    session=store.read(previousKey);
    store.write(sessionKey,session);
    revision=-1;
    dialog.close();
    await refresh(true);
  } else if('backDemo' in d) {
    dialog.close();
    store.write(previousKey,session);
    backToDemo();
  } else if('prankGo' in d){
    selected=Number(d.prankGo);plotGroup=gardenFor(selected);panel='area';goTo('field');
    world.approach('plot',selected,()=>reveal('#tools'));
  } else if('visitPane' in d){
    if(!['take','help','prank','pond'].includes(d.visitPane))return;
    visitPane=d.visitPane;render();
  } else if('visitSource' in d){
    if(!['garden','barn'].includes(d.visitSource))return;
    visitSource=d.visitSource;visitTakePage=0;render();
  } else if('visitTakePage' in d){
    visitTakePage=Number(d.visitTakePage);render();
  } else if('prankPage' in d){
    prankPage=Number(d.prankPage);render();
  } else if('helpPage' in d){
    helpPage=Number(d.helpPage);render();
  } else if('lakeElder' in d){
    if(tab!=='lake'||busy)return;
    if(world.approach(lakeElder.type,undefined,showLakeElder))reveal('#world');
    else showToast('Chưa tìm được đường đến Ông Sáu.',true);
  } else if('elderOpen' in d){
    if(tab!=='lake'||!['shore','book'].includes(d.elderOpen))return;
    dialog.close();lakeTab=d.elderOpen;panel='area';render();reveal('.control-panel');
  } else if('lakeTab' in d){
    lakeTab=d.lakeTab;render();
  } else if('action' in d) {
    const input={action:d.action,item:d.item||''};
    if(d.index!==undefined) input.index=optionalIndex(d.index);
    if(d.qty) input.qty=Number(d.qty);
    if(d.target)input.target=d.target;
    if(d.source)input.source=d.source;
    const fishing=input.action==='cast'||input.action==='reel';
    const livestock=input.action==='feed'||input.action==='collect';
    const aquaculture=input.action==='aquaFeed'||input.action==='aquaHarvest';
    if(fishing||plotWorkActions.has(input.action)||livestock||aquaculture||['helpWater','releasePrank','catchPrank','shoreStart'].includes(input.action)){
      if(busy)return;
      const cast=state.me.fishing.cast;
      const type=fishing
        ?((input.source??cast?.source)==='public'?'public-fishing':'neighbor-fishing')
        :input.action==='shoreStart'?'shore-work':livestock?'animal':aquaculture?'pond':'plot';
      const operation=actionFeedback.start(input.action,session?'online':'demo');
      const started=world.approach(type,input.index??(fishing?cast?.index:undefined),()=>{void perform(input,operation);},{onCancel:()=>operation?.finish('cancelled')});
      if(!started)operation?.finish('unreachable');
      if(!started)showToast(
        fishing?'Hãy đến cầu câu để dùng cần.':
        livestock?'Chưa tìm được đường tới chuồng hoặc vật nuôi.':
        aquaculture?'Chưa tìm được đường tới ao nuôi.':
        'Chưa tìm được đường tới ô đất.',true);
      else if(landscape.matches||matchMedia('(max-width: 860px)').matches)reveal('#world');
      return;
    }
    const success=await perform(input);
    if(success&&input.action==='decorate'&&el.closest('dialog'))dialog.close();
    if(success&&input.action==='animal'&&el.closest('dialog')){dialog.close();selectCoopAnimal(state.me.pens.length-1);render();}
  }
});
function updateMarketSearch(event){
  const pane=event.target.dataset.marketSearch;
  if(!pane)return;
  marketPages[pane]=0;marketQueries[pane]=event.target.value;
  const results=$('[data-market-results]');
  if(results)results.innerHTML=renderMarketResults(state.me,pane);
}
document.addEventListener('compositionstart',event=>{
  if(event.target.matches('[data-market-search]'))composingMarketSearch=true;
});
document.addEventListener('compositionend',event=>{
  if(!event.target.matches('[data-market-search]'))return;
  composingMarketSearch=false;
  updateMarketSearch(event);
});
document.addEventListener('input',updateMarketSearch);
dialog.addEventListener('input',event=>{
  const slider=event.target;
  if(!slider.matches('[data-music-volume]'))return;
  music.setVolume(slider.valueAsNumber);
  dialog.querySelector('output[for="farm-volume"]').value=music.volume+'%';
});
dialog.addEventListener('input',event=>{
  if(event.target.id==='buy-quantity')updateBuyTotal(event.target);
});
dialog.addEventListener('change',event=>{
  if(!event.target.matches('[data-garden-plot],[data-harvest-mode]'))return;
  const form=event.target.form;
  form.querySelector('#dialog-error').textContent='';
  updateQuickGarden(form);
});
document.addEventListener('change',event=>{
  if(!event.target.matches('[data-crop-group]'))return;
  plotGroup=Number(event.target.value);selected=plotGroup<0?0:plotOffset+plotGroup*3;
  render();
});
dialog.addEventListener('submit',async e=>{
  const form=e.target;
  if(!form.dataset.form) return;
  e.preventDefault();
  if(busy) return;
  const values=Object.fromEntries(new FormData(form));
  const button=form.querySelector('button[type="submit"], button:not([type])');
  button.disabled=true;
  const mode=form.dataset.form;
  if(mode==='join') {
    busy=true;
    try {
      const result=await api('join',values,accountSession);
      session={code:result.code,token:result.token,account:!!result.account};
      store.write(sessionKey,session);
      revision=-1;
      selected=0;plotGroup=-1;pondTab=0;selectedLot=0;
      tab='field'; neighborId=null; villagePage=0; panel='area';
      setState(result.state);
      dialog.close();
      render();
      showToast('Bạn đã vào làng '+session.code+'.');
    } catch(error) {
      const inline=$('#dialog-error');
      if(inline) inline.textContent=error.message;
    } finally { busy=false; }
  } else if(mode==='account') {
    busy=true;
    try {
      const method=form.dataset.accountMode==='register'?'register':'login';
      const guest=method==='register'?guestSession():null;
      const result=await apiAccount(method,{username:values.username,password:values.password,roomCode:guest?.code??''},guest);
      const previous=store.read(previousKey);
      if(previous&&(previous.account||previous.token===accountSession?.token))store.write(previousKey,null);
      const switchingAccount=session&&(session.account||session.token===accountSession?.token);
      accountSession={token:result.token,username:result.account.username,accountId:result.account.id};
      store.write(accountKey,accountSession);
      const resumeRoom=result.rooms[0]?.roomCode;
      if(resumeRoom) {
        session={code:resumeRoom,token:result.token,account:true};
        store.write(sessionKey,session);
        revision=-1;
      } else if(switchingAccount)backToDemo();
      dialog.close();
      render();
      showToast(method==='register'?'Đã tạo tài khoản thành công.':'Đăng nhập tài khoản thành công.');
      busy=false;
      if(resumeRoom)await refresh(true);
      if(method==='register')await perform({action:'avatar',item:avatarOf(values.avatar)});
    } catch(error) {
      const inline=$('#dialog-error');
      if(inline) inline.textContent=error.message;
    } finally { busy=false; }
  } else if(mode==='hireGardenHelper'){
    const {ready,plots,space,cost}=updateQuickGarden(form);
    if(!ready)return;
    const confirmation=JSON.stringify([plots,cost,space,values.source??'all']);
    if(form.dataset.confirmed!==confirmation){
      form.dataset.confirmed=confirmation;form.classList.add('is-confirming');form.querySelector('.hire-confirm')?.remove();
      const summary=document.createElement('section');summary.className='hire-confirm';
      summary.innerHTML='<h3>Xác nhận thuê '+gardenHelperName+'</h3><p>'+(form.dataset.operation==='water'?'Tưới cây':'Thu hoạch')+' trên <strong>'+plots.length+'</strong> ô đã chọn.</p><p>Chi phí <strong>'+cost+'</strong> xu · Còn lại <strong>'+(state.me.coins-cost)+'</strong> xu.</p>'+btn('‹ Chọn lại','data-quick-edit','subtle');
      button.before(summary);button.textContent='Đồng ý · '+cost+' xu';button.disabled=false;return;
    }
    button.disabled=true;
    const operation=form.dataset.operation;
    const request={action:'hireGardenHelper',item:operation,plots,expectedSpace:space};
    if(operation==='harvest')request.source=values.source;
    const worked=await perform(request);
    if(worked&&form.isConnected){
      dialog.close();
      const trigger=panelBody.querySelector('[data-quick-garden="'+operation+'"]:enabled')??$('#task-hud button');
      trigger?.focus({preventScroll:true});
    } else if(form.isConnected)updateQuickGarden(form);
    return;
  } else if(mode==='placeGardenDecor'){
    const input={action:mode,item:form.dataset.item,target:values.target};
    if(values.source)input.source=values.source;
    if(await perform(input)&&form.isConnected&&dialog.open)showGardenDecor(true);
  } else if(mode==='avatar'){
    if(await perform({action:'avatar',item:values.avatar}))dialog.close();
  } else if(mode==='moveAnimal'||mode==='sellAnimal'){
    const input={action:mode,target:form.dataset.target};
    if(mode==='moveAnimal')input.index=Number(values.destination);
    if(await perform(input))dialog.close();
  } else if(mode==='villageGoods'){
    if(await perform({action:mode,item:form.dataset.item,index:Number(form.dataset.index),qty:Number(values.qty)}))dialog.close();
  } else {
    const success=await perform({action:mode,item:values.item??form.dataset.item,...(mode==='villageFund'?{amount:Number(values.amount)}:{qty:Number(values.qty)}),...(mode==='list'?{price:Number(values.price)}:{}),...(mode==='aquaStock'?{index:Number(form.dataset.pond)}:{})});
    if(success) dialog.close();
  }
  button.disabled=false;
});
const requested=new URL(location.href).searchParams.get('lang')?.toUpperCase();
if(requested&&/^[A-F0-9]{8}$/.test(requested)) inviteCode=requested;
await refresh(true);
if(!session) showRoom();
initialScreenReady=true;
renderReturnSummary();
dialog.addEventListener('close',()=>queueMicrotask(renderReturnSummary));
setInterval(()=>{
  if(!state||document.hidden) return;
  const now=currentTime();
  const cast=state.me.fishing.cast;
  const justReached=time=>time>lastPanelTime&&time<=now;
  const fishingBoundary=[cast?.ready,cast?cast.expires+1:undefined,state.me.fishing.nextAt].some(justReached);
  const visitedJob=neighborId&&state.neighbors.find(neighbor=>neighbor.id===neighborId)?.gardenHelperJob;
  const helperBoundary=[state.me.gardenHelperJob,visitedJob].some(job=>job?.steps.some(step=>justReached(step.doneAt)));
  if(!busy&&(helperBoundary||fishingBoundary&&(tab==='lake'||neighborId))){
    if(session)void refresh();
    else {updateDemo();render();}
  }
  const restEnds=state.me.wellness.restUntil;
  if(!busy&&restEnds>lastPanelTime&&restEnds<=now)render();
  if(dialog.open&&recoveryKey&&!busy)showRecovery(recoveryKey,{preserve:true});
  const restCountdown=dialog.querySelector('[data-rest-countdown]');
  if(dialog.open&&restCountdown&&Number(restCountdown.dataset.until)<=now)showRecovery('stamina');
  document.querySelectorAll('[data-until]').forEach(node=>node.textContent=duration(Number(node.dataset.until)-now));
  document.querySelectorAll('[data-clock]').forEach(node=>node.textContent=duration((node.dataset.clock==='day'?state.dayEnds:state.next)-now));
},1000);
setInterval(()=>{ if(!document.hidden) refresh(); },4000);
setInterval(()=>{
  if(!state?.me.shoreJob||busy)return;
  const away=document.hidden||tab!=='lake'||world.position().walking||locationBlock({action:'shoreTick'});
  if(away){void perform({action:'shoreCancel'});return;}
  if(Date.now()-lastShorePulse<1900)return;
  lastShorePulse=Date.now();
  void perform({action:'shoreTick'});
},250);
window.addEventListener('focus',()=>refresh());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});
