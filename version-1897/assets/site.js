(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                stop();
                show(dotIndex);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-box]"));
        boxes.forEach(function (box) {
            var section = box.closest("section") || document;
            var search = box.querySelector(".catalog-search");
            var region = box.querySelector(".catalog-region");
            var year = box.querySelector(".catalog-year");
            var type = box.querySelector(".catalog-type");
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var empty = section.querySelector(".no-results");
            function apply() {
                var q = normalize(search && search.value);
                var r = normalize(region && region.value);
                var y = normalize(year && year.value);
                var t = normalize(type && type.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var keywords = normalize(card.getAttribute("data-keywords"));
                    var title = normalize(card.getAttribute("data-title"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var matched = true;
                    if (q && keywords.indexOf(q) === -1 && title.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (r && cardRegion !== r) {
                        matched = false;
                    }
                    if (y && cardYear !== y) {
                        matched = false;
                    }
                    if (t && cardType !== t) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            [search, region, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.setupMoviePlayer = function (source) {
        var shell = document.getElementById("moviePlayer");
        var video = document.getElementById("movieVideo");
        var start = document.getElementById("playerStart");
        var cover = document.getElementById("playerCover");
        var attached = false;
        if (!shell || !video || !source) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }
        function play(event) {
            if (event) {
                event.preventDefault();
            }
            attach();
            shell.classList.add("is-playing");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (start) {
            start.addEventListener("click", play);
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
