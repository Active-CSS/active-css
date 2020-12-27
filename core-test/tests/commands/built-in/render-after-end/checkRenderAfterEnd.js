function checkRenderAfterEnd(o) {
	let checkRenderAfterEndEl = _initTest('checkRenderAfterEnd');
	if (!checkRenderAfterEndEl) return;

	// Check basic render-after-end command results.
	let el = _getObj('#renderAfterEndHTMLDiv').nextSibling;

	if (el.outerHTML !== '<span id="checkRenderAfterEndTestDiv">render-after-end</span>') {
		_fail(checkRenderAfterEndEl, 'Render did not render correctly in the render-after-end command test area. #renderAfterEndHTMLDiv.nextSibling.outerHTML:', el.outerHTML);
	}

	_addSuccessClass(checkRenderAfterEndEl);
}
