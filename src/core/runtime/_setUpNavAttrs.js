const _setUpNavAttrs = (el, tag) => {
	let hrf = (tag == 'SELECT') ? el.options[el.selectedIndex].getAttribute('data-page') : el.getAttribute('href');
	if (hrf) {
		let pageItem = _getPageFromList(hrf);
		if (pageItem) {
			let tmpDiv = document.createElement('div');
			tmpDiv.insertAdjacentHTML('beforeend', '<a href="' + pageItem.url + '" ' + pageItem.attrs + '>');
			_cloneAttrs(el, tmpDiv.firstChild);
		}
	}
};
