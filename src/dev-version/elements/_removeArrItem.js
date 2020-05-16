const _removeArrItem = (arr, item) => {
	let i;
	for (i = 0; i < arr.length; i++) {
		if (arr[i] === item) {
			arr.splice(i, 1);
			break;
		}
	}
	return arr;
};
