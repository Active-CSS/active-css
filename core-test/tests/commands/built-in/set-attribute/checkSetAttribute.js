function checkSetAttribute(o) {
	let checkSetAttributeEl = _initTest('checkSetAttribute');
	if (!checkSetAttributeEl) return;

	let el = _getObj('#setAttributeDiv');
	if (!el) {
		_fail(checkSetAttributeEl, '#setAttributeDiv not present to perform set-attribute command.');
	}

	if (el.hasAttribute('data-test')) {
		if (el.getAttribute('data-test') == 'some data') {
			_addSuccessClass(checkSetAttributeEl);
		} else {
			_fail(checkSetAttributeEl, 'Added attribute "data-test" to #setAttributeDiv but it does not contain the text "some data". Element:', el);
		}
	} else {
		_fail(checkSetAttributeEl, 'Failed to add the attribute "data-test" to #setAttributeDiv. Element:', el);
	}
}
