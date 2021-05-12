const _getAttrOrProp = (el, attr, getProp, ind=null, func='') => {
	let ret, isRender = func.startsWith('Render');

	if (!getProp) {
		// Check for attribute.
		ret = (ind) ? el.options[ind].getAttribute(attr) : el.getAttribute(attr);
		if (ret) return ret;
		// Check for property next as fallback.
	}
	// Check for property.
	ret = (ind) ? el.options[ind][attr] : el[attr];
	if (ret || typeof ret == 'string') {
		let newRet = ret.replace(/\\/gm, '\\\\');
		return (isRender) ? _escapeItem(newRet) : newRet;	// properties get escaped as if they are from attributes.
	}
	return '';
};
