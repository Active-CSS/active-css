_a.Break = o => {
	let breakPar = o.actVal.trim();
	if (/\d+/.test(breakPar)) {
		_break['i' + o._imStCo] = breakPar.trim();
	} else {
		_err('Invalid break parameter', o);
	}
};
