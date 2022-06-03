/*
Findings:

* DRM can't be cached. The POST requests to the license server are unique, so caching them does no good.
* The other requests in a DRM video can be cached, however since there are a lot more files involved, caching them doesn't buy you much. The files used are also seemingly available in more bitrates, so seeking to the beginning after going offline didn't even work.
* Because of these reasons, attempting to cache DRM is not worth it. It may violate license agreements anyhow.
*/

const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

const fetchUrl = async (url, thisRetry = 0) => {
    let fn;
    if (typeof fetch === 'function') {
        fn = fetch;
    } else {
        const loadedModule = await import('node-fetch');
        fn = loadedModule.default;
    }
    const retries = 3;
    return fn(url).catch((e) => {
        if (thisRetry < retries) {
            console.debug(`fetchUrl: retrying ${url} (${thisRetry}/${retries})`, {e});
            return fetchUrl(url, thisRetry + 1);
        } else {
            console.debug(`failed to fetch ${url}`, e);
        }
    });
};

const foundVideoUrlsGlobal = [];

const crawlUrs = async (url) => {
    const foundVideoUrls = [];

    const response = await fetchUrl(url);
    const isRedirected = response.url !== url;
    const responseSize = parseInt(response.headers.get('content-length')?? 0) ;

    totalDownloadedBytes += responseSize;
    totalDownloadedCount++;

    console.debug(`fetched ${url}...`, {responseSize: getMBFromBytes(responseSize), mbSoFar: getMBFromBytes(totalDownloadedBytes), status: `${totalDownloadedCount} / ${foundVideoUrlsGlobal.length}`});

    if (isRedirected && response.url.endsWith('.m3u8')) {
        // console.debug(`redirected to ${response.url}`);
        const foundMore = await crawlUrs(response.url);
        if (foundMore.length) {
            foundVideoUrls.push(...foundMore);
            foundVideoUrlsGlobal.push(...foundMore);
        }
    } else if (!isRedirected && url.endsWith('.m3u8')) {
        const text = await response.text();
        const playlistUrls = getUrlsFromPlaylist(url, text);

        for (const insideUrl of playlistUrls) {
            if (insideUrl.endsWith('.m3u8')) {
                let foundMore = await crawlUrs(insideUrl);
                if (foundMore.length) {
                    foundVideoUrls.push(...foundMore);
                    foundVideoUrlsGlobal.push(...foundMore);
                }
            } else {
                sleep(400);
                await crawlUrs(insideUrl);
                foundVideoUrls.push(insideUrl);
                foundVideoUrlsGlobal.push(insideUrl);
            }
        }
    }
    return foundVideoUrls;
};

const getUrlsFromPlaylist = (url, playlistContents) => {
    const baseHrefPieces = url.split('/');
    baseHrefPieces.pop();
    const baseHref = baseHrefPieces.join('/');

    return playlistContents.split('\n')
        .filter((line) => line.match(/\.[A-Za-z0-9]{2,4}$/))
        .map((file) => {
            if (file.indexOf('//') === -1) {
                return `${baseHref}/${file}`;
            }
            return file;
        });
};

let totalDownloadedBytes = 0;
let totalDownloadedCount = 0;

const getMBFromBytes = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

(async () => {
    // const found = await crawlUrs('https://urs.pbs.org/redirect/6920a3590a78403b99795dc794bffec9/'); // arthur clip
    const found = await crawlUrs('https://urs.pbs.org/redirect/3cfa01d78f07484f83dc73860c37de1d/'); // full episode of daniel tiger
    console.debug({found, length: found.length, totalDownloaded: totalDownloadedBytes, totalDownloadedMB: getMBFromBytes(totalDownloadedBytes)});
})();

