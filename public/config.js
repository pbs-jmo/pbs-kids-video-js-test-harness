const isSafari = videojs.browser.IS_ANY_SAFARI;
const drmEnabled = !window.location.search.match(/\bdrmoff=true\b/);
const dashEnabled = !isSafari && drmEnabled && window.location.search.match(/\bdashon=true\b/);

export {
    drmEnabled,
    dashEnabled,
    isSafari,
};
