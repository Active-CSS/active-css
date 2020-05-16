const _attachPostVals = (str, urlBit) => {
	let pars = _getParVal(str, 'post-pars');
	if (pars) {
		urlBit += '&' + pars;
	}
	return urlBit;
};
