const _loopVarToNumber = (str, varScope) => {
	// This takes a string and either converts it straight to a number, or if it is a variable then it converts it to that value, which should be
	// a number. If it doesn't convert specifically to a number, the function returns false.
	str = str.trim();

	// See if it converts to number first, before checking if it is a variable.
	let newVal = _getNumber(str);
	if (newVal !== false) return newVal;	// If it's a number by this point, then no further checks are necessary and we return the number.

	// Handle as an expression, potentially containing scoped variables.
	let prepExpr = _prepareDetachedExpr(rightVar, varScope);
	let expr = _evalDetachedExpr(prepExpr, varScope);

	// Return the number or false if that value doesn't equate to a number.
	return _getNumber(expr);
};
