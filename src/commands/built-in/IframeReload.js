_a.IframeReload = o => {
	// A cross-domain solution is to clone the iframe, insert before the original iframe and then remove the original iframe.
	let el = o.secSelObj.cloneNode(false);
	o.secSelObj.parentNode.insertBefore(el, o.secSelObj);
	ActiveCSS._removeObj(o.secSelObj);
};
