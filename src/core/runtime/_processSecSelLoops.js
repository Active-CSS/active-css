const _processSecSelLoops = (loopObj) => {
	// Strip off any preceding component that might be there.
	let newloop = loopObj.secSelLoops.replace(loopObj.component + '|||', '');
	if (newloop.substr(0, 6) == '@each ') {
		// Just replace the value for now - we're going to tackle nested loops later on.
		loopObj.secSelLoops = newloop;
		// Nested loops are not currently supported.
		_handleLoop(loopObj);
	} else {
		// Go straight into the actions - no loops here.
		_performSecSel(loopObj);
	}
};
