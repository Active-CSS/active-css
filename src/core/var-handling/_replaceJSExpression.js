const _replaceJSExpression = (sel, realVal=false, quoteIfString=false, varScope=null) => {
	let res;
	sel = sel.replace(/\{\=([\s\S]*?)\=\}/gm, function(str, wot) {
		// Evaluate the JavaScript expression.
		// See if any unscoped variables need replacing.
		wot = _replaceScopedVarsExpr(wot, varScope);
		
		try {
			res = Function('scopedVars', '"use strict";return (' + wot + ');')(scopedVars);		// jshint ignore:line
		} catch (err) {
			console.log('JavaScript expression error (' + err + '): ' + sel);
			console.log('Actual expression evaluated: ' + wot);
		}
		if (!realVal) {		// If realVal is set to true, we want to return the actual expression result in this case, so do nothing here.
			// Res should always be a string in the config, even if evaluated into a conditional. This is because the config is made up of strings.
			let q = '';
			if (quoteIfString) {
				q = '"';
			}
			res = (res === true) ? 'true' : (res === false) ? 'false' : (typeof res === 'string') ? q + res + q : (typeof res === 'number') ? res.toString() : 'Invalid expression (' + wot.trim() + ')';
		}
		return res;
	});
	// Return the result rather than the string if realVal is set to true.
	return (realVal) ? res : sel;
};
