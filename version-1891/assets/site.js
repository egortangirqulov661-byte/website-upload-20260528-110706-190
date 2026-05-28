(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            nav.classList.toggle("is-open", !expanded);
            document.body.classList.toggle("menu-open", !expanded);
        });
        nav.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                button.setAttribute("aria-expanded", "false");
                nav.classList.remove("is-open");
                document.body.classList.remove("menu-open");
            }
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
        blocks.forEach(function (block) {
            var cards = Array.prototype.slice.call(block.querySelectorAll(".movie-card, .rank-card"));
            if (!cards.length) {
                return;
            }
            var search = block.querySelector('[data-filter="search"]');
            var selects = Array.prototype.slice.call(block.querySelectorAll("select[data-filter]"));
            var reset = block.querySelector('[data-filter="reset"]');
            var count = block.querySelector(".filter-count");

            function apply() {
                var query = normalize(search ? search.value : "");
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute("data-filter")] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesRegion = !filters.region || normalize(card.dataset.region) === filters.region;
                    var matchesYear = !filters.year || normalize(card.dataset.year) === filters.year;
                    var matchesType = !filters.type || normalize(card.dataset.type) === filters.type;
                    var matchesCategory = !filters.category || normalize(card.dataset.category) === filters.category;
                    var matches = matchesQuery && matchesRegion && matchesYear && matchesType && matchesCategory;
                    card.classList.toggle("hidden", !matches);
                    if (matches) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible ? "匹配影片 " + visible + " 部" : "没有匹配影片";
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    selects.forEach(function (select) {
                        select.value = "";
                    });
                    apply();
                });
            }
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
