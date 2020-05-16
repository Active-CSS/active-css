const _performAction = (o, runButElNotThere=false) => {
	// All attr... actions pass through here.
	if (o.doc.readyState && o.doc.readyState != 'complete') {
		// Iframe not ready, come back to this in 200ms.
		setTimeout(_performAction.bind(this, o), 200);
		return false;
	}
	// Just do the actions with no loops on the secSel.
	_performActionDo(o, null, runButElNotThere);
};
