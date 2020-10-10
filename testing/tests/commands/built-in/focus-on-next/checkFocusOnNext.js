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

function checkFocusOnNext(o) {
	let testEl = _initTest('checkFocusOnNext');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnNextStart');
	let secondEl = _getObj('#focusOnNextSecond');
	let thirdEl = _getObj('#focusOnNextEnd');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (firstEl.isSameNode(document.activeElement)) {
				setTimeout(function() {
					if (secondEl.isSameNode(document.activeElement)) {
						setTimeout(function() {
							if (thirdEl.isSameNode(document.activeElement)) {
								setTimeout(function() {
									// Is it still on the last element when it gets to the end and not something else?
									if (thirdEl.isSameNode(document.activeElement)) {
										// That looked good.
										_addSuccessClass(testEl);
									} else {
										_fail(testEl, '#focusOnNextEnd is not in focus at the end');
									}
								}, 250);
							} else {
								_fail(testEl, '#focusOnNextEnd is not in focus at the end');
							}
						}, 250);
					} else {
						_fail(testEl, '#focusOnNextSecond has not moved into focus');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOnNextStart is not in focus after 4s and it should be.');
			}
		}, window.delayTimes.focusOnNext[0] + 100);
	} else {
		_fail(testEl, '#focusOnNextStart in focus at the start and it shouldn\'t be.');
	}
}
