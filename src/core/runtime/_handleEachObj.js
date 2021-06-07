const _handleEachObj = (items, itemsObj, counter) => {
	let { loopObj, leftVar, leftVars, rightVar } = itemsObj, objValVar, loopObj2, newRef;

	if (typeof imSt[loopObj._imStCo] !== 'undefined' && imSt[loopObj._imStCo]._acssImmediateStop) return;

	let key = items[counter][0];
	let val = items[counter][1];

	loopObj2 = _clone(loopObj);
	if (!loopObj2.loopVars) loopObj2.loopVars = {};
	if (!leftVars) {
		// Only referencing the key in the key, value pair. We just place the key value straight in - there is no auto-var substitution for a key.
		// See _replaceLoopingVars for how this '-_-' works. It just places the value in, basically, and not a variable reference.
		itemsObj.existingLoopVars[leftVar] = '-_-' + key;
		loopObj2.loopRef = itemsObj.existingLoopRef + leftVar + '_0_' + counter;
	} else {
		itemsObj.existingLoopVars[leftVars[0]] = '-_-' + key;
		loopObj2.loopRef = leftVars[0] + '_0_' + counter;
		objValVar = leftVars[1].trim();
		newRef = rightVar + '.' + key;
		itemsObj.existingLoopVars[objValVar] = newRef;
		loopObj2.loopRef = itemsObj.existingLoopRef + objValVar + '_1_' + counter;
	}
	loopObj2.loopVars = itemsObj.existingLoopVars;
	_performSecSel(loopObj2);

	counter++;
	if (items[counter]) {
		_handleEachObj(items, itemsObj, counter);
	}
};
