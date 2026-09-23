// GSAP sequences inspired by its Timeline documentation; original theme choreography.
window.themeMotion = (() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const targets=['.profile-header','.profile-content','.portrait-strip figure','.video-gallery','.profile-footer'];
  let sequence;
  function finish(){if(sequence){sequence.progress(1);sequence.kill();sequence=null;}}
  function reveal(){
    finish();
    if(reduced.matches||!window.gsap)return;
    sequence=gsap.timeline({defaults:{ease:'power3.out',duration:1,clearProps:'transform,opacity'}});
    sequence.fromTo('.profile-header',{opacity:0,y:8},{opacity:1,y:0},.5)
      .fromTo('.profile-content',{opacity:0,y:18},{opacity:1,y:0},.65)
      .fromTo('.portrait-strip figure',{opacity:0,y:28},{opacity:1,y:0,stagger:.12},.85)
      .fromTo('.video-gallery',{opacity:0,y:24},{opacity:1,y:0},1.2)
      .fromTo('.profile-footer',{opacity:0},{opacity:1,duration:.5},1.6);
  }
  reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
  return {reveal,finish};
})();
