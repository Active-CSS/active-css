/*
		<form id="focusOnLastForm">
		    <input type="text" name="focus1" value="Cheryl">
		    <input type="text" name="focus2" value="Dave">
		    <input type="text" name="focus3" value="Bob">
		    <input type="text" name="focus4" value="Tracy">
		    <input id="focusOnLastTarget" type="text" name="focus4" value="Sharon">
		</form>
*/

function checkFocusOnLastA(o) {
	let checkFocusOnLastEl = _initTest('checkFocusOnLast');
	if (!checkFocusOnLastEl) return;

	// Initially #focusOnLastTarget not in focus. Activates after 3.5s.
	let el = _getObj('#focusOnLastTarget');

	// We want not in focus at start.
	if (el.isSameNode(document.activeElement)) {
		_fail(checkFocusOnLastEl, '#focusOnLastTarget is in focus at the start and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnLastFinal(o) {
	let checkFocusOnLastEl = _initTest('checkFocusOnLast');
	if (!checkFocusOnLastEl) return;

	let el = _getObj('#focusOnLastTarget');

	if (el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(checkFocusOnLastEl);
	} else {
		_fail(checkFocusOnLastEl, '#focusOnLastTarget is not in focus at the end and it should be.');
	}
}
