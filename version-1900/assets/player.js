(function () {
  var player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }
  var video = player.querySelector('video');
  var trigger = player.querySelector('[data-play-trigger]');
  var stream = player.getAttribute('data-stream');
  var loaded = false;
  var hls = null;

  function loadStream() {
    if (loaded || !video || !stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
    loaded = true;
  }

  function startPlayback() {
    loadStream();
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', startPlayback);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
