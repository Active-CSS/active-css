const _convertToMS = (tim, errMess) => {
	if (tim == 'stack') return 0;
	var match = /^(\d+)(ms|s)?$/i.exec(tim);
	if (!match) {
		console.log(errMess);
		return false;
	}
	var n = parseFloat(match[1]);
	var type = (match[2] || 'ms').toLowerCase();
	return (type == 's') ? n * 1000 : n;
};
