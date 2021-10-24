const _convertToMS = (tim, errMess) => {
	if (tim == 'stack' || tim == '0') return 0;
	var match = /^(\d+)(s|ms)?$/i.exec(tim);
	if (!match) _err(errMess);
	var n = parseFloat(match[1]);
	var type = (match[2] || 'ms').toLowerCase();
	return (type == 's') ? n * 1000 : n;
};
