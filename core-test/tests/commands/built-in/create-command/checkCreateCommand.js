function checkCreateCommand(o) {
	let checkCreateCommandEl = _initTest('checkCreateCommand');
	if (!checkCreateCommandEl) return;

	let el = _getObj('#checkCreateCommandDiv');
	if (!el) {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv not present to run create-command test.');
	}

	if (el.style.backgroundColor != 'blue') {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv does not have a blue background-color and it should.');
	}

	if (el.style.color != 'yellow') {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv does not have yellow color and it should.');
	}

	if (el.style.height != '100px') {
		_fail(checkCreateCommandEl, '#checkCreateCommandDiv does not have height of 100px and it should.');
	}

	_addSuccessClass(checkCreateCommandEl);
}
