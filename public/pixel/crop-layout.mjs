import {cropStage} from '../game.mjs';
import {cropStagesAtlas,pixelSlice,pixelViewport,progressionCropAtlas} from './frames.mjs';
import {size} from '../world-layout.mjs';

const unit=size.width/pixelViewport.width;
const snap=value=>Math.round(value/unit)*unit;

export const cropGrowthLabels={
  wheat:['Mầm lúa','Lá non','Trổ bông','Bông vàng'],
  carrot:['Mầm cà rốt','Tán lá non','Nhú củ','Củ lớn'],
  corn:['Mầm bắp','Thân non','Trổ cờ','Bắp đầy'],
  tomato:['Cây mầm','Lên tán lá','Hoa và quả xanh','Quả đỏ'],
  sunflower:['Cây mầm','Vươn thân','Nụ hoa','Hoa nở'],
  strawberry:['Lá non','Xòe tán','Hoa và quả non','Dâu đỏ'],
  grape:['Mầm nho','Leo giàn','Chùm xanh','Chùm tím'],
  tea:['Mầm trà','Cây non','Bụi trà','Búp trà non'],
  truffle:['Nấm mới nhú','Nấm non','Cụm nấm lớn','Nấm già'],
  sweetPotato:['Mầm non','Xòe lá','Dây ra hoa','Củ lớn'],
  pumpkin:['Mầm non','Dây leo','Nở hoa','Bí chín'],
  peanut:['Mầm non','Cây non','Ra hoa','Quả già'],
  coffee:['Mầm cà phê','Lá non','Ra quả xanh','Quả chín'],
  lotus:['Mầm sen','Lá nổi','Nụ sen','Gương sen'],
  dragonfruit:['Mầm thanh long','Thân leo','Nụ hoa','Quả chín'],
  blackRice:['Mầm nếp cẩm','Lá non','Trổ bông tím','Bông chín'],
};
export function cropFrame(kind,stage){
  const original=Object.hasOwn(pixelSlice.crops,kind);
  const progression=Object.hasOwn(progressionCropAtlas.crops,kind);
  const atlas=original?pixelSlice:progression?progressionCropAtlas:cropStagesAtlas;
  const source=atlas.source;
  const {cell,crops}=atlas;
  if(!Object.hasOwn(crops,kind))return cropGrowthLabels[kind]?{
    procedural:true,source:'',x:0,y:0,bounds:[[16,26,32,40],[12,19,36,40],[8,11,40,40],[4,5,44,40]][stage],
  }:null;
  const crop=crops[kind];
  return {source,x:(original?crops.x:0)+stage*(cell??crops.cell),y:original?crop.y:progression?crop.row*cell:crop.y,bounds:crop.bounds[stage]};
}
export function cropPlacement({x,y,data,visit}){
  if(!data||!Object.hasOwn(cropGrowthLabels,data.kind))return null;
  const stage=visit?(data.stage??(data.ripe?3:2)):cropStage(data);
  const frame=cropFrame(data.kind,stage);
  if(!frame)return null;
  const [left,top,right,bottom]=frame.bounds;
  const w=right-left,h=bottom-top;
  return {source:frame.source,procedural:frame.procedural,sx:frame.x+left,sy:frame.y+top,w,h,
    x:snap(x-w*unit/2),y:snap(y+6-h*unit),width:w*unit,height:h*unit};
}

export function cropTaskPosition(plot){
  const {x,y,data}=plot;
  const art=cropPlacement(plot);
  return {x,y:Math.min(y-(data?27:23),(art?.y??y-17)-8)};
}
