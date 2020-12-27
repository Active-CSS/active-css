const _resolveAjaxVars = o => {
	let typeORes = typeof o.res;
	let compScope = ((o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main');
	if (typeORes === 'object' && !o.preGet) {
		if (compScope == 'main') {
			_resolveAjaxVarsDecl(o.res, compScope);
		} else {
			// There could be a potential clash in rendering vars if ajax is called before a component is drawn. This gets around that.
			setTimeout(function() {
				_resolveAjaxVarsDecl(o.res, compScope);
				_ajaxCallbackDisplay(o);
			}, 0);	// jshint ignore:line
			return;
		}
	} else if (typeORes === 'string') {
		// Escape any inline Active CSS or JavaScript so it doesn't get variable substitution run inside these.
		o.res = _escapeInline(o.res, 'script');
		o.res = _escapeInline(o.res, 'style type="text/acss"');
		_setHTMLVars(o);
	}
	_ajaxCallbackDisplay(o);
};

const _resolveAjaxVarsDecl = (res, compScope) => {
	// Loop the items in res and assign to variables.
	let v;
	for (v in res) {
		_set(scopedVars, compScope + '.' + v, res[v]);
	}
};
