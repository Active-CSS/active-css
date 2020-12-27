function checkToggleClassA(o) {
	let checkToggleClassEl = _initTest('checkToggleClass');
	if (!checkToggleClassEl) return;

	if (!_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(checkToggleClassEl, 'The first toggle did not add the class.');
	}
}



function checkToggleClassFinal(o) {
	let checkToggleClassEl = _initTest('checkToggleClass');
	if (!checkToggleClassEl) return;

	if (_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(checkToggleClassEl, 'The second toggle did not remove the class.');
		return;
	}

	_addSuccessClass(checkToggleClassEl);
}
