/*
		<div id="clickOnLastDiv">
		    <a data-color="green" href="">Apples</a>
		    <a data-color="orange" href="">Oranges</a>
		    <a data-color="white" href="">Lychee</a>
		    <a data-color="yellow" href="">Bananas</a>
		    <a data-color="purple and green" href="">Grapes</a>
		</div>
		<p id="clickOnLastP"></p>
*/

function checkClickOnLast(o) {
	let testEl = _initTest('checkClickOnLast');
	if (!testEl) return;

	let el = _getObj('#clickOnLastP');

	if (el.innerHTML == '') {
		setTimeout(function() {
			// Now we want in focus.
			if (el.innerHTML == 'purple and green') {
				// That looked good.
				_addSuccessClass(testEl);
			} else {
				_fail(testEl, '#clickOnLastP does not contain the test "purple and green" and it should by now.');
			}
		}, window.delayTimes.clickOnLast[0] + 100);
	} else {
		_fail(testEl, '#clickOnLastP is not empty. It contains the text "' + el.innerHTML + '"');
	}
}
