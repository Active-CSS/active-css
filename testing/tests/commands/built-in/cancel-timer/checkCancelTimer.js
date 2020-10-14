function checkCancelTimerA(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform first cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerB(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform second cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerC(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform third cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerFinal(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform fourth cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
	} else {
		_addSuccessClass(testEl);
	}
}
