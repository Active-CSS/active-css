const _performSecSel = (loopObj) => {
	let chilsObj = loopObj.chilsObj;
	let secSelLoops = loopObj.secSelLoops;
	let obj = loopObj.obj;
	let shadowDoc = loopObj.shadowDoc;
	let evType = loopObj.evType;
	let shadowRef = loopObj.shadowRef;
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

	// Get the selectors this event is going to apply to.
	let targetSelector, targs, doc, passTargSel, meMap = [ '&', 'self', 'this' ], activeTrackObj = '', m, tmpSecondaryFunc, actionValue;
	for (targetSelector in chilsObj[secSelLoops]) {
		if (targetSelector == 'conds') continue;	// skip the conditions.
		// Get the correct document/iframe/shadow for this target.
		targs = _splitIframeEls(targetSelector, obj, shadowDoc, evType);
		if (!targs) continue;	// invalid target.
		doc = targs[0];
		passTargSel = targs[1];
		shadowRef = (supportsShadow && doc instanceof ShadowRoot) ? '_' + doc.host.getAttribute('data-activeid').replace(/id\-/, '') : (evObj.shadowRef) ? evObj.shadowRef : null;

		// passTargSel is the string of the target selector that now goes through some changes.
		if (loopRef != '0') passTargSel = _replaceLoopingVars(passTargSel, loopVars);

		passTargSel = _replaceAttrs(obj, passTargSel);
		// See if there are any left that can be populated by the passed otherObj.
		passTargSel = _replaceAttrs(otherObj, passTargSel);
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
			passTargSel = _getRootNode(obj).host;
		}
		let act;
		for (m in chilsObj[secSelLoops][targetSelector]) {
			tmpSecondaryFunc = chilsObj[secSelLoops][targetSelector][m].name._ACSSConvFunc();
			// Generate the object that performs the magic in the functions.
			actionValue = chilsObj[secSelLoops][targetSelector][m].value;
			// Note: this can be optionally optimised by putting all the rules into the secondary selecor
			// rather than a whole array each time. Micro-optimising, but for a large project it is a good idea.
			act = {
				event: evType,
				func: tmpSecondaryFunc,
				actName: chilsObj[secSelLoops][targetSelector][m].name,
				secSel: passTargSel,
				origSecSel: targetSelector,	// Used for debugging only.
				actVal: actionValue,
				origActVal: actionValue,
				primSel: selectorList[sel],
				rules: chilsObj[secSelLoops][targetSelector],
				obj: obj,
				doc: doc,
				ajaxObj: otherObj,
				e: eve,
				passCond: passCond,
				file: chilsObj[secSelLoops][targetSelector][m].file,
				line: chilsObj[secSelLoops][targetSelector][m].line,
				activeID: activeTrackObj,
				shadowRef: shadowRef,	// unique counter of the shadow element rendered - used for variable scoping.
				shadowDoc: shadowDoc,
				component: component,
				loopVars: loopVars,
				loopRef: loopRef
			};
			_performAction(act, runButElNotThere);
		}
	}
};
