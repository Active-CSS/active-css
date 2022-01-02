ActiveCSS._ifVisible = (o, tot) => {	// tot true is completely visible, false is partially visible. Used by extensions.
	let el, elContainer, aV;
	if (typeof aV === 'object') {	// Used by devtools highlighting.
		aV = o.actVal;
	} else {
		// The optional "scope" parameter determines which container holds the boundary information.
		// No "scope" parameter means that the document itself is the container.
		let aVRes = _extractActionPars(o.actVal, [ 'scope' ], o);
		if (aVRes.scope) {
			// Get scope element.
			elContainer = _getSel(o, aVRes.scope);
		}
		aV = aVRes.action;
	}

	el = (aV._ACSSRepQuo().trim() == '') ? o.secSelObj : _getSel(o, aV);
	if (!el) return false;

	// Check in a container if one is found.
	if (elContainer) return _checkBoundaries(el, elContainer, tot);

	// Container not found. Use the document.
	let rect = el.getBoundingClientRect();
	let elTop = rect.top;
	let elBot = rect.bottom;
	return (tot) ? (elTop >= 0) && (elBot <= window.innerHeight) : elTop < window.innerHeight && elBot >= 0;
};
