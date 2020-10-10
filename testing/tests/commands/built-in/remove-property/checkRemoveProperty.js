function checkRemoveProperty(o) {
	let testEl = _initTest('checkRemoveProperty');
	if (!testEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(testEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'Failed to remove the background-color property from #removePropertyDiv. Element:', el);
	}
}

function checkRemovePropertyBefore(o) {
	let testEl = _initTest('checkRemoveProperty');
	if (!testEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(testEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_fail(testEl, '#removePropertyDiv does not have a background-color of green before the test of remove-property begins.');
	}
}
