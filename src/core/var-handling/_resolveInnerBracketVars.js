const _resolveInnerBracketVars = (str, scope) => {
	// Takes a scoped variable string and replaces the fully variables within brackets.
	// Used in the var command so it can work with _set in the correct scope.
	// Eg. str could complex like: gameState[scopedProxy.main.winner[scopedProxy.main.cheese[1]][0][0].desc]
	// This can either be from a left-hand assignment or a right-hand reference. We just want to translate the fully scoped variables into a result
	// for getting and setting purposes.
	let newStr = str;

	if (str.indexOf('[') !== -1) {
		newStr = str.replace(/\[([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\.]+)/g, function(_, innerVariable) {
			// Is this a scoped variable?
			if (DIGITREGEX.test(innerVariable) || _resolvable(innerVariable)) return '[' + innerVariable;	// Do not resolve variable or content found that has not already been defined.
			let res;
			let scoped = _getScopedVar(innerVariable, scope);
			// Leave this commented out for the moment - not convinced this is sorted out until tests have been written.
//			if (typeof scoped.val === 'string') {
//				// Return the value in quotes.
//				res = '"' + scoped.val + '"';
//			} else if (typeof scoped.val === 'number') {
//				// Return the value as it is.
//				res = scoped.val;
//			} else if (typeof scoped.val !== 'undefined') {
			if (typeof scoped.val !== 'undefined') {
				// Return the fully scoped name.
				res = scoped.fullName;
			} else {
				// Variable should be whatever was found as it isn't recognised as a variable.
				res = innerVariable;
			}

			return '[' + res;
		});
	}

	// Now evaluate the inner brackets so that we return a result for each inner variable. This is cleaner than leaving these to get evaluated as they are,
	// as they won't evaluate easily. Strange but true.

	// Grab all the innards of all the outer square brackets. This will give us enough to evaluate.
	// Use _replaceConditionalsExpr as a model to handle the balanced brackets. In theory it should be simpler than that function.
	// Then for each full match, evaluate and insert the result into newStr for returning.
	newStr = _resolveInnerBracketVarsDo(newStr);

	return newStr;
};
