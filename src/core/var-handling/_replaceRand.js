const _replaceRand = str => {
	if (str.indexOf('{$RAND') !== -1) {
		str = str.replace(/\{\$RAND((HEX)?(STR)?([\d]+)?(\-)?([\d]+)?)?\}/gm, function(_, __, isHex, isStr, num, hyph, endNum) {
			if (num) num = parseInt(num);
			if (endNum) endNum = parseInt(endNum);
			return hyph ? (Math.floor(Math.random() * (endNum - num + 1)) + num) : _random( ((num) ? num : 8) , (isStr ? true : false) , (isHex ? true : false) );
		});
	}
	return str;
};
