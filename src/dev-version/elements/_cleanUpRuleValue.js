const _cleanUpRuleValue = val => {
	let arr = val.split(',');
	let arrLen = arr.length, i;
	for (i = 0; i < arrLen; i++) {
		arr[i] = arr[i].trim();
	}
	return arr.join(', ');
};
