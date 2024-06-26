#!/bin/bash

rm -rf public/lib || exit
mkdir -p public/lib || exit

cp node_modules/videojs-contrib-eme/dist/videojs-contrib-eme.min.js   public/lib || exit 1
cp node_modules/videojs-contrib-dash/dist/videojs-dash.min.js         public/lib || exit 1

cp node_modules/video.js/dist/video.min.js                            public/lib || exit 1
cp node_modules/video.js/dist/video-js.min.css                        public/lib || exit 1

node scripts/asset-hashes.js
