function checkIframeGetInnerHTML() {
    let frameObj = _getObj('#checkIframeIframe');
    let content = frameObj.contentWindow.document.body.innerHTML;
    return content;
}

function checkIframeReloadA(o) {
	if (checkIframeGetInnerHTML() !== '<p>iframe test</p>') {
		_fail(testEl, 'Iframe body does not contain "<p>iframe test</p>" prior to test.');
	}
}

function checkIframeReloadB(o) {
	if (checkIframeGetInnerHTML() !== '<p>some new text</p>') {
		_fail(testEl, 'Iframe body does not contain "<p>some new text</p>" after change.');
	}
}

function checkIframeReloadFinal(o) {
	let testEl = _initTest('checkIframeReload');
	if (!testEl) return;

	if (checkIframeGetInnerHTML() !== '<p>iframe test</p>') {
		_fail(testEl, 'Iframe body does not contain "<p>iframe test</p>" after reload.');
	}

	_addSuccessClass(testEl);
}
