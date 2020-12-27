function checkLoadScript(o) {
	let checkLoadScriptEl = _initTest('checkLoadScript');
	if (!checkLoadScriptEl) return;

	if (window._acssTestLoadScriptVar !== true) {
		_fail(checkLoadScriptEl, 'window._acssTestLoadScriptVar is not set === true after the test script has loaded.');
	} else {
		_addSuccessClass(checkLoadScriptEl);
	}
}
