import {crops,cropWeatherEffect,dryGrowthFactor} from './game.mjs';

// Yield weather effects accumulate during growth; the weather row describes
// the current conditions, not a promise of final harvest yield.
export function cropImpacts(plot,weather,outlook){
  const effect=cropWeatherEffect(plot.kind,weather.id);
  const change=factor=>Math.round((factor-1)*100);
  return [
    {label:'Thời tiết · '+weather.name,growth:change(weather.crop*effect.growth),yield:change(effect.yield)},
    {label:outlook.wet?'Đất ẩm':'Đất khô',growth:change(outlook.wet?1.38:dryGrowthFactor),yield:0},
    {label:(plot.hazard==='weeds'?'Cỏ dại':'Sâu')+(outlook.lost?' · đã tích lũy':''),growth:outlook.pressure>=40?-32:0,yield:-Math.round(outlook.lost/outlook.potential*100)},
    {label:plot.fertilized?'Đã bón phân':'Chưa bón phân',growth:plot.fertilized?30:0,yield:plot.fertilized?Math.round(100/crops[plot.kind].yield):0},
    ...(outlook.prank?[{label:'Sâu nghịch · tạm thời',growth:-10,yield:0}]:[]),
  ];
}
