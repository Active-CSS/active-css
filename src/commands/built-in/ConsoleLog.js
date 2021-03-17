_a.ConsoleLog = o => {
	let wot;
	if (o.actVal == 'target') {
		wot = o;
	} else if (o.actVal == 'variables') {
		wot = scopedProxy;
	} else {
		wot = o.actVal._ACSSRepQuo();
	}
	console.log(wot);
};
