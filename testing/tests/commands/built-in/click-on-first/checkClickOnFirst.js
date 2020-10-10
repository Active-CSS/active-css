/*
		<div class="clickOnFirstDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnFirstP"></p>
*/

function checkClickOnFirst(o) {
	let testEl = _initTest('checkClickOnFirst');
	if (!testEl) return;

	let el = _getObj('#clickOnFirstP');

	if (el.innerHTML == '') {
		setTimeout(function() {
			// Now we want in focus.
			if (el.innerHTML == 'green') {
				// That looked good.
				_addSuccessClass(testEl);
			} else {
				_fail(testEl, '#clickOnFirstP does not contain the test "green" and it should by now.');
			}
		}, window.delayTimes.clickOnFirst[0] + 100);
	} else {
		_fail(testEl, '#clickOnFirstP is not empty. It contains the text "' + el.innerHTML + '"');
	}
}
