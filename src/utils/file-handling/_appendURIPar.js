const _appendURIPar = (url, pars, doc) => {
	// This function adds parameters to a url. It replaces values if they are different, and adds any that aren't there.
	// This will break in IE and old Edge browsers as it uses the newer URLSearchParams interface.
	// It's pretty basic but does the job. Could probably be optimised further. It is only called when handling certain
	// action commands, so it doesn't touch core performance.
	// Note: This only currently supports one use of the form var append functionality. More than one referenced will barf.
	// To get it working with more than one, strip out all those refs, put in a separate array and handle them individually.
	// FIXME.
	// Is this a full url? If not, make it so.
	var isFullURL = new RegExp('^([a-z]+://|//)', 'i');
	if (url === '' || !isFullURL.test(url)) {
		url = window.top.location.protocol + '//' + window.top.location.host + ((url.substr(0, 1) != '/') ? '/' : '') + url;
	}
	let newUrl = new URL(url);
	let parsArr = pars.split('&'), thisPar, parArr, endBit = '';
	for (thisPar of parsArr) {
		if (thisPar.indexOf('=') !== -1) {
			parArr = thisPar.split('=');
			if (parArr[1]) {
				// Is this a reference to a form ID? If so, we 
				newUrl.searchParams.set(parArr[0], parArr[1]);
			} else {
				newUrl.searchParams.set(parArr[0], '');
			}
		} else {
			if (thisPar.substr(0, 2) == '{#') {
				// This could be a special case where we want to grab all the parameters associated with a form and add them
				// as pars on the url. This can be useful for setting the src in an iframe where values are needed from
				// a form as additional conditions to the src call. Ie. not ajax.
				// Note: With an ajax form, you'd normally use ajax-form or ajax-form-preview and send them as post vars.
				let formID = thisPar.slice(2, -1);
				let el = doc.getElementById(formID);
				if (el.tagName == 'FORM') {
					let formPars = _checkForm(el, 'pars');
					// Call this function again to add the form vars.
					let formedUrl = _appendURIPar(newUrl, formPars, doc);
					newUrl = new URL(formedUrl);
				}	// else silently fail. Maybe the form isn't there any more.
			} else {
				// Remember this clause, we're going to add it on the end. It should be an anchor, which needs to be on the
				// end of the url. Either way it's not a fully formed parameter.
				endBit += thisPar;
			}
		}
	}
	return newUrl + endBit;
};
