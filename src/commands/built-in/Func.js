_a.Func = o => {
	// Parameters are now in pars(), separated by a comma. Change made 2.10.0 to align it more to JS to make it more powerful.
	let str = o.actValSing;
	let funcArr = o.actValSing.split(' ');
	let func = funcArr.shift();
	let parsStr = funcArr.join(' ');

	// Get the parameters.
	if (parsStr.indexOf('pars(') === -1) parsStr = 'pars(' + parsStr + ')';

	let parArr = _extractVarsFromPars(parsStr, o);

	if (!window[func] || typeof window[func] !== 'function') _err('Function ' + func + ' does not exist, is not a function, or is not in the window scope.');
	window[func](o, parArr);
};
