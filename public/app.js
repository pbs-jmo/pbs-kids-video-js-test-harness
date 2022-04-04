import {
    isSafari,
    keySystemsHls,
    keySystemsDash,
    livestreamUrls,
    vodUrls,
} from './config.js';

const dashEnabled = window._dashEnabled;

function bindPlayerEvents(player) {
    var isFullscreen = false;
    var playerElement = player.el();

    player.on('fullscreenchange', function () {
        isFullscreen = !isFullscreen;
        playerElement.classList.toggle('is-fullscreen', isFullscreen);
    });
}

const createPlayer = (livestreamEnabled) => {
    document.querySelector('#video-js-version').value = videojs.VERSION;

    videojs.log.level('debug');

    const player = window._player = videojs('video-element',  {
        controls: true,
        autoplay: true,
        preload: 'auto',
        html5: {
            dash: {
                // this enables the use of TTML captions AND lets us style them using our existing customization menu.
                useTTML: true,
            },
        }
    });

    bindPlayerEvents(player);

    if (typeof player.eme === 'function') {
        player.eme();
    }

    const getSourceUrl = (livestream, index = 0) =>
        transformSources(livestream ? livestreamUrls[index] : vodUrls[index]);

    const setSourceUrl = (livestream, index = 0) => {
        const sources = getSourceUrl(livestream, index);
        const url = sources && sources[0] ? sources[0].src : null;
        if (url) {
            console.log('player.src getting set to:', JSON.stringify(sources[0], null, 2));
            player.src(sources[0]);
            currentSrcEle.value = url;
            
            prevBtn.disabled = !getSourceUrl(livestream, index - 1);
            nextBtn.disabled = !getSourceUrl(livestream, index + 1);
        }
    };

    let currentUrlIndex = 0;

    const currentSrcEle = document.querySelector('#current-source-url');
    const nextBtn = document.querySelector('#next-source-url');
    const prevBtn = document.querySelector('#previous-source-url');

    prevBtn.addEventListener('click', () => {
        setSourceUrl(livestreamEnabled, --currentUrlIndex);
    });

    nextBtn.addEventListener('click', () => {
        setSourceUrl(livestreamEnabled, ++currentUrlIndex);
    });

    setSourceUrl(livestreamEnabled);
};

const transformSources = function(video) {
    if (!video) return;

    if (isSafari && video.hlsSrc) {
        // Safari uses an HLS stream
        return [
            {
                src: video.hlsSrc,
                type: 'application/x-mpegURL',
                keySystems: keySystemsHls(video),
            }
        ];
    } else if (video.dashSrc) {
        return [
            {
                src: video.dashSrc,
                type: 'application/dash+xml',
                keySystems: dashEnabled ? undefined : keySystemsHls(video),
                keySystemOptions: dashEnabled ? keySystemsDash(video) : undefined,
            }
        ];
    }

    if (video && typeof video === 'object') {
        const sources = [];
        if (video.URI) {
            sources.push({
                src: video.URI,
                type: 'application/x-mpegURL'
            });
        }
        if (video.mp4) {
            sources.push({
                src: video.mp4,
                type: 'video/mp4'
            });
        }
        return sources;
    }
};

const streamTypeRadioButtons = Array.prototype.slice.call(
    document.querySelectorAll('input[name="stream-type"]')
);

function docReady(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function ready(fn) {
    if (window._dashEnabled) {
        window.dashScript.addEventListener('load', function() {
            docReady(fn);
        });
    } else {
        docReady(fn);
    }
}
  
ready(() => {
    streamTypeRadioButtons.forEach((inputEle) => {
        // init player as stream type already selected
        if (inputEle.checked) {
            createPlayer(
                inputEle.getAttribute('value') === 'livestream'
            );
        }
        // allow the stream type to be dynamically changed by the user
        inputEle.addEventListener('change', function(e) {
            createPlayer(
                e.target.getAttribute('value') === 'livestream'
            );
        });
    });
});