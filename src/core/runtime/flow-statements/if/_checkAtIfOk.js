const _checkAtIfOk = oObj => {
	let ifRes = _handleLoop(oObj);
	// Returns true if it isn't an @if statement, or the boolean result of the @if statement.
	return (typeof ifRes === 'object') ? (ifRes.command == '@if' && ifRes.res) : true;
};
