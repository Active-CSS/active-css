const _iteratePageList = (pages, removeState=false) => {
	// This is a cumulative action to what is there already, if anything, or a removal action.
	if (!('content' in document.createElement('template'))) {
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
			// Could use a filter for find url, but that won't be even vaguely optimum if there is more than one page to remove.
			// Better to find each one, make a list and then remove at the end.
			if (isWild) {
				toRemoveWild.push(pageWildcards.findIndex(item => item[url] === page));
			} else {
				toRemove.push(pageList.findIndex(item => item[url] === page));
			}
		}

		obj = (pages[key].value.trim() == 'none') ? { url: page, attrs: ''} : { url: page, attrs: _unEscNoVars(_replaceRand(pages[key].value)) };
		if (isWild) {
			// This is the wildcard string converted into a regex for matching later. The latter regex is anything not a dot or a back/forward slash.
			regex = new RegExp(_escForRegex(page).replace(/\\\*/g, '((?!\\/|\\/|\\.).)*'), 'g');
			obj.regex = regex;
			pageWildcards.push(obj);
		} else {
			pageList.push(obj);
		}
	});

	if (removeState) {
		// Now remove pages from a list.
		let toRemoveLen = toRemove.length, i = 0;
		for (i; i < toRemoveLen; i++) {
			pageList.splice(toRemove[i], 1);
		}
		let toRemoveWildLen = toRemoveWild.length;
		for (i = 0; i < toRemoveWildLen; i++) {
			pageWildcards.splice(toRemoveWild[i], 1);
		}
	}

};
