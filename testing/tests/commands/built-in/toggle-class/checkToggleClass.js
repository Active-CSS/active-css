function checkToggleClassA(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (!_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		console.log('Failure in toggle-class: The first toggle did not add the class.');
		_fail(testEl);
	}
}



function checkToggleClassFinal(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		console.log('Failure in toggle-class: The second toggle did not remove the class.');
		return;
	}

	_addSuccessClass(testEl);
}
