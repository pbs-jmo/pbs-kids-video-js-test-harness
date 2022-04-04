const livestreamUrls = [
    {
        URI: 'https://livestream.pbskids.org/out/v1/1e3d77b418ad4a819b3f4c80ac0373b5/est.m3u8',
    },
];

const vodUrls = [
    {
        URI: 'https://kids.video.cdn.pbs.org/videos/curious-george/b9d55a94-4670-4472-9546-9ed6de0f1ea9/27526/hd-mezzanine-16x9/CGSS_3_M1080-16x9-hls-64-2500k_748.m3u8',
        mp4: 'https://kids.video.cdn.pbs.org/videos/curious-george/b9d55a94-4670-4472-9546-9ed6de0f1ea9/27526/hd-mezzanine-16x9/CGSS_3_M1080-16x9-mp4-2500k.mp4',
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
