function checkCancelTimerAllA(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform first cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for first test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllB(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform second cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for second test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllC(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform third cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for third test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllFinal(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform fourth cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for fourth test and it shouldn\'t be there. Element:', el);
		}
		_addSuccessClass(testEl);	// A failed marking will stop a test from passing even if this line is here.
	}
}
