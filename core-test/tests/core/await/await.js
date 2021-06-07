function checkAwait(o) {
	let checkAwaitEl = _initTest('checkAwait');
	if (!checkAwaitEl) return;

	let el = _getObj('#checkAwaitDiv');

	if (!el) {
		_fail(checkAwaitEl, 'checkAwaitDiv element not found prior to testing await results.');
	} else {
		if (!_hasClassObj(el, 'addClassAwait')) {
			_fail(checkAwaitEl, 'checkAwaitDiv element does not contain class "addClassAwait" as expected. el.outerHTML:', el.outerHTML);
		}
	}

	_addSuccessClass(checkAwaitEl);

}
