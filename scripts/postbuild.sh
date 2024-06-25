#!/bin/bash

rm -rf ./.amplify-hosting

mkdir -p ./.amplify-hosting/compute

cp -r ./src ./.amplify-hosting/compute/default
cp -r ./node_modules ./.amplify-hosting/compute/default/node_modules
cp ./package.json ./.amplify-hosting/compute/default/

cp -r public ./.amplify-hosting/compute/default/
touch ./.amplify-hosting/compute/default/deployed-to-amplify

cp deploy-manifest.json ./.amplify-hosting/deploy-manifest.json
