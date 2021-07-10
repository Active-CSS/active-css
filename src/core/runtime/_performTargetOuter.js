const _performTargetOuter = (secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter) => {
	let {chilsObj, secSelLoops, obj, evType, evScope, evObj, otherObj, origO, sel, passCond, component, primSel, eve, _maEvCo, _subEvCo, _imStCo, runButElNotThere, origLoopObj } = loopObj;

	let targetSelector, targs, doc, passTargSel, meMap = [ '&', 'self', 'this' ], activeTrackObj = '', n;

	if (!secSels[secSelCounter]) return;
	targetSelector = Object.keys(secSels[secSelCounter])[outerTargCounter];

	// Loop target selectors in sequence.
	if (typeof taEv[targetEventCounter] !== 'undefined' && taEv[targetEventCounter]._acssStopImmedEvProp ||
			_decrBreakContinue(_imStCo, 'break') ||
			_decrBreakContinue(_imStCo, 'continue')
		) {
		return;
	}
	if (targetSelector == 'conds') return;	// skip the conditions.

	let resultOfLoopCheck = _checkRunLoop(loopObj, secSels[secSelCounter][targetSelector], targetSelector, targetEventCounter);
	if (resultOfLoopCheck.atIf) {
		return;
	}

	let flowTargetSelector = targetSelector, parallelFlow;
	if (flowTargetSelector.endsWith(' parallel')) {
		parallelFlow = true;
		flowTargetSelector = flowTargetSelector.slice(0, -9).trim();
	}

	// Does the compDoc still exist? If not, if there is different scoped event root use that. Needed for privateEvents inheritance after component removal.
	if (inheritedScope && !compDoc.isConnected) {
		compDoc = inheritedScope;
	}

	// Get the correct document/iframe/shadow for this target. Resolve the document level to be the root host/document.
	if (evType == 'disconnectedCallback' && meMap.includes(flowTargetSelector)) {
		// The element won't be there. Just run the event anyway.
		doc = compDoc;
		passTargSel = flowTargetSelector;
	} else {
		targs = _splitIframeEls(flowTargetSelector, { obj, component, primSel, origO, compDoc });
		if (!targs) return;	// invalid target.
		doc = targs[0];
		passTargSel = targs[1];
	}

	// passTargSel is the string of the target selector that now goes through some changes.
	passTargSel = ActiveCSS._sortOutFlowEscapeChars(passTargSel);
	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			str: passTargSel,
			obj,
			varScope
		}
	);
	strObj = _handleVars([ 'strings', 'scoped' ],
		{
			obj: null,
			str: strObj.str,
			varScope
		},
		strObj.ref
	);
	strObj = _handleVars([ 'attrs' ],
		{
			str: strObj.str,
			obj: otherObj,
			varScope
		},
		strObj.ref
	);
	passTargSel = _resolveVars(strObj.str, strObj.ref);

	// Handle functions being run on self.
	if (meMap.includes(passTargSel)) {
		// It's not enough that we send an object, as we may need to cancel delay and we need to be able to store this info.
		// It won't work unless we can identify it later and have it selectable as a string.
		if (primSel.indexOf('~') !== -1) {
			passTargSel = primSel;
		} else if (typeof obj == 'string') {	// passed in as a string - skip it, this is already a string selector.
			passTargSel = obj;
		} else {
			activeTrackObj = _getActiveID(obj);
			if (activeTrackObj) {
				passTargSel = idMap[activeTrackObj];
			} else {
				// It might not be an element, so a data-activeid wasn't assigned.
				passTargSel = obj;
			}
		}
	} else if (passTargSel == 'host') {
		let rootNode = _getRootNode(obj);
		passTargSel = (rootNode._acssScoped) ? rootNode : rootNode.host;
	}

	let outerTargetObj = {
		targ: secSels[secSelCounter][targetSelector],
		obj,
		compDoc,
		evType,
		varScope,
		evScope,
		evObj,
		otherObj,
		origO,
		passCond,
		component,
		primSel,
		eve,
		inheritedScope,
		_maEvCo,
		_subEvCo,
		_imStCo,
		_taEvCo: targetEventCounter,
		loopRef,
		runButElNotThere,
		passTargSel,
		activeTrackObj,
		flowTargetSelector,
		doc,
		chilsObj,
		origLoopObj,
	};

	if (!parallelFlow && typeof passTargSel == 'string' && !['~', '|'].includes(passTargSel.substr(0, 1))) {
		// This is used for the default "vertical" event flow. (The other option is "parallel" and is setup in _performActionDo().)
		let els = _prepSelector(passTargSel, obj, doc);
		let elsTotal = els.length;
		let co = 0, secSelObj;

		// Default target selector event flow. Parallel event flow is handled in _performActionDo().
		// Loop this action command over each of the target selectors before going onto the next action command.
		els.forEach(secSelObj => {
			// Loop over each target selector object and handle all the action commands for each one.
			co++;
			let cloneOuterTargetObj = outerTargetObj;
			cloneOuterTargetObj.passTargSel = secSelObj;
			cloneOuterTargetObj._elsTotal = elsTotal;
			cloneOuterTargetObj._elsCo = co;

			_performTarget(outerTargetObj, 0);
			_resetExitTarget(_imStCo);
		});

	} else {
		_performTarget(outerTargetObj, 0);
		_resetExitTarget(_imStCo);
	}

	outerTargCounter++;
	if (secSels[secSelCounter][outerTargCounter]) {
		_performTargetOuter(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter);
	}
};
