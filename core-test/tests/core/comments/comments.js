function comments(o) {
	let commentsEl = _initTest('comments');
	if (!commentsEl) return;

	let divEl = _getObj('#commentsDiv');
	if (!divEl) {
		_fail(commentsEl, 'Comment component test element #commentsDiv not found.');
	}
	if (divEl.innerHTML != '/* comment */') {
		_fail(commentsEl, 'Escaped comment did not render in the test div, should be /* comment */, but was:', divEl.innerHTML);
	}

	_addSuccessClass(commentsEl);
}
