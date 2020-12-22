// Takes a scoped variable reference and returns the true scope.
const _resolveInheritance = scopedVar => {
	// Rules:
	// If it exists in this scope it returns the original scope.
	// If it doesn't exist in this scope it will bubble up the component variables scopes until it reaches the document scope or a strictlyPrivateVars scope.
	// As soon as it finds somewhere the variable exists, it returns the variable reference in that scope.
	// If it doesn't find the variable there, it returns the original scope.

	// Is this already in the "main", or do we already have a value in the current scope? If so, we don't go any higher - return the original scope reference.

	scopedVar = scopedVar.replace(/\[[\'\"]?/g, '.').replace(/[\'\"]?\]/g, '');
	let val = _get(scopedVars, scopedVar);
	let origValObj = { 'name': scopedVar, 'val': val };
	if (scopedVar.startsWith('main.') || typeof val !== 'undefined' || scopedVar.startsWith('window.')) {
		return origValObj;
	}

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
