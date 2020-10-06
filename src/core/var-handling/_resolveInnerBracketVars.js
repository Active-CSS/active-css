const _resolveInnerBracketVars = str => {
	// Takes a scoped variable string and replaces the variables within brackets into true values.
	// Used in the var command so it can work with _set in the correct scope.
	if (str.indexOf('[') !== -1) {
		str = str.replace(/\[([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.]+)\]/gm, function(_, innerVariable) {
			// Is this a scoped variable?
			let res;
			if (innerVariable.substr(0, 11) == 'scopedVars.') {
				// Yes. Remove the scoped prefix.
				innerVariable = innerVariable.substr(11);
				// Get the variable value - should always be a string or a number.
				res = _get(scopedVars, innerVariable);
			} else if (innerVariable.substr(0, 7) == 'window.') {
				// Remove the window prefix.
				innerVariable = innerVariable.substr(7);
				// Get the variable value - should always be a string or a number.
				res = _get(window, innerVariable);
			} else {
				// Variable should be whatever was found.
				res = innerVariable;
			}
			return '[' + res + ']';
		});
	}
	return str;
};
