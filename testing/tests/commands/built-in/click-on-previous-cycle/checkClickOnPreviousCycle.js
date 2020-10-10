/*
		<div id="clickOnPreviousCycleDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a id="clickOnPreviousCycleStart" data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnPreviousCycleP"></p>
*/

function checkClickOnPreviousCycle(o) {
	let testEl = _initTest('checkClickOnPreviousCycle');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnPreviousCycleStart');
	let el = _getObj('#clickOnPreviousCycleP');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (el.innerHTML == 'orange') {
				setTimeout(function() {
					if (el.innerHTML == 'green') {
						setTimeout(function() {
							if (el.innerHTML == 'purple and green') {
								// That looked good.
								_addSuccessClass(testEl);
							} else {
								_fail(testEl, '#clickOnPreviousCycleP does not contain the test "purple and green".');
							}
						}, 250);
					} else {
						_fail(testEl, '#clickOnPreviousCycleP does not contain the test "green" and it should by now.');
					}
				}, 250);
			} else {
				_fail(testEl, '#clickOnPreviousCycleP does not contain the test "orange" and it should by now.');
			}
		}, window.delayTimes.clickOnPreviousCycle[0] + 350); // can skip the first focus check as we're interested in click-on-next.
	} else {
		_fail(testEl, '#clickOnPreviousCycleStart is in focus at the start and it shouldn\'t be.');
	}
}
