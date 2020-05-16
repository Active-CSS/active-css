_a.RemoveClass = o => {
	ActiveCSS._removeClassObj(o.secSelObj, o.actVal);
	return true;	// true used with take-class.
};
