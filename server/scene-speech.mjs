import {speechLifetime} from './engine.mjs';

export class SceneSpeechBuffer {
  #people=new Map();

  exchange(player,nearby,now,message){
    for(const [author,posts] of this.#people){
      const recent=posts.filter(post=>post.sent>now-6000);
      for(const post of recent)if(post.expires<=now)delete post.text;
      if(recent.length)this.#people.set(author,recent);
      else this.#people.delete(author);
    }

    if(message){
      const posts=this.#people.get(player)??[];
      if(!posts.some(post=>post.id===message.nonce)){
        if(posts.length>=3)return {status:429,error:'Bạn gửi hơi nhanh. Chờ vài giây rồi thử lại.'};
        posts.push({id:message.nonce,player,text:message.text,sent:now,expires:now+speechLifetime});
        this.#people.set(player,posts);
      }
    }

    const messages=nearby.flatMap(author=>{
      const last=this.#people.get(author)?.at(-1);
      return last?.text&&last.expires>now?[last]:[];
    });
    return {messages:messages.sort((a,b)=>a.sent-b.sent)};
  }
}

export function localSpeechNamespace(){
  const scenes=new Map();
  return {getByName(name){
    if(!scenes.has(name))scenes.set(name,new SceneSpeechBuffer());
    return scenes.get(name);
  }};
}
