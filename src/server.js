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

const isRefererAmplifyUrl = (req) => {
    const pattern = /\/\/([^/]+\.)?pbskids\.org(\/|$)/i;
    return !!req?.headers?.referer?.match(pattern);
};

const isRequestingHostAmplify = (req) => {
    const pattern = /\.pbskids\.org$/;
    return !!req.headers.host.match(pattern);
};

const isProxyRequestAllowed = (req) => {
    return isRequestingHostAmplify(req) && isRefererAmplifyUrl(req);
};

const init = async () => {
    const isDeployedToAmplify = fs.existsSync('deployed-to-amplify');

    const running = await serverAlreadyRunning();
    if (running) {
        console.log('\nFailed to start local express server. It looks like you may already have a server running?');
        return;
    }

    // If running locally, write asset hashes and generate index.html
    // This is done in the postinstall script when deployed to Amazon
    if (!isDeployedToAmplify) {
        const { writeAssetHashes, generateIndexHtml  } =  await import('./asset-hashes.js');
        writeAssetHashes();
        generateIndexHtml();
    }

    app.use(express.static('public'));

    // Get around CORS restrictions
    app.get('/proxy', function(req,res) {
        // Added security when deployed to Amplify. Deny requests from outside sources.
        if (isDeployedToAmplify && !isProxyRequestAllowed(req)) {
            console.error(`Invalid request from ${req.headers?.referer} to ${req.headers?.host}}`);
            throw new Error('Invalid request');
        }

        request(req.query.url).pipe(res);
    });

    app.listen(port, () => {
        console.log(`\n${title} web server is running at ${rootUrl}`);
    });
};

init();
