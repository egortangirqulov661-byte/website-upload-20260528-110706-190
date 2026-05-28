
import { H as Hls } from './hls-player.js';

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function normalize(s){
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，,、/／\-_.()（）【】[\]{}:：]/g, '');
}

async function fetchJSON(url){
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function buildCard(m, base=''){
  const href = `${base}movie-${m.id}.html`;
  const poster = m.poster || '';
  const tags = [m.year, m.region, m.type].filter(Boolean);
  return `
    <a class="movie-card" href="${href}" data-title="${htmlEscapeAttr(m.title)}" data-region="${htmlEscapeAttr(m.region)}" data-genre="${htmlEscapeAttr(m.genre)}" data-tags="${htmlEscapeAttr(m.tags)}" data-year="${m.year}">
      <div class="poster">
        <img loading="lazy" src="${poster}" alt="${htmlEscapeAttr(m.title)} 海报">
        <div class="badge">${htmlEscapeAttr(m.year.toString())}</div>
      </div>
      <div class="card-body">
        <h3>${htmlEscape(m.title)}</h3>
        <div class="card-meta">
          ${tags.map(t => `<span>${htmlEscape(t)}</span>`).join('')}
        </div>
      </div>
    </a>
  `;
}

function htmlEscape(str){
  return (str ?? '').toString()
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function htmlEscapeAttr(str){ return htmlEscape(str).replace(/\n/g, ' '); }

function bindMobileMenu(){
  const btn = qs('[data-menu-toggle]');
  const menu = qs('[data-menu]');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
}

function bindLocalFilter(){
  const input = qs('[data-filter-input]');
  const sort = qs('[data-sort]');
  const cards = qsa('[data-filter-grid] .movie-card');
  if (!input || !cards.length) return;
  const apply = () => {
    const q = normalize(input.value);
    const s = sort ? sort.value : 'default';
    cards.forEach(card => {
      const hay = normalize([
        card.dataset.title, card.dataset.region, card.dataset.genre,
        card.dataset.tags, card.dataset.year
      ].join(' '));
      card.classList.toggle('hide', q && !hay.includes(q));
    });
    if (sort) {
      const grid = qs('[data-filter-grid]');
      const visible = cards.filter(c => !c.classList.contains('hide'));
      if (s === 'year-desc') visible.sort((a,b) => +b.dataset.year - +a.dataset.year);
      else if (s === 'year-asc') visible.sort((a,b) => +a.dataset.year - +b.dataset.year);
      else if (s === 'title-asc') visible.sort((a,b) => a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN'));
      visible.forEach(card => grid.appendChild(card));
    }
  };
  input.addEventListener('input', apply);
  sort && sort.addEventListener('change', apply);
  apply();
}

function bindHeroRail(){
  const rail = qs('[data-spotlight]');
  if (!rail) return;
  qsa('[data-rail-prev]').forEach(btn => btn.addEventListener('click', () => rail.scrollBy({left: -340, behavior:'smooth'})));
  qsa('[data-rail-next]').forEach(btn => btn.addEventListener('click', () => rail.scrollBy({left: 340, behavior:'smooth'})));
}

function bindPlayer(){
  const shell = qs('[data-player-shell]');
  if (!shell) return;
  const video = qs('video', shell);
  const srcInput = qs('[data-player-src]');
  const playBtn = qs('[data-player-play]');
  const fallbackBtn = qs('[data-player-fallback]');
  const status = qs('[data-player-status]');
  const fallbackSrc = shell.dataset.fallback || '';
  let hls = null;

  function setStatus(text){ if (status) status.textContent = text; }

  function destroyHls(){
    if (hls) { hls.destroy(); hls = null; }
  }

  function loadSource(src, useFallback=false){
    if (!video || !src) return;
    destroyHls();
    if (Hls && Hls.isSupported() && src.endsWith('.m3u8')) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        startLevel: -1,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('HLS 清单已解析，点击播放即可。');
        video.play().catch(()=>{});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data && data.fatal) {
          setStatus('HLS 播放失败，已切换到备用 MP4。');
          destroyHls();
          if (fallbackSrc && !useFallback) {
            video.src = fallbackSrc;
            video.play().catch(()=>{});
          }
        }
      });
      return;
    }
    video.src = src.endsWith('.m3u8') ? fallbackSrc || src : src;
    video.play().catch(()=>{});
    setStatus(useFallback ? '已切换到备用源。' : '播放源已加载。');
  }

  if (playBtn) playBtn.addEventListener('click', () => {
    const src = srcInput ? srcInput.value.trim() : '';
    loadSource(src || fallbackSrc);
  });

  if (fallbackBtn) fallbackBtn.addEventListener('click', () => {
    if (srcInput && fallbackSrc) srcInput.value = fallbackSrc;
    loadSource(fallbackSrc, true);
  });

  if (srcInput && srcInput.value.trim()) {
    loadSource(srcInput.value.trim());
  } else if (fallbackSrc) {
    loadSource(fallbackSrc);
  }
}

function bindSearchPage(){
  const form = qs('[data-search-form]');
  const input = qs('[data-search-input]');
  const results = qs('[data-search-results]');
  const count = qs('[data-search-count]');
  if (!form || !input || !results) return;

  const params = new URLSearchParams(location.search);
  const initial = params.get('q') || '';
  input.value = initial;

  async function run(){
    const q = normalize(input.value);
    const data = await fetchJSON('./assets/data.json');
    const items = data.movies.filter(m => {
      const hay = normalize([m.title,m.region,m.type,m.genre,m.tags,m.one_line,m.summary,m.review,m.year].join(' '));
      return !q || hay.includes(q);
    }).slice(0, 500);
    if (count) count.textContent = `${items.length}`;
    results.innerHTML = items.map(m => buildCard(m, './')).join('') || '<div class="panel pad">没有找到匹配内容，试试更短的关键词。</div>';
  }

  form.addEventListener('submit', e => { e.preventDefault(); run(); });
  input.addEventListener('input', () => {
    const q = input.value.trim();
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    history.replaceState({}, '', url);
    clearTimeout(input._t);
    input._t = setTimeout(run, 160);
  });
  run().catch(() => {
    results.innerHTML = '<div class="panel pad">搜索数据加载失败，请稍后重试。</div>';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindMobileMenu();
  bindLocalFilter();
  bindHeroRail();
  bindPlayer();
  bindSearchPage();
});
