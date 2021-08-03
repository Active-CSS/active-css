const _getNumber = str => {
	let val = parseFloat(str);
	let num = str - val + 1;
	return (num >= 0) ? val : false;
};
