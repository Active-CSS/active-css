// Note: This is the same test as the blur command but with different timings - focus-off is an alternative syntax.
function checkFocusOffA(o) {
	let testEl = _initTest('checkFocusOff');
	if (!testEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOffField is not in focus for the first test and it should be.');
	}
}

function checkFocusOffFinal(o) {
	let testEl = _initTest('checkFocusOff');
	if (!testEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOffField in not out of focus at the end.');
	}
}
