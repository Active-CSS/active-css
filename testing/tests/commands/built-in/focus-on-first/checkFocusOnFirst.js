/*
		<form id="focusOnFirstForm">
		    <input id="focusOnFirstTarget" type="text" name="focus1" value="Cheryl">
		    <input type="text" name="focus2" value="Dave">
		    <input type="text" name="focus3" value="Bob">
		    <input type="text" name="focus4" value="Tracy">
		    <input type="text" name="focus4" value="Sharon">
		</form>
*/

function checkFocusOnFirst(o) {
	let testEl = _initTest('checkFocusOnFirst');
	if (!testEl) return;

	// Initially #focusOnFirstTarget not in focus. Activates after 3s.
	let el = _getObj('#focusOnFirstTarget');

	// We want not in focus at start.
	if (!el.isSameNode(document.activeElement)) {
		setTimeout(function() {
			// Now we want in focus.
			if (el.isSameNode(document.activeElement)) {
				// That looked good.
				_addSuccessClass(testEl);
			} else {
				_fail(testEl, '#focusOnFirstTarget is not in focus after 3s and it should be.');
			}
		}, 3100);
	} else {
		_fail(testEl, '#focusOnFirstTarget in focus at the start and it shouldn\'t be.');
	}
}
