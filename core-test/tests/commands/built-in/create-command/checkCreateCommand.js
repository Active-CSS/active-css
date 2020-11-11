function checkCreateCommand(o) {
	let testEl = _initTest('checkCreateCommand');
	if (!testEl) return;

	let el = _getObj('#checkCreateCommandDiv');
	if (!el) {
		_fail(testEl, '#checkCreateCommandDiv not present to run create-command test.');
	}

	if (el.style.backgroundColor != 'blue') {
		_fail(testEl, '#checkCreateCommandDiv does not have a blue background-color and it should.');
	}

	if (el.style.color != 'yellow') {
		_fail(testEl, '#checkCreateCommandDiv does not have yellow color and it should.');
	}

	if (el.style.height != '100px') {
		_fail(testEl, '#checkCreateCommandDiv does not have height of 100px and it should.');
	}

	_addSuccessClass(testEl);
}
