const _pause = (o, tim) => {
	_setResumeObj(o);
	let restartObj = _clone(o);
	setTimeout(() => {
		o = null;
		_syncRestart(restartObj, restartObj._subEvCo);
		restartObj = null;
		return;
	}, tim);
};
