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
	let testEl = _initTest('checkFocusOnLast');
	if (!testEl) return;

	// Initially #focusOnLastTarget not in focus. Activates after 3.5s.
	let el = _getObj('#focusOnLastTarget');

	// We want not in focus at start.
	if (el.isSameNode(document.activeElement)) {
		_fail(testEl, '#focusOnLastTarget is in focus at the start and shouldn\'t be to get a valid test.');
	}
}

function checkFocusOnLastFinal(o) {
	let testEl = _initTest('checkFocusOnLast');
	if (!testEl) return;

	let el = _getObj('#focusOnLastTarget');

	if (el.isSameNode(document.activeElement)) {
		// That looked good.
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, '#focusOnLastTarget is not in focus at the end and it should be.');
	}
}
