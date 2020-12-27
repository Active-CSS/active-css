function checkClickoutsideEvent(o) {
	let checkClickoutsideEventEl = _initTest('checkClickoutsideEvent');
	if (!checkClickoutsideEventEl) return;

	let bod = document.body;

	if (!_hasClassObj(bod, 'clickoutside1')) {
		_fail(checkClickoutsideEventEl, 'The clickoutside1 class has not been set and should have been.');
	}

	if (!_hasClassObj(bod, 'clickoutside2')) {
		_fail(checkClickoutsideEventEl, 'The clickoutside2 class has not been set and should have been.');
	}
		
	_addSuccessClass(checkClickoutsideEventEl);
}
