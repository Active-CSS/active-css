function checkAjaxPreGetA(o, pars) {
	let checkAjaxPreGetEl = _initTest('checkAjaxPreGet');
	if (!checkAjaxPreGetEl) {
		_fail(null, 'Failed to find checkAjaxPreGet element to perform test.');
		return;
	}

console.log(o.ajaxObj.res);

	if (o.ajaxObj.res.checkAjaxPreGetTitle != 'Rod' || o.ajaxObj.res.checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Ajax-pre-get command not getting the values from the file in o.res.');
	}

	if (o.vars.$checkAjaxPreGetTitle == 'Rod' || o.vars.$checkAjaxPreGetAddress == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Variables are getting set as scoped variables prior to ajax command and they shouldn\'t be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML == 'Rod' || testAddress.innerHTML == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Ajax-pre-get command is not only updating variables but updating the page and it shouldn\'t.');
	}
}

function checkAjaxPreGetFinal(o, pars) {
	let checkAjaxPreGetEl = _initTest('checkAjaxPreGet');
	if (!checkAjaxPreGetEl) {
		_fail(null, 'Failed to find checkAjaxPreGet element to perform test.');
		return;
	}

	if (o.vars.$checkAjaxPreGetTitle != 'Rod' || o.vars.$checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Variables are not getting set as scoped variables after the ajax command and they should be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Ajax command failed to update variables on the page after the prior ajax-pre-get.');
	}

	_addSuccessClass(checkAjaxPreGetEl);
}
