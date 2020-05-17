const _getObj = (str) => {
	let targArr = _splitIframeEls(str);
	if (!targArr) return false;	// invalid target.
	try {
		return targArr[0].querySelector(targArr[1]);
	} catch(err) {
		return false;
	}
};
