const _actValSelItem = o => {
	let arr = o.actVal.split(' ');
	let last = arr.splice(-1);
	return [ _getSel(o, arr.join(' ')), last[0] ];
};
