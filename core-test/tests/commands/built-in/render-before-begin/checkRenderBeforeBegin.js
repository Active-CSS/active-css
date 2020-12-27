function checkRenderBeforeBegin(o) {
	let checkRenderBeforeBeginEl = _initTest('checkRenderBeforeBegin');
	if (!checkRenderBeforeBeginEl) return;

	// Check basic render-before-begin command results.
	let el = _getObj('#renderBeforeBeginHTMLDiv').previousSibling;

	if (el.outerHTML !== '<span id="checkRenderBeforeBeginTestDiv">render-before-begin</span>') {
		_fail(checkRenderBeforeBeginEl, 'Render did not render correctly in the render-before-begin command test area. #renderBeforeBeginHTMLDiv.previousSibling.outerHTML:', el.outerHTML);
	}

	_addSuccessClass(checkRenderBeforeBeginEl);
}
