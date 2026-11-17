export const pixelCharacter={
  source:'/pixel/characters-v2.png',cellWidth:24,cellHeight:32,columns:16,
  directions:{down:0,up:1,left:2,right:3},
  states:{idle:{first:0,frames:4,fps:3},walk:{first:4,frames:6,fps:10},work:{first:10,frames:6,fps:8}},
};
export const pixelSlice={
  source:'/pixel/vertical-slice-v2.png',house:{x:0,y:0,w:96,h:80},
  crops:{wheat:{x:96,y:0},carrot:{x:96,y:24},corn:{x:96,y:48},cell:24,stages:4},
  chicken:{x:192,y:0,cell:24,columns:8,states:{idle:{first:0,frames:4,fps:3},walk:{first:4,frames:4,fps:8},peck:{first:8,frames:4,fps:6}}},
};
