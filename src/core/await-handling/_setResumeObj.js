const _setResumeObj = (o, targEvery) => {
	syncQueue[o._subEvCo] = {
		ref_subEvCo: o._subEvCo,
		intID: o.intID,
		secSelObj: o.secSelObj,
		loopRef: o.loopRef,
		targEvIntID: o.targEvIntID,
		targEvery,
	};
};
