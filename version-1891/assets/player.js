import { H as Hls } from "./hls-dru42stk.js";

export function setupPlayer(source) {
    var video = document.getElementById("moviePlayer");
    var shell = document.querySelector(".video-shell");
    var overlay = document.querySelector(".play-overlay");
    var loaded = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function setPlayingState(isPlaying) {
        if (shell) {
            shell.classList.toggle("is-playing", isPlaying);
        }
        if (overlay) {
            if (isPlaying) {
                overlay.setAttribute("hidden", "hidden");
            } else {
                overlay.removeAttribute("hidden");
            }
        }
    }

    function play() {
        load();
        setPlayingState(true);
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                setPlayingState(false);
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        setPlayingState(true);
    });
    video.addEventListener("pause", function () {
        setPlayingState(false);
    });
    video.addEventListener("ended", function () {
        setPlayingState(false);
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
