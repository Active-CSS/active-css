const _setupMediaQueryHandler = str => {
	// Eg. str = '(orientation: portrait)', 
	// Note: We need the calling object in order to get the correct window for the media query check.

	// This is how we are going to handle media queries.
	// 1. When the config is read, we set up event listeners which will run a function when they change.
	// 2. When they change, we run that function and set the true/false variable of the internal media query reference to true or false. We only do this once.
	// 3. When the media query conditional statement executes, it just reads the property of the true/false variable. That way we can handle many many
	// media queries with no performance impact.
	// 4. Note: media query setups should only work in the content window they relate to, so this only needs window, not contentWindow. The reason being that
	// in css, media queries only relate to the window they are defined in. We could do a cross-iframe push of data up and down for info purposes, but don't
	// worry about that for the moment - sounds well dodgy.

	str = str.trim();
	let medQName = mediaQueriesOrig[str];
	if (typeof medQName !== 'undefined') {
		if (typeof conditionals[medQName] === 'undefined') {
			conditionals[medQName] = [];
			conditionals[medQName].push({ 'name': 'mql-true', 'value': medQName });
		}
		return medQName;	// Return the name of the already existing media query.
	}
	// It doesn't already exist, set up new references and the media query event listener.
	// Set up name of media query in an array for quick referencing later. It will store the current state of the media query.
	let leng = mediaQueries.length + 1;
	let mqlName = '__mql_' + leng;
	// Set up an array element with the media query referencing the name of the variable that will store the current value of the media query.
	// We do this so we don't have to keep running matches each time. It will just return a boolean from the array in real time.
	// We won't have the name of the internal reference used in the selector, and we will need this each time the event listener happens, so create a reference.
	mediaQueriesOrig[str] = mqlName;
	// Set up the conditional statement in the config.
	conditionals[mqlName] = [];
	conditionals[mqlName].push({ 'name': 'mql-true', 'value': mqlName });
	// Set up the variable which stores the event listener and state of the resulting media query.
	let ev = window.matchMedia(str);
	let matches = ev.matches;
	mediaQueries.push(mqlName);
	mediaQueries[mqlName] = { 'ev': ev, 'val': matches };
	// Set initial value.
	// Set up the event listener and function.
	mediaQueries[mqlName].ev.addListener(function(e) {
		// When the media query state changes, set the internal pointer to true or false.
		let mqlName = mediaQueriesOrig[e.media];
		mediaQueries[mqlName].val = e.matches;
	});
	// Return the name of the media query reference to place into the primary selector.
	return mqlName;
};
