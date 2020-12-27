const _getPastFutureDate = str => {
	// Accepts a string representing a time frame in the past or future, like "3 months", "-3 months", "+3months", or "month" and returns it as a date.

	let more = 1, expires;
	// Remove the number from the string with the + or -, if it is indeed there.
	let timeFrameType = str.replace(/^([\+|\-]?[\d\.]+)/, function(_, innards) {
		more = innards * 1;	// This just converts the string to a number.
		return '';			// Strip the number out of the line if it was found.
	}).trim();				// Remove any remaining whitespace.
	// Now we have the number and the time frame type.

	// Remove any presence of "s" from the time frame and make it all lowercase so we have a simpler switch statement.
	timeFrameType = timeFrameType.replace(/s/g, '').toLowerCase().trim();
	let nowDate = new Date();
	switch (timeFrameType) {
		case 'year':
			expires = nowDate.setFullYear(nowDate.getFullYear() + more);
			break;
		case 'month':
			expires = nowDate.setMonth(nowDate.getMonth() + more);
			break;
		case 'day':
			expires = nowDate.setHours(nowDate.getHours() + (more * 24) );
			break;
		case 'hour':
			expires = nowDate.setHours(nowDate.getHours() + more);
			break;
		case 'minute':
			expires = nowDate.setHours(nowDate.getHours() + more);
			break;
		case 'econd':	// Second. We stripped off the "s" earlier.
			expires = nowDate.setSeconds(nowDate.getSeconds() + more);
			break;
		default:
			expires = null;
	}
	return (!expires) ? null : new Date(expires);
};
