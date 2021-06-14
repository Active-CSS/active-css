const _handleStepItem = (itemsObj, counterVal) => {
	let { loopObj, counterVar, toVal, byVal, byValDP, scopePrefix } = itemsObj, loopObj2, newRef, objValVar;

	if (typeof imSt[loopObj._imStCo] !== 'undefined' && imSt[loopObj._imStCo]._acssImmediateStop) return;

	loopObj2 = _clone(loopObj);

	let scopedVar = scopePrefix + counterVar;
	_set(scopedProxy, scopedVar, counterVal);
	loopObj2.loopRef = itemsObj.existingLoopRef + counterVar + '_0_' + counterVal;

	_runSecSelOrAction(loopObj2);

	// Increment the counter value by the iteration (by) value. Need to do a bit of jiggery pokery to handle JavaScript weird decimal arithmetic skills.
	if (byValDP == 0) {
		counterVal += byVal;
	} else {
		let byValDPTimes10 = Math.pow(10, byValDP) || 1;
		counterVal = (Math.round(counterVal * byValDPTimes10) + Math.round(byVal * byValDPTimes10)) / byValDPTimes10;
	}

	// Run this function again if we are still in the loop, bearing in mind that the "by" stepping value can be positive or negative.
	if (byVal > 0 && counterVal <= toVal || byVal < 0 && counterVal >= toVal) {
		_handleStepItem(itemsObj, counterVal);
	}
};
