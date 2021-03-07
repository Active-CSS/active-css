_a.VarDelete = o => {
	let strObj = _handleVars([ 'rand', 'expr', 'attrs', 'strings' ],
		{
			str: o.actValSing,
			func: o.func,
			o,
			obj: o.obj,
			secSelObj: o.secSelObj,
			varScope: o.varScope
		}
	);
	let newActVal = _resolveVars(strObj.str, strObj.ref);

	let scoped = _getScopedVar(newActVal, o.varScope);
	let mainScope = (scoped.winVar) ? window : scopedProxy;
	_unset(mainScope, scoped.name);
};
