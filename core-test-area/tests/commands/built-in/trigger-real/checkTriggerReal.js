function checkTriggerReal(o) {
	let testEl = _initTest('checkTriggerReal');
	if (!testEl) return;

	let el = _getObj('#checkTriggerReal p');
	if (!el) {
		_fail(testEl, '#checkTriggerReal p not there for the test.');
	} else if (el.innerHTML !== 'Hello. Is it me you\'re looking for too?') {
		_fail(testEl, 'target div does not contain "Hello. Is it me you\'re looking for too?" after test.');
	} else {
		_addSuccessClass(testEl);
	}
}

function checkTriggerRealSetUpDocumentEvent(o) {
	let el = document.querySelector('#checkTriggerReal p');
	el.addEventListener('click', function() {
		checkTriggerReal(o);
	});
}
