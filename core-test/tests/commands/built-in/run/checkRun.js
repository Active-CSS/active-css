function checkRun(o) {
	let checkRunEl = _initTest('checkRun');
	if (!checkRunEl) return;

	if (typeof window.runResult !== undefined) {
		if (window.runResult === 2) {
			_addSuccessClass(checkRunEl);
		} else {
			_fail(checkRunEl, 'window.runResult is being defined in run check but result doesn\'t equal 2.');
		}
	} else {
		_fail(checkRunEl, 'window.runResult not being defined in run check.');
	}
}
