const _resolveAjaxVars = o => {
	if (typeof o.res === 'object') {
		// Loop the items in o.res and assign to variables.
		let v;
		let shadScope = ((o.shadowRef) ? o.shadowRef : 'main');
		for (v in o.res) {
			if (typeof scopedVars[shadScope] === 'undefined') {
				scopedVars[shadScope] = {};	// This is definitely needed, otherwise it will only trigger the scope if the scope is undefined.
			}
			_set(scopedVars, shadScope + '.' + v, o.res[v]);
		}
	}
};
