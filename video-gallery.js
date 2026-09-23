// Local media keeps playback independent of third-party iframe restrictions.
window.videoGallery=(()=>{
  const videos=[...document.querySelectorAll('.video-gallery video')];
  let active=false;
  function pauseAll(){videos.forEach(video=>video.pause());}
  function claim(video){
    document.dispatchEvent(new Event('gallery-playback'));
    videos.forEach(other=>{if(other!==video)other.pause();});
  }
  videos.forEach(video=>{
    let silentPreview=false;
    video.addEventListener('play',()=>{
      if(!active){video.pause();return;}
      if(!silentPreview)claim(video);
      silentPreview=false;
    });
    video.addEventListener('volumechange',()=>{if(active&&!video.paused&&!video.muted&&video.volume>0)claim(video);});
    video.addEventListener('error',()=>{
      let note=video.closest('figure').querySelector('.video-feedback');
      if(!note){note=document.createElement('p');note.className='video-feedback';video.closest('figure').append(note);}
      note.textContent='O arquivo de vídeo não carregou. Confira se a pasta assets foi enviada junto com a página.';
    });
    video.startPreview=()=>{silentPreview=true;video.muted=true;video.play().catch(()=>{silentPreview=false;});};
  });
  return {pauseAll,setActive(value){
    const changed=active!==value;active=value;
    if(!active)pauseAll();
    else if(changed)videos.filter(v=>v.dataset.autoplay==='1').forEach(v=>v.startPreview());
  }};
})();
