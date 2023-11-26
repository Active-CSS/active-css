/* Needs rewriting for @component syntax.
function checkCreateElement(o, pars) {
	let checkCreateElementEl = _initTest('checkCreateElement');
	if (!checkCreateElementEl) return;

	let el = _getObj('#checkCreateElementDiv');
	if (!el) {
		_fail(checkCreateElementEl, '#checkCreateElementDiv not there to perform test.');
	}

	if (el.innerHTML != 'test1 test2 stringtest') {
		_fail(checkCreateElementEl, 'Reactive attributes did not get rendered correctly in custom element. el.innerHTML:', el.innerHTML);
	}

	if (typeof pars[0] === 'undefined' || pars[0] !== true) {
		_fail(checkCreateElementEl, 'Connected callback did not invoke. pars[0]:', pars[0]);
	}

	if (typeof pars[1] === 'undefined' || pars[1] !== true) {
		_fail(checkCreateElementEl, 'Disconnected callback did not invoke. pars[1]:', pars[1], ', wrapper:', _getObj('#createElementTagsWrapper'));
	}

	if (typeof pars[2] === 'undefined' || pars[2] !== true) {
		_fail(checkCreateElementEl, 'Attribute change callback did not invoke. pars[2]:', pars[2], ', wrapper:', _getObj('#createElementAttrChange'));
	}

	let el2 = _getObj('#createElementAttrChange');
	if (!el2) {
		_fail(checkCreateElementEl, '#createElementAttrChange not there to perform attribute test.');
	} else {
		if (el2.getAttribute('cetaga') != 'cheesey wotsits') {
			_fail(checkCreateElementEl, '#createElementAttrChange does not contain the string "cheesey wotsits" at the end of the test.');
		}
	}

	_addSuccessClass(checkCreateElementEl);
}
*/