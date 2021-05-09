_a.AddClass = o => {	// Note thisID is needed in case the "parent" selector is used.
	if (!_isConnected(o.secSelObj)) return false;
	ActiveCSS._addClassObj(o.secSelObj, o.actVal);
};
