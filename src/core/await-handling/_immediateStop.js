const _immediateStop = o => {
	// Stop event flow here. Used in pause/await functionality for breaking out of commands at the start of the timeout.
	if (typeof imSt[o._imStCo] !== 'undefined') imSt[o._imStCo]._acssImmediateStop = true;
	_stopImmediateEventPropagation(o);	// Also calls _stopEventPropagation().
};
