export function createFarmMusic(audio, saved, persist){
  let volume=Number.isFinite(saved?.volume)?Math.max(0,Math.min(100,saved.volume)):30;
  let muted=saved?.muted===true, activated=false;

  function sync(){
    audio.volume=volume/100;
    audio.muted=muted;
    if(!activated||muted||!volume||document.hidden)audio.pause();
    else if(audio.paused)void audio.play().catch(()=>{});
  }
  function update(){
    persist({volume,muted});
    sync();
  }
  document.addEventListener('click',()=>{activated=true;sync();},{once:true,capture:true});
  document.addEventListener('visibilitychange',sync);
  return {
    get volume(){return volume;},
    get muted(){return muted;},
    setVolume(value){volume=value;update();},
    toggleMute(){muted=!muted;update();},
  };
}
