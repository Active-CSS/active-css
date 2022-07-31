_a.CreateConditional = o => {
	// Create an Active CSS conditional dynamically.
	let funcName = o.actVal.split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.
	if (_c[funcName]) return;	// If this command already exists, do nothing more.

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	let funcStart = 'let conditionalName = o.actName,' +	// The name of the action command that called this function.
		'conditionalFunc = o.func,' +
		'conditionalValue = o.actVal,' +
		'eventSelectorName = o.primSel,' +
		'eventSelector = o.obj,' +
		'e = o.e,' +
		'doc = o.doc,' +
		'component = o.component,' + 
		'compDoc = o.compDoc,' + 
		'carriedEventObject = o.ajaxObj;';

	// Now put in a routine to dynamically work out the variable scopes for the vars command. This is run dynamically, so we need to effective remove the vars command
	// and replace all the remaining content with correctly scoped variables. The original command must retain the vars command for dynamic use, hence this is
	// happening at the point of runtime. The _run function (found in the Run command file) sorts the variable scoping out.

	let newFunc = '_activeVarScope = (o.varScope && privVarScopes[o.varScope]) ? o.varScope : "main";' +
		'scopedProxy[_activeVarScope] = (scopedProxy[_activeVarScope] === undefined) ? {} : scopedProxy[_activeVarScope];' +
		'return _run(flyConds[\'' + funcName + '\'], _activeVarScope, o);';

	flyConds[funcName] = '{=' + funcStart + funcContent.substr(2);

	_c[funcName] = new Function('o', 'scopedProxy', 'privVarScopes', 'flyConds', '_run', 'escapeHTML', 'unEscapeHTML', newFunc);		// jshint ignore:line
};
