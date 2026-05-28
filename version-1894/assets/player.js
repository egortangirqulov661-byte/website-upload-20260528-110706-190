(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video[data-m3u8]');
    var button = shell.querySelector('.play-overlay');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-m3u8');
    var hls = null;
    var loaded = false;
    var requested = false;

    function markPlaying() {
      shell.classList.add('is-playing');
    }

    function markIdle() {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    }

    function playVideo() {
      markPlaying();
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    function loadSource() {
      if (loaded || !source) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          capLevelToPlayerSize: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            playVideo();
          }
        });
        return;
      }

      video.src = source;
    }

    function start() {
      requested = true;
      loadSource();
      playVideo();
    }

    button.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', markIdle);
    video.addEventListener('ended', markIdle);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(initPlayer);
})();
