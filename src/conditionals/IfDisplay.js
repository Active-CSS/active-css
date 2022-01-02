_c.IfDisplay = o => {
	let el = _getSel(o, o.actVal);
	return (el && getComputedStyle(el, null).display !== 'none');
};
