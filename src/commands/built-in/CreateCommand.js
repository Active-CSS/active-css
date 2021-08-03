_a.CreateCommand = o => {
	// Create an Active CSS command dynamically.
	let funcName = o.actVal.split(' ')[0];
	let funcContent = o.actVal.replace(funcName, '').trim();
	funcName = funcName._ACSSConvFunc();

	// When the function is called. The scope of the function variables need to be set in "o". The function runs, but all variables are scoped appropriately
	// at the time it is run. Needed in here is a way to reference that "o" variable and scope accordingly - dynamically.
	// This function right here should only ever be declared once. All var handlings need to be set up correctly with the correct scope right here in this
	// function.

	if (_a[funcName]) return;	// If this command already exists, do nothing more.

	// Set up the default variables in terms that a Active CSS programmer would be used to:
	let funcStart = 'let actionName = o.actName,' +	// The name of the action command that called this function.
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
		'_loopRef = o.loopRef;';					// Internal reference for looping variable reference.

	// Now put in a routine to dynamically work out the variable scopes for the vars command. This is run dynamically, so we need to effective remove the vars command
	// and replace all the remaining content with correctly scoped variables. The original command must retain the vars command for dynamic use, hence this is
	// happening at the point of runtime. The _run function (found in the Run command file) sorts the variable scoping out.

	let newFunc = '_activeVarScope = (o.varScope && privVarScopes[o.varScope]) ? o.varScope : "main";' +
		'scopedProxy[_activeVarScope] = (scopedProxy[_activeVarScope] === undefined) ? {} : scopedProxy[_activeVarScope];' +
		'_run(flyCommands[\'' + funcName + '\'], _activeVarScope, o);';

	flyCommands[funcName] = '{=' + funcStart + funcContent.substr(2);

	_a[funcName] = new Function('o', 'scopedProxy', 'privVarScopes', 'flyCommands', '_run', newFunc);		// jshint ignore:line
};
