ActiveCSS._ifVisible = (o, tot, context) => {           // tot true is completely visible, false is partially visible. Used by extensions, hence global.
	let el, elContainer, aV;
	if (typeof aV === 'object') {          // Used by devtools highlighting.
		aV = o.actVal;
	} else {
		// The optional "scope" parameter determines which container holds the boundary information.
		// No "scope" parameter means that the document itself is the container.
		let aVRes = _extractBracketPars(o.actVal, [ 'scope' ], o);
		if (aVRes.scope) {
			// Get scope element.
			elContainer = _getSel(o, aVRes.scope);
		}
		aV = aVRes.action;
	}

	el = (aV._ACSSRepQuo().trim() == '') ? o.secSelObj : _getSel(o, aV);
	if (!el) return false;

	// Check in a container if one is found.
	let compObj;
	if (elContainer) {
		let rects = el.getClientRects();
		let rectsOuter = elContainer.getClientRects();
		compObj = {
			top: rects[0].top,
			right: rects[0].right,
			bottom: rects[0].bottom,
			left: rects[0].left,
			cTop: rectsOuter[0].top,
			cRight: rectsOuter[0].right,
			cBottom: rectsOuter[0].bottom,
			cLeft: rectsOuter[0].left,
		};

	} else {
		// Container not found. Use the document.
		let rect = el.getBoundingClientRect();
		compObj = {
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			left: rect.left,
			cTop: 0,
			cRight: window.innerWidth,
			cBottom: window.innerHeight,
			cLeft: 0,
		};
	}

	let res;
	if (context) {
		// This is an X or Y check.
		if (context == 'x') {
			if (tot) {
				res = compObj.left >= compObj.cLeft && compObj.right <= compObj.cRight;
			} else {
				res = compObj.left < compObj.cRight && compObj.right >= compObj.cLeft;
			}
		} else {
			if (tot) {
				res = compObj.top >= compObj.cTop && compObj.bottom <= compObj.cBottom;
			} else {
				res = compObj.top < compObj.cBottom && compObj.bottom >= compObj.cTop;
			}
		}
	} else {
		// This is a check on both axes.
		if (tot) {
			res = compObj.left >= compObj.cLeft &&
				compObj.right <= compObj.cRight &&
				compObj.top >= compObj.cTop &&
				compObj.bottom <= compObj.cBottom;
		} else {
			res = compObj.left < compObj.cRight &&
				compObj.right >= compObj.cLeft &&
				compObj.top < compObj.cBottom &&
				compObj.bottom >= compObj.cTop;
		}
	}
	return res;
};
