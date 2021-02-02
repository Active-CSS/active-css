const _handleClickOutside = (el, e) => {
	// Does this element pass the click outside test?
	// Iterate the click outside selectors from the config.
	let cid, clickOutsideObj;
	for (cid in clickOutsideSels) {
		// Check the state of the clickoutside for this container. Will be true if active.
		if (clickOutsideSels[cid][0]) {
			// Does this clicked object exist in the clickoutside main element?
			clickOutsideObj = idMap[cid];
			if (clickOutsideObj && !clickOutsideObj.contains(el)) {
				// This is outside.
				// Get the component, scope, etc. for this element if there is component.
				let compDetails = _componentDetails(clickOutsideObj);
				if (_handleEvents({ obj: clickOutsideObj, evType: 'clickoutside', eve: e, component: compDetails.component, compDoc: compDetails.compDoc, varScope: compDetails.varScope, evScope: compDetails.evScope, otherObj: el })) {	// clickoutside sends the target also.
					if (!clickOutsideSels[cid][1]) {
						// This is a blocking click outside, so cancel any further actions.
						return false;
					}
				}
			}
		}
	}
	return true;
};
