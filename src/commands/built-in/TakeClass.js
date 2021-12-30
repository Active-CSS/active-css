_a.TakeClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	// Take class away from any element that has it, with an optional scope parameter.
	let aVRes = _extractActionPars(o.actVal, [ 'scope' ], o);
	let theClass = aVRes.action.substr(1);

	_eachRemoveClass(theClass, theClass, o.doc, aVRes.scope);
	_a.AddClass({ secSelObj: o.secSelObj, actVal: theClass });
};
