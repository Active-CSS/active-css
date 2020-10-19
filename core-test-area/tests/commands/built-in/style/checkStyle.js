function checkStyle(o) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkStyle');
	if (!testEl) return;

	// Check if the class is no longer there.
	if (testEl.style.backgroundColor != 'green') {
		_fail(testEl, 'Green was not set as the background color of the test element.');
		return;
	}

	_addSuccessClass(testEl);
}
