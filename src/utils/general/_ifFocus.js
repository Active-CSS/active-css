const _ifFocus = (o, first=true) => {
	let arr = _getFocusedOfNodes(o.actVal, o);
	if (first) {
		return (arr[1] === 0) ? true : false;
	} else {
		return (arr[1] == arr[0].length - 1) ? true : false;
	}
};
