// Native scrolling stays in control. This persistent rail also works when the OS hides native scrollbars.
export function installScrollIndicators(){
  const targets=[document.querySelector('.panel-body'),document.querySelector('#dialog')].filter(Boolean);
  const rails=new Map();let frame;
  const update=()=>{
    frame=null;
    for(const target of targets){
      let rail=rails.get(target);
      if(!rail||!rail.isConnected){
        rail=document.createElement('div');rail.className='ui-scroll-rail';rail.setAttribute('aria-hidden','true');
        rail.innerHTML='<span></span>';(target.tagName==='DIALOG'?target:document.body).append(rail);rails.set(target,rail);
      }
      const r=target.getBoundingClientRect(),overflow=target.scrollHeight-target.clientHeight;
      const visible=r.width>0&&r.height>0&&overflow>1&&(target.tagName!=='DIALOG'||target.open);
      rail.hidden=!visible;if(!visible)continue;
      const top=Math.max(0,r.top+8),bottom=Math.min(innerHeight,r.bottom-8),height=Math.max(0,bottom-top);
      const thumb=Math.min(height,Math.max(18,height*target.clientHeight/target.scrollHeight));
      Object.assign(rail.style,{left:Math.min(innerWidth-5,r.right-6)+'px',top:top+'px',height:height+'px'});
      Object.assign(rail.firstElementChild.style,{height:thumb+'px',transform:'translateY('+Math.max(0,Math.min(1,target.scrollTop/overflow))*(height-thumb)+'px)'});
    }
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const observer=new MutationObserver(changes=>{
    if(changes.some(m=>!m.target.closest?.('.ui-scroll-rail')&&!(m.type==='childList'&&[...m.addedNodes,...m.removedNodes].every(n=>n.nodeType===1&&n.matches('.ui-scroll-rail')))))schedule();
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['open','hidden','class']});
  const resize=new ResizeObserver(schedule);targets.forEach(t=>resize.observe(t));
  document.addEventListener('scroll',schedule,true);document.addEventListener('toggle',schedule,true);window.addEventListener('resize',schedule);
  document.fonts?.ready.then(schedule);schedule();
}
