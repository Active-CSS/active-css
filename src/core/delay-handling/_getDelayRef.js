const _getDelayRef = o => {
	let delayRef;
	if (typeof o.secSel === 'string' && ['~', '|'].includes(o.secSel.substr(0, 1))) {
		delayRef = (o.evScope ? o.evScope : 'doc') + o.secSel;
	} else {
		delayRef = _getActiveID(o.secSelObj);
	}
	return delayRef;
};
