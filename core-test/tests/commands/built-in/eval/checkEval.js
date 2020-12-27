function checkEval(o) {
	let checkEvalEl = _initTest('checkEval');
	if (!checkEvalEl) return;

	if (typeof window.evalResult !== undefined) {
		if (window.evalResult === 2) {
			_addSuccessClass(checkEvalEl);
		} else {
			_fail(checkEvalEl, 'window.evalResult is being defined in eval check but result doesn\'t equal 2.');
		}
	} else {
		_fail(checkEvalEl, 'window.evalResult not being defined in eval check.');
	}
}
