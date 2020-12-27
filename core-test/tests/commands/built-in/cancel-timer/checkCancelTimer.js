function checkCancelTimerA(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform first cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerB(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform second cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerC(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform third cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerFinal(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform fourth cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
	} else {
		_addSuccessClass(checkCancelTimerEl);
	}
}
