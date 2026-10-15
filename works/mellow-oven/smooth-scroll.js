/* Fractional interpolation avoids rounding stalls and preserves native CSS sticky positioning. */
(()=>{'use strict';
  const narrow=matchMedia('(max-width:767px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let frame=0,target=scrollY,position=scrollY,previous=0;
  const disabled=()=>narrow.matches||reduced.matches||document.documentElement.classList.contains('no-motion');
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;position=target=scrollY;}
  function tick(time){
    frame=0;if(disabled()||document.hidden){stop();return;}
    const dt=Math.min(40,previous?time-previous:16.7);previous=time;
    position+=(target-position)*(1-Math.exp(-dt/95));
    if(Math.abs(target-position)<.15){scrollTo({top:target,behavior:'instant'});previous=0;position=target=scrollY;return;}
    scrollTo({top:position,behavior:'instant'});frame=requestAnimationFrame(tick);
  }
  addEventListener('wheel',event=>{
    if(disabled()||event.ctrlKey||event.defaultPrevented||document.body.classList.contains('locked')||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.target.closest?.('dialog,textarea,select,[contenteditable=true]'))return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(!delta)return;
    const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    if(!frame){position=target=scrollY;previous=0;}
    const next=Math.max(0,Math.min(max,target+delta));
    if(next===target)return;event.preventDefault();target=next;if(!frame)frame=requestAnimationFrame(tick);
  },{passive:false});
  addEventListener('pointerdown',stop,{passive:true});addEventListener('touchstart',stop,{passive:true});
  addEventListener('keydown',stop);addEventListener('resize',stop,{passive:true});
  addEventListener('scroll',()=>{if(!frame)position=target=scrollY;},{passive:true});
  document.addEventListener('visibilitychange',stop);narrow.addEventListener('change',stop);reduced.addEventListener('change',stop);
  new MutationObserver(()=>{if(disabled())stop();}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
})();
