_a.Remove = o => {
	let targArr = _splitIframeEls(o.actVal);
	if (!targArr) return false;	// invalid target.
	targArr[0].querySelectorAll(targArr[1]).forEach(function (obj) {
		ActiveCSS._removeObj(obj);
	});
};
