_a.Eval = o => {
	// Run JavaScript dynamically in the global window scope. This is straight-up JavaScript that runs globally.
	let evalContent = o.actVal.slice(2, -2);
	eval(evalContent);		// jshint ignore:line
};
