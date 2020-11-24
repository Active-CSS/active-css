function checkScrollXRight(o) {
	let checkScrollXEl = _initTest('checkScrollX');
	if (!checkScrollXEl) return;

	let el = _getObj('#scrollXBox');

	if (el.scrollLeft != 800) {
		_fail(checkScrollXEl, '#scrollXBox.scrollLeft does not equal 800 for "scroll-x: right;" test.');
	}
}

function checkScrollXHalfway(o) {
	let checkScrollXEl = _initTest('checkScrollX');
	if (!checkScrollXEl) return;

	let el = _getObj('#scrollXBox');

	if (el.scrollLeft != 415) {
		_fail(checkScrollXEl, '#scrollXBox.scrollLeft does not equal 415 for "scroll-x: 415;" test.');
	}
}

function checkScrollXFinal(o) {
	let checkScrollXEl = _initTest('checkScrollX');
	if (!checkScrollXEl) return;

	let el = _getObj('#scrollXBox');

	if (el.scrollLeft != 0) {
		_fail(checkScrollXEl, '#scrollXBox.scrollLeft does not equal 0 for "scroll-x: left;" test.');
	} else {
		_addSuccessClass(checkScrollXEl);
	}
}
