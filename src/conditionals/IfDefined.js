_c.IfDefined = o => {
	let scoped = _getScopedVar(o.actVal, o.varScope);
	return (typeof scoped.val !== 'undefined');
};
