const _getAttrOrProp = (el, attr, getProp, ind=null, func='') => {
	let ret, isRender = func.startsWith('Render');
	if (!getProp) {
		// Check for attribute.
		let elToCheck = (ind) ? el.options[ind] : el;
		if (elToCheck.hasAttribute(attr)) {
			ret = elToCheck.getAttribute(attr);
		}
		if (typeof ret == 'string') return ret;
	} else {
		// Check for property.
		ret = (ind) ? el.options[ind][attr] : el[attr];
		if (typeof ret == 'string') {
			let newRet = ret.replace(/\\/gm, '\\\\');
			return (isRender) ? _escapeItem(newRet) : newRet;         // properties get escaped as if they are from attributes.
		}
	}
	return false;
};
