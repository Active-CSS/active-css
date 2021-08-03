const _checkCond = condObj => {
	let { commandName, evType, aV, el, varScope, ajaxObj, func, sel, eve, doc, component, compDoc, actionBoolState } = condObj;
	let condVals, condValsLen, n;

	let strObj = _handleVars([ 'rand', 'expr', 'attrs' ],
		{
			evType,
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

	condVals = aV.replace(/_ACSSEscComma/g, ',').split('_ACSSComma');
	condValsLen = condVals.length;

	for (n = 0; n < condValsLen; n++) {
		let cObj = {
			func,
			actName: commandName,
			secSel: 'conditional',
			secSelObj: el,
			actVal: condVals[n].trim(),
			primSel: sel,
			obj: el,
			e: eve,
			doc,
			ajaxObj,
			component,
			compDoc,
			varScope
		};
		if (_c[func](cObj, scopedProxy, privVarScopes, flyConds, _run) !== actionBoolState) {
			return false;	// Barf out immediately if it fails a condition.
		}
	}

	return true;
};
