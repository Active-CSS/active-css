const _replaceStringVars = (o, str, compRef) => {
	// This function should only deal once with {$STRING}, and once with HTML variables. Gets called for different reasons, hence it's purpose is double-up here.
	// This is the function that translates HTML variables for an output string.
	let noResYet = false;
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\[\]\.\$]+)\}/gi, function(_, innards) {
		if (innards == '$STRING') {
			if (!o.res) {
				noResYet = true;
				return '{$STRING}';
			}
			return ((o && o.res) ? o.res : '');
		} else if (innards.indexOf('$') !== -1) {
			// This should be treated an HTML variable string. It's a regular Active CSS variable that allows HTML.
			let scopedVar = ((compRef && privateScopes[compRef]) ? compRef : 'main') + '.' + innards;
			let res = _get(scopedVars, scopedVar);
			return res || '';
		} else {
			return '{' + innards + '}';
		}
	});
	// We only allow html variables to be passed once - anything inside the result string that looks like a further HTML variable (contains a $) gets escaped.
	if (!noResYet) {
		str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\$]+)\}/gi, function(_, innards) {
			return (innards.indexOf('$') !== -1) ? '' : '{' + innards + '}';
		});
	}
	return str;
};
