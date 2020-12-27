function checkTriggerReal(o) {
	let checkTriggerRealEl = _initTest('checkTriggerReal');
	if (!checkTriggerRealEl) return;

	let el = _getObj('#checkTriggerReal p');
	if (!el) {
		_fail(checkTriggerRealEl, '#checkTriggerReal p not there for the test.');
	} else if (el.innerHTML !== 'Hello. Is it me you\'re looking for too?') {
		_fail(checkTriggerRealEl, 'target div does not contain "Hello. Is it me you\'re looking for too?" after test.');
	} else {
		_addSuccessClass(checkTriggerRealEl);
	}
}

function checkTriggerRealSetUpDocumentEvent(o) {
	let el = document.querySelector('#checkTriggerReal p');
	el.addEventListener('click', function() {
		checkTriggerReal(o);
	});
}
