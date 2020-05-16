const _actionValLoop = (oCopy, pars, obj, runButElNotThere) => {
	let i, { loopI, actVals, actValsLen } = pars;
	for (i = 0; i < actValsLen; i++) {
		// Loop over the comma-delimited actions.
		oCopy.actVal = actVals[i].trim();	// Put the original back.
		oCopy.actPos = i;	// i or label (not yet built).
		oCopy.secSelObj = obj;
		_handleFunc(oCopy, null, runButElNotThere);
	}
};
