const _pause = (o, tim) => {
	_setResumeObj(o);
	let restartObj = _clone(o);
	pauseTrack._tgResPos = true;
	setTimeout(() => {
		o = null;
		// If pause has not been cancelled, restart the event queue.
		if (pauseTrack._tgResPos) {
			delete pauseTrack._tgResPos;
			_syncRestart(restartObj, restartObj._subEvCo);
		}
		restartObj = null;
		return;
	}, tim);
};
