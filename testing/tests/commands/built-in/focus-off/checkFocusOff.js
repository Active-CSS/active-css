// Note: This is the same test as the blur command but with different timings - focus-off is an alternative syntax.
function checkFocusOff(o) {
	let testEl = _initTest('checkFocusOff');
	if (!testEl) return;

	// Initially #focusOffField not in focus. Activates after 2s. Focus-off actives after 2.5s (500ms later).
	let el = _getObj('#focusOffField');

	// We want not in focus at start.
	if (!el.isSameNode(document.activeElement)) {
		setTimeout(function() {
			// Now we want in focus.
			if (el.isSameNode(document.activeElement)) {
				setTimeout(function() {
					// Now we want not in focus.
					if (!el.isSameNode(document.activeElement)) {
						// That looked good.
						_addSuccessClass(testEl);
					} else {
						_fail(testEl, '#focusOffField in not out of focus at the end.');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOffField is not in focus after 2s and it should be.');
			}
		}, window.delayTimes.focusOff[0] + 100);
	} else {
		_fail(testEl, '#focusOffField in focus at the start and it shouldn\'t be.');
	}
}
