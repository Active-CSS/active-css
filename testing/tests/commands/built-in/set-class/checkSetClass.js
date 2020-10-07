// set-class: "classes with .quotes";
// func: checkSetClassA;
function checkSetClassA(o) {
	let testEl = _initTest('checkSetClass');
	if (!testEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		console.log('Failure in set-class: Element to test (#setClassBox) is not there.');
		return;
	}

	if (!_hasClassObj(el, 'classes') || !_hasClassObj(el, 'with') || !_hasClassObj(el, 'quotes')) {
		console.log('Failure in set-class: The classes with .quotes test failed.');
		console.log('Element:', el);
		_fail(testEl);
	}

	// Check if the old classes are still there. This tests a full replacement.
	if (_hasClassObj(el, 'some') || _hasClassObj(el, 'randomClasses') || _hasClassObj(el, 'in') || _hasClassObj(el, 'here')) {
		console.log('Failure in set-class: The classes with .quotes test failed because the old classes are still there.');
		console.log('Element:', el);
		_fail(testEl);
	}
}

// set-class: .someclasses .without .thequotes;
// func: checkSetClassB;
function checkSetClassB(o) {
	let testEl = _initTest('checkSetClass');
	if (!testEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		console.log('Failure in set-class: Element to test (#setClassBox) is not there.');
		console.log('Element:', el);
		_fail(testEl);
		return;
	}

	// Check for the new classes.
	if (!_hasClassObj(el, 'someclasses') || !_hasClassObj(el, 'without') || !_hasClassObj(el, 'thequotes')) {
		console.log('Failure in set-class: The .someclasses .without .thequotes test failed.');
		console.log('Element:', el);
		_fail(testEl);
	}
}

// set-class: moreclasses with no dots;
// func: checkSetClassFinal;
function checkSetClassFinal(o) {
	let testEl = _initTest('checkSetClass');
	if (!testEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		console.log('Failure in set-class: Element to test (#setClassBox) is not there.');
		console.log('Element:', el);
		_fail(testEl);
		return;
	}

	// Check for the new classes.
	if (!_hasClassObj(el, 'moreclasses') || !_hasClassObj(el, 'with') || !_hasClassObj(el, 'no') || !_hasClassObj(el, 'dots')) {
		console.log('Failure in set-class: The moreclasses with no dots test failed.');
		console.log('Element:', el);
		_fail(testEl);
	}

	_addSuccessClass(testEl);
}
