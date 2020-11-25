function checkRenderAfterBegin(o) {
	let checkRenderAfterBeginEl = _initTest('checkRenderAfterBegin');
	if (!checkRenderAfterBeginEl) return;

	// Check basic render-after-begin command results.
	let el = _getObj('#renderAfterBeginHTMLDiv');

	if (el.innerHTML !== '<span id="checkRenderAfterBeginTestDiv">render-after-begin</span>Text will be inserted in relation to this element.') {
		_fail(checkRenderAfterBeginEl, 'Render did not render correctly in the render-after-begin command test area. #renderAfterBeginHTMLDiv.innerHTML:', el.innerHTML);
	}

	_addSuccessClass(checkRenderAfterBeginEl);
}
