// set-class: "classes with .quotes";
// func: checkSetClassA;
function checkSetClassA(o) {
	let testEl = _initTest('checkSetClass');
	if (!testEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		_fail(testEl, 'Element to test (#setClassBox) is not there.');
		return;
	}

	if (!_hasClassObj(el, 'classes') || !_hasClassObj(el, 'with') || !_hasClassObj(el, 'quotes')) {
		_fail(testEl, 'The classes with .quotes test failed. Element:', el);
	}

	// Check if the old classes are still there. This tests a full replacement.
	if (_hasClassObj(el, 'some') || _hasClassObj(el, 'randomClasses') || _hasClassObj(el, 'in') || _hasClassObj(el, 'here')) {
		_fail(testEl, 'The classes with .quotes test failed because the old classes are still there. Element:', el);
	}
}

// set-class: .someclasses .without .thequotes;
// func: checkSetClassB;
function checkSetClassB(o) {
	let testEl = _initTest('checkSetClass');
	if (!testEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		_fail(testEl, 'Element to test (#setClassBox) is not there. Element:', el);
		return;
	}

	// Check for the new classes.
	if (!_hasClassObj(el, 'someclasses') || !_hasClassObj(el, 'without') || !_hasClassObj(el, 'thequotes')) {
		_fail(testEl, 'The .someclasses .without .thequotes test failed. Element:', el);
	}
}

// set-class: moreclasses with no dots;
// func: checkSetClassFinal;
function checkSetClassFinal(o) {
	let testEl = _initTest('checkSetClass');
	if (!testEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		_fail(testEl, 'Element to test (#setClassBox) is not there. Element:', el);
		return;
	}

	// Check for the new classes.
	if (!_hasClassObj(el, 'moreclasses') || !_hasClassObj(el, 'with') || !_hasClassObj(el, 'no') || !_hasClassObj(el, 'dots')) {
		_fail(testEl, 'The moreclasses with no dots test failed. Element:', el);
	}

	_addSuccessClass(testEl);
}
