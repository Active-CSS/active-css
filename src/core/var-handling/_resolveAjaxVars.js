const _resolveAjaxVars = o => {
	if (typeof o.res === 'object') {
		let shadScope = ((o.shadowRef) ? o.shadowRef : 'main');
		if (shadScope == 'main') {
			_resolveAjaxVarsDecl(o.res, shadScope);
		} else {
			// There could be a potential clash in rendering vars if ajax is called before the shadow DOM is drawn. This gets around that.
			setTimeout(function() {
				_resolveAjaxVarsDecl(o.res, shadScope);
			}, 0);	// jshint ignore:line
		}
	}
};

const _resolveAjaxVarsDecl = (res, shadScope) => {
	// Loop the items in res and assign to variables.
	let v;
	for (v in res) {
		_set(scopedVars, shadScope + '.' + v, res[v]);
	}
};
