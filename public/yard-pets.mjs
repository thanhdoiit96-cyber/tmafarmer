// Cosmetic yard companions; these never consume livestock capacity or saved stock.
export const yardPets=[
  {species:'dog',w:28,h:24,speed:9,pause:2.1,offset:0,rest:3,source:'/pixel/yard-dog-v1.png',
    path:[[164,243],[184,249],[205,265],[205,288],[181,280],[160,260]]},
  {species:'cat',w:24,h:21,speed:7,pause:2.8,offset:7,rest:1,source:'/pixel/yard-cat-v1.png',
    path:[[154,198],[176,198],[191,210],[173,217],[152,210]]},
  {species:'chicken',w:16,h:15,speed:8,pause:2.4,offset:13,rest:3,
    path:[[142,282],[151,287],[158,296],[142,298],[137,289]]},
];
export function yardPetPose(species,time,reduced=false){
  const pet=yardPets.find(p=>p.species===species);
  const [x,y]=pet.path[0];
  if(reduced){const [rx,ry]=pet.path[pet.rest];return {x:rx,y:ry,motion:{state:'idle',facing:1,distance:0,elapsed:0}};}
  const segments=pet.path.map((from,i)=>{
    const to=pet.path[(i+1)%pet.path.length];
    const length=Math.hypot(to[0]-from[0],to[1]-from[1]);
    return {from,to,length,travel:length/pet.speed};
  });
  const duration=segments.reduce((sum,s)=>sum+s.travel+pet.pause,0);
  let phase=((time+pet.offset)%duration+duration)%duration;
  for(const {from,to,length,travel} of segments){
    const facing=to[0]>=from[0]?1:-1;
    if(phase<travel){
      const progress=(1-Math.cos(phase/travel*Math.PI))/2;
      return {x:from[0]+(to[0]-from[0])*progress,y:from[1]+(to[1]-from[1])*progress,
        motion:{state:'walk',facing,distance:length*progress,elapsed:phase}};
    }
    if(phase<travel+pet.pause){
      const elapsed=phase-travel;
      return {x:to[0],y:to[1],motion:{state:elapsed>pet.pause*.25&&elapsed<pet.pause*.8?(species==='chicken'?'peck':'sniff'):'idle',facing,distance:0,elapsed}};
    }
    phase-=travel+pet.pause;
  }
  return {x,y,motion:{state:'idle',facing:1,distance:0,elapsed:0}};
}
