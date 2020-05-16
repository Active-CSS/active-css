_a.Eval = o => {
	// Run JavaScript dynamically in the global window scope. This is straight-up JavaScript that runs globally.
	let evalContent = ActiveCSS._sortOutFlowEscapeChars(o.actVal.trim().slice(2, -2));
	eval(evalContent);		// jshint ignore:line
};
