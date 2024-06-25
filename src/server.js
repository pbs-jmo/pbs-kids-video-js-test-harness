import fs from 'fs';
import express from 'express';
import request from 'request';

const port = process.env.PORT || 3000;
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

const listDirTest = (path) => {
    console.log('listing for path', path, fs.readdirSync(path, { recursive: true }).join(' | '));
};

const init = async () => {
    const running = await serverAlreadyRunning();
    if (running) {
        console.log('\nFailed to start local express server. It looks like you may already have a server running?');
        return;
    }

    // If running locally, write asset hashes and generate index.html
    // This is done in the postinstall script when deployed to Amazon
    if (fs.existsSync('public')) {
        const { writeAssetHashes, generateIndexHtml  } =  await import('./asset-hashes.js');
        writeAssetHashes();
        generateIndexHtml();

        app.use(express.static('public'));
    } else {
        listDirTest('./');
        listDirTest('../');
        listDirTest('../../');
        listDirTest('../../static');

        app.use(express.static('../../static'));
    }

    // Get around CORS restrictions
    app.get('/proxy', function(req,res) {
        request(req.query.url).pipe(res);
    });

    app.listen(port, () => {
        console.log(`\n${title} web server is running at ${rootUrl}`);
    });
};

init();
