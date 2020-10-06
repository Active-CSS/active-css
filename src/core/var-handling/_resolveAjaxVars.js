const _resolveAjaxVars = o => {
	if (typeof o.res === 'object') {
		let compScope = ((o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main');
		if (compScope == 'main') {
			_resolveAjaxVarsDecl(o.res, compScope);
		} else {
			// There could be a potential clash in rendering vars if ajax is called before a shadow DOM is drawn. This gets around that.
			setTimeout(function() {
				_resolveAjaxVarsDecl(o.res, compScope);
				_ajaxCallbackDisplay(o);
			}, 0);	// jshint ignore:line
			return;
		}
	}
	_ajaxCallbackDisplay(o);
};

const _resolveAjaxVarsDecl = (res, compScope) => {
	// Loop the items in res and assign to variables.
	let v;
	for (v in res) {
		// Convert escaped new lines from json into real new lines because you can't pass new lines through json. I'm not saying anything.
		_set(scopedVars, compScope + '.' + v, res[v]);
	}
};
