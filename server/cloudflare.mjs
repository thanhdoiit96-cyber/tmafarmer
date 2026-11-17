import {DurableObject} from 'cloudflare:workers';
import {SceneSpeechBuffer} from './scene-speech.mjs';

export {default} from './worker.mjs';

export class SceneSpeech extends DurableObject {
  #scene=new SceneSpeechBuffer();

  exchange(player,nearby,now,message){
    return this.#scene.exchange(player,nearby,now,message);
  }
}
