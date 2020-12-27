function checkCreateConditionalFail(o) {
	let checkCreateConditionalEl = _initTest('checkCreateConditional');
	if (!checkCreateConditionalEl) return;

	_fail(checkCreateConditionalEl, 'Test failed because it did not evaluate the conditional correctly.');
}

function checkCreateConditionalFinal(o) {
	let checkCreateConditionalEl = _initTest('checkCreateConditional');
	if (!checkCreateConditionalEl) return;

	_addSuccessClass(checkCreateConditionalEl);
}
