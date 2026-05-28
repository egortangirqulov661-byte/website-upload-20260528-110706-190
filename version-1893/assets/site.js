
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initSearchFilters();
  initHeroCarousel();
  initPlayers();
});

function initMobileNav() {
  const btn = document.querySelector("[data-menu-btn]");
  const nav = document.querySelector("[data-mobile-menu]");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("is-open"));
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !btn.contains(event.target)) nav.classList.remove("is-open");
  });
}

function initSearchFilters() {
  document.querySelectorAll("[data-filter-form]").forEach((form) => {
    const input = form.querySelector("input");
    const target = document.querySelector(form.dataset.filterTarget || "");
    const empty = document.querySelector(form.dataset.filterEmpty || "");
    if (!input || !target) return;
    const items = Array.from(target.querySelectorAll("[data-search]"));
    const update = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      items.forEach((item) => {
        const text = (item.dataset.search || "").toLowerCase();
        const show = !query || text.includes(query);
        item.style.display = show ? "" : "none";
        if (show) visible += 1;
      });
      if (empty) empty.classList.toggle("is-visible", visible === 0);
    };
    input.addEventListener("input", update);
    update();
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) return;
  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (index < 0) index = 0;

  const activate = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => activate(i)));
  activate(index);

  let timer = window.setInterval(() => activate(index + 1), 6500);
  carousel.addEventListener("mouseenter", () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  });
  carousel.addEventListener("mouseleave", () => {
    if (!timer) timer = window.setInterval(() => activate(index + 1), 6500);
  });
}

function initPlayers() {
  document.querySelectorAll("[data-player-shell]").forEach((shell) => {
    const video = shell.querySelector("video");
    const cover = shell.querySelector("[data-player-cover]");
    const play = shell.querySelector("[data-player-play]");
    const src = shell.dataset.m3u8;
    if (!video || !src) return;

    const attachSource = () => {
      if (video.dataset.ready === "1") return;
      video.dataset.ready = "1";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        shell._hls = hls;
        return;
      }
      video.src = src;
    };

    const start = () => {
      attachSource();
      if (cover) cover.classList.add("is-hidden");
      video.play().catch(() => {});
    };

    attachSource();
    if (cover) cover.addEventListener("click", start);
    if (play) play.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) start();
    });
  });
}
