// Note: If this test is inexplicably failing, it could be something else like timings on delayed tests happening elsewhere, such as the test for load-config.

function checkIframeGetInnerHTML() {
    let frameObj = _getObj('#checkIframeIframe');
    let content = frameObj.contentWindow.document.body.innerHTML;
    return content;
}

function checkIframeReloadA(o) {
	let checkIframeReloadEl = _initTest('checkIframeReload');
	if (!checkIframeReloadEl) return;

	if (checkIframeGetInnerHTML() !== '<p>iframe test</p>') {
		_fail(checkIframeReloadEl, 'Iframe body does not contain "<p>iframe test</p>" prior to test.');
	}
}

function checkIframeReloadB(o) {
	let checkIframeReloadEl = _initTest('checkIframeReload');
	if (!checkIframeReloadEl) return;

	if (checkIframeGetInnerHTML() !== '<p>some new text</p>') {
		_fail(checkIframeReloadEl, 'Iframe body does not contain "<p>some new text</p>" after change.');
	}
}

function checkIframeReloadFinal(o) {
	let checkIframeReloadEl = _initTest('checkIframeReload');
	if (!checkIframeReloadEl) return;

	if (checkIframeGetInnerHTML() !== '<p>iframe test</p>') {
		_fail(checkIframeReloadEl, 'Iframe body does not contain "<p>iframe test</p>" after reload.');
	}

	_addSuccessClass(checkIframeReloadEl);
}
