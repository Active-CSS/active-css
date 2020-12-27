function checkRenderReplace(o) {
	let checkRenderReplaceEl = _initTest('checkRenderReplace');
	if (!checkRenderReplaceEl) return;

	// Check basic render-replace command results.
	let el = _getObj('#renderReplaceOuterDiv');

	if (el.innerHTML !== '<div id=\"checkRenderReplaceTestDiv\">render-replace</div>') {
		_fail(checkRenderReplaceEl, 'Render did not render correctly in the render-replace command test area. #renderReplaceOuterDiv.innerHTML:', el.innerHTML);
	}

	_addSuccessClass(checkRenderReplaceEl);
}
