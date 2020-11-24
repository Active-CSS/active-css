function checkLoadStyleDocument(o) {
	let checkLoadStyleEl = _initTest('checkLoadStyle');
	if (!checkLoadStyleEl) return;

	// Test in the document scope.
	let el = _getObj('#checkLoadStyle div');
	let styles = window.getComputedStyle(el);	// Remember - el.style.color can only be used for inline styles.

	if (!el) {
		_fail(checkLoadStyleEl, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(0, 0, 255)') {
		_fail(checkLoadStyleEl, 'Color of test div has not been set to "rgb(0, 0, 255)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(checkLoadStyleEl);
	}

}

function checkLoadStyleShadow(o) {
	let checkLoadStyleShadEl = _initTest('checkLoadStyleShad');
	if (!checkLoadStyleShadEl) return;

	// Second, test in the shadow scope.
	let testDiv = checkLoadStyleShadEl.shadowRoot.querySelector('div');
	let styles = window.getComputedStyle(testDiv);	// Remember - el.style.color can only be used for inline styles.

	if (!testDiv) {
		_fail(testDiv, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(255, 0, 0)') {
		_fail(testDiv, 'Color of test div has not been set to "rgb(255, 0, 0)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(checkLoadStyleShadEl);
	}

}

function checkLoadStyleShadow2(o) {
	let checkLoadStyleShad2El = _initTest('checkLoadStyleShad2');
	if (!checkLoadStyleShad2El) return;

	// Third, test the with the same stylesheet again in a second shadow scope.
	let testDiv = checkLoadStyleShad2El.shadowRoot.querySelector('div');
	let styles = window.getComputedStyle(testDiv);	// Remember - el.style.color can only be used for inline styles.

	if (!testDiv) {
		_fail(testDiv, 'Test div not there to run test.');
	} else if (styles.color !== 'rgb(255, 0, 0)') {
		_fail(testDiv, 'Color of test div has not been set to "rgb(255, 0, 0)" from the load-style stylesheet. styles.color:', styles.color);
	} else {
		_addSuccessClass(checkLoadStyleShad2El);
	}

}
