_a.StopImmediatePropagation = o => {
	// Don't bubble up the Active CSS element hierarchy and do any more target selectors and stop propagation in the browser too.
	if (o.e) o.e.stopImmediatePropagation();
	_a.StopImmediateEventPropagation(o);
};
