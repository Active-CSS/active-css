const _deleteIDVars = activeID => {
	delete clickOutsideSels[activeID];
	delete idMap[activeID];
	delete varInStyleMap[activeID];
	delete elObserveTrack[activeID];
	delete pauseTrack[activeID];
};
