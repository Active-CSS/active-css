const _resolveInnerBracketVars = (str, scope) => {
	// Takes a scoped variable string and replaces the fully variables within brackets.
	// Used in the var command so it can work with _set in the correct scope.
	// Eg. str could complex like: gameState[scopedProxy.main.winner[scopedProxy.main.cheese[1]][0][0].desc]
	// This can either be from a left-hand assignment or a right-hand reference. We just want to translate the fully scoped variables into a result
	// for getting and setting purposes.
	let newStr = str;

	if (str.indexOf('[') !== -1) {
		newStr = str.replace(/\[([\$\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.]+)/g, function(_, innerVariable) {
			// Is this a scoped variable?
			if (DIGITREGEX.test(innerVariable) || _resolvable(innerVariable)) {
				return '[' + innerVariable;	// Do not resolve variable or content found that has not already been defined.
			}
			let res;
			let scoped = _getScopedVar(innerVariable, scope);
			if (scoped.val !== undefined) {
				// Return the fully scoped name.
				res = scoped.fullName;
			} else {
				// Variable should be whatever was found as it isn't recognised as a variable.
				res = innerVariable;
			}

			return '[' + res;
		});
	}

	// Now evaluate the inner brackets so that we return a result for each inner variable.
	newStr = _resolveInnerBracketVarsDo(newStr);

	return newStr;
};
