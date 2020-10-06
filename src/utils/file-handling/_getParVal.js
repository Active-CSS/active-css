const _getParVal = (str, typ) => {
	if (str.indexOf(typ + '(') !== -1) {
		let reg = new RegExp(typ + '\\(([^)]*)\\)', 'g');
		let pars = reg.exec(str) || '';
		if (pars) {
			return pars[1];
		}
	}
	return '';
};
