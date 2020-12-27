// Note: This is the same test as the blur command but with different timings - focus-off is an alternative syntax.
function checkFocusOffA(o) {
	let checkFocusOffEl = _initTest('checkFocusOff');
	if (!checkFocusOffEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(checkFocusOffEl, '#focusOffField is not in focus for the first test and it should be.');
	}
}

function checkFocusOffFinal(o) {
	let checkFocusOffEl = _initTest('checkFocusOff');
	if (!checkFocusOffEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOffEl);
	} else {
		_fail(checkFocusOffEl, '#focusOffField in not out of focus at the end.');
	}
}
