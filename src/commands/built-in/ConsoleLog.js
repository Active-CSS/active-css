_a.ConsoleLog = o => {
	let str = o.actValSing;
	let typeDesc = str._ACSSCapitalize() + ':';
	switch (str) {
		case 'target':
			console.log(typeDesc, o);
			return;
		case 'variables':
			console.log(typeDesc, scopedOrig);
			return;
		case 'conditionals':
			console.log(typeDesc, conditionals);
			return;
		case 'config':
			console.log(typeDesc, config);
			return;
		case 'components':
			console.log(typeDesc, components);
			return;
		case 'trace':
			console.trace();
			return;
	}

	// If there isn't a pars clause, set one up so that the results can be evaluated before being output to the console log.
	let parsStr = (str.indexOf('pars(') !== -1) ? str : 'pars(' + str + ')';

	// Get the parameters and send the resultant array to the console log.
	console.log.apply(null, _extractVarsFromPars(parsStr, o));
};
