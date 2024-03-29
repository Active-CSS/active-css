const _extractVarsFromPars = (str, o) => {
	let parArr = [], par, finalPar;
	let res = _extractBracketPars(str, [ 'pars' ], o);
	if (res.pars) {
		let pars = res.pars;
		// Escape commas in quotes.
		pars = _escInQuo(pars, ',', '__ACSSFComma');
		// Split by comma.
		let parSplit = pars.split(',');
		// Iterate and handle each parameter so it passes into the func as it should.
		for (par of parSplit) {
			// Remove any starting and ending {= =} now that they have gotten this far, and unescape comma.
			par = par.replace(/__ACSSFComma/g, ',').replace(/^\{\=|\=\}$/g, '');
			finalPar = _evalVarString(par.trim(), o, true);
			parArr.push(finalPar);
		}
	}
	return parArr;
};
