const _evalDetachedExpr = (valToExpr, varScope) => {
	// Evaluate the whole expression (right-hand side). This can be any JavaScript expression, so it needs to be evalled as an expression - don't change this behaviour.
	const expr = '{=' + valToExpr + '=}';
	return _replaceJSExpression(expr, true, false, varScope, -1);	// realVal=true, quoteIfString=false, varReplacementRef=-1
};
