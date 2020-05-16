_a.Var = o => {
	// Get the name of the variable.
	let varName = o.actVal.trim().split(' ')[0];
	// Get rid of the variable name from the actVal string before we scope it.
	let varDetails = o.actVal.replace(varName, '').trim();
	// Replace any reference to scoped variables with their prefixes.
	varDetails = _prefixScopedVars(varDetails, o.shadowRef);
	// Place the expression into the correct format for evaluating.
	varDetails = '{=' + varDetails + '=}';
	let scopedVar = ((o.shadowRef) ? o.shadowRef : 'main') + '.' + varName;
	let expr = _replaceJSExpression(varDetails, true);	// realVal=false, quoteIfString=false
	_set(scopedVars, scopedVar, expr);
};
