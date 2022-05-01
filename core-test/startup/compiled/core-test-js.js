/*jshint strict:false */

function _addSuccessClass(objOrStr) {
	let el = (typeof objOrStr == 'object') ? objOrStr : _getObj(str);
	if (_hasClassObj(el, 'failed')) return;
	el.classList.add('success');
}

function _fail(testEl, message=null, par1=null, par2=null, par3=null, par4=null, par5=null, par6=null, par7=null) {
	// This could be optimized...
	if (!testEl) {
		console.log('Failed to fail test because main element is missing - message:' + message, par1, par2, par3, par4, par5, par6, par7);
	}
	testEl.classList.add('failed');
	if (message) {
		if (par7) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4, par5, par6, par7);
		} else if (par6) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4, par5, par6);
		} else if (par5) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4, par5);
		} else if (par4) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3, par4);
		} else if (par3) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2, par3);
		} else if (par2) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1, par2);
		} else if (par1) {
			console.log('Failure in ' + testEl.id + ': ' + message, par1);
		} else {
			console.log('Failure in ' + testEl.id + ': ' + message);
		}
	}
}
// From https://www.w3schools.com/js/js_cookies.asp
function _getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function _getFileName(url) {
	// Returns just the filename from a URL.
	return url.split('/').pop().split('#')[0].split('?')[0];
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

// This checks if an element is at least partially visible. Used for testing the scroll-into-view command.
function _isPartiallyVisible(el) {
	let rect = el.getBoundingClientRect();
	let elTop = rect.top;
	let elBot = rect.bottom;
	return (elTop < window.innerHeight && elBot >= 0);
}

// This compares a variable against a value and gives an error to the test element if it fails.
// Successes are skipped. A test will fail if receiving a failing test flag regardless of whether or not a success flag is added for a test.
function _shouldBe(testEl, varName, varVal, comparisonVal) {
	let checkVarEl = _initTest('checkVar');
	if (!checkVarEl) return;

	if (varVal !== comparisonVal) {
		_fail(checkVarEl, 'The variable "' + varName + '" does not exactly equal ' + comparisonVal + ' it equals:', typeof varVal, varVal);
	}
}

function checkCancelTimerAllA(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform first cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for first test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllB(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform second cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for second test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllC(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform third cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for third test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllFinal(o) {
	let checkCancelTimerAllEl = _initTest('checkCancelTimerAll');
	if (!checkCancelTimerAllEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(checkCancelTimerAllEl, '#cancelTimerAllDiv not present to perform fourth cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(checkCancelTimerAllEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(checkCancelTimerAllEl, 'testAddition class exists for fourth test and it shouldn\'t be there. Element:', el);
		}
		_addSuccessClass(checkCancelTimerAllEl);	// A failed marking will stop a test from passing even if this line is here.
	}
}

// No js needed for this checkAddClass test.
function checkAjaxPreGetA(o, pars) {
	let checkAjaxPreGetEl = _initTest('checkAjaxPreGet');
	if (!checkAjaxPreGetEl) {
		_fail(null, 'Failed to find checkAjaxPreGet element to perform test.');
		return;
	}

	if (o.ajaxObj.res.checkAjaxPreGetTitle != 'Rod' || o.ajaxObj.res.checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Ajax-pre-get command not getting the values from the file in o.res.');
	}

	if (o.vars.checkAjaxPreGetTitle == 'Rod' || o.vars.checkAjaxPreGetAddress == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Variables are getting set as scoped variables prior to ajax command and they shouldn\'t be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML == 'Rod' || testAddress.innerHTML == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Ajax-pre-get command is not only updating variables but updating the page and it shouldn\'t.');
	}
}

function checkAjaxPreGetFinal(o, pars) {
	let checkAjaxPreGetEl = _initTest('checkAjaxPreGet');
	if (!checkAjaxPreGetEl) {
		_fail(null, 'Failed to find checkAjaxPreGet element to perform test.');
		return;
	}

	if (o.vars.checkAjaxPreGetTitle != 'Rod' || o.vars.checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Variables are not getting set as scoped variables after the ajax command and they should be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxPreGetEl, 'Ajax command failed to update variables on the page after the prior ajax-pre-get.');
	}

	_addSuccessClass(checkAjaxPreGetEl);
}

function checkAjax(o) {
	let checkAjaxEl = _initTest('checkAjax');
	if (!checkAjaxEl) return;

	let testTitle = _getObj('#checkAjaxTestTitle');
	let testAddress = _getObj('#checkAjaxTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAjaxEl, 'Ajax command failed to update variables automatically.');
	}

	_addSuccessClass(checkAjaxEl);

}

function checkAjaxError404(o) {
	let checkAjaxErrorEl = _initTest('checkAjaxError');
	if (!checkAjaxErrorEl) return;

	if (window.checkAjaxErrorVar) {
		_fail(checkAjaxErrorEl, 'Ajax command failed to call 404 error event first for a missing file.');
	}

	window.checkAjaxErrorVar = true;
}

function checkAjaxError(o) {
	let checkAjaxErrorEl = _initTest('checkAjaxError');
	if (!checkAjaxErrorEl) return;

	if (!window.checkAjaxErrorVar) {
		_fail(checkAjaxErrorEl, 'Ajax command failed to call general error event second for a missing file.');
	}

	_addSuccessClass(checkAjaxErrorEl);
}

// Just need to make this test successful, so we can just replace the native alert call with a success updater.
// Alert should only need to be tested once in the tests. Active CSS shouldn't *ever* produce any alert notifications.
window.alert = function(idToMarkSuccessFul) {
	// Out of scope of everything so need to do a manual update on the test element.
	let el = document.getElementById(idToMarkSuccessFul);
	el.classList.add('success');
};

function checkBlurA(o) {
	let checkBlurEl = _initTest('checkBlur');
	if (!checkBlurEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(checkBlurEl, '#blurField is not in focus for the first test and it should be.');
	}
}

function checkBlurFinal(o) {
	let checkBlurEl = _initTest('checkBlur');
	if (!checkBlurEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkBlurEl);
	} else {
		_fail(checkBlurEl, '#blurField in not out of focus at the end.');
	}
}

function checkCancelTimerA(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform first cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerB(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform second cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerC(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform third cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerFinal(o) {
	let checkCancelTimerEl = _initTest('checkCancelTimer');
	if (!checkCancelTimerEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(checkCancelTimerEl, '#cancelTimerDiv not present to perform fourth cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(checkCancelTimerEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
	} else {
		_addSuccessClass(checkCancelTimerEl);
	}
}

/*
		<div class="clickOnFirstDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnFirstP"></p>
*/

function checkClickOnFirstA(o) {
	let checkClickOnFirstEl = _initTest('checkClickOnFirst');
	if (!checkClickOnFirstEl) return;

	let el = _getObj('#clickOnFirstP');

	if (el.innerHTML != '') {
		_fail(checkClickOnFirstEl, '#clickOnFirstP is not empty. It contains the text "' + el.innerHTML + '"');
	}
}

function checkClickOnFirstFinal(o) {
	let checkClickOnFirstEl = _initTest('checkClickOnFirst');
	if (!checkClickOnFirstEl) return;

	let el = _getObj('#clickOnFirstP');

	// Now we want in focus.
	if (el.innerHTML == 'green') {
		// That looked good.
		_addSuccessClass(checkClickOnFirstEl);
	} else {
		_fail(checkClickOnFirstEl, '#clickOnFirstP does not contain the test "green" and it should by now.');
	}
}

/*
		<div id="clickOnLastDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnLastP"></p>
*/

function checkClickOnLastA(o) {
	let checkClickOnLastEl = _initTest('checkClickOnLast');
	if (!checkClickOnLastEl) return;

	let el = _getObj('#clickOnLastP');

	if (el.innerHTML != '') {
		_fail(checkClickOnLastEl, '#clickOnLastP is not empty. It contains the text "' + el.innerHTML + '"');
	}
}

function checkClickOnLastFinal(o) {
	let checkClickOnLastEl = _initTest('checkClickOnLast');
	if (!checkClickOnLastEl) return;

	let el = _getObj('#clickOnLastP');

	if (el.innerHTML == 'purple and green') {
		// That looked good.
		_addSuccessClass(checkClickOnLastEl);
	} else {
		_fail(checkClickOnLastEl, '#clickOnLastP does not contain the test "purple and green" and it should by now.');
	}
}

/*
		<div id="clickOnNextCycleDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a id="clickOnNextCycleStart" data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnNextCycleP"></p>
*/

function checkClickOnNextCycleA(o) {
	let checkClickOnNextCycleEl = _initTest('checkClickOnNextCycle');
	if (!checkClickOnNextCycleEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkClickOnNextCycleEl, '#clickOnNextCycleStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnNextCycleB(o) {
	let checkClickOnNextCycleEl = _initTest('checkClickOnNextCycle');
	if (!checkClickOnNextCycleEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	if (el.innerHTML != 'yellow') {
		_fail(checkClickOnNextCycleEl, '#clickOnNextCycleP does not contain the test "yellow" and it should by now.');
	}
}

function checkClickOnNextCycleC(o) {
	let checkClickOnNextCycleEl = _initTest('checkClickOnNextCycle');
	if (!checkClickOnNextCycleEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	if (el.innerHTML != 'purple and green') {
		_fail(checkClickOnNextCycleEl, '#clickOnNextCycleP does not contain the test "purple and green" and it should by now.');
	}
}

function checkClickOnNextCycleFinal(o) {
	let checkClickOnNextCycleEl = _initTest('checkClickOnNextCycle');
	if (!checkClickOnNextCycleEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	if (el.innerHTML == 'green') {
		// That looked good.
		_addSuccessClass(checkClickOnNextCycleEl);
	} else {
		_fail(checkClickOnNextCycleEl, '#clickOnNextCycleP does not contain the test "green".');
	}
}

/*
		<div id="clickOnNextDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a id="clickOnNextStart" data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnNextP"></p>
*/

function checkClickOnNextA(o) {
	let checkClickOnNextEl = _initTest('checkClickOnNext');
	if (!checkClickOnNextEl) return;

	let firstEl = _getObj('#clickOnNextStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkClickOnNextEl, '#clickOnNextStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnNextB(o) {
	let checkClickOnNextEl = _initTest('checkClickOnNext');
	if (!checkClickOnNextEl) return;

	let el = _getObj('#clickOnNextP');

	if (el.innerHTML != 'yellow') {
		_fail(checkClickOnNextEl, '#clickOnNextP does not contain the test "yellow" and it should by now.');
	}
}

function checkClickOnNextC(o) {
	let checkClickOnNextEl = _initTest('checkClickOnNext');
	if (!checkClickOnNextEl) return;

	let el = _getObj('#clickOnNextP');

	// We want not in focus at start.
	if (el.innerHTML != 'purple and green') {
		_fail(checkClickOnNextEl, '#clickOnNextP does not contain the test "purple and green" and it should by now.');
	}
}

function checkClickOnNextFinal(o) {
	let checkClickOnNextEl = _initTest('checkClickOnNext');
	if (!checkClickOnNextEl) return;

	let el = _getObj('#clickOnNextP');

	if (el.innerHTML == 'purple and green') {
		// That looked good.
		_addSuccessClass(checkClickOnNextEl);
	} else {
		_fail(checkClickOnNextEl, '#clickOnNextP does not contain the test "purple and green".');
	}
}

/*
		<div id="clickOnPreviousCycleDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a id="clickOnPreviousCycleStart" data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnPreviousCycleP"></p>
*/

function checkClickOnPreviousCycleA(o) {
	let checkClickOnPreviousCycleEl = _initTest('checkClickOnPreviousCycle');
	if (!checkClickOnPreviousCycle) return;

	let firstEl = _getObj('#clickOnPreviousCycleStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkClickOnPreviousCycle, '#clickOnPreviousCycleStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnPreviousCycleB(o) {
	let checkClickOnPreviousCycle = _initTest('checkClickOnPreviousCycle');
	if (!checkClickOnPreviousCycle) return;

	let el = _getObj('#clickOnPreviousCycleP');

	if (el.innerHTML != 'orange') {
		_fail(checkClickOnPreviousCycle, '#clickOnPreviousCycleP does not contain the test "orange" and it should by now.');
	}
}

function checkClickOnPreviousCycleC(o) {
	let checkClickOnPreviousCycle = _initTest('checkClickOnPreviousCycle');
	if (!checkClickOnPreviousCycle) return;

	let el = _getObj('#clickOnPreviousCycleP');

	if (el.innerHTML != 'green') {
		_fail(checkClickOnPreviousCycle, '#clickOnPreviousCycleP does not contain the test "green" and it should by now.');
	}
}

function checkClickOnPreviousCycleFinal(o) {
	let checkClickOnPreviousCycle = _initTest('checkClickOnPreviousCycle');
	if (!checkClickOnPreviousCycle) return;

	let el = _getObj('#clickOnPreviousCycleP');

	if (el.innerHTML == 'purple and green') {
		// That looked good.
		_addSuccessClass(checkClickOnPreviousCycle);
	} else {
		_fail(checkClickOnPreviousCycle, '#clickOnPreviousCycleP does not contain the test "purple and green".');
	}
}

/*
		<div id="clickOnPreviousDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a id="clickOnPreviousStart" data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnPreviousP"></p>
*/

function checkClickOnPreviousA(o) {
	let checkClickOnPreviousEl = _initTest('checkClickOnPrevious');
	if (!checkClickOnPreviousEl) return;

	let firstEl = _getObj('#clickOnPreviousStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkClickOnPreviousEl, '#clickOnPreviousStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnPreviousB(o) {
	let checkClickOnPreviousEl = _initTest('checkClickOnPrevious');
	if (!checkClickOnPreviousEl) return;

	let el = _getObj('#clickOnPreviousP');

	if (el.innerHTML != 'orange') {
		_fail(checkClickOnPreviousEl, '#clickOnPreviousP does not contain the test "orange" and it should by now.');
	}
}

function checkClickOnPreviousC(o) {
	let checkClickOnPreviousEl = _initTest('checkClickOnPrevious');
	if (!checkClickOnPreviousEl) return;

	let el = _getObj('#clickOnPreviousP');

	if (el.innerHTML != 'green') {
		_fail(checkClickOnPreviousEl, '#clickOnPreviousP does not contain the test "green" and it should by now.');
	}
}

function checkClickOnPreviousFinal(o) {
	let checkClickOnPreviousEl = _initTest('checkClickOnPrevious');
	if (!checkClickOnPreviousEl) return;

	let el = _getObj('#clickOnPreviousP');

	if (el.innerHTML == 'green') {
		// That looked good.
		_addSuccessClass(checkClickOnPreviousEl);
	} else {
		_fail(checkClickOnPreviousEl, '#clickOnPreviousP does not contain the test "green".');
	}
}

function checkClickoutsideEvent(o) {
	let checkClickoutsideEventEl = _initTest('checkClickoutsideEvent');
	if (!checkClickoutsideEventEl) return;

	let bod = document.body;

	if (!_hasClassObj(bod, 'clickoutside1')) {
		_fail(checkClickoutsideEventEl, 'The clickoutside1 class has not been set and should have been.');
	}

	if (!_hasClassObj(bod, 'clickoutside2')) {
		_fail(checkClickoutsideEventEl, 'The clickoutside2 class has not been set and should have been.');
	}
		
	_addSuccessClass(checkClickoutsideEventEl);
}

/* Pended until clone/restore-clone issue 36 has been resolved.

function checkClone(o) {
	let testEl = _initTest('checkClone');
	if (!testEl) return;

	let el = _getObj('#restoreCloneInHere');
	if (el.innerHTML == '<p class="cloneText"><span>This text is going to be cloned</span></p>') {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'The #restoreCloneHere element failed to receive the clone from .cloneText. el.innerHTML:', el.innerHTML);
	}
}

function checkCloneBefore(o) {
	let testEl = _initTest('checkClone');
	if (!testEl) return;

	let el = _getObj('#restoreCloneInHere');
	if (el.innerHTML != '<div id="restoreHere"></div>') {
		_fail(testEl, 'The #restoreCloneHere element hasn\'t got the correct inner HTML before the clone test starts.');
	}
}
*/
function checkCreateCommand(o) {
	let checkCreateCommandEl = _initTest('checkCreateCommand');
	if (!checkCreateCommandEl) return;

	let el = _getObj('#checkCreateCommandDiv');
	if (!el) {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv not present to run create-command test.');
	}

	if (el.style.backgroundColor != 'blue') {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv does not have a blue background-color and it should.');
	}

	if (el.style.color != 'yellow') {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv does not have yellow color and it should.');
	}

	if (el.style.height != '100px') {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv does not have height of 100px and it should.');
	}

	_addSuccessClass(checkCreateCommandEl);
}

function checkCreateConditionalFail(o) {
	let checkCreateConditionalEl = _initTest('checkCreateConditional');
	if (!checkCreateConditionalEl) return;

	_fail(checkCreateConditionalEl, 'Test failed because it did not evaluate the conditional correctly.');
}

function checkCreateConditionalFinal(o) {
	let checkCreateConditionalEl = _initTest('checkCreateConditional');
	if (!checkCreateConditionalEl) return;

	_addSuccessClass(checkCreateConditionalEl);
}

function checkCreateElement(o, pars) {
	let checkCreateElementEl = _initTest('checkCreateElement');
	if (!checkCreateElementEl) return;

	let el = _getObj('#checkCreateElementDiv');
	if (!el) {
		_fail(checkCreateElementEl, '#checkCreateElementDiv not there to perform test.');
	}

	if (el.innerHTML != 'test1 test2 stringtest') {
		_fail(checkCreateElementEl, 'Reactive attributes did not get rendered correctly in custom element. el.innerHTML:', el.innerHTML);
	}

	if (typeof pars[0] === 'undefined' || pars[0] !== true) {
		_fail(checkCreateElementEl, 'Connected callback did not invoke. pars[0]:', pars[0]);
	}

	if (typeof pars[1] === 'undefined' || pars[1] !== true) {
		_fail(checkCreateElementEl, 'Disconnected callback did not invoke. pars[1]:', pars[1], ', wrapper:', _getObj('#createElementTagsWrapper'));
	}

	if (typeof pars[2] === 'undefined' || pars[2] !== true) {
		_fail(checkCreateElementEl, 'Attribute change callback did not invoke. pars[2]:', pars[2], ', wrapper:', _getObj('#createElementAttrChange'));
	}

	let el2 = _getObj('#createElementAttrChange');
	if (!el2) {
		_fail(checkCreateElementEl, '#createElementAttrChange not there to perform attribute test.');
	} else {
		if (el2.getAttribute('cetaga') != 'cheesey wotsits') {
			_fail(checkCreateElementEl, '#createElementAttrChange does not contain the string "cheesey wotsits" at the end of the test.');
		}
	}

	_addSuccessClass(checkCreateElementEl);
}

function checkEval(o) {
	let checkEvalEl = _initTest('checkEval');
	if (!checkEvalEl) return;

	if (typeof window.evalResult !== undefined) {
		if (window.evalResult === 2) {
			_addSuccessClass(checkEvalEl);
		} else {
			_fail(checkEvalEl, 'window.evalResult is being defined in eval check but result doesn\'t equal 2.');
		}
	} else {
		_fail(checkEvalEl, 'window.evalResult not being defined in eval check.');
	}
}

// Note: This is the same test as the blur command but with different timings - focus-off is an alternative syntax.
function checkFocusOffA(o) {
	let checkFocusOffEl = _initTest('checkFocusOff');
	if (!checkFocusOffEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(checkFocusOffEl, '#focusOffField is not in focus for the first test and it should be.');
	}
}

function checkFocusOffFinal(o) {
	let checkFocusOffEl = _initTest('checkFocusOff');
	if (!checkFocusOffEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOffEl);
	} else {
		_fail(checkFocusOffEl, '#focusOffField in not out of focus at the end.');
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

function checkFocusOnFirstA(o) {
	let checkFocusOnFirstEl = _initTest('checkFocusOnFirst');
	if (!checkFocusOnFirstEl) return;

	let el = _getObj('#focusOnFirstTarget');

	// We want not in focus at start.
	if (el.isSameNode(document.activeElement)) {
		_fail(checkFocusOnFirstEl, '#focusOnFirstTarget is in focus at the start of the test and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnFirstFinal(o) {
	let checkFocusOnFirstEl = _initTest('checkFocusOnFirst');
	if (!checkFocusOnFirstEl) return;

	let el = _getObj('#focusOnFirstTarget');

	if (el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnFirstEl);
	} else {
		_fail(checkFocusOnFirstEl, '#focusOnFirstTarget is not in focus at the end and it should be.');
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

function checkFocusOnLastA(o) {
	let checkFocusOnLastEl = _initTest('checkFocusOnLast');
	if (!checkFocusOnLastEl) return;

	// Initially #focusOnLastTarget not in focus. Activates after 3.5s.
	let el = _getObj('#focusOnLastTarget');

	// We want not in focus at start.
	if (el.isSameNode(document.activeElement)) {
		_fail(checkFocusOnLastEl, '#focusOnLastTarget is in focus at the start and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnLastFinal(o) {
	let checkFocusOnLastEl = _initTest('checkFocusOnLast');
	if (!checkFocusOnLastEl) return;

	let el = _getObj('#focusOnLastTarget');

	if (el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnLastEl);
	} else {
		_fail(checkFocusOnLastEl, '#focusOnLastTarget is not in focus at the end and it should be.');
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

function checkFocusOnNextCycleA(o) {
	let checkFocusOnNextCycleEl = _initTest('checkFocusOnNextCycle');
	if (!checkFocusOnNextCycleEl) return;

	let firstEl = _getObj('#focusOnNextCycleStart');
	let secondEl = _getObj('#focusOnNextCycleSecond');
	let thirdEl = _getObj('#focusOnNextCycleEnd');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnNextCycleEl, '#focusOnNextCycleStart in focus at the start and it shouldn\'t be.');
	}
}

function checkFocusOnNextCycleB(o) {
	let checkFocusOnNextCycleEl = _initTest('checkFocusOnNextCycle');
	if (!checkFocusOnNextCycleEl) return;

	let firstEl = _getObj('#focusOnNextCycleStart');

	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnNextCycleEl, '#focusOnNextCycleStart is not in focus after 4s and it should be.');
	}
}

function checkFocusOnNextCycleC(o) {
	let checkFocusOnNextCycleEl = _initTest('checkFocusOnNextCycle');
	if (!checkFocusOnNextCycleEl) return;

	let secondEl = _getObj('#focusOnNextCycleSecond');

	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnNextCycleEl, '#focusOnNextCycleSecond has not moved into focus');
	}
}

function checkFocusOnNextCycleFinal(o) {
	let checkFocusOnNextCycleEl = _initTest('checkFocusOnNextCycle');
	if (!checkFocusOnNextCycleEl) return;

	let thirdEl = _getObj('#focusOnNextCycleEnd');

	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnNextCycleEl);
	} else {
		_fail(checkFocusOnNextCycleEl, '#focusOnNextCycleEnd is not in focus at the end');
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

function checkFocusOnNextA(o) {
	let checkFocusOnNextEl = _initTest('checkFocusOnNext');
	if (!checkFocusOnNextEl) return;

	let firstEl = _getObj('#focusOnNextStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnNextEl, '#focusOnNextStart is in focus at the start and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnNextB(o) {
	let checkFocusOnNextEl = _initTest('checkFocusOnNext');
	if (!checkFocusOnNextEl) return;

	let firstEl = _getObj('#focusOnNextStart');

	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnNextEl, '#focusOnNextStart has not moved into focus.');
	}
}

function checkFocusOnNextC(o) {
	let checkFocusOnNextEl = _initTest('checkFocusOnNext');
	if (!checkFocusOnNextEl) return;

	let secondEl = _getObj('#focusOnNextSecond');

	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnNextEl, '#focusOnNextSecond has not moved into focus');
	}
}

function checkFocusOnNextD(o) {
	let checkFocusOnNextEl = _initTest('checkFocusOnNext');
	if (!checkFocusOnNextEl) return;

	let thirdEl = _getObj('#focusOnNextEnd');

	if (!thirdEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnNextEl, '#focusOnNextEnd has not moved into focus');
	}
}

function checkFocusOnNextFinal(o) {
	let checkFocusOnNextEl = _initTest('checkFocusOnNext');
	if (!checkFocusOnNextEl) return;

	let thirdEl = _getObj('#focusOnNextEnd');

	// Is it still on the last element when it gets to the end and not something else?
	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnNextEl);
	} else {
		_fail(checkFocusOnNextEl, '#focusOnNextEnd is not in focus at the end');
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

function checkFocusOnPreviousCycleA(o) {
	let checkFocusOnPreviousCycleEl = _initTest('checkFocusOnPreviousCycle');
	if (!checkFocusOnPreviousCycleEl) return;

	let firstEl = _getObj('#focusOnPreviousCycleStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnPreviousCycleEl, '#focusOnPreviousCycleStart in focus at the start and it shouldn\'t be.');
	}
}

function checkFocusOnPreviousCycleB(o) {
	let checkFocusOnPreviousCycleEl = _initTest('checkFocusOnPreviousCycle');
	if (!checkFocusOnPreviousCycleEl) return;

	let firstEl = _getObj('#focusOnPreviousCycleStart');

	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnPreviousCycleEl, '#focusOnPreviousCycleStart is not in focus after 4s and it should be.');
	}
}

function checkFocusOnPreviousCycleC(o) {
	let checkFocusOnPreviousCycleEl = _initTest('checkFocusOnPreviousCycle');
	if (!checkFocusOnPreviousCycleEl) return;

	let secondEl = _getObj('#focusOnPreviousCycleSecond');

	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnPreviousCycleEl, '#focusOnPreviousCycleSecond has not moved into focus');
	}
}

function checkFocusOnPreviousCycleFinal(o) {
	let checkFocusOnPreviousCycleEl = _initTest('checkFocusOnPreviousCycle');
	if (!checkFocusOnPreviousCycleEl) return;

	let thirdEl = _getObj('#focusOnPreviousCycleEnd');

	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnPreviousCycleEl);
	} else {
		_fail(checkFocusOnPreviousCycleEl, '#focusOnPreviousCycleEnd is not in focus at the end');
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

function checkFocusOnPreviousA(o) {
	let checkFocusOnPreviousEl = _initTest('checkFocusOnPrevious');
	if (!checkFocusOnPreviousEl) return;

	let firstEl = _getObj('#focusOnPreviousStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnPreviousEl, '#focusOnPreviousStart in focus at the start and it shouldn\'t be.');
	}
}

function checkFocusOnPreviousB(o) {
	let checkFocusOnPreviousEl = _initTest('checkFocusOnPrevious');
	if (!checkFocusOnPreviousEl) return;

	let firstEl = _getObj('#focusOnPreviousStart');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnPreviousEl, '#focusOnPreviousStart is not in focus after 4s and it should be.');
	}
}

function checkFocusOnPreviousC(o) {
	let checkFocusOnPreviousEl = _initTest('checkFocusOnPrevious');
	if (!checkFocusOnPreviousEl) return;

	let secondEl = _getObj('#focusOnPreviousSecond');

	// We want not in focus at start.
	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnPreviousEl, '#focusOnPreviousSecond has not moved into focus');
	}
}

function checkFocusOnPreviousD(o) {
	let checkFocusOnPreviousEl = _initTest('checkFocusOnPrevious');
	if (!checkFocusOnPreviousEl) return;

	let thirdEl = _getObj('#focusOnPreviousEnd');

	// We want not in focus at start.
	if (!thirdEl.isSameNode(document.activeElement)) {
		_fail(checkFocusOnPreviousEl, '#focusOnPreviousEnd is not in focus at the end');
	}
}

function checkFocusOnPreviousFinal(o) {
	let checkFocusOnPreviousEl = _initTest('checkFocusOnPrevious');
	if (!checkFocusOnPreviousEl) return;

	let thirdEl = _getObj('#focusOnPreviousEnd');

	// Is it still on the last element when it gets to the end and not something else?
	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnPreviousEl);
	} else {
		_fail(checkFocusOnPreviousEl, '#focusOnPreviousEnd is not in focus at the end');
	}
}

/* This is tested in the blur command test and will specifically error if it doesn't work. */

function checkFormEls() {
	let regularField = _getObj('#checkFormRegularField');
	let firstMimicField = _getObj('#checkFormMimicField1');
	let secondMimicField = _getObj('#checkFormMimicField2');
	let firstResultField = _getObj('#checkFormResultOfMimic1');
	let secondResultField = _getObj('#checkFormResultOfMimic2');
	let pageTitleMimicField = _getObj('#checkFormPageTitle');
	if (!regularField || !firstMimicField || !secondMimicField || !firstResultField || !secondResultField || !pageTitleMimicField) {
		_fail(testEl, 'Fields have not been drawn for testing. Form HTML for #checkFormForm:', _getObj('#checkFormForm').innerHTML);
	}
	return {
		regularField: regularField.value,
		firstMimicField: firstMimicField.value,
		secondMimicField: secondMimicField.value,
		firstResultField: firstResultField.innerHTML,
		secondResultField: secondResultField.innerHTML,
		pageTitle: document.title
	};
}

function checkFormResetA(o) {
	let checkFormResetEl = _initTest('checkFormReset');
	if (!checkFormResetEl) return;

	let els = checkFormEls();

	if (els.regularField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormRegularField is not "changedResult" on the change');
	}
	if (els.firstMimicField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormMimicField1 is not "changedResult" on the change');
	}
	if (els.secondMimicField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormMimicField2 is not "changedResult" on the change');
	}
	if (els.firstResultField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic1 is not "changedResult" on the change');
	}
	if (els.secondResultField !== 'changedResult') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic2 is not "changedResult" on the change');
	}
	if (els.pageTitle !== 'New page title') {
		_fail(checkFormResetEl, 'document.title is not "New page title" on the change');
	}
}

function checkFormResetFinal(o) {
	let checkFormResetEl = _initTest('checkFormReset');
	if (!checkFormResetEl) return;

	let els = checkFormEls();

	if (els.regularField !== 'Bert') {
		_fail(checkFormResetEl, '#checkFormRegularField is not "Bert" on the reset');
	}
	if (els.firstMimicField !== 'Cheryl') {
		_fail(checkFormResetEl, '#checkFormMimicField1 is not "Cheryl" on the reset');
	}
	if (els.secondMimicField !== 'Bob') {
		_fail(checkFormResetEl, '#checkFormMimicField2 is not "Bob" on the reset');
	}
	if (els.firstResultField !== 'Cheryl') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic1 is not "Cheryl" on the reset');
	}
	if (els.secondResultField !== 'Bob') {
		_fail(checkFormResetEl, '#checkFormResultOfMimic2 is not "Bob" on the reset');
	}
	if (els.pageTitle !== 'cheeseyness') {
		_fail(checkFormResetEl, 'document.title is not "cheeseyness" on the reset');
	}

	_addSuccessClass(checkFormResetEl);
}

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
	let checkFuncEl = _initTest('checkFunc');
	if (!checkFuncEl) return;

	if (pars[0] !== 8) _fail(checkFuncEl, 'Did not receive the number 8 in checkFuncNum().');
}

// func: checkFuncStr "test string";
function checkFuncStr(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let checkFuncEl = _initTest('checkFunc');
	if (!checkFuncEl) return;

	if (pars[0] !== "test string") _fail(checkFuncEl, 'Did not receive the string "test string" in checkFuncStr().');
}

// func: checkFuncTrue true;
function checkFuncTrue(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let checkFuncEl = _initTest('checkFunc');
	if (!checkFuncEl) return;

	if (pars[0] !== true) _fail(checkFuncEl, 'Did not receive boolean true in checkFuncTrue().');
}

// func: checkFuncFalse false;
function checkFuncFalse(o, pars) {
	// Check that the element to remove the class from is definitely there.
	let checkFuncEl = _initTest('checkFunc');
	if (!checkFuncEl) return;

	if (pars[0] !== false) _fail(checkFuncEl, 'Did not receive boolean false in checkFuncTrue().');
}

function checkFuncFinal(o) {
	// Check that the element to remove the class from is definitely there.
	let checkFuncEl = _initTest('checkFunc');
	if (!checkFuncEl) return;

	_addSuccessClass(checkFuncEl);	// Only adds a success class if it hasn't specifically failed already.
}

// Note: If this test is inexplicably failing, it could be something else like timings on delayed tests happening elsewhere, such as the test for load-config.

function checkIframeGetInnerHTML() {
    let frameObj = _getObj('#checkIframeIframe');
    let content = frameObj.contentWindow.document.body.innerHTML;
    return content;
}

function checkIframeReloadA(o) {
	let checkIframeReloadEl = _initTest('checkIframeReload');
	if (!checkIframeReloadEl) return;

	if (checkIframeGetInnerHTML() !== '<p>iframe test</p>') {
		_fail(checkIframeReloadEl, 'Iframe body does not contain "<p>iframe test</p>" prior to test.');
	}
}

function checkIframeReloadB(o) {
	let checkIframeReloadEl = _initTest('checkIframeReload');
	if (!checkIframeReloadEl) return;

	if (checkIframeGetInnerHTML() !== '<p>some new text</p>') {
		_fail(checkIframeReloadEl, 'Iframe body does not contain "<p>some new text</p>" after change.');
	}
}

function checkIframeReloadFinal(o) {
	let checkIframeReloadEl = _initTest('checkIframeReload');
	if (!checkIframeReloadEl) return;

	if (checkIframeGetInnerHTML() !== '<p>iframe test</p>') {
		_fail(checkIframeReloadEl, 'Iframe body does not contain "<p>iframe test</p>" after reload.');
	}

	_addSuccessClass(checkIframeReloadEl);
}

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

/*
<img id="checkLoadImagesImg1" src="/base/core-test/tests/resource-files/tiny.png" data-lazy-image="/base/core-test/tests/resource-files/cat3.gif" alt="">
<picture>
    <source id="checkLoadImagesPicSrc1" srcset="/base/core-test/tests/resource-files/tiny.png" data-lazy-image="/base/core-test/tests/resource-files/building-cliff-clouds-67235-tn.jpg" media="(min-width: 800px)">
    <img id="checkLoadImagesImg2" src="/base/core-test/tests/resource-files/tiny.png" data-lazy-image="/base/core-test/tests/resource-files/cat2.gif" />
</picture>
*/

function checkLoadImages(o) {
	let checkLoadImagesEl = _initTest('checkLoadImages');
	if (!checkLoadImagesEl) return;

	let el1 = _getObj('#checkLoadImagesImg1');
	let el2 = _getObj('#checkLoadImagesPicSrc1');
	let el3 = _getObj('#checkLoadImagesImg2');

	if (!el1 || !el2 || !el3) {
		_fail(checkLoadImagesEl, 'Image elements failed to load prior to test.');

	} else {
		if (_getFileName(el1.src) !== 'cat3.gif') {
			_fail(checkLoadImagesEl, '#checkLoadImagesImg1 did not contain the lazy-loaded image. el1.src:', el1.src);
		}
		if (_getFileName(el2.srcset) !== 'building-cliff-clouds-67235-tn.jpg') {
			_fail(checkLoadImagesEl, '#checkLoadImagesPicSrc1 did not contain the lazy-loaded image. el2.srcset:', el2.srcset);
		}
		if (_getFileName(el3.src) !== 'cat2.gif') {
			_fail(checkLoadImagesEl, '#checkLoadImagesImg2 did not contain the lazy-loaded image. el3.src:', el3.src);
		}

		_addSuccessClass(checkLoadImagesEl);
	}
}

function checkLoadScript(o) {
	let checkLoadScriptEl = _initTest('checkLoadScript');
	if (!checkLoadScriptEl) return;

	if (window._acssTestLoadScriptVar !== true) {
		_fail(checkLoadScriptEl, 'window._acssTestLoadScriptVar is not set === true after the test script has loaded.');
	} else {
		_addSuccessClass(checkLoadScriptEl);
	}
}

function checkLoadStyleDocument(o) {
	let checkLoadStyleEl = _initTest('checkLoadStyle');
	if (!checkLoadStyleEl) return;

	// Test in the document scope.
	let el = _getObj('#checkLoadStyle div');
	let styles = window.getComputedStyle(el);	// Remember - el.style.color can only be used for inline styles.

	if (!el) {
		_fail(checkLoadStyleEl, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(0, 0, 255)') {
		_fail(checkLoadStyleEl, 'Color of test div has not been set to "rgb(0, 0, 255)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(checkLoadStyleEl);
	}

}

function checkLoadStyleShadow(o) {
	let checkLoadStyleShadEl = _initTest('checkLoadStyleShad');
	if (!checkLoadStyleShadEl) return;

	// Second, test in the shadow scope.
	let testDiv = checkLoadStyleShadEl.shadowRoot.querySelector('div');
	let styles = window.getComputedStyle(testDiv);	// Remember - el.style.color can only be used for inline styles.

	if (!testDiv) {
		_fail(testDiv, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(255, 0, 0)') {
		_fail(testDiv, 'Color of test div has not been set to "rgb(255, 0, 0)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(checkLoadStyleShadEl);
	}

}

function checkLoadStyleShadow2(o) {
	let checkLoadStyleShad2El = _initTest('checkLoadStyleShad2');
	if (!checkLoadStyleShad2El) return;

	// Third, test the with the same stylesheet again in a second shadow scope.
	let testDiv = checkLoadStyleShad2El.shadowRoot.querySelector('div');
	let styles = window.getComputedStyle(testDiv);	// Remember - el.style.color can only be used for inline styles.

	if (!testDiv) {
		_fail(testDiv, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(255, 0, 0)') {
		_fail(testDiv, 'Color of test div has not been set to "rgb(255, 0, 0)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(checkLoadStyleShad2El);
	}

}

function checkPreventDefault(o) {
	let checkPreventDefaultEl = _initTest('checkPreventDefault');
	if (!checkPreventDefaultEl) return;

	_addSuccessClass(checkPreventDefaultEl);
}

function checkPreventDefaultShadow(o) {
	let checkPreventDefaultShadowEl = _initTest('checkPreventDefaultShadow');
	if (!checkPreventDefaultShadowEl) return;

	_addSuccessClass(checkPreventDefaultShadowEl);
}

function checkRemoveAttribute(o) {
	let checkRemoveAttributeEl = _initTest('checkRemoveAttribute');
	if (!checkRemoveAttributeEl) return;

	let el = _getObj('#removeAttributeDiv');
	if (!el) {
		_fail(checkRemoveAttributeEl, '#removeAttributeDiv not present to perform remove-attribute command.');
	}

	if (!el.hasAttribute('data-test')) {
		_addSuccessClass(checkRemoveAttributeEl);
	} else {
		_fail(checkRemoveAttributeEl, 'Failed to remove the attribute "data-test" from #removeAttributeDiv. Element:', el);
	}
}

function checkRemoveClass(o) {
	// Check that the element to remove the class from is definitely there.
	let checkRemoveClassEl = _initTest('checkRemoveClass');
	if (!checkRemoveClassEl) return;

	// Check if the class is no longer there.
	if (_hasClassObj(checkRemoveClassEl, 'removeClassToRemove')) {
		return;
	}
	_addSuccessClass(checkRemoveClassEl);
}

/* Pended until clone/restore-clone issue 36 has been resolved.
function checkRemoveClone(o) {
	let testEl = _initTest('checkRemoveClone');
	if (!testEl) return;

//	_fail(testEl, 'message');

	_addSuccessClass(testEl);
}
*/
function checkRemoveCookieA(o) {
	let checkRemoveCookieEl = _initTest('checkRemoveCookie');
	if (!checkRemoveCookieEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 != 'Y') {
		_fail(checkRemoveCookieEl, 'removeCookieTest1 cookie is not set at the beginning and it should be.');
	}
}

function checkRemoveCookieFinal(o) {
	let checkRemoveCookieEl = _initTest('checkRemoveCookie');
	if (!checkRemoveCookieEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 == 'Y') {
		_fail(checkRemoveCookieEl, 'removeCookieTest1 cookie is still there and it shouldn\'t be.');
	}

	_addSuccessClass(checkRemoveCookieEl);
}

function checkRemoveProperty(o) {
	let checkRemovePropertyEl = _initTest('checkRemoveProperty');
	if (!checkRemovePropertyEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(checkRemovePropertyEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_addSuccessClass(checkRemovePropertyEl);
	} else {
		_fail(checkRemovePropertyEl, 'Failed to remove the background-color property from #removePropertyDiv. Element:', el);
	}
}

function checkRemovePropertyBefore(o) {
	let checkRemovePropertyEl = _initTest('checkRemoveProperty');
	if (!checkRemovePropertyEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(checkRemovePropertyEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_fail(checkRemovePropertyEl, '#removePropertyDiv does not have a background-color of green before the test of remove-property begins.');
	}
}

function checkRemove(o) {
	let checkRemoveEl = _initTest('checkRemove');
	if (!checkRemoveEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_addSuccessClass(checkRemoveEl);
	} else {
		_fail(checkRemoveEl, '#removeToRemove did not get removed by the remove command.');
	}
}

function checkRemoveBefore(o) {
	let checkRemoveEl = _initTest('checkRemove');
	if (!checkRemoveEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_fail(checkRemoveEl, '#removeToRemove is not present in order to perform the remove test.');
	}
}

function checkRenderAfterBegin(o) {
	let checkRenderAfterBeginEl = _initTest('checkRenderAfterBegin');
	if (!checkRenderAfterBeginEl) return;

	// Check basic render-after-begin command results.
	let el = _getObj('#renderAfterBeginHTMLDiv');

	if (el.innerHTML !== '<span id="checkRenderAfterBeginTestDiv">render-after-begin</span>Text will be inserted in relation to this element.') {
		_fail(checkRenderAfterBeginEl, 'Render did not render correctly in the render-after-begin command test area. #renderAfterBeginHTMLDiv.innerHTML:', el.innerHTML);
	}

	_addSuccessClass(checkRenderAfterBeginEl);
}

function checkRenderAfterEnd(o) {
	let checkRenderAfterEndEl = _initTest('checkRenderAfterEnd');
	if (!checkRenderAfterEndEl) return;

	// Check basic render-after-end command results.
	let el = _getObj('#renderAfterEndHTMLDiv').nextSibling;

	if (el.outerHTML !== '<span id="checkRenderAfterEndTestDiv">render-after-end</span>') {
		_fail(checkRenderAfterEndEl, 'Render did not render correctly in the render-after-end command test area. #renderAfterEndHTMLDiv.nextSibling.outerHTML:', el.outerHTML);
	}

	_addSuccessClass(checkRenderAfterEndEl);
}

function checkRenderBeforeBegin(o) {
	let checkRenderBeforeBeginEl = _initTest('checkRenderBeforeBegin');
	if (!checkRenderBeforeBeginEl) return;

	// Check basic render-before-begin command results.
	let el = _getObj('#renderBeforeBeginHTMLDiv').previousSibling;

	if (el.outerHTML !== '<span id="checkRenderBeforeBeginTestDiv">render-before-begin</span>') {
		_fail(checkRenderBeforeBeginEl, 'Render did not render correctly in the render-before-begin command test area. #renderBeforeBeginHTMLDiv.previousSibling.outerHTML:', el.outerHTML);
	}

	_addSuccessClass(checkRenderBeforeBeginEl);
}

function checkRenderBeforeEnd(o) {
	let checkRenderBeforeEndEl = _initTest('checkRenderBeforeEnd');
	if (!checkRenderBeforeEndEl) return;

	// Check basic render-before-end command results.
	let el = _getObj('#renderBeforeEndHTMLDiv');

	if (el.innerHTML !== 'Text will be inserted in relation to this element.<span id="checkRenderBeforeEndTestDiv">render-before-end</span>') {
		_fail(checkRenderBeforeEndEl, 'Render did not render correctly in the render-before-end command test area. #renderBeforeEndHTMLDiv.innerHTML:', el.innerHTML);
	}

	_addSuccessClass(checkRenderBeforeEndEl);
}

function checkRenderReplace(o) {
	let checkRenderReplaceEl = _initTest('checkRenderReplace');
	if (!checkRenderReplaceEl) return;

	// Check basic render-replace command results.
	let el = _getObj('#renderReplaceOuterDiv');

	if (el.innerHTML !== '<div id=\"checkRenderReplaceTestDiv\">render-replace</div>') {
		_fail(checkRenderReplaceEl, 'Render did not render correctly in the render-replace command test area. #renderReplaceOuterDiv.innerHTML:', el.innerHTML);
	}

	_addSuccessClass(checkRenderReplaceEl);
}

function checkRender(o) {
	let checkRenderEl = _initTest('checkRender');
	if (!checkRenderEl) return;

	// Check basic render command results.
	let el = _getObj('#renderHTMLExample');
	if (el.innerHTML !== '<span id="checkRenderTestDiv"><strong>render</strong></span>') {
		_fail(checkRenderEl, 'Render did not render correctly in the render command test area. #renderHTMLExample.innerHTML:', el.innerHTML);
	}
}

function checkRenderEscaping(o) {
	let checkRenderEl = _initTest('checkRender');
	if (!checkRenderEl) return;

	// First check escape rendering.
	let pTag = _getObj('#renderEscapePTag');

	let checkText = 'Check for escaped variable: <script>createHavoc()</script> <script>doMoreHavoc()</script>. You should see the tag here in text form.';
	if (pTag.textContent !== checkText) {
		_fail(checkRenderEl, 'Render did not properly escape the script tag variables in the HTML content area. Should be: "' + checkText + '", but #renderEscapePTag.textContent:', pTag.textContent);
	}

	let attrA = pTag.getAttribute('data-hackA');
	let attrB = pTag.getAttribute('data-hackB');

	if (attrA !== '&lt;script&gt;createHavoc()&lt;/script&gt;') {
		_fail(checkRenderEl, 'Render did not properly escape the one-off variable in the test attribute. attrA:', attrA);
	}

	if (attrB !== '&lt;script&gt;doMoreHavoc()&lt;/script&gt;') {
		_fail(checkRenderEl, 'Render did not properly escape the reactive variable in the test attribute. attrB:', attrB);
	}

	// Test inserted attribute substitution inside a render.
	let attrHackTag = _getObj('#checkRenderAttrSubHack');

	if (attrHackTag.textContent !== '<script>createHavoc()</script>') {
		_fail(checkRenderEl, 'Render did not properly escape the insert attribute variable into the test content area. #checkRenderAttrSubHack.textContent:', attrHackTag.textContent);
	}

	_addSuccessClass(checkRenderEl);
}

/* This test is covered by the clone command test, as they work together. */

function checkRun(o) {
	let checkRunEl = _initTest('checkRun');
	if (!checkRunEl) return;

	if (typeof window.runResult !== undefined) {
		if (window.runResult === 2) {
			_addSuccessClass(checkRunEl);
		} else {
			_fail(checkRunEl, 'window.runResult is being defined in run check but result doesn\'t equal 2.');
		}
	} else {
		_fail(checkRunEl, 'window.runResult not being defined in run check.');
	}
}

function checkScrollIntoViewA(o) {
	let checkScrollIntoViewEl = _initTest('checkScrollIntoView');
	if (!checkScrollIntoViewEl) return;

	let el = _getObj('#checkScrollIntoViewDiv');

	if (_isPartiallyVisible(el)) {
		_fail(checkScrollIntoViewEl, 'Test element #checkScrollIntoViewDiv should not be visible prior to test.');
	}
}

function checkScrollIntoViewFinal(o) {
	let checkScrollIntoViewEl = _initTest('checkScrollIntoView');
	if (!checkScrollIntoViewEl) return;

	let el = _getObj('#checkScrollIntoViewDiv');

	if (!_isPartiallyVisible(el)) {
		_fail(checkScrollIntoViewEl, 'Test element #checkScrollIntoViewDiv is not in view at the end of the test.');
	}

	_addSuccessClass(checkScrollIntoViewEl);
}

function checkScrollXRight(o) {
	let checkScrollXEl = _initTest('checkScrollX');
	if (!checkScrollXEl) return;

	let el = _getObj('#scrollXBox');

	if (el.scrollLeft != 800) {
		_fail(checkScrollXEl, '#scrollXBox.scrollLeft does not equal 800 for "scroll-x: right;" test.');
	}
}

function checkScrollXHalfway(o) {
	let checkScrollXEl = _initTest('checkScrollX');
	if (!checkScrollXEl) return;

	let el = _getObj('#scrollXBox');

	if (el.scrollLeft != 415) {
		_fail(checkScrollXEl, '#scrollXBox.scrollLeft does not equal 415 for "scroll-x: 415;" test.');
	}
}

function checkScrollXFinal(o) {
	let checkScrollXEl = _initTest('checkScrollX');
	if (!checkScrollXEl) return;

	let el = _getObj('#scrollXBox');

	if (el.scrollLeft != 0) {
		_fail(checkScrollXEl, '#scrollXBox.scrollLeft does not equal 0 for "scroll-x: left;" test.');
	} else {
		_addSuccessClass(checkScrollXEl);
	}
}

function checkScrollYBottom(o) {
	let checkScrollYEl = _initTest('checkScrollY');
	if (!checkScrollYEl) return;

	let el = _getObj('#scrollYBox');

	if (el.scrollTop != 800) {
		_fail(checkScrollYEl, '#scrollYBox.scrollTop does not equal 800 for "scroll-y: right;" test.');
	}
}

function checkScrollYHalfway(o) {
	let checkScrollYEl = _initTest('checkScrollY');
	if (!checkScrollYEl) return;

	let el = _getObj('#scrollYBox');

	if (el.scrollTop != 415) {
		_fail(checkScrollYEl, '#scrollYBox.scrollTop does not equal 415 for "scroll-y: 415;" test.');
	}
}

function checkScrollYFinal(o) {
	let checkScrollYEl = _initTest('checkScrollY');
	if (!checkScrollYEl) return;

	let el = _getObj('#scrollYBox');

	if (el.scrollTop != 0) {
		_fail(checkScrollYEl, '#scrollYBox.scrollTop does not equal 0 for "scroll-y: left;" test.');
	} else {
		_addSuccessClass(checkScrollYEl);
	}
}

function checkSetAttribute(o) {
	let checkSetAttributeEl = _initTest('checkSetAttribute');
	if (!checkSetAttributeEl) return;

	let el = _getObj('#setAttributeDiv');
	if (!el) {
		_fail(checkSetAttributeEl, '#setAttributeDiv not present to perform set-attribute command.');
	}

	if (el.hasAttribute('data-test')) {
		if (el.getAttribute('data-test') == 'some data') {
			_addSuccessClass(checkSetAttributeEl);
		} else {
			_fail(checkSetAttributeEl, 'Added attribute "data-test" to #setAttributeDiv but it does not contain the text "some data". Element:', el);
		}
	} else {
		_fail(checkSetAttributeEl, 'Failed to add the attribute "data-test" to #setAttributeDiv. Element:', el);
	}
}

function checkSetAttributeHtmlEntityDecode_1(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (!el) {
		_fail(checkSetAttributeHtmlEntityDecodeEl, '#setAttributeHtmlEntityDecodeDiv not present to perform set-attribute command.');
	}

	if (!el.hasAttribute('data-test')) {
		_fail(checkSetAttributeHtmlEntityDecodeEl, 'Failed to add the attribute "data-test" to #setAttributeHtmlEntityDecodeDiv. el:', el);
	} else {
		if (el.getAttribute('data-test') != '&lt;marquee&gt;Hi&lt;/marquee&gt;') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not equals "&lt;marquee&gt;Hi&lt;/marquee&gt;" from escaped string. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecode_2(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (el) {
		if (el.getAttribute('data-test') != '<marquee>Hi</marquee>') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not escape to "<marquee>Hi</marquee>" from escaped string. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecode_3(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (el) {
		if (el.getAttribute('data-test') != '&lt;marquee&gt;Hi&lt;/marquee&gt;') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not equals "&lt;marquee&gt;Hi&lt;/marquee&gt;" from escaped variable. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecode_4(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (el) {
		if (el.getAttribute('data-test') != '<marquee>Hi</marquee>') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not escape to "<marquee>Hi</marquee>" from escaped variable. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecodeFinal(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	_addSuccessClass(checkSetAttributeHtmlEntityDecodeEl);
}


// set-class: "classes with .quotes";
// func: checkSetClassA;
function checkSetClassA(o) {
	let checkSetClassEl = _initTest('checkSetClass');
	if (!checkSetClassEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		_fail(checkSetClassEl, 'Element to test (#setClassBox) is not there.');
		return;
	}

	if (!_hasClassObj(el, 'classes') || !_hasClassObj(el, 'with') || !_hasClassObj(el, 'quotes')) {
		_fail(checkSetClassEl, 'The classes with .quotes test failed. Element:', el);
	}

	// Check if the old classes are still there. This tests a full replacement.
	if (_hasClassObj(el, 'some') || _hasClassObj(el, 'randomClasses') || _hasClassObj(el, 'in') || _hasClassObj(el, 'here')) {
		_fail(checkSetClassEl, 'The classes with .quotes test failed because the old classes are still there. Element:', el);
	}
}

// set-class: .someclasses .without .thequotes;
// func: checkSetClassB;
function checkSetClassB(o) {
	let checkSetClassEl = _initTest('checkSetClass');
	if (!checkSetClassEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		_fail(checkSetClassEl, 'Element to test (#setClassBox) is not there. Element:', el);
		return;
	}

	// Check for the new classes.
	if (!_hasClassObj(el, 'someclasses') || !_hasClassObj(el, 'without') || !_hasClassObj(el, 'thequotes')) {
		_fail(checkSetClassEl, 'The .someclasses .without .thequotes test failed. Element:', el);
	}
}

// set-class: moreclasses with no dots;
// func: checkSetClassFinal;
function checkSetClassFinal(o) {
	let checkSetClassEl = _initTest('checkSetClass');
	if (!checkSetClassEl) return;

	let el = _getObj('#setClassBox');
	if (!el) {
		_fail(checkSetClassEl, 'Element to test (#setClassBox) is not there. Element:', el);
		return;
	}

	// Check for the new classes.
	if (!_hasClassObj(el, 'moreclasses') || !_hasClassObj(el, 'with') || !_hasClassObj(el, 'no') || !_hasClassObj(el, 'dots')) {
		_fail(checkSetClassEl, 'The moreclasses with no dots test failed. Element:', el);
	}

	_addSuccessClass(checkSetClassEl);
}

function checkSetCookie(o) {
	let checkSetCookieEl = _initTest('checkSetCookie');
	if (!checkSetCookieEl) return;

	let test1 = _getCookie('test1');
	let test2 = _getCookie('test2');
	let test3 = _getCookie('test3');
	let test4 = _getCookie('test4');
	let test5 = _getCookie('test5');
	let test6 = _getCookie('test6');
	let test7 = _getCookie('test7');

	if (test1 != 'Y') {
		_fail(checkSetCookieEl, 'test1 cookie is not set to "Y"');
	}

	if (test2 != 'some%20info%22\'') {
		_fail(checkSetCookieEl, 'test2 cookie is not set to "some%20info%22\'"');
	}

	if (test3 == 'fred') {	// This shouldn't exist!
		_fail(checkSetCookieEl, 'test3 cookie is set to "Fred" but shouldn\'t be - it should be expired.');
	}

	if (test4 == 'expired%20cookie' || test5 != 'non-expired%20cookie') {
		// Both these checks need to occur to ascertain whether a correctly formatted string date test works.
		_fail(checkSetCookieEl, 'Cookie straight date test failed.');
	}

	if (test6 == 'expression%20expired' || test7 != 'expression%20not%20expired') {
		// Both these checks need to occur to ascertain whether an expression inserted as an expiry date with "{= =}" test works.
		_fail(checkSetCookieEl, 'Cookie expression date test failed.');
	}

	_addSuccessClass(checkSetCookieEl);
}

function checkSetProperty(o) {
	let checkSetPropertyEl = _initTest('checkSetProperty');
	if (!checkSetPropertyEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(checkSetPropertyEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_addSuccessClass(checkSetPropertyEl);
	} else {
		_fail(checkSetPropertyEl, 'Failed to remove the disabled property from #setPropertyInput. Element:', el);
	}
}

function checkSetPropertyBefore(o) {
	let checkSetPropertyEl = _initTest('checkSetProperty');
	if (!checkSetPropertyEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(checkSetPropertyEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_fail(checkSetPropertyEl, '#setPropertyInput is not disabled before the test of set-property begins and it shouldn\'t be.');
	}
}

function checkStopEventPropagation(o, pars) {
	let checkStopEventPropagationEl = _initTest('checkStopEventPropagation');
	if (!checkStopEventPropagationEl) return;

	if (pars[0] !== 1 || pars[1] !== 1) {
		_fail(checkStopEventPropagationEl, 'It failed to handle stop-event-propagation correctly. pars[0]:', pars[0], 'pars[1]:', pars[1]);
	} else {
		_addSuccessClass(checkStopEventPropagationEl);
	}

	_addSuccessClass(checkStopEventPropagationEl);
}

function checkStopImmediateEventPropagation(o, pars) {
	let checkStopImmediateEventPropagationEl = _initTest('checkStopImmediateEventPropagation');
	if (!checkStopImmediateEventPropagationEl) return;

	if (pars[0] === true) {
		_fail(checkStopImmediateEventPropagationEl, 'It failed to stop-immediate-event-propagation and ran the class event on the same element.');
	} else {
		_addSuccessClass(checkStopImmediateEventPropagationEl);
	}
}

// This needs to be setup here before Active CSS starts up for a valid test.
// This is very similar to the stop-immediate-event-propagation test. It's good enough if it does the same thing in practice. If it didn't pass this then
// something would be wrong with the way the browser itself was handling it - as long as Active CSS runs event.stopImmediatePropagation() correctly.
window.checkStopImmedPropagationRealClickVarDiv = 0;

document.body.addEventListener('click', function (e) {
	let stopImmedPropEl = _getObj('#checkStopImmedPropA');
	if (stopImmedPropEl && e.target == stopImmedPropEl) {
		window.checkStopImmedPropagationRealClickVarDiv = 1;
	}
}, { capture: true });

function checkStopImmediatePropagation(o, pars) {
	let checkStopImmediatePropagationEl = _initTest('checkStopImmediatePropagation');
	if (!checkStopImmediatePropagationEl) return;

	let divVar = window.checkStopImmedPropagationRealClickVarDiv;

	if (pars[0] === true || divVar == 1) {
		_fail(checkStopImmediatePropagationEl, 'It failed to stop-immediate-propagation and ran the class event on the same element.');
	} else {
		_addSuccessClass(checkStopImmediatePropagationEl);
	}
}

// This needs to be setup here before Active CSS starts up for a valid test.
window.checkStopPropagationRealClickVarDiv = 0;

document.body.addEventListener('click', function (e) {
	let stopPropEl = _getObj('#checkStopPropagationDiv');
	if (stopPropEl && e.target == stopPropEl) {
		window.checkStopPropagationRealClickVarDiv = 1;
	}
}, { capture: true });

function checkStopPropagation(o, pars) {
	let checkStopPropagationEl = _initTest('checkStopPropagation');
	if (!checkStopPropagationEl) return;

	let divVar = window.checkStopPropagationRealClickVarDiv;

	if (pars[0] !== 1 || pars[1] !== 1 || divVar === 1) {
		_fail(checkStopPropagationEl, 'It failed to handle stop-propagation correctly. pars[0]:', pars[0], 'pars[1]:', pars[1], 'divVar:', divVar);
	} else {
		_addSuccessClass(checkStopPropagationEl);
	}
}

function checkStyle(o) {
	// Check that the element to remove the class from is definitely there.
	let checkStyleEl = _initTest('checkStyle');
	if (!checkStyleEl) return;

	// Check if the class is no longer there.
	if (checkStyleEl.style.backgroundColor != 'green') {
		_fail(checkStyleEl, 'Green was not set as the background color of the test element.');
		return;
	}

	_addSuccessClass(checkStyleEl);
}

function checkTakeClassA(o) {
	let checkTakeClassEl = _initTest('checkTakeClass');
	if (!checkTakeClassEl) return;

	// Check if the orange option is selected. That's all we ned to do at this point.
	if (!_hasClassObj(_getObj('#takeClassOrange'), 'taken')) {
		_fail(checkTakeClassEl, 'The orange fruit did not get the class.');
	}
}

function checkTakeClassFinal(o) {
	let checkTakeClassEl = _initTest('checkTakeClass');
	if (!checkTakeClassEl) return;

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
				_fail(checkTakeClassEl, 'Some fruit other than lime still has the class.');
			}
		}
	});
	if (quit) return;
	if (!success) {
		_fail(checkTakeClassEl, 'The lime fruit did not get the class.');
		return;
	}
	_addSuccessClass(checkTakeClassEl);
}

function checkToggleClassA(o) {
	let checkToggleClassEl = _initTest('checkToggleClass');
	if (!checkToggleClassEl) return;

	if (!_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(checkToggleClassEl, 'The first toggle did not add the class.');
	}
}



function checkToggleClassFinal(o) {
	let checkToggleClassEl = _initTest('checkToggleClass');
	if (!checkToggleClassEl) return;

	if (_hasClassObj(_getObj('#toggleClassBox'), 'butNotReally')) {
		_fail(checkToggleClassEl, 'The second toggle did not remove the class.');
		return;
	}

	_addSuccessClass(checkToggleClassEl);
}

function checkTriggerReal(o) {
	let checkTriggerRealEl = _initTest('checkTriggerReal');
	if (!checkTriggerRealEl) return;

	let el = _getObj('#checkTriggerReal p');
	if (!el) {
		_fail(checkTriggerRealEl, '#checkTriggerReal p not there for the test.');
	} else if (el.innerHTML !== 'Hello. Is it me you\'re looking for too?') {
		_fail(checkTriggerRealEl, 'target div does not contain "Hello. Is it me you\'re looking for too?" after test.');
	} else {
		_addSuccessClass(checkTriggerRealEl);
	}
}

function checkTriggerRealSetUpDocumentEvent(o) {
	let el = document.querySelector('#checkTriggerReal p');
	el.addEventListener('click', function() {
		checkTriggerReal(o);
	});
}

function checkTrigger(o) {
	let checkTriggerEl = _initTest('checkTrigger');
	if (!checkTriggerEl) return;

	let el = _getObj('#checkTrigger p');
	if (!el) {
		_fail(checkTriggerEl, '#checkTrigger p not there for the test.');
	} else if (el.innerHTML !== 'Hello. Is it me you\'re looking for?') {
		_fail(checkTriggerEl, 'target div does not contain "Hello. Is it me you\'re looking for?" after test.');
	} else {
		_addSuccessClass(checkTriggerEl);
	}
}

function checkUrlChange(o) {
	let checkUrlChangeEl = _initTest('checkUrlChange');
	if (!checkUrlChangeEl) return;

	let urlTestOk = false, titleTestOk = false;

	if (window.location.pathname === '/test/funky/url') {
		urlTestOk = true;
	} else {
		_fail(checkUrlChangeEl, 'url-change failed to change the URL to "/test/funky/url", window.location.pathname:', window.location.pathname);
	}

	if (document.title === 'Funky test URL') {
		titleTestOk = true;
	} else {
		_fail(checkUrlChangeEl, 'url-change failed to change the document.title to "Funky test URL", document.title:', document.title);
	}

	if (urlTestOk && titleTestOk) {
		_addSuccessClass(checkUrlChangeEl);
	}
}

function checkVar(o, pars) {
	let checkVarEl = _initTest('checkVar');
	if (!checkVarEl) return;

	_shouldBe(checkVarEl, 'varTestString', pars[0], 'Hi, "dude".');
	_shouldBe(checkVarEl, 'varTestBooleanTrue', pars[1], true);
	_shouldBe(checkVarEl, 'varTestBooleanFalse', pars[2], false);
	_shouldBe(checkVarEl, 'varTestBooleanDigitPositive', pars[3], 10);
	_shouldBe(checkVarEl, 'varTestBooleanDigitNegative', pars[4], -20);
	_shouldBe(checkVarEl, 'varTestEvaluatedNumber', pars[5], 8);
	_shouldBe(checkVarEl, 'window.varTestWinVar as a parameter', pars[6], 'hello');
	_shouldBe(checkVarEl, 'window.varTestWinVar as a variable', window.varTestWinVar, 'hello');
	_shouldBe(checkVarEl, 'varTestArrayAssignProp', pars[7], true);

	// The test will not pass if any of the above comparisons fail. The success flag added below will be ignored by the test system.
	_addSuccessClass(checkVarEl);
}

function checkIfVarEmptyArrayFail(o) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	_fail(checkIfVarEl, 'if-var failed with the checking of an empty array');
}

function checkIfVarNotPopulatedArrayFail(o) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	_fail(checkIfVarEl, 'not-if-var failed with the checking of a non-populated array');
}

function checkIfVarArrayEqualsFail(o) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	_fail(checkIfVarEl, 'not-if-var failed with the equals checking of array');
}

function checkIfVarFinal(o, pars) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	if (pars[0] == 3) {
		// Finish up. If it's failed by this point it will error.
		_addSuccessClass(checkIfVarEl);
	}
}

function checkAwaitAjax(o) {
	let checkAwaitAjaxEl = _initTest('checkAwaitAjax');
	if (!checkAwaitAjaxEl) return;

	let testTitle = _getObj('#checkAwaitAjaxTestTitle');
	let testAddress = _getObj('#checkAwaitAjaxTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(checkAwaitAjaxEl, 'Ajax command failed to update variables automatically.');
	}

	_addSuccessClass(checkAwaitAjaxEl);

}

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

function continueAfterElementRemoval_1(o) {
	let continueAfterElementRemovalEl = _initTest('continueAfterElementRemoval');
	if (!continueAfterElementRemovalEl) return;

	let el = _getObj('#continueAfterElementRemoval');
	if (!el) {
		_fail(continueAfterElementRemovalEl, '#continueAfterElementRemoval was not present to perform test.');
	}
}

function continueAfterElementRemovalFinal(o, pars) {
	let continueAfterElementRemovalEl = _initTest('continueAfterElementRemoval');
	if (!continueAfterElementRemovalEl) return;

	let el = _getObj('#continueAfterElementRemoval');
	if (!el) {
		_fail(continueAfterElementRemovalEl, '#continueAfterElementRemoval was still there after it was supposed to be removed.');
	}

	if (pars && pars[0] === 'this ran') {
		_addSuccessClass(continueAfterElementRemovalEl);
	} else {
		if (pars && pars[0] === 'This shouldn\'t run at all') {
			_fail(continueAfterElementRemovalEl, 'The system is running actions on elements that didn\'t exist when the action command loop was entered and it shouldn\'t.');
		} else {
			_fail(continueAfterElementRemovalEl, 'Failed to continue running actions after element was removed. pars:', pars);
		}
	}
}

function quoteCheckOnSetAttributeAndSetPropertyFinal(o, pars) {
	let quoteCheckOnSetAttributeAndSetPropertyEl = _initTest('quoteCheckOnSetAttributeAndSetProperty');
	if (!quoteCheckOnSetAttributeAndSetProperty) return;

	let el = _getObj('#quoteCheckOnSetAttributeAndSetPropertyTarget');
	if (!el) {
		_fail(quoteCheckOnSetAttributeAndSetPropertyEl, '#quoteCheckOnSetAttributeAndSetPropertyTarget is not present for attribute/property check.');
	}

	_shouldBe(quoteCheckOnSetAttributeAndSetPropertyEl, 'attribute', pars[0], 'was "Test Stuff".');
	_shouldBe(quoteCheckOnSetAttributeAndSetPropertyEl, 'property', pars[1], 'was "Test Stuff".');

	// The test will not pass if any of the above comparisons fail. The success flag added below will be ignored by the test system.
	_addSuccessClass(quoteCheckOnSetAttributeAndSetPropertyEl);
}
