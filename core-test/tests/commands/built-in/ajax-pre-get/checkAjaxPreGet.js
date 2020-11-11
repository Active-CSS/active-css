function checkAjaxPreGetA(o, pars) {
	let testEl = _initTest('checkAjaxPreGet');
	if (!testEl) return;

	if (o.ajaxObj.res.checkAjaxPreGetTitle != 'Rod' || o.ajaxObj.res.checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax-pre-get command not getting the values from the file in o.res.');
	}

	if (o.vars.checkAjaxPreGetTitle == 'Rod' || o.vars.checkAjaxPreGetAddress == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Variables are getting set as scoped variables prior to ajax command and they shouldn\'t be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML == 'Rod' || testAddress.innerHTML == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax-pre-get command is not only updating variables but updating the page and it shouldn\'t.');
	}
}

function checkAjaxPreGetFinal(o, pars) {
	let testEl = _initTest('checkAjaxPreGet');
	if (!testEl) return;

	if (o.vars.checkAjaxPreGetTitle != 'Rod' || o.vars.checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Variables are not getting set as scoped variables after the ajax command and they should be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax command failed to update variables on the page after the prior ajax-pre-get.');
	}

	_addSuccessClass(testEl);
}
