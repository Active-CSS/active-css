_a.StopImmediateEventPropagation = o => {
	// Don't bubble up the Active CSS component event hierarchy and don't run any more events for this current element also.
	if (typeof o.obj == 'object') o.obj.activeStopEvProp = true;
};
