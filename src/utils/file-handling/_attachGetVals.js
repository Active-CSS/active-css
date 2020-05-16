const _attachGetVals = (str, url, doc, typ) => {
	let pars = _getParVal(str, typ);
	if (pars) {
		url = _appendURIPar(url, pars, doc);
	}
	return url;
};
