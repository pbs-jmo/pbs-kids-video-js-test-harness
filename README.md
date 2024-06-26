# PBS KIDS Video JS Barebones Test Harness

## Setup

Install dependencies!

`npm ci`

Then, just run `npm start` or `npm run watch`. The link to your server will be provided in the terminal output.

## Auto-Deployment to AWS Amplify

Commits to the `main` branch of this project trigger an auto-deploy to: <https://pbs-kids-video-js-test-harness.playground.pbskids.org/>.

## Troubleshooting Livestream Issues

I suggest to match configuration from source code on this page:

<https://videojs-http-streaming.netlify.app/?debug=false&autoplay=false&muted=false&fluid=false&minified=false&sync-workers=false&liveui=true&llhls=true&url=https%3A%2F%2Flivestream-staging.pbskids.org%2Fv1%2Fdash%2Fafde4238821a08932ac8931c7b3e89adcbe90300%2Fpbs-kids-livestream-dash%2Fbe85a28e74864a30ba011419f3ddb72d%2Fest-dash-drm.mpd%3Fads.station_id%3Df3842586-2c40-43fa-a79f-841fd5f2b9cb&type=application%2Fdash%2Bxml&keysystems=%7B%0A%20%20%22com.widevine.alpha%22%3A%20%7B%0A%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fproxy.drm.pbs.org%2Flicense%2Fwidevine%2Fest-dash2%22%0A%20%20%7D%0A%7D&buffer-water=false&exact-manifest-timings=false&pixel-diff-selector=false&network-info=false&dts-offset=false&override-native=true&preload=auto&mirror-source=true&forced-subtitles=false>
