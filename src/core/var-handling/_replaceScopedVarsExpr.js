const _replaceScopedVarsExpr = (str, varScope=null) => {
	// This function attempts to locate and replace any internal variables in a JavaScript expression or "run" function.
	if (str == 'true' || str == 'false' || str == 'null') return str;		// See isNaN MDN for interesting rules.

	let res, origWot, firstVar;
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FFa-z\$]([\u00BF-\u1FFF\u2C00-\uD7FF\w\.\:\'\"\[\]]+)?)\}/gim, function(_, wot) {
		if (wot.startsWith('$') || wot.indexOf('.$') !== -1) return '{' + wot + '}';
		origWot = wot;
		let scoped = _getScopedVar(wot, varScope);
		// Return the wot if it's a window variable.
		if (scoped.winVar === true) return '{' + wot + '}';
		res = scoped.val;
		if (res !== undefined) {
			// Variable definitely exists in some form.
			return res;
		} else {
			return '{' + origWot + '}';
		}
	});

	// By this point the result is a string or a reference to a variable.
	return str;
};
