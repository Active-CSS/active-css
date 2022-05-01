_c.IfHas = o => {
	let aVRes = _extractBracketPars(o.actVal, [ 'scope' ], o);
	// Get scope element if it is there.
	let scope = (aVRes.scope) ? _getSel(o, aVRes.scope.trim()) : o.secSelObj;
	if (!scope || !_isConnected(scope)) return false;

	return scope.querySelector(aVRes.action) ? true : false;
};
