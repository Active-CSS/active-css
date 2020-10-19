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
