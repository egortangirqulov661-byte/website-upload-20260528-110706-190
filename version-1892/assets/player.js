import { H as Hls } from "./hls.js";

function setupPlayer(wrapper) {
  var video = wrapper.querySelector("video");
  var overlay = wrapper.querySelector(".player-overlay");
  var message = wrapper.querySelector(".player-message");
  var source = wrapper.getAttribute("data-src");
  var hls = null;
  var initialized = false;

  function showMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add("is-visible");
  }

  function hideMessage() {
    if (message) {
      message.classList.remove("is-visible");
    }
  }

  function attachSource() {
    if (!video || !source || initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          showMessage("播放源暂时无法加载，请稍后重试。");
        }
      });

      return;
    }

    showMessage("当前浏览器不支持 HLS 播放。");
  }

  function startPlayback() {
    hideMessage();
    attachSource();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    if (video) {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showMessage("浏览器阻止了自动播放，请点击视频控制条继续播放。");
        });
      }
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!initialized) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(setupPlayer);
});
