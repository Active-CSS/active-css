function checkRemoveAttribute(o) {
	let checkRemoveAttributeEl = _initTest('checkRemoveAttribute');
	if (!checkRemoveAttributeEl) return;

	let el = _getObj('#removeAttributeDiv');
	if (!el) {
		_fail(checkRemoveAttributeEl, '#removeAttributeDiv not present to perform remove-attribute command.');
	}

	if (!el.hasAttribute('data-test')) {
		_addSuccessClass(checkRemoveAttributeEl);
	} else {
		_fail(checkRemoveAttributeEl, 'Failed to remove the attribute "data-test" from #removeAttributeDiv. Element:', el);
	}
}
