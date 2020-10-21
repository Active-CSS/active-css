function checkCreateConditionalFail(o) {
	let testEl = _initTest('checkCreateConditional');
	if (!testEl) return;

	_fail(testEl, 'Test failed because it did not evaluate the conditional correctly.');
}

function checkCreateConditionalFinal(o) {
	let testEl = _initTest('checkCreateConditional');
	if (!testEl) return;

	_addSuccessClass(testEl);
}
