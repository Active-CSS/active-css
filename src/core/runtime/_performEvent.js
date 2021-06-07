const _performEvent = (loopObj) => {
	let stopImEdProp = false;
	let loopObjClone = _clone(loopObj);
	loopObj = null;
	if (loopObjClone.chilsObj !== false) {
		// Secondary selector loops go here.
		let secSelLoops;

		// Set property so we can immediate halt after an action for this event.
		// Used in the pause/await functionality to quit after a pause.
		immediateStopCounter++;
		imSt[immediateStopCounter] = { };

		for (secSelLoops in loopObjClone.chilsObj) {
			let loopObjTarg = _clone(loopObjClone);
			loopObjTarg.originalLoops = secSelLoops;
			loopObjTarg.secSelLoops = secSelLoops;
			loopObjTarg._imStCo = immediateStopCounter;
			_performSecSel(loopObjTarg);
			// Note that stopImmedEvProp only works when there are no await or pause commands in any action commands in here.
			if (typeof maEv[loopObjTarg._maEvCo] !== 'undefined' && maEv[loopObjTarg._maEvCo]._acssStopImmedEvProp) {
				stopImEdProp = true;
				return false;
			}
		}
	}
};
