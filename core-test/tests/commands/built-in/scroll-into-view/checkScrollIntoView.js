function checkScrollIntoViewA(o) {
	let checkScrollIntoViewEl = _initTest('checkScrollIntoView');
	if (!checkScrollIntoViewEl) return;

	let el = _getObj('#checkScrollIntoViewDiv');

	if (_isPartiallyVisible(el)) {
		_fail(checkScrollIntoViewEl, 'Test element #checkScrollIntoViewDiv should not be visible prior to test.');
	}
}

function checkScrollIntoViewFinal(o) {
	let checkScrollIntoViewEl = _initTest('checkScrollIntoView');
	if (!checkScrollIntoViewEl) return;

	let el = _getObj('#checkScrollIntoViewDiv');

	if (!_isPartiallyVisible(el)) {
		_fail(checkScrollIntoViewEl, 'Test element #checkScrollIntoViewDiv is not in view at the end of the test.');
	}

	_addSuccessClass(checkScrollIntoViewEl);
}
