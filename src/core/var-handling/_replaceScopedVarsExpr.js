const _replaceScopedVarsExpr = (str, obj=null, func='', o=null, walker=false, shadHost=null, shadRef=null) => {
	// This function attempts to locate and replace any internal variables in a JavaScript expression or "run" function.
	let res, origWot, firstVar;
	str = str.replace(/([\u00BF-\u1FFF\u2C00-\uD7FFa-z][\u00BF-\u1FFF\u2C00-\uD7FF\w_\.\:\[\]]+)(?!\u00BF-\u1FFF\u2C00-\uD7FF\w)/gim, function(_, wot) {
		origWot = wot;
		// Don't convert to dot format as JavaScript barfs on dot notation in evaluation.
		// Evaluate the JavaScript expression.
		if (wot.indexOf('.') !== -1) {
			// This is already scoped in some fashion. If it already has window or scopedVars as the first prefix we can skip it.
			// This is separated from the main regex as we will be adding further scoping options later on, and so it will easier to keep this separate.
			firstVar = wot.split('.')[0];
			// Return the wot if it prefixed with window. It is unlikely someone unfamiliar with the core will use "scopedVars", but do a handling for that anyway.
			if (firstVar == 'window') return wot;
			if (firstVar == 'scopedVars') {
				wot = wot.replace(/^scopedVars\./, '');
			}
		}
		// Prefix with sub-scope (main or _ShadowRef).
		wot = (shadRef) ? shadRef + '.' + wot : 'main.' + wot;
		res = _get(scopedVars, wot);
		if (res) {
			// Variable exists.
			return 'scopedVars.' + wot;
		} else {
			return origWot;
		}
	});
	return str;
};
