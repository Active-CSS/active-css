const _trigHashState = (e) => {
	// Either there isn't anything to run yet or it's not ready to run now.
	if (hashEventAjaxDelay || !hashEventTrigger) return;
	hashEventTrigger = false;

	let n, el, eventsLen = hashEvents.length, runEvents = [];
	for (n = 0; n < eventsLen; n++) {
		let str = hashEvents[n].substr(hashEvents[n].indexOf('=') + 1).trim()._ACSSRepQuo();
		let lastPos = str.lastIndexOf(':');
		let sel = str.substr(0, lastPos).trim();
		let ev = str.substr(lastPos + 1).trim();

		// Put all these details into an array to iterate in one bash.
		// This should avoid any subsequent race conditions when hitting the event triggers as potentially anything could happen.
		runEvents.push({ sel, ev });
	}

	// Wipe any outstanding global hash events.
	hashEvents = [];

	// Iterate the stored triggers. The runEvents array is locally immutable here so won't be affected by actions happening during any triggers.
	for (n = 0; n < eventsLen; n++) {
		// Currently this will only work if the hash trigger is in the document scope.
		// This could be upgraded later but is a little involved due to component uniqueness.
		el = document.querySelector(runEvents[n].sel);
		if (el && runEvents[n].ev != '') {
			ActiveCSS.trigger(el, runEvents[n].ev, null, document, null, null, e);
		} else {
			// Try it at the end of the stack as it could be waiting for something to render.
			let trySel = runEvents[n];
			setTimeout(function() {		// jshint ignore:line
				el = document.querySelector(trySel.sel);
				ActiveCSS.trigger(el, trySel.ev, null, document, null, null, e);
			}, 0);
		}
	}
};
