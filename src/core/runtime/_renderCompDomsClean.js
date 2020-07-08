const _renderCompDomsClean = compRef => {
	delete compPending[compRef];
	// Clean up any shadow DOMs no longer there. Mutation observer doesn't seem to work on shadow DOM nodes. Fix if this is not the case.
	let shadTmp, shadObj;
	for ([shadTmp, shadObj] of Object.entries(shadowDoms)) {
		if (!shadObj.isConnected) {
			// Delete any variables scoped to this shadow. This will also trigger the deletion of the shadow from the shadowDoms object in _varUpdateDom.
			delete scopedVars[shadTmp];
		}
	}
};
