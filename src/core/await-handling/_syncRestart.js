const _syncRestart = (o, resumeID) => {
	if (_isSyncQueueSet(resumeID)) {
		let loopObjCopy = _clone(o.origLoopObj);
		let thisQueue = _clone(syncQueue[o._subEvCo]);
		loopObjCopy.origLoopObj = loopObjCopy;
		loopObjCopy.origLoopObj.resume = true;
		loopObjCopy.origLoopObj.resumeProps = thisQueue;

		// Re-run the events. It needs a setTimeout in order to clear the memory stack on the way back up the event flow.
		// It also serves a purpose in keeping simultaneous actions happening at roughly the same time.

		clearTimeout(pauseCleanTimers[o._subEvCo]);

		setTimeout(_performEvent(loopObjCopy), 0);
	}
};
