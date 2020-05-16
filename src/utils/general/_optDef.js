const _optDef = (arr, srch, opt, def) => {
	if (!Array.isArray(arr)) arr = arr.split(' ');	// For speed, send in an array already split. For ease, send in a string.
	let res = arr.findIndex(item => srch === item.toLowerCase());
	return (res !== -1) ? opt : def;	// return def if not present.
};
