function checkUrlChange(o) {
	let checkUrlChangeEl = _initTest('checkUrlChange');
	if (!checkUrlChangeEl) return;

	let urlTestOk = false, titleTestOk = false;

	if (window.location.pathname === '/test/funky/url') {
		urlTestOk = true;
	} else {
		_fail(checkUrlChangeEl, 'url-change failed to change the URL to "/test/funky/url", window.location.pathname:', window.location.pathname);
	}

	if (document.title === 'Funky test URL') {
		titleTestOk = true;
	} else {
		_fail(checkUrlChangeEl, 'url-change failed to change the document.title to "Funky test URL", document.title:', document.title);
	}

	if (urlTestOk && titleTestOk) {
		_addSuccessClass(checkUrlChangeEl);
	}
}
