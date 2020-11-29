const _getObj = (str) => {
	let targArr = _splitIframeEls(str);
	if (!targArr) return false;	// invalid target.
	try {
		let obj = targArr[0].querySelector(targArr[1]);
		return obj;
	} catch(err) {
		return false;
	}
};
