const _escapeItem = (str, func) => {
	if (['Render', 'RenderAfterBegin', 'RenderAfterEnd', 'RenderBeforeBegin', 'RenderBeforeEnd', 'SetAttribute'].indexOf(func) === -1) return str;
	// This is for putting content directly into html.
	let div = document.createElement('div');
	div.textContent = str.replace(/\{\=|\=\}/gm, '');
	// Remove possibility of JavaScript evaluation later on in a random place.
	return div.innerHTML;
};
