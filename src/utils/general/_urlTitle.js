const _urlTitle = (url, titl, o, alsoRemove='') => {
	if (inIframe) return;
	url = url.replace(/"/g, '');
	titl = titl._ACSSRepQuo();

	let emptyPageClick = false;

	if (o._addHash || o._removeHash) {
		let tmpHash = window.location.hash;
		if (tmpHash !== '') {
			tmpHash = tmpHash.substr(1).trim();
		}

		let hashSplit = tmpHash.split('#');
		url = url.substr(1);	// Won't work if adding or removing "#house#corridor", items must be singular.
		let hashSplitLen = hashSplit.length;
		let n, hashIsThere = false, otherHashToRemove = 0, lastHash;

		if (o._removeLastHash && (window.location.protocol != 'file:' || hashSplitLen > 1)) {
			// Remove the last hash in the string. This is all that the remove option supports at the moment.
			// If this is an offline site, don't remove the first hash as it's going to be an underlying page. That's the rule for this option.
			hashSplit.pop();
		}

		for (n = 0; n < hashSplitLen; n++) {
			if (url == hashSplit[n]) {
				hashIsThere = n;
				break;
			}
		}

		if (hashIsThere === false && o._addHash) {
			// Add the hash.
			hashSplit.push(url);
		} else if (hashIsThere !== false && o._removeHash) {
			// Remove the hash.
			hashSplit.splice(hashIsThere, 1);
		}

		url = window.location.pathname + window.location.search + (hashSplit.length > 0 ? '#' + hashSplit.join('#') : '');
		emptyPageClick = true;

	} else if (url == '') {
		// This should only get called from an in-page event, with the url-change/url-replace command url set to "".
		// This should remove the hash from the URL if it is there, otherwise it will do nothing and assume it's the same page.
		let currHash = window.location.hash;
		let lastHash = currHash.lastIndexOf('#');
		if (lastHash !== -1 && lastHash != currHash.indexOf('#')) {
			// If it's an offline SPA with a double-hash, set the URL to the part after the first hash as this will be the SPA root page.
			url = window.location.pathname + window.location.search + currHash.substr(0, lastHash);
		} else {
			url = window.location.pathname + window.location.search;
		}
		emptyPageClick = true;
	}

	url = _resolveURL(url);

	// Detect if this is a popstate event and skip the next bit if it is. If it is, we don't need to update the URL as it has already changed.
	// Add/change history object if applicable.
	if (window.location.href != url && (!o.e || o.e.type != 'popstate')) {	// needs the popstate check, otherwise we add a new history object.
		let attrs = '';

		// If this is a new hash url, get the original page that called this rather than the hash link object so we get the correct underlying page change attributes.
		if (typeof o.secSelObj == 'object') {
			if (!o.secSelObj.__acssFromLink && (emptyPageClick || url.indexOf('#') !== -1)) {
				// This has been triggered from this page, so we can simply get the current state attrs value which contains all we need.
				attrs = window.history.state.attrs || '';
			} else {
				[...o.secSelObj.attributes].forEach(attr => {
					if (attr.name == 'id') return;	// mustn't set these, otherwise the url could change again in the SPA trigger event.
					attrs += attr.name + '="' + attr.value + '" ';
				});
			}
		}

		let doWhat = (o._urlReplace) ? 'replaceState' : 'pushState';

		window.history[doWhat]({ url, attrs: attrs.trimEnd() }, titl, url);
		_setUnderPage();
	}
	_setDocTitle(titl);
};
