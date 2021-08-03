const _handleEachObj = (items, itemsObj, counter) => {
	let { loopObj, leftVar, leftVars, rightVar, scopePrefix } = itemsObj, objValVar, loopObj2, newRef;
	let _imStCo = loopObj._imStCo;

	if (_checkBreakLoop(_imStCo)) return;

	let key = items[counter][0];
	let val = items[counter][1];

	loopObj2 = _clone(loopObj);

	if (!leftVars) {
		// Only referencing the key in the key, value pair.
		// Add this as a regular scoped variable.
		let scopedVar = scopePrefix + leftVar;
		_set(scopedProxy, scopedVar, key);
		loopObj2.loopRef = itemsObj.existingLoopRef + leftVar + '_0_' + counter;

	} else {
		// Add these as regular scoped variables.
		let scopedVarKey = scopePrefix + leftVars[0];
		_set(scopedProxy, scopedVarKey, key);
		loopObj2.loopRef = leftVars[0] + '_0_' + counter;

		let LeftVarValTrim = leftVars[1].trim();
		let scopedVarVal = scopePrefix + LeftVarValTrim;
		_set(scopedProxy, scopedVarVal, val);
		loopObj2.loopRef = itemsObj.existingLoopRef + LeftVarValTrim + '__lVEach' + counter;
	}

	_runSecSelOrAction(loopObj2);

	counter++;
	if (items[counter]) {
		_handleEachObj(items, itemsObj, counter);
	} else {
		_resetContinue(_imStCo);
	}
};
