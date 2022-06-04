const _insertResForComponents = (obj, typ, str, acceptVars) => {
	let ref = obj.getAttribute('data-ref'), content = '';
	if (compPending[ref] === undefined) compPending[ref] = '';
	if (typ.startsWith('css')) {
		content = '<style>' + str + '</style>';
	} else if (typ.startsWith('json')) {
		if (compPendingJSON[ref] === undefined) compPendingJSON[ref] = [];
		compPendingJSON[ref]['_' + compPendingJSONCo] = str;
		compPendingJSONCo++;
	} else {
		content = str;
	}
	if (acceptVars) {
		// Place these results into a temporary location for replacing back when we render the component and get the correct scope.
		if (compPendingHTML[ref] === undefined) compPendingHTML[ref] = [];
		compPendingHTML[ref]['_' + compPendingHTMLCo] = content;
		content = '_acssIntCompVarRepl_' + compPendingHTMLCo + '_';
		compPendingHTMLCo++;
	}
	compPending[ref] += content;
};
