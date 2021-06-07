const _handleEach = (loopObj) => {
	let {originalLoops, varScope} = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';
	let existingLoopVars = (loopObj.loopVars) ? loopObj.loopVars : [];

	// eg. @each name in person
	// eg. @each name, age in person
	// etc.
	// It limits variables to the scope we are in.
	let inPos = originalLoops.indexOf(' in ');
	let leftVar = originalLoops.substr(6, inPos - 6);
	let leftVars;
	if (leftVar.indexOf(',') !== -1) {
		// There is more than one left-hand assignment.
		leftVars = leftVar.split(',');
	}

	let rightVar = originalLoops.substr(inPos + 4);
	// Note that we don't use the real value of the list object in the *replacement* value - it evaluates in the scope dynamically, so we don't attach the scope.

	let rightVarVal, rightVarReal;
	if (existingLoopVars[rightVar] !== undefined) {
		let scoped = _getScopedVar(existingLoopVars[rightVar], varScope);
		rightVarReal = scoped.name;
		rightVarVal = scoped.val;
		// We need the real variable reference, so reassign rightVar.
		rightVar = existingLoopVars[rightVar];
	} else {
		let scoped = _getScopedVar(rightVar, varScope);
		rightVarReal = scoped.name;
		rightVarVal = scoped.val;
	}

	if (rightVarVal === undefined) {
		console.log('Active CSS error: ' + rightVarReal + ' is not defined - skipping loop.');
		return;
	}

	let itemsObj = {
		loopObj,
		existingLoopRef,
		existingLoopVars,
		leftVar,
		leftVars,
		rightVar
	};

	// The variables themselves get converted internally to the actual variable reference. By doing this, we can circumvent a whole bunch of complexity to do
	// with setting up new variables, and handling {{var}} variable binding, as internally we are referring to the real variable and not the config reference.
	// We do this by reading and replacing the remainder of this particular object with the correct values.
	// We keep the original object, and make copies for use in _performSecSel as we do the following looping.
	if (isArray(rightVarVal)) {
		_handleEachArrayOuter(rightVarVal, itemsObj, 0);
	} else {
		let items = Object.entries(rightVarVal);
		_handleEachObj(items, itemsObj, 0);
	}
};
