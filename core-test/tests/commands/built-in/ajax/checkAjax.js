function checkAjax(o) {
	let testEl = _initTest('checkAjax');
	if (!testEl) return;

	let testTitle = _getObj('#checkAjaxTestTitle');
	let testAddress = _getObj('#checkAjaxTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax command failed to update variables automatically.');
	}

	_addSuccessClass(testEl);

}
