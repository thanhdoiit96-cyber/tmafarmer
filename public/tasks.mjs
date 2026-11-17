import {plotOffset,pondOffset} from './land.mjs';
import {animals,cropGoal,productGoal} from './game.mjs';
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
    const plot=index<plotOffset?me.plots[index]:me.extraPlots[index];
    const label=index<plotOffset?'Ô '+(index+1):'Vườn ô '+(Math.floor((index-plotOffset)/3)+1)+' · luống '+((index-plotOffset)%3+1);
    const task=!plot?(me.soilCompactsAt?.[index]<=now?['care','Cuốc đất']:null):
      plot.progress>=cropGoal(plot)?['ready','Thu hoạch']:
      plot.pests>=(highRisk?12:15)&&plot.protectedUntil<=now?['urgent','Trị sâu']:
      !weather.wet&&plot.wetUntil<=now?['care','Tưới nước']:null;
    if(task)tasks.push({type:task[0],title:task[1],label,kind:'plot',index});
  }
  me.pens.forEach((pen,index)=>{
    const task=pen.progress>=productGoal(pen)?['ready',animals[pen.kind].oneTime?'Xuất chuồng lợn':'Thu sản phẩm']:pen.fedUntil<=now?['urgent','Cho vật nuôi ăn']:null;
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
