_a.ToggleClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	let str = o.actVal.replace(/\./g, '');
	_toggleClassObj(o.secSelObj, str);
};
