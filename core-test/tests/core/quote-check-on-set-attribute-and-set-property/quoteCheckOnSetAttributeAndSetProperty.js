function quoteCheckOnSetAttributeAndSetPropertyFinal(o, pars) {
	let quoteCheckOnSetAttributeAndSetPropertyEl = _initTest('quoteCheckOnSetAttributeAndSetProperty');
	if (!quoteCheckOnSetAttributeAndSetProperty) return;

	let el = _getObj('#quoteCheckOnSetAttributeAndSetPropertyTarget');
	if (!el) {
		_fail(quoteCheckOnSetAttributeAndSetPropertyEl, '#quoteCheckOnSetAttributeAndSetPropertyTarget is not present for attribute/property check.');
	}

	_shouldBe(quoteCheckOnSetAttributeAndSetPropertyEl, 'attribute', pars[0], 'was "Test Stuff".');
	_shouldBe(quoteCheckOnSetAttributeAndSetPropertyEl, 'property', pars[1], 'was "Test Stuff".');

	// The test will not pass if any of the above comparisons fail. The success flag added below will be ignored by the test system.
	_addSuccessClass(quoteCheckOnSetAttributeAndSetPropertyEl);
}
