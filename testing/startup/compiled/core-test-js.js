/*jshint strict:false */

function _addSuccessClass(objOrStr) {
	let el = (typeof objOrStr == 'object') ? objOrStr : _getObj(str);
	el.classList.add('success');
}

function _fail(testEl) {
	testEl.classList.add('failed');
}
function _getObj(str, doc=document) {
	let obj = (str == 'body') ? doc.body : doc.querySelector(str);
	return (obj) ? obj : false;
}

function _hasClassObj(obj, str) {
	if (!obj) return false;
	return obj.classList.contains(str) || false;
}

function _initTest(testID) {
	// Check test element is there.
	let testEl = _getObj('#' + testID);
	if (!testEl) {
		console.log('Unable to test ' + testID + ' as render/component drawing/something isn\'t working.');
		return null;
	}

	// Check if the test element has failed from a previous test.
	if (_hasClassObj(testEl, 'failed')) return null;

	// Ok to continue with test. Return the containing test element.
	return testEl;
}

// No js needed for this checkAddClass test.
// Just need to make this test successful, so we can just replace the native alert call with a success updater.
// Alert should only need to be tested once in the tests. Active CSS shouldn't *ever* produce any alert notifications.
window.alert = function(idToMarkSuccessFul) {
	// Out of scope of everything so need to do a manual update on the test element.
	let el = document.getElementById(idToMarkSuccessFul);
	el.classList.add('success');
};

function checkStyle(o) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkStyle');
	if (!testEl) return;

	// Check if the class is no longer there.
	if (testEl.style.backgroundColor != 'green') {
		console.log('Failure in style: Green was not set as the background color of the test element.');
		return;
	}
	_addSuccessClass(testEl);
}

function checkRemoveClass(o) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkRemoveClass');
	if (!testEl) return;

	// Check if the class is no longer there.
	if (_hasClassObj(testEl, 'removeClassToRemove')) {
		return;
	}
	_addSuccessClass(testEl);
}

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

function checkTakeClassA(o) {
	let testEl = _initTest('checkTakeClass');
	if (!testEl) return;

	// Check if the orange option is selected. That's all we ned to do at this point.
	if (!_hasClassObj(_getObj('#takeClassOrange'), 'taken')) {
		console.log('Failure in take-class: The orange fruit did not get the class.');
		_fail(testEl);
	}
}

function checkTakeClassFinal(o) {
	let testEl = _initTest('checkTakeClass');
	if (!testEl) return;

	// Loop fruits and check that the only one selected is lime.
	let success = false;
	let quit = false;
	document.querySelectorAll('.takeClassFruit').forEach(function (obj, index) {
		if (quit) return;
		if (_hasClassObj(obj, 'taken')) {
			if (obj.id == 'takeClassLime') {
				success = true;
			} else {
				quit = true;
				success = false;
				console.log('Failure in take-class: Some fruit other than lime still has the class.');
			}
		}
	});
	if (quit) return;
	if (!success) {
		console.log('Failure in take-class: The lime fruit did not get the class.');
		return;
	}
	_addSuccessClass(testEl);
}

function checkToggleClassA(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (!_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		console.log('Failure in toggle-class: The first toggle did not add the class.');
		_fail(testEl);
	}
}



function checkToggleClassFinal(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		console.log('Failure in toggle-class: The second toggle did not remove the class.');
		return;
	}

	_addSuccessClass(testEl);
}
