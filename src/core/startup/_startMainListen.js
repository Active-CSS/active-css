const _startMainListen = () => {
	// Set up the back and forward buttons so they call the last proper page and don't change anything in the browser history.
	// Only do this once when the page loads, and only if the user hasn't set up a specific handling in the config.
	window.addEventListener('message', function(e) {
		if (e.origin !== window.location.origin || e.data.source == 'causejs-devtools-extension') return;
		var m = e.data;
		switch (m.type) {
			case 'activecss-unloading':
			case 'activecss-loaded':
				// Run an unloading or a loaded event through the config for the iframe.
				let el = document.getElementById(m.el);
				_handleEvents({ obj: el, evType: typ });
				break;
		}
	});
	if (!document.parentNode) {
		window.addEventListener('popstate', function(e) {
			let page = e.state, obj;
			if (!page) return;	// could be a hash link.
			if (debuggerActive) {
				_debugOutput('Popstate event');
			}
			let templ = document.querySelector('#data-active-pages');
			let ok = false;
			if (page && templ) {
				let full = new URL(page);
				let shortAttr = full.pathname + full.search;
				let navEl = templ.querySelector('a[href="' + shortAttr + '"]');
				if (navEl) {
					ActiveCSS.trigger(navEl, 'click');
					ok = true;
				}
			}
			if (!ok) window.location.href = page;		// Not found - redirect.
		});
	} else {
		// If this is an iframe, we are going to send an src change message to the parent whenever the iframe changes
		// page, so we can get an unload event on the parent iframe.
		window.addEventListener('beforeunload', function(e) {
			// Don't clash names with a native DOM event.
			parent.postMessage({ 'type': 'activecss-unloading', 'el': window.frameElement.id}, window.location.origin);
		});
		// CJS has finished loading, set message to parent saying the page has loaded.
		parent.postMessage({ 'type': 'activecss-loaded', 'el': window.frameElement.id}, window.location.origin);
	}

	// Get and set the page we are starting on.
	currentPage = location.pathname;

	// Bring in any session or local storage variables before we start observing for variable changes.
	_restoreStorage();

	// Set up listening for changes to scoped variables.
	scopedProxy = _observableSlim.create(scopedOrig, true, ActiveCSS._varUpdateDom);	// batch changes.
};
