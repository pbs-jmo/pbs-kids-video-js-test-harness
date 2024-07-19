const livestreamUrls = [
    {
        URI: 'https://livestream.pbskids.org/out/v1/1e3d77b418ad4a819b3f4c80ac0373b5/est.m3u8',
    },
];

const vodUrls = [
    // Daniel Tiger full episode
    {
        URI: 'https://urs.pbs.org/redirect/2c4144a7d2b544e3864e79f3ac77d901/',
    },
    // Alma with multiple embedded caption tracks
    {
        URI: 'https://urs.pbs.org/redirect/4700fc9ce3654354b6102d87ae6cee46/'
    },
    // Wild Kratts
    {
        URI: 'https://urs.pbs.org/redirect/34ac8d08fe6841f896e5b21aa0b227bc/',
    },
    // Sesame Street full episode
    {
        URI: 'https://urs.pbs.org/redirect/3f250a108e8144d3ad3c6971d4ac8ada/',
    },
    // Arthur - Library Song
    {
        URI: 'https://urs.pbs.org/redirect/8dc42c59d89d4455ad76b7637129b634/',
    },
];

const isMp4 = (url) => {
    return !!vodUrls.find((item) => item.mp4 === url);
};

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

const getSourceUrl = async (livestream, index = 0) => transformSources(livestream ? livestreamUrls[index] : vodUrls[index]);

export {
    getSourceUrl,
    vodUrls,
    isMp4,
};
