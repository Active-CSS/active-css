const _cloneAttrs = (el, srcEl) => {
	let attr, attrs = Array.prototype.slice.call(srcEl.attributes);
	for (attr of attrs) {
		if (attr.nodeName == 'href') continue;	// skip the href - we've already got it, otherwise we wouldn't be here.
		// Overwrite what is there, but only if it doesn't exist already.
		if (attr.nodeName == 'class') {
			ActiveCSS._addClassObj(el, attr.nodeValue);
		} else {
			if (!el.getAttribute(attr.nodeName)) el.setAttribute(attr.nodeName, attr.nodeValue);
		}
	}
	el.__acssNavSet = 1;
};
