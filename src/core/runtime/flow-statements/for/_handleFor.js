const _handleFor = (loopObj, scopePrefix) => {
	let { fullStatement, varScope } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';

	// eg. @for n from 1 to 10 (defaults to increment of 1)
	// eg. @for n from 1 to 10 step 2
	// eg. @for n from 10 to 1 step -1
	// eg. @for n from 10 to -10 step -1
	// eg. @for n from -10 to 0 step 1
	// eg. @for n from 1 to 10 step 0.5
	// eg. @for n from {numVar} to {numVar2} step {numVar3}
	// etc.
	// It works with up to 5 decimal places. Not recommended for use with more than several thousand iterations for performance reasons.

	// Get the positions of the "from", "to" and "step" parts of the string.
	let statement = fullStatement;
	let fromPos = statement.indexOf(' from ');
	let toPos = statement.indexOf(' to ');
	let stepPos = statement.indexOf(' step ');

	if (fromPos === -1 || toPos === -1) {
		_err('"from" and "to" must be used in the @for statement, "' + statement + '"');
	}

	// Extract each part of the string that we need to run the statement and assign to appropriate variables.
	let counterVar = statement.substr(5, fromPos - 5).trim();
	let fromVar = statement.substr(fromPos + 6, toPos - fromPos - 6);
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
		_err('Could not establish valid values from @for statement, "' + statement + '"', null, 'From:', fromVal, 'To:', toVal, 'Step:', stepVal);
	} else if (stepValDP > 5) {
		_err('@for statement can only handle up to 5 decimal places, "' + statement + '"');
	}

	// If either "step" is set to zero, or there is a negative progression with no negative "step" value, skip loop.
	if (stepVal == 0 || fromVal > toVal && stepVal > 0) return;

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
