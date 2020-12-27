function checkStyle(o) {
	// Check that the element to remove the class from is definitely there.
	let checkStyleEl = _initTest('checkStyle');
	if (!checkStyleEl) return;

	// Check if the class is no longer there.
	if (checkStyleEl.style.backgroundColor != 'green') {
		_fail(checkStyleEl, 'Green was not set as the background color of the test element.');
		return;
	}

	_addSuccessClass(checkStyleEl);
}
