_a.SetProperty = o => {
	if (!_isConnected(o.secSelObj)) return false;
	_a.SetAttribute(o);
	_handleObserveEvents(o.doc);
};
