const _handleVars = (arr, opts, varReplacementRef=null) => {
	let { evType, func, o, obj, secSelObj, shadowParent, str, varScope } = opts, i = 0;
	if (!varReplacementRef) varReplacementRef = varReplaceRef++;
	for (i; i < arr.length; i++) {
		if (!arr[i]) continue;	// cater for null values due to populating _handleVars arr conditionally.
		switch (arr[i]) {
			case 'attrs':
				// Includes progressive variable substitution protection.
				str = _replaceAttrs(obj, str, secSelObj, o, func, varScope, evType, varReplacementRef);
				break;

			case 'expr':
				// Includes progressive variable substitution protection.
				str = _replaceJSExpression(str, null, null, varScope, varReplacementRef, o);
				break;

			case 'html':
				// Includes progressive variable substitution protection.
				str = _replaceHTMLVars(o, str, varReplacementRef);
				break;

			case 'rand':
				// No need for progressive substitution protection.
				str = _replaceRand(str);
				break;

			case 'scoped':
				// Includes progressive variable substitution protection.
				str = _replaceScopedVars(str, secSelObj, func, o, null, shadowParent, varScope, varReplacementRef);
				break;

			case 'strings':
				// Includes progressive variable substitution protection.
				str = _replaceStringVars(o, str, varScope, varReplacementRef);

		}
	}
	return { str, ref: varReplacementRef };
};
