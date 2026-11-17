export function createSceneChat({api,world,showToast,context}){
  const toggle=document.querySelector('[data-chat-toggle]');
  const drawer=document.querySelector('#scene-chat');
  const messages=drawer.querySelector('[data-chat-messages]');
  const form=drawer.querySelector('form');
  const input=form.elements.message;
  const status=drawer.querySelector('[data-chat-status]');
  const count=document.querySelector('[data-scene-count]');
  let current, stamp='', busy=false, queued=false, chatKey='-', responseTime=0, expiryTimer;
  let recent=[];
  const seen=new Map(), unread=new Set();
  const where=value=>value?.session?value.session.token+'/'+value.area+'/'+(value.host??''):'';
  function updateCount(total){
    count.textContent=total?total+' cùng khu':'';
    count.hidden=!total;
    toggle.querySelector('span').textContent=unread.size?'Chat ('+unread.size+')':'Chat';
  }
  let present=0;
  function applyResult(result){
    if((result.now??0)<responseTime)return;
    responseTime=result.now??0;
    world.setPeers(result.players);
    present=result.players.length;
    status.textContent=result.chatAvailable?(present?present+' người khác đang ở đây':'Bạn đang ở đây một mình'):'Chat gần đang kết nối lại…';
    const now=performance.now();
    for(const [id,deadline] of seen)if(deadline<=now)seen.delete(id);
    recent=(result.messages??[]).filter(message=>message.expires>result.now).map(message=>{
      const key=message.player+'/'+message.id;
      const deadline=Math.min(seen.get(key)??Infinity,now+message.expires-result.now);
      if(!seen.has(key)&&drawer.hidden&&message.player!==current.player)unread.add(key);
      seen.set(key,deadline);
      return {...message,key,deadline};
    });
    renderMessages();
  }
  function renderMessages(){
    clearTimeout(expiryTimer);
    const now=performance.now();
    recent=recent.filter(message=>message.deadline>now);
    for(const id of unread)if(!recent.some(message=>message.key===id))unread.delete(id);
    world.setSpeech(recent);
    updateCount(present);
    if(recent.length)expiryTimer=setTimeout(renderMessages,Math.max(1,Math.ceil(Math.min(...recent.map(message=>message.deadline))-now)));
    const signature=recent.map(message=>message.key).join(',');
    if(chatKey===signature)return;
    chatKey=signature;
    const atEnd=messages.scrollHeight-messages.scrollTop-messages.clientHeight<34;
    messages.replaceChildren();
    for(const message of recent){
      const row=document.createElement('li'), author=document.createElement('strong'), text=document.createTextNode(message.text);
      author.textContent=message.name;
      row.append(author,text);
      messages.append(row);
    }
    if(!recent.length){
      const row=document.createElement('li');row.textContent='Chưa có tin nhắn ở gần.';messages.append(row);
    }
    if(atEnd)messages.scrollTop=messages.scrollHeight;
  }
  function sessionChanged(){
    const next=context();
    const key=where(next);
    current=next;
    if(stamp===key)return;
    stamp=key;responseTime=0;present=0;chatKey='-';recent=[];
    seen.clear();unread.clear();clearTimeout(expiryTimer);
    world.setPeers([]);
    world.setSpeech([]);
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
      if(key===stamp){
        status.textContent='Đang kết nối lại…';world.setPeers([]);present=0;recent=[];renderMessages();
      }
    } finally {
      busy=false;
      if(queued){queued=false;void refresh();}
    }
  }
  toggle.addEventListener('click',()=>{
    drawer.hidden=!drawer.hidden;
    toggle.setAttribute('aria-expanded',String(!drawer.hidden));
    if(!drawer.hidden){unread.clear();updateCount(present);input.focus();}
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
