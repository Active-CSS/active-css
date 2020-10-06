function checkRemoveClass(o) {
	// Check that the element to remove the class from is definitely there.
	let el = _getObj('#checkRemoveClass');
	if (!el) {
		console.log('Unable to test checkRemoveClass as render isn\'t working.');
		return;
	}
	// Check if the class is no longer there.
	if (_hasClassObj(el, 'removeClassToRemove')) {
		return;
	}
	_addSuccessClass(el);
}
