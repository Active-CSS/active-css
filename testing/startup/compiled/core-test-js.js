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

function checkBlur(o) {
	let testEl = _initTest('checkBlur');
	if (!testEl) return;

	// Initially #blurField not in focus. Activates after 1s. Blur actives after 1.5s (500ms later).
	let el = _getObj('#blurField');

	// We want not in focus at start.
	if (!el.isSameNode(document.activeElement)) {
		setTimeout(function() {
			// Now we want in focus.
			if (el.isSameNode(document.activeElement)) {
				setTimeout(function() {
					// Now we want not in focus.
					if (!el.isSameNode(document.activeElement)) {
						// That looked good.
						_addSuccessClass(testEl);
					} else {
						_fail(testEl, '#blurField in not out of focus at the end.');
					}
				}, 500);
			} else {
				_fail(testEl, '#blurField is not in focus after 1s and it should be.');
			}
		}, 1100);
	} else {
		_fail(testEl, '#blurField in focus at the start and it shouldn\'t be.');
	}
}

// Note: This is the same test as the blur command but with different timings - focus-off is an alternative syntax.
function checkFocusOff(o) {
	let testEl = _initTest('checkFocusOff');
	if (!testEl) return;

	// Initially #focusOffField not in focus. Activates after 2s. Focus-off actives after 2.5s (500ms later).
	let el = _getObj('#focusOffField');

	// We want not in focus at start.
	if (!el.isSameNode(document.activeElement)) {
		setTimeout(function() {
			// Now we want in focus.
			if (el.isSameNode(document.activeElement)) {
				setTimeout(function() {
					// Now we want not in focus.
					if (!el.isSameNode(document.activeElement)) {
						// That looked good.
						_addSuccessClass(testEl);
					} else {
						_fail(testEl, '#focusOffField in not out of focus at the end.');
					}
				}, 500);
			} else {
				_fail(testEl, '#focusOffField is not in focus after 2s and it should be.');
			}
		}, 2100);
	} else {
		_fail(testEl, '#focusOffField in focus at the start and it shouldn\'t be.');
	}
}

/*
		<form id="focusOnFirstForm">
		    <input id="focusOnFirstTarget" type="text" name="focus1" value="Cheryl">
		    <input type="text" name="focus2" value="Dave">
		    <input type="text" name="focus3" value="Bob">
		    <input type="text" name="focus4" value="Tracy">
		    <input type="text" name="focus4" value="Sharon">
		</form>
*/

function checkFocusOnFirst(o) {
	let testEl = _initTest('checkFocusOnFirst');
	if (!testEl) return;

	// Initially #focusOnFirstTarget not in focus. Activates after 3s.
	let el = _getObj('#focusOnFirstTarget');

	// We want not in focus at start.
	if (!el.isSameNode(document.activeElement)) {
		setTimeout(function() {
			// Now we want in focus.
			if (el.isSameNode(document.activeElement)) {
				// That looked good.
				_addSuccessClass(testEl);
			} else {
				_fail(testEl, '#focusOnFirstTarget is not in focus after 3s and it should be.');
			}
		}, 3100);
	} else {
		_fail(testEl, '#focusOnFirstTarget in focus at the start and it shouldn\'t be.');
	}
}

/*
		<form id="focusOnLastForm">
		    <input type="text" name="focus1" value="Cheryl">
		    <input type="text" name="focus2" value="Dave">
		    <input type="text" name="focus3" value="Bob">
		    <input type="text" name="focus4" value="Tracy">
		    <input id="focusOnLastTarget" type="text" name="focus4" value="Sharon">
		</form>
*/

function checkFocusOnLast(o) {
	let testEl = _initTest('checkFocusOnLast');
	if (!testEl) return;

	// Initially #focusOnLastTarget not in focus. Activates after 3.5s.
	let el = _getObj('#focusOnLastTarget');

	// We want not in focus at start.
	if (!el.isSameNode(document.activeElement)) {
		setTimeout(function() {
			// Now we want in focus.
			if (el.isSameNode(document.activeElement)) {
				// That looked good.
				_addSuccessClass(testEl);
			} else {
				_fail(testEl, '#focusOnLastTarget is not in focus after 3.5s and it should be.');
			}
		}, 3600);
	} else {
		_fail(testEl, '#focusOnLastTarget in focus at the start and it shouldn\'t be.');
	}
}

/*
		<div class="focusOnNextCycleBlock">
		    <a id="focusOnNextCycleEnd" href="">Apples</a>
		    <a href="">Oranges</a>
		    <a href="">Pears</a>
		    <a id="focusOnNextCycleStart" href="">Bananas</a>
		    <a id="focusOnNextCycleSecond" href="">Grapes</a>
		</div>

	focus-on: #focusOnNextCycleStart after 6000ms;
	focus-on-next: .focusOnNextCycleBlock a after 6250ms;
	focus-on-next: .focusOnNextCycleBlock a after 6500ms;
 	focus-on-next: .focusOnNextCycleBlock a after 6750ms;

*/

function checkFocusOnNextCycle(o) {
	let testEl = _initTest('checkFocusOnNextCycle');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnNextCycleStart');
	let secondEl = _getObj('#focusOnNextCycleSecond');
	let thirdEl = _getObj('#focusOnNextCycleEnd');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (firstEl.isSameNode(document.activeElement)) {
				setTimeout(function() {
					if (secondEl.isSameNode(document.activeElement)) {
						setTimeout(function() {
							if (thirdEl.isSameNode(document.activeElement)) {
								// That looked good.
								_addSuccessClass(testEl);
							} else {
								_fail(testEl, '#focusOnNextCycleEnd is not in focus at the end');
							}
						}, 250);
					} else {
						_fail(testEl, '#focusOnNextCycleSecond has not moved into focus');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOnNextCycleStart is not in focus after 4s and it should be.');
			}
		}, 6100);
	} else {
		_fail(testEl, '#focusOnNextCycleStart in focus at the start and it shouldn\'t be.');
	}
}

/*
		<div class="focusOnNextBlock">
		    <a href="">Apples</a>
		    <a href="">Oranges</a>
		    <a id="focusOnNextStart" href="">Pears</a>
		    <a id="focusOnNextSecond" href="">Bananas</a>
		    <a id="focusOnNextEnd" href="">Grapes</a>
		</div>

	focus-on: #focusOnNextStart after 4000ms;
	focus-on-next: .focusOnNextBlock a after 4300ms;
	focus-on-next: .focusOnNextBlock a after 4600ms;
	focus-on-next: .focusOnNextBlock a after 4900ms;

*/

function checkFocusOnNext(o) {
	let testEl = _initTest('checkFocusOnNext');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnNextStart');
	let secondEl = _getObj('#focusOnNextSecond');
	let thirdEl = _getObj('#focusOnNextEnd');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (firstEl.isSameNode(document.activeElement)) {
				setTimeout(function() {
					if (secondEl.isSameNode(document.activeElement)) {
						setTimeout(function() {
							if (thirdEl.isSameNode(document.activeElement)) {
								setTimeout(function() {
									// Is it still on the last element when it gets to the end and not something else?
									if (thirdEl.isSameNode(document.activeElement)) {
										// That looked good.
										_addSuccessClass(testEl);
									} else {
										_fail(testEl, '#focusOnNextEnd is not in focus at the end');
									}
								}, 250);
							} else {
								_fail(testEl, '#focusOnNextEnd is not in focus at the end');
							}
						}, 250);
					} else {
						_fail(testEl, '#focusOnNextSecond has not moved into focus');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOnNextStart is not in focus after 4s and it should be.');
			}
		}, 4100);
	} else {
		_fail(testEl, '#focusOnNextStart in focus at the start and it shouldn\'t be.');
	}
}

/*
		<div class="focusOnPreviousCycleBlock">
		    <a id="focusOnPreviousCycleSecond" href="">Apples</a>
		    <a id="focusOnPreviousCycleStart" href="">Oranges</a>
		    <a href="">Pears</a>
		    <a href="">Bananas</a>
		    <a id="focusOnPreviousCycleEnd" href="">Grapes</a>
		</div>

    focus-on: #focusOnPreviousCycleStart after 7000ms;
	focus-on-previous: .focusOnPreviousCycleBlock a after 7250ms;
	focus-on-previous: .focusOnPreviousCycleBlock a after 7500ms;
	focus-on-previous: .focusOnPreviousCycleBlock a after 7750ms;

*/

function checkFocusOnPreviousCycle(o) {
	let testEl = _initTest('checkFocusOnPreviousCycle');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousCycleStart');
	let secondEl = _getObj('#focusOnPreviousCycleSecond');
	let thirdEl = _getObj('#focusOnPreviousCycleEnd');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (firstEl.isSameNode(document.activeElement)) {
				setTimeout(function() {
					if (secondEl.isSameNode(document.activeElement)) {
						setTimeout(function() {
							if (thirdEl.isSameNode(document.activeElement)) {
								// That looked good.
								_addSuccessClass(testEl);
							} else {
								_fail(testEl, '#focusOnPreviousCycleEnd is not in focus at the end');
							}
						}, 250);
					} else {
						_fail(testEl, '#focusOnPreviousCycleSecond has not moved into focus');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOnPreviousCycleStart is not in focus after 4s and it should be.');
			}
		}, 7100);
	} else {
		_fail(testEl, '#focusOnPreviousCycleStart in focus at the start and it shouldn\'t be.');
	}
}

/*
		<div class="focusOnPreviousBlock">
		    <a id="focusOnPreviousEnd" href="">Apples</a>
		    <a id="focusOnPreviousSecond" href="">Oranges</a>
		    <a id="focusOnPreviousStart" href="">Pears</a>
		    <a href="">Bananas</a>
		    <a href="">Grapes</a>
		</div>

	focus-on: #focusOnPreviousStart after 5000ms;
	focus-on-previous: .focusOnPreviousBlock a after 5250ms;
	focus-on-previous: .focusOnPreviousBlock a after 5500ms;
	focus-on-previous: .focusOnPreviousBlock a after 5750ms;

*/

function checkFocusOnPrevious(o) {
	let testEl = _initTest('checkFocusOnPrevious');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousStart');
	let secondEl = _getObj('#focusOnPreviousSecond');
	let thirdEl = _getObj('#focusOnPreviousEnd');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (firstEl.isSameNode(document.activeElement)) {
				setTimeout(function() {
					if (secondEl.isSameNode(document.activeElement)) {
						setTimeout(function() {
							if (thirdEl.isSameNode(document.activeElement)) {
								setTimeout(function() {
									// Is it still on the last element when it gets to the end and not something else?
									if (thirdEl.isSameNode(document.activeElement)) {
										// That looked good.
										_addSuccessClass(testEl);
									} else {
										_fail(testEl, '#focusOnPreviousEnd is not in focus at the end');
									}
								}, 250);
							} else {
								_fail(testEl, '#focusOnPreviousEnd is not in focus at the end');
							}
						}, 250);
					} else {
						_fail(testEl, '#focusOnPreviousSecond has not moved into focus');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOnPreviousStart is not in focus after 4s and it should be.');
			}
		}, 5100);
	} else {
		_fail(testEl, '#focusOnPreviousStart in focus at the start and it shouldn\'t be.');
	}
}

/* This is tested in the blur command test and will specifically error if it doesn't work. */

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
