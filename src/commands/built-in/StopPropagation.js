_a.StopPropagation = o => {
	// Don't bubble up Active CSS events and stop propagation in the browser too.
	if (o.e) o.e.stopPropagation();
	if (typeof o.obj == 'object') o.obj.activeStopProp = true;
};
