_c.IfVarTrue = o => {
	// This needs to cater for scoped variables and also window variables.
	if (o.actVal == 'true') {
		return true;
	} else if (o.actVal == 'false') {
		return false;
	}
	let scopedVar = ((o.shadowRef) ? o.shadowRef : 'main') + '.' + o.actVal;
	let res = _get(scopedVars, scopedVar);
	if (typeof res === 'undefined') {
		res = window[o.actVal];
	}
	return (!res) ? false : res;
};
