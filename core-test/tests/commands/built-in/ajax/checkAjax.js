function checkAjax(o) {
	let checkAjaxEl = _initTest('checkAjax');
	if (!checkAjaxEl) return;

	let testTitle = _getObj('#checkAjaxTestTitle');
	let testAddress = _getObj('#checkAjaxTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxEl, 'Ajax command failed to update variables automatically.');
	}

	_addSuccessClass(checkAjaxEl);

}
