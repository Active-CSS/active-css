
	const DEVCORE = (typeof _drawHighlight !== 'undefined') ? true : false;
	if (DEVCORE) {
		console.log('Running Active CSS development edition' + (inIframe ? ' in iframe' : ''));
	}

	// Is there embedded Active CSS? If so, initiate the core.
	document.addEventListener('DOMContentLoaded', function(e) {
		setTimeout(function() {
			// User setup should have started by this point. If not, initialise Active CSS anyway.
			// If there is a user setup initialized, then embedded acss is handled there and not here.
			// This is so that _readSiteMap happens at the end of config accumulation and we can fire all the initalization events at once.
			if (typeof jasmine != 'object' || typeof jasmine.____ACSSTESTRUNNING != 'boolean') { // When used in chromium headless for the core build and test process, DOMContentLoaded is called before all the scripts are loaded which we don't want.
				if (!userSetupStarted) {
					autoStartInit = true;
					ActiveCSS.init();
				}
			}
		}, 0);
	});
}(window, document));
