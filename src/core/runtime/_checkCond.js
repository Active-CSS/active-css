const _checkCond = condObj => {
	let { actName, rules, thisAction, aV, el, varScope, otherEl, func, sel, cond, eve, doc, component, compDoc, actionBoolState } = condObj;
	let condVals, condValsLen, n;

	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			evType: thisAction,
			str: aV,
			obj: el,
			varScope
		}
	);
	strObj = _handleVars([ 'strings', 'scoped' ],
		{
			str: strObj.str,
			varScope
		},
		strObj.ref
	);
	aV = _resolveVars(strObj.str, strObj.ref);

	aV = (otherEl && otherEl.loopRef != '0') ? _replaceLoopingVars(aV, otherEl.loopVars) : aV;

	condVals = aV.replace(/_ACSSEscComma/g, ',').split('_ACSSComma');
	condValsLen = condVals.length;

	for (n = 0; n < condValsLen; n++) {
		let cObj = {
			'func': func,
			'actName': actName,
			'secSel': 'conditional',
			'secSelObj': el,
			'actVal': condVals[n].trim(),
			'primSel': sel,
			'rules': rules,
			'obj': el,
			'e': eve,
			'doc': doc,
			'ajaxObj': otherEl,
			'component': component,
			'compDoc': compDoc,
			'varScope': varScope
		};
		if (_c[func](cObj, scopedProxy, privVarScopes, flyConds, _run) !== actionBoolState) {
			return false;	// Barf out immediately if it fails a condition.
		}
	}

	return true;
};
