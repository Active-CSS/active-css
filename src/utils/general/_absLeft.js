const _absLeft = el => {
	// Position of left edge relative to frame left courtesy of http://www.quirksmode.org/js/findpos.html
	var x = 0;
	for (; el; el = el.offsetParent) {
		x += el.offsetLeft;
	}
	return x;
};
