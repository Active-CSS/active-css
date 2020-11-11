function checkRemove(o) {
	let testEl = _initTest('checkRemove');
	if (!testEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#removeToRemove did not get removed by the remove command.');
	}
}

function checkRemoveBefore(o) {
	let testEl = _initTest('checkRemove');
	if (!testEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_fail(testEl, '#removeToRemove is not present in order to perform the remove test.');
	}
}
