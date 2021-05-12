const _safeTags = str => {
	// Note the backslashes are for ensuring proper escaping happens when used in the regex.
	let mapObj = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'/': '&sol;',
		'{': '&#123;',
		'}': '&#125;',
		'"': '&quot;',
		'\'': '&#39;',
		'\\\\': '&#92;',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};
