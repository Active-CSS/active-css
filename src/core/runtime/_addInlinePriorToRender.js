const _addInlinePriorToRender = (str) => {
	// Unescape all single opening curlies for inline Active CSS and JavaScript prior to insertion into the DOM.
	str = str.replace(/_ACSS_later_brace_start/g, '{');

	// Now add config to the DOM.
	if (str.indexOf('<style ') !== -1 && str.indexOf('"text/acss"') !== -1) {
		// There's a good chance there is inline Active CSS to add to the config. Do that here.
		let fragRoot = document.createElement('div');
		fragRoot.innerHTML = str;
		let inlineConfigTags = fragRoot.querySelectorAll('style[type="text/acss"]');
		if (inlineConfigTags) _getInline(inlineConfigTags);
		str = fragRoot.innerHTML;	// needed to get all the IDs set up during this.
	}
	return str;
};
