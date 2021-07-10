_a.Continue = o => {
	let continuePar = o.actVal.trim();
	if (/\d+/.test(continuePar)) {
		_continue['i' + o._imStCo] = continuePar.trim();
	} else {
		_err('Invalid continue parameter: "' + o.actVal + '"', o);
	}
};
