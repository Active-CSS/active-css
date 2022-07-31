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

	// New dollar-only variable type.
	// Don't touch non-curly dollar vars in quotes.
	str = str.replace(INQUOTES, function(_, innards) {
		return innards.replace(/\$/gm, '_ACSS_scoped_D');
	});
	str = str.replace(/(?:(^|[^\.\{]))(\$[\u00BF-\u1FFF\u2C00-\uD7FF\w]([\u00BF-\u1FFF\u2C00-\uD7FF\w]+)?)/gim, function(_, _start, wot) {
		let scoped = _getScopedVar(wot, varScope);
		let res;
		if (scoped.val !== undefined) {
			res = _start + scoped.fullName;
		} else {
			res = _start + wot;
		}
		return res;
	});
	str = str.replace(/_ACSS_scoped_D/gm, '$');

	// By this point the result is a string expression with correct references to variables.
	return str;
};
