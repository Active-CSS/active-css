function checkBlurA(o) {
	let testEl = _initTest('checkBlur');
	if (!testEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(testEl, '#blurField is not in focus for the first test and it should be.');
	}
}

function checkBlurFinal(o) {
	let testEl = _initTest('checkBlur');
	if (!testEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#blurField in not out of focus at the end.');
	}
}
