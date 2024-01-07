const _pauseHandler = (o) => {
	if (o.actVal.indexOf('every') !== -1 || o.actVal.indexOf('after') !== -1 || o.actVal.indexOf('await') !== -1) {
		_warn('Delay options ("after", "every", "await") are not allowed in the ' + o.actName + ' command, skipping', o);
		_nextFunc(o);
		return;
	} else {
		let convTime = _convertToMS(o.actVal, 'Invalid delay number format: ' + o.actVal);
		// The first pause is completed on all target selectors in a set before they all finish.
		// This effectively multiplies the pause time by the number of elements in the target selector set.
		// Dividing by the number of elements in the target selector set gives us the valid time to pause for.
		let newConvTime = (o._elsTotal) ? convTime / o._elsTotal : convTime;
		if (convTime) {
			_immediateStop(o);
			_pause(o, newConvTime);
		}
	}
};
