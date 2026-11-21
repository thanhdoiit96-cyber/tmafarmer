import {crops} from '../game.mjs';
import {cropFrame} from './crop-layout.mjs';

export function cropItemKind(item){
  if(Object.hasOwn(crops,item))return item;
  return Object.keys(crops).find(kind=>crops[kind].seed===item)??null;
}

export function cropItemFrame(item){
  const kind=cropItemKind(item);
  return kind?cropFrame(kind,3):null;
}
