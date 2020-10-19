/* Pended until clone/restore-clone issue 36 has been resolved.

function checkClone(o) {
	let testEl = _initTest('checkClone');
	if (!testEl) return;

	let el = _getObj('#restoreCloneInHere');
	if (el.innerHTML == '<p class="cloneText"><span>This text is going to be cloned</span></p>') {
		_addSuccessClass(testEl);
	} else {
		_fail(testEl, 'The #restoreCloneHere element failed to receive the clone from .cloneText. el.innerHTML:', el.innerHTML);
	}
}

function checkCloneBefore(o) {
	let testEl = _initTest('checkClone');
	if (!testEl) return;

	let el = _getObj('#restoreCloneInHere');
	if (el.innerHTML != '<div id="restoreHere"></div>') {
		_fail(testEl, 'The #restoreCloneHere element hasn\'t got the correct inner HTML before the clone test starts.');
	}
}
*/