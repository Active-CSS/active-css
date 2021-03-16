const _urlTitle = (url, titl, o) => {
	if (inIframe) return;
	url = url.replace(/"/g, '');
	titl = titl._ACSSRepQuo();
	url = _resolveURL(url);
	if (window.location.href != url) {
		window.history.pushState(url, titl, url);
	}
	_setDocTitle(titl);
};
