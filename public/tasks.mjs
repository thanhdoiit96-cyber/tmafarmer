import {mainPlotSlot,plotAt,gardenForPlot,gardenPlotSlot,pondOffset} from './land.mjs';
import {animals,cropGoal,goods,productGoal} from './game.mjs';
import {aquatic,pondReady,visiblePondBatches} from './aqua.mjs';

export const taskStyles={
  urgent:{color:'#aa493a',mark:'!'},
  ready:{color:'#266746',mark:'✓'},
  care:{color:'#3e6d94',mark:'+'},
};
export function farmTasks(snapshot,now=snapshot.now){
  const {me,weather}=snapshot, tasks=[];
  const highRisk=weather.wet||snapshot.afterRainUntil>now;
  for(const index of me.plotIndexes){
    const plot=plotAt(me,index);
    const slot=mainPlotSlot(index);
    const label=slot>=0?'Ô '+(slot+1):'Vườn ô '+(gardenForPlot(index)+1)+' · luống '+(gardenPlotSlot(index)+1);
    const task=!plot?(me.soilCompactsAt?.[index]<=now?['care','Cuốc đất']:null):
      plot.progress>=cropGoal(plot)?['ready','Thu hoạch']:
      (plot.weeds??0)>=(highRisk?12:15)?['urgent','Nhổ cỏ']:
      plot.pests>=(highRisk?12:15)&&plot.protectedUntil<=now?['urgent','Trị sâu']:
      !weather.wet&&plot.wetUntil<=now?['care','Tưới nước']:null;
    if(task)tasks.push({type:task[0],title:task[1],label:plot?label+' · '+goods[plot.kind].name:label,kind:'plot',index});
  }
  me.pens.forEach((pen,index)=>{
    const animal=animals[pen.kind];
    const task=pen.progress>=productGoal(pen)?['ready',animal.oneTime?'Xuất chuồng '+animal.name.toLowerCase():'Thu '+goods[animal.product].name.toLowerCase()]:
      pen.fedUntil<=now?['urgent','Cho '+animal.name.toLowerCase()+' ăn']:null;
    if(task)tasks.push({type:task[0],title:task[1],label:pen.lot===undefined?'Chuồng chính':'Chuồng ô '+(pen.lot+1),kind:'animal',index,lot:pen.lot});
  });
  for(const index of me.pondIndexes){
    const label=index===0?'Ao nuôi chính':'Ao ô '+(index-pondOffset+1);
    for(const batch of visiblePondBatches(me,index)){
      const name=aquatic[batch.kind].name.toLowerCase();
      const task=pondReady(batch)?['ready','Thu '+name]:batch.fedUntil<=now?['urgent','Cho '+name+' ăn']:null;
      if(task)tasks.push({type:task[0],title:task[1],label,kind:'pond',index});
    }
  }
  const priority={urgent:0,ready:1,care:2};
  return tasks.sort((a,b)=>priority[a.type]-priority[b.type]);
}
