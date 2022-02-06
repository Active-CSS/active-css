/**
 * The callback function after an XHR request returning 200 ok.
 *
 * Called by:
 *	_ajaxDo()
 *
 * Side-effects:
 *	Calls a function to resolve ajax response variables
 *	Calls a function to setup HTML variables for the core
 *	Calls the XHR error callback function if the JSON response cannot be parsed
 *	Calls the callback display function on success
 *	Adjusts the action flow object by changing the .res property
 *
 * @private
 * @param {String} str: The response string
 * @param {Object} o: Action flow object
 *
 * @returns nothing
 */
 const _ajaxCallback = (str, o) => {
	// Convert to a str if it be JSON.
	if (typeof str === 'string' && str.trim() !== '') {
		try {
			o.res = (o.dataType == 'JSON') ? JSON.parse(str) : str;
			_resolveAjaxVars(o);
		} catch(err) {
			// If there's an error here, it's probably because the response from the server was 200 ok but JSON.parse failed.
			_ajaxCallbackErr(str, '', o);
		}
		// _ajaxCallbackDisplay(o); is called from _resolveAjaxVars, as it needs to account for the asyncronyousness of the shadow DOM.
	} else {
		o.res = '';
		if (!o.renderComp) {
			_setHTMLVars(o, true);	// true for empty string.
		}
		// Commenting out for now - this will be for ajax return feedback.
//		if (debuggerActive || !setupEnded && typeof _debugOutput == 'function') {
//			_debugOutput(o);	//	'', 'ajax' + ((o.preGet) ? '-pre-get' : ''));
//		}
		_ajaxCallbackDisplay(o);
	}
};
