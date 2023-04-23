const _setUpNavAttrs = (el, tag) => {
	let hrf = (tag == 'SELECT') ? el.options[el.selectedIndex].getAttribute('data-page') : el.getAttribute('href');
	if (hrf) {
		let hashPos = hrf.indexOf('#');
		let pageHrf = (hashPos !== -1) ? hrf.substring(0, hashPos) : hrf;
		let pageItem = _getPageFromList(pageHrf);
		if (pageItem) {
			let tmpDiv = document.createElement('div');
			tmpDiv.insertAdjacentHTML('beforeend', '<a href="' + pageItem.url + '" ' + pageItem.attrs + '>');
			_cloneAttrs(el, tmpDiv.firstChild);
			if (hashPos !== -1) {
				el.__acssNavHash = hrf.substring(hashPos);
			}
			el.__acssNavHrf = hrf;
		}
	}
};
