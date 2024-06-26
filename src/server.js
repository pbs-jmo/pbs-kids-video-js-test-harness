import fs from 'fs';
import express from 'express';

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

    app.listen(port, () => {
        console.log(`\n${title} web server is running at ${rootUrl}`);
    });
};

init();
