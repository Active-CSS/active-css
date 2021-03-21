const _getPageFromList = hrf => {
	// Wildcard or straight href retrieval from pageList. This needs to be really fast as it can run on mouseovers.
	let pageItem, checkHrf;

	// This is still needed. It checks to see if there is an exact match first. This could possibly be further optimized.
	pageItem = pageList.find(item => item.url === hrf);

	if (!pageItem) {
		// Iterate wildcards regexes to find a match.
		let wildLen = pageWildcards.length, n, wild, mapArr;
		for (n = 0; n < wildLen; n++) {
			wild = pageWildcards[n];
			// Get the page to check, run it through the wildcard regex, and replace each wildcard match with *.
			// If the resultant string is totally empty, we have a match.
			mapArr = [];
			checkHrf = hrf;
			checkHrf = checkHrf.replace(wild.regex, function(_, innards) {	// jshint ignore:line
				// This the wildcard inner * match. Push the replacement for * into variables so they can substituted into {$1}, {$2}, etc. right after this.
				mapArr.push(innards);
				return '';
			});
			if (checkHrf !== '') continue;	// wasn't a match - check the next one.

			// And as if by magic, we now have an array of variables we can replace in the attributes.
			// Replace any variables mentioned in the attrs string from @pages.
			let targetAttrs = wild.attrs, mapArrLen = mapArr.length, varMatch, i;
			for (i = 0; i < mapArrLen; i++) {
				if (typeof pageWildReg[i] === 'undefined') {
					// For speed, only create the var match regex when it is needed. We don't know how many we might need, but no point it twice.
					pageWildReg[i] = new RegExp('\\{\\$' + (i + 1) + '\\}', 'g');
				}
				targetAttrs = targetAttrs.replace(pageWildReg[i], mapArr[i]);
			}
			pageItem = { url: hrf, attrs: targetAttrs };
			break;
		}
	}

	return pageItem;
};
