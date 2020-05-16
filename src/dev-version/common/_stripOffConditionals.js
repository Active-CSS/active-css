const _stripOffConditionals = sel => {
	let arr = sel.split(':');
	let condLen = arr.length;
	let i;
	let str = arr[0];
	for (i = 1; i < condLen; i++) {		// Start from the second one. A conditional should never be in the first item - that would be an error.
		if (arr[i].trim() === '') continue;
		str += (conditionals[arr[i]]) ? '' : ':' + arr[i];
	}
	return str;
};
