const _setUpNavAttrs = (el) => {
	let hrf = el.getAttribute('href');
	if (hrf) {
		let pageItem = _getPageFromList(hrf);
		if (pageItem) {
			let tmpDiv = document.createElement('div');
			tmpDiv.insertAdjacentHTML('beforeend', '<a href="' + pageItem.url + '" ' + pageItem.attrs + '>');
			_cloneAttrs(el, tmpDiv.firstChild);
		}
	}
};
