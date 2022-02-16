const _selCompare = (o, opt) => {
	// Takes two parameters. First a selector, and secondly something else to compare.
	let actVal = o.actVal._ACSSSpaceQuoIn();
	let spl, compareVal;
	if (opt == 'eM' || opt == 'eMT') {
		// There can be only one (parameter).
		if (!actVal) return true;	// No point going further - this could be a variable substitution that equates to empty.
		if (actVal && actVal == '__object') return false;	// No point going further - this is not empty - it is an array or a variable object.
		spl = actVal._ACSSSpaceQuoOut()._ACSSRepQuo();
	} else {
		// There are two parameters with this conditional.
		spl = actVal.split(' ');
		// If there isn't two parameters and it's allowed for the built-in conditional, add a "self" as the default.
		if (spl.length == 1 && _condDefSelf(o.actName)) spl.unshift('self');
		compareVal = spl.pop()._ACSSSpaceQuoOut()._ACSSRepQuo();
		spl = spl.join(' ');
	} 
	let el;
	el = _getSelector(o, spl);

	let widthHeightEl = false;
	if (['maW', 'miW', 'maH', 'miH'].indexOf(opt) !== -1) {
		widthHeightEl = true;
	}
	if (!el || !el.obj) {
		if (widthHeightEl) {
			// When referencing height or width we need an element. If it isn't there then return false.
			return false;
		}
		el = spl;
	} else {
		el = el.obj;
	}
	if (widthHeightEl) {
		compareVal = compareVal.replace('px', '');
		let styleVal, prop;
		switch (opt) {	// optimized for dynamic speed more than maintainability.
			case 'maW':
			case 'miW':
				prop = 'width';
				break;
			case 'maH':
			case 'miH':
				prop = 'height';
		}
		if (prop) {
			let s = el.style[prop];
			if (!s) {
				let rect = el.getBoundingClientRect();
				styleVal = (rect && rect[prop]) ? rect[prop] : 0;
			} else {
				styleVal = s.replace('px', '');
			}
		}
		switch (opt) {
			case 'maW':
			case 'maH':
				return (styleVal <= compareVal);
			case 'miW':
			case 'miH':
				return (styleVal >= compareVal);
		}
	}
	switch (opt) {
		case 'eM':
		case 'eMT':
		case 'maL':
		case 'miL':
			// _c.IfEmpty, _c.IfMaxLength, _c.IfMinLength
			let firstVal;
			if (el && !widthHeightEl && el.nodeType && el.nodeType == Node.ELEMENT_NODE) {
				let valWot = _getFieldValType(el);
				firstVal = el[valWot];
			} else {
				firstVal = el;
			}
			switch (opt) {
				case 'eM':
				case 'eMT':
					return (!firstVal || (opt == 'eMT') ? firstVal.trim() === '' : firstVal === '');
				case 'maL':
					return (firstVal.length <= compareVal);
				case 'miL':
					return (firstVal.length >= compareVal);
			}
			break;
		case 'iT':
			// _c.IfInnerText
			return (el && compareVal == el.innerText);
		case 'iH':
			// _cIfInnerHTML
			return (el && compareVal == el.innerHTML);
		case 'iV':
			// _cIfValue
			return (el && compareVal == el.value);
		case 'iC':
			// _cIfChecked
			return (el && el.checked);
	}
};
