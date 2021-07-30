var isSafari = videojs.browser.IS_ANY_SAFARI;

// DRM keySystem for Chrome, Firefox, etc.
var widevineLicenseUrl = 'https://widevine-dash.ezdrm.com/widevine-php/widevine-foreignkey.php?pX=AFB2C5';

// DRM keySystem for Edge
// var playReadyLicenseUrl = 'https://playready.ezdrm.com/cency/preauth.aspx?pX=334B2C';

// DRM keySystem certificate Url for Safari
var fairplayLicenseResource = 'skd://fps.ezdrm.com/;90656106-9ae3-45f1-adf9-1c21aeeed82d';
var fairplayLicenseUri = 'https://fps.ezdrm.com/api/licenses/' + fairplayLicenseResource.split(';')[1];
var fairplayCertificateUri = 'https://d2aieihupeq7i1.cloudfront.net/ezdrm-test/fairplay.cer';

var keySystems = {
    // 'com.microsoft.playready': playReadyLicenseUrl,
    'com.widevine.alpha': widevineLicenseUrl,
    'com.apple.fps.1_0': {
        certificateUri: fairplayCertificateUri,
        licenseUri: fairplayLicenseUri,
    },
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
*/

const livestreamUrls = isSafari ? [
    'https://livestream.pbskids.org/v1/master/afde4238821a08932ac8931c7b3e89adcbe90300/pbs-kids-livestream-prod/3460df409e89470dbcd4972357063583/est-drm.m3u8?ads.station_id=f3842586-2c40-43fa-a79f-841fd5f2b9cb',
] : [
    'https://livestream.pbskids.org/v1/dash/afde4238821a08932ac8931c7b3e89adcbe90300/pbs-kids-livestream-prod/301c3cc225ca41babca786a6b52d6bf4/est-drm.mpd?ads.station_id=f3842586-2c40-43fa-a79f-841fd5f2b9cb',
    'https://khetdt.lls.cdn.pbs.org/out/v1/9964428970e946e2b1eb41bddd0a7b67/dash-drm.mpd',
    'https://livestream.pbskids.org/v1/dash/afde4238821a08932ac8931c7b3e89adcbe90300/pbs-kids-livestream-prod/64a29a94d4dd4afabb98e2a14b677797/est.mpd?ads.station_id=f3842586-2c40-43fa-a79f-841fd5f2b9cb',
    'https://livestream.pbskids.org/out/v1/64a29a94d4dd4afabb98e2a14b677797/est.mpd',
    'https://livestream.pbskids.org/out/v1/301c3cc225ca41babca786a6b52d6bf4/est-drm.mpd',
];

const vodUrls = isSafari ? [
    'https://ga.video.cdn.pbs.org/videos/our-land-new-mexicos-environmental-past-present-and-future/1c997b72-1412-4a1f-8d36-6dee3db00f91/2000233282/hd-16x9-mezzanine-1080p-drm/1402ourlandannivandgilaupdate-hls-16x9-1080p.m3u8',
] : [
    'https://ga.video.cdn.pbs.org/videos/drm-test/ed008251-f328-4fbb-bed6-9a21ff4c7b28/dash-cenc/4ncw182043lorrainescoffee-mux.mpd',
];