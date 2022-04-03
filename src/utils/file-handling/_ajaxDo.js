const _ajaxDo = o => {
	if (o.preGet && preGetMid) {
		// This is a pre-get and there is least one pre-get file being loaded. Is there a pre-get max threshold?
		// Default preGetMax to 2 files allowed to be being loaded at once.
		let maxSet = _getParVal(o.actVal, 'max');
		preGetMax = (maxSet != '') ? maxSet : 6;	// Default to 6 maximum concurrent ajax requests.
		if (preGetMid == preGetMax) return;	// Skip this pre-get - there is a threshold set.
	}
	// Sort out the extra vars and grab the contents of the url.
	let aVRes = _extractBracketPars(o.actVal, [ 'header' ], o);
	if (aVRes.header) {
		// _extractBracketPars brings back a string or an array based on how many header pars there are. We always need an array for the logic to handle header().
		if (typeof aVRes.header == 'string') aVRes.header = [ aVRes.header ];
		// Convert inner string to formatted headers array.
		o.xhrHeaders = [];
		const trimHeadVals = str => {
			// Make this generic if same sort of thing needed again.
			return str.trim()._ACSSRepQuo().replace(/_ACSS_comma/g, ',');
		};
		let oToUseForVars = (o && o.renderObj) ? o.renderObj.renderO : o;
		for (const headerStr of aVRes.header) {
			let newHeaderStr = _escInQuo(headerStr, ',', '_ACSS_comma');
			let arr = newHeaderStr.split(',');
			o.xhrHeaders.push({ key: _basicOVarEval(trimHeadVals(arr[0]), oToUseForVars), val: _basicOVarEval(trimHeadVals(arr[1]), oToUseForVars) });
		}
	}
	let ajaxArr = aVRes.action.split(' ');
	o.formMethod = _optDef(ajaxArr, 'get', 'GET', 'POST');
	o.dataType = _optDef(ajaxArr, 'html', 'HTML', 'JSON');
	o.cache = _optDef(ajaxArr, 'cache', true, false);
	o.nocache = _optDef(ajaxArr, 'nocache', true, false);
	o.csrf = _optDef(ajaxArr, 'csrf', true, false);
	let intVars = (o.nocache ? '_=' + Date.now() + '&' : '') + '_ACSS=1' + (o.formPreview ? '&_ACSSFORMPREVIEW=1' : '') + (o.formSubmit ? '&_ACSSFORMSUBMIT=1' : '') + '&_ACSSTYPE=' + o.dataType;
	o.pars = intVars;
	let url = o.url;
	if (o.preGet && url === '') return;	// Don't try to pre-get empty values. It's ok for a regular ajax call.
	if (o.formSubmit) {
		// Send the form.
		o.pars += '&' + _checkForm(o.secSelObj, 'pars');
	}
	if (o.formMethod == 'GET') {
		url = _appendURIPar(url, o.pars, o.doc);
	}
	// Send any extra parameters if they are defined as GET vars, like pars(drawn=y).
	// This can be used when not referenced in setting the url as part of the url-change.
	o.hash = '';
	let hashPos = url.indexOf('#');
	if (hashPos !== -1) {
		o.hash = url.substr(hashPos + 1);
		url = url.substr(0, hashPos);
	}
	url = _attachGetVals(o.actVal, url, o.doc, 'get-pars');
	o.pars = _attachPostVals(o.actVal, o.pars);
	o.finalURL = (o.formMethod == 'GET') ? url : _appendURIPar(url, o.pars, o.doc);	// Need the unique url including post vars to store for the caching.

	// If there is a hash due to run at the end of this event loop, delay it until the afterAjax-type command.
	if (hashEventTrigger) hashEventAjaxDelay = true;

	if (ajaxResLocations[o.finalURL]) {
		// No need to get it - we have it in cache.
		if (!o.preGet) {
			// Display it. Copy the result from the cached object over to the primary selector.
			o.res = ajaxResLocations[o.finalURL];
			_resolveAjaxVars(o);
		}
	} else {
		if (o.preGet) {
			if (preGetting[o.finalURL]) return;	// Already in the process of getting - skip. Note: skip race condition handling - pre-get is a nicety.
			preGetting[o.finalURL] = true;
		}
		_ajax(o.formMethod, o.dataType, url, o.pars, _ajaxCallback.bind(this), _ajaxCallbackErr.bind(this), o);
	}
};
