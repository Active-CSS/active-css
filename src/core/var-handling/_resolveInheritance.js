// Takes a scoped variable reference and returns the true scope.
const _resolveInheritance = scopedVar => {
	// Rules:
	// Variable in will already have a base scope (ie. "main.", "_1.").
	// Variable in will never start with "scopedProxy." or "window.".
	// Variable in may look like this: "main.varname" but may actually be a session or local variable.
	// If it exists in this scope it returns the original scope.
	// If it doesn't exist in this scope it will bubble up the component variables scopes until it reaches the document scope or a strictlyPrivateVars scope.
	// As soon as it finds somewhere the variable exists, it returns the variable reference in that scope.
	// If it doesn't find the variable there, it returns the original scope.

	// Check if this is a session or local variable first.
	let dotPos = scopedVar.indexOf('.');
	if (dotPos !== -1) {
		let lesserScopedVar = scopedVar.substr(dotPos + 1);
		let baseVar = _getBaseVar(lesserScopedVar);
		if (localStoreVars[baseVar] === true) {
			let realScopedVar = 'local.' + lesserScopedVar;
			return { name: realScopedVar, val: _get(scopedProxy.__getTarget, realScopedVar) };
		} else if (sessionStoreVars[baseVar] === true) {
			let realScopedVar = 'session.' + lesserScopedVar;
			return { name: realScopedVar, val: _get(scopedProxy.__getTarget, realScopedVar) };
		}
	}

	// We should be left with page scoped variables.

	// Is this already in the current scope? If so, we don't go any higher - return the original scope reference.
	let val = _get(scopedProxy.__getTarget, scopedVar);
	let origValObj = { 'name': scopedVar, 'val': val };
	if (val !== undefined) return origValObj;

	// Get the current scope so it is a separate item when bubbling up components.
	let i = scopedVar.indexOf('.');
	let currScope = scopedVar.substr(0, i);
	let varName = scopedVar.substr(i + 1);

	// It isn't in the current scope, or this isn't the document scope, so find out if this exists as an inherited variable.
	let actualScopeObj = _resolveInheritanceBubble(currScope, varName);

	// If there is no inherited variable then we assume this is a new variable appearing in the scope the variable is used in,
	// so return the original scope reference. "actualScopeObj" will be false if the variable is not inherited.
	if (!actualScopeObj) return origValObj;

	// This variable is inherited from a higher scope, return the higher scope reference.
	return actualScopeObj;
};
