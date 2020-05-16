_a.Clone = o => {
	let el = _getSel(o, o.actVal);
	let ref = el.dataset.activeid;
	if (el) {
		if (el.tagName == 'IFRAME') {
			if (el.contentWindow.document.readyState != 'complete') {
				// Iframe not ready, come back to this in 200ms to clone.
				setTimeout(_a.Clone.bind(this, o), 200);
				return false;
			}
			mimicClones[ref] = document.importNode(el.contentWindow.document.body, true);
		} else {
			mimicClones[ref] = document.importNode(el, true);
		}
	}
};
