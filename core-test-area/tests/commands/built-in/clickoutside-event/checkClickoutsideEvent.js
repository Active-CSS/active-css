function checkClickoutsideEvent(o) {
	let testEl = _initTest('checkClickoutsideEvent');
	if (!testEl) return;

	let bod = document.body;

	if (!_hasClassObj(bod, 'clickoutside1')) {
		_fail(testEl, 'The clickoutside1 class has not been set and should have been.');
	}

	if (!_hasClassObj(bod, 'clickoutside2')) {
		_fail(testEl, 'The clickoutside2 class has not been set and should have been.');
	}
		
	_addSuccessClass(testEl);
}
