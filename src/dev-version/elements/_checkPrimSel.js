ActiveCSS._checkPrimSel = (activeEl, primSel, ev) => {
	// Work out if this element is relevant to the activeElement.
	// Does a queryselector on this element contain the active element. If so, it's ok for this element event view.
	if (primSel == 'window' || primSel == 'body') return true;
	let res = false;
	try {
		// Don't like using try/catch, but there isn't a one-line way of checking for a valid selector without getting a syntax error.
		document.querySelectorAll(primSel).forEach(function (obj, i) {
			if (obj.contains(activeEl)) {
				res = true;
				return false;	// break out now.
			}
		});
		return (!res) ? false : true;
	} catch(err) {
		console.log(primSel + ' is not a valid selector (2).');
		return false;
	}
};
