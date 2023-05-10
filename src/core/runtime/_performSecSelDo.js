const _performSecSelDo = (secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter) => {
	_performTargetOuter(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, 0);
	secSelCounter++;
	let thisTEV = targetEventCounter;
	if (secSels[secSelCounter]) {
		let res = _performSecSelDo(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter);
	}
	if (secSelCounter == 1) {
		// Back to the top of the stack.
		// Remove this event from the mainEvent object. It shouldn't be done straight away as there may be stuff being drawn in sub-DOMs.
		// It just needs to happen at some point, so we'll say 10 seconds.
		setTimeout(function() { delete taEv[thisTEV]; }, 10000);
	}
};
