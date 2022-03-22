var isSafari = videojs.browser.IS_ANY_SAFARI;

var keySystemsHls = (video) => {
    return {
        // DRM keySystem for Edge
        'com.microsoft.playready': video.playReadyLicenseUrl,
        // DRM keySystem for Chrome, Firefox, etc.
        'com.widevine.alpha': video.widevineLicenseUrl,
        'com.apple.fps.1_0': {
            // dynamically obtain the DRM CID for this HLS asset when the DRM system sees an EXT-X-KEY tag
            getContentId: function (emeOptions, initData) {
                return String.fromCharCode.apply(null, new Uint16Array(initData.buffer));
            },
            certificateUri: video.fairPlayCertificateServerUrl,
            licenseUri: video.fairPlayLicenseServerUrl,
        },
    };
};

var keySystemsDash = function (video) {
    return [
        // DRM keySystem for Chrome, Firefox, etc.
        {
            name: 'com.widevine.alpha',
            options: {
                serverURL: video.widevineLicenseUrl,
                priority: 1,
            },
        },
        // DRM keySystem for Edge
        {
            name: 'com.microsoft.playready',
            options: {
                serverURL: video.playReadyLicenseUrl,
                priority: 2,
            },
        },
    ];
};

/*
from Matt Norton:
GA livestream:
https://khetdt.lls.cdn.pbs.org/out/v1/9964428970e946e2b1eb41bddd0a7b67/dash-drm.mpd

here is a dash stream for PBS KIDS that does NOT have DRM:
https://livestream.pbskids.org/v1/dash/afde4238821a08932ac8931c7b3e89adcbe90300/pbs-kids-livestream-prod/64a29a94d4dd4afabb98e2a14b677797/est.mpd?ads.station_id=f3842586-2c40-43fa-a79f-841fd5f2b9cb

here is that same stream directly from mediapackage, without going through mediatailor:
https://livestream.pbskids.org/out/v1/64a29a94d4dd4afabb98e2a14b677797/est.mpd

one more url:
https://livestream.pbskids.org/out/v1/301c3cc225ca41babca786a6b52d6bf4/est-drm.mpd
that is the DASH + DRM but without mediatailor, so you should never see a 409 there

More URLs:
https://pbs.slack.com/archives/C01MYNDL9K5/p1628680921079800
*/

const livestreamUrls = [
    {
        hlsSrc: 'https://livestream-staging.pbskids.org/out/v1/587e9392056c4a5c8be472499459ebe2/est-hls-drm2.m3u8',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/est-hls2',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
        dashSrc: 'https://livestream-staging.pbskids.org/out/v1/a8637660f49049c69cccd1d8266905a6/est-dash-drm2.mpd',
        widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/est-dash2',
        playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/est-dash2',
    },
];

const vodUrls = [
    // Sci Girls - Bee Haven
    {
        hlsSrc: 'https://kids.video.cdn.pbs.org/videos/scigirls/b2c32b8c-5efd-40ea-bba4-12080c9b00a6/2000283369/hd-16x9-mezzanine-1080p/c23e8513_sgir208_episode_m1080-hls-16x9-720p.m3u8',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/b2c32b8c-5efd-40ea-bba4-12080c9b00a6',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
        dashSrc: 'https://kids.video.cdn.pbs.org/videos/scigirls/b2c32b8c-5efd-40ea-bba4-12080c9b00a6/2000283369/hd-16x9-mezzanine-1080p/c23e8513_sgir208_episode_m1080-dash-16x9-720p.mpd',
        widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/b2c32b8c-5efd-40ea-bba4-12080c9b00a6',
        playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/b2c32b8c-5efd-40ea-bba4-12080c9b00a6',
    },
    // Curious George - George Feels Sheepish
    {
        hlsSrc: 'https://kids.video.cdn.pbs.org/videos/curious-george/eeb2331a-8aee-47c2-ad1b-bdc03a464f88/2000277314/hd-16x9-mezzanine-1080p/cuge507_4_m1080-hls-16x9-720p.m3u8',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/eeb2331a-8aee-47c2-ad1b-bdc03a464f88',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
        dashSrc: 'https://kids.video.cdn.pbs.org/videos/curious-george/eeb2331a-8aee-47c2-ad1b-bdc03a464f88/2000277314/hd-16x9-mezzanine-1080p/cuge507_4_m1080-dash-16x9-720p.mpd',
        widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/eeb2331a-8aee-47c2-ad1b-bdc03a464f88',
        playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/eeb2331a-8aee-47c2-ad1b-bdc03a464f88',
    },
    // a non-DRM asset to test with:
    {
        URI: 'https://kids.video.cdn.pbs.org/videos/curious-george/b9d55a94-4670-4472-9546-9ed6de0f1ea9/27526/hd-mezzanine-16x9/CGSS_3_M1080-16x9-hls-64-2500k_748.m3u8',
        mp4: 'https://kids.video.cdn.pbs.org/videos/curious-george/b9d55a94-4670-4472-9546-9ed6de0f1ea9/27526/hd-mezzanine-16x9/CGSS_3_M1080-16x9-mp4-2500k.mp4',
    },
    /*
    {
        hlsSrc: '',
        fairPlayLicenseServerUrl: '',
        fairPlayCertificateServerUrl: '',
        dashSrc: '',
        widevineLicenseUrl: '',
        playReadyLicenseUrl: '',
    },
    */
];

export {
    isSafari,
    keySystemsHls,
    keySystemsDash,
    livestreamUrls,
    vodUrls,
};