_a.Func = o => {
	let pars = [];

	// Convert all spaces within double quotes to something else before the split.
	o.actVal = o.actVal._ACSSSpaceQuoIn();

	let spl = o.actVal.trim().split(' ');
	let func = spl.splice(0, 1);
	if (typeof window[func] !== 'function') {
		console.log(func + ' is not a function.');
	} else {
		// Iterate parameters loop. Convert true and false values to actual booleans. Put into the pars array and send to function.
		let par;
		for (par of spl) {
			if (par == 'true') {
				par = true;
			} else if (par == 'false') {
				par = false;
			} else if (!isNaN(par)) {	// Is this not a non-valid number. Or is this a valid number. Same thing.
				// Convert to a real number.
				par = parseFloat(par);
			} else {
				// Unconvert all spaces within double quotes back to what they were. Remove any surrounding double quotes, as it will go as a string anyway.
				par = par._ACSSSpaceQuoOut()._ACSSRepQuo();
			}
			pars.push(par);
		}
		window[func](o, pars);
	}
};
