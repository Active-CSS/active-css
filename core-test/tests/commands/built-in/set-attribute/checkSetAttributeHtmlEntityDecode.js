function checkSetAttributeHtmlEntityDecode_1(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (!el) {
		_fail(checkSetAttributeHtmlEntityDecodeEl, '#setAttributeHtmlEntityDecodeDiv not present to perform set-attribute command.');
	}

	if (!el.hasAttribute('data-test')) {
		_fail(checkSetAttributeHtmlEntityDecodeEl, 'Failed to add the attribute "data-test" to #setAttributeHtmlEntityDecodeDiv. el:', el);
	} else {
		if (el.getAttribute('data-test') != '&lt;marquee&gt;Hi&lt;/marquee&gt;') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not equals "&lt;marquee&gt;Hi&lt;/marquee&gt;" from escaped string. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecode_2(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (el) {
		if (el.getAttribute('data-test') != '<marquee>Hi</marquee>') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not escape to "<marquee>Hi</marquee>" from escaped string. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecode_3(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (el) {
		if (el.getAttribute('data-test') != '&lt;marquee&gt;Hi&lt;/marquee&gt;') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not equals "&lt;marquee&gt;Hi&lt;/marquee&gt;" from escaped variable. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecode_4(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	let el = _getObj('#setAttributeHtmlEntityDecodeDiv');
	if (el) {
		if (el.getAttribute('data-test') != '<marquee>Hi</marquee>') {
			_fail(checkSetAttributeHtmlEntityDecodeEl, 'Added attribute "data-test" to #setAttributeHtmlEntityDecodeDiv but it did not escape to "<marquee>Hi</marquee>" from escaped variable. el.getAttribute(\'data-test\'):', el.getAttribute('data-test'));
		}
	}
}

function checkSetAttributeHtmlEntityDecodeFinal(o) {
	let checkSetAttributeHtmlEntityDecodeEl = _initTest('checkSetAttributeHtmlEntityDecode');
	if (!checkSetAttributeHtmlEntityDecodeEl) return;

	_addSuccessClass(checkSetAttributeHtmlEntityDecodeEl);
}

