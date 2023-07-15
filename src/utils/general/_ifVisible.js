ActiveCSS._ifVisible = (o, tot, context) => {           // tot true is completely visible, false is partially visible. Used by extensions, hence global.
	let el, elContainer, aV;
	if (typeof aV === 'object') {          // Used by devtools highlighting.
		aV = o.actVal;
	} else {
		// The optional "scope" parameter determines which container holds the boundary information.
		// No "scope" parameter means that the document itself is the container.
		let aVRes = _extractBracketPars(o.actVal, [ 'scope' ], o);
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
	let elLeft = rect.left;
	let elRight = rect.right;
	if (context) {
		// This is an X or Y check.
		if (context == 'x') {
			return (tot) ? elLeft >= 0 && elRight <= window.innerWidth : elLeft < window.innerWidth && elRight >= 0;
		} else {
			return (tot) ? elTop >= 0 && elBot <= window.innerHeight : elTop < window.innerHeight && elBot >= 0;
		}
	} else {
		// This is a full check.
		if (tot) {
			return elLeft >= 0 && elRight <= window.innerWidth && elTop >= 0 && elBot <= window.innerHeight;
		} else {
			return elLeft < window.innerWidth && elRight >= 0 && elTop < window.innerHeight && elBot >= 0;
		}
	}
};
