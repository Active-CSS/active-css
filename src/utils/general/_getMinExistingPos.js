const _getMinExistingPos = (str, arr) => {
	let minArr = [], pos;
	for (let n = 0; n < arr.length; n++) {
		pos = str.indexOf(arr[n]);
		if (pos !== -1) {
			minArr.push(pos);
		}
	}
	return minArr.length > 0 ? Math.min(...minArr) : -1;
};
