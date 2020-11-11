function checkSelectAll(o) {
	let testEl = _initTest('checkSelectAll');
	if (!testEl) return;

	console.log(window.getSelection());
	if (window.getSelection() !== 'Some text') {
		_fail(testEl, 'Selected text does not equal "Some text" and it should.');
	} else {
		_addSuccessClass(testEl);
	}
}
