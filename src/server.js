import { renderFile } from 'ejs';
import express from 'express';
import fs from 'fs';
import request from 'request';

const port = 3047;
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

const frontendAssetHashes = JSON.stringify(JSON.parse(fs.readFileSync('./asset-hashes.json').toString()));

const getAssetUrlWithHash = (path) => {
    const sep = path.indexOf('?') === -1 ? '?' : '&';
    const hash = JSON.parse(frontendAssetHashes)[path];
    if (!hash) {
        return `./${path}`;
    }
    return `./${path}${sep}hash=${hash}`;
};

const init = async () => {
    const running = await serverAlreadyRunning();
    if (running) {
        console.log('\nFailed to start local express server. It looks like you may already have a server running?');
        return;
    }

    // Get around CORS restrictions
    app.get('/proxy', function(req,res) {
        request(req.query.url).pipe(res);
    });

    app.set('views', './public');
    app.engine('html', renderFile);

    app.get('/', function(req,res) {
        return res.render('./index.ejs', {
            frontendAssetHashes,
            getAssetUrlWithHash,
        });
    });

    app.use(express.static('public'));

    app.listen(port, () => {
        console.log(`\n${title} web server is running at ${rootUrl}`);
    });
};

init();
