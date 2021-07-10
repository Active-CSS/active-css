const _immediateStop = o => {
	// Stop event flow here. Used in pause/await functionality for breaking out of commands at the start of the timeout.
	// It also performs everything that is needed for the command "exit;" to work, as it effectively stops further all event flow actions.
	if (typeof imSt[o._imStCo] !== 'undefined') imSt[o._imStCo]._acssImmediateStop = true;
	_stopImmediateEventPropagation(o);	// Also calls _stopEventPropagation().
};
