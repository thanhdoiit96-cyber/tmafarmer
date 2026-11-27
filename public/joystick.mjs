// Pointer capture keeps a drag alive outside the pad; only its owning finger can steer.
export function installJoystick(pad,{enabled,onStart,onChange}){
  if(!pad)return ()=>{};
  let pointer=null;
  const reset=()=>{
    const id=pointer;pointer=null;
    delete pad.dataset.active;
    pad.style.setProperty('--stick-x','0px');pad.style.setProperty('--stick-y','0px');
    onChange(0,0);
    if(id!==null&&pad.hasPointerCapture(id))pad.releasePointerCapture(id);
  };
  const steer=e=>{
    const r=pad.getBoundingClientRect(),radius=r.width*.3;
    const dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,length=Math.hypot(dx,dy);
    const clamp=length>radius?radius/length:1;
    pad.style.setProperty('--stick-x',dx*clamp+'px');pad.style.setProperty('--stick-y',dy*clamp+'px');
    if(length<radius*.2)onChange(0,0);else onChange(dx/length,dy/length);
  };
  pad.addEventListener('pointerdown',e=>{
    if(e.button!==0||pointer!==null||!enabled())return;
    e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);pad.dataset.active='true';onStart();steer(e);
  });
  pad.addEventListener('pointermove',e=>{if(e.pointerId===pointer){e.preventDefault();if(enabled())steer(e);else reset();}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(e.pointerId===pointer)reset();});
  pad.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('resize',reset);
  return reset;
}
