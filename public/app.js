import { drmEnabled, dashEnabled, isSafari } from './config.js';
import { getSourceUrl as getSourceUrlDRM } from './drm.js';
import { getSourceUrl as getSourceUrlNoDRM, isMp4 as isUrlMp4 } from './non-drm.js';

const getSourceUrl = (...args) => {
    if (drmEnabled) {
        return getSourceUrlDRM(...args);
    } else {
        return getSourceUrlNoDRM(...args);
    }
};

function bindPlayerEvents(player) {
    var isFullscreen = false;
    var playerElement = player.el();

    player.on('fullscreenchange', function () {
        isFullscreen = !isFullscreen;
        playerElement.classList.toggle('is-fullscreen', isFullscreen);
    });
}

const awaitPreCaching = async (url) => {
    return new Promise((resolve) => {
        const check = (event) => {
            if (event.data.eventType === 'cacheComplete' && event.data.url === url) {
                resolve(event.data);
                navigator.serviceWorker.removeEventListener('message', check);
            }
        };
        navigator.serviceWorker.addEventListener('message', check);
    });
};

const checkIsCached = async (url) => {
    const serviceWorker = await navigator.serviceWorker.ready;

    serviceWorker.active.postMessage({
        checkIsCached: url,
    });

    return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.eventType === 'checkIsCachedComplete' && event.data.url === url) {
                resolve(event.data.isCached);
            }
        });
    });
};

const preCache = async (urls) => {
    const serviceWorker = await navigator.serviceWorker.ready;

    serviceWorker.active.postMessage({
        cacheViaAddAll: urls,
    });

    return Promise.all(urls.map(awaitPreCaching));
};

navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.eventType === 'cacheComplete' && event.data.source === 'cache.addAll') {
        console.debug(`${event.data.url} was downloaded in ${(event.data.duration / 1000).toFixed(2)} seconds!`);
    } else {
        console.debug('A message from the Service Worker!', event.data);
    }
});

const createPlayer = (livestreamEnabled) => {
    document.querySelector('#video-js-version').value = videojs.VERSION;

    // videojs.log.level('debug');

    const options = {
        controls: true,
        autoplay: true,
        preload: 'auto',
        html5: {},
    };

    if (window._player) {
        window._player.dispose();
    }

    var playerElement = document.createElement('video');
    playerElement.setAttribute('id', 'video-element');
    playerElement.classList.add('video-js', 'video-element');
    var playerWrapper = document.querySelector('.player-wrapper');
    playerWrapper.prepend(playerElement);

    if (dashEnabled) {
        options.html5.dash = {
            // this enables the use of TTML captions AND lets us style them using our existing customization menu.
            useTTML: true,
        };
    }

    const player = window._player = videojs('video-element',  options);

    bindPlayerEvents(player);

    if (typeof player.eme === 'function' && drmEnabled) {
        player.eme();
    }

    const downloadButton = document.querySelector('#download-video');

    const setDownloadButtonState = async(url) => {
        const isMp4 = isUrlMp4(url);
        const isDownloaded = isMp4 && await checkIsCached(url);
        downloadButton.innerHTML = isDownloaded ? 'Already Downloaded!' : downloadButton.getAttribute('data-original-text');
        downloadButton.disabled = !isMp4 || isDownloaded;
    };

    downloadButton.addEventListener('click', async (e) => {
        const url = getSourceUrl(livestreamEnabled, currentUrlIndex)?.[0]?.src;

        if (url) {
            e.target.disabled = true;
            await preCache(
                [
                    url,
                ],
            );
            setDownloadButtonState(url);
        }
    });

    const setSourceUrl = async (livestream, index = 0) => {
        const sources = getSourceUrl(livestream, index);
        const url = sources && sources[0] ? sources[0].src : null;
        if (url) {
            console.log('player.src getting set to:', JSON.stringify(sources[0], null, 2));
            player.src(sources[0]);
            currentSrcEle.value = url;

            prevBtn.disabled = !getSourceUrl(livestream, index - 1);
            nextBtn.disabled = !getSourceUrl(livestream, index + 1);

            setDownloadButtonState(url);
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

async function ready(fn) {
    const deps = [];

    if (drmEnabled) {
        if (isSafari) {
            deps.push('./lib/videojs-contrib-hls.min.js');
        }

        deps.push('./lib/videojs-contrib-eme.min.js');

        if (dashEnabled) {
            deps.push('./lib/videojs-dash.min.js');
        }
    }

    await Promise.all(deps.map(loadScript));

    docReady(fn);
}

const loadScript = (url) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
});

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

    printConfig();
});

const printConfig = () => {
    document.querySelector('#harness-config-output').value =
        JSON.stringify(
            {
                drmEnabled,
                dashEnabled,
            },
            null, 2
        );
};
