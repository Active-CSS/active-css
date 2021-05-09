function continueAfterElementRemoval_1(o) {
	let continueAfterElementRemovalEl = _initTest('continueAfterElementRemoval');
	if (!continueAfterElementRemovalEl) return;

	let el = _getObj('#continueAfterElementRemoval');
	if (!el) {
		_fail(continueAfterElementRemovalEl, '#continueAfterElementRemoval was not present to perform test.');
	}
}

function continueAfterElementRemovalFinal(o, pars) {
	let continueAfterElementRemovalEl = _initTest('continueAfterElementRemoval');
	if (!continueAfterElementRemovalEl) return;

	let el = _getObj('#continueAfterElementRemoval');
	if (!el) {
		_fail(continueAfterElementRemovalEl, '#continueAfterElementRemoval was still there after it was supposed to be removed.');
	}

	if (pars && pars[0] === 'this ran') {
		_addSuccessClass(continueAfterElementRemovalEl);
	} else {
		_fail(continueAfterElementRemovalEl, 'Failed to continue running actions after element was removed.');
	}
}
