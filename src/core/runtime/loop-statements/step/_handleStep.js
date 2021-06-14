const _handleStep = (loopObj, scopePrefix) => {
	let { currentLoop, varScope } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';

	// eg. @step n from 1 to 10 (defaults to increment of 1)
	// eg. @step n from 1 to 10 by 2
	// eg. @step n from 10 to 1 by -1
	// eg. @step n from 10 to -10 by -1
	// eg. @step n from -10 to 0 by 1
	// eg. @step n from 1 to 10 by 0.5
	// eg. @step n from numVar to numVar2 by numVar3
	// etc.
	// It works with up to 5 decimal places. Not recommended for use with more than several thousand iterations for performance reasons.

	// Get the positions of the "from", "to" and "by" parts of the string.
	let statement = currentLoop;
	let notToZero = false;
	if (statement.indexOf(' not-to-zero') !== -1) {
		notToZero = true;
		statement = statement.replace('not-to-zero', '');
	}
	let fromPos = statement.indexOf(' from ');
	let toPos = statement.indexOf(' to ');
	let byPos = statement.indexOf(' by ');

	if (fromPos === -1 || toPos === -1) {
		console.log('Active CSS error: "from" and "to" must be used in the @step statement, "' + statement + '"');
		return;
	}

	// Extract each part of the string that we need to run the statement and assign to appropriate variables.
	let counterVar = statement.substr(6, fromPos - 6).trim();
	let fromVar = statement.substr(fromPos + 6, toPos - fromPos - 6);
	let toVar, byVar;

	if (byPos === -1) {
		toVar = statement.substr(toPos + 4);
		byVar = '1';	// Defaults to 1 when it is not used in the statement.
	} else {
		toVar = statement.substr(toPos + 4, byPos - toPos - 4);
		byVar = statement.substr(byPos + 4);
	}

	// Convert these reference strings to a number for use in the loop.
	let byVal = _loopVarToNumber(byVar, varScope);
	let fromVal = _loopVarToNumber(fromVar, varScope);
	let toVal = _loopVarToNumber(toVar, varScope);

	let byValDP = _countPlaces(byVal);	// The number of byVal decimal places used - needed to solve JavaScript "quirk" when using basic decimal arithmetic.

	// Handle any errors from the conversion. We must have numbers, and the "by" value must not equal zero.
	if ([ fromVal, toVal, byVal ].indexOf(false) !== -1) {
		console.log('Active CSS error: Could not establish valid values from @step statement, "' + statement + '" (look for "false").', 'From:', fromVal, 'To:', toVal, 'By:', byVal);
		return;
	} else if (byValDP > 5) {
		console.log('Active CSS error: @step statement can only handle up to 5 decimal places, "' + statement + '"');
		return;
	}

	// If either "by" is set to zero, not-to-zero is set and "to" is zero, or there is a negative progression with no negative "by" value, skip loop.
	if (byVal == 0 || notToZero && toVal == 0 || fromVal > toVal && byVal > 0) return;

	// console.log('_handleStep, counterVar:', counterVar, 'fromVal:', fromVal, 'toVal:', toVal, 'byVal:', byVal);	// Handy - leave this here.

	// Now that the loop is set up, pass over the necessary variables into the recursive step function.
	let itemsObj = {
		loopObj,
		existingLoopRef,
		counterVar,
		toVal,
		byVal,
		byValDP,
		scopePrefix
	};
	
	_handleStepItem(itemsObj, fromVal);
};
