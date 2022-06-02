const livestreamUrls = [
    {
        URI: 'https://livestream.pbskids.org/out/v1/1e3d77b418ad4a819b3f4c80ac0373b5/est.m3u8',
    },
];

const vodUrls = [
    {
        // Arthur - Library Song
        URI: 'https://urs.pbs.org/redirect/6920a3590a78403b99795dc794bffec9/',
    },
    {
        // full episode of daniel tiger in mp4 format
        mp4: 'https://urs.pbs.org/redirect/690288d36ce8498ead1769490d65115f/',
    },
    {
        // full episode of daniel tiger
        URI: 'https://urs.pbs.org/redirect/3cfa01d78f07484f83dc73860c37de1d/',
    },
];

const transformSources = function(video) {
    if (video && typeof video === 'object') {
        const sources = [];
        if (video.URI) {
            sources.push({
                src: video.URI,
                type: 'application/x-mpegURL'
            });
        }
        if (video.mp4) {
            sources.push({
                src: video.mp4,
                type: 'video/mp4'
            });
        }
        return sources;
    }
};

const getSourceUrl = (livestream, index = 0) => transformSources(livestream ? livestreamUrls[index] : vodUrls[index]);

export {
    getSourceUrl,
    vodUrls,
};
