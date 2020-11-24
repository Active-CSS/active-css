function checkRemoveProperty(o) {
	let checkRemovePropertyEl = _initTest('checkRemoveProperty');
	if (!checkRemovePropertyEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(checkRemovePropertyEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_addSuccessClass(checkRemovePropertyEl);
	} else {
		_fail(checkRemovePropertyEl, 'Failed to remove the background-color property from #removePropertyDiv. Element:', el);
	}
}

function checkRemovePropertyBefore(o) {
	let checkRemovePropertyEl = _initTest('checkRemoveProperty');
	if (!checkRemovePropertyEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(checkRemovePropertyEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_fail(checkRemovePropertyEl, '#removePropertyDiv does not have a background-color of green before the test of remove-property begins.');
	}
}
