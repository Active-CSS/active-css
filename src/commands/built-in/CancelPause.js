_a.CancelPause = o => {
	if (o.actVal == 'all') {
		// Reset pause tracker. Setting this to empty will stop all pauses from resuming.
		pauseTrack = {};
	} else {
		_warn('cancel-pause currently only supports "all" as a parameter');
	}
};
