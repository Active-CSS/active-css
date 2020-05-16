const _setupLabelData = (lab, del, func, pos, loopRef, tid) => {
	delayArr[del][func][pos][loopRef] = tid;
	if (lab) {
		labelData[lab] = { del, func, pos, loopRef, tid };
		// We don't want to be loop or sorting for performance reasons, so we'll just create a new array to keep track of the data we need for later.
		// Note this ES6 syntax is equivalent to del: del, etc.
		labelByIDs[tid] = { del, func, pos, loopRef, lab };
	}
};
