// A single notice slot: no stacks and no repeated-message timer extension.
export function createNotices(node,{setTimer=setTimeout,clearTimer=clearTimeout,now=()=>performance.now()}={}){
  let hideTimer,clearTextTimer,current;
  function show(message,error=false){
    const text=String(message??'').trim();if(!text)return;
    if(current&&current.until>now()){
      if(current.text===text&&current.error===error)return;
      if(current.error&&!error)return;
    }
    clearTimer(hideTimer);clearTimer(clearTextTimer);
    const duration=error?Math.min(6000,3800+text.length*12):text.length>85?2600:1800;
    current={text,error,until:now()+duration};
    node.textContent=text;node.className='show'+(error?' error':'');
    hideTimer=setTimer(()=>{
      node.className='leaving'+(error?' error':'');current=null;
      clearTextTimer=setTimer(()=>{node.textContent='';node.className='';},180);
    },duration);
  }
  return {show};
}
