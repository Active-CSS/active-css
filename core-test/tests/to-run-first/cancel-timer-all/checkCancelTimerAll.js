function checkCancelTimerAllA(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform first cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for first test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllB(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform second cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for second test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllC(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform third cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for third test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllFinal(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform fourth cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for fourth test and it shouldn\'t be there. Element:', el);
		}
		_addSuccessClass(checkCancelTimerAllEl);	// A failed marking will stop a test from passing even if this line is here.
	}
}
