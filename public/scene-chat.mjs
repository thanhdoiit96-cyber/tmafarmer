export function createSceneChat({api,world,showToast,context}){
  const toggle=document.querySelector('[data-chat-toggle]');
  const drawer=document.querySelector('#scene-chat');
  const messages=drawer.querySelector('[data-chat-messages]');
  const form=drawer.querySelector('form');
  const input=form.elements.message;
  const status=drawer.querySelector('[data-chat-status]');
  const count=document.querySelector('[data-scene-count]');
  let current, stamp='', busy=false, queued=false, chatKey='', seen=0, unread=0, initialized=false;
  const where=value=>value?.session?value.session.token+'/'+value.area+'/'+(value.host??''):'';
  function updateCount(total){
    count.textContent=total?total+' cùng khu':'';
    count.hidden=!total;
    toggle.querySelector('span').textContent=unread?'Chat ('+Math.min(99,unread)+')':'Chat';
  }
  let present=0;
  function applyResult(result){
    world.setPeers(result.players);
    present=result.players.length;
    const last=result.messages.at(-1)?.id??0;
    if(initialized&&last>seen&&drawer.hidden)unread+=result.messages.filter(msg=>msg.id>seen).length;
    if(last<seen)return;
    seen=Math.max(last,seen);initialized=true;
    updateCount(present);
    status.textContent=present?present+' người khác đang ở đây':'Bạn đang ở đây một mình';
    const signature=result.messages.map(m=>m.id).join(',');
    if(chatKey===signature)return;
    chatKey=signature;
    const atEnd=messages.scrollHeight-messages.scrollTop-messages.clientHeight<34;
    messages.replaceChildren();
    for(const message of result.messages){
      const row=document.createElement('li'), author=document.createElement('strong'), text=document.createTextNode(message.text);
      author.textContent=message.name;
      row.append(author,text);
      messages.append(row);
    }
    if(!result.messages.length){
      const row=document.createElement('li');row.textContent='Chưa có tin nhắn trong khu này.';messages.append(row);
    }
    if(atEnd)messages.scrollTop=messages.scrollHeight;
  }
  function sessionChanged(){
    const next=context();
    const key=where(next);
    if(stamp===key)return;
    current=next;stamp=key;seen=0;unread=0;present=0;chatKey='-';initialized=false;
    world.setPeers([]);
    toggle.hidden=!key;
    if(!key){drawer.hidden=true;toggle.setAttribute('aria-expanded','false');}
    updateCount(0);
    messages.replaceChildren();
    input.value='';
    status.textContent='Đang kết nối…';
    void refresh();
  }
  async function refresh(){
    if(!stamp||document.hidden)return;
    if(busy){queued=true;return;}
    busy=true;
    const key=stamp, {session,area,host}=current;
    try {
      const result=await api('scene',{area,host,pose:world.position()},session);
      if(key===stamp)applyResult(result);
    } catch {
      if(key===stamp){status.textContent='Đang kết nối lại…';world.setPeers([]);present=0;updateCount(0);}
    } finally {
      busy=false;
      if(queued){queued=false;void refresh();}
    }
  }
  toggle.addEventListener('click',()=>{
    drawer.hidden=!drawer.hidden;
    toggle.setAttribute('aria-expanded',String(!drawer.hidden));
    if(!drawer.hidden){unread=0;updateCount(present);input.focus();}
  });
  drawer.querySelector('[data-chat-close]').addEventListener('click',()=>{
    drawer.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!stamp||!input.value.trim())return;
    const key=stamp, {session,area,host}=current, button=form.querySelector('button');
    if(button.disabled)return;
    const text=input.value;
    button.disabled=true;
    try {
      const result=await api('chat',{area,host,text,nonce:crypto.randomUUID()},session);
      if(key!==stamp)return;
      if(input.value===text)input.value='';
      applyResult(result);
      messages.scrollTop=messages.scrollHeight;
    } catch(error) {
      if(key===stamp)showToast(error.message,true);
    } finally {button.disabled=false;}
  });
  setInterval(()=>{if(!busy)void refresh();},1200);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});
  return {sessionChanged};
}
