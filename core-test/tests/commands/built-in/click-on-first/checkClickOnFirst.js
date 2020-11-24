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
