const _performSecSel = (loopObj) => {
	let {chilsObj, secSelLoops, obj, evType, varScope, evScope, evObj, otherObj, origO, passCond, sel, component, primSel, eve, loopVars, _maEvCo, runButElNotThere} = loopObj;
	let compDoc = loopObj.compDoc || document;
	let loopRef = (!loopObj.loopRef) ? 0 : loopObj.loopRef;

	// In a scoped area, the variable area is always the component variable area itself so that variables used in the component are always available despite
	// where the target selector lives. So the variable scope is never the target scope. This is why this is not in _splitIframeEls and shouldn't be.
	if (supportsShadow && compDoc instanceof ShadowRoot) {
		varScope = '_' + compDoc.host._acssActiveID.replace(/id\-/, '');
	} else if (!compDoc.isSameNode(document) && compDoc.hasAttribute('data-active-scoped')) {
		// This must be a scoped component.
		varScope = '_' + compDoc._acssActiveID.replace(/id\-/, '');
	} else {
		varScope = (evObj.varScope) ? evObj.varScope : null;
	}
	let inheritedScope = compDoc._acssInheritEvDoc;

	// Get the selectors this event is going to apply to.
	let secSelCounter, targetSelector, targs, doc, passTargSel, meMap = [ '&', 'self', 'this' ], activeTrackObj = '', m, n, tmpSecondaryFunc, actionValue;

	// This is currently used for the propagation state, but could be added to for anything else that comes up later.
	// It is empty at first and gets added to when referencing is needed.
	targetEventCounter++;
	taEv[targetEventCounter] = { };

	// Loop declarations in sequence.
	secSelLoop: {
		for (secSelCounter in chilsObj[secSelLoops]) {
			// Loop target selectors in sequence.
			for (targetSelector in chilsObj[secSelLoops][secSelCounter]) {
				if (typeof taEv[targetEventCounter] !== 'undefined' && taEv[targetEventCounter]._acssStopImmedEvProp) {
					break secSelLoop;
				}
				if (targetSelector == 'conds') continue;	// skip the conditions.
				if (targetSelector.indexOf('@each') !== -1) {
					let outerFill = [];
					outerFill.push(chilsObj[secSelLoops][secSelCounter][targetSelector]);
					let innerLoopObj = {
						chilsObj: outerFill,
						originalLoops: targetSelector,
						secSelLoops: '0',
						obj,
						compDoc,
						evType,
						varScope,
						evScope,
						evObj,
						otherObj,
						origO,
						passCond,
						sel,
						component,
						primSel,
						eve,
						inheritedScope,
						_maEvCo,
						_taEvCo: targetEventCounter,
						loopVars,
						loopRef,
						runButElNotThere
					};
					_handleLoop(innerLoopObj);

					continue;
				}

				// Does the compDoc still exist? If not, if there is different scoped event root use that. Needed for privateEvents inheritance after component removal.
				if (inheritedScope && !compDoc.isConnected) {
					compDoc = inheritedScope;
				}

				// Get the correct document/iframe/shadow for this target. Resolve the document level to be the root host/document.
				if (evType == 'disconnectedCallback' && meMap.includes(targetSelector)) {
					// The element won't be there. Just run the event anyway.
					doc = compDoc;
					passTargSel = targetSelector;
				} else {
					targs = _splitIframeEls(targetSelector, { obj, component, primSel, origO, compDoc });
					if (!targs) continue;	// invalid target.
					doc = targs[0];
					passTargSel = targs[1];
				}

				// passTargSel is the string of the target selector that now goes through some changes.
				if (loopRef != '0') passTargSel = _replaceLoopingVars(passTargSel, loopVars);

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

				let act;
				let allowFurtherActionCommands;	// This gets set to true when an valid selector is found and allows the continuing of running action commands.
				for (m in chilsObj[secSelLoops][secSelCounter][targetSelector]) {
					if (allowFurtherActionCommands === false) break;
					if (chilsObj[secSelLoops][secSelCounter][targetSelector][m].name.indexOf('@each') !== -1) {
						let outerFill = [];
						outerFill.push(chilsObj[secSelLoops][secSelCounter][targetSelector][m].value);
						let innerLoopObj = {
							chilsObj: outerFill,
							originalLoops: chilsObj[secSelLoops][secSelCounter][targetSelector][m].name,
							secSelLoops: '0',
							obj,
							compDoc,
							evType,
							varScope,
							evScope,
							evObj,
							otherObj,
							origO,
							passCond,
							sel,
							component,
							primSel,
							eve,
							inheritedScope,
							_maEvCo,
							_taEvCo: targetEventCounter,
							loopVars,
							loopRef,
							runButElNotThere
						};
						_handleLoop(innerLoopObj);

						continue;
					}
					tmpSecondaryFunc = chilsObj[secSelLoops][secSelCounter][targetSelector][m].name._ACSSConvFunc();
					// Generate the object that performs the magic in the functions.
					actionValue = chilsObj[secSelLoops][secSelCounter][targetSelector][m].value;
					// Note: this can be optionally optimised by putting all the rules into the secondary selecor
					// rather than a whole array each time. Micro-optimising, but for a large project it is a good idea.
					act = {
						event: evType,
						func: tmpSecondaryFunc,
						actName: chilsObj[secSelLoops][secSelCounter][targetSelector][m].name,
						secSel: passTargSel,
						origSecSel: targetSelector,	// Used for debugging only.
						actVal: actionValue,
						origActVal: actionValue,
						primSel,
						rules: chilsObj[secSelLoops][secSelCounter][targetSelector],
						obj,
						doc,
						ajaxObj: otherObj,
						e: eve,
						inheritedScope,
						_maEvCo,
						_taEvCo: targetEventCounter,
						passCond: passCond,
						file: chilsObj[secSelLoops][secSelCounter][targetSelector][m].file,
						line: chilsObj[secSelLoops][secSelCounter][targetSelector][m].line,
						intID: chilsObj[secSelLoops][secSelCounter][targetSelector][m].intID,
						activeID: activeTrackObj,
						varScope,	// unique counter of the shadow element rendered - used for variable scoping.
						evScope,
						compDoc,
						component,
						loopVars,
						loopRef,
						ranAction: allowFurtherActionCommands
					};
					allowFurtherActionCommands = _performAction(act, runButElNotThere);
				}
			}
		}
	}

	// Remove this event from the mainEvent object. It shouldn't be done straight away as there may be stuff being drawn in sub-DOMs.
	// It just needs to happen at some point, so we'll say 10 seconds.
	setTimeout(function() { taEv = taEv.filter(function(_, i) { return i != targetEventCounter; }); }, 10000);

};
