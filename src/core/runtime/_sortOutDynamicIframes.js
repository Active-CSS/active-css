const _sortOutDynamicIframes = str => {
	// We want only outer iframes, and we want the inner contents that could contain iframes placed into a placeholder.
	// There can be more than one outer iframe, and also surrounding text bits scattered about around the iframes.
	// This routine sorts all that out. It should ignore standard iframe format (minus the scenario where iframes are not supported which this doesn't
	// currently handle).

	str = str.replace(/\r|\n/gm, '').replace(/\t/gm, ' ');

	// First of all, escape any opening and closing tags in quotes. We need the check the real tags only.
	str = str.replace(/"((?:\\.|[^"\\])*)"/gm, function(_, innards) {
		innards = innards.replace(/</gm, '_ACSS_lt').replace(/>/gm, '_ACSS_gt');
		return '"' + innards + '"';
	});

	let iframes = [], ref = 0, arr = str.split('<iframe'), endPos, concatStr = '', i = 0, arrLen = arr.length, mainTag, innards, innerCount = 0,
		accumInnards = '', outerTag = '', useOuterTag, closingChar, closingArr, closingArrLen, cl, openingChar;

	let foundContentInIframe = false;
	for (i; i < arrLen; i++) {
		if (arr[i].trim() == '') continue;
		endPos = arr[i].indexOf('</iframe>');

		if (innerCount == 0 && endPos !== -1) {
			if (i == 0) {
				concatStr += arr[0].substr(0, endPos);
			}
			// We're on the top level and we've found the correct outer closing tag
			closingChar = arr[i].indexOf('>');
			if (arr[i].substr(closingChar + 1, endPos - closingChar - 1).trim() == '') continue;	// This is an iframe with no content. Ignore completely.
			foundContentInIframe = true;
			concatStr += '<data-acss-iframe data-ref="' + ref + '"></data-acss-iframe>';
			if (outerTag != '') {
				useOuterTag = outerTag;
			} else {
				useOuterTag = arr[i].substr(0, closingChar + 1);
			}
			mainTag = '<iframe ' + useOuterTag;
			innards = accumInnards + arr[i].substr(closingChar + 1, endPos - closingChar - 1);
			useOuterTag = '';
			concatStr += arr[i].substr(endPos + 10);
			iframes[ref] = { mainTag: _replaceIframeEsc(mainTag), innards: _replaceIframeEsc(innards) };
			accumInnards = '';
			ref++;
		} else if (endPos !== -1) {
			// Found a closing tag. Is there only one?
			accumInnards += '<iframe ';
			closingArr = arr[i].split('</iframe>');
			closingArrLen = closingArr.length;
			cl = 0;
			for (cl; cl < closingArrLen; cl++) {
				if (closingArr[cl].trim() == '') {
					accumInnards += '</iframe>';
					continue;
				}
				if (innerCount == 0) {
					// We're now on the top level and we've found the correct outer closing tag
					closingChar = closingArr[cl].indexOf('>');
					openingChar = closingArr[cl].indexOf('<');
					if (arr[i].substr(closingChar + 1, endPos - closingChar - 1).trim() == '') continue;	// This is an iframe with no content. Ignore completely.
					foundContentInIframe = true;
					concatStr += '<data-acss-iframe data-ref="' + ref + '"></data-acss-iframe>';
					mainTag = '<iframe ' + outerTag;
					outerTag = '';
					if (openingChar < closingChar) {
						innards = accumInnards + closingArr[cl];
					} else {
						innards = accumInnards + closingArr[cl].substr(closingChar + 1);
					}
					iframes[ref] = { mainTag: _replaceIframeEsc(mainTag), innards: _replaceIframeEsc(innards) };
					accumInnards = '';
					ref++;
				} else {
					accumInnards += closingArr[cl];
					if (cl < closingArrLen - 1) {
						accumInnards += '</iframe>';
					}
				}
				innerCount--;
			}
			// Concat anything left after the last iframe. Put in test code for this.
			concatStr += accumInnards;
			accumInnards = '';
		} else {
			if (innerCount == 0 && i == 0) {
				concatStr += arr[0];
			} else {
				// There's another iframe inside so we just ignore it and wait to add it to a map when innerCount gets back to 0.
				closingChar = arr[i].indexOf('>');
				outerTag = arr[i].substr(0, closingChar + 1);
				accumInnards += arr[i].substr(closingChar + 1);
				innerCount++;
			}
		}
	}
	str = (foundContentInIframe) ? concatStr: str;

	// Put tag chars back.
	str = _replaceIframeEsc(str);

	return { str, iframes };
};
