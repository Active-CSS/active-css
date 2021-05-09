_a.RemoveAttribute = o => {
	if (!_isConnected(o.secSelObj)) return false;
	o.secSelObj.removeAttribute(o.actVal);
};
