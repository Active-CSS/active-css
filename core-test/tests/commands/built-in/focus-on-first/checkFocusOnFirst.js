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
	let checkFocusOnFirstEl = _initTest('checkFocusOnFirst');
	if (!checkFocusOnFirstEl) return;

	let el = _getObj('#focusOnFirstTarget');

	// We want not in focus at start.
	if (el.isSameNode(document.activeElement)) {
		_fail(checkFocusOnFirstEl, '#focusOnFirstTarget is in focus at the start of the test and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnFirstFinal(o) {
	let checkFocusOnFirstEl = _initTest('checkFocusOnFirst');
	if (!checkFocusOnFirstEl) return;

	let el = _getObj('#focusOnFirstTarget');

	if (el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnFirstEl);
	} else {
		_fail(checkFocusOnFirstEl, '#focusOnFirstTarget is not in focus at the end and it should be.');
	}
}
