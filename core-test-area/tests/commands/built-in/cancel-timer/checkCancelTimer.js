/**
*	The reason this directory has an underscore (_) is that it needs to run before all other tests. They run alphabetically according to directory name.
*	Without the underscore, when the cancel-timer-all command runs it will cancel ALL commands that have a delay set which breaks any other tests that uses a delay
*	So don't remove the underscore. This needs to go into a directory marked _cancel-timer-all, unless you want to move it into a different directory, which I
*	wouldn't recommend as it takes it outside the test suites and will make it harder for people to find.
*/

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
