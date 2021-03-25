const _resolveURL = url => {
	if (inIframe) return url;	// Won't allow changing the URL from an iframe.
	let orig = window.location.href, st = history.state, t = document.title;
	history.replaceState(st, t, url);
	let resUrl = window.location.href;
	history.replaceState(st, t, orig);
	return resUrl;
};
