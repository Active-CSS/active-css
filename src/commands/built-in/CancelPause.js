_a.CancelPause = o => {
	if (o.actVal == 'all') {
		// Perform clean-up actions with timeouts.
		let activeID, val, subEvCo, val2;
		for ([activeID, val] of Object.entries(pauseTrack)) {
			for ([subEvCo, val2] of Object.entries(val)) {
				_cleanUpAfterPause(subEvCo);
			}
		}

		// Reset pause tracker. Setting this to empty will stop all pauses from resuming.
		pauseTrack = {};

	} else {
		_warn('cancel-pause currently only supports "all" as a parameter', o);
	}
};
