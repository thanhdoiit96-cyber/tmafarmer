const labels={till:'Cuốc đất',plant:'Gieo hạt',water:'Tưới cây',weed:'Nhổ cỏ',spray:'Xịt thuốc',fertilize:'Bón phân',harvest:'Thu hoạch',feed:'Cho ăn',collect:'Thu sản phẩm',aquaFeed:'Cho thủy sản ăn',aquaHarvest:'Thu thủy sản',drink:'Uống nước',eat:'Ăn cơm nắm'};
export function createActionFeedback(node,{clock=()=>performance.now()}={}){
  const records=[];let current;
  function paint(op,text){if(current!==op)return;if(node){node.hidden=!text;if(node.textContent!==text)node.textContent=text;node.dataset.phase=op.phase;}}
  function start(action,mode){
    if(!labels[action])return null;
    if(current)current.finish('cancelled');
    const started=clock(),record={action,mode,stages:{},requests:[]};
    const op={phase:'walking',
      stage(name){record.stages[name]=Math.max(0,clock()-started);op.phase=name;paint(op,(name==='walking'?'Đang tới vị trí · ':name==='retry'?'Đang thử kết nối lại · ':'Đang thực hiện · ')+labels[action]);},
      request(path,entry){record.requests.push({path,...entry});},
      finish(outcome){
        if(record.outcome)return;
        record.outcome=outcome;record.totalMs=Math.max(0,clock()-started);
        const stages=record.stages;
        record.durations={travelMs:stages.arrived??null,
          positionQueueMs:stages.positionQueueReady===undefined?null:Math.max(0,stages.positionQueueReady-stages.arrived),
          sceneRequestMs:record.requests.filter(r=>r.path==='scene').reduce((n,r)=>n+r.requestMs,0),
          actionRequestMs:record.requests.filter(r=>r.path==='action').reduce((n,r)=>n+r.requestMs,0),
          renderMs:stages.rendered===undefined?null:Math.max(0,stages.rendered-stages.render)};
        records.push(record);if(records.length>40)records.shift();paint(op,'');if(current===op)current=null;
      },
    };
    current=op;op.stage('walking');return op;
  }
  return {start,recent:()=>structuredClone(records),clear:()=>{records.length=0;}};
}

export function requestTiming(start,end,response){
  const requestMs=Math.max(0,end-start),header=response?.headers.get('server-timing')??'';
  const metric=name=>{const m=header.match(new RegExp('(?:^|,)\\s*'+name+';dur=([\\d.]+)'));return m?Number(m[1]):null;};
  const serverMs=metric('app'),databaseMs=metric('db');
  return {requestMs,status:response?.status??0,serverMs,databaseMs,
    outsideServerMs:serverMs===null?null:Math.max(0,requestMs-serverMs)};
}
