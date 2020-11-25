function checkRenderBeforeEnd(o) {
	let checkRenderBeforeEndEl = _initTest('checkRenderBeforeEnd');
	if (!checkRenderBeforeEndEl) return;

	// Check basic render-before-end command results.
	let el = _getObj('#renderBeforeEndHTMLDiv');

	if (el.innerHTML !== 'Text will be inserted in relation to this element.<span id="checkRenderBeforeEndTestDiv">render-before-end</span>') {
		_fail(checkRenderBeforeEndEl, 'Render did not render correctly in the render-before-end command test area. #renderBeforeEndHTMLDiv.innerHTML:', el.innerHTML);
	}

	_addSuccessClass(checkRenderBeforeEndEl);
}
