const _replaceScopedVarsExpr = (str, varScope=null) => {
	// This function attempts to locate and replace any internal variables in a JavaScript expression or "run" function.
	if (str == 'true' || str == 'false' || str == 'null') return str;		// See isNaN MDN for interesting rules.

	let res, origWot, firstVar;
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FFa-z\$][\u00BF-\u1FFF\u2C00-\uD7FF\w_\.\:\'\"\[\]]+)\}/gim, function(_, wot) {
		if ([ '$HTML', '$HTML_ESCAPED', '$STRING', '$RAND' ].includes(wot)) return wot;
		origWot = wot;
		// Don't convert to dot format as JavaScript barfs on dot notation in evaluation.
		// Evaluate the JavaScript expression.
		if (wot.indexOf('.') !== -1) {
			// This is already scoped in some fashion. If it already has window or scopedVars as the first prefix we can skip it.
			// This is separated from the main regex as we will be adding further scoping options later on, and so it will easier to keep this separate.
			firstVar = wot.split('.')[0];
			// Return the wot if it prefixed with window. It is unlikely someone unfamiliar with the core will use "scopedVars", but do a handling for that anyway.
			if (firstVar == 'window') return '{' + wot + '}';
			if (firstVar.startsWith('scopedVars')) {
				wot = wot.replace('scopedVars.', '');
			}
		}
		// Prefix with sub-scope (main or _varScope).
		wot = (varScope && privVarScopes[varScope]) ? varScope + '.' + wot : 'main.' + wot;
		wot = _resolveInnerBracketVars(wot);
		let scopedVarObj = _resolveInheritance(wot);
		res = scopedVarObj.val;
		if (typeof res !== 'undefined') {
			// Variable definitely exists in some form.
			return res;
		} else {
			return '{' + origWot + '}';
		}
	});

	// By this point the result is a string or a reference to a variable.
	return str;
};
