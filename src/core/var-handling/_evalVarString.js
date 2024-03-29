const _evalVarString = (str, o, noProxy=false) => {
	let varScope = o.varScope || 'main';
	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'strings', 'scoped', 'html' ],
		{
			str,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope
		}
	);

	let retStr = _resolveVars(strObj.str, strObj.ref);
	retStr = _resolveInnerBracketVars(retStr, varScope);
	retStr = _prefixScopedVars(retStr, varScope);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedProxy." as a prefix where it is needed, unless
	// noProxy is set to true, in which case it will send over the original value. That is used in console-log and func commands.
	if (noProxy) retStr = retStr.replace(/scopedProxy\./gm, 'scopedOrig.');
	retStr = '{=' + retStr + '=}';

	// Evaluate the whole expression (right-hand side). This can be any JavaScript expression, so it needs to be evalled as an expression - don't change this behaviour.
	// Allow the o object to get evaluated in the expression if references are there.
	return _replaceJSExpression(retStr, true, false, varScope, -1, o, true);	// realVal=true, quoteIfString=false, varReplacementRef=-1

};