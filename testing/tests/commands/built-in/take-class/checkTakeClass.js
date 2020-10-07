function checkTakeClassA(o) {
	let testEl = _initTest('checkTakeClass');
	if (!testEl) return;

	// Check if the orange option is selected. That's all we ned to do at this point.
	if (!_hasClassObj(_getObj('#takeClassOrange'), 'taken')) {
		console.log('Failure in take-class: The orange fruit did not get the class.');
		_fail(testEl);
	}
}

function checkTakeClassFinal(o) {
	let testEl = _initTest('checkTakeClass');
	if (!testEl) return;

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
				console.log('Failure in take-class: Some fruit other than lime still has the class.');
			}
		}
	});
	if (quit) return;
	if (!success) {
		console.log('Failure in take-class: The lime fruit did not get the class.');
		return;
	}
	_addSuccessClass(testEl);
}
