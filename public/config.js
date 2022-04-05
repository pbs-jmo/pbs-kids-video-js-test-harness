const isSafari = videojs.browser.IS_ANY_SAFARI;
const drmEnabled = !window.location.search.match(/\bdrmoff=true\b/);
const dashEnabled = drmEnabled && !window.location.search.match(/\bdashoff=true\b/);

export {
    drmEnabled,
    dashEnabled,
    isSafari,
};
