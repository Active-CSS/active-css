const _sendMessage = (obj, typ, where, orderNum='') => {
	// This is either a string or an object.
	let str;
	if (typeof obj == 'object') {
		// Need to copy the object otherwise we end up overwrite the event object below, which we don't want.
		let newObj = _clone(obj);
		if (newObj.e) newObj.e = '';	// We get an invocation error on trying to send a cloned event. Don't send it to the extensions. We could send a smaller version if and when it is needed...
		if (newObj.doc) newObj.doc = '';				// Causes circular reference error.
		if (newObj.compDoc) newObj.compDoc = '';		// Just to be safe - we don't need it.
		if (newObj.obj) newObj.obj = '';				// Just to be safe - we don't need it.
		if (newObj.secSelObj) newObj.secSelObj = '';	// Just to be safe - we don't need it.
		str = JSON.stringify(newObj);
	} else {
		str = obj;
	}
	if (!setupEnded) {
		// Active CSS setup has not yet finished and DevTools has not yet handshook with the core.
		// Put the message into a queue. It will get sent when DevTools does the handshake.
		debuggerCo++;
		devtoolsInit.push([ str, typ, debuggerCo ]);
		return;
	}
	if (typ == 'debugOutput') {
		// Internal tracker so panel.js can put them in order before displaying when they arrive, as they don't arrive in sequence.
		if (!orderNum) {	// Note: If a number is already set, that means we have come from the init routine and a number is already set.
			debuggerCo++;
			orderNum = debuggerCo;
		}
	}
	window.postMessage({
		message: str,
		messageType: typ,
		orderNo: orderNum,
		whereTo: where,
		source: 'causejs-devtools-extension'
	}, '*');
};
