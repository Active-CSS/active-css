function checkBlurA(o) {
	let checkBlurEl = _initTest('checkBlur');
	if (!checkBlurEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(checkBlurEl, '#blurField is not in focus for the first test and it should be.');
	}
}

function checkBlurFinal(o) {
	let checkBlurEl = _initTest('checkBlur');
	if (!checkBlurEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkBlurEl);
	} else {
		_fail(checkBlurEl, '#blurField in not out of focus at the end.');
	}
}
