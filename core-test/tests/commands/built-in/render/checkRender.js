function checkRender(o) {
	let checkRenderEl = _initTest('checkRender');
	if (!checkRenderEl) return;

	// Check basic render command results.
	let el = _getObj('#renderHTMLExample');
	if (el.innerHTML !== '<span id="checkRenderTestDiv"><strong>render</strong></span>') {
		_fail(checkRenderEl, 'Render did not render correctly in the render command test area. #renderHTMLExample.innerHTML:', el.innerHTML);
	}
}

function checkRenderEscaping(o) {
	let checkRenderEl = _initTest('checkRender');
	if (!checkRenderEl) return;

	// First check escape rendering.
	let pTag = _getObj('#renderEscapePTag');

	let checkText = 'Check for escaped variable: <script>createHavoc()</script> <script>doMoreHavoc()</script>. You should see the tag here in text form.';
	if (pTag.textContent !== checkText) {
		_fail(checkRenderEl, 'Render did not properly escape the script tag variables in the HTML content area. Should be: "' + checkText + '", but #renderEscapePTag.textContent:', pTag.textContent);
	}

	let attrA = pTag.getAttribute('data-hackA');
	let attrB = pTag.getAttribute('data-hackB');

	if (attrA !== '&lt;script&gt;createHavoc()&lt;/script&gt;') {
		_fail(checkRenderEl, 'Render did not properly escape the one-off variable in the test attribute. attrA:', attrA);
	}

	if (attrB !== '&lt;script&gt;doMoreHavoc()&lt;/script&gt;') {
		_fail(checkRenderEl, 'Render did not properly escape the reactive variable in the test attribute. attrB:', attrB);
	}

	// Test inserted attribute substitution inside a render.
	let attrHackTag = _getObj('#checkRenderAttrSubHack');

	if (attrHackTag.textContent !== '&lt;script&gt;createHavoc()&lt;/script&gt;') {
		_fail(checkRenderEl, 'Render did not properly escape the insert attribute variable into the test content area. #checkRenderAttrSubHack.textContent:', attrHackTag.textContent);
	}

	_addSuccessClass(checkRenderEl);
}
