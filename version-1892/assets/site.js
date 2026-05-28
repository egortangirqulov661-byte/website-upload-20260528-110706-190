(function () {
  function getRoot() {
    return document.body.getAttribute("data-root") || ".";
  }

  function joinRoot(path) {
    var root = getRoot();
    if (root === "." || root === "") {
      return path;
    }
    return root + "/" + path;
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupGlobalSearch() {
    var forms = document.querySelectorAll(".global-search, .quick-search-form");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var input = form.querySelector("input[name='q'], input[type='search'], input");
        var query = input ? input.value.trim() : "";

        if (query) {
          window.location.href = joinRoot("search.html") + "?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero-carousel");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);

    show(0);
    play();
  }

  function setupLocalFilters() {
    var filterArea = document.querySelector(".page-filter");

    if (!filterArea) {
      return;
    }

    var input = filterArea.querySelector("[data-filter-input]");
    var region = filterArea.querySelector("[data-filter-region]");
    var type = filterArea.querySelector("[data-filter-type]");
    var year = filterArea.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var status = document.querySelector(".filter-status");

    function matches(card) {
      var q = normalizeText(input ? input.value : "");
      var text = normalizeText(card.getAttribute("data-search"));
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";

      if (q && text.indexOf(q) === -1) {
        return false;
      }

      if (regionValue && card.getAttribute("data-region") !== regionValue) {
        return false;
      }

      if (typeValue && card.getAttribute("data-type") !== typeValue) {
        return false;
      }

      if (yearValue && card.getAttribute("data-year") !== yearValue) {
        return false;
      }

      return true;
    }

    function apply() {
      var count = 0;

      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;

        if (ok) {
          count += 1;
        }
      });

      if (status) {
        status.textContent = "当前显示 " + count + " 部影片";
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class='movie-card' data-search='" + escapeHtml(movie.search) + "' data-region='" + escapeHtml(movie.region) + "' data-type='" + escapeHtml(movie.type) + "' data-year='" + escapeHtml(movie.year) + "'>",
      "  <a class='poster-link' href='" + escapeHtml(movie.url) + "' aria-label='" + escapeHtml(movie.title) + " 在线观看'>",
      "    <div class='poster-frame'>",
      "      <img src='" + escapeHtml(movie.cover) + "' alt='" + escapeHtml(movie.title) + "' loading='lazy'>",
      "      <span class='poster-badge'>" + escapeHtml(movie.region) + "</span>",
      "      <span class='poster-year'>" + escapeHtml(movie.year) + "</span>",
      "      <span class='poster-play'>▶</span>",
      "    </div>",
      "  </a>",
      "  <div class='card-body'>",
      "    <h2><a href='" + escapeHtml(movie.url) + "'>" + escapeHtml(movie.title) + "</a></h2>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class='card-meta'>",
      "      <span>" + escapeHtml(movie.type) + "</span>",
      "      <span>" + escapeHtml(movie.genre) + "</span>",
      "    </div>",
      "    <div class='tag-row'>" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    var status = document.querySelector("[data-search-page-status]");

    if (!results || !input || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var query = normalizeText(input.value);
      var items = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        if (!query) {
          return true;
        }

        return normalizeText(movie.search).indexOf(query) !== -1;
      }).slice(0, 240);

      if (status) {
        status.textContent = query
          ? "找到 " + items.length + " 条相关结果"
          : "默认展示前 " + items.length + " 部影片";
      }

      if (!items.length) {
        results.innerHTML = "<div class='empty-state'>没有找到匹配的影片，请尝试更换关键词。</div>";
        return;
      }

      results.innerHTML = items.map(movieCard).join("");
    }

    input.addEventListener("input", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupGlobalSearch();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
})();
