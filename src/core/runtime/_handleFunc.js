const _handleFunc = function(o, delayActiveID=null, runButElNotThere=false) {
	let delayRef;
	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		delayRef = o.secSel;
	} else {
		// Note: re runButElNotThere) {
		// "runButElNotThere" is a custom element disconnect callback. We know the original object is no longer on the page, but we still want to run functions.
		// If the original object that has been removed is referenced in the code, this is an error by the user.
		if (!runButElNotThere && !o.secSelObj.isConnected) {
			// Skip it if the object is no longer there and cancel all Active CSS bubbling.
			if (delayActiveID) {
				// Cleanup any delayed actions if the element is no longer there.
				if (delayArr[delayActiveID]) {
					// This needs to clear all of the delayed actions associated to an element - not just one, otherwise this could affect performance.
					_unloadAllCancelTimerLoop(delayActiveID);
				}
				delayArr[delayActiveID] = null;
				cancelIDArr[delayActiveID] = null;
				cancelCustomArr[delayActiveID] = null;
			}
			_a.StopPropagation(o);
			// Remove any mapping to this object.
			delete idMap[o.secSelObj];
			return;
		}
		delayRef = _getActiveID(o.secSelObj);
	}

	// Replace any looping variable in the action value at this point, above any delay actions.
	if (o.loopRef != '0') {
		o.actVal = _replaceLoopingVars(o.actVal, o.loopVars);
	}

	// Delayed / interval events need to happen at this level.
	if (o.actVal.match(/(after|every) (stack|(\{)?(\@)?[\u00BF-\u1FFF\u2C00-\uD7FF\w_\-\.\:\[\]]+(\})?(s|ms))(?=(?:[^"]|"[^"]*")*$)/gm)) {
		let o2 = Object.assign({}, o), delLoop = ['after', 'every'], aftEv;
		let splitArr, tid, scope;
		for (aftEv of delLoop) {
			splitArr = _delaySplit(o2.actVal, aftEv, o.compRef);
			scope = (o.compRef) ? o.compRef : 'main';
			if (splitArr.lab) splitArr.lab = scope + splitArr.lab;
			if (typeof splitArr.tim == 'number' && splitArr.tim >= 0) {
				o2.actVal = splitArr.str;
				o2.actValSing = o2.actVal;
				delayArr[delayRef] = (typeof delayArr[delayRef] !== 'undefined') ? delayArr[delayRef] : [];
				delayArr[delayRef][o2.func] = (typeof delayArr[delayRef][o2.func] !== 'undefined') ? delayArr[delayRef][o2.func] : [];
				delayArr[delayRef][o2.func][o2.actPos] = (typeof delayArr[delayRef][o2.func][o2.actPos] !== 'undefined') ? delayArr[delayRef][o2.func][o2.actPos] : [];
				delayArr[delayRef][o2.func][o2.actPos][o2.intID] = (typeof delayArr[delayRef][o2.func][o2.actPos][o2.intID] !== 'undefined') ? delayArr[delayRef][o2.func][o2.actPos][o2.intID] : [];
				if (delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]) {
//					console.log('Clear timeout before setting new one for ' + o2.func + ', ' + o2.actPos + ', ' + o2.intPos + ', ' + o2.loopRef);
					_clearTimeouts(delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]);
					_removeCancel(delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef);
				}
				o2.delayed = true;
				if (aftEv == 'after') {
					_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, setTimeout(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
					return;
				}
				o2.interval = true;
				_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, setInterval(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
				// Carry on down and perform the first action. The interval has been set.
				o.interval = true;
				o.actValSing = splitArr.str;
			}
		}
	} else {
		o.actValSing = o.actVal;
	}

	// Remove any labels from the command string. We can't remove this earlier, as we need the label to exist for either "after" or "every", or both.
	if (o.actValSing.indexOf('label ') !== -1) {
		o.actValSing = o.actValSing.replace(/(label [\u00BF-\u1FFF\u2C00-\uD7FF\w_]+)(?=(?:[^"]|"[^"]*")*)/gm, '');
	}

	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		// Has this action been cancelled? If so, skip the action and remove the cancel.
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][o.func] && cancelCustomArr[delayRef][o.func][o.actPos] &&
				cancelCustomArr[delayRef][o.func][o.actPos][o.intID] && cancelCustomArr[delayRef][o.func][o.actPos][o.intID][o.loopRef]
			) {
			_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
			return;
		}
	}

	// Is this a non-delayed action, if so, we can skip the cancel check.
	if (o.delayed && cancelIDArr[delayRef] && cancelIDArr[delayRef][o.func]) return;

	if (o.func == 'Var') {
		// Special handling for var commands, as each value after the variable name is a JavaScript expression, but not within {= =}, to make it quicker to type.
		o.actValSing = o.actValSing.replace(/__ACSS_int_com/g, ',');
	}

	o.actVal = _replaceAttrs(o.obj, o.actValSing, o.secSelObj, o, o.func, o.compRef);

	// Show debug action before the function has occured. If we don't do this, the commands can go out of sequence in the Panel and it stops making sense.
	if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
		_debugOutput(o);	// A couple of extra objects variables are set in here, and we want them later for the feedback results (not yet implemented fully).
	}

	if (typeof _a[o.func] !== 'function') {
		// Apply this as a CSS style if it isn't a function.
		o.secSelObj.style[o.actName] = o.actVal;
	} else {
		// Allow the variables for this scope to be read by the external function - we want the vars as of right now.
		let compScope = ((o.compRef && privVarScopes[o.compRef]) ? o.compRef : 'main');
		o.vars = scopedVars[compScope];
		// Run the function.
		_a[o.func](o, scopedVars, privVarScopes);
	}

	if (!o.interval && delayActiveID) {
		// We don't cleanup any timers if we are in the middle of an interval. Only on cancel, or if the element is no longer on the page.
		// Also... don't try and clean up after a non-delayed action. Only clean-up here after delayed actions are completed. Otherwise we get actions being removed
		// that shouldn't be when clashing actions from different events with different action values, but the same everything esle.
		_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
	}

	// Handle general "after" callback. This check on the name needs to be more specific or it's gonna barf on custom commands that contain ajax or load. FIXME!
	if (['LoadConfig', 'LoadScript', 'LoadStyle', 'Ajax', 'AjaxPreGet', 'AjaxFormSubmit', 'AjaxFormPreview'].indexOf(o.func) === -1) {
		if (!runButElNotThere && !o.secSelObj.isConnected) o.secSelObj = undefined;
		_handleEvents({ obj: o.secSelObj, evType: 'after' + o.actName._ACSSConvFunc(), otherObj: o.secSelObj, eve: o.e, afterEv: true, origObj: o.obj, compRef: o.compRef, compDoc: o.compDoc, component: o.component });
	}

};
