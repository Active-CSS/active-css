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
