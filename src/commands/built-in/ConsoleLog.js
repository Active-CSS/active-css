_a.ConsoleLog = o => {
	if (o.actVal == 'target') {	// mainly here for core debugging purposes.
		console.log(o);
	} else {
		console.log(o.actVal._ACSSRepQuo());
	}
};
