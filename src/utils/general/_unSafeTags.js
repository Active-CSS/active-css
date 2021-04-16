const _unSafeTags = str => {
	// _safeTags is the opposite function. Backslashes are further escaped from here to remain intact for use.
	let mapObj = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&sol;': '/',
		'&#123;': '{',
		'&#125;': '}',
		'&quot;': '"',
		'&#39;': '\'',
		'&#92;': '\\\\',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};
