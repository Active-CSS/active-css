function checkToggleClassA(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (!_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(testEl, 'The first toggle did not add the class.');
	}
}



function checkToggleClassFinal(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(testEl, 'The second toggle did not remove the class.');
		return;
	}

	_addSuccessClass(testEl);
}
