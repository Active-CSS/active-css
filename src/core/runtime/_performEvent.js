const _performEvent = loopObj => {
	let stopImEdProp = false;
	let loopObjClone = _clone(loopObj);
	loopObj = null;
	if (loopObjClone.chilsObj !== false) {
		// Secondary selector loops go here.
		let secSelLoops;

		// Set property so we can immediate halt after an action for this event.
		// Used in the pause/await functionality to quit after a pause.
		immediateStopCounter++;
		let thisStopCounter = immediateStopCounter;
		imSt[thisStopCounter] = { };

		loopObjClone._condCo = -1;
		loopObjClone._targCo = -1;

		let subSubEvCo = -1;
		for (secSelLoops in loopObjClone.chilsObj) {
			let loopObjTarg = _clone(loopObjClone);
			subSubEvCo++;
			loopObjTarg._subSubEvCo = subSubEvCo;
			loopObjTarg.fullStatement = secSelLoops;
			loopObjTarg.secSelLoops = secSelLoops;
			loopObjTarg._imStCo = thisStopCounter;
			_performSecSel(loopObjTarg);
			// Note that stopImmedEvProp only works when there are no await or pause commands in any action commands in here.
			if (typeof maEv[loopObjTarg._maEvCo] !== 'undefined' && maEv[loopObjTarg._maEvCo]._acssStopImmedEvProp) {
				stopImEdProp = true;
				return false;
			}
		}
		delete imSt[thisStopCounter];
		delete _break['i' + thisStopCounter];

		_cleanUpAfterPause(loopObjClone._subEvCo, loopObjClone.obj._acssActiveID);
		_resetContinue(thisStopCounter);
		_resetExitTarget(thisStopCounter);
	}
};
