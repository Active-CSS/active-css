const _checkBoundaries = (el, cont, tot) => {
	// Returns true if the boundaries checks pass.
	let left = _absLeft(el),
		right = left + el.offsetWidth,
		top = _absTop(el),
		bottom = top + el.offsetHeight,
		cLeft = _absLeft(cont),
		cRight = cLeft + cont.offsetWidth,
		cTop = _absTop(cont),
		cBottom = cTop + cont.offsetHeight;

	return {
		top,
		right,
		bottom,
		left,
		cTop,
		cRight,
		cBottom,
		cLeft,
	};
};
