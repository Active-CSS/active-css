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
