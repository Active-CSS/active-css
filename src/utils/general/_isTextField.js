const _isTextField = el => {
	let tagName = el.tagName;
	if (tagName == 'TEXTAREA') return true;
	if (tagName != 'INPUT') return false;
	if (!el.hasAttribute('type')) return true;
	return (['TEXT', 'PASSWORD', 'NUMBER', 'EMAIL', 'TEL', 'URL', 'SEARCH', 'DATE', 'DATETIME', 'DATETIME-LOCAL', 'TIME', 'MONTH', 'WEEK'].
		indexOf(el.getAttribute('type')) !== -1);
};
