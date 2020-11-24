function checkScrollYBottom(o) {
	let checkScrollYEl = _initTest('checkScrollY');
	if (!checkScrollYEl) return;

	let el = _getObj('#scrollYBox');

	if (el.scrollTop != 800) {
		_fail(checkScrollYEl, '#scrollYBox.scrollTop does not equal 800 for "scroll-y: right;" test.');
	}
}

function checkScrollYHalfway(o) {
	let checkScrollYEl = _initTest('checkScrollY');
	if (!checkScrollYEl) return;

	let el = _getObj('#scrollYBox');

	if (el.scrollTop != 415) {
		_fail(checkScrollYEl, '#scrollYBox.scrollTop does not equal 415 for "scroll-y: 415;" test.');
	}
}

function checkScrollYFinal(o) {
	let checkScrollYEl = _initTest('checkScrollY');
	if (!checkScrollYEl) return;

	let el = _getObj('#scrollYBox');

	if (el.scrollTop != 0) {
		_fail(checkScrollYEl, '#scrollYBox.scrollTop does not equal 0 for "scroll-y: left;" test.');
	} else {
		_addSuccessClass(checkScrollYEl);
	}
}
