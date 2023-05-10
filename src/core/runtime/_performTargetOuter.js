const _performTargetOuter = (secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter) => {
	let {chilsObj, secSelLoops, obj, evType, evScope, evObj, otherObj, origO, sel, passCond, component, primSel, eve, _maEvCo, _subEvCo, _subSubEvCo, _targCo, _condCo, _imStCo, runButElNotThere, origLoopObj } = loopObj;

	let targetSelector, targs, doc, passTargSel, activeTrackObj = '', n;

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

	// At this point we should have everything we need to run the event selector as the target selector.
	// However, if this is not the event selector, we need to process each target selector separately.
	// For example, we may be grabbing all the iframes in a document, but each target is in its own component.
	// We therefore have to get the component details of each target and pass these into the rest of the event flow.
	// We perform the selector parsing from the doc/compDoc location of the event selector.

	loopObj._targCo++;

	// First, establish if the target is the event selector. If so, there is no target selector to parse and we keep handling for it separate for speed.
	if (MEMAP.includes(flowTargetSelector)) {
		// It's not enough that we send an object, as we may need to cancel delay and we need to be able to store this info.
		// It won't work unless we can identify it later and have it selectable as a string.
		if (primSel.indexOf('~') !== -1) {
			flowTargetSelector = primSel;
		} else if (typeof obj == 'string') {	// passed in as a string - skip it, this is already a string selector.
			if (obj == 'window') {
				flowTargetSelector = window;
			} else if (obj == 'body') {
				flowTargetSelector = document.body;
			} else {
				flowTargetSelector = obj;
			}
		} else {
			activeTrackObj = _getActiveID(obj);
			if (activeTrackObj) {
				flowTargetSelector = idMap[activeTrackObj];
			} else {
				// It might not be an element, so a data-activeid wasn't assigned.
				flowTargetSelector = obj;
			}
		}

		// Get the correct document/iframe/shadow for this target. Resolve the document level to be the root host/document.
		doc = compDoc;

		let outerTargetObj = {
			targ: secSels[secSelCounter][targetSelector],
			targetSelector,
			secSelEls: [ flowTargetSelector ],
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
			_subSubEvCo,
			_targCo,
			_condCo,
			_imStCo,
			_taEvCo: targetEventCounter,
			loopRef,
			runButElNotThere,
			passTargSel: flowTargetSelector,
			activeTrackObj,
			flowTargetSelector,
			doc,
			chilsObj,
			origLoopObj,
		};

		_performTarget(outerTargetObj, 0);
		_resetExitTarget(_imStCo);

	} else {

		// Handle variables that need to be evaluated before grabbing the targets.
		flowTargetSelector = _sortOutTargSelectorVars(flowTargetSelector, obj, varScope, otherObj);

		// Get the applicable targets if we are resuming after a pause, otherwise get the target elements afresh.
		let res;
		if (elTrack[_subEvCo] && elTrack[_subEvCo].resArr[loopRef + _condCo + '_' + _subSubEvCo + '_' + _targCo]) {
			res = elTrack[_subEvCo].resArr[loopRef + _condCo + '_' + _subSubEvCo + '_' + _targCo];
		} else {
			res = _getSelector({ obj, component, primSel, origO, compDoc }, flowTargetSelector, true);

			// Store the collection for resumption after pausing if needed.
			if (!elTrack[_subEvCo]) {
				elTrack[_subEvCo] = [];
				elTrack[_subEvCo].resArr = [];
			}
			elTrack[_subEvCo].resArr[loopRef + _condCo + '_' + _subSubEvCo + '_' + _targCo] = res;
		}
		if (!res.obj) return;

		doc = res.doc;

		passTargSel = flowTargetSelector;

		let outerTargetObj = {
			targ: secSels[secSelCounter][targetSelector],
			targetSelector,
			secSelEls: res.obj,
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
			_subSubEvCo,
			_targCo,
			_condCo,
			_imStCo,
			_taEvCo: targetEventCounter,
			loopRef,
			runButElNotThere,
			passTargSel,
			activeTrackObj,
			flowTargetSelector,
			chilsObj,
			doc,
			origLoopObj,
		};

		if (!parallelFlow && typeof passTargSel == 'string' && !['~', '|'].includes(passTargSel.substr(0, 1))) {
			// This is used for the default "vertical" event flow. (The other option is "parallel" and is setup in _performActionDo().)
			let els = res.obj;
			let elsTotal = els.length;
			let co = 0, secSelObj;

			// Default target selector event flow. Parallel event flow is handled in _performActionDo().
			// Loop this action command over each of the target selectors before going onto the next action command.
			els.forEach(secSelObj => {
				// Loop over each target selector object and handle all the action commands for each one.
				co++;
				outerTargetObj.passTargSel = secSelObj;
				outerTargetObj._elsTotal = elsTotal;
				outerTargetObj._elsCo = co;

				_performTarget(outerTargetObj, 0);
				_resetExitTarget(_imStCo);
			});

		} else {
			_performTarget(outerTargetObj, 0);
			_resetExitTarget(_imStCo);
		}
	}

	outerTargCounter++;
	if (secSels[secSelCounter][outerTargCounter]) {
		_performTargetOuter(secSels, loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, secSelCounter, outerTargCounter);
	}
};


const _sortOutTargSelectorVars = (passTargSel, obj, varScope, otherObj) => {
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
	return _resolveVars(strObj.str, strObj.ref);
};
