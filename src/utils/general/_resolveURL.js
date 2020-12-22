const _resolveURL = url => {
	if (inIframe) return url;	// Won't allow changing the URL from an iframe.
	let orig = document.location.href, st = history.state, t = document.title;
	history.replaceState(st, t, url);
	let resUrl = document.location.href;
	history.replaceState(st, t, orig);
	return resUrl;
};
