const _handleFunc = function(o, delayActiveID=null, runButElNotThere=false) {
	// Store sync queue if necessary.
	let syncQueueSet = _isSyncQueueSet(o._subEvCo);

	// Set async flag if this is a true asynchronous command.
	o.isAsync = ASYNCCOMMANDS.indexOf(o.func) !== -1;
	o.isTimed = o.actVal.match(TIMEDREGEX);
	let isControlComm = CONTROLCOMM.indexOf(o.func) !== -1;
	runButElNotThere = o.elNotThere || runButElNotThere;

	if (!isControlComm) {
		// Control commands like break, continue, always get run if found in the flow and are not subject to skipping during pause resumption.
		if (_syncStore(o, delayActiveID, syncQueueSet, runButElNotThere)) return;

		// Check and set up sync commands.
		_syncCheckAndSet(o, syncQueueSet);
	}

	// Handle the pause command, which uses a similar method as "await".
	if (o.func == 'Pause') {
		// Allow variables in the pause command.
		o.actValSing = ActiveCSS._sortOutFlowEscapeChars(o.actVal).trim();
		let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'strings', 'scoped' ],
			{
				str: o.actValSing,
				func: o.func,
				o,
				obj: o.obj,
				secSelObj: o.secSelObj,
				varScope: o.varScope
			}
		);
		o.actVal = _resolveVars(strObj.str, strObj.ref, o.func);
		_pauseHandler(o);
		return;
	}

	let delayRef;
	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		delayRef = (o.evScope ? o.evScope : 'doc') + o.secSel;
	} else {
		delayRef = _getActiveID(o.secSelObj);
	}

	// Delayed / interval events need to happen at this level.
	if (o.isTimed) {
		let o2 = _clone(o), delLoop = ['after', 'every'], aftEv;
		let splitArr, tid, scope;
		for (aftEv of delLoop) {
			splitArr = _delaySplit(o2.actVal, aftEv, o);
			scope = (o.evScope) ? o.evScope : 'main';
			if (splitArr.lab) splitArr.lab = scope + splitArr.lab;
			if (typeof splitArr.tim == 'number' && splitArr.tim >= 0) {
				o2.actVal = splitArr.str;
				o2.actValSing = o2.actVal;
				delayArr[delayRef] = (delayArr[delayRef] !== undefined) ? delayArr[delayRef] : [];
				delayArr[delayRef][o2.func] = (delayArr[delayRef][o2.func] !== undefined) ? delayArr[delayRef][o2.func] : [];
				delayArr[delayRef][o2.func][o2.actPos] = (delayArr[delayRef][o2.func][o2.actPos] !== undefined) ? delayArr[delayRef][o2.func][o2.actPos] : [];
				delayArr[delayRef][o2.func][o2.actPos][o2.intID] = (delayArr[delayRef][o2.func][o2.actPos][o2.intID] !== undefined) ? delayArr[delayRef][o2.func][o2.actPos][o2.intID] : [];
				if (delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]) {
//					console.log('Clear timeout before setting new one for ' + o2.func + ', ' + o2.actPos + ', ' + o2.intPos + ', ' + o2.loopRef);
					_clearTimeouts(delayArr[delayRef][o2.func][o2.actPos][o2.intID][o2.loopRef]);
					_removeCancel(delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef);
				}
				o2.delayed = true;
				if (aftEv == 'after') {
					_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, o._subEvCo, setTimeout(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
					 _nextFunc(o);
			 		return;
				}
				o2.interval = true;
				o2.origActValSing = o2.actValSing;
				_setupLabelData(splitArr.lab, delayRef, o2.func, o2.actPos, o2.intID, o2.loopRef, o._subEvCo, setInterval(_handleFunc.bind(this, o2, delayRef, runButElNotThere), splitArr.tim));
				// Carry on down and perform the first action. The interval has been set.
				o.interval = true;
				o.actValSing = splitArr.str;
			}
		}
	} else {
		o.actValSing = o.actVal;
	}

	// Remove any labels from the command string. We can't remove this earlier, as we need the label to exist for either "after" or "every", or both.
	if (o.actValSing.indexOf(' label ') !== -1) {
		o.actValSing = o.actValSing.replace(LABELREGEX, '');
	}

	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		// Has this action been cancelled? If so, skip the action and remove the cancel.
		if (cancelCustomArr[delayRef] && cancelCustomArr[delayRef][o.func] && cancelCustomArr[delayRef][o.func][o.actPos] &&
				cancelCustomArr[delayRef][o.func][o.actPos][o.intID] && cancelCustomArr[delayRef][o.func][o.actPos][o.intID][o.loopRef]
			) {
			_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
			 _nextFunc(o);
			return;
		}
	}

	// Is this a non-delayed action, if so, we can skip the cancel check.
	if (o.delayed && cancelIDArr[delayRef] && cancelIDArr[delayRef][o.func]) {
		_nextFunc(o);
		return;
	}

	o.actValSing = ActiveCSS._sortOutFlowEscapeChars(o.actValSing).trim();

	let isFunc = (typeof _a[o.func] === 'function');	// if it's ever needed to speed up the event flow, set these up as props at config load. For now though, keep the init fast.
	o.isCSSCommand = !(isFunc || o.isDollarVar);	// This is for evaluating any variables as values rather than variable names - ie. for CSS commands.

	if (['Var', 'VarDelete', 'Func', 'ConsoleLog'].indexOf(o.func) !== -1 || o.isDollarVar) {
		// Special handling for var commands, as each value after the variable name is a JavaScript expression, but not within {= =}, to make it quicker to type.
		o.actValSing = _unEscNoVars(o.actValSing.replace(/__ACSS_int_com/g, ','));

	} else if (['Run', 'Eval'].indexOf(o.func) !== -1) {
		// Leave command intact. No variable subsitution other than the use of vars.
		o.actVal = _unEscNoVars(o.actValSing);
	} else {
		let strObj = _handleVars([ 'rand', ((!['CreateCommand', 'CreateConditional'].includes(o.func)) ? 'expr' : null), 'attrs', 'strings', 'scoped' ],
			{
				str: o.actValSing,
				func: o.func,
				o,
				obj: o.obj,
				secSelObj: o.secSelObj,
				varScope: o.varScope
			}
		);
		o.actVal = _resolveVars(strObj.str, strObj.ref, o.func);

		if (!o.func.startsWith('Render')) o.actVal = _unEscNoVars(o.actVal);

		// Handle any additional attributes now requested from a prior variable assignment. This data is in the HTML already, so there is no security risk,
		// although it could get weird if user content contains an attribute reference. So to sort that out, it is escaped prior to this in _replaceAttrs.
		strObj = _handleVars([ 'attrs' ],
			{
				str: o.actVal,
				func: o.func,
				o,
				obj: o.obj,
				secSelObj: o.secSelObj,
				varScope: o.varScope
			}
		);
		o.actVal = _resolveVars(strObj.str, strObj.ref, o.func);
	}

	o.actVal = o.actVal.replace(/_ACSS_later_escbrace_start/gm, '{');
	o.actVal = o.actVal.replace(/_ACSS_later_escbrace_end/gm, '}');

	// Show debug action before the function has occured. If we don't do this, the commands can go out of sequence in the Panel and it stops making sense.
	if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
		_debugOutput(o);	// A couple of extra objects variables are set in here, and we want them later for the feedback results (not yet implemented fully).
	}

	if (!o.isCSSCommand) {
		// Allow the variables for this scope to be read by the external function - we want the vars as of right now.
		let compScope = ((o.varScope && privVarScopes[o.varScope]) ? o.varScope : 'main');
		o.vars = scopedProxy[compScope];
	}

	if (isFunc) {
		// Run the function.
		_a[o.func](o, scopedProxy, privVarScopes, flyCommands, _run);
	} else if (o.isDollarVar) {
		_setACSSVariable(o);
	} else {
		if (o.func.startsWith('--')) {
			_setCSSVariable(o);
		} else {
			_setCSSProperty(o);
		}
	}

	if (o.interval) {
		// Restore the actVal & func to their original states prior to variable evaluation so interval works correctly.
		o.actVal = o.origActValSing;
		o.actValSing = o.actVal;
	} else if (!o.interval && delayActiveID) {
		// We don't cleanup any timers if we are in the middle of an interval. Only on cancel, or if the element is no longer on the page.
		// Also... don't try and clean up after a non-delayed action. Only clean-up here after delayed actions are completed. Otherwise we get actions being removed
		// that shouldn't be when clashing actions from different events with different action values, but the same everything esle.
		_removeCancel(delayRef, o.func, o.actPos, o.intID, o.loopRef);
	}

	// Restart the sync queue if await was used.
	if (!isControlComm && !o.isAsync && o.isAwait && _isSyncQueueSet(o._subEvCo)) {
		_syncRestart(o, o._subEvCo);
		return;
	}

	_nextFunc(o);
 };
