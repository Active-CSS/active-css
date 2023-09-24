const _takeClass = (o, toggle) => {
	if (!_isConnected(o.secSelObj)) return false;
	// Take class away from any element that has it, with an optional scope parameter.
	let aVRes = _extractBracketPars(o.actVal, [ 'scope' ], o);
	let theClass = aVRes.action.substr(1);
	let addClass = (!toggle || toggle && !o.secSelObj.classList.contains(theClass));
	_eachRemoveClass(o, theClass, aVRes.scope);
	if (addClass) _a.AddClass({ secSelObj: o.secSelObj, actVal: theClass });
};
