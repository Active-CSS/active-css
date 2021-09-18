// Works with the _resolveInheritance function to establish the correct scope of a variable.
// This is a recursive function. It is run by calling _resolveInheritance with the variable to resolve. The result is a object with name/val properties.
const _resolveInheritanceBubble = (scope, varName) => {

	// Is this a "strictlyPrivateVars" or "private" (deprecated) scope? If so, we go no higher also.
	// Get component details by scope. We need to check if this a strictlyPrivateVars component or in the main document scope.
	let hostObj = strictPrivVarScopes[scope];
	if (hostObj === undefined || hostObj) {
		// We don't go any higher. And we know the value is undefined already so we return false.
		return false;
	}

	// If it isn't strictlyPrivateVars we go to the parent scope and see if it is there.
	// Get parent component details by scope.
	let parentCompDetails = compParents[scope];
	let parentScope = (parentCompDetails && parentCompDetails.varScope) ? parentCompDetails.varScope : 'main';

	// If there, return it immediately.
	let val = _get(scopedProxy.__getTarget, parentScope + '.' + varName);

	if (val !== undefined) return { name: parentScope + '.' + varName, val };

	// Call this function again with the parent scope until we get false or a name/value object.
	let actualScopeObj = _resolveInheritanceBubble(parentScope, varName);
	if (actualScopeObj) {
		return actualScopeObj;
	}

	return false;
};
