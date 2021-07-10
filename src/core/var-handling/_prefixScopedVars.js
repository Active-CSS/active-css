const _prefixScopedVars = (str, varScope=null) => {
	// Handle those inside double quotes.
	str = str.replace(INQUOTES, function(_, innards) {
		return _prefixScopedVarsDo(innards, varScope, true);
	});
	// Handle the rest.
	str = _prefixScopedVarsDo(str, varScope);

// note these will need to be part of the map ref strategy to avoid double-evaluation.

	return str;
};

const _prefixScopedVarsDo = (str, varScope, quoted) => {
	/**
	 * "str" is a string that could contain scoped variables that need proper set up before evaluating.
	 * It finds each word, which may include a period (.), and see if this needs scoping. It may already have a scoped prefix. If it doesn't, it gets
	 * a scoped prefix added. At the end it will return the formatted string. It will only add the "scopedProxy." prefix if the word exists in the string.
	 * If a variable is in quotes, it substitutes the value itself into the return string.
	*/
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w\$]([\u00BF-\u1FFF\u2C00-\uD7FF\w\$\.\[\]\'\"]+)?)\}/gim, function(_, wot) {
		if (wot.match(/^[\d]+$/)) return '{' + wot + '}';
		if (wot == 'true' || wot == 'false') return wot;
		let scoped = _getScopedVar(wot, varScope);
		return (typeof scoped.val !== 'undefined') ? (quoted) ? scoped.val : scoped.fullName : wot;
	});
	return str;
};
