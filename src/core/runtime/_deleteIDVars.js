const _deleteIDVars = activeID => {
	clickOutsideSels.splice(clickOutsideSels.indexOf(activeID), 1);
	idMap.splice(idMap.indexOf(activeID), 1);
	varInStyleMap.splice(varInStyleMap.indexOf(activeID), 1);
};
