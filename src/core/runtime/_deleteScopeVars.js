const _deleteScopeVars = varScope => {
	let i, scopePref = varScope + '.', scopeNum = varScope.substr(1);
	delete scopedProxy[varScope];
	delete scopedData[varScope];
	for (i in scopedData) {
		if (i.startsWith('i' + scopeNum + 'HOST')) {
			delete scopedData[i];
		}
	}
	delete actualDoms[varScope];
	delete compPending[varScope];
	delete compParents[varScope];
	delete compPrivEvs[varScope];
	delete privVarScopes[varScope];
	delete strictCompPrivEvs[varScope];
	delete strictPrivVarScopes[varScope];
	for (i in varMap) {
		if (i.startsWith(scopePref)) {
			delete varMap[i];
		}
	}
	delete varStyleMap[varScope];
};
