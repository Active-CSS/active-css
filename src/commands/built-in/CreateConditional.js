_a.CreateConditional = o => {
	// Create an Active CSS conditional dynamically.
	let funcName = o.actVal.trim().split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.
	if (_c[funcName]) return;	// If this command already exists, do nothing more.
	funcContent = ActiveCSS._sortOutFlowEscapeChars(funcContent).slice(2, -2);
	funcContent = _handleVarsInJS(funcContent);

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	funcContent = 'let conditionalName = o.actName,' +	// The name of the action command that called this function.
		'conditionalFunc = o.func,' +
		'conditionalValue = o.actVal,' +
		'eventSelectorName = o.primSel,' +
		'eventSelector = o.obj,' +
		'e = o.e,' +
		'doc = o.doc,' +
		'component = o.component,' + 
		'compDoc = o.compDoc,' + 
		'carriedEventObject = o.ajaxObj,' +
		'_activeVarScope = (o.compRef && privateScopes[o.compRef]) ? o.compRef : "main";' +
		'scopedVars[_activeVarScope] = (typeof scopedVars[_activeVarScope] === \'undefined\') ? {} : scopedVars[_activeVarScope];' +
		funcContent;
	// Its primary purpose is to create a command, which is a low-level activity.
	// There is little benefit to having it run more than once, as no variable substitution is allowed in here, and would only lead to inevitable pointless recreates.
	// It would be nice to have it recreated on a realtime edit in the Elements extension. This would need to be set up in the extension area to detect and remove
	// the function if it is edited, but that code has no place in here.
	_c[funcName] = new Function('o', 'scopedVars', 'privateScopes', funcContent);		// jshint ignore:line
};
