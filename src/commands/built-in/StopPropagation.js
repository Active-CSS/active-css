_a.StopPropagation = o => {
	// Don't bubble up the Active CSS element hierarchy and stop propagation in the browser too.
	if (o.e) o.e.stopPropagation();
	_a.StopEventPropagation(o);
};
