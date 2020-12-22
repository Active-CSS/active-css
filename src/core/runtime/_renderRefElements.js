const _renderRefElements = (str, htmlStr, refType) => {
	// Replace any reference to {$CHILDREN} or {$SELF} with the child nodes of the custom element.
	if (str.indexOf('{$' + refType + '}') !== -1) {
		// This needs to not count escaped references to this variable.
		let regex = (refType == 'CHILDREN') ? CHILDRENREGEX : SELFREGEX;
		str = str.replace(regex, htmlStr);
	}
	return str;
};
