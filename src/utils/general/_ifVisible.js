ActiveCSS._ifVisible = (o, tot) => {	// tot true is completely visible, false is partially visible. Used by extensions.
	let el = (typeof o.actVal === 'object') ? o.actVal : (o.actVal._ACSSRepQuo().trim() == '') ? o.secSelObj : _getSel(o, o.actVal);	// Used by devtools highlighting.
	if (!el || overflows(el, el.parentElement)) {
		return false;
	} else {
		let rect = el.getBoundingClientRect();
		let elTop = rect.top;
		let elBot = rect.bottom;
		return (tot) ? (elTop >= 0) && (elBot <= window.innerHeight) : elTop < window.innerHeight && elBot >= 0;
	}
};

// Position of left edge relative to frame left courtesy of http://www.quirksmode.org/js/findpos.html
const _absleft = el => {
	var x = 0;
	for (; el; el = el.offsetParent) {
		x += el.offsetLeft;
	}
	return x;
};

// Position of top edge relative to top of frame.
const _abstop = el => {
	var y = 0;
	for (; el; el = el.offsetParent) {
		y += el.offsetTop;
	}
	return y;
};

// True if el's bounding rectangle includes a non-zero area the container's bounding rectangle.
const overflows = (el, opt_container) => {
	var cont = opt_container || el.offsetParent;
	var left = _absleft(el),
		right = left + el.offsetWidth,
		top = _abstop(el),
		bottom = top + el.offsetHeight;
	var cleft = _absleft(cont),
		cright = cleft + cont.offsetWidth,
		ctop = _abstop(cont),
		cbottom = ctop + cont.offsetHeight;
	return left < cleft || top < ctop || right > cright || bottom > cbottom;
};
