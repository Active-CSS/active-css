const _handleEach = (loopObj, scopePrefix) => {
	let { fullStatement, varScope } = loopObj;
	let existingLoopRef = (loopObj.loopRef) ? loopObj.loopRef : '';

	// eg. @each name in {person}
	// eg. @each name, age in {person}
	// etc.
	let inPos = fullStatement.indexOf(' in ');
	let leftVar = fullStatement.substr(6, inPos - 6);
	let leftVars;
	if (leftVar.indexOf(',') !== -1) {
		// There is more than one left-hand assignment.
		leftVars = leftVar.split(',');
	}

	let rightVar = fullStatement.substr(inPos + 4);

	let prepExpr = _prepareDetachedExpr(rightVar, varScope);
	let rightVarVal = _evalDetachedExpr(prepExpr, varScope);

	if (!rightVarVal) {
		_warn('Error in evaluating' + rightVar + ' in @each - skipping loop.');
		return;
	}

	let itemsObj = {
		loopObj,
		existingLoopRef,
		leftVar,
		leftVars,
		rightVar,
		varScope,
		scopePrefix
	};

	if (isArray(rightVarVal)) {
		_handleEachArrayOuter(rightVarVal, itemsObj, 0);
	} else {
		let items = Object.entries(rightVarVal);
		_handleEachObj(items, itemsObj, 0);
	}
};
