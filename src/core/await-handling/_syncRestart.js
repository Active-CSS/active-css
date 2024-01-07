const _syncRestart = (o, resumeID, activeID) => {
	let restartAfterPause;

	if (activeID && pauseTrack[activeID] && pauseTrack[activeID][o._subEvCo]) {
		// Set up the SyncQueue object afresh. This is required if having multiple asynchronous pauses on the same event queue alongside delayed target selectors.
		syncQueue[o._subEvCo] = pauseTrack[activeID][o._subEvCo];
		// Clean-up.
		delete pauseTrack[activeID][o._subEvCo];
	}

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
