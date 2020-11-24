function checkLoadConfig(o) {
	let checkLoadConfigEl = _initTest('checkLoadConfig');
	if (!checkLoadConfigEl) return;

	let el = _getObj('#checkLoadConfig div');
	if (!el) {
		_fail(checkLoadConfigEl, 'The test div was not drawn prior to the load-config command before run.');
	} else if (el.innerHTML !== 'Here is some text.') {
		_fail(checkLoadConfigEl, 'The div did not contain the text "Here is some text." after the test was run.');
	} else {
		_addSuccessClass(checkLoadConfigEl);
	}
}
