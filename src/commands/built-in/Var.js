_a.Var = o => {
	let locStorage, sessStorage, newActVal = o.actValSing, isArrayPush;

	if (newActVal.endsWith(' session-storage')) {
		sessStorage = true;
		newActVal = newActVal.substr(0, newActVal.length - 16);
	} else if (newActVal.endsWith(' local-storage')) {
		locStorage = true;
		newActVal = newActVal.substr(0, newActVal.length - 14);
	}

	// Get the name of the variable on the left.
	let arr = newActVal._ACSSSpaceQuoIn().split(' ');
	let varName = arr.shift()._ACSSSpaceQuoOut();

	if (varName.endsWith('[]')) {
		isArrayPush = true;
		varName = varName.slice(0, -2);
	}

	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'strings' ],
		{
			str: varName,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: o.varScope
		}
	);
	varName = _resolveVars(strObj.str, strObj.ref);

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

	let expr = _evalVarString(varDetails, o);

	// Escape result for curlies to stop possible re-evaluation on re-assignment.
	if (typeof expr === 'string') {
		expr = _escNoVars(expr);
	}

	if (isArrayPush) {
		// scopedProxy will not trigger an update if run from a dynamic function using .push, so we need to do a _set.
		let scoped = _getScopedVar(varName, o.varScope);
		if (!_isArray(scoped.val)) {
			_err('Cannot push value to ' + varName + ' as it is not an array. typeof ' + varName + ' = "' + typeof scoped.val + '"', o);
		} else {
			let newLength = scoped.val.length;
			_set(scopedProxy, scoped.name + '[' + newLength + ']', expr);
		}
		return;
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
	varName = _prefixScopedVars(varName, o.varScope);

	// Set up left-hand variable for use in _set() later on.
	let scopedVar, isWindowVar = false;
	if (varName.toLowerCase().startsWith('window.')) {
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

	// Set the variable in the correct scope.
	if (isWindowVar) {
		// Window scope.
//		console.log('_a.Var, set in window scope ' + scopedVar + ' = ', expr, 'o:', o);		// handy - don't remove
		_set(window, scopedVar, expr);
	} else {
		// Active CSS component/document scopes.
//		console.log('_a.Var, set ' + scopedVar + ' = ', expr, 'o:', o);		// handy - don't remove
		_set(scopedProxy, scopedVar, expr);
		_allowResolve(scopedVar);
	}
};
