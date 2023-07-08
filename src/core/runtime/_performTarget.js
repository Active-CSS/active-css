const _performTarget = (outerTargetObj, targCounter) => {
	let { targ, obj, compDoc, evType, varScope, evScope, evObj, otherObj, origO, passCond, component, primSel, secSelEls, eve, inheritedScope, _maEvCo, _subEvCo, _subSubEvCo, _targCo, _condCo, _imStCo, _taEvCo, loopRef, runButElNotThere, passTargSel, activeTrackObj, targetSelector, doc, chilsObj, origLoopObj, ifObj } = outerTargetObj;
	let act, outerFill, tmpSecondaryFunc, actionValue;

	if (!targ ||
			typeof imSt[_imStCo] !== 'undefined' && imSt[_imStCo]._acssImmediateStop ||
			_decrBreakContinue(_imStCo, 'break') ||
			_decrBreakContinue(_imStCo, 'continue') ||
			_checkExitTarget(_imStCo) ||
			outerTargetObj.allowMoreActions === false	// This variable gets set to true when an valid selector is found and allows the continuing of running action commands.
		) {
		return;
	}

	let m = Object.keys(targ)[targCounter];

	if (typeof targ[m] === 'undefined') return;		// target not found.

	let targVal = targ[m].value;
	let targName = targ[m].name;

	let resultOfLoopCheck = _checkRunLoop(outerTargetObj, targVal, targName, m, 'action');

	if (typeof imSt[_imStCo] !== 'undefined' && imSt[_imStCo]._acssImmediateStop ||
			_decrBreakContinue(_imStCo, 'break') ||
			_decrBreakContinue(_imStCo, 'continue') ||
			_checkExitTarget(_imStCo)
		) {
		return;
	}

	if (!resultOfLoopCheck.atIf) {
		// Wipe previousIfRes, as this is no longer looking for an "@else if" or "@else".
		delete outerTargetObj.previousIfRes;

		// Generate the object that performs the magic in the functions.
		tmpSecondaryFunc = (!targName.startsWith('$')) ? targName._ACSSConvFunc() : targName;

		actionValue = targVal;

		act = {
			event: evType,
			func: tmpSecondaryFunc,
			actName: targName,
			secSel: passTargSel,
			secSelEls: secSelEls,
			origSecSel: targetSelector,
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
			_subSubEvCo,
			_targCo,
			_condCo,
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
			loopRef,
			evDeclObj: chilsObj,
			ranAction: outerTargetObj.allowMoreActions,
			runPerm: runButElNotThere,
			origLoopObj,
			ifObj
		};

		outerTargetObj.allowMoreActions = _performAction(act, runButElNotThere);
	}

	targCounter++;
	if (targ[targCounter] && outerTargetObj.allowMoreActions !== false) {
		_performTarget(outerTargetObj, targCounter);
	}
};
