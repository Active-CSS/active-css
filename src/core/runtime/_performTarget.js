const _performTarget = (outerTargetObj, targCounter) => {
	let { targ, obj, compDoc, evType, varScope, evScope, evObj, otherObj, origO, passCond, component, primSel, eve, inheritedScope, _maEvCo, _subEvCo, _imStCo, _taEvCo, loopVars, loopRef, runButElNotThere, passTargSel, activeTrackObj, targetSelector, doc, chilsObj, origLoopObj } = outerTargetObj;

	let act, outerFill, tmpSecondaryFunc, actionValue;

	if (typeof imSt[_imStCo] !== 'undefined' && imSt[_imStCo]._acssImmediateStop) {
		return;
	}

	if (!targ) return;
	let m = Object.keys(targ)[targCounter];

	if (outerTargetObj.allowMoreActions === false) return;	// This variable gets set to true when an valid selector is found and allows the continuing of running action commands.

	if (targ[m].name.indexOf('@each') !== -1) {
		let outerFill = [];
		outerFill.push(targ[m].value);
		let innerLoopObj = {
			chilsObj: outerFill,
			originalLoops: targ[m].name,
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
			component,
			primSel,
			eve,
			inheritedScope,
			_maEvCo,
			_subEvCo,
			_imStCo,
			_taEvCo,
			loopVars,
			loopRef,
			runButElNotThere,
			origLoopObj
		};
		_handleLoop(innerLoopObj);

		return;
	}

	tmpSecondaryFunc = targ[m].name._ACSSConvFunc();
	// Generate the object that performs the magic in the functions.

	actionValue = targ[m].value;
	// Note: this can be optionally optimised by putting all the rules into the secondary selecor
	// rather than a whole array each time. Micro-optimising, but for a large project it is a good idea.

	act = {
		event: evType,
		func: tmpSecondaryFunc,
		actName: targ[m].name,
		secSel: passTargSel,
		origSecSel: targetSelector,	// Used for debugging only.
		actVal: actionValue,
		origActVal: actionValue,
		primSel,
		rules: targ,
		obj,
		doc,
		ajaxObj: otherObj,
		e: eve,
		inheritedScope,
		_maEvCo,
		_subEvCo,
		_imStCo,
		_taEvCo,
		passCond: passCond,
		file: targ[m].file,
		line: targ[m].line,
		intID: targ[m].intID,
		activeID: activeTrackObj,
		varScope,	// unique counter of the shadow element rendered - used for variable scoping.
		evScope,
		evObj,
		origO,
		compDoc,
		component,
		loopVars,
		loopRef,
		evDeclObj: chilsObj,
		ranAction: outerTargetObj.allowMoreActions,
		runPerm: runButElNotThere,
		origLoopObj
	};

	outerTargetObj.allowMoreActions = _performAction(act, runButElNotThere);

	targCounter++;
	if (targ[targCounter] && outerTargetObj.allowMoreActions !== false) {
		_performTarget(outerTargetObj, targCounter);
	}
};
