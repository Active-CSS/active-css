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
