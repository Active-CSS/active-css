const _setACSSVariable = o => {
	// Convert into regular var command format.
	let oldFunc = o.func;
	let oldActValSing = o.actValSing;
	o.func = 'Var';
	o.actValSing = (oldFunc + ' ' + o.actValSing).trim();
	_a.Var(o);
	// Watch there are no timers in var assignment flow or this next bit will break things. There shouldn't ever be anyway, for speed reasons.
	o.func = oldFunc;
	o.actValSing = oldActValSing;
};
