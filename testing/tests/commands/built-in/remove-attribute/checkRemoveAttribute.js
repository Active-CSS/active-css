function checkRemoveAttribute(o) {
	let testEl = _initTest('checkRemoveAttribute');
	if (!testEl) return;

	let el = _getObj('#removeAttributeDiv');
	if (!el) {
		_fail(testEl, '#removeAttributeDiv not present to perform remove-attribute command.');
	}

	if (!el.hasAttribute('data-test')) {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'Failed to remove the attribute "data-test" from #removeAttributeDiv. Element:', el);
	}
}
