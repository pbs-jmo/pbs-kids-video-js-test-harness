var isSafari = videojs.browser.IS_ANY_SAFARI;

var keySystems = (video) => {
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
        hlsSrc: 'https://livestream.pbskids.org/out/v1/2e683b59e3874fe7b0bcd944d8d80fc2/est-hls-drm.m3u8',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/0cbc335f-919f-494a-8987-dd0005e19a6f-hls',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
        dashSrc: 'https://livestream.pbskids.org/out/v1/61da68205f194a9ca76d4a8317497de2/est-dash-drm.mpd',
        widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/0cbc335f-919f-494a-8987-dd0005e19a6f-dash',
        playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/0cbc335f-919f-494a-8987-dd0005e19a6f-dash',
    },
    {
        hlsSrc: 'https://khetdt.lls.cdn.pbs.org/out/v1/c8025cac65da40caab33187346b8c960/hls-drm.m3u8',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/91a2b86d-c975-4264-a86f-dd0dcc9d6cd7-hls',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
    },
];

const vodUrls = [
    {
        hlsSrc: 'https://ga.video-dev.cdn.pbs.org/staging/videos/taz-show/b17cca07-c4e7-4b61-a80a-a7a932c66ab5/41/hd-16x9-mezzanine-1080p/pbs-hls-16x9-1080p.m3u8',
        fairPlayLicenseServerUrl: 'https://proxy.drm.pbs.org/license/fairplay/b17cca07-c4e7-4b61-a80a-a7a932c66ab5',
        fairPlayCertificateServerUrl: 'https://static.drm.pbs.org/fairplay-cert',
        dashSrc: 'https://ga.video-dev.cdn.pbs.org/staging/videos/taz-show/b17cca07-c4e7-4b61-a80a-a7a932c66ab5/41/hd-16x9-mezzanine-1080p/pbs-dash-iso.mpd',
        widevineLicenseUrl: 'https://proxy.drm.pbs.org/license/widevine/b17cca07-c4e7-4b61-a80a-a7a932c66ab5',
        playReadyLicenseUrl: 'https://proxy.drm.pbs.org/license/playready/b17cca07-c4e7-4b61-a80a-a7a932c66ab5',
    }
];

export {
    isSafari,
    keySystems,
    livestreamUrls,
    vodUrls,
};