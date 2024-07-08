const _resolveAjaxVars = o => {
	let typeORes = typeof o.res;
	let compScope = ((o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main');
	if (typeORes === 'object' && !o.preGet) {
		if (compScope == 'main') {
			_resolveAjaxVarsDecl(o, compScope);
		} else {
			// There could be a potential clash in rendering vars if ajax is called before a component is drawn. This gets around that.
			setTimeout(function() {
				_resolveAjaxVarsDecl(o, compScope);
				_ajaxCallbackDisplay(o);
			}, 0);	// jshint ignore:line
			return;
		}
	} else if (typeORes === 'string') {
		// Escape any embedded Active CSS or JavaScript so it doesn't get variable substitution run inside these.
		o.res = _escapeInline(o.res, 'script');
		o.res = _escapeInline(o.res, 'style type="text/acss"');
		if (o.acceptVars && !o.renderComp) {
			o.res = _resolveAcceptedVars(o.res, o, compScope);
		}
		_setHTMLVars(o);
	}
	_ajaxCallbackDisplay(o);
};

const _resolveAjaxVarsDecl = (o, compScope) => {
	// Loop the items in res and assign to variables.
	let v;
	_set(scopedProxy, compScope + '.$JSON', o.res);
	let substVars = (o.acceptVars && !o.renderComp);
	for (v in o.res) {
		// If vars allowed in JSON string values, substitute these in at this point.
		let adjustedVal = substVars ? _resolveAcceptedVars(o.res[v], o, compScope) : o.res[v];
		if (!v.startsWith('$')) v = '$' + v;
		_set(scopedProxy, compScope + '.' + v, adjustedVal);
	}
};


const _resolveAcceptedVars = (val, o, varScope) => {
	if (typeof val === 'string') {
		let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
			{
				str: val,
				func: o.func,
				o,
				obj: o.obj,
				secSelObj: o.secSelObj,
				varScope,
			}
		);
		strObj = _handleVars([ 'strings', 'html' ],
			{
				str: strObj.str,
				varScope,
			},
			strObj.ref
		);

		let res = _resolveVars(strObj.str, strObj.ref);
		res = res.replace(/\\{/gm, '{').replace(/\\}/gm, '}');

		// Return the new value.
		return res;
	}
};
