const _prepareDetachedExpr = (str, varScope) => {
	// Evaluate as a detached expression - assuming there is no "o" object.
	let strObj = _handleVars([ 'rand', 'expr' ], { str, varScope });
	let valStr = _resolveVars(strObj.str, strObj.ref);
	valStr = _resolveInnerBracketVars(valStr, varScope);
	valStr = _prefixScopedVars(valStr, varScope);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedProxy." as a prefix where it is needed.
	return valStr;
};
