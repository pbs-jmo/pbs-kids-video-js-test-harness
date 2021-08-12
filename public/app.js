import {
    isSafari,
    keySystems,
    livestreamUrls,
    vodUrls,
} from './config.js';

const createPlayer = (livestreamEnabled) => {
    document.querySelector('#video-js-version').value = videojs.VERSION;

    videojs.log.level('debug');

    const player = videojs('video-element',  {
        controls: true,
        autoplay: true,
        preload: 'auto',
    });

    if (typeof player.eme === 'function') {
        player.eme();
    }

    const getSourceUrl = (livestream, index = 0) =>
        transformSources(livestream ? livestreamUrls[index] : vodUrls[index]);

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
    if (!video) return;

    if (isSafari && video.hlsSrc) {
        // Safari uses an HLS stream
        return [
            {
                src: video.hlsSrc,
                type: 'application/x-mpegURL',
                keySystems: keySystems(video),
            }
        ];
    } else if (video.dashSrc) {
        return [
            {
                src: video.dashSrc,
                type: 'application/dash+xml',
                keySystems: keySystems(video),
            }
        ];
    }
};

const streamTypeRadioButtons = Array.prototype.slice.call(
    document.querySelectorAll('input[name="stream-type"]')
);

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