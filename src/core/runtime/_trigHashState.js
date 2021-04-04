const _trigHashState = (e) => {
	// Either there isn't anything to run yet or it's not ready to run now.
	if (hashEventAjaxDelay || !hashEventTrigger) return;

	let str = hashEventTrigger.substr(hashEventTrigger.indexOf('=') + 1).trim()._ACSSRepQuo();
	hashEventTrigger = false;
	let lastPos = str.lastIndexOf(':');
	let sel = str.substr(0, lastPos).trim();
	let ev = str.substr(lastPos + 1).trim();

	// Currently this will only work if the hash trigger is in the document scope.
	// This could be upgraded later but is a little involved due to component uniqueness.
	let el = document.querySelector(sel);
	if (el && ev != '') {
		ActiveCSS.trigger(el, ev, null, document, null, null, e);
	}
};
