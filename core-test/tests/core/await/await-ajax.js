function checkAwaitAjax(o) {
	let checkAwaitAjaxEl = _initTest('checkAwaitAjax');
	if (!checkAwaitAjaxEl) return;

	let testTitle = _getObj('#checkAwaitAjaxTestTitle');
	let testAddress = _getObj('#checkAwaitAjaxTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAwaitAjaxEl, 'Ajax command failed to update variables automatically.');
	}

	_addSuccessClass(checkAwaitAjaxEl);

}
