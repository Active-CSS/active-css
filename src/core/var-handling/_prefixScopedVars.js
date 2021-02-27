const _prefixScopedVars = (str, varScope=null) => {
	// Handle those inside double quotes.
	str = str.replace(/("([^"]|"")*"|'([^']|'')*')/g, function(_, innards) {
		return _prefixScopedVarsDo(innards, varScope, true);
	});
	str = _prefixScopedVarsDo(str, varScope);

// note these will need to be part of the map ref strategy to avoid double-evaluation.

	return str;
};

const _prefixScopedVarsDo = (str, varScope, quoted) => {
	/**
	 * "str" is a string that could contain scoped variables that need proper set up before evaluating.
	 * It finds each word, which may include a period (.), and see if this needs scoping. It may already have a scoped prefix. If it doesn't, it gets
	 * a scoped prefix added. At the end it will return the formatted string. It will only add the "scopedProxy." prefix if the word exists in the string.
	 * We need to ignore all words in double quotes, so the part of the regex referencing quotes brings back a full string including quotes so we can ignore the
	 * whole thing.
	*/
	str = str.replace(/\{([\u00BF-\u1FFF\u2C00-\uD7FF\w_\$][\u00BF-\u1FFF\u2C00-\uD7FF\w_\$\.\[\]\'\"]+)\}/gim, function(_, wot) {
		if (wot.match(/^[\d]+$/)) return '{' + wot + '}';	// This is a full quoted so is an invalid match - ignore it.
		if (wot == 'true' || wot == 'false') return wot;
		let scoped = _getScopedVar(wot, varScope);
		return (typeof scoped.val !== 'undefined') ? (quoted) ? scoped.val : scoped.fullName : wot;
	});
	return str;
};
