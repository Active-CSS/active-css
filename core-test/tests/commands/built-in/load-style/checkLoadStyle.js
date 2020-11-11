function checkLoadStyleDocument(o) {
	let testEl = _initTest('checkLoadStyle');
	if (!testEl) return;

	// Test in the document scope.
	let el = _getObj('#checkLoadStyle div');
	let styles = window.getComputedStyle(el);	// Remember - el.style.color can only be used for inline styles.

	if (!el) {
		_fail(testEl, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(0, 0, 255)') {
		_fail(testEl, 'Color of test div has not been set to "rgb(0, 0, 255)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(testEl);
	}

}

function checkLoadStyleShadow(o) {
	let testEl = _initTest('checkLoadStyleShad');
	if (!testEl) return;

	// Second, test in the shadow scope.
	let testDiv = testEl.shadowRoot.querySelector('div');
	let styles = window.getComputedStyle(testDiv);	// Remember - el.style.color can only be used for inline styles.

	if (!testDiv) {
		_fail(testDiv, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(255, 0, 0)') {
		_fail(testDiv, 'Color of test div has not been set to "rgb(255, 0, 0)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(testEl);
	}

}

function checkLoadStyleShadow2(o) {
	let testEl = _initTest('checkLoadStyleShad2');
	if (!testEl) return;

	// Third, test the with the same stylesheet again in a second shadow scope.
	let testDiv = testEl.shadowRoot.querySelector('div');
	let styles = window.getComputedStyle(testDiv);	// Remember - el.style.color can only be used for inline styles.

	if (!testDiv) {
		_fail(testDiv, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(255, 0, 0)') {
		_fail(testDiv, 'Color of test div has not been set to "rgb(255, 0, 0)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(testEl);
	}

}
