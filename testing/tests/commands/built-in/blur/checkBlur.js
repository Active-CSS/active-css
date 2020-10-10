function checkBlur(o) {
	let testEl = _initTest('checkBlur');
	if (!testEl) return;

	// Initially #blurField not in focus. Activates after 1s. Blur actives after 1.5s (500ms later).
	let el = _getObj('#blurField');

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
						_fail(testEl, '#blurField in not out of focus at the end.');
					}
				}, window.delayTimes.blur[1] - window.delayTimes.blur[0] + 100);
			} else {
				_fail(testEl, '#blurField is not in focus after 1s and it should be.');
			}
		}, window.delayTimes.blur[0] + 100);
	} else {
		_fail(testEl, '#blurField in focus at the start and it shouldn\'t be.');
	}
}
