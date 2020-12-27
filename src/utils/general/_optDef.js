const _optDef = (arr, srch, opt, def) => {
	// This is a case insensitive comparison.
	if (!Array.isArray(arr)) arr = arr.split(' ');	// For speed send in an array that is already split, but this also accepts a string for a one-off use.
	srch = srch.toLowerCase();
	let res = arr.findIndex(item => srch === item.toLowerCase());
	return (res !== -1) ? opt : def;	// return def if not present.
};
