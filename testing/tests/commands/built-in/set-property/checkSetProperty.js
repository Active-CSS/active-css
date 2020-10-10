function checkSetProperty(o) {
	let testEl = _initTest('checkSetProperty');
	if (!testEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(testEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'Failed to remove the disabled property from #setPropertyInput. Element:', el);
	}
}

function checkSetPropertyBefore(o) {
	let testEl = _initTest('checkSetProperty');
	if (!testEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(testEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_fail(testEl, '#setPropertyInput is not disabled before the test of set-property begins and it shouldn\'t be.');
	}
}
