const _basicOVarEval = (str, o, func='') => {
	if (!str) return '';

	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'scoped' ],
		{
			str,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: o.varScope
		}
	);

	return _resolveVars(strObj.str, strObj.ref, func);
};
