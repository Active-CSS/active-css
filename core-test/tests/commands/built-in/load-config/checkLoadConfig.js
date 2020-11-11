function checkLoadConfig(o) {
	let testEl = _initTest('checkLoadConfig');
	if (!testEl) return;

	let el = _getObj('#checkLoadConfig div');
	if (!el) {
		_fail(testEl, 'The test div was not drawn prior to the load-config command before run.');
	} else if (el.innerHTML !== 'Here is some text.') {
		_fail(testEl, 'The div did not contain the text "Here is some text." after the test was run.');
	} else {
		_addSuccessClass(testEl);
	}
}
