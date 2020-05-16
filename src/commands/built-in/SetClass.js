_a.SetClass = o => {
	let str = o.actVal.replace(/\./g, '');
	_setClassObj(o.secSelObj, str);
};
