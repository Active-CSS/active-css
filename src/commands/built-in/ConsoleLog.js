_a.ConsoleLog = o => {
	let typeDesc = o.actVal._ACSSCapitalize() + ':';
	switch (o.actVal) {
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
	// If it gets this far, send comma-delimited results to console.log().
	// Do necessary escaping before splitting by comma.

//console.log('_a.ConsoleLog, o.actVal:', o.actVal);

	let escapedCommas = _escCommaBrack(o.actVal, o);

//console.log('_a.ConsoleLog, escapedCommas:', escapedCommas);

	console.log(escapedCommas);

//	let wot = o.actVal._ACSSRepQuo();
//	// Split by comma.
//	let args = o.actVal.split(/\s*,\s*/);
//	// Iterate array and replace with real values for the content.
//	// Send result array to console.log.
//	console.log.apply(console, args);
};
