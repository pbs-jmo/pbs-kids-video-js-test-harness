import { dashEnabled, drmEnabled, isSafari } from './config.js';
import { vodUrls as nonDrmVodUrls } from './non-drm.js';

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

/*
const livestreamUrls = [
    {
        hlsSrc: 'https://urs.pbs.org/redirect/2ed14c04a8c84ef595c72f5262591e92/',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/est-hls',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
        // WETA
        dashSrc: 'https://urs-anonymous-detect.pbs.org/redirect/ef0dca5678d04af9b5829f01a0db34b7/',
        widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/est-dash',
        // // KOTH
        // dashSrc: 'https://urs-anonymous-detect.pbs.org/redirect/56acd22a1a61433eb97d2727b55ae4b5/',
        // widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/est-dash2',
        playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/est-dash',
    },
];
*/

const livestreamCallsigns = [
    'WETA',
    'KOTH',
];

const vodUrls = drmEnabled ? [
    // Sci Girls - Bee Haven
    // {
    //     hlsSrc: 'https://kids.video.cdn.pbs.org/videos/scigirls/b2c32b8c-5efd-40ea-bba4-12080c9b00a6/2000283369/hd-16x9-mezzanine-1080p/c23e8513_sgir208_episode_m1080-hls-16x9-720p.m3u8',
    //     fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/b2c32b8c-5efd-40ea-bba4-12080c9b00a6',
    //     fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
    //     dashSrc: 'https://kids.video.cdn.pbs.org/videos/scigirls/b2c32b8c-5efd-40ea-bba4-12080c9b00a6/2000283369/hd-16x9-mezzanine-1080p/c23e8513_sgir208_episode_m1080-dash-16x9-720p.mpd',
    //     widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/b2c32b8c-5efd-40ea-bba4-12080c9b00a6',
    //     playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/b2c32b8c-5efd-40ea-bba4-12080c9b00a6',
    // },
    // Curious George - George Feels Sheepish
    // source data: https://content.services.pbskids.org/v2/kidsios/videos/2141603345/
    {
        hlsSrc: 'https://urs-anonymous-detect.pbs.org/redirect/004f62ac62204454a1c6d477c19ae4d9/',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/eeb2331a-8aee-47c2-ad1b-bdc03a464f88',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
        dashSrc: 'https://urs-anonymous-detect.pbs.org/redirect/723f2bdef5fc4274a01e040b2a515e5b/',
        widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/eeb2331a-8aee-47c2-ad1b-bdc03a464f88',
        playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/eeb2331a-8aee-47c2-ad1b-bdc03a464f88',
    },
    // a non-DRM asset to test with:
    nonDrmVodUrls[0]
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
] : nonDrmVodUrls;

const transformSources = function(video, contentDescription = '') {
    if (!video) return;

    if (isSafari && video.hlsSrc) {
        // Safari uses an HLS stream
        return [
            {
                contentDescription,
                src: video.hlsSrc,
                type: 'application/x-mpegURL',
                keySystems: keySystemsHls(video),
            }
        ];
    } else if (video.dashSrc) {
        return [
            {
                contentDescription,
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
                contentDescription,
                src: video.URI,
                type: 'application/x-mpegURL'
            });
        }
        if (video.mp4) {
            sources.push({
                contentDescription,
                src: video.mp4,
                type: 'video/mp4'
            });
        }
        return sources;
    }
};

const getSourceUrl = async (livestream, index = 0) => {
    if (livestream) {
        const callsign = livestreamCallsigns[index];
        if (!callsign) {
            return;
        }
        const response = await fetch('/proxy?url=https://pbskids.org/api/puma/video/livestream/' + callsign).then((response) => response.json());

        const fromPumaApi = {
            hlsSrc: response.drm_hls_url,
            fairPlayLicenseServerUrl: response.fairplay_license,
            fairPlayCertificateServerUrl: response.fairplay_certificate,
            dashSrc: response.drm_dash_url,
            widevineLicenseUrl: response.widevine_license,
            playReadyLicenseUrl: response.playready_license,
        };

        return transformSources(fromPumaApi, callsign + ' Livestream');
    }

    return transformSources(vodUrls[index]);
};

export {
    isSafari,
    getSourceUrl,
};
