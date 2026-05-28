(function () {
  var root = document.documentElement.getAttribute('data-root') || './';

  function bySelector(selector, base) {
    return Array.prototype.slice.call((base || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    bySelector('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = root + 'search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = bySelector('[data-hero-slide]', hero);
    var dots = bySelector('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    activate(0);
    restart();
  }

  function setupFilters() {
    var searchInput = document.querySelector('[data-filter-search]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var cards = bySelector('[data-search-card]');
    if (!cards.length || (!searchInput && !regionSelect && !yearSelect)) {
      return;
    }

    function apply() {
      var query = normalize(searchInput ? searchInput.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        card.classList.toggle('hidden-by-filter', !(matchesQuery && matchesRegion && matchesYear));
      });
    }

    [searchInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.querySelector('[data-search-page-input]');
    var form = document.querySelector('[data-search-page-form]');
    if (!results || !input || !window.SiteMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render() {
      var query = normalize(input.value);
      var movies = window.SiteMovies.filter(function (movie) {
        var haystack = normalize([movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags, movie.oneLine].join(' '));
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 80);
      results.innerHTML = movies.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-frame" href="' + root + movie.url + '">' +
          '<img src="' + root + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="play-chip">播放</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h2><a href="' + root + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
        var query = input.value.trim();
        var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', nextUrl);
      });
    }
    input.addEventListener('input', render);
    render();
  }

  setupMobileMenu();
  setupHeaderSearch();
  setupHero();
  setupFilters();
  setupSearchPage();
})();
