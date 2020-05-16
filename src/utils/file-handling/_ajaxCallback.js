const _ajaxCallback = (str, o) => {
	// Convert to a str if it be JSON.
	if (typeof str === 'string' && str.trim() !== '') {
		o.res = (o.dataType == 'JSON') ? JSON.parse(str) : str;
		_resolveAjaxVars(o);
	} else {
		o.res = '';
		// Commenting out for now - this will be for ajax return feedback.
//		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
//			_debugOutput(o);	//	'', 'ajax' + ((o.preGet) ? '-pre-get' : ''));
//		}
	}
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
