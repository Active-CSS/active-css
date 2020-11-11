function checkLoadScript(o) {
	let testEl = _initTest('checkLoadScript');
	if (!testEl) return;

	if (window._acssTestLoadScriptVar !== true) {
		_fail(testEl, 'window._acssTestLoadScriptVar is not set === true after the test script has loaded.');
	} else {
		_addSuccessClass(testEl);
	}
}
