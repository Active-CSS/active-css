/*
		<div class="focusOnPreviousBlock">
		    <a id="focusOnPreviousEnd" href="">Apples</a>
		    <a id="focusOnPreviousSecond" href="">Oranges</a>
		    <a id="focusOnPreviousStart" href="">Pears</a>
		    <a href="">Bananas</a>
		    <a href="">Grapes</a>
		</div>

	focus-on: #focusOnPreviousStart after 5000ms;
	focus-on-previous: .focusOnPreviousBlock a after 5250ms;
	focus-on-previous: .focusOnPreviousBlock a after 5500ms;
	focus-on-previous: .focusOnPreviousBlock a after 5750ms;

*/

function checkFocusOnPrevious(o) {
	let testEl = _initTest('checkFocusOnPrevious');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousStart');
	let secondEl = _getObj('#focusOnPreviousSecond');
	let thirdEl = _getObj('#focusOnPreviousEnd');

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
										_fail(testEl, '#focusOnPreviousEnd is not in focus at the end');
									}
								}, 250);
							} else {
								_fail(testEl, '#focusOnPreviousEnd is not in focus at the end');
							}
						}, 250);
					} else {
						_fail(testEl, '#focusOnPreviousSecond has not moved into focus');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOnPreviousStart is not in focus after 4s and it should be.');
			}
		}, 5100);
	} else {
		_fail(testEl, '#focusOnPreviousStart in focus at the start and it shouldn\'t be.');
	}
}
