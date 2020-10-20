_a.ClickoutsideEvent = o => {
	let cid = _getActiveID(o.secSelObj);
	if (o.actVal.indexOf('true') !== -1) {
		clickOutsideSels[cid] = [];
		clickOutsideSels[cid][0] = true;
		clickOutsideSet = true;
		if (o.actVal.indexOf('continue') !== -1) {
			clickOutsideSels[cid][1] = true;
		}
	} else {
		if (clickOutsideSels[cid]) {
			clickOutsideSels[cid][0] = false;
			clickOutsideSet = false;
		}
	}
};
