const _performActionDo = (o, loopI=null, runButElNotThere=false) => {
	// Substitute any ajax variable if present. Note {@i} should never be in secSel at this point, only a numbered reference.
	if (!o.secSel && !runButElNotThere) return;
	// Split action by comma.
	let newActVal = o.actVal;
	if (o.actVal.indexOf(',') !== -1) {	// Note this could be optimized with a single split regex.
		// Remove commas in brackets from what is coming up in the next replace.
		newActVal = newActVal.replace(/\(.*?\)/g, function(m, c) {
			return m.replace(/,/g, '_ACSStmpcomma_');
		});
		// Replace all commas not in quotes with a split delimiter for multiple action values.
		newActVal = newActVal.replace(/"[^"]*"|(\,)/g, function(m, c) {
		    if (!c) return m;
		    return '_ACSSComma';
		});
		// Put any commas in brackets back.
		newActVal = newActVal.replace(/_ACSStmpcomma_/g, ',');
	}
	if (['Var', 'VarDelete'].indexOf(o.func) !== -1) {
		// Special handling for var commands, as each value is a JavaScript expression, but not in {= =}, to make it quicker to type.
		newActVal = ActiveCSS._sortOutFlowEscapeChars(newActVal);
		// Now escape any commas inside any kind of brackets.
		newActVal = _escCommaBrack(newActVal, o);
	}
	// Store the original copies of the action values before we start looping secSels.
	let actValsLen, actVals = newActVal.split('_ACSSComma'), comm, activeID;
	actValsLen = actVals.length;
	let pars = { loopI, actVals, actValsLen };

	if (typeof o.secSel == 'string' && !['~', '|'].includes(o.secSel.substr(0, 1))) {
		// Loop objects in secSel and perform the action on each one. This enables us to keep the size of the functions down.
		let checkThere = false, activeID;
		if (o.secSel == '#') {
			console.log('Active CSS error: ' + o.primSel + ' ' + o.event + ', ' + o.actName + ': "' + o.origSecSel + '" is being converted to "#". Attribute or variable is not present.');
		}

		let els = _prepSelector(o.secSel, o.obj, o.doc);
		let elsTotal = els.length;
		let co = 0;

		// Loop this action command over each of the target selectors before going onto the next action command.
		els.forEach((obj) => {
			// Loop over each target selector object and handle all the action commands for each one.
			co++;
			checkThere = true;
			let oCopy = _clone(o);
			oCopy._elsTotal = elsTotal;
			oCopy._elsCo = co;
			_actionValLoop(oCopy, pars, obj);
		});

		if (!checkThere) {
			if (o.ranAction === true) {
				// Element is no longer there - run anyway, as the target selector was only just removed.
				let oCopy = _clone(o);
				_actionValLoop(oCopy, pars, {}, true);	// run but element not there anymore, if it ever was.
			} else {
				// Element was never there in this run of target selector action commands.
				return false;
			}
		}

	} else {
		let oCopy = _clone(o);
		// Send the secSel to the function, unless it's a custom selector, in which case we don't.
		if (typeof oCopy.secSel == 'object') {
			_actionValLoop(oCopy, pars, oCopy.secSel);
		} else {
			// Is this a custom event selector? If so, don't bother trying to get the object. Trust the developer doesn't need it.
			if (runButElNotThere || ['~', '|'].includes(oCopy.secSel.substr(0, 1))) {
				_actionValLoop(oCopy, pars, {}, runButElNotThere);
			}
		}
/* 	Feedback commented out for the moment - this will be part of a later extension upgrade.
		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
			// Show any feedback available at this point. Note ajax call results will feedback elsewhere.
			_debugOutputFeedback(oCopy);
		}
*/
	}
	if (typeof imSt[o._imStCo] !== 'undefined' && imSt[o._imStCo]._acssImmediateStop) return;
	return true;
};
