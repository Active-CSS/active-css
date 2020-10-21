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

function checkCancelTimerAllA(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform first cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for first test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllB(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform second cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for second test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllC(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform third cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for third test and it shouldn\'t be there. Element:', el);
		}
	}
}

function checkCancelTimerAllFinal(o) {
	let testEl = _initTest('checkCancelTimerAll');
	if (!testEl) return;

	let el = _getObj('#cancelTimerAllDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerAllDiv not present to perform fourth cancel-timer-all command command.');
	} else {
		if (el.style.backgroundColor == 'green') {
			_fail(testEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
		}
		if (_hasClassObj(el, 'testAddition')) {
			_fail(testEl, 'testAddition class exists for fourth test and it shouldn\'t be there. Element:', el);
		}
		_addSuccessClass(testEl);	// A failed marking will stop a test from passing even if this line is here.
	}
}

// No js needed for this checkAddClass test.
function checkAjaxPreGetA(o, pars) {
	let testEl = _initTest('checkAjaxPreGet');
	if (!testEl) return;

	if (o.ajaxObj.res.checkAjaxPreGetTitle != 'Rod' || o.ajaxObj.res.checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax-pre-get command not getting the values from the file in o.res.');
	}

	if (o.vars.checkAjaxPreGetTitle == 'Rod' || o.vars.checkAjaxPreGetAddress == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Variables are getting set as scoped variables prior to ajax command and they shouldn\'t be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML == 'Rod' || testAddress.innerHTML == '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax-pre-get command is not only updating variables but updating the page and it shouldn\'t.');
	}
}

function checkAjaxPreGetFinal(o, pars) {
	let testEl = _initTest('checkAjaxPreGet');
	if (!testEl) return;

	if (o.vars.checkAjaxPreGetTitle != 'Rod' || o.vars.checkAjaxPreGetAddress != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Variables are not getting set as scoped variables after the ajax command and they should be.');
	}

	let testTitle = _getObj('#checkAjaxPreGetTestTitle');
	let testAddress = _getObj('#checkAjaxPreGetTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax command failed to update variables on the page after the prior ajax-pre-get.');
	}

	_addSuccessClass(testEl);
}

function checkAjax(o) {
	let testEl = _initTest('checkAjax');
	if (!testEl) return;

	let testTitle = _getObj('#checkAjaxTestTitle');
	let testAddress = _getObj('#checkAjaxTestAddress');

	if (testTitle.innerHTML != 'Rod' || testAddress.innerHTML != '27 Madeup Road, Blithering, Ploushershire.') {
		_fail(testEl, 'Ajax command failed to update variables automatically.');
	}

	_addSuccessClass(testEl);

}

// Just need to make this test successful, so we can just replace the native alert call with a success updater.
// Alert should only need to be tested once in the tests. Active CSS shouldn't *ever* produce any alert notifications.
window.alert = function(idToMarkSuccessFul) {
	// Out of scope of everything so need to do a manual update on the test element.
	let el = document.getElementById(idToMarkSuccessFul);
	el.classList.add('success');
};

function checkBlurA(o) {
	let testEl = _initTest('checkBlur');
	if (!testEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(testEl, '#blurField is not in focus for the first test and it should be.');
	}
}

function checkBlurFinal(o) {
	let testEl = _initTest('checkBlur');
	if (!testEl) return;

	let el = _getObj('#blurField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#blurField in not out of focus at the end.');
	}
}

function checkCancelTimerA(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform first cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for first test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerB(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform second cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for second test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerC(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform third cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for third test and it shouldn\'t. Element:', el);
	}
}

function checkCancelTimerFinal(o) {
	let testEl = _initTest('checkCancelTimer');
	if (!testEl) return;

	let el = _getObj('#cancelTimerDiv');
	if (!el) {
		_fail(testEl, '#cancelTimerDiv not present to perform fourth cancel-timer command command.');
	} else if (el.style.backgroundColor == 'green') {
		_fail(testEl, 'Green color exists for fourth test and it shouldn\'t. Element:', el);
	} else {
		_addSuccessClass(testEl);
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
	let testEl = _initTest('checkClickOnFirst');
	if (!testEl) return;

	let el = _getObj('#clickOnFirstP');

	if (el.innerHTML != '') {
		_fail(testEl, '#clickOnFirstP is not empty. It contains the text "' + el.innerHTML + '"');
	}
}

function checkClickOnFirstFinal(o) {
	let testEl = _initTest('checkClickOnFirst');
	if (!testEl) return;

	let el = _getObj('#clickOnFirstP');

	// Now we want in focus.
	if (el.innerHTML == 'green') {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#clickOnFirstP does not contain the test "green" and it should by now.');
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
	let testEl = _initTest('checkClickOnLast');
	if (!testEl) return;

	let el = _getObj('#clickOnLastP');

	if (el.innerHTML != '') {
		_fail(testEl, '#clickOnLastP is not empty. It contains the text "' + el.innerHTML + '"');
	}
}

function checkClickOnLastFinal(o) {
	let testEl = _initTest('checkClickOnLast');
	if (!testEl) return;

	let el = _getObj('#clickOnLastP');

	if (el.innerHTML == 'purple and green') {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#clickOnLastP does not contain the test "purple and green" and it should by now.');
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
	let testEl = _initTest('checkClickOnNextCycle');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#clickOnNextCycleStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnNextCycleB(o) {
	let testEl = _initTest('checkClickOnNextCycle');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	if (el.innerHTML != 'yellow') {
		_fail(testEl, '#clickOnNextCycleP does not contain the test "yellow" and it should by now.');
	}
}

function checkClickOnNextCycleC(o) {
	let testEl = _initTest('checkClickOnNextCycle');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	if (el.innerHTML != 'purple and green') {
		_fail(testEl, '#clickOnNextCycleP does not contain the test "purple and green" and it should by now.');
	}
}

function checkClickOnNextCycleFinal(o) {
	let testEl = _initTest('checkClickOnNextCycle');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnNextCycleStart');
	let el = _getObj('#clickOnNextCycleP');

	if (el.innerHTML == 'green') {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#clickOnNextCycleP does not contain the test "green".');
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
	let testEl = _initTest('checkClickOnNext');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnNextStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#clickOnNextStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnNextB(o) {
	let testEl = _initTest('checkClickOnNext');
	if (!testEl) return;

	let el = _getObj('#clickOnNextP');

	if (el.innerHTML != 'yellow') {
		_fail(testEl, '#clickOnNextP does not contain the test "yellow" and it should by now.');
	}
}

function checkClickOnNextC(o) {
	let testEl = _initTest('checkClickOnNext');
	if (!testEl) return;

	let el = _getObj('#clickOnNextP');

	// We want not in focus at start.
	if (el.innerHTML != 'purple and green') {
		_fail(testEl, '#clickOnNextP does not contain the test "purple and green" and it should by now.');
	}
}

function checkClickOnNextFinal(o) {
	let testEl = _initTest('checkClickOnNext');
	if (!testEl) return;

	let el = _getObj('#clickOnNextP');

	if (el.innerHTML == 'purple and green') {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#clickOnNextP does not contain the test "purple and green".');
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
	let testEl = _initTest('checkClickOnPreviousCycle');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnPreviousCycleStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#clickOnPreviousCycleStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnPreviousCycleB(o) {
	let testEl = _initTest('checkClickOnPreviousCycle');
	if (!testEl) return;

	let el = _getObj('#clickOnPreviousCycleP');

	if (el.innerHTML != 'orange') {
		_fail(testEl, '#clickOnPreviousCycleP does not contain the test "orange" and it should by now.');
	}
}

function checkClickOnPreviousCycleC(o) {
	let testEl = _initTest('checkClickOnPreviousCycle');
	if (!testEl) return;

	let el = _getObj('#clickOnPreviousCycleP');

	if (el.innerHTML != 'green') {
		_fail(testEl, '#clickOnPreviousCycleP does not contain the test "green" and it should by now.');
	}
}

function checkClickOnPreviousCycleFinal(o) {
	let testEl = _initTest('checkClickOnPreviousCycle');
	if (!testEl) return;

	let el = _getObj('#clickOnPreviousCycleP');

	if (el.innerHTML == 'purple and green') {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#clickOnPreviousCycleP does not contain the test "purple and green".');
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
	let testEl = _initTest('checkClickOnPrevious');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnPreviousStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#clickOnPreviousStart is in focus at the start and it shouldn\'t be.');
	}
}

function checkClickOnPreviousB(o) {
	let testEl = _initTest('checkClickOnPrevious');
	if (!testEl) return;

	let el = _getObj('#clickOnPreviousP');

	if (el.innerHTML != 'orange') {
		_fail(testEl, '#clickOnPreviousP does not contain the test "orange" and it should by now.');
	}
}

function checkClickOnPreviousC(o) {
	let testEl = _initTest('checkClickOnPrevious');
	if (!testEl) return;

	let el = _getObj('#clickOnPreviousP');

	if (el.innerHTML != 'green') {
		_fail(testEl, '#clickOnPreviousP does not contain the test "green" and it should by now.');
	}
}

function checkClickOnPreviousFinal(o) {
	let testEl = _initTest('checkClickOnPrevious');
	if (!testEl) return;

	let el = _getObj('#clickOnPreviousP');

	if (el.innerHTML == 'green') {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#clickOnPreviousP does not contain the test "green".');
	}
}

function checkClickoutsideEvent(o) {
	let testEl = _initTest('checkClickoutsideEvent');
	if (!testEl) return;

	let bod = document.body;

	if (!_hasClassObj(bod, 'clickoutside1')) {
		_fail(testEl, 'The clickoutside1 class has not been set and should have been.');
	}

	if (!_hasClassObj(bod, 'clickoutside2')) {
		_fail(testEl, 'The clickoutside2 class has not been set and should have been.');
	}
		
	_addSuccessClass(testEl);
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
	let testEl = _initTest('checkCreateCommand');
	if (!testEl) return;

	let el = _getObj('#checkCreateCommandDiv');
	if (!el) {
		_fail(testEl, '#checkCreateCommandDiv not present to run create-command test.');
	}

	if (el.style.backgroundColor != 'blue') {
		_fail(testEl, '#checkCreateCommandDiv does not have a blue background-color and it should.');
	}

	if (el.style.color != 'yellow') {
		_fail(testEl, '#checkCreateCommandDiv does not have yellow color and it should.');
	}

	if (el.style.height != '100px') {
		_fail(testEl, '#checkCreateCommandDiv does not have height of 100px and it should.');
	}

	_addSuccessClass(testEl);
}

function checkCreateConditionalFail(o) {
	let testEl = _initTest('checkCreateConditional');
	if (!testEl) return;

	_fail(testEl, 'Test failed because it did not evaluate the conditional correctly.');
}

function checkCreateConditionalFinal(o) {
	let testEl = _initTest('checkCreateConditional');
	if (!testEl) return;

	_addSuccessClass(testEl);
}

function checkEval(o) {
	let testEl = _initTest('checkEval');
	if (!testEl) return;

	if (typeof window.evalResult !== undefined) {
		if (window.evalResult === 2) {
			_addSuccessClass(testEl);
		} else {
			_fail(testEl, 'window.evalResult is being defined in eval check but result doesn\'t equal 2.');
		}
	} else {
		_fail(testEl, 'window.evalResult not being defined in eval check.');
	}
}

// Note: This is the same test as the blur command but with different timings - focus-off is an alternative syntax.
function checkFocusOffA(o) {
	let testEl = _initTest('checkFocusOff');
	if (!testEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOffField is not in focus for the first test and it should be.');
	}
}

function checkFocusOffFinal(o) {
	let testEl = _initTest('checkFocusOff');
	if (!testEl) return;

	let el = _getObj('#focusOffField');

	if (!el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOffField in not out of focus at the end.');
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
	let testEl = _initTest('checkFocusOnFirst');
	if (!testEl) return;

	let el = _getObj('#focusOnFirstTarget');

	// We want not in focus at start.
	if (el.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnFirstTarget is in focus at the start of the test and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnFirstFinal(o) {
	let testEl = _initTest('checkFocusOnFirst');
	if (!testEl) return;

	let el = _getObj('#focusOnFirstTarget');

	if (el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOnFirstTarget is not in focus at the end and it should be.');
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
	let testEl = _initTest('checkFocusOnLast');
	if (!testEl) return;

	// Initially #focusOnLastTarget not in focus. Activates after 3.5s.
	let el = _getObj('#focusOnLastTarget');

	// We want not in focus at start.
	if (el.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnLastTarget is in focus at the start and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnLastFinal(o) {
	let testEl = _initTest('checkFocusOnLast');
	if (!testEl) return;

	let el = _getObj('#focusOnLastTarget');

	if (el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOnLastTarget is not in focus at the end and it should be.');
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
	let testEl = _initTest('checkFocusOnNextCycle');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnNextCycleStart');
	let secondEl = _getObj('#focusOnNextCycleSecond');
	let thirdEl = _getObj('#focusOnNextCycleEnd');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnNextCycleStart in focus at the start and it shouldn\'t be.');
	}
}

function checkFocusOnNextCycleB(o) {
	let testEl = _initTest('checkFocusOnNextCycle');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnNextCycleStart');

	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnNextCycleStart is not in focus after 4s and it should be.');
	}
}

function checkFocusOnNextCycleC(o) {
	let testEl = _initTest('checkFocusOnNextCycle');
	if (!testEl) return;

	let secondEl = _getObj('#focusOnNextCycleSecond');

	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnNextCycleSecond has not moved into focus');
	}
}

function checkFocusOnNextCycleFinal(o) {
	let testEl = _initTest('checkFocusOnNextCycle');
	if (!testEl) return;

	let thirdEl = _getObj('#focusOnNextCycleEnd');

	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOnNextCycleEnd is not in focus at the end');
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
	let testEl = _initTest('checkFocusOnNext');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnNextStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnNextStart is in focus at the start and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnNextB(o) {
	let testEl = _initTest('checkFocusOnNext');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnNextStart');

	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnNextStart has not moved into focus.');
	}
}

function checkFocusOnNextC(o) {
	let testEl = _initTest('checkFocusOnNext');
	if (!testEl) return;

	let secondEl = _getObj('#focusOnNextSecond');

	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnNextSecond has not moved into focus');
	}
}

function checkFocusOnNextD(o) {
	let testEl = _initTest('checkFocusOnNext');
	if (!testEl) return;

	let thirdEl = _getObj('#focusOnNextEnd');

	if (!thirdEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnNextEnd has not moved into focus');
	}
}

function checkFocusOnNextFinal(o) {
	let testEl = _initTest('checkFocusOnNext');
	if (!testEl) return;

	let thirdEl = _getObj('#focusOnNextEnd');

	// Is it still on the last element when it gets to the end and not something else?
	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOnNextEnd is not in focus at the end');
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
	let testEl = _initTest('checkFocusOnPreviousCycle');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousCycleStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnPreviousCycleStart in focus at the start and it shouldn\'t be.');
	}
}

function checkFocusOnPreviousCycleB(o) {
	let testEl = _initTest('checkFocusOnPreviousCycle');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousCycleStart');

	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnPreviousCycleStart is not in focus after 4s and it should be.');
	}
}

function checkFocusOnPreviousCycleC(o) {
	let testEl = _initTest('checkFocusOnPreviousCycle');
	if (!testEl) return;

	let secondEl = _getObj('#focusOnPreviousCycleSecond');

	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnPreviousCycleSecond has not moved into focus');
	}
}

function checkFocusOnPreviousCycleFinal(o) {
	let testEl = _initTest('checkFocusOnPreviousCycle');
	if (!testEl) return;

	let thirdEl = _getObj('#focusOnPreviousCycleEnd');

	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOnPreviousCycleEnd is not in focus at the end');
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
	let testEl = _initTest('checkFocusOnPrevious');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousStart');

	// We want not in focus at start.
	if (firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnPreviousStart in focus at the start and it shouldn\'t be.');
	}
}

function checkFocusOnPreviousB(o) {
	let testEl = _initTest('checkFocusOnPrevious');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousStart');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnPreviousStart is not in focus after 4s and it should be.');
	}
}

function checkFocusOnPreviousC(o) {
	let testEl = _initTest('checkFocusOnPrevious');
	if (!testEl) return;

	let secondEl = _getObj('#focusOnPreviousSecond');

	// We want not in focus at start.
	if (!secondEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnPreviousSecond has not moved into focus');
	}
}

function checkFocusOnPreviousD(o) {
	let testEl = _initTest('checkFocusOnPrevious');
	if (!testEl) return;

	let thirdEl = _getObj('#focusOnPreviousEnd');

	// We want not in focus at start.
	if (!thirdEl.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnPreviousEnd is not in focus at the end');
	}
}

function checkFocusOnPreviousFinal(o) {
	let testEl = _initTest('checkFocusOnPrevious');
	if (!testEl) return;

	let thirdEl = _getObj('#focusOnPreviousEnd');

	// Is it still on the last element when it gets to the end and not something else?
	if (thirdEl.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOnPreviousEnd is not in focus at the end');
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

function checkRemoveAttribute(o) {
	let testEl = _initTest('checkRemoveAttribute');
	if (!testEl) return;

	let el = _getObj('#removeAttributeDiv');
	if (!el) {
		_fail(testEl, '#removeAttributeDiv not present to perform remove-attribute command.');
	}

	if (!el.hasAttribute('data-test')) {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'Failed to remove the attribute "data-test" from #removeAttributeDiv. Element:', el);
	}
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

/* Pended until clone/restore-clone issue 36 has been resolved.
function checkRemoveClone(o) {
	let testEl = _initTest('checkRemoveClone');
	if (!testEl) return;

//	_fail(testEl, 'message');

	_addSuccessClass(testEl);
}
*/
function checkRemoveCookieA(o) {
	let testEl = _initTest('checkRemoveCookie');
	if (!testEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 != 'Y') {
		_fail(testEl, 'removeCookieTest1 cookie is not set at the beginning and it should be.');
	}
}

function checkRemoveCookieFinal(o) {
	let testEl = _initTest('checkRemoveCookie');
	if (!testEl) return;

	let removeCookieTest1 = _getCookie('removeCookieTest1');

	if (removeCookieTest1 == 'Y') {
		_fail(testEl, 'removeCookieTest1 cookie is still there and it shouldn\'t be.');
	}

	_addSuccessClass(testEl);
}

function checkRemoveProperty(o) {
	let testEl = _initTest('checkRemoveProperty');
	if (!testEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(testEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'Failed to remove the background-color property from #removePropertyDiv. Element:', el);
	}
}

function checkRemovePropertyBefore(o) {
	let testEl = _initTest('checkRemoveProperty');
	if (!testEl) return;

	let el = _getObj('#removePropertyDiv');
	if (!el) {
		_fail(testEl, '#removePropertyDiv not present to perform remove-property command.');
	}

	if (el.style.backgroundColor != 'green') {
		_fail(testEl, '#removePropertyDiv does not have a background-color of green before the test of remove-property begins.');
	}
}

function checkRemove(o) {
	let testEl = _initTest('checkRemove');
	if (!testEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#removeToRemove did not get removed by the remove command.');
	}
}

function checkRemoveBefore(o) {
	let testEl = _initTest('checkRemove');
	if (!testEl) return;

	let el = _getObj('#removeToRemove');
	if (!el) {
		_fail(testEl, '#removeToRemove is not present in order to perform the remove test.');
	}
}

/* This test is covered by the clone command test, as they work together. */

function checkRun(o) {
	let testEl = _initTest('checkRun');
	if (!testEl) return;

	if (typeof window.runResult !== undefined) {
		if (window.runResult === 2) {
			_addSuccessClass(testEl);
		} else {
			_fail(testEl, 'window.runResult is being defined in run check but result doesn\'t equal 2.');
		}
	} else {
		_fail(testEl, 'window.runResult not being defined in run check.');
	}
}

function checkSetAttribute(o) {
	let testEl = _initTest('checkSetAttribute');
	if (!testEl) return;

	let el = _getObj('#setAttributeDiv');
	if (!el) {
		_fail(testEl, '#setAttributeDiv not present to perform set-attribute command.');
	}

	if (el.hasAttribute('data-test')) {
		if (el.getAttribute('data-test') == 'some data') {
			_addSuccessClass(testEl);
		} else {
			_fail(testEl, 'Added attribute "data-test" to #setAttributeDiv but it does not contain the text "some data". Element:', el);
		}
	} else {
		_fail(testEl, 'Failed to add the attribute "data-test" to #setAttributeDiv. Element:', el);
	}
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

function checkSetCookie(o) {
	let testEl = _initTest('checkSetCookie');
	if (!testEl) return;

	let test1 = _getCookie('test1');
	let test2 = _getCookie('test2');
	let test3 = _getCookie('test3');
	let test4 = _getCookie('test4');
	let test5 = _getCookie('test5');
	let test6 = _getCookie('test6');
	let test7 = _getCookie('test7');

	if (test1 != 'Y') {
		_fail(testEl, 'test1 cookie is not set to "Y"');
	}

	if (test2 != 'some%20info%22\'') {
		_fail(testEl, 'test2 cookie is not set to "some%20info%22\'"');
	}

	if (test3 == 'fred') {	// This shouldn't exist!
		_fail(testEl, 'test3 cookie is set to "Fred" but shouldn\'t be - it should be expired.');
	}

	if (test4 == 'expired%20cookie' || test5 != 'non-expired%20cookie') {
		// Both these checks need to occur to ascertain whether a correctly formatted string date test works.
		_fail(testEl, 'Cookie straight date test failed.');
	}

	if (test6 == 'expression%20expired' || test7 != 'expression%20not%20expired') {
		// Both these checks need to occur to ascertain whether an expression inserted as an expiry date with "{= =}" test works.
		_fail(testEl, 'Cookie expression date test failed.');
	}

	_addSuccessClass(testEl);
}

function checkSetProperty(o) {
	let testEl = _initTest('checkSetProperty');
	if (!testEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(testEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'Failed to remove the disabled property from #setPropertyInput. Element:', el);
	}
}

function checkSetPropertyBefore(o) {
	let testEl = _initTest('checkSetProperty');
	if (!testEl) return;

	let el = _getObj('#setPropertyInput');
	if (!el) {
		_fail(testEl, '#setPropertyInput not present to perform set-property command.');
	}

	if (!el.disabled) {
		_fail(testEl, '#setPropertyInput is not disabled before the test of set-property begins and it shouldn\'t be.');
	}
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

function checkUrlChange(o) {
	let testEl = _initTest('checkUrlChange');
	if (!testEl) return;

	let urlTestOk = false, titleTestOk = false;

	if (window.location.pathname === '/test/funky/url') {
		urlTestOk = true;
	} else {
		_fail(testEl, 'url-change failed to change the URL to "/test/funky/url"');
	}

	if (document.title === 'Funky test URL') {
		titleTestOk = true;
	} else {
		_fail(testEl, 'url-change failed to change the document.title to "Funky test URL"');
	}

	if (urlTestOk && titleTestOk) {
		_addSuccessClass(testEl);
	}
}
