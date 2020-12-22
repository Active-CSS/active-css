const _unSafeTags = str => {
	let mapObj = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&sol;': '/',
		'&#123;': '{',
		'&#125;': '}',
	};
	return ActiveCSS._mapRegexReturn(mapObj, str);
};
