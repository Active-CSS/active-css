function checkTakeClassA(o) {
	let checkTakeClassEl = _initTest('checkTakeClass');
	if (!checkTakeClassEl) return;

	// Check if the orange option is selected. That's all we ned to do at this point.
	if (!_hasClassObj(_getObj('#takeClassOrange'), 'taken')) {
		_fail(checkTakeClassEl, 'The orange fruit did not get the class.');
	}
}

function checkTakeClassFinal(o) {
	let checkTakeClassEl = _initTest('checkTakeClass');
	if (!checkTakeClassEl) return;

	// Loop fruits and check that the only one selected is lime.
	let success = false;
	let quit = false;
	document.querySelectorAll('.takeClassFruit').forEach(function (obj, index) {
		if (quit) return;
		if (_hasClassObj(obj, 'taken')) {
			if (obj.id == 'takeClassLime') {
				success = true;
			} else {
				quit = true;
				success = false;
				_fail(checkTakeClassEl, 'Some fruit other than lime still has the class.');
			}
		}
	});
	if (quit) return;
	if (!success) {
		_fail(checkTakeClassEl, 'The lime fruit did not get the class.');
		return;
	}
	_addSuccessClass(checkTakeClassEl);
}
