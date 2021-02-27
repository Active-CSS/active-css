const _resolveInnerBracketVars = (str, scope) => {
	// Takes a scoped variable string and replaces the variables within brackets.
	// Used in the var command so it can work with _set in the correct scope.
	let newStr = str;

	if (str.indexOf('[') !== -1) {
		newStr = str.replace(/\[([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.]+)\]/g, function(_, innerVariable) {
			// Is this a scoped variable?
			if (_resolvable(innerVariable)) return '[' + innerVariable + ']';	// Do not resolve variable or content found that has not already been defined.
			let res;
			let scoped = _getScopedVar(innerVariable, scope);
			if (typeof scoped.val === 'string') {
				// Return the value in quotes.
				res = '"' + scoped.val + '"';
			} else if (typeof scoped.val === 'number') {
				// Return the value as it is.
				res = scoped.val;
			} else if (typeof scoped.val !== 'undefined') {
				// Return the fully scoped name.
				res = scoped.fullName;
			} else {
				// Variable should be whatever was found as it isn't recognised as a variable.
				res = innerVariable;
			}

			return '[' + res + ']';
		});
	}

	return newStr;
};
