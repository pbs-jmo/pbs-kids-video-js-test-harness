'use strict';

const getAssetUrlWithHash = (path) => {
    const sep = path.indexOf('?') === -1 ? '?' : '&';
    const hash = window.__frontendAssetHashes[path];
    if (!hash) {
        return `./${path}`;
    }
    return `./${path}${sep}hash=${hash}`;
};

const getSourceUrl = async (...args) => {
    const { getSourceUrl: getSourceUrlDRM } = await import( getAssetUrlWithHash('drm.js') );
    const { getSourceUrl: getSourceUrlNoDRM } = await import( getAssetUrlWithHash('non-drm.js') );
    const { drmEnabled } = await import ( getAssetUrlWithHash('config.js') );

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

    player.on('timeupdate', function () {
        player.textTrackSettings.saveSettings();
    });

    // Turn on first caption track by default
    // Source: https://stackoverflow.com/a/19239919
    player.on('loadedmetadata', () => {
        var retried = 1;
        const retryCaptionButton = setInterval(() => {
            const firstCaptionOption = document.querySelector('.vjs-menu-item.vjs-captions-menu-item') || document.querySelector('.vjs-menu-item.vjs-subtitles-menu-item');

            if (firstCaptionOption) {
                firstCaptionOption.click();
                console.info('Enabled captions after ' + retried + ' retries');
                clearInterval(retryCaptionButton);
            } else if (retried >= 10) {
                clearInterval(retryCaptionButton);
                console.error('Failed enabling captions after ' + retried + ' retries');
            }
            retried++;
        }, 400);
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

const logger = console;
const compLogs = window.comparativeLogs = { version: undefined, src: undefined, options: undefined };

/*
Use in console:
copy(JSON.stringify(comparativeLogs, null, 2))
*/

const sortObjectByKeys = (unordered) => Object.keys(unordered).sort().reduce(
    (obj, key) => {
        obj[key] = unordered[key];
        return obj;
    },
    {},
);

const comparativeLog = (versions, src, options, player) => {
    if (versions) {
        const now = new Date().toLocaleDateString('en-US', {
            second: 'numeric',
            minute: 'numeric',
            hour: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: '2-digit',
            hour12: false,
            timeZone: 'America/New_York',
            timeZoneName: 'short',
        });
        compLogs.versions = versions + ' ' + now;
        logger.debug(versions);
    }
    if (src) {
        compLogs.src = src;
        logger.debug('video.js player.src', JSON.stringify(src, null, 2));
    }
    if (options) {
        const tech = sortObjectByKeys(Object.assign({}, player.tech('')));
        delete tech.player_;
        tech.options_ = sortObjectByKeys(tech.options_);

        const textTracks = player.textTracks().tracks_.map((a) => {
            return {
                kind: a.kind,
                label: a.label,
                language: a.language,
                mode: a.mode,
                cues: a.cues,
            };
        });

        compLogs.options = {
            passed: options,
            merged: player.options_,
            tech,
            plugins: Object.keys(videojs.getPlugins()),
            markup: player.el().outerHTML,
            textTracks,
            vhs: videojs.Vhs,
            isSafari: videojs.browser.IS_SAFARI,
            childrenHtml: player.children().map((e) => e.outerHTML || e?.el()?.outerHTML),
            language: player.language(),
        };
        logger.debug('video.js options', JSON.stringify(options, null, 2));
        logger.debug('video.js .options_', JSON.stringify(player.options_, null, 2));
    }
};

const createPlayer = async (livestreamEnabled) => {
    const { drmEnabled } = await import ( getAssetUrlWithHash('config.js') );

    // videojs.log.level('debug');

    const options = {
        controls: true,
        autoplay: true,
        preload: 'auto',
        persistTextTrackSettings: true,
        fluid: true,
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

    const player = window.player = videojs('video-element',  options);

    if (player) {
        comparativeLog(
            `video.js version: ${videojs.VERSION}  ||  EME plugin version: ${videojs.getPlugins().eme.VERSION}  ||  Test Harness`,
            '',
            options,
            player
        );
    }



    bindPlayerEvents(player);

    if (typeof player.eme === 'function' && drmEnabled) {
        player.eme();
    }

    // const initLegacyFairplay = player?.eme?.initLegacyFairplay;

    // if (typeof initLegacyFairplay === 'function') {
    //     // This call allows the latest EME plugin (v5) to work with older and current Fairplay versions.
    //     initLegacyFairplay();
    // }

    const downloadButton = document.querySelector('#download-video');

    const setDownloadButtonState = async(url) => {
        const { isMp4: isUrlMp4 } = await import( getAssetUrlWithHash('non-drm.js') );
        const isMp4 = isUrlMp4(url);
        const isDownloaded = isMp4 && await checkIsCached(url);
        downloadButton.innerHTML = isDownloaded ? 'Already Downloaded!' : downloadButton.getAttribute('data-original-text');
        downloadButton.disabled = !isMp4 || isDownloaded;
    };

    downloadButton.addEventListener('click', async (e) => {
        const source = await getSourceUrl(livestreamEnabled, currentUrlIndex);
        const url = source && source[0] && source[0].src ? source[0].src : null;

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
        const sources = await getSourceUrl(livestream, index);
        const source = sources[0];
        const url = sources && sources[0] ? sources[0].src : null;
        if (url) {
            comparativeLog('', source);
            player.src(source);
            currentSrcEle.value = url;
            currentSrcDesc.value = sources[0].contentDescription || sources[0].URI || sources[0].mp4 || sources[0].src;
            currentSrcDesc.value = (sources[0].keySystemOptions ? '(DRM) ' : '(non-DRM) ') + currentSrcDesc.value;

            prevBtn.disabled = !(await getSourceUrl(livestream, index - 1));
            nextBtn.disabled = !(await getSourceUrl(livestream, index + 1));

            setDownloadButtonState(url);
        }
    };

    let currentUrlIndex = 0;

    const currentSrcEle = document.querySelector('#current-source-url');
    const currentSrcDesc = document.querySelector('#current-source-description');
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
    const { dashEnabled, drmEnabled } = await import ( getAssetUrlWithHash('config.js') );

    const deps = [];

    if (drmEnabled) {
        deps.push( getAssetUrlWithHash('lib/videojs-contrib-eme.js') );

        if (dashEnabled) {
            deps.push( getAssetUrlWithHash('lib/videojs-dash.js') );
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
    // Check reported installed version number against what's actually being loaded
    const installedVideoJsVersion = window.__videoDependencies['video.js'];
    if (installedVideoJsVersion !== videojs.VERSION) {
        throw new Error(`Expected video.js version ${installedVideoJsVersion} but got ${videojs.VERSION}`);
    }

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

const printConfig = async () => {
    const { dashEnabled, drmEnabled } = await import ( getAssetUrlWithHash('config.js') );

    document.querySelector('#harness-config-output').value =
        JSON.stringify(
            {
                drmEnabled,
                dashEnabled,
            },
            null, 2
        );
};
