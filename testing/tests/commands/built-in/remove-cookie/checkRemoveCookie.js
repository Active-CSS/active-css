function checkRemoveCookieA(o) {
	let testEl = _initTest('checkRemoveCookie');
	if (!testEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 != 'Y') {
		_fail(testEl, 'removeCookieTest1 cookie is not set at the beginning and it should be.');
	}
}

function checkRemoveCookieFinal(o) {
	let testEl = _initTest('checkRemoveCookie');
	if (!testEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 == 'Y') {
		_fail(testEl, 'removeCookieTest1 cookie is still there and it shouldn\'t be.');
	}

	_addSuccessClass(testEl);
}
