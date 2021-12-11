const _checkBoundaries = (el, cont, tot) => {
	// Returns true if the boundaries checks pass.
	let left = _absLeft(el),
		right = left + el.offsetWidth,
		top = _absTop(el),
		bottom = top + el.offsetHeight;
	let cleft = _absLeft(cont),
		cright = cleft + cont.offsetWidth,
		ctop = _absTop(cont),
		cbottom = ctop + cont.offsetHeight;

// Working code for counting all 4 corners. For now, we are just interested in supporting vertical.
// More parameters need to be added - horizontal, vertical and both, with a default of vertical if no parameters added.
//	if (tot) {
//		return (left >= cleft && top >= ctop && right <= cright && bottom <= cbottom);
//	} else {
//		return (left >= cleft || right <= cright) && (top >= ctop || bottom <= cbottom);
//	}

	if (tot) {
		return top >= ctop && bottom <= cbottom;
	} else {
		return top >= ctop || bottom <= cbottom;
	}
};
