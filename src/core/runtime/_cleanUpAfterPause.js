const _cleanUpAfterPause = subEvCo => {
	pauseCleanTimers[subEvCo] = setTimeout(() => {
		delete pauseCleanTimers[subEvCo];
		delete condTrack[subEvCo];
		delete elTrack[subEvCo];
	}, 5000);
};
