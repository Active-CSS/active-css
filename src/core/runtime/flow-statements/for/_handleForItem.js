const _handleForItem = (itemsObj, counterVal) => {
	let { loopObj, counterVar, toVal, stepVal, stepValDP, scopePrefix } = itemsObj, loopObj2, newRef, objValVar;
	let _imStCo = loopObj._imStCo;

	if (_checkBreakLoop(_imStCo)) {
		return;
	}

	loopObj2 = _clone(loopObj);

	let scopedVar = scopePrefix + counterVar;
	_set(scopedProxy, scopedVar, counterVal);
	loopObj2.loopRef = itemsObj.existingLoopRef + counterVar + '_0_' + counterVal;

	_runSecSelOrAction(loopObj2);

	// Increment the counter value by the iteration (step) value. Need to do a bit of jiggery pokery to handle JavaScript weird decimal arithmetic skills.
	if (stepValDP == 0) {
		counterVal += stepVal;
	} else {
		let stepValDPTimes10 = Math.pow(10, stepValDP) || 1;
		counterVal = (Math.round(counterVal * stepValDPTimes10) + Math.round(stepVal * stepValDPTimes10)) / stepValDPTimes10;
	}

	// Run this function again if we are still in the loop, bearing in mind that the "step" stepping value can be positive or negative.
	if (stepVal > 0 && counterVal <= toVal || stepVal < 0 && counterVal >= toVal) {
		_handleForItem(itemsObj, counterVal);
	} else {
		_resetContinue(_imStCo);
	}
};
