_a.Var = o => {
	let locStorage, sessStorage;	//, newActVal = o.actVal.trim();

	let newActVal = _replaceAttrs(o.obj, o.actValSing, o.secSelObj, o, o.func, o.varScope).trim();

	if (newActVal.endsWith(' session-storage')) {
		sessStorage = true;
		newActVal = newActVal.substr(0, newActVal.length - 16);
	} else if (newActVal.endsWith(' local-storage')) {
		locStorage = true;
		newActVal = newActVal.substr(0, newActVal.length - 14);
	}

	// Get the name of the variable on the left.
	let arr = newActVal.trim()._ACSSSpaceQuoIn().split(' ');
	let varName = arr.shift()._ACSSSpaceQuoOut();

	// Get the expression on the right.
	let varDetails = arr.join(' ')._ACSSSpaceQuoOut();

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

	// Now check the varname before the "." or the "[" to see if it is the session or local storage reference arrays.
	let storeCheck = varName;
	let storeCheckDot = varName.indexOf('.');
	let storeCheckBrack = varName.indexOf('[');
	if (storeCheckDot !== -1) {
		storeCheck = varName.substr(0, storeCheckDot);
	} else if (storeCheckBrack !== -1) {
		storeCheck = varName.substr(0, storeCheckBrack);
	}

	// Add in correct scoped variable locations.
	if (sessStorage || sessionStoreVars[storeCheck] === true) {
		sessionStoreVars[storeCheck] = true;
		varName = 'scopedProxy.session.' + varName;
	} else if (locStorage || localStoreVars[storeCheck] === true) {
		localStoreVars[storeCheck] = true;
		varName = 'scopedProxy.local.' + varName;
	}

	varName = _resolveInnerBracketVars(varName, o.varScope);	// inner brackets are done in getScopedVar but it also needs to be done here before _prefixScopedVars.
	varName = _prefixScopedVars(varName, o.varScope, true);		// true = handle variables in quotes first.
	varName = _prefixScopedVars(varName, o.varScope);

	varDetails = _resolveInnerBracketVars(varDetails, o.varScope);
	varDetails = _prefixScopedVars(varDetails, o.varScope, true);		// true = handle variables in quotes first.
	varDetails = _prefixScopedVars(varDetails, o.varScope);

	// Set up left-hand variable for use in _set() later on.
	let scopedVar, isWindowVar = false;
	if (varName.startsWith('window.')) {
		// Leave it as it is - it's a variable in the window scope.
		isWindowVar = true;
		scopedVar = varName.substr(7);
	} else if (varName.startsWith('scopedProxy.')) {
		scopedVar = varName;
		scopedVar = scopedVar.replace('scopedProxy.', '');	// We don't want the first part of the left-hand variable to contain "scopedProxy." any more.
	} else {
		let scoped = _getScopedVar(varName, o.varScope);
		scopedVar = scoped.name;
	}

// this is going to get sorted out shortly. All var types need to be resolved at this point and not just HTML vars, to avoid double-evaluation.

	varDetails = _replaceHTMLVars(o, varDetails);

	// Place the expression into the correct format for evaluating. The expression must contain "scopedProxy." as a prefix where it is needed.
	varDetails = '{=' + varDetails + '=}';

// Scoping object value references to variables doesn't work yet, like { key: varThatNeedsScoping }



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
		_set(scopedProxy, scopedVar, expr);
		_allowResolve(scopedVar);
	}
};
