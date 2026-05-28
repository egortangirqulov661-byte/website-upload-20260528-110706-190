(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.mobile-menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
    if (slides.length > 0) {
      var activeIndex = 0;
      var timer = null;
      var setSlide = function (nextIndex) {
        activeIndex = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
          slide.classList.toggle('is-active', index === activeIndex);
        });
        thumbs.forEach(function (thumb, index) {
          thumb.classList.toggle('is-active', index === activeIndex);
        });
      };
      var startTimer = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          setSlide(activeIndex + 1);
        }, 5200);
      };
      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener('click', function () {
          setSlide(index);
          startTimer();
        });
      });
      startTimer();
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    var filterInput = document.querySelector('.filter-search');
    if (filterInput && keyword) {
      filterInput.value = keyword;
    }

    var filterGrid = document.querySelector('.filter-grid');
    var emptyState = document.querySelector('.empty-state');
    var sortSelect = document.querySelector('.sort-select');
    var originalCards = filterGrid ? Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card')) : [];

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var applyFilter = function () {
      if (!filterGrid) {
        return;
      }
      var term = normalize(filterInput ? filterInput.value : '');
      var visible = 0;
      originalCards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.textContent
        ].join(' '));
        var matched = !term || haystack.indexOf(term) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    var applySort = function () {
      if (!filterGrid || !sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var cards = originalCards.slice();
      if (mode === 'views') {
        cards.sort(function (a, b) {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        });
      } else if (mode === 'year') {
        cards.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else if (mode === 'title') {
        cards.sort(function (a, b) {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        });
      } else {
        cards = originalCards.slice();
      }
      cards.forEach(function (card) {
        filterGrid.appendChild(card);
      });
      applyFilter();
    };

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
      applyFilter();
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }

    document.querySelectorAll('.player-stage').forEach(function (stage) {
      var video = stage.querySelector('video');
      var button = stage.querySelector('.play-overlay');
      var videoUrl = stage.getAttribute('data-url');
      var started = false;

      var attachVideo = function () {
        if (started || !video || !videoUrl) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = videoUrl;
        }
      };

      var begin = function () {
        attachVideo();
        stage.classList.add('is-playing');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            stage.classList.remove('is-playing');
          });
        }
      };

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          begin();
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          stage.classList.add('is-playing');
        });
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            begin();
          }
        });
      }
    });
  });
})();
