const createPlayer = (livestreamEnabled) => {
    document.querySelector('#video-js-version').value = videojs.VERSION;

    videojs.log.level('debug');

    const player = videojs('video-element',  {
        controls: true,
        autoplay: true,
        preload: 'auto',
    });

    player.eme();

    const getSourceUrl = (livestream, index = 0) =>
        transformSources(getMockData(livestream, index));

    const setSourceUrl = (livestream, index = 0) => {
        const sources = getSourceUrl(livestream, index);
        const url = sources && sources[0] ? sources[0].src : null;
        if (url) {
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
    if (isSafari && video && video.drm_hls) {
        // Safari uses an HLS stream
        return [
            {
                src: video.drm_hls,
                type: 'application/x-mpegURL',
                keySystems: keySystems,
            }
        ];
    } else if (video && video.drm_dash) {
        return [
            {
                src: video.drm_dash,
                type: 'application/dash+xml',
                keySystems: keySystems,
            }
        ];
    }
};

// Fake returning the correct data from CS:
const getMockData = function(isLivestream, index = 0) {
    if (isLivestream) {
        return {
            drm_hls: livestreamUrls[index],
            drm_dash: livestreamUrls[index],
        };
    } else {
        return {
            drm_hls: vodUrls[index],
            drm_dash: vodUrls[index],
        };
    }
};

createPlayer(true);