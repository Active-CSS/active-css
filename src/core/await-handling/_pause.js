const _pause = (o, tim) => {
	_setResumeObj(o);
	let restartObj = _clone(o);
	let activeID = _getActiveID(restartObj.secSelObj);
	let subEvCo = restartObj._subEvCo;
	if (!pauseTrack[activeID]) pauseTrack[activeID] = {};
	pauseTrack[activeID][subEvCo] = true;
	setTimeout(() => {
		o = null;
		// If pause has not been cancelled, restart the event queue.
		if (pauseTrack[activeID] && pauseTrack[activeID][subEvCo]) {
			delete pauseTrack[activeID][subEvCo];
			_syncRestart(restartObj, subEvCo);
		}
		restartObj = null;
		return;
	}, tim);
};
