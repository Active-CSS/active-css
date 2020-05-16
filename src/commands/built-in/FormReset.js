_a.FormReset = o => {
	let el = _getSel(o, o.actVal);
	if (el && el.tagName == 'FORM') el.reset();
};
