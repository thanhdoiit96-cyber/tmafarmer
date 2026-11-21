// Routes stay in the open foreground, below the baked stall counters.
export const marketShoppers=[
  {id:'basket-aunt',row:0,x:58,y:195,end:125,phase:0},
  {id:'bag-uncle',row:1,x:326,y:199,end:420,phase:9},
  {id:'hat-aunt',row:2,x:320,y:254,end:394,phase:18},
];
export function marketShopperPose(shopper,time,reduced=false){
  const speed=12,travel=(shopper.end-shopper.x)/speed,rest=3.5;
  const duration=travel+rest,cycle=duration*2;
  const at=reduced?0:((time+shopper.phase)%cycle+cycle)%cycle;
  const returning=at>=duration,local=at%duration;
  const walking=local<travel&&!reduced,distance=Math.min(local,travel)*speed;
  return {...shopper,x:returning?shopper.end-distance:shopper.x+distance,
    facing:returning?-1:1,walking,frame:walking?[0,2,0,3][Math.floor(distance/3)%4]:Math.floor(local*1.3)%2};
}
