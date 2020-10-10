/*
		<div id="clickOnNextDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a id="clickOnNextStart" data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnNextP"></p>
*/

function checkClickOnNext(o) {
	let testEl = _initTest('checkClickOnNext');
	if (!testEl) return;

	let firstEl = _getObj('#clickOnNextStart');
	let el = _getObj('#clickOnNextP');

	// We want not in focus at start.
	if (!firstEl.isSameNode(document.activeElement)) {
		setTimeout(function() {
			if (el.innerHTML == 'yellow') {
				setTimeout(function() {
					if (el.innerHTML == 'purple and green') {
						setTimeout(function() {
							if (el.innerHTML == 'purple and green') {
								// That looked good.
								_addSuccessClass(testEl);
							} else {
								_fail(testEl, '#clickOnNextP does not contain the test "purple and green".');
							}
						}, 250);
					} else {
						_fail(testEl, '#clickOnNextP does not contain the test "purple and green" and it should by now.');
					}
				}, 250);
			} else {
				_fail(testEl, '#clickOnNextP does not contain the test "yellow" and it should by now.');
			}
		}, window.delayTimes.clickOnNext[0] + 350); // can skip the first focus check as we're interested in click-on-next.
	} else {
		_fail(testEl, '#clickOnNextStart is in focus at the start and it shouldn\'t be.');
	}
}
