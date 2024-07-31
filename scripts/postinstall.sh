#!/bin/bash

rm -rf public/lib || exit
mkdir -p public/lib || exit

cp node_modules/videojs-contrib-eme/dist/videojs-contrib-eme.js   public/lib || exit 1
cp node_modules/videojs-contrib-dash/dist/videojs-dash.js         public/lib || exit 1

cp node_modules/video.js/dist/video.js                            public/lib || exit 1
cp node_modules/video.js/dist/video-js.css                        public/lib || exit 1

node scripts/asset-hashes.js
