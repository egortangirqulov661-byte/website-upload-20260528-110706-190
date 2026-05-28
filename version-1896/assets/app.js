document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
      menuButton.classList.toggle("is-menu-open");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5600);
    }
  }

  var input = document.querySelector("[data-filter-input]");
  var select = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var applyFilter = function () {
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var type = select ? select.value.trim().toLowerCase() : "";
    cards.forEach(function (card) {
      var search = (card.getAttribute("data-search") || "").toLowerCase();
      var okKeyword = !keyword || search.indexOf(keyword) !== -1;
      var okType = !type || search.indexOf(type) !== -1;
      card.hidden = !(okKeyword && okType);
    });
  };
  if (input) {
    input.addEventListener("input", applyFilter);
  }
  if (select) {
    select.addEventListener("change", applyFilter);
  }
});
