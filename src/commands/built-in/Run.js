_a.Run = o => {
	let inn;
	let funky = '"use strict";' + o.actVal.replace(/\{\=([\s\S]*?)\=\}/m, function(_, wot) {

// look into this and _handleVarsInJS at some point - it doesn't look like it correctly scopes, and probably should be part of the higher level substitution stuff.

		inn = _handleVarsInJS(wot);
		return inn;
	});
	let _activeVarScope = (o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main';
	scopedProxy[_activeVarScope] = (scopedProxy[_activeVarScope] === undefined) ? {} : scopedProxy[_activeVarScope];
	try {
		Function('scopedProxy, _activeVarScope', funky)(scopedProxy, _activeVarScope);		// jshint ignore:line
	} catch (err) {
		console.log('Function syntax error (' + err + '): ' + funky);
	}
};
