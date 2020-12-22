_a.Var = o => {
	// Get the name of the variable on the left.
	let arr = o.actVal.trim().split(' ');
	let varName = arr.shift();

	// Get the expression on the right.
	let varDetails = arr.join(' ');

	if (!varDetails) {
		// A right-hand expression is needed, unless it a ++ or a -- operator is being used.
		if (varName.endsWith('++')) {
			varName = varName.slice(0, -2);
			varDetails = '{' + varName + '}+1';
		} else if (varName.endsWith('--')) {
			varName = varName.slice(0, -2);
			varDetails = '{' + varName + '}-1';
		} else {
			// Assign to null if no assignment.
			varDetails = 'null';
		}
	}

	// Add in correct scoped variable locations.
	varName = _prefixScopedVars(varName, o.varScope, 'varname');
	varDetails = _prefixScopedVars(varDetails, o.varScope);

	// Set up left-hand variable for use in _set() later on.
	let scopedVar, isWindowVar = false;
	if (varName.startsWith('window.')) {
		// Leave it as it is - it's a variable in the window scope.
		isWindowVar = true;
		scopedVar = varName;
		scopedVar = _resolveInnerBracketVars(scopedVar);
	} else if (varName.startsWith('scopedVars.')) {
		scopedVar = varName;
	} else {
		scopedVar = varName;
		let prefix = (o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main';
		scopedVar = scopedVar.replace('scopedVars.' + prefix + '.', '');	// We don't want the first part of the left-hand variable to contain "scopedVars.".
		scopedVar = prefix + '.' + scopedVar;
		scopedVar = _resolveInnerBracketVars(scopedVar);
		// Sort out if the left-hand var is an inherited variable or not.
		let scopedVarObj = _resolveInheritance(scopedVar);
		scopedVar = scopedVarObj.name;
		// Note: That may look weird, but it needs to do the above in order to correctly handle initially undefined variables that will not get the prefix from
		// _prefixScopedVars() the first time the var command is run, because the left-hand variable is undefined.
		// Only a defined variable gets the scoped prefix when _prefixScopedVars() is run on it.
		// So we have to do the above to ensure the prefix is there the first time the var is declared.
	}
	scopedVar = scopedVar.replace('scopedVars.', '');	// We don't want the first part of the left-hand variable to contain "scopedVars.".

	// Resolve inner bracket variables (only) with their true values on the left-hand of the equation now that they are scoped.
	varDetails = _replaceHTMLVars(o, varDetails);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedVars." as a prefix where it is needed.
	varDetails = '{=' + varDetails + '=}';

	// Evaluate the whole expression (right-hand side). This can be any JavaScript expression, so it needs to be evalled as an expression - don't change this behaviour.
	let expr = _replaceJSExpression(varDetails, true, null, o.varScope);	// realVal=false, quoteIfString=false

	// Set the variable in the correct scope.
	if (isWindowVar) {
		// Window scope.
//		console.log('_a.Var, set in window scope ' + scopedVar + ' = ', expr);		// handy - don't remove
		_set(window, scopedVar, expr);
	} else {
		// Active CSS component/document scopes.
//		console.log('_a.Var, set ' + scopedVar + ' = ', expr);		// handy - don't remove
		_set(scopedVars, scopedVar, expr);
	}
};
