/*jshint strict:false */

function _addSuccessClass(objOrStr) {
	let el = (typeof objOrStr == 'object') ? objOrStr : _getObj(str);
	if (_hasClassObj(el, 'failed')) return;
	el.classList.add('success');
}

function _fail(testEl, message=null, par1=null) {
	testEl.classList.add('failed');
	if (message) {
		if (par1) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1);
		} else {
			console.log('Failure in ' + testEl.id + ': ' + message);
		}
	}
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

/*
	Still to set up:
// func: checkFuncArr [1, 2, "cheesey wotsit"];
// func: checkFuncObj {dave: "hi"};
// func: checkFuncWinVar window.globIt;
// func: checkFuncACSSVar {myACSSVariable};
// func: checkFuncExpr {= 7 + 10 =};
// func: checkFuncCombined [1, 2, "cheesey wotsit"] {dave: "hi"} window.globIt {myACSSVariable} {= new Date =};
*/

// func: checkFuncNum 8;
function checkFuncNum(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== 8) _fail(testEl, 'Did not receive the number 8 in checkFuncNum().');
}

// func: checkFuncStr "test string";
function checkFuncStr(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== "test string") _fail(testEl, 'Did not receive the string "test string" in checkFuncStr().');
}

// func: checkFuncTrue true;
function checkFuncTrue(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== true) _fail(testEl, 'Did not receive boolean true in checkFuncTrue().');
}

// func: checkFuncFalse false;
function checkFuncFalse(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	if (pars[0] !== false) _fail(testEl, 'Did not receive boolean false in checkFuncTrue().');
}

function checkFuncFinal(o) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkFunc');
	if (!testEl) return;

	_addSuccessClass(testEl);	// Only adds a success class if it hasn't specifically failed already.
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

function checkStyle(o) {
	// Check that the element to remove the class from is definitely there.
	let testEl = _initTest('checkStyle');
	if (!testEl) return;

	// Check if the class is no longer there.
	if (testEl.style.backgroundColor != 'green') {
		_fail(testEl, 'Green was not set as the background color of the test element.');
		return;
	}

	_addSuccessClass(testEl);
}

function checkTakeClassA(o) {
	let testEl = _initTest('checkTakeClass');
	if (!testEl) return;

	// Check if the orange option is selected. That's all we ned to do at this point.
	if (!_hasClassObj(_getObj('#takeClassOrange'), 'taken')) {
		_fail(testEl, 'The orange fruit did not get the class.');
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
				_fail(testEl, 'Some fruit other than lime still has the class.');
			}
		}
	});
	if (quit) return;
	if (!success) {
		_fail(testEl, 'The lime fruit did not get the class.');
		return;
	}
	_addSuccessClass(testEl);
}

function checkToggleClassA(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (!_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(testEl, 'The first toggle did not add the class.');
	}
}



function checkToggleClassFinal(o) {
	let testEl = _initTest('checkToggleClass');
	if (!testEl) return;

	if (_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(testEl, 'The second toggle did not remove the class.');
		return;
	}

	_addSuccessClass(testEl);
}
