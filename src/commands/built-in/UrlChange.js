_a.UrlChange = o => {
	// Check that url-change hasn't been just run, as if so we don't want to run it twice.
	// Check if there is a page-title in the rules. If so, this needs to be set at the same time, so we know what
	// url to go back to.
	let wot = o.actVal.split(' ');
	let url = wot[0];
	let titl = o.actVal.replace(url, '').trim();
	if (titl == '') {
		// default to current title if no parameter set.
		titl = document.title;
	}
	_urlTitle(url, titl, o);
};
