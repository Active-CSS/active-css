_a.VarDelete = o => {
	let newActVal = _replaceAttrs(o.obj, o.actValSing, o.secSelObj, o, o.func, o.varScope).trim();
	let scoped = _getScopedVar(newActVal, o.varScope);
	let mainScope = (scoped.winVar) ? window : scopedProxy;
	_unset(mainScope, scoped.name);
};
