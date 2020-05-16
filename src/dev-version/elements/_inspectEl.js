ActiveCSS._inspectEl = primSel => {
	try {
    	// Don't like using try/catch, but there isn't a one-line way of checking for a valid selector without getting a syntax error.
		let el = document.querySelector(primSel);
		inspect(el);
	} catch(err) {
		console.log(primSel + ' is not a valid selector (3).');
	}
};
