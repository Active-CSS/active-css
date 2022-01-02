_a.Remove = o => {
	let objs = _getSels(o, o.actVal);
	if (!objs) return false;	// invalid target.
	objs.forEach(function (obj) {
		ActiveCSS._removeObj(obj);
	});
};
