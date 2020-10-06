_a.Run = o => {
	let inn;
	let funky = '"use strict";' + o.actVal.replace(/\{\=([\s\S]*?)\=\}/m, function(_, wot) {
		inn = _handleVarsInJS(ActiveCSS._sortOutFlowEscapeChars(wot));
		return inn;
	});
	let _activeVarScope = (o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main';
	scopedVars[_activeVarScope] = (typeof scopedVars[_activeVarScope] === 'undefined') ? {} : scopedVars[_activeVarScope];
	try {
		Function('scopedVars, _activeVarScope', funky)(scopedVars, _activeVarScope);		// jshint ignore:line
	} catch (err) {
		console.log('Function syntax error (' + err + '): ' + funky);
	}
};
