const _replaceRand = (str) => {
	if (str.indexOf('{$RAND') !== -1) {
		str = str.replace(/\{\$RAND((STR)?([\d]+)?(\-)?([\d]+)?)?\}/gm, function(_, __, isStr, num, hyph, endNum) {
			return hyph ? Math.floor(Math.random() * (endNum - num + 1) + num) : _random( ((num) ? num : 8) , (isStr ? true : false) );
		});
	}
	return str;
};
