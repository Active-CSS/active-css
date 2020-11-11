/*	This is a valid test, but Chrome headless does not support the copy event. If it ever does then this can be re-implemented.*/

function checkCopyToClipboard(o) {
	let testEl = _initTest('checkCopyToClipboard');
	if (!testEl) return;

	// It gets into this function from the copy event, the test has passed. There appears to be no way to read the contents of the clipboard reliably.
	_addSuccessClass(testEl);
}
