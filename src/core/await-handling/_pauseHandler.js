const _pauseHandler = (o) => {
	if (o.actVal.indexOf('every') !== -1 || o.actVal.indexOf('after') !== -1 || o.actVal.indexOf('await') !== -1) {
		_warn('Delay options ("after", "every", "await") are not allowed in the ' + o.actName + ' command, skipping', o);
		_nextFunc(o);
		return;
	} else {
		let convTime = _convertToMS(o.actVal, 'Invalid delay number format: ' + o.actVal);
		// This is a hack due to the way the event stack works. The first pause is completed on all target selectors in a set before they all finish.
		// This effectively multiplies the pause times by the number of elements in the target selector set.
		// Dividing by the number of elements in the target selector set gives us the valid time to pause for. It's cheeky and should probably be
		// worked out a different way, but it works.
		let newConvTime = (o._elsTotal) ? convTime / o._elsTotal : convTime;
		if (convTime) {
			_immediateStop(o);
			_pause(o, newConvTime);
		}
	}
};
