const _getAttrOrProp = (el, attr, getProp, ind=null) => {
	let ret;
	if (!getProp) {
		// Check for attribute.
		ret = (ind) ? el.options[ind].getAttribute(attr) : el.getAttribute(attr);
		if (ret) return _escapeItem(ret);
		// Check for property next as fallback.
	}
	// Check for property.
	ret = (ind) ? el.options[ind][attr] : el[attr];
	if (ret || typeof ret == 'string') return _escapeItem(ret);
	return '';
};
