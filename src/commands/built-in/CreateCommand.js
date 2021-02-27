_a.CreateCommand = o => {
	// Create an Active CSS command dynamically.
	let funcName = o.actVal.trim().split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.

	if (_a[funcName]) return;	// If this command already exists, do nothing more.

	funcContent = ActiveCSS._sortOutFlowEscapeChars(funcContent).slice(2, -2);
	funcContent = _handleVarsInJS(funcContent);

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	funcContent = 'let actionName = o.actName,' +	// The name of the action command that called this function.
		'actionPosition = o.actPos,' +				// The position in the action value, 0, 1, etc. - you can call more than one function if you comma-delimit them.
		'actionValue = o.actVal,' +					// The full evaluated action value.
		'actionValueUnEval = o.actValSing,' +		// The singular un-evaluated action value that called the function.
		'actionValuesUnEval = o.origActVal,' +		// The full comma delimited un-evaluated action value of the func action command.
		'actionFunc = o.func,' +					// The name of the function that was called.
		'eventSelector = o.obj,' +					// The event selector element itself, that received the event.
		'eventSelectorName = o.primSel,' +			// The name of the event selector.
		'carriedEventObject = o.ajaxObj,' +			// If func is called from an afterAjax type of event, this contains the "o" object from the event that triggered the ajax call.
		'conditionals = o.passCond,' +				// A space delimited list of any conditionals that were passed.
		'targetSelector = o.secSelObj,' +			// The target selector element itself.
		'targetSelectorName = o.origSecSel,' +		// The name of the target selector this function was called from. If it contains "&" it means the target selector was the event selector.
		'activeID = o.activeID,' +					// The internal reference to the target selector assigned. You shouldn't ever change this.
		'doc = o.doc,' +							// The document object where the target selector can be found.
		'e = o.e,' +								// The event object.
		'eventName = o.event,' +					// The name of the event.
		'configFile = o.file,' +					// The config file where the function call is written.
		'configLine = o.line,' +					// The line in the config file where you can find the function call.
		'rulesArray = o.rules,' +					// An array of all the action commands and un-evaluated values in the target selector declaration.
		'selectorRef = o.secSel,' +					// The target selector reference string.
		'compDoc = o.compDoc,' +				// The document of the shadow DOM, if applicable.
		'component = o.component,' +				// The name of the component, if applicable.
		'_loopVars = o.loopVars,' +					// Internal reference for looping variables.
		'_loopRef = o.loopRef,' +					// Internal reference for looping variable reference.
		'_activeVarScope = (o.varScope && privVarScopes[o.varScope]) ? o.varScope : "main";' +
		'scopedProxy[_activeVarScope] = (scopedProxy[_activeVarScope] === undefined) ? {} : scopedProxy[_activeVarScope];' +
		funcContent;
	// Its primary purpose is to create a command, which is a low-level activity.
	// There is little benefit to having it run more than once, as no variable substitution is allowed in here, and would only lead to inevitable pointless recreates.
	// It would be nice to have it recreated on a realtime edit in the extension. This would need to be set up in the extension area to detect and remove
	// the function if it is edited, but that code has no place in here.
	_a[funcName] = new Function('o', 'scopedProxy', 'privVarScopes', funcContent);		// jshint ignore:line
};
