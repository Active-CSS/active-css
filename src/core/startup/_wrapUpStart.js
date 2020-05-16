const _wrapUpStart = () => {
	// The page has been reloaded. Every page in Active CSS must have an element that contains an href linking to it, which when clicked on will perform the
	// actions necessary to redraw the page. The page has just been loaded or reloaded, so there was no object clicked on to perform any actions yet.
	// So we need to find the href in the page that has the url, and based on that, we assume that clicking on this object will perform the correct actions
	// to redraw the page when necessary.
	let url = _resolveURL(window.location.href);
	window.history.replaceState(url, document.title, url);
	setupEnded = true;
};
