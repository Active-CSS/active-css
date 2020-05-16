_a.ClickoutsideEvent = o => {
	let cid = _getActiveID(o.secSelObj);
	if (o.actVal.indexOf('true') !== -1) {
		// Put a delay on this in case someone is staggering more than one. The false should be unset first always, followed
		// by the one being set. We do this for speed, so we don't have to iterate the states.
		setTimeout(function() {
			clickOutsideSels[cid] = [];
			clickOutsideSels[cid][0] = true;
			clickOutsideSet = true;
			if (o.actVal.indexOf('continue') !== -1) {
				clickOutsideSels[cid][1] = true;
			}
		}, 50);
	} else {
		if (clickOutsideSels[cid]) {
			clickOutsideSels[cid][0] = false;
			clickOutsideSet = false;
		}
	}
};
