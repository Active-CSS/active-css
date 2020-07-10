const _ifVarTrue = (val, compRef) => {
	// This needs to cater for scoped variables and also window variables.
	if (val == 'true') {
		return true;
	} else if (val == 'false') {
		return false;
	}
	let scopedVar = ((compRef && privateScopes[compRef]) ? compRef : 'main') + '.' + val;
	let res = _get(scopedVars, scopedVar);
	if (typeof res === 'undefined') {
		// If the value wasn't a variable, check if it's a window variable. If not, then just set it to its original value.
		res = window[val];
	}
	return (!res) ? false : true;
};
