_a.RemoveProperty = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.secSelObj.style.removeProperty(o.actVal);
};
