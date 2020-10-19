function checkRun(o) {
	let testEl = _initTest('checkRun');
	if (!testEl) return;

	if (typeof window.runResult !== undefined) {
		if (window.runResult === 2) {
			_addSuccessClass(testEl);
		} else {
			_fail(testEl, 'window.runResult is being defined in run check but result doesn\'t equal 2.');
		}
	} else {
		_fail(testEl, 'window.runResult not being defined in run check.');
	}
}
