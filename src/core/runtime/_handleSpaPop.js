const _handleSpaPop = (e, init) => {
	let loc, realUrl, url, pageItem, pageGetUrl, pageItemHash, manualChange, n, triggerOfflinePopstate = false, thisHashStr = '', multipleOfflineHash = false;

	if (init|| !init && !e.state) {
		// This is a manual hash change. By this point, a history object has been created which has no internal state object. So that needs creating and
		// this existing history object needs replacing.
		manualChange = true;
	}

	hashEventTrigger = false;

	loc = window.location;
	if (manualChange) {
		realUrl = loc.href;
	} else {
		realUrl = e.state.url;
	}

	// Get the details of the hash event if there is one.
	if (loc.protocol == 'file:') {
		// The new URL handling will not work with file:// URLs, hence we also need this alternative handling to get the details.
		// (ie. the local files could be anywhere on someone's file system. We can't easily find where the page root is, not for every scenario.)

		// Handle the standalone local SPA format where '/' will be in the URL if there is a hash.
		url = realUrl;
		if (loc.hash != '') {
			// If this is an offline file and there is a hash, then the hash should be the @pages ref.
			pageGetUrl = loc.hash.substr(1);	// Remove the hash at the start.
			let anotherHash = pageGetUrl.indexOf('#');
			if (anotherHash !== -1) {
				// There's at least one more hash. Extract the url up to the first hash - that is our root.
				thisHashStr = pageGetUrl.substr(anotherHash);
				pageGetUrl = pageGetUrl.substr(0, anotherHash);
				multipleOfflineHash = true;
			}
		} else {
			// If there is no hash, assume the url is "/" for the benefit of @pages.
			// This should have a command that initialises this as an SPA rather than assume that every file:// use is an offline SPA.
			pageGetUrl = '/';
		}
		pageItem = _getPageFromList(pageGetUrl);
		triggerOfflinePopstate = true;

	} else {
		if (manualChange) {
			let full = new URL(realUrl);
			url = full.pathname + full.search;
			pageItem = _getPageFromList(url);
		} else {
			pageItem = e.state;
			url = e.state.url;
		}

		thisHashStr = loc.hash;
	}

	// Break up any hashes into an array for triggering in _trigHashState when prompted (either immediately or after ajax events).
	if (thisHashStr != '') {
		// Get the hash trigger if there is one.
		let hashSplit = thisHashStr.split('#');
		let hashSplitLen = hashSplit.length;
		for (n = 0; n < hashSplitLen; n++) {
			if (hashSplit[n] == '') continue;
			pageItemHash = _getPageFromList('#' + hashSplit[n]);
			if (pageItemHash) {
				hashEvents.push(pageItemHash.attrs);
				hashEventTrigger = true;
			}
		}
	}

	let urlObj = { url };
	if (pageItem) urlObj.attrs = pageItem.attrs;

	if (manualChange) {
		// Handle immediate hash event if this is from a page refresh or a manual hash change.
		window.history.replaceState(urlObj, document.title, realUrl);
	}

	if (triggerOfflinePopstate) {
		// If this is an offline SPA and the first page has a hash, trigger the popstate action (not the event) so that we get the correct initial events firing.
		urlObj.attrs += ' href="' + pageGetUrl + '"';	// the href attr will otherwise be empty and not available in config if that's need for an event.
	}

	if (manualChange && hashEventTrigger && !multipleOfflineHash) {
		// Page should be drawn and config loaded, so just trigger the hash event immediately.
		_trigHashState(e);
		return;
	}

	// This is always from a popstate event or an initial page that needs some sort of additional hash handling.
	let templ = document.querySelector('#data-acss-route');
	if ((!init ||
			init &&
			(hashEventTrigger || triggerOfflinePopstate)) &&
			window.location.href.slice(-2) != '#/' &&
			templ &&
			urlObj.attrs
		) {
		templ.removeChild(templ.firstChild);
		templ.insertAdjacentHTML('beforeend', '<a ' + urlObj.attrs + '>');
		ActiveCSS.trigger(templ.firstChild, 'click', null, null, null, null, e);
	}
};
