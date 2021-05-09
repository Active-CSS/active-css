_a.Blur = o => {
	if (!_isConnected(o.secSelObj)) return false;
	document.activeElement.blur();
};
