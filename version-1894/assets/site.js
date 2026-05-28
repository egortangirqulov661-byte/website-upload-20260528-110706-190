(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousels = document.querySelectorAll('[data-carousel]');

  carousels.forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;

    function show(nextIndex) {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var searchInput = filterRoot.querySelector('[data-filter-search]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var genreSelect = filterRoot.querySelector('[data-filter-genre]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var filterButtons = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-quick-filter]'));
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';

    function norm(value) {
      return String(value || '').trim().toLowerCase();
    }

    function setValue(control, value) {
      if (control && value) {
        control.value = value;
      }
    }

    setValue(searchInput, queryValue);
    setValue(regionSelect, params.get('region'));
    setValue(genreSelect, params.get('genre'));
    setValue(typeSelect, params.get('type'));

    function applyFilters() {
      var q = norm(searchInput && searchInput.value);
      var region = norm(regionSelect && regionSelect.value);
      var genre = norm(genreSelect && genreSelect.value);
      var type = norm(typeSelect && typeSelect.value);

      cards.forEach(function (card) {
        var search = norm(card.getAttribute('data-search'));
        var cardRegion = norm(card.getAttribute('data-region'));
        var cardGenre = norm(card.getAttribute('data-genre'));
        var cardType = norm(card.getAttribute('data-type'));
        var matched = true;

        if (q && search.indexOf(q) === -1) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        card.classList.toggle('hidden-card', !matched);
      });
    }

    [searchInput, regionSelect, genreSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var kind = button.getAttribute('data-kind');
        var value = button.getAttribute('data-value');

        if (kind === 'region' && regionSelect) {
          regionSelect.value = value;
        }

        if (kind === 'genre' && genreSelect) {
          genreSelect.value = value;
        }

        if (kind === 'type' && typeSelect) {
          typeSelect.value = value;
        }

        applyFilters();
      });
    });

    applyFilters();
  }
})();
