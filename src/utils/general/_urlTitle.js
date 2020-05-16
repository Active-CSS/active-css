const _urlTitle = (url, titl, o) => {
	url = url.replace(/"/g, '');
	titl = titl.replace(/"/g, '');
	url = _resolveURL(url);
	if (window.location.href != url) {
		window.history.pushState(url, titl, url);
	}
	document.title = titl;
};
