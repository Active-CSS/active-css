const _handleFor = (loopObj, scopePrefix) => {
	let { currentLoop, varScope } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';

	// eg. @for n = 1 to 10 (defaults to increment of 1)
	// eg. @for n = 1 to 10 step 2
	// eg. @for n = 10 to 1 step -1
	// eg. @for n = 10 to -10 step -1
	// eg. @for n = -10 to 0 step 1
	// eg. @for n = 1 to 10 step 0.5
	// eg. @for n = {numVar} to {numVar2} step {numVar3}
	// etc.
	// It works with up to 5 decimal places. Not recommended for use with more than several thousand iterations for performance reasons.

	// Get the positions of the "from", "to" and "step" parts of the string.
	let statement = currentLoop;
	let notToZero = false;
	if (statement.indexOf(' not-to-zero') !== -1) {
		notToZero = true;
		statement = statement.replace('not-to-zero', '');
	}
	let fromPos = statement.indexOf('=');
	let toPos = statement.indexOf(' to ');
	let stepPos = statement.indexOf(' step ');

	if (fromPos === -1 || toPos === -1) {
		console.log('Active CSS error: "=" and "to" must be used in the @for statement, "' + statement + '"');
		return;
	}

	// Extract each part of the string that we need to run the statement and assign to appropriate variables.
	let counterVar = statement.substr(5, fromPos - 5).trim();
	let fromVar = statement.substr(fromPos + 1, toPos - fromPos - 1);
	let toVar, stepVar;

	if (stepPos === -1) {
		toVar = statement.substr(toPos + 4);
		stepVar = '1';	// Defaults to 1 when it is not used in the statement.
	} else {
		toVar = statement.substr(toPos + 4, stepPos - toPos - 4);
		stepVar = statement.substr(stepPos + 6);
	}

	// Convert these reference strings to a number for use in the loop.
	let stepVal = _loopVarToNumber(stepVar, varScope);
	let fromVal = _loopVarToNumber(fromVar, varScope);
	let toVal = _loopVarToNumber(toVar, varScope);

	let stepValDP = _countPlaces(stepVal);	// The number of stepVal decimal places used - needed to solve JavaScript "quirk" when using basic decimal arithmetic.

	// Handle any errors from the conversion. We must have numbers, and the "step" value must not equal zero.
	if ([ fromVal, toVal, stepVal ].indexOf(false) !== -1) {
		console.log('Active CSS error: Could not establish valid values from @for statement, "' + statement + '" (look for "false").', 'From:', fromVal, 'To:', toVal, 'Step:', stepVal);
		return;
	} else if (stepValDP > 5) {
		console.log('Active CSS error: @for statement can only handle up to 5 decimal places, "' + statement + '"');
		return;
	}

	// If either "step" is set to zero, not-to-zero is set and "to" is zero, or there is a negative progression with no negative "step" value, skip loop.
	if (stepVal == 0 || notToZero && toVal == 0 || fromVal > toVal && stepVal > 0) return;

	// console.log('_handleFor, counterVar:', counterVar, 'fromVal:', fromVal, 'toVal:', toVal, 'stepVal:', stepVal);	// Handy - leave this here.

	// Now that the loop is set up, pass over the necessary variables into the recursive for function.
	let itemsObj = {
		loopObj,
		existingLoopRef,
		counterVar,
		toVal,
		stepVal,
		stepValDP,
		scopePrefix
	};
	
	_handleForItem(itemsObj, fromVal);
};
