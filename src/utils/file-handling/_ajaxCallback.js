const _ajaxCallback = (str, o) => {
	// Convert to a str if it be JSON.
	if (typeof str === 'string' && str.trim() !== '') {
		o.res = (o.dataType == 'JSON') ? JSON.parse(str) : str;
		_resolveAjaxVars(o);
		// _ajaxCallbackDisplay(o); is called from _resolveAjaxVars, as it needs to account for the asyncronyousness of the shadow DOM.
	} else {
		o.res = '';
		_setHTMLVars(o, true);	// true for empty string.
		// Commenting out for now - this will be for ajax return feedback.
//		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
//			_debugOutput(o);	//	'', 'ajax' + ((o.preGet) ? '-pre-get' : ''));
//		}
		_ajaxCallbackDisplay(o);
	}
};
