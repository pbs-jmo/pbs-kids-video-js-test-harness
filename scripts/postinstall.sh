#!/bin/bash

rm -rf public/lib || exit
mkdir -p public/lib || exit

cp node_modules/videojs-contrib-eme/dist/videojs-contrib-eme.min.js   public/lib/videojs-contrib-eme.min.js || exit
cp node_modules/videojs-contrib-dash/dist/videojs-dash.min.js         public/lib/videojs-dash.min.js || exit
cp node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.min.js   public/lib/videojs-contrib-hls.min.js || exit

cp node_modules/video.js/dist/video.min.js                            public/lib/video.min.js || exit
cp node_modules/video.js/dist/video-js.min.css                        public/lib/video-js.min.css || exit
