_a.Clone = o => {
	let el = _getSel(o, o.actVal);
	if (el) {
		let ref = _getActiveID(el), obj;
		if (el.tagName == 'IFRAME') {
			if (el.contentWindow.document.readyState != 'complete') {
				// Iframe not ready, come back to this in 200ms to clone.
				setTimeout(_a.Clone.bind(this, o), 200);
				return false;
			}
			el = el.contentWindow.document.body;
		}
		mimicClones[ref] = document.importNode(el, true);
	}
};
