const _prefixScopedVars = function(str, compRef=null) {
	/**
	 * "str" is a string that could contain scoped variables that need proper set up before evaluating.
	 * It finds each word, which may include a period (.), and see if this needs scoping. It may already have a scoped prefix. If it doesn't, it gets
	 * a scoped prefix added. At the end it will return the formatted string. It will only add the "scopedVars." prefix if the word exists in the string.
	 * We need to ignore all words in double quotes, so the part of the regex referencing quotes brings back a full string including quotes so we can ignore the
	 * whole thing.
	*/
	let mapObj = {}, mapObj2 = {}, scopedVar, varEval;

	str = str.replace(/(?!\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w)(\\"|"(?:\\"|[^"])*"|[\u00BF-\u1FFF\u2C00-\uD7FF\w_\.]+)(?!\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w)/gim, function(_, wot) {
		if (wot.indexOf('"') !== -1 || wot.match(/^[\d]+$/)) return wot;	// This is a full quoted so is an invalid match - ignore it.
		if (wot.indexOf('.') !== -1) {
			// This is already scoped in some fashion. If it already has window or scopedVars as the first prefix we can skip it.
			// This is separated from the main regex as we will be adding further scoping options later on, and so it will easier to keep this separate.
			let firstVar = wot.split('.')[0];
			// Return the wot if it prefixed with window. It is unlikely someone unfamiliar with the core will use scopedVars, but just in case ignore that too.
			if (firstVar == 'window' || firstVar == 'scopedVars') return wot;
		}
		scopedVar = ((compRef && privateScopes[compRef]) ? compRef : 'main') + '.' + wot;
		varEval = _get(scopedVars, scopedVar);
		// Only return the variable if it actually exists.
		return (varEval) ? 'scopedVars.' + scopedVar : wot;
	});
	return str;
};
