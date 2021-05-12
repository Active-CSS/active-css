_a.RemoveClass = o => {
	if (!_isConnected(o.secSelObj)) return false;
	ActiveCSS._removeClassObj(o.secSelObj, o.actVal);
	return true;	// true used with take-class.
};
