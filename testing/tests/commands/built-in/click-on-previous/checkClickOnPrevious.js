/*
		<div id="clickOnPreviousDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a id="clickOnPreviousStart" data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnPreviousP"></p>
*/

function checkClickOnPrevious(o) {
	let testEl = _initTest('checkClickOnPrevious');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnPreviousStart');
	let el = _getObj('#clickOnPreviousP');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (el.innerHTML == 'orange') {
				setTimeout(function() {
					if (el.innerHTML == 'green') {
						setTimeout(function() {
							if (el.innerHTML == 'green') {
								// That looked good.
								_addSuccessClass(testEl);
							} else {
								_fail(testEl, '#clickOnPreviousP does not contain the test "green".');
							}
						}, 250);
					} else {
						_fail(testEl, '#clickOnPreviousP does not contain the test "green" and it should by now.');
					}
				}, 250);
			} else {
				_fail(testEl, '#clickOnPreviousP does not contain the test "orange" and it should by now.');
			}
		}, window.delayTimes.clickOnPrevious[0] + 350); // can skip the first focus check as we're interested in click-on-next.
	} else {
		_fail(testEl, '#clickOnPreviousStart is in focus at the start and it shouldn\'t be.');
	}
}
