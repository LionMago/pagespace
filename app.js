(() => {
  'use strict';
  const config = window.XATSPACE_CONFIG || {};
  const menuHeight = Number(config.xatMenuHeight);
  document.documentElement.style.setProperty('--xat-menu-height', `${Number.isFinite(menuHeight) && menuHeight >= 0 ? menuHeight : 88}px`);
  const screens = ['entrance', 'cinema', 'profile'];
  const status = document.getElementById('video-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const player = document.getElementById('player');
  let loadingTimer;
  const musicButton = document.createElement('button');
  musicButton.className = 'text-button music-toggle';
  musicButton.id = 'music-toggle';
  const headerActions = document.createElement('div');
  headerActions.className = 'profile-actions';
  const backButton = document.getElementById('back');
  backButton.before(headerActions);
  headerActions.append(backButton, musicButton);
  function syncMusicButton() {
    const playing = !player.paused && !player.muted;
    musicButton.textContent = playing ? '♫ Pausar música' : '♫ Ouvir música';
    musicButton.setAttribute('aria-pressed', String(playing));
  }
  musicButton.addEventListener('click', () => {
    if (!player.paused && !player.muted) player.pause();
    else { window.videoGallery.pauseAll(); player.muted = false; player.play().catch(syncMusicButton); }
  });
  ['play','pause','volumechange','ended'].forEach(event => player.addEventListener(event, syncMusicButton));
  syncMusicButton();
  document.addEventListener('gallery-playback', () => {
    if(document.body.dataset.screen === 'profile' && !player.paused) player.pause();
  });
  const dragonTransition = document.getElementById('dragon-transition');
  let dragonTimer;

  let dragonActive = false;


  function finishDragon() {
    clearTimeout(dragonTimer);
    fireRenderer?.stop();
    window.themeMotion.finish();
    dragonActive = false;
    dragonTransition.hidden = true;
    document.body.classList.remove('dragon-active');
    document.getElementById('profile').inert = false;
    showScreen('profile');
  }
  function enterProfile() {
    if (dragonActive) return;
    player.loop = true;
    if (player.ended) player.currentTime = 0;
    player.play().catch(syncMusicButton);
    clearTimeout(loadingTimer);
    if (reducedMotion.matches) { showScreen('profile'); return; }
    dragonActive = true;
    showScreen('profile');
    document.getElementById('profile').inert = true;
    window.themeMotion.reveal();
    dragonTransition.hidden = false;
    document.body.classList.add('dragon-active');
    document.getElementById('skip-dragon').focus({ preventScroll: true });
    animateFireReveal();
    if (dragonActive) dragonTimer = setTimeout(finishDragon, 3500);
  }
  let fireRenderer;
  const warmFire = () => { fireRenderer ||= window.createFireTransition(document.getElementById('transition-flames')); };
  if ('requestIdleCallback' in window) requestIdleCallback(warmFire, {timeout: 2000});
  else setTimeout(warmFire, 500);
  function animateFireReveal() {
    fireRenderer ||= window.createFireTransition(document.getElementById('transition-flames'));
    if (fireRenderer) fireRenderer.play(finishDragon);
    else finishDragon();
  }
  document.getElementById('skip-dragon').addEventListener('click', finishDragon);
  document.getElementById('profile-name').textContent = config.name || 'Winter is Coming';
  document.getElementById('profile-bio').textContent = config.bio || '';
  document.title = `${config.name || 'Winter is Coming'} · Xatspace`;
  player.src = config.videoUrl || 'assets/opening-s8-4k.mp4';

  function showScreen(name) {
    if(name !== 'profile') window.themeMotion.finish();
    document.body.dataset.screen = name;
    screens.forEach(id => { document.getElementById(id).hidden = id !== name; });
    window.videoGallery.setActive(name === 'profile');
    if (name === 'entrance') {
      clearTimeout(loadingTimer);
      player.pause();
    }
    const focusTarget = name === 'profile' ? 'profile-name' : name === 'cinema' ? 'skip' : 'enter';
    document.getElementById(focusTarget).focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: 'instant' });
  }
  player.addEventListener('ended', () => {
    if (document.body.dataset.screen === 'cinema') enterProfile();
  });
  player.addEventListener('playing', () => {
    clearTimeout(loadingTimer);
    status.textContent = 'Game of Thrones · Abertura';
  });
  player.addEventListener('waiting', () => { status.textContent = 'Carregando a abertura…'; });
  player.addEventListener('error', () => {
    clearTimeout(loadingTimer);
    status.textContent = 'O vídeo não carregou. Você pode pular a abertura e entrar.';
  });
  document.getElementById('enter').addEventListener('click', () => {
    player.loop = false;
    showScreen('cinema');
    status.textContent = 'Preparando a abertura…';
    if (player.error) player.load();
    player.currentTime = 0;
    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(() => {
      status.textContent = 'Se o vídeo não carregar, use “Pular abertura” para entrar.';
    }, 15000);
    player.play().catch(() => {
      clearTimeout(loadingTimer);
      status.textContent = player.error ? 'O vídeo não carregou. Você pode pular a abertura e entrar.' : 'Toque no play para começar a abertura.';
    });
  });
  document.getElementById('skip').addEventListener('click', enterProfile);
  document.getElementById('back').addEventListener('click', () => showScreen('entrance'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dragonActive) finishDragon();
    else if (event.key === 'Escape' && document.body.dataset.screen === 'cinema') enterProfile();
  });

  const canvas = document.getElementById('snow');
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, last = 0;
  let flakes = [];
  function resize() {
    width = innerWidth; height = innerHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * scale; canvas.height = height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    flakes = Array.from({ length: Math.min(110, Math.round(width / 14)) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 1.7 + .4, speed: Math.random() * 24 + 12, phase: Math.random() * 6.28
    }));
  }
  function snow(time) {
    const delta = Math.min((time - last) / 1000, .05); last = time;
    if (!reducedMotion.matches && !document.hidden && document.body.dataset.screen !== 'cinema') {
      ctx.clearRect(0, 0, width, height);
      for (const f of flakes) {
        f.y += f.speed * delta; f.x += (7 + Math.sin(time / 2500 + f.phase) * 9) * delta;
        if (f.y > height + 4) { f.y = -4; f.x = Math.random() * width; }
        if (f.x > width + 4) f.x = -4;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(228,241,247,${.18 + f.r * .15})`; ctx.fill();
      }
    }
    requestAnimationFrame(snow);
  }
  if (ctx) { resize(); addEventListener('resize', resize); requestAnimationFrame(snow); }
})();

