const _getSel = (o, sel, many=false) => {
	let res = _getSelector(o, sel, many);
	return res.obj || false;
};
