const _handleEachArrayOuter = (rightVarVal, itemsObj, counter) => {
	let { loopObj, leftVar, leftVars, rightVar, scopePrefix } = itemsObj, loopObj2, newRef;

	if (typeof imSt[loopObj._imStCo] !== 'undefined' && imSt[loopObj._imStCo]._acssImmediateStop) return;

	// Get the rightVar for real and loop over it.
	// Make a copy of loopObj. We're going to want original copies every time we substitute in what we want.
	loopObj2 = _clone(loopObj);

	if (!leftVars) {
		// Single level array.
		let scopedVar = scopePrefix + leftVar;
		_set(scopedProxy, scopedVar, rightVarVal[counter]);

		loopObj2.loopRef = itemsObj.existingLoopRef + leftVar + '_' + counter;
	} else {
		// Two dimensional array.
		itemsObj.counter = counter;
		_handleEachArrayInner(rightVarVal, itemsObj, 0);

		loopObj2.loopRef = itemsObj.existingLoopRef + leftVars[0] + '_' + counter;
	}

	_runSecSelOrAction(loopObj2);

	counter++;
	if (rightVarVal[counter]) {
		_handleEachArrayOuter(rightVarVal, itemsObj, counter);
	}
};
