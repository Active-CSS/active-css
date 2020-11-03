function checkCreateElement(o) {
	let testEl = _initTest('checkCreateElement');
	if (!testEl) return;

	let el = _getObj('#checkCreateElementDiv');
	if (!el) {
		_fail(testEl, '#checkCreateElementDiv not there to perform test.');
	}

	if (el.innerHTML != 'test1 test2 stringtest') {
		_fail(testEl, 'Reactive attributes did not get rendered correctly in custom element. el.innerHTML:', el.innerHTML);
	}

	_addSuccessClass(testEl);
}
