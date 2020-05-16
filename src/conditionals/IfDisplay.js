_c.IfDisplay = o => {
	let el = o.doc.querySelector(o.actVal);
	return (el && getComputedStyle(el, null).display !== 'none') ? true : false;
};
