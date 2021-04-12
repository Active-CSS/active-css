function checkIfVarEmptyArrayFail(o) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	_fail(checkIfVarEl, 'if-var failed with the checking of an empty array');
}

function checkIfVarNotPopulatedArrayFail(o) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	_fail(checkIfVarEl, 'not-if-var failed with the checking of a non-populated array');
}

function checkIfVarArrayEqualsFail(o) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	_fail(checkIfVarEl, 'not-if-var failed with the equals checking of array');
}

function checkIfVarFinal(o, pars) {
	let checkIfVarEl = _initTest('checkIfVar');
	if (!checkIfVarEl) return;

	if (pars[0] == 3) {
		// Finish up. If it's failed by this point it will error.
		_addSuccessClass(checkIfVarEl);
	}
}
