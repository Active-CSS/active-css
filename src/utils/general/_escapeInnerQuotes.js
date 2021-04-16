const _escapeInnerQuotes = str => {
	// This sorts out any errant unentitied double-quotes than may be within other double-quotes in tags.
	const reg = /( [\u00BF-\u1FFF\u2C00-\uD7FF\w\-]+\=\")/;
	let newStr = str.replace(/(<\s*[\u00BF-\u1FFF\u2C00-\uD7FF\w\-]+[^>]*>)/gm, function(_, wot) {
		let arr = wot.split(reg), newStr = '', i, pos, numQuo;
		let arrLen = arr.length;

	    for (i = 0; i < arrLen; i++) {
	    	let checkSplitStr = arr[i].indexOf('="');
    		if (i > 0 && checkSplitStr !== -1 && arr[i - 1].slice(-1) != '"' && arr[i - 1].indexOf('<') === -1) {
				// Replace all quotes, as this item is in the middle of a quoted string.
				newStr += arr[i].replace(/"/gm, '&quot;');
			} else if (checkSplitStr !== -1 || arr[i].indexOf('"') === -1) {
				// This doesn\'t need anything doing to it. This needs to be after the last condition to work.
				newStr += arr[i];
			} else {
				// Replace all quotes.
				let tmpStr = arr[i].replace(/"/gm, '&quot;');
				// Put back the last one.
				pos = tmpStr.lastIndexOf('&quot;');
				newStr += tmpStr.substring(0, pos) + '"' + tmpStr.substring(pos + 6);
			}
		}

		return newStr;
	});

	return newStr;
};
