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

	// Create the routing node. We need a real but invisible DOM route so we can trigger a valid click for SPAing.
	let templ = document.createElement('template');
	templ.id = 'data-acss-route';
	templ.insertAdjacentHTML('beforeend', '<div>');		// We do this here so we don't have to check for a child before removing it - it'll be faster in the nav.
	document.body.appendChild(templ);

	if (!document.parentNode) {
		window.addEventListener('popstate', function(e) {
			if (!e.state.url) return;	// could be a hash link.
			if (debuggerActive) {
				_debugOutput('Popstate event');
			}
			let templ = document.querySelector('#data-acss-route'), ok = false;
			if (templ && e.state.attrs) {
				ok = true;
				templ.removeChild(templ.firstChild);
				templ.insertAdjacentHTML('beforeend', '<a ' + e.state.attrs + '>');
				ActiveCSS.trigger(templ.firstChild, 'click');
			} else {
				let url = new URL(e.state.url);
				// Don't change URL if the main page hasn't changed - it's a regular hash that isn't in @pages.
				if (url.href != window.location.href) {
					window.location.href = e.state.url;
				}
			}
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
