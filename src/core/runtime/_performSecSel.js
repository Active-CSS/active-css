const _performSecSel = (loopObj) => {
	let {chilsObj, secSelLoops, varScope, evObj } = loopObj;
	let compDoc = loopObj.compDoc || document;
	let loopRef = (!loopObj.loopRef) ? 0 : loopObj.loopRef;

	// In a scoped area, the variable area is always the component variable area itself so that variables used in the component are always available despite
	// where the target selector lives. So the variable scope is never the target scope. This is why this is not in _splitIframeEls and shouldn't be.
	if (supportsShadow && compDoc instanceof ShadowRoot) {
		varScope = '_' + compDoc.host._acssActiveID.replace(/id\-/, '');
	} else if (!compDoc.isSameNode(document) && compDoc.hasAttribute('data-active-scoped')) {
		// This must be a scoped component.
		varScope = '_' + compDoc._acssActiveID.replace(/id\-/, '');
	} else {
		varScope = (evObj.varScope) ? evObj.varScope : null;
	}
	let inheritedScope = compDoc._acssInheritEvDoc;

	// This is currently used for the propagation state, but could be added to for anything else that comes up later.
	// It is empty at first and gets added to when referencing is needed.
	targetEventCounter++;
	taEv[targetEventCounter] = { };

	_performSecSelDo(chilsObj[secSelLoops], loopObj, compDoc, loopRef, varScope, inheritedScope, targetEventCounter, 0);
};
