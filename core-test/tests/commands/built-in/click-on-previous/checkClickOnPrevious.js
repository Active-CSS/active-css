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
