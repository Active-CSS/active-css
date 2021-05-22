function checkAjaxError404(o) {
	let checkAjaxErrorEl = _initTest('checkAjaxError');
	if (!checkAjaxErrorEl) return;

	if (window.checkAjaxErrorVar) {
		_fail(checkAjaxErrorEl, 'Ajax command failed to call 404 error event first for a missing file.');
	}

	window.checkAjaxErrorVar = true;
}

function checkAjaxError(o) {
	let checkAjaxErrorEl = _initTest('checkAjaxError');
	if (!checkAjaxErrorEl) return;

	if (!window.checkAjaxErrorVar) {
		_fail(checkAjaxErrorEl, 'Ajax command failed to call general error event second for a missing file.');
	}

	_addSuccessClass(checkAjaxErrorEl);
}
