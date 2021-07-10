_a.TriggerReal = o => {
	// Simulate a real event, not just a programmatical one.
	if (!_isConnected(o.secSelObj)) {
		// Skip it if it's no longer there and cancel all Active CSS bubbling.
		_a.StopPropagation(o);
		return false;
	}
	try {
		o.secSelObj.addEventListener(o.actVal, function(e) {}, {capture: true, once: true});	// once = automatically removed after running.
		o.secSelObj[o.actVal]();
	} catch(err) {
		_err('Only DOM events support trigger-real', o);
	}
};
