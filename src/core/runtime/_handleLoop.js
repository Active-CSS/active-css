const _handleLoop = (loopObj) => {
	// Which type of loop is it?
	// This is here for when we start adding different types of loops. For now we don't need the check.
	if (loopObj.originalLoops.substr(0, 6) == '@each ') {
		_handleEach(loopObj);
	}
};
