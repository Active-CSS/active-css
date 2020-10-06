function _addSuccessClass(objOrStr) {
	let el = (typeof objOrStr == 'object') ? objOrStr : _getObj(str);
	el.classList.add('success');
}

function _getObj(str, doc=document) {
	return (str == 'body') ? doc.body : doc.querySelector(str);
}

function _hasClassObj(obj, str) {
	return obj.classList.contains(str) || false;
}

// No js needed for this checkAddClass test.
function checkRemoveClass(o) {
	// Check that the element to remove the class from is definitely there.
	let el = _getObj('#checkRemoveClass');
	if (!el) {
		console.log('Unable to test checkRemoveClass as render isn\'t working.');
		return;
	}
	// Check if the class is no longer there.
	if (_hasClassObj(el, 'removeClassToRemove')) {
		return;
	}
	_addSuccessClass(el);
}
