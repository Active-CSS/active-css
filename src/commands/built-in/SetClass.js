_a.SetClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let str = o.actVal.replace(/\./g, '')._ACSSRepQuo();
	_setClassObj(o.secSelObj, str);
};
