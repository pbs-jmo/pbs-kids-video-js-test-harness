const livestreamUrls = [
    {
        URI: 'https://livestream.pbskids.org/out/v1/1e3d77b418ad4a819b3f4c80ac0373b5/est.m3u8',
    },
];

const vodUrls = [
    {
        // Alma with multiple embedded caption tracks
        URI: 'https://urs.pbs.org/redirect/4700fc9ce3654354b6102d87ae6cee46/'
    },
    {
        // Arthur - Library Song
        URI: 'https://urs.pbs.org/redirect/8dc42c59d89d4455ad76b7637129b634/',
    },
    {
        // full episode of daniel tiger in mp4 format, sourced from https://content.services.pbs.org/v2/kidspbsorg/videos/2365508871/
        mp4: 'https://urs.pbs.org/redirect/3fd6949ffc034c1293c677510bc6c5e1/',
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
