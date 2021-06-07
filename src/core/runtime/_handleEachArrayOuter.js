const _handleEachArrayOuter = (rightVarVal, itemsObj, counter) => {
	let { loopObj, leftVar, leftVars, rightVar } = itemsObj, loopObj2, newRef, eachLeftVar, j;

	if (typeof imSt[loopObj._imStCo] !== 'undefined' && imSt[loopObj._imStCo]._acssImmediateStop) return;

	// Get the rightVar for real and loop over it.
	// Make a copy of loopObj. We're going to want original copies every time we substitute in what we want.
	loopObj2 = _clone(loopObj);
	if (!loopObj2.loopVars) loopObj2.loopVars = {};
	if (!leftVars) {
		// Single level array.
		newRef = rightVar + '[' + counter + ']';
		itemsObj.existingLoopVars[leftVar] = newRef;
		loopObj2.loopRef = itemsObj.existingLoopRef + leftVar + '_' + counter;
	} else {
		// Two dimensional array.
		itemsObj.counter = counter;
		_handleEachArrayInner(itemsObj, 0);

		loopObj2.loopRef = itemsObj.existingLoopRef + leftVars[0] + '_' + counter;	// This will expand to include nested loop references and still needs work as this references multiple items.
	}

	loopObj2.loopVars = itemsObj.existingLoopVars;
	_performSecSel(loopObj2);

	counter++;
	if (rightVarVal[counter]) {
		_handleEachArrayOuter(rightVarVal, itemsObj, counter);
	}
};
