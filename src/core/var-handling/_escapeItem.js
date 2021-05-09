const _escapeItem = (str='', varName=null) => {
	// This is for putting content directly into html. It needs to be in string format and may not come in as such.
	if (varName && varName.substr(0, 1) == '$' && varName !== '$HTML_ESCAPED') return str;		// Don't escape html variables.
	let div = document.createElement('div');
	// Remove possibility of JavaScript evaluation later on in a random place.
	div.textContent = ('' + str).replace(/\{\=|\=\}/gm, '');
	return div.innerHTML;
};
