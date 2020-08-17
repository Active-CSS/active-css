const _performSecSel = (loopObj) => {
	let chilsObj = loopObj.chilsObj;
	let secSelLoops = loopObj.secSelLoops;
	let obj = loopObj.obj;
	let compDoc = loopObj.compDoc || document;
	let evType = loopObj.evType;
	let compRef = loopObj.compRef;
	let evObj = loopObj.evObj;
	let otherObj = loopObj.otherObj;
	let passCond = loopObj.passCond;
	let sel = loopObj.sel;
	let component = loopObj.component;
	let selectorList = loopObj.selectorList;
	let eve = loopObj.eve;
	let loopVars = loopObj.loopVars;
	let loopRef = (!loopObj.loopRef) ? 0 : loopObj.loopRef;
	let runButElNotThere = loopObj.runButElNotThere;

	// In a scoped area, the variable area is always the component variable area itself so that variables used in the component are always available despite
	// where the target selector lives. So the variable scope is never the target scope. This is why this is not in _splitIframeEls and shouldn't be.
	if (supportsShadow && compDoc instanceof ShadowRoot) {
		compRef = '_' + compDoc.host.getAttribute('data-activeid').replace(/id\-/, '');
	} else if (!compDoc.isEqualNode(document) && compDoc.hasAttribute('data-active-scoped')) {
		// This must be a scoped component.
		compRef = '_' + compDoc.getAttribute('data-activeid').replace(/id\-/, '');
	} else {
		compRef = (evObj.compRef) ? evObj.compRef : null;
	}

	// Get the selectors this event is going to apply to.
	let secSelCounter, targetSelector, targs, doc, passTargSel, meMap = [ '&', 'self', 'this' ], activeTrackObj = '', m, n, tmpSecondaryFunc, actionValue;
	// Loop declarations in sequence.
	for (secSelCounter in chilsObj[secSelLoops]) {
		// Loop target selectors in sequence.
		for (targetSelector in chilsObj[secSelLoops][secSelCounter]) {
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
					compRef,
					evObj,
					otherObj,
					passCond,
					sel,
					component,
					selectorList,
					eve,
					loopVars,
					loopRef,
					runButElNotThere
				};
				_handleLoop(innerLoopObj);

				continue;
			}
			// Get the correct document/iframe/shadow for this target.
			targs = _splitIframeEls(targetSelector, obj, compDoc);	// Note - here it is compDoc as we are doing this in relation to the 
			if (!targs) continue;	// invalid target.
			doc = targs[0];
			passTargSel = targs[1];

			// passTargSel is the string of the target selector that now goes through some changes.
			if (loopRef != '0') passTargSel = _replaceLoopingVars(passTargSel, loopVars);

			passTargSel = _replaceAttrs(obj, passTargSel, null, null, null, compRef);
			// See if there are any left that can be populated by the passed otherObj.
			passTargSel = _replaceAttrs(otherObj, passTargSel, null, null, null, compRef);
			// Handle functions being run on self.
			if (meMap.includes(passTargSel)) {
				// It's not enough that we send an object, as we may need to cancel delay and we need to be able to store this info.
				// It won't work unless we can identify it later and have it selectable as a string.
				if (typeof obj == 'string') {	// passed in as a string - skip it, this is already a string selector.
					passTargSel = obj;
				} else {
					activeTrackObj = _getActiveID(obj);
					if (activeTrackObj) {
						passTargSel = '[data-activeid="' + activeTrackObj + '"]';
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
			for (m in chilsObj[secSelLoops][secSelCounter][targetSelector]) {
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
						compRef,
						evObj,
						otherObj,
						passCond,
						sel,
						component,
						selectorList,
						eve,
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
					primSel: selectorList[sel],
					rules: chilsObj[secSelLoops][secSelCounter][targetSelector],
					obj: obj,
					doc: doc,
					ajaxObj: otherObj,
					e: eve,
					passCond: passCond,
					file: chilsObj[secSelLoops][secSelCounter][targetSelector][m].file,
					line: chilsObj[secSelLoops][secSelCounter][targetSelector][m].line,
					intID: chilsObj[secSelLoops][secSelCounter][targetSelector][m].intID,
					activeID: activeTrackObj,
					compRef: compRef,	// unique counter of the shadow element rendered - used for variable scoping.
					compDoc: compDoc,
					component: component,
					loopVars: loopVars,
					loopRef: loopRef
				};
				_performAction(act, runButElNotThere);
			}
		}
	}
};
