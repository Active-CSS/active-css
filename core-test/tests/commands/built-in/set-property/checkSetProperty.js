function checkSetProperty(o) {
	let checkSetPropertyEl = _initTest('checkSetProperty');
	if (!checkSetPropertyEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(checkSetPropertyEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_addSuccessClass(checkSetPropertyEl);
	} else {
		_fail(checkSetPropertyEl, 'Failed to remove the disabled property from #setPropertyInput. Element:', el);
	}
}

function checkSetPropertyBefore(o) {
	let checkSetPropertyEl = _initTest('checkSetProperty');
	if (!checkSetPropertyEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(checkSetPropertyEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_fail(checkSetPropertyEl, '#setPropertyInput is not disabled before the test of set-property begins and it shouldn\'t be.');
	}
}
