import {mainPlotSlot,plotAt,gardenForPlot,gardenPlotSlot,pondOffset} from './land.mjs';
import {animals,cropGoal,goods,productGoal} from './game.mjs';
import {aquatic,pondReady,visiblePondBatches} from './aqua.mjs';

export const taskStyles={
  urgent:{color:'#aa493a',mark:'!'},
  ready:{color:'#266746',mark:'✓'},
  care:{color:'#3e6d94',mark:'+'},
};
// Keep task priority independent from its visual meaning.
export function taskIcon(task){
  if(task.kind==='animal')return task.type==='ready'?'animalHarvest':task.type==='urgent'?'feed':null;
  if(task.kind!=='plot')return null;
  return {'Cuốc đất':'till','Thu hoạch':'harvest','Nhổ cỏ':'weeds','Trị sâu':'pests','Tưới nước':'water'}[task.title]??null;
}
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
    if(task)tasks.push({type:task[0],title:task[1],label:pen.lot===undefined?'Chuồng chính':'Chuồng ô '+(pen.lot+1),kind:'animal',index,lot:pen.lot,target:String(pen.id??index)});
  });
  for(const index of me.pondIndexes){
    const label=index===0?'Ao nuôi chính':'Ao ô '+(index-pondOffset+1);
    for(const batch of visiblePondBatches(me,index)){
      const name=aquatic[batch.kind].name.toLowerCase();
      const task=pondReady(batch)?['ready','Thu '+name]:batch.fedUntil<=now?['urgent','Cho '+name+' ăn']:null;
      if(task)tasks.push({type:task[0],title:task[1],label,kind:'pond',index,batch:batch.kind});
    }
  }
  const priority={urgent:0,ready:1,care:2};
  return tasks.sort((a,b)=>priority[a.type]-priority[b.type]);
}

export function taskKey(task){return [task.kind,task.kind==='animal'?task.target:task.index,task.batch??'',task.type,task.title].join(':');}
export function taskGroups(tasks){
  const groups=new Map();
  for(const task of tasks){
    const key=task.kind+':'+(task.kind==='plot'?task.title:task.type);
    if(!groups.has(key))groups.set(key,{key,type:task.type,
      title:task.kind==='plot'?({'Thu hoạch':'Thu cây','Tưới nước':'Tưới cây'}[task.title]??task.title):
        task.kind==='animal'?(task.type==='ready'?'Thu sản phẩm':'Cho ăn'):(task.type==='ready'?'Thu thủy sản':'Cho thủy sản ăn'),
      unit:task.kind==='plot'?'ô cây':task.kind==='animal'?'vật nuôi':'lứa',
      icon:taskIcon(task),tasks:[]});
    groups.get(key).tasks.push(task);
  }
  return [...groups.values()];
}
