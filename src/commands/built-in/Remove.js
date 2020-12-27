_a.Remove = o => {
	let thisObj = _getSel(o, o.actVal.trim(), true);
	if (thisObj !== false) {
		// This is self or a host element.
		ActiveCSS._removeObj(thisObj);
	} else {
		let targArr = _splitIframeEls(o.actVal, o);
		if (!targArr) return false;	// invalid target.
		targArr[0].querySelectorAll(targArr[1]).forEach(function (obj) {
			ActiveCSS._removeObj(obj);
		});
	}
};
