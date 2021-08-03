const _iteratePageList = (pages, removeState=false) => {
	// This is a cumulative action to what is there already, if anything, or a removal action.
	if (!('content' in document.createElement('template'))) {
		// Leave this as regular console.log, as this probably wouldn't handle correctly in the error handling anyway.
		console.log('Browser does not support html5. Cannot instantiate page navigation.');
		return;
	}

	var page, toRemove = [], toRemoveWild = [], isWild, obj, regex;
	Object.keys(pages).forEach(function(key) {
		page = pages[key].name;
		if (!page) return;
		page = page._ACSSRepAllQuo();	// remove any quotes as we're going to match the attribute value itself on finding later.

		// Check if this is a wildcard URL, as it goes into a different place for speed checking when working out realtime pagenav.
		let isWild = (page.indexOf('*') !== -1);

		if (removeState) {
			// Will be faster to run one filter at the end and just store the values to remove in an array here, rather than a filter for each iteration.
			if (isWild) {
				toRemoveWild.push(page);
			} else {
				toRemove.push(page);
			}
		} else {
			obj = { url: page, attrs: _unEscNoVars(_replaceRand(pages[key].value)) };
			if (isWild) {
				// This is the wildcard string converted into a regex for matching later. The latter regex is anything not a dot or a back/forward slash.
				regex = new RegExp(_escForRegex(page).replace(/\\\*/g, '((?!\\/|\\/|\\.).)*'), 'g');
				obj.regex = regex;
				pageWildcards.push(obj);
			} else {
				pageList.push(obj);
			}
		}
	});

	if (removeState) {
		if (isWild) {
			pageWildcards = pageWildcards.filter(item => toRemoveWild.indexOf(item.url) == -1);
		} else {
			pageList = pageList.filter(item => toRemove.indexOf(item.url) == -1);
		}
	}
};
