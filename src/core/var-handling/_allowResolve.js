/* Takes the base name of a fully scoped variable and sets it as allowable to be resolved for evaluating the inner brackets of variables. */
const _allowResolve = fullVar => {
	if (fullVar.startsWith('window.')) return;	// Don't bother remembering window variables, they will always be resolved.
	// Any scopedProxy reference has been stripped off, so remove the base scope (main., _1., session., etc.) and store the base variable name before any dot or bracket.
	let scopedVar = fullVar.substr(fullVar.indexOf('.') + 1);
	let baseVar = _getBaseVar(scopedVar);
	// Add the resolvable variable to the list if it isn't there already.
	if (resolvableVars.indexOf(baseVar) === -1) resolvableVars[baseVar] = true;
};
