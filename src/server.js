import { writeAssetHashes, generateIndexHtml  } from './asset-hashes.js';

import express from 'express';
import request from 'request';

const port = process.env.PORT || 3047;
const rootUrl = `http://localhost:${port}`;
const title = 'PBS KIDS Video.js Test Harness';

const app = express();

const serverAlreadyRunning = async () => {
    let running = true;
    try {
        await fetch(rootUrl);
    } catch (e) {
        running = false;
    }
    return running;
};

const init = async () => {
    const running = await serverAlreadyRunning();
    if (running) {
        console.log('\nFailed to start local express server. It looks like you may already have a server running?');
        return;
    }

    writeAssetHashes();
    generateIndexHtml();

    // Get around CORS restrictions
    app.get('/proxy', function(req,res) {
        request(req.query.url).pipe(res);
    });

    app.use(express.static('public'));

    app.listen(port, () => {
        console.log(`\n${title} web server is running at ${rootUrl}`);
    });
};

init();
