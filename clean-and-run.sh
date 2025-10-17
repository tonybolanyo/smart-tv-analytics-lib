#!/bin/bash

set -e

rm -rf node_modules dist examples/sample-app/node_modules examples/sample-app/dist package-lock.json examples/sample-app/package-lock.json

npm install
npm run build

cd examples/sample-app
npm install
npm start
