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
