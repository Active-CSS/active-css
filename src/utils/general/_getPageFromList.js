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
			if (wild.regex.test(hrf)) {
				pageItem = { url: hrf, attrs: wild.attrs };
				break;
			}
		}
	}

	return pageItem;
};
