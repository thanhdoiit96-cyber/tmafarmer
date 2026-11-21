// Registration for the authored coop plate. These are visual positions only;
// animal ownership, IDs and capacity continue to come from farm.pens/coop.
export const coopSize={width:480,height:288};
export const coopGate=[240,268];
export const coopBarn={x:240,y:120,w:352,h:114};
export const coopFeed={x:316,y:118,w:40,h:14};
export const coopYards=[{x:35,y:141,w:180,h:82},{x:265,y:141,w:180,h:82}];
const columns=[102,378,146,334,58,422,190,290];
export function coopPosition(index){
  return {x:columns[index%8],y:index<8?167.5:221.5};
}
export const coopAnimalRoam=()=>0;
export const coopAnimalScale=kind=>['chicken','duck','quail'].includes(kind)?1.1:.76;
export const coopWalkRows=[167.5,194.5,221.5];
export const coopWalkColumns=[[58,102,146,190],[290,334,378,422]];
