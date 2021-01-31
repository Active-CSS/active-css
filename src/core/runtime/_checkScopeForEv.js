const _checkScopeForEv = (evScope) => {
	let parentComponentDetails = compParents[evScope];
	if (parentComponentDetails && parentComponentDetails.evScope && parentComponentDetails.evScope != evScope) {
		// Events need to run in the component context they are in. Hence these do need to be set per selector check.
		return {
			compDoc: parentComponentDetails.compDoc,
			topVarScope: parentComponentDetails.varScope,
			evScope: parentComponentDetails.evScope,
			component: ((parentComponentDetails.component) ? '|' + parentComponentDetails.component : null),
			strictPrivateEvs: parentComponentDetails.strictPrivateEvs,
			privateEvs: parentComponentDetails.privateEvs
		};
	}
	return false;
};
