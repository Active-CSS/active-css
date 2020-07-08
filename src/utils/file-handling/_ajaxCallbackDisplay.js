const _ajaxCallbackDisplay = (o) => {
	if (!o.error && o.preGet) {
		// Store it for later.
		ajaxResLocations[o.finalURL] = o.res;
	} else {
		// Run the post event - success or failure.
		_ajaxDisplay(o);
		if (!o.error && o.cache) {
			ajaxResLocations[o.finalURL] = o.res;
		}
	}
};
