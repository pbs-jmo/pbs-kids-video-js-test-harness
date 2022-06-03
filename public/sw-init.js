(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const logger = window.console;

        /*
        const registerServiceWorker = (url) => {
            try {
                const registration = navigator.serviceWorker.register(url);
                if (registration.installing) {
                    logger.log(`registration: installing | scope: ${registration.scope}`);
                    location.reload();
                } else if (registration.waiting) {
                    logger.log(`registration: waiting | scope: ${registration.scope}`);
                } else if (registration.active) {
                    logger.log(`registration: active | scope: ${registration.scope}`);
                }
            } catch (error) {
                logger.error(`registration: failed with ${error}`);
            }
        };
        */

        // based on: https://codyanhorn.tech/blog/pwa-reload-page-on-application-update
        const registerServiceWorker = (url) => {
            // We are going to track an updated flag and an activated flag.
            // When both of these are flagged true the service worker was updated and activated.
            let installed = false;
            let activated = false;
            navigator.serviceWorker.register(url).then(registration => {
                function checkUpdate() {
                    if (activated && installed) {
                        logger.log('Application was installed and activated -- refreshing the page...');
                        registration.removeEventListener('updatefound', onUpdateFound);
                        window.location.reload();
                    }
                }
                const onUpdateFound = () => {
                    const worker = registration.installing;
                    worker.addEventListener('statechange', () => {
                        // logger.log({ state: worker.state });
                        if (worker.state === 'activated') {
                            // Here is when the activated state was triggered from the lifecycle of the service worker.
                            // This will trigger on the first install and any updates.
                            activated = true;
                            checkUpdate();
                        } else if (worker.state === 'installed') {
                            // Here is when the activated state was triggered from the lifecycle of the service worker.
                            // This will trigger on the first install and any updates.
                            installed = true;
                            checkUpdate();
                        }
                    });
                };
                registration.addEventListener('updatefound', onUpdateFound);
            });
        };

        registerServiceWorker('/sw.js');

        // window.addEventListener('beforeinstallprompt', function(e) {
        //     e.userChoice.then(function(choiceResult) {
        //         logger.log(choiceResult.outcome);
        //         if (choiceResult.outcome === 'dismissed') {
        //             logger.log('User cancelled home screen install');
        //         } else {
        //             logger.log('User added to home screen');
        //         }
        //     });
        // });
    }
})();
