const _insertResForComponents = (obj, typ, str, acceptVars) => {
	let ref = obj.getAttribute('data-ref');
	if (compPending[ref] === undefined) compPending[ref] = '';
	let content = (typ.startsWith('css') ? '<style>' + str + '</style>' : str);
	if (acceptVars) {
		// Place these results into a temporary location for replacing back when we render the component and get the correct scope.
		if (compPendingVars[ref] === undefined) compPendingVars[ref] = [];
		compPendingVars[ref]['_' + compPendingVarsCo] = content;
		content = '_acssIntCompVarRepl_' + compPendingVarsCo + '_';
		compPendingVarsCo++;
	}
	compPending[ref] += content;
};
