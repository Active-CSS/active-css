function checkRemoveClass(o) {
	// Check that the element to remove the class from is definitely there.
	let checkRemoveClassEl = _initTest('checkRemoveClass');
	if (!checkRemoveClassEl) return;

	// Check if the class is no longer there.
	if (_hasClassObj(checkRemoveClassEl, 'removeClassToRemove')) {
		return;
	}
	_addSuccessClass(checkRemoveClassEl);
}
