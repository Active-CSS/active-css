const _replaceStringVars = (o, str, varScope, varReplacementRef=-1) => {
	// This function should only deal once with {$STRING}, and once with HTML variables. Gets called for different reasons, hence it's purpose is double-up here.
	// This is the function that translates HTML variables for an output string.
	let res = '';
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\-\[\]\.\$]+)\}/gi, function(_, innards) {
		switch (innards) {
			case '$STRING':
				if (o && o.res) {
					res = _preReplaceVar(o.res, varReplacementRef);
				} else {
					res = '{$STRING}';
				}
				return res;

			case '$HTML_NOVARS':
			case '$HTML_ESCAPED':
			case '$HTML':
				let scoped = _getScopedVar('__acss' + innards.substr(1), varScope);
				if (!scoped.val && typeof scoped.val !== 'string') {
					res = '{' + innards + '}';
				} else {
//					res = ActiveCSS._sortOutFlowEscapeChars(scoped.val);
					res = _preReplaceVar(scoped.val, varReplacementRef);
				}
				return res;

			default:
				if (innards.indexOf('$') !== -1 && ['$CHILDREN', '$SELF'].indexOf(innards) === -1) {
					// This should be treated as an HTML variable string. It's a regular Active CSS variable that allows HTML.
					let scoped = _getScopedVar(innards, varScope);
					return (scoped.val) ? _preReplaceVar(scoped.val, varReplacementRef) : '';
				} else {
					return '{' + innards + '}';
				}
		}
	});
	return str;
};
