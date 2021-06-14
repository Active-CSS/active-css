const _evalDetachedExpr = (str, varScope) => {
	// Evaluate as a detached expression - assuming there is no "o" object.
	let strObj = _handleVars([ 'rand', 'expr' ], { str, varScope });
	let valStr = _resolveVars(strObj.str, strObj.ref);
	valStr = _resolveInnerBracketVars(valStr, varScope);
	valStr = _prefixScopedVars(valStr, varScope);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedProxy." as a prefix where it is needed.
	let valToExpr = '{=' + valStr + '=}';

	// Evaluate the whole expression (right-hand side). This can be any JavaScript expression, so it needs to be evalled as an expression - don't change this behaviour.
	return _replaceJSExpression(valToExpr, true, false, varScope, -1);	// realVal=true, quoteIfString=false, varReplacementRef=-1
};
