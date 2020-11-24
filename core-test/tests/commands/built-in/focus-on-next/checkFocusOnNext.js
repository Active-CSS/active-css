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
