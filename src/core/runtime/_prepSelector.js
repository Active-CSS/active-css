const _prepSelector = (sel, obj) => {
	// This is currently only being used for secondary selectors, as action command use of "&" needs more nailing down before implementing - see roadmap.
	if (sel.indexOf('&') !== -1) {
		// Handle any "&" in the selector.
		// Eg. "& div" becomes "[data-activeid=25] div".
		if (sel.substr(0, 1) == '&') {
			// Substitute the active ID into the selector.
			let activeID = _getActiveID(obj);
			sel = sel.replace(/&/g, '[data-activeid=' + activeID + ']');
		}
	}
	return sel;
};
