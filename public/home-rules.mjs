export const houseDoor={x:110,y:87};
export const homeBed={x:395,y:165};
export const homeSpawn=[238,242];

export function atHomeBed(location){
  return location?.area==='home'&&Math.hypot(location.x-homeBed.x,location.y-homeBed.y)<=32;
}
