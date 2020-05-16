_a.ToggleClass = o => {
	let str = o.actVal.replace(/\./g, '');
	_toggleClassObj(o.secSelObj, str);
};
