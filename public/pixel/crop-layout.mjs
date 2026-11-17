import {cropGoal} from '../game.mjs';
import {pixelSlice,pixelViewport} from './frames.mjs';
import {size} from '../world-layout.mjs';

const unit=size.width/pixelViewport.width;
const snap=value=>Math.round(value/unit)*unit;

export function cropPlacement({x,y,data,visit}){
  const {crops}=pixelSlice,crop=crops[data?.kind];
  if(!crop?.bounds)return null;
  const growth=visit?(data.ripe?1:.5):data.progress/cropGoal(data);
  const stage=Math.max(0,Math.min(crop.bounds.length-1,Math.floor(growth*crop.bounds.length)));
  const [left,top,right,bottom]=crop.bounds[stage];
  const w=right-left,h=bottom-top;
  return {sx:192+stage*crops.cell+left,sy:crop.y+top,w,h,
    x:snap(x-w*unit/2),y:snap(y+6-h*unit),width:w*unit,height:h*unit};
}

export function cropTaskPosition(plot){
  const {x,y,data}=plot;
  const art=cropPlacement(plot);
  return {x:x+(data?17:0),y:Math.min(y-(data?27:23),(art?.y??y-17)-8)};
}
