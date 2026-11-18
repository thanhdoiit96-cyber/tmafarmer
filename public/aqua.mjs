export const aquatic = {
  tilapia:{name:'Cá rô phi', seed:'tilapiaSeed', time:20*60, yield:5, food:1},
  prawn:{name:'Tôm càng', seed:'prawnSeed', time:35*60, yield:5, food:2, canFish:false},
  carp:{name:'Cá chép', seed:'carpSeed', time:55*60, yield:4, food:2},
  snakehead:{name:'Cá lóc',seed:'snakeheadSeed',time:65*60,yield:4,food:2,xp:90},
  catfish:{name:'Cá trê',seed:'catfishSeed',time:85*60,yield:4,food:3,xp:170},
  fieldCrab:{name:'Cua đồng',seed:'fieldCrabSeed',time:105*60,yield:3,food:3,xp:260,barn:2,canFish:false},
};
export const fishing = { wait:6, window:55, cooldown:45, limit:12 };
export const aquaGoods = {
  tilapiaSeed:{name:'Cá rô phi giống', icon:'🐟', buy:12},
  prawnSeed:{name:'Tôm càng giống', icon:'🦐', buy:22},
  carpSeed:{name:'Cá chép giống', icon:'🐟', buy:28},
  snakeheadSeed:{name:'Cá lóc giống',icon:'🐟',buy:35,illustration:'snakehead'},
  catfishSeed:{name:'Cá trê giống',icon:'🐟',buy:48,illustration:'catfish'},
  fieldCrabSeed:{name:'Cua đồng giống',icon:'🦀',buy:62,illustration:'fieldCrab'},
  aquaFeed:{name:'Thức ăn thủy sản', icon:'🥣', buy:5},
  minnow:{name:'Cá nhỏ', icon:'🐟', sell:3},
  tilapia:{name:'Cá rô phi', icon:'🐟', sell:8},
  prawn:{name:'Tôm càng', icon:'🦐', sell:12},
  carp:{name:'Cá chép', icon:'🐟', sell:17},
  snakehead:{name:'Cá lóc',icon:'🐟',sell:22,illustration:'snakehead'},
  catfish:{name:'Cá trê',icon:'🐟',sell:31,illustration:'catfish'},
  fieldCrab:{name:'Cua đồng',icon:'🦀',sell:39,illustration:'fieldCrab'},
  goldenCarp:{name:'Cá chép vàng', icon:'🐠', sell:55},
};

const speciesBySeed=Object.fromEntries(Object.entries(aquatic).map(([kind,def])=>[def.seed,kind]));

export function aquaRequirement(farm,kind){
  if(!Object.hasOwn(aquatic,kind))return 'Con giống không hợp lệ.';
  const def=aquatic[kind];
  if((farm.xp??0)<(def.xp??0))return 'Cần '+def.xp+' XP.';
  if((farm.barn??1)<(def.barn??1))return 'Cần Kho cấp '+def.barn+'.';
  return '';
}

export function aquaSupplyRequirement(farm,item){
  return Object.hasOwn(speciesBySeed,item)?aquaRequirement(farm,speciesBySeed[item]):'';
}

export function canCatch(batch){
  return aquatic[batch.kind].canFish!==false&&pondReady(batch)&&pondYield(batch)>=3;
}

export function projectPond(batch, now, eachWeather) {
  const next={...batch,count:batch.count??1,picked:batch.picked??0};
  const def=aquatic[batch.kind];
  next.progress=Math.min(next.progress,def.time);
  eachWeather(batch.at,Math.min(now,batch.fedUntil),(weather,from,to)=>{
    next.progress=Math.min(def.time,next.progress+(to-from)*weather.water);
  });
  next.at=now;
  return next;
}

export const pondReady=batch=>batch.progress>=aquatic[batch.kind].time;
export const pondYield=batch=>aquatic[batch.kind].yield*(batch.count??1)-(batch.picked??0);
export const pondFood=batch=>aquatic[batch.kind].food*(batch.count??1);
export function visiblePondBatches(farm,index){
  const batch=farm?.ponds?.[index];
  return farm?.pondBatches?.[index]??(Array.isArray(batch)?batch:batch?[batch]:[]);
}

export function fishingState(farm, day, now) {
  const history=farm.fishing;
  const cast=history?.cast;
  return {
    used:history?.day===day?history.used:0,
    nextAt:history?.nextAt??0,
    cast:cast&&now<=cast.expires
      ?cast.source==='pond'&&cast.index===1?{...cast,index:0}:cast
      :null,
  };
}

export function catchOdds(weather) {
  return weather.id==='rain'?4:weather.id==='fog'?2:3;
}

export function publicCatch(roll, weather) {
  const rare=catchOdds(weather);
  if(roll<rare/100)return 'goldenCarp';
  return roll<(rare+12)/100?'tilapia':'minnow';
}
