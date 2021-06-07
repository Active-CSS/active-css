const _setupLabelData = (lab, del, func, pos, intID, loopRef, _subEvCo, tid) => {
	delayArr[del][func][pos][intID][loopRef] = tid;
	delaySync[tid] = _subEvCo;
	if (lab) {
		labelData[lab] = { del, func, pos, intID, loopRef, tid };
		// We don't want to be loop or sorting for performance reasons, so we'll just create a new array to keep track of the data we need for later.
		labelByIDs[tid] = { del, func, pos, intID, loopRef, lab };
	}
};
