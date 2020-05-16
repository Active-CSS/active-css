_a.StopImmediatePropagation = o => {
	// Don't bubble up Active CSS events and stop propagation in the browser too.
	if (o.e) o.e.stopImmediatePropagation();
	o.obj.activeStopProp = true;
};
