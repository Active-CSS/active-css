_a.ConsoleLog = o => {
	let wot;
	if (o.actVal == 'target') {
		wot = o;
	} else if (o.actVal == 'variables') {
		wot = scopedProxy;
	} else if (o.actVal == 'conditionals') {
		wot = conditionals;
	} else if (o.actVal == 'config') {
		wot = config;
	} else if (o.actVal == 'components') {
		wot = components;
	} else {
		wot = o.actVal._ACSSRepQuo();
		console.log(wot);
		return;
	}
	console.log(o.actVal._ACSSCapitalize() + ':', wot);
};
