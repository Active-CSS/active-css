_a.TriggerReal = o => {
	// Simulate a real event, not just a programmatical one.
	if (!o.secSelObj.isConnected) {
		// Skip it if it's no longer there and cancel all Active CSS bubbling.
		_a.StopPropagation(o);
		return;
	}
	try {
		o.secSelObj.addEventListener(o.actVal, function(e) {}, {capture: true, once: true});	// once = automatically removed after running.
		o.secSelObj[o.actVal]();
	} catch(err) {
		console.log('Active CSS error: Only DOM events support trigger-real.');
	}
};
