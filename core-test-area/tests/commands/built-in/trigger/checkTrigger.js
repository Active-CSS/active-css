function checkTrigger(o) {
	let testEl = _initTest('checkTrigger');
	if (!testEl) return;

	let el = _getObj('#checkTrigger p');
	if (!el) {
		_fail(testEl, '#checkTrigger p not there for the test.');
	} else if (el.innerHTML !== 'Hello. Is it me you\'re looking for?') {
		_fail(testEl, 'target div does not contain "Hello. Is it me you\'re looking for?" after test.');
	} else {
		_addSuccessClass(testEl);
	}
}
