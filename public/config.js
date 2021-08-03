var isSafari = videojs.browser.IS_ANY_SAFARI;

// DRM keySystem for Chrome, Firefox, etc.
var widevineLicenseUrl = 'https://widevine-dash.ezdrm.com/widevine-php/widevine-foreignkey.php?pX=AFB2C5';

// DRM keySystem for Edge
// var playReadyLicenseUrl = 'https://playready.ezdrm.com/cency/preauth.aspx?pX=334B2C';

// DRM keySystem certificate Url for Safari
var fairplayLicenseUri = 'https://fps.ezdrm.com/api/licenses/';
var fairplayCertificateUri = 'https://d2aieihupeq7i1.cloudfront.net/ezdrm-test/fairplay.cer';

var keySystems = {
    // 'com.microsoft.playready': playReadyLicenseUrl,
    'com.widevine.alpha': widevineLicenseUrl,
    'com.apple.fps.1_0': {
        certificateUri: fairplayCertificateUri,
        // dynamically obtain the DRM CID for this HLS asset when the DRM system sees an EXT-X-KEY tag
        getContentId: function (emeOptions, initData) {
            skd_uri = String.fromCharCode.apply(null, new Uint16Array(initData.buffer))
            return skd_uri.split(';')[1]; // e.g. skd://fps.ezdrm.com;<cid>
        },
        // construct license key request on the fly with the CID
        getLicense: function (emeOptions, contentId, keyMessage, callback) {
            const headers = videojs.mergeOptions(
                {'Content-type': 'application/octet-stream'},
                emeOptions.emeHeaders
            );
            videojs.xhr({
                url: fairplayLicenseUri + contentId,
                method: 'POST',
                responseType: 'arraybuffer',
                body: keyMessage,  // fairplay drm challenge
                headers
            }, function (err, response, responseBody) {
                if (err) {
                    callback(err); // return the error to the DRM system
                    return;
                }
                // if the HTTP status code is 4xx or 5xx, the request also failed
                if (response.statusCode >= 400 && response.statusCode <= 599) {
                    let cause = String.fromCharCode.apply(null, new Uint8Array(responseBody));
                    callback({cause}); // return the error from the decoded responseBody to the DRM system
                    return;
                }
            
                // otherwise, request succeeded
                callback(null, responseBody); // return the key to the DRM system
            })
        }
    }
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