const _resolveDynamicIframesDo = (el, iframes) => {
	// Get temporary non-DOM container.
	let tmpDiv = document.createElement('div');

	// Create base iframe. This gives the original defined iframe without the content
	let ref = el.getAttribute('data-ref');
	tmpDiv.innerHTML = _unEscNoVars(iframes[ref].mainTag);
	let iframe = tmpDiv.firstChild;

	iframes[ref].innards = _unEscNoVars(iframes[ref].innards);

	// Attach content to srcdoc.
	iframe.srcdoc = iframes[ref].innards;

	// Replace placeholder with completed iframe.
	el.parentNode.replaceChild(iframe, el);
};
