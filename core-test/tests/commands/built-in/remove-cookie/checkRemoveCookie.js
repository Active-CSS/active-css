function checkRemoveCookieA(o) {
	let checkRemoveCookieEl = _initTest('checkRemoveCookie');
	if (!checkRemoveCookieEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 != 'Y') {
		_fail(checkRemoveCookieEl, 'removeCookieTest1 cookie is not set at the beginning and it should be.');
	}
}

function checkRemoveCookieFinal(o) {
	let checkRemoveCookieEl = _initTest('checkRemoveCookie');
	if (!checkRemoveCookieEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 == 'Y') {
		_fail(checkRemoveCookieEl, 'removeCookieTest1 cookie is still there and it shouldn\'t be.');
	}

	_addSuccessClass(checkRemoveCookieEl);
}
