const _selCompare = (o, opt) => {
	// Takes two parameters. First a selector, and secondly something else to compare.
	let actVal = o.actVal._ACSSSpaceQuoIn();
	let spl, compareVal;
	if (opt == 'eM') {
		// There can be only one (parameter).
		if (!actVal) return true;	// No point going further - this could be a variable substitution that equates to empty.
		if (actVal && actVal == '__object') return false;	// No point going further - this is not empty - it is an array or a variable object.
		spl = actVal._ACSSSpaceQuoOut();
	} else {
		// There are two parameters with this conditional.
		spl = actVal.split(' ');
		compareVal = spl.pop()._ACSSSpaceQuoOut()._ACSSRepQuo();
		spl = spl.join(' ');
	} 
	let el;
	el = _getSel(o, spl);
	if (!el) {
		el = spl;
	}
	switch (opt) {
		case 'eM':
		case 'maL':
		case 'miL':
			// _c.IfEmpty, _c.IfMaxLength, _c.IfMinLength
			let firstVal;
			if (el && el.nodeType && el.nodeType == Node.ELEMENT_NODE) {
				let valWot = _getFieldValType(el);
				firstVal = el[valWot];
			} else {
				firstVal = el;
			}
			switch (opt) {
				case 'eM':
					return (!firstVal || firstVal === '') ? true : false;
				case 'maL':
					return (firstVal.length <= compareVal) ? true : false;
				case 'miL':
					return (firstVal.length >= compareVal) ? true : false;
			}
			break;
		case 'iT':
			// _c.IfInnerText
			return (el && compareVal == el.innerText) ? true : false;
		case 'iH':
			// _cIfInnerHTML
			return (el && compareVal == el.innerHTML) ? true : false;
	}
};
