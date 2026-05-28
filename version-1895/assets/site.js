
(function(){
  const normalize = (v) => (v || '').toString().toLowerCase().trim();

  function initNav(){
    const toggle = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-nav-panel]');
    if(!toggle || !panel) return;
    toggle.addEventListener('click', () => panel.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if(window.innerWidth > 780) return;
      if(!panel.classList.contains('open')) return;
      if(panel.contains(e.target) || toggle.contains(e.target)) return;
      panel.classList.remove('open');
    });
  }

  function ensureFallback(img){
    const wrap = img.closest('.poster, .hero-poster, .detail-poster');
    if(!wrap) return;
    img.addEventListener('error', () => {
      wrap.classList.add('is-fallback');
      img.style.display = 'none';
    }, { once: true });
    if(!img.getAttribute('src')) {
      wrap.classList.add('is-fallback');
      img.style.display = 'none';
    }
  }

  function initFallbacks(){
    document.querySelectorAll('[data-poster-img]').forEach(ensureFallback);
  }

  function initFilters(){
    document.querySelectorAll('[data-filter-input]').forEach(input => {
      const selector = input.getAttribute('data-filter-target');
      const scope = selector ? document.querySelector(selector) : input.closest('main') || document;
      const counter = input.getAttribute('data-filter-count') ? document.querySelector(input.getAttribute('data-filter-count')) : null;
      const cards = () => Array.from(scope.querySelectorAll('[data-filter-card]'));
      const apply = () => {
        const q = normalize(input.value);
        let shown = 0;
        cards().forEach(card => {
          const hay = normalize(card.getAttribute('data-search'));
          const visible = !q || hay.includes(q);
          card.classList.toggle('hidden', !visible);
          if (visible) shown += 1;
        });
        if (counter) counter.textContent = shown.toString();
      };
      input.addEventListener('input', apply);
      apply();
    });
  }

  function initHero(){
    const root = document.querySelector('[data-hero-carousel]');
    if(!root) return;
    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    const indicatorsWrap = root.querySelector('[data-hero-indicators]');
    if(!slides.length) return;
    let index = 0;
    const setActive = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      if(indicatorsWrap){
        Array.from(indicatorsWrap.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
      }
    };
    if(indicatorsWrap && !indicatorsWrap.children.length){
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hero-indicator' + (i === 0 ? ' active' : '');
        b.addEventListener('click', () => setActive(i));
        indicatorsWrap.appendChild(b);
      });
    }
    prev && prev.addEventListener('click', () => setActive(index - 1));
    next && next.addEventListener('click', () => setActive(index + 1));
    setActive(0);
    let timer = window.setInterval(() => setActive(index + 1), 5000);
    root.addEventListener('mouseenter', () => { if(timer){ clearInterval(timer); timer = null; } });
    root.addEventListener('mouseleave', () => { if(!timer) timer = window.setInterval(() => setActive(index + 1), 5000); });
  }

  function initVideoPlayers(){
    document.querySelectorAll('video[data-hls-src]').forEach(video => {
      if(video.dataset.bound === '1') return;
      video.dataset.bound = '1';
      const src = video.dataset.hlsSrc;
      if(!src) return;
      const play = () => video.play().catch(() => {});
      if(window.Hls && Hls.isSupported()) {
        try {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, play);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if(data && data.fatal) {
              try { hls.destroy(); } catch (e) {}
              video.src = src;
              video.load();
            }
          });
        } catch (e) {
          video.src = src;
        }
      } else {
        video.src = src;
      }
      video.addEventListener('loadedmetadata', play, { once: true });
    });
  }

  function init(){
    initNav();
    initFallbacks();
    initFilters();
    initHero();
    initVideoPlayers();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
