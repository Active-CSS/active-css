const _urlTitle = (url, titl, o) => {
	if (inIframe) return;
	url = url.replace(/"/g, '');
	titl = titl._ACSSRepQuo();

	let emptyPageClick = false;
	if (url == '') {
		// This should only get called from an in-page event, with the url-change/url-replace command url set to "".
		// This should remove the hash from the URL if it is there, otherwise it will do nothing and assume it's the same page.
		url = window.location.pathname + window.location.search;
		emptyPageClick = true;
	}

	url = _resolveURL(url);

	// Detect if this is a popstate event and skip the next bit if it is. If it is, we don't need to update the URL as it has already changed.
	// Add/change history object if applicable.
	if (window.location.href != url && o.e.type != 'popstate') {	// needs the popstate check, otherwise we add a new history object.
		let attrs = '';

		// If this is a new hash url, get the original page that called this rather than the hash link object so we get the correct underlying page change attributes.
		if (typeof o.secSelObj == 'object') {
			if (emptyPageClick || url.indexOf('#') !== -1) {
				// This has been triggered from this page, so we can simply get the current state attrs value which contains all we need.
				attrs = window.history.state.attrs;
			} else {
				[...o.secSelObj.attributes].forEach((attr) => {
					if (attr.name == 'id') return;	// mustn't set these, otherwise the url could change again in the SPA trigger event.
					attrs += attr.name + '="' + attr.value + '" ';
				});
			}
		}

		let doWhat = (o._urlReplace) ? 'replaceState' : 'pushState';
		window.history[doWhat]({ url, attrs: attrs.trimEnd() }, titl, url);
	}
	_setDocTitle(titl);
};
