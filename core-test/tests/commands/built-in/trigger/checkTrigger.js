function checkTrigger(o) {
	let checkTriggerEl = _initTest('checkTrigger');
	if (!checkTriggerEl) return;

	let el = _getObj('#checkTrigger p');
	if (!el) {
		_fail(checkTriggerEl, '#checkTrigger p not there for the test.');
	} else if (el.innerHTML !== 'Hello. Is it me you\'re looking for?') {
		_fail(checkTriggerEl, 'target div does not contain "Hello. Is it me you\'re looking for?" after test.');
	} else {
		_addSuccessClass(checkTriggerEl);
	}
}
