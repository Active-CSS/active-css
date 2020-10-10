function checkEval(o) {
	let testEl = _initTest('checkEval');
	if (!testEl) return;

	if (typeof window.evalResult !== undefined) {
		if (window.evalResult === 2) {
			_addSuccessClass(testEl);
		} else {
			_fail(testEl, 'window.evalResult is being defined in eval check but result doesn\'t equal 2.');
		}
	} else {
		_fail(testEl, 'window.evalResult not being defined in eval check.');
	}
}
