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
