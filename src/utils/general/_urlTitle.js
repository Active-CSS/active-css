const _urlTitle = (url, titl, o) => {
	if (inIframe) return;
	url = url.replace(/"/g, '');
	titl = titl._ACSSRepQuo();
	url = _resolveURL(url);
	if (window.location.href != url) {
		let attrs = '';

		[...o.secSelObj.attributes].forEach((attr) => {
			if (attr.name == 'id') return;
			attrs += attr.name + '="' + attr.value + '" ';
		});

		window.history.pushState({ url, attrs: attrs.trimEnd() }, titl, url);
	}
	_setDocTitle(titl);
};
