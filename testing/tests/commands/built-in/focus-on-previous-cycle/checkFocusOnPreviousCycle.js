/*
		<div class="focusOnPreviousCycleBlock">
		    <a id="focusOnPreviousCycleSecond" href="">Apples</a>
		    <a id="focusOnPreviousCycleStart" href="">Oranges</a>
		    <a href="">Pears</a>
		    <a href="">Bananas</a>
		    <a id="focusOnPreviousCycleEnd" href="">Grapes</a>
		</div>

    focus-on: #focusOnPreviousCycleStart after 7000ms;
	focus-on-previous: .focusOnPreviousCycleBlock a after 7250ms;
	focus-on-previous: .focusOnPreviousCycleBlock a after 7500ms;
	focus-on-previous: .focusOnPreviousCycleBlock a after 7750ms;

*/

function checkFocusOnPreviousCycle(o) {
	let testEl = _initTest('checkFocusOnPreviousCycle');
	if (!testEl) return;

	let firstEl = _getObj('#focusOnPreviousCycleStart');
	let secondEl = _getObj('#focusOnPreviousCycleSecond');
	let thirdEl = _getObj('#focusOnPreviousCycleEnd');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (firstEl.isSameNode(document.activeElement)) {
				setTimeout(function() {
					if (secondEl.isSameNode(document.activeElement)) {
						setTimeout(function() {
							if (thirdEl.isSameNode(document.activeElement)) {
								// That looked good.
								_addSuccessClass(testEl);
							} else {
								_fail(testEl, '#focusOnPreviousCycleEnd is not in focus at the end');
							}
						}, 250);
					} else {
						_fail(testEl, '#focusOnPreviousCycleSecond has not moved into focus');
					}
				}, 250);
			} else {
				_fail(testEl, '#focusOnPreviousCycleStart is not in focus after 4s and it should be.');
			}
		}, 7100);
	} else {
		_fail(testEl, '#focusOnPreviousCycleStart in focus at the start and it shouldn\'t be.');
	}
}
