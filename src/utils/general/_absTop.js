const _absTop = el => {
	// Position of top edge relative to top of frame courtesy of http://www.quirksmode.org/js/findpos.html
	var y = 0;
	for (; el; el = el.offsetParent) {
		y += el.offsetTop;
	}
	return y;
};
