function checkRemove(o) {
	let checkRemoveEl = _initTest('checkRemove');
	if (!checkRemoveEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_addSuccessClass(checkRemoveEl);
	} else {
		_fail(checkRemoveEl, '#removeToRemove did not get removed by the remove command.');
	}
}

function checkRemoveBefore(o) {
	let checkRemoveEl = _initTest('checkRemove');
	if (!checkRemoveEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_fail(checkRemoveEl, '#removeToRemove is not present in order to perform the remove test.');
	}
}
