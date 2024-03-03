const _replaceJSExpression = (sel, realVal=false, quoteIfString=false, varScope=null, varReplacementRef=-1, o=null, noConvertVar=false) => {
	if (sel.indexOf('{=') === -1) return sel;
	let res;

	sel = sel.replace(/\{\=([\s\S]*?)\=\}/gm, function(str, wot) {
		if (wot == '') return null;

		// Evaluate the JavaScript expression.
		// See if any unscoped variables need replacing.
		if (!noConvertVar) wot = _replaceScopedVarsExpr(wot, varScope);
		// Replace references to the proxy, as there may be properties only available in the original.
		wot = wot.replace(/(scopedProxy|scopedOrig)(\.__getTarget)?/g, 'scopedOrig');
		// Replace any attributes.
		if (o) wot = _replaceAttrs(o.obj, wot, o.secSelObj, o, o.func, varScope);

		let q = '';
		if (quoteIfString) {
			q = '"';
		}
		// If this contains tabs or lines then it better be a string. It won't evaluate with those characters.
		if (["\t", "\n", "\r"].some(v => wot.includes(v))) {
			res = (quoteIfString) ? q + wot + q : wot;
			return _preReplaceVar(res, varReplacementRef);
		}

		try {
			res = Function('scopedProxy, o, scopedOrig, escapeHTML, unEscapeHTML, getVar', '"use strict";return (' + wot + ');')(scopedProxy, o, scopedOrig, escapeHTML, unEscapeHTML, getVar);		// jshint ignore:line
		} catch (err) {
			_warn('JavaScript expression error (' + err + '). Actual expression evaluated: ' + wot, o);
			try {
				res = Function('scopedProxy, o, scopedOrig, escapeHTML, unEscapeHTML, getVar', '"use strict";return ("' + wot.replace(/"/gm, '\\"') + '");')(scopedProxy, o, scopedOrig, escapeHTML, unEscapeHTML, getVar);		// jshint ignore:line
			} catch (err) {
				// Try as a string.
				console.log('JavaScript expression error (' + err + '): ' + sel + '. Is this a string variable that needs double-quotes?');
				console.log('Actual expression evaluated: ' + wot);
			}
		}
		if (!realVal) {		// If realVal is set to true, we want to return the actual expression result in this case, so do nothing here.
			// Res should always be a string in the config, even if evaluated into a conditional. This is because the config is made up of strings.
			res = (res === true) ? 'true' : (res === false) ? 'false' : (res === null) ? 'null' : (typeof res === 'string') ? q + res + q : (typeof res === 'number') ? res.toString() : 'Invalid expression (' + wot.trim() + ')';
		}
		return _preReplaceVar(res, varReplacementRef);
	});

	// Return the result rather than the string if realVal is set to true.
	return (realVal) ? res : sel;
};
