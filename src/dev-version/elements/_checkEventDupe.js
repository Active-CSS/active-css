ActiveCSS._checkEventDupe = (primSel, condList, ev) => {
	// Check the main config for a duplicate primSel, condList and event. Return 0 if no matching event, 1 if matching event and an element can be inspected,
	// 2 if matching event but no matching element.
	// Just return true or false to test. We can return different strings depending on whether there is an object there that can be inspected if that is better.
	if (config[primSel] && config[primSel][ev] && config[primSel][ev][(condList ? condList : 0)]) {
		// This item exists in the config.
		// Find the first element that matches the selector.
		try {
			// Don't like using try/catch, but there isn't a one-line way of checking for a valid selector without getting a syntax error.
			let obj = document.querySelector(primSel);
			if (obj) {
				// Element found that can be inspected.
				return 1;
			} else {
				// No element available for inspection.
				return 2;
			}
		} catch(err) {
			console.log(primSel + ' is not a valid selector (4).');
			return 2;
		}
	} else {
		// This item does not exist in the config.
		return 0;
	}
};
