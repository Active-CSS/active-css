const _setResumeObj = o => {
	syncQueue[o._subEvCo] = {
		ref_subEvCo: o._subEvCo,
		intID: o.intID,
		secSelObj: o.secSelObj,
		loopRef: o.loopRef
	};
};
