_a.SetClass = o => {
	let str = o.actVal.replace(/\./g, '')._ACSSRepQuo();
	_setClassObj(o.secSelObj, str);
};
