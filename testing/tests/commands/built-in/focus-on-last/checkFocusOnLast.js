/*
		<form id="focusOnLastForm">
		    <input type="text" name="focus1" value="Cheryl">
		    <input type="text" name="focus2" value="Dave">
		    <input type="text" name="focus3" value="Bob">
		    <input type="text" name="focus4" value="Tracy">
		    <input id="focusOnLastTarget" type="text" name="focus4" value="Sharon">
		</form>
*/

function checkFocusOnLast(o) {
	let testEl = _initTest('checkFocusOnLast');
	if (!testEl) return;

	// Initially #focusOnLastTarget not in focus. Activates after 3.5s.
	let el = _getObj('#focusOnLastTarget');

	// We want not in focus at start.
	if (!el.isSameNode(document.activeElement)) {
		setTimeout(function() {
			// Now we want in focus.
			if (el.isSameNode(document.activeElement)) {
				// That looked good.
				_addSuccessClass(testEl);
			} else {
				_fail(testEl, '#focusOnLastTarget is not in focus after 3.5s and it should be.');
			}
		}, 3600);
	} else {
		_fail(testEl, '#focusOnLastTarget in focus at the start and it shouldn\'t be.');
	}
}
