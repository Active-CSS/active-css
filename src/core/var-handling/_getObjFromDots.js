const _getObjFromDots = (obj, i) => {
	if (typeof obj[i] === 'undefined') {	// could be empty, which is fine.
		// Display sane error for debugging. Not sure what level of debug this should go in, so leave it for now.
		// Var may not be there though, which could be totally valid.
		return '';
	}
	return obj[i];
};
