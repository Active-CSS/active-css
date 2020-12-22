const _replaceStringVars = (o, str, varScope) => {
	// This function should only deal once with {$STRING}, and once with HTML variables. Gets called for different reasons, hence it's purpose is double-up here.
	// This is the function that translates HTML variables for an output string.
	let res = '';
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\[\]\.\$]+)\}/gi, function(_, innards) {
		switch (innards) {
			case '$STRING':
				if (o && o.res) {
					res = o.res;
				} else {
					res = '{$STRING}';
				}
				return res;

			case '$HTML_NOVARS':
			case '$HTML_ESCAPED':
			case '$HTML':
				let scopedVar = ((varScope && privVarScopes[varScope]) ? varScope : 'main') + '.__acss' + innards.substr(1);
				res = _get(scopedVars, scopedVar);
				if (!res && typeof res !== 'string') {
					res = '{' + innards + '}';
				} else {
					res = ActiveCSS._sortOutFlowEscapeChars(res);
				}
				return res;

			default:
				if (innards.indexOf('$') !== -1 && ['$CHILDREN', '$SELF'].indexOf(innards) === -1) {
					// This should be treated an HTML variable string. It's a regular Active CSS variable that allows HTML.
					let scopedVar = ((varScope && privVarScopes[varScope]) ? varScope : 'main') + '.' + innards;
					res = _get(scopedVars, scopedVar);
					return res || '';
				} else {
					return '{' + innards + '}';
				}
		}
	});
	return str;
};
