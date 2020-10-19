function checkSetAttribute(o) {
	let testEl = _initTest('checkSetAttribute');
	if (!testEl) return;

	let el = _getObj('#setAttributeDiv');
	if (!el) {
		_fail(testEl, '#setAttributeDiv not present to perform set-attribute command.');
	}

	if (el.hasAttribute('data-test')) {
		if (el.getAttribute('data-test') == 'some data') {
			_addSuccessClass(testEl);
		} else {
			_fail(testEl, 'Added attribute "data-test" to #setAttributeDiv but it does not contain the text "some data". Element:', el);
		}
	} else {
		_fail(testEl, 'Failed to add the attribute "data-test" to #setAttributeDiv. Element:', el);
	}
}
