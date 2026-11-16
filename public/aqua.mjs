export const aquatic = {
  tilapia:{name:'Cá rô phi', seed:'tilapiaSeed', time:20*60, yield:5, food:1},
  prawn:{name:'Tôm càng', seed:'prawnSeed', time:35*60, yield:5, food:2},
  carp:{name:'Cá chép', seed:'carpSeed', time:55*60, yield:4, food:2},
};
export const fishing = { wait:6, window:55, cooldown:45, limit:12 };
export const pondKinds = [
  {name:'Ao cá', species:['tilapia','carp']},
  {name:'Ao tôm', species:['prawn']},
];
export const aquaGoods = {
  tilapiaSeed:{name:'Cá rô phi giống', icon:'🐟', buy:12},
  prawnSeed:{name:'Tôm càng giống', icon:'🦐', buy:22},
  carpSeed:{name:'Cá chép giống', icon:'🐟', buy:28},
  aquaFeed:{name:'Thức ăn thủy sản', icon:'🥣', buy:5},
  minnow:{name:'Cá nhỏ', icon:'🐟', sell:3},
  tilapia:{name:'Cá rô phi', icon:'🐟', sell:8},
  prawn:{name:'Tôm càng', icon:'🦐', sell:12},
  carp:{name:'Cá chép', icon:'🐟', sell:17},
  goldenCarp:{name:'Cá chép vàng', icon:'🐠', sell:55},
};

export function projectPond(batch, now, eachWeather) {
  if (!batch) return null;
  const next={...batch};
  const def=aquatic[batch.kind];
  next.progress=Math.min(next.progress,def.time);
  eachWeather(batch.at,Math.min(now,batch.fedUntil),(weather,from,to)=>{
    next.progress=Math.min(def.time,next.progress+(to-from)*weather.water);
  });
  next.at=now;
  return next;
}

export function fishingState(farm, day, now) {
  const history=farm.fishing;
  const cast=history?.cast;
  return {
    used:history?.day===day?history.used:0,
    nextAt:history?.nextAt??0,
    cast:cast&&now<=cast.expires?cast:null,
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
