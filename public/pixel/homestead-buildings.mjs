// World footprints shared by rendering, collisions and interaction placement.
export const homesteadWorkshop={
  x:115,y:392,w:110,h:88,
  source:'/pixel/homestead-workshop-v3.png',
};
export const parcelShelter={
  x:48,y:47,w:80,h:44,
  source:'/pixel/parcel-shelter-v3.png',
};
export const parcelAnimalSeats=[53,139];
export const parcelAnimalBaseline=87;
export const parcelAnimalRoam=[18,20];
// Expanded yards retain the approved shelter; two rear seats clear its right
// edge, two front seats stay below it. Small rear roam avoids body overlap.
export const expandedParcelAnimalSeats=[
  {x:113,y:52,roam:1},{x:163,y:52,roam:1},
  {x:42,y:90,roam:10},{x:124,y:90,roam:12},
];
